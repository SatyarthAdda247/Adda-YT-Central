import time
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, HTTPException
from googleapiclient.discovery import build
from google.oauth2 import service_account
from google.cloud import bigquery

BQ_PROJECT    = "adda247-dev"
BQ_DATASET    = "yt_central_mind"
TABLE_CHANNEL = f"{BQ_PROJECT}.{BQ_DATASET}.channel_daily_snapshot"
TABLE_VIDEO   = f"{BQ_PROJECT}.{BQ_DATASET}.video_analytics_daily_v2"
SA_PATH       = Path(__file__).parent / "servcie_account_adda247-dev.json"

def get_bq_client():
    creds = service_account.Credentials.from_service_account_file(
        str(SA_PATH), scopes=["https://www.googleapis.com/auth/bigquery"]
    )
    return bigquery.Client(project=BQ_PROJECT, credentials=creds)

# ============================================================
# In-Memory Cache — TTL-based, no external dependency
# ============================================================
_cache = {}

def get_cached(key, ttl_seconds, fetch_fn):
    """Return cached data if fresh, otherwise call fetch_fn and cache result."""
    now = time.time()
    if key in _cache and (now - _cache[key]["time"]) < ttl_seconds:
        print(f"⚡ Cache HIT: {key}")
        return _cache[key]["data"]
    print(f"🔄 Cache MISS: {key} — fetching from API")
    data = fetch_fn()
    _cache[key] = {"data": data, "time": now}
    return data

CACHE_TTL_CHANNEL   = 3600  # 1 hour — matches hourly cron on channel_daily_snapshot
CACHE_TTL_BQ_VIDEOS = 7200  # 2 hours — nightly pipeline, no need to refresh more often


from auth_service import get_credentials

youtube_router = APIRouter(prefix="/yt", tags=["YouTube API"])


@youtube_router.get("/channel/{channel_id}")
def get_channel_profile(channel_id: str):
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authorized.")

    def fetch():
        # ── Identity: still from YouTube Data API (name, thumbnail, bio — metadata only) ──
        youtube = build("youtube", "v3", credentials=creds)
        response = youtube.channels().list(
            part="snippet",
            id=channel_id,
        ).execute()

        if not response.get("items"):
            raise HTTPException(status_code=404, detail=f"Channel {channel_id} not found")

        snip = response["items"][0]["snippet"]

        # ── Stats: from BQ channel_daily_snapshot (latest row for this channel) ──
        bq_stats = {"subscribers_actual": 0, "subscribers_rounded": 0, "total_views": 0, "total_videos": 0}
        try:
            bq = get_bq_client()
            query = f"""
                SELECT subscribers, total_views, total_videos
                FROM `{TABLE_CHANNEL}`
                WHERE channel_id = @channel_id
                ORDER BY fetched_at DESC
                LIMIT 1
            """
            job_config = bigquery.QueryJobConfig(
                query_parameters=[bigquery.ScalarQueryParameter("channel_id", "STRING", channel_id)]
            )
            rows = list(bq.query(query, job_config=job_config).result())
            if rows:
                import math
                subs = rows[0].subscribers or 0
                subs_rounded = subs
                if subs >= 100:
                    precision = 3
                    factor = 10 ** (int(math.log10(subs)) - (precision - 1))
                    subs_rounded = math.floor(subs / factor) * factor
                bq_stats = {
                    "subscribers_actual": subs,
                    "subscribers_rounded": subs_rounded,
                    "total_views": rows[0].total_views or 0,
                    "total_videos": rows[0].total_videos or 0,
                }
        except Exception:
            pass  # BQ unavailable — stats will show as 0

        return {
            "identity": {
                "name": snip.get("title"),
                "id": channel_id,
                "custom_url": snip.get("customUrl", ""),
                "thumbnail_url": snip.get("thumbnails", {}).get("high", {}).get("url", ""),
                "created_at": snip.get("publishedAt"),
                "country": snip.get("country"),
                "description": snip.get("description"),
            },
            "stats": bq_stats,
            "source": "identity=youtube_api · stats=bigquery",
        }

    return get_cached(f"channel:{channel_id}", CACHE_TTL_CHANNEL, fetch)



@youtube_router.get("/channel-stats")
def get_channel_stats():
    """
    Returns latest snapshot for every channel from BQ channel_daily_snapshot.
    Frontend uses this to populate the Channel Explorer tab and Business Dashboard.
    """
    try:
        bq = get_bq_client()
        # Get the most recent row per channel_id
        query = f"""
            SELECT channel_id, channel_name, subscribers, total_views, total_videos, fetched_at
            FROM (
                SELECT *, ROW_NUMBER() OVER (PARTITION BY channel_id ORDER BY fetched_at DESC) AS rn
                FROM `{TABLE_CHANNEL}`
            )
            WHERE rn = 1
            ORDER BY subscribers DESC
        """
        rows = list(bq.query(query).result())
        return {
            "channels": [
                {
                    "channel_id":   row.channel_id,
                    "channel_name": row.channel_name,
                    "subscribers":  row.subscribers,
                    "total_views":  row.total_views,
                    "total_videos": row.total_videos,
                    "fetched_at":   row.fetched_at.isoformat() if row.fetched_at else None,
                }
                for row in rows
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"BQ query failed: {str(e)}")


@youtube_router.get("/bq-videos/{channel_id}")
def get_bq_videos(channel_id: str):
    """
    Returns lifetime aggregated video stats for a channel from BQ video_analytics_daily.
    One row per video, metrics summed over all available data.
    Cached for 2 hours — data only updates once per night via pipeline.
    """
    def fetch():
        bq = get_bq_client()
        query = f"""
            SELECT
                video_id,
                video_title,
                video_type,
                published_at,
                MAX(duration)                           AS duration,
                SUM(views)                              AS views,
                ROUND(SUM(watch_time_minutes) / 60, 2)  AS watch_time_hrs,
                CAST(AVG(avg_view_duration_sec) AS INT64) AS avd,
                SUM(subs_gained)                        AS subs_gained,
                SUM(subs_lost)                          AS subs_lost,
                SUM(net_subs)                           AS net_subs,
                SUM(likes)                              AS likes,
                SUM(comments)                           AS comments,
                SUM(shares)                             AS shares
            FROM `{TABLE_VIDEO}`
            WHERE channel_id = @channel_id
            GROUP BY video_id, video_title, video_type, published_at
            ORDER BY views DESC
        """
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("channel_id", "STRING", channel_id),
            ]
        )
        rows = list(bq.query(query, job_config=job_config).result())
        return {
            "channel_id": channel_id,
            "videos": [
                {
                    "id":            row.video_id,
                    "title":         row.video_title,
                    "videoType":     row.video_type,
                    "publishedAt":   row.published_at.isoformat() if row.published_at else None,
                    "duration":      row.duration or None,
                    "views":         row.views or 0,
                    "watchTimeHrs":  float(row.watch_time_hrs or 0),
                    "avd":           row.avd or 0,
                    "subsGained":    row.subs_gained or 0,
                    "subsLost":      row.subs_lost or 0,
                    "netSubs":       row.net_subs or 0,
                    "likes":         row.likes or 0,
                    "comments":      row.comments or 0,
                    "shares":        row.shares or 0,
                    "convRatio":     round(((row.net_subs or 0) / row.views) * 100, 2) if (row.views or 0) > 0 else 0,
                }
                for row in rows
            ]
        }

    return get_cached(f"bq-videos:{channel_id}", CACHE_TTL_BQ_VIDEOS, fetch)


@youtube_router.get("/bq-video-daily/{video_id}")
def get_bq_video_daily(video_id: str, channel_id: str, start: str, end: str):
    """
    Returns raw daily rows for a single video between start and end dates.
    Used for the inline video drill-down chart and daily breakdown table.
    Cached 2hrs per unique video+date range combination.
    """
    def fetch():
        bq = get_bq_client()
        query = f"""
            SELECT
                date,
                views,
                ROUND(watch_time_minutes / 60, 2)  AS watch_time_hrs,
                avg_view_duration_sec               AS avd,
                avg_view_percentage                 AS avg_view_pct,
                subs_gained,
                subs_lost,
                net_subs,
                likes,
                comments,
                shares
            FROM `{TABLE_VIDEO}`
            WHERE video_id  = @video_id
              AND channel_id = @channel_id
              AND date BETWEEN @start AND @end
            ORDER BY date ASC
        """
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("video_id",   "STRING", video_id),
                bigquery.ScalarQueryParameter("channel_id", "STRING", channel_id),
                bigquery.ScalarQueryParameter("start",      "DATE",   start),
                bigquery.ScalarQueryParameter("end",        "DATE",   end),
            ]
        )
        rows = list(bq.query(query, job_config=job_config).result())
        return {
            "video_id":  video_id,
            "start":     start,
            "end":       end,
            "daily": [
                {
                    "date":         row.date.isoformat(),
                    "views":        row.views or 0,
                    "watchTimeHrs": float(row.watch_time_hrs or 0),
                    "avd":          row.avd or 0,
                    "avgViewPct":   float(row.avg_view_pct or 0),
                    "subsGained":   row.subs_gained or 0,
                    "subsLost":     row.subs_lost or 0,
                    "netSubs":      row.net_subs or 0,
                    "likes":        row.likes or 0,
                    "comments":     row.comments or 0,
                    "shares":       row.shares or 0,
                }
                for row in rows
            ]
        }

    return get_cached(f"bq-video-daily:{video_id}:{start}:{end}", CACHE_TTL_BQ_VIDEOS, fetch)


@youtube_router.get("/bq-faculty")
def get_bq_faculty():  # noqa — teacher_name not yet in v2, returns empty until mapping is run
    """
    Returns cumulative stats per teacher across all channels and all time.
    Grouped by teacher_name from video_analytics_daily.
    Cached 2hrs — updates nightly with pipeline.
    """
    def fetch():
        bq = get_bq_client()
        query = f"""
            SELECT
                teacher_name,
                COUNT(DISTINCT video_id)                        AS total_videos,
                COUNT(DISTINCT channel_id)                      AS total_channels,
                SUM(views)                                      AS total_views,
                ROUND(SUM(watch_time_minutes) / 60, 2)          AS total_watch_hrs,
                CAST(AVG(avg_view_duration_sec) AS INT64)        AS avg_avd,
                ROUND(AVG(avg_view_percentage), 2)              AS avg_view_pct,
                SUM(subs_gained)                                AS total_subs_gained,
                SUM(subs_lost)                                  AS total_subs_lost,
                SUM(net_subs)                                   AS total_net_subs,
                SUM(likes)                                      AS total_likes,
                SUM(comments)                                   AS total_comments,
                SUM(shares)                                     AS total_shares,
                ROUND(SUM(views) / COUNT(DISTINCT video_id), 0) AS avg_views_per_video
            FROM `{TABLE_VIDEO}`
            WHERE teacher_name IS NOT NULL AND teacher_name != ''
            GROUP BY teacher_name
            ORDER BY total_views DESC
        """
        rows = list(bq.query(query).result())
        return {
            "faculty": [
                {
                    "name":             row.teacher_name,
                    "totalVideos":      row.total_videos or 0,
                    "totalChannels":    row.total_channels or 0,
                    "totalViews":       row.total_views or 0,
                    "totalWatchHrs":    float(row.total_watch_hrs or 0),
                    "avgAvd":           row.avg_avd or 0,
                    "avgViewPct":       float(row.avg_view_pct or 0),
                    "totalSubsGained":  row.total_subs_gained or 0,
                    "totalSubsLost":    row.total_subs_lost or 0,
                    "totalNetSubs":     row.total_net_subs or 0,
                    "totalLikes":       row.total_likes or 0,
                    "totalComments":    row.total_comments or 0,
                    "totalShares":      row.total_shares or 0,
                    "avgViewsPerVideo": int(row.avg_views_per_video or 0),
                }
                for row in rows
            ]
        }

    return get_cached("bq-faculty", CACHE_TTL_BQ_VIDEOS, fetch)


@youtube_router.get("/bq-faculty-videos/{teacher_name}")
def get_bq_faculty_videos(teacher_name: str):
    """
    Returns all videos by a teacher grouped by channel.
    Cached per teacher — only loads when someone clicks that teacher.
    Clustering on teacher_name makes this near-free in BQ.
    """
    def fetch():
        bq = get_bq_client()
        query = f"""
            SELECT
                channel_id,
                channel_name,
                video_id,
                video_title,
                video_type,
                published_at,
                MAX(teacher_name)                       AS teacher_name,
                SUM(views)                              AS views,
                ROUND(SUM(watch_time_minutes) / 60, 2)  AS watch_time_hrs,
                CAST(AVG(avg_view_duration_sec) AS INT64) AS avd,
                SUM(subs_gained)                        AS subs_gained,
                SUM(subs_lost)                          AS subs_lost,
                SUM(net_subs)                           AS net_subs,
                SUM(likes)                              AS likes,
                SUM(comments)                           AS comments,
                SUM(shares)                             AS shares
            FROM `{TABLE_VIDEO}`
            WHERE teacher_name = @teacher_name
            GROUP BY channel_id, channel_name, video_id, video_title, video_type, published_at
            ORDER BY channel_name, views DESC
        """
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("teacher_name", "STRING", teacher_name),
            ]
        )
        rows = list(bq.query(query, job_config=job_config).result())

        # Group by channel in Python — zero extra BQ cost
        channels = {}
        for row in rows:
            cname = row.channel_name or "Unknown"
            if cname not in channels:
                channels[cname] = {"channelId": row.channel_id, "channelName": cname, "videos": []}
            channels[cname]["videos"].append({
                "id":           row.video_id,
                "title":        row.video_title,
                "videoType":    row.video_type,
                "publishedAt":  row.published_at.isoformat() if row.published_at else None,
                "views":        row.views or 0,
                "watchTimeHrs": float(row.watch_time_hrs or 0),
                "avd":          row.avd or 0,
                "subsGained":   row.subs_gained or 0,
                "subsLost":     row.subs_lost or 0,
                "netSubs":      row.net_subs or 0,
                "likes":        row.likes or 0,
                "comments":     row.comments or 0,
                "shares":       row.shares or 0,
                "convRatio":    round(((row.net_subs or 0) / row.views) * 100, 2) if (row.views or 0) > 0 else 0,
            })

        return {"teacher": teacher_name, "channels": list(channels.values())}

    cache_key = f"bq-faculty-videos:{teacher_name}"
    return get_cached(cache_key, CACHE_TTL_BQ_VIDEOS, fetch)
