"""
BQ Pipeline V2 — Adda247 YouTube Central Mind
==============================================
Fetches video-level daily analytics into video_analytics_daily_v2.

Changes from v1:
  - Target table: video_analytics_daily_v2
  - Adds duration (HH:MM:SS) from Data API
  - Shorts = duration <= 120 seconds (2 min)
  - uploaderType==self filter on Analytics API
  - Parallel channel processing (4 workers)
  - Only videos published within the fetch window are inserted

Menu:
  1. Full Backfill  → 90-day history for all channels (parallel, resumable)
  2. Daily          → nightly D-2 date only (parallel)
"""

import csv
import json
import re
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta, timezone, date as date_type
from pathlib import Path

from google.oauth2 import service_account
from google.cloud import bigquery
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

# ── Config ────────────────────────────────────────────────────────────────────
BQ_PROJECT       = "adda247-dev"
BQ_DATASET       = "yt_central_mind"
TABLE_V2         = f"{BQ_PROJECT}.{BQ_DATASET}.video_analytics_daily_v2"
CONTENT_OWNER_ID = "5SbL5Sc3tpzVgc5AdIpymQ"
WORKERS          = 6   # parallel channels (safe for API quota + M1 Pro)

BASE_DIR         = Path(__file__).parent
CSV_PATH         = BASE_DIR / "Channel_List_Updated.csv"
SA_PATH          = BASE_DIR / "servcie_account_adda247-dev.json"
TOKENS_PATH      = BASE_DIR / "tokens.json"
PROGRESS_V2      = BASE_DIR / "v2_progress.json"
FAILED_LOG       = BASE_DIR / "v2_failed.log"

# Thread-safe print lock
_print_lock = threading.Lock()


# ── Logging ───────────────────────────────────────────────────────────────────

def log(msg):
    with _print_lock:
        ts = datetime.now().strftime("%H:%M:%S")
        print(f"[{ts}] {msg}")

def log_section(title):
    with _print_lock:
        print(f"\n{'='*60}")
        print(f"  {title}")
        print(f"{'='*60}")


# ── Auth ──────────────────────────────────────────────────────────────────────

def get_bq_client():
    creds = service_account.Credentials.from_service_account_file(
        str(SA_PATH), scopes=["https://www.googleapis.com/auth/bigquery"]
    )
    return bigquery.Client(project=BQ_PROJECT, credentials=creds)


# Each worker gets its own YouTube clients (not thread-safe to share)
_token_lock = threading.Lock()

def get_youtube_clients():
    with _token_lock:
        raw = json.loads(TOKENS_PATH.read_text())
        creds = Credentials(
            token=raw.get("token") or raw.get("access_token"),
            refresh_token=raw.get("refresh_token"),
            token_uri=raw.get("token_uri", "https://oauth2.googleapis.com/token"),
            client_id=raw.get("client_id"),
            client_secret=raw.get("client_secret"),
            scopes=raw.get("scopes"),
        )
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            updated = raw.copy()
            updated["token"] = creds.token
            updated["access_token"] = creds.token
            TOKENS_PATH.write_text(json.dumps(updated, indent=2))
    yt_data      = build("youtube", "v3", credentials=creds)
    yt_analytics = build("youtubeAnalytics", "v2", credentials=creds)
    return yt_data, yt_analytics


# ── Channel list ──────────────────────────────────────────────────────────────

def load_channels():
    seen, channels = set(), []
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            cid  = row.get("channel_id", "").strip()
            name = (row.get("Latest Name v2") or row.get("Latest Name") or row.get("channel_name") or "").strip()
            dup  = row.get("Duplicate", "").strip()
            if cid and cid not in seen and dup != "YES" and dup != "INVALID":
                seen.add(cid)
                channels.append({"channel_id": cid, "channel_name": name})
    return channels


# ── Progress ──────────────────────────────────────────────────────────────────

_progress_lock = threading.Lock()

def load_progress():
    if PROGRESS_V2.exists():
        return set(json.loads(PROGRESS_V2.read_text()).get("done", []))
    return set()

def save_progress(done_set):
    with _progress_lock:
        PROGRESS_V2.write_text(json.dumps({"done": list(done_set)}, indent=2))


# ── Helpers ───────────────────────────────────────────────────────────────────

def parse_duration_seconds(duration_str):
    m = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration_str or "")
    if not m:
        return 0
    h, mn, s = (int(x) if x else 0 for x in m.groups())
    return h * 3600 + mn * 60 + s

def seconds_to_hhmmss(total_secs):
    h  = total_secs // 3600
    mn = (total_secs % 3600) // 60
    s  = total_secs % 60
    return f"{h:02d}:{mn:02d}:{s:02d}"

def classify_video_type(item, duration_secs):
    if item.get("liveStreamingDetails"):
        return "Live"
    if duration_secs <= 120:
        return "Shorts"
    return "Video"

def insert_rows(bq, table, rows):
    if not rows:
        return
    chunk_size = 500
    for i in range(0, len(rows), chunk_size):
        chunk = rows[i:i + chunk_size]
        errors = bq.insert_rows_json(table, chunk)
        if errors:
            raise RuntimeError(f"BQ insert errors: {errors[:2]}")


# ── Core API fetch ────────────────────────────────────────────────────────────

def fetch_single_day(yt_analytics, channel_id, date_str, page_token=None):
    """One Analytics API call for one day. Returns (rows, next_page_token)."""
    kwargs = dict(
        ids=f"contentOwner=={CONTENT_OWNER_ID}",
        startDate=date_str,
        endDate=date_str,
        dimensions="video",
        filters=f"channel=={channel_id}",
        metrics=(
            "views,estimatedMinutesWatched,averageViewDuration,"
            "averageViewPercentage,subscribersGained,subscribersLost,"
            "likes,comments,shares"
        ),
        sort="-views",
        maxResults=200,
    )
    if page_token:
        kwargs["pageToken"] = page_token
    resp = yt_analytics.reports().query(**kwargs).execute()
    return resp.get("rows", []), resp.get("nextPageToken")


def fetch_channel_analytics(yt_analytics, channel_id, start_date, end_date):
    """
    Fetch per-video per-day analytics for a channel over a date range.
    Returns dict: video_id -> [list of daily row dicts]
    """
    s = date_type.fromisoformat(start_date)
    e = date_type.fromisoformat(end_date)
    by_video   = {}
    total_rows = 0
    total_days = (e - s).days + 1
    current    = s

    while current <= e:
        date_str   = str(current)
        page_token = None

        while True:
            try:
                rows, page_token = fetch_single_day(yt_analytics, channel_id, date_str, page_token)
            except Exception as ex:
                log(f"  API error [{channel_id}] on {date_str}: {ex}")
                with open(FAILED_LOG, "a") as f:
                    f.write(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | channel={channel_id} | date={date_str} | {str(ex)[:120]}\n")
                break

            total_rows += len(rows)
            for row in rows:
                vid_id = row[0]
                gained = int(row[5])
                lost   = int(row[6])
                by_video.setdefault(vid_id, []).append({
                    "date":                  date_str,
                    "views":                 int(row[1]),
                    "watch_time_minutes":    float(row[2]),
                    "avg_view_duration_sec": int(row[3]),
                    "avg_view_percentage":   float(row[4]),
                    "subs_gained":           gained,
                    "subs_lost":             lost,
                    "net_subs":              gained - lost,
                    "likes":                 int(row[7]),
                    "comments":              int(row[8]),
                    "shares":                int(row[9]),
                })
            if not page_token:
                break

        current += timedelta(days=1)

    log(f"  [{channel_id}] {total_days} days → {total_rows} rows · {len(by_video)} videos")
    return by_video


def fetch_video_metadata(yt_data, video_ids):
    """
    Batch fetch metadata (50 per call).
    Returns dict: video_id -> {video_title, published_at, video_type, duration}
    """
    meta = {}
    for i in range(0, len(video_ids), 50):
        batch = video_ids[i:i + 50]
        try:
            resp = yt_data.videos().list(
                part="snippet,contentDetails,liveStreamingDetails",
                id=",".join(batch)
            ).execute()
            for v in resp.get("items", []):
                dur_secs = parse_duration_seconds(
                    v.get("contentDetails", {}).get("duration", "")
                )
                meta[v["id"]] = {
                    "video_title":  v["snippet"].get("title", ""),
                    "published_at": v["snippet"].get("publishedAt", ""),
                    "video_type":   classify_video_type(v, dur_secs),
                    "duration":     seconds_to_hhmmss(dur_secs),
                }
        except Exception as ex:
            log(f"  Metadata batch error: {ex}")
    return meta


def get_existing_video_dates_v2(bq, channel_id):
    """Return set of (video_id, date_str) already in v2 table for this channel."""
    query = f"""
        SELECT video_id, CAST(date AS STRING) AS date_str
        FROM `{TABLE_V2}`
        WHERE channel_id = @channel_id
    """
    cfg = bigquery.QueryJobConfig(query_parameters=[
        bigquery.ScalarQueryParameter("channel_id", "STRING", channel_id)
    ])
    return {(r.video_id, r.date_str) for r in bq.query(query, job_config=cfg).result()}


# ── Per-channel worker ────────────────────────────────────────────────────────

def process_channel(ch, start_date, end_date, done_ids, ingestion_ts):
    """
    Full pipeline for one channel: fetch → metadata → dedup → insert.
    Called in parallel by ThreadPoolExecutor.
    """
    cid   = ch["channel_id"]
    cname = ch["channel_name"]

    try:
        yt_data, yt_analytics = get_youtube_clients()
        bq = get_bq_client()

        # 1. Fetch analytics
        by_video = fetch_channel_analytics(yt_analytics, cid, start_date, end_date)
        if not by_video:
            log(f"  [{cname}] No data from API — skipping")
            done_ids.add(cid)
            save_progress(done_ids)
            return 0

        # 2. Fetch metadata
        meta = fetch_video_metadata(yt_data, list(by_video.keys()))

        # 3. Dedup against existing v2 rows
        existing = get_existing_video_dates_v2(bq, cid)

        # 4. Build rows — skip videos published before the 90-day window
        pub_cutoff = str(datetime.now(timezone.utc).date() - timedelta(days=90))
        rows_to_insert = []
        skipped = filtered_old = 0

        for vid_id, daily_rows in by_video.items():
            vid_meta = meta.get(vid_id, {
                "video_title": "", "published_at": "", "video_type": "Video", "duration": "00:00:00"
            })
            pub = vid_meta.get("published_at", "")
            if not pub or pub[:10] < pub_cutoff:
                filtered_old += 1
                continue

            for a in daily_rows:
                if (vid_id, a["date"]) in existing:
                    skipped += 1
                    continue
                rows_to_insert.append({
                    "channel_id":            cid,
                    "channel_name":          cname,
                    "video_id":              vid_id,
                    "video_title":           vid_meta["video_title"],
                    "published_at":          pub,
                    "video_type":            vid_meta["video_type"],
                    "duration":              vid_meta["duration"],
                    "date":                  a["date"],
                    "views":                 a["views"],
                    "watch_time_minutes":    a["watch_time_minutes"],
                    "avg_view_duration_sec": a["avg_view_duration_sec"],
                    "avg_view_percentage":   a["avg_view_percentage"],
                    "subs_gained":           a["subs_gained"],
                    "subs_lost":             a["subs_lost"],
                    "net_subs":              a["net_subs"],
                    "likes":                 a["likes"],
                    "comments":              a["comments"],
                    "shares":                a["shares"],
                    "views_to_subs_ratio":   round(a["net_subs"] / a["views"] * 100, 4) if a["views"] > 0 else 0.0,
                    "ingestion_ts":          ingestion_ts,
                })

        # 5. Insert
        insert_rows(bq, TABLE_V2, rows_to_insert)
        log(f"  ✓ [{cname}] inserted={len(rows_to_insert)} skipped={skipped} filtered_old={filtered_old}")
        done_ids.add(cid)
        save_progress(done_ids)
        return len(rows_to_insert)

    except Exception as ex:
        log(f"  ✗ [{cname}] ERROR: {ex}")
        return 0


# ── Pipeline runners ──────────────────────────────────────────────────────────

def run_backfill_v2():
    today      = datetime.utcnow().date()
    end_date   = str(today - timedelta(days=2))
    start_date = str(today - timedelta(days=90))
    log_section(f"V2 Full Backfill — {start_date} to {end_date}")

    all_channels  = load_channels()
    done_ids      = load_progress()
    remaining     = [ch for ch in all_channels if ch["channel_id"] not in done_ids]
    ingestion_ts  = datetime.now(timezone.utc).isoformat()

    log(f"Channels total    : {len(all_channels)}")
    log(f"Already done      : {len(done_ids)}")
    log(f"Remaining         : {len(remaining)}")
    log(f"Workers           : {WORKERS}")

    if not remaining:
        log("All channels already done!")
        return

    total_inserted = 0

    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        futures = {
            executor.submit(process_channel, ch, start_date, end_date, done_ids, ingestion_ts): ch
            for ch in remaining
        }
        for future in as_completed(futures):
            ch = futures[future]
            try:
                inserted = future.result()
                total_inserted += inserted
            except Exception as ex:
                log(f"  ✗ [{ch['channel_name']}] unhandled: {ex}")

    log_section(f"V2 Backfill complete — {total_inserted} total rows inserted")


def run_daily_v2():
    today      = datetime.utcnow().date()
    date_str   = str(today - timedelta(days=2))
    start_date = str(today - timedelta(days=90))  # filter: only recent videos
    log_section(f"V2 Daily — {date_str}")

    all_channels = load_channels()
    ingestion_ts = datetime.now(timezone.utc).isoformat()
    total_inserted = 0

    log(f"Channels : {len(all_channels)}")
    log(f"Workers  : {WORKERS}")

    # For daily, done_ids is empty — run all channels every night
    done_ids = set()

    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        futures = {
            executor.submit(process_channel, ch, date_str, date_str, done_ids, ingestion_ts): ch
            for ch in all_channels
        }
        for future in as_completed(futures):
            ch = futures[future]
            try:
                inserted = future.result()
                total_inserted += inserted
            except Exception as ex:
                log(f"  ✗ [{ch['channel_name']}] unhandled: {ex}")

    log_section(f"V2 Daily complete — {total_inserted} rows inserted")


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    log_section("Adda247 YouTube Central Mind — BQ Pipeline V2")
    print("\n  What do you want to run?")
    print("  1. Full Backfill     (90-day history, all channels, parallel, resumable)")
    print("  2. Daily             (D-2 date only, all channels, parallel)")
    print("  3. Test Single Channel (one channel, full 90-day)")
    print("\n  Enter 1 / 2 / 3: ", end="")
    choice = input().strip()

    if choice == "1":
        run_backfill_v2()
    elif choice == "2":
        run_daily_v2()
    elif choice == "3":
        all_ch = load_channels()
        print("\n  Available channels:")
        for i, ch in enumerate(all_ch, 1):
            print(f"  {i:3}. {ch['channel_name']} ({ch['channel_id']})")
        print("\n  Enter channel number: ", end="")
        idx = int(input().strip()) - 1
        ch = all_ch[idx]
        today      = datetime.utcnow().date()
        end_date   = str(today - timedelta(days=2))
        start_date = str(today - timedelta(days=90))
        log_section(f"Test — {ch['channel_name']} — {start_date} to {end_date}")
        ingestion_ts = datetime.now(timezone.utc).isoformat()
        inserted = process_channel(ch, start_date, end_date, set(), ingestion_ts)
        log(f"Test complete — {inserted} rows inserted")
    else:
        print("Invalid choice.")
