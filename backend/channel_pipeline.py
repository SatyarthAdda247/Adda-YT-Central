"""
Channel Pipeline — Adda247 YouTube Central Mind
================================================
Fetches channel-level analytics into two tables:
  - channel_analytics_daily      : D-2 accurate data (Analytics API)
  - channel_nearrealtime_snapshot: Current stats (Data API v3, ~minutes lag)

Menu:
  1. Full Backfill D-2   → Jan 1 2025 → today-2, all channels (parallel)
  2. Daily D-2           → yesterday-2 only (parallel)
  3. Realtime Snapshot   → current stats right now (parallel, run every 4hrs)
"""

import csv
import json
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta, timezone
from pathlib import Path

from google.oauth2 import service_account
from google.cloud import bigquery
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

# ── Config ────────────────────────────────────────────────────────────────────
BQ_PROJECT       = "adda247-dev"
BQ_DATASET       = "yt_central_mind"
TABLE_DAILY      = f"{BQ_PROJECT}.{BQ_DATASET}.channel_analytics_daily"
TABLE_REALTIME   = f"{BQ_PROJECT}.{BQ_DATASET}.channel_nearrealtime_snapshot"
CONTENT_OWNER_ID = "5SbL5Sc3tpzVgc5AdIpymQ"
WORKERS          = 6

BASE_DIR         = Path(__file__).parent
CSV_PATH         = BASE_DIR / "Yt Central Mind - Channel List final.csv"
SA_PATH          = BASE_DIR / "servcie_account_adda247-dev.json"
TOKENS_PATH      = BASE_DIR / "tokens.json"

_print_lock = threading.Lock()
_token_lock = threading.Lock()


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
    import os
    sa_json = os.environ.get("GCP_SA_JSON") or os.environ.get("service_account_adda247_dev_json")
    if sa_json:
        info = json.loads(sa_json)
        creds = service_account.Credentials.from_service_account_info(
            info, scopes=["https://www.googleapis.com/auth/bigquery"]
        )
    else:
        creds = service_account.Credentials.from_service_account_file(
            str(SA_PATH), scopes=["https://www.googleapis.com/auth/bigquery"]
        )
    return bigquery.Client(project=BQ_PROJECT, credentials=creds)


def get_youtube_clients():
    """Returns (yt_data, yt_analytics) — each worker calls this independently."""
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
    yt_data      = build("youtube",          "v3", credentials=creds)
    yt_analytics = build("youtubeAnalytics", "v2", credentials=creds)
    return yt_data, yt_analytics


# ── Channel list ──────────────────────────────────────────────────────────────

def load_channels():
    seen, channels = set(), []
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            cid  = row.get("channel_id", "").strip()
            name = (
                row.get("Latest Name v2")
                or row.get("Latest Name")
                or row.get("channel_name")
                or ""
            ).strip()
            dup = row.get("Duplicate", "").strip()
            if cid and cid not in seen and dup not in ("YES", "INVALID"):
                seen.add(cid)
                channels.append({"channel_id": cid, "channel_name": name})
    return channels


# ── D-2 Analytics fetch (per channel, full date range) ───────────────────────

ANALYTICS_METRICS = ",".join([
    "views",
    "estimatedMinutesWatched",
    "averageViewDuration",
    "averageViewPercentage",
    "likes",
    "comments",
    "shares",
    "subscribersGained",
    "subscribersLost",
    # impressions/impressionClickThroughRate are NOT available in contentOwner mode
])

def fetch_channel_analytics(yt_analytics, channel_id, start_date, end_date):
    """
    Returns list of dicts, one per date.
    Single API call covers entire date range — no top-N limit at channel level.
    """
    try:
        resp = yt_analytics.reports().query(
            ids=f"contentOwner=={CONTENT_OWNER_ID}",
            startDate=start_date,
            endDate=end_date,
            dimensions="day",
            metrics=ANALYTICS_METRICS,
            filters=f"channel=={channel_id}",
            maxResults=400,
        ).execute()
    except Exception as e:
        log(f"  ✗ Analytics API error for {channel_id}: {e}")
        return []

    headers = [h["name"] for h in resp.get("columnHeaders", [])]
    rows    = resp.get("rows", [])
    if not rows:
        return []

    results = []
    for row in rows:
        r = dict(zip(headers, row))
        date_val = r.get("day") or r.get("date")
        if not date_val:
            continue  # skip rows with no date
        results.append({
            "date":                       date_val,
            "channel_id":                 channel_id,
            # channel name filled in by caller
            "views":                      int(r.get("views", 0) or 0),
            "estimated_minutes_watched":  int(r.get("estimatedMinutesWatched", 0) or 0),
            "average_view_duration":      float(r.get("averageViewDuration", 0) or 0),
            "average_view_percentage":    float(r.get("averageViewPercentage", 0) or 0),
            "likes":                      int(r.get("likes", 0) or 0),
            "comments":                   int(r.get("comments", 0) or 0),
            "shares":                     int(r.get("shares", 0) or 0),
            "subscribers_gained":         int(r.get("subscribersGained", 0) or 0),
            "subscribers_lost":           int(r.get("subscribersLost", 0) or 0),
            "impressions":                None,   # not available in contentOwner mode
            "impression_ctr":             None,
        })
    return results


def get_existing_dates(bq, channel_id):
    """Dates already in BQ for this channel — skip re-inserting."""
    query = f"""
        SELECT DISTINCT date
        FROM `{TABLE_DAILY}`
        WHERE channel_id = @cid
    """
    job = bq.query(query, job_config=bigquery.QueryJobConfig(
        query_parameters=[bigquery.ScalarQueryParameter("cid", "STRING", channel_id)]
    ))
    return {str(row.date) for row in job.result()}


def insert_daily_rows(bq, rows):
    if not rows:
        return 0
    errors = bq.insert_rows_json(TABLE_DAILY, rows)
    if errors:
        log(f"  BQ insert errors: {errors[:3]}")
    return len(rows)


# ── Worker: D-2 per channel ───────────────────────────────────────────────────

def process_channel_daily(ch, start_date, end_date, idx, total):
    cid  = ch["channel_id"]
    name = ch["channel_name"]
    log(f"[{idx}/{total}] {name} ({cid}) — fetching {start_date} → {end_date}")

    try:
        bq              = get_bq_client()
        _, yt_analytics = get_youtube_clients()

        existing = get_existing_dates(bq, cid)

        rows = fetch_channel_analytics(yt_analytics, cid, start_date, end_date)
        if not rows:
            log(f"[{idx}/{total}] {name} — no data returned")
            return 0

        # Filter already-inserted dates
        new_rows = [r for r in rows if str(r["date"]) not in existing]
        for r in new_rows:
            r["channel_name"] = name

        inserted = insert_daily_rows(bq, new_rows)
        log(f"[{idx}/{total}] {name} — {len(rows)} dates from API, {len(existing)} existing, {inserted} inserted")
        return inserted

    except Exception as e:
        log(f"[{idx}/{total}] {name} — ERROR: {e}")
        return 0


# ── Realtime snapshot (Data API v3) ──────────────────────────────────────────

def fetch_realtime_snapshot(yt_data, channel_id):
    """Returns dict with current channel stats."""
    try:
        resp = yt_data.channels().list(
            part="statistics",
            id=channel_id,
        ).execute()
        items = resp.get("items", [])
        if not items:
            return None
        stats = items[0].get("statistics", {})
        return {
            "subscribers": int(stats.get("subscriberCount", 0) or 0),
            "total_views": int(stats.get("viewCount", 0) or 0),
            "total_videos": int(stats.get("videoCount", 0) or 0),
        }
    except Exception as e:
        log(f"  ✗ Data API error for {channel_id}: {e}")
        return None


def process_channel_realtime(ch, fetched_at, fetched_date, idx, total):
    cid  = ch["channel_id"]
    name = ch["channel_name"]
    log(f"[{idx}/{total}] {name} ({cid}) — realtime snapshot")

    try:
        bq       = get_bq_client()
        yt_data, _ = get_youtube_clients()

        stats = fetch_realtime_snapshot(yt_data, cid)
        if not stats:
            log(f"[{idx}/{total}] {name} — no data")
            return 0

        row = {
            "fetched_at":   fetched_at,
            "fetched_date": fetched_date,
            "channel_id":   cid,
            "channel_name": name,
            **stats,
        }
        errors = bq.insert_rows_json(TABLE_REALTIME, [row])
        if errors:
            log(f"[{idx}/{total}] {name} — BQ error: {errors}")
            return 0
        log(f"[{idx}/{total}] {name} — subs={stats['subscribers']:,} views={stats['total_views']:,}")
        return 1

    except Exception as e:
        log(f"[{idx}/{total}] {name} — ERROR: {e}")
        return 0


# ── Runner helpers ────────────────────────────────────────────────────────────

def run_daily_parallel(channels, start_date, end_date):
    total     = len(channels)
    inserted  = 0
    log_section(f"Channel Analytics D-2  |  {start_date} → {end_date}  |  {total} channels  |  {WORKERS} workers")

    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = {
            pool.submit(process_channel_daily, ch, start_date, end_date, idx + 1, total): ch
            for idx, ch in enumerate(channels)
        }
        for fut in as_completed(futures):
            inserted += fut.result() or 0

    log_section(f"Done — total rows inserted: {inserted}")


def run_realtime_parallel(channels):
    now          = datetime.now(timezone.utc)
    fetched_at   = now.strftime("%Y-%m-%d %H:%M:%S UTC")
    fetched_date = now.strftime("%Y-%m-%d")
    total        = len(channels)
    inserted     = 0
    log_section(f"Realtime Snapshot  |  {fetched_at}  |  {total} channels  |  {WORKERS} workers")

    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = {
            pool.submit(process_channel_realtime, ch, fetched_at, fetched_date, idx + 1, total): ch
            for idx, ch in enumerate(channels)
        }
        for fut in as_completed(futures):
            inserted += fut.result() or 0

    log_section(f"Done — {inserted}/{total} channels snapshotted")


# ── Menu ──────────────────────────────────────────────────────────────────────

def get_last_fetched_date():
    """Returns the MAX(date) across all channels in channel_analytics_daily."""
    try:
        bq = get_bq_client()
        rows = list(bq.query(f"SELECT MAX(date) as last_date FROM `{TABLE_DAILY}`").result())
        if rows and rows[0].last_date:
            return rows[0].last_date  # returns datetime.date
    except Exception as e:
        log(f"Could not query last date: {e}")
    return None


def main():
    print("\n╔══════════════════════════════════════════╗")
    print("║   Channel Pipeline — YT Central Mind     ║")
    print("╠══════════════════════════════════════════╣")
    print("║  1. Full Backfill D-2  (Jan 7 2026 → today-2) ║")
    print("║  2. Daily D-2          (yesterday-2 only)      ║")
    print("║  3. Realtime Snapshot  (run now)               ║")
    print("║  4. Smart Catchup      (last BQ date → today-2)║")
    print("╚══════════════════════════════════════════╝")
    choice = input("\nEnter option: ").strip()

    channels = load_channels()
    log(f"Loaded {len(channels)} channels from CSV")

    today = datetime.now(timezone.utc).date()
    d2    = today - timedelta(days=2)

    if choice == "1":
        start = "2026-01-07"
        end   = d2.strftime("%Y-%m-%d")
        run_daily_parallel(channels, start, end)

    elif choice == "2":
        day = d2.strftime("%Y-%m-%d")
        run_daily_parallel(channels, day, day)

    elif choice == "3":
        run_realtime_parallel(channels)

    elif choice == "4":
        last = get_last_fetched_date()
        if not last:
            log("No existing data found — run Full Backfill (option 1) first.")
            return
        from datetime import date as date_type
        next_day = last + timedelta(days=1)
        if next_day > d2:
            log(f"Already up to date — last date in BQ: {last}, D-2: {d2}. Nothing to fetch.")
            return
        start = next_day.strftime("%Y-%m-%d")
        end   = d2.strftime("%Y-%m-%d")
        log(f"Smart Catchup: {start} → {end} ({(d2 - next_day).days + 1} days missing)")
        run_daily_parallel(channels, start, end)

    else:
        print("Invalid option.")


if __name__ == "__main__":
    main()
