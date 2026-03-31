import os
import re
import time
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from googleapiclient.discovery import build

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

CACHE_TTL_CHANNEL = 900    # 15 minutes for real-time channel data
CACHE_TTL_ANALYTICS = 3600 # 1 hour for D-2 analytics data


def parse_iso8601_duration(duration_str):
    """Convert ISO 8601 duration (PT1H2M3S) to total seconds."""
    if not duration_str:
        return 0
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration_str)
    if not match:
        return 0
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    return hours * 3600 + minutes * 60 + seconds

# Import the credential manager from our auth service
from auth_service import get_credentials

youtube_router = APIRouter(prefix="/yt", tags=["YouTube API"])


@youtube_router.get("/channel/{channel_id}")
def get_channel_profile(channel_id: str):
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authorized.")

    def fetch():
        youtube = build("youtube", "v3", credentials=creds)
        request = youtube.channels().list(
            part="snippet,statistics,contentDetails,status",
            id=channel_id,
        )
        response = request.execute()

        if not response.get("items"):
            raise HTTPException(status_code=404, detail=f"Channel {channel_id} not found")

        channel = response["items"][0]
        snip = channel["snippet"]
        stats = channel["statistics"]

        subs = int(stats.get("subscriberCount", 0))
        if subs >= 100:
            import math
            precision = 3
            factor = 10 ** (int(math.log10(subs)) - (precision - 1))
            subs_rounded = math.floor(subs / factor) * factor
        else:
            subs_rounded = subs

        return {
            "identity": {
                "name": snip.get("title"),
                "id": channel_id,
                "custom_url": snip.get("customUrl"),
                "thumbnail_url": snip.get("thumbnails", {}).get("high", {}).get("url"),
                "created_at": snip.get("publishedAt"),
                "country": snip.get("country"),
                "description": snip.get("description"),
            },
            "stats": {
                "total_videos": stats.get("videoCount"),
                "subscribers_actual": subs,
                "subscribers_rounded": subs_rounded,
                "total_views": stats.get("viewCount"),
                "hidden_subscriber_count": stats.get("hiddenSubscriberCount"),
            },
            "message": "✅ API 1: Public Master Data Fetched"
        }

    return get_cached(f"channel:{channel_id}", CACHE_TTL_CHANNEL, fetch)


@youtube_router.get("/analytics/{channel_id}")
def get_channel_analytics(channel_id: str, days: int = 30):
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authorized.")

    def fetch():
        analytics = build("youtubeAnalytics", "v2", credentials=creds)
        youtube_data = build("youtube", "v3", credentials=creds)

        end_date = (datetime.utcnow() - timedelta(days=2)).strftime("%Y-%m-%d")
        start_date = (datetime.utcnow() - timedelta(days=days + 2)).strftime("%Y-%m-%d")

        def query_yt(metrics, dimensions=None, filters=None, sort=None, max_results=None):
            try:
                return analytics.reports().query(
                    ids=f"channel=={channel_id}",
                    startDate=start_date,
                    endDate=end_date,
                    metrics=metrics,
                    dimensions=dimensions,
                    filters=filters,
                    sort=sort,
                    maxResults=max_results
                ).execute()
            except Exception as e:
                print(f"ℹ️ Skipping Unavailable Multi-Metric: {str(e).split('returned')[0]}")
                return {"rows": [], "columnHeaders": []}

        # 1. CHANNEL PERFORMANCE (DAILY)
        core = query_yt(
            metrics="views,engagedViews,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost,likes,dislikes,comments,shares",
            dimensions="day",
            sort="day"
        )

        # 2. AUDIENCE INTELLIGENCE (DEMO/DEVICE/TRAFFIC)
        traffic = query_yt(metrics="views,estimatedMinutesWatched", dimensions="insightTrafficSourceType", sort="-views")
        demographics = query_yt(metrics="viewerPercentage", dimensions="ageGroup,gender", sort="gender,ageGroup")
        devices = query_yt(metrics="views,estimatedMinutesWatched", dimensions="deviceType", sort="-views")
        subs_status = query_yt(metrics="views,estimatedMinutesWatched", dimensions="subscribedStatus")

        # 3. VIDEO-LEVEL DATA — Latest 20 uploads (like YouTube's UI)

        # Step 1: Get the channel's upload playlist ID
        ch_res = youtube_data.channels().list(
            part="contentDetails",
            id=channel_id
        ).execute()
        upload_playlist_id = ch_res["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]

        # Step 2: Fetch latest videos from upload playlist, filter out those within D-2 lag
        playlist_res = youtube_data.playlistItems().list(
            part="snippet",
            playlistId=upload_playlist_id,
            maxResults=40  # Fetch extra to account for D-2 filtering
        ).execute()

        # Only keep videos published on or before the analytics end date (D-2)
        end_date_dt = datetime.utcnow() - timedelta(days=2)
        video_ids = []
        for item in playlist_res.get("items", []):
            published = item["snippet"].get("publishedAt", "")
            if published and datetime.fromisoformat(published.replace("Z", "+00:00")).replace(tzinfo=None) <= end_date_dt:
                video_ids.append(item["snippet"]["resourceId"]["videoId"])
            if len(video_ids) >= 20:
                break

        # Step 3: Get full metadata + type classification
        video_list = []
        if video_ids:
            v_res = youtube_data.videos().list(
                part="snippet,contentDetails,liveStreamingDetails",
                id=",".join(video_ids)
            ).execute()

            v_meta = {}
            v_types = {}
            for v in v_res.get("items", []):
                vid = v["id"]
                v_meta[vid] = v["snippet"]
                duration_secs = parse_iso8601_duration(v["contentDetails"].get("duration", ""))

                if v.get("liveStreamingDetails"):
                    v_types[vid] = "Live"
                elif duration_secs <= 60:
                    v_types[vid] = "Shorts"
                else:
                    v_types[vid] = "Video"

            # Step 4: Fetch analytics for each video
            analytics_map = {}
            for vid_id in video_ids:
                vid_report = query_yt(
                    metrics="views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost,likes,comments",
                    dimensions="video",
                    filters=f"video=={vid_id}"
                )
                if vid_report.get("rows"):
                    analytics_map[vid_id] = vid_report["rows"][0]

            # Step 5: Build video list (maintaining upload order — latest first)
            for vid_id in video_ids:
                meta = v_meta.get(vid_id, {})
                row = analytics_map.get(vid_id)
                views = row[1] if row else 0
                subs_gained = row[4] if row else 0
                subs_lost = row[5] if row else 0

                video_list.append({
                    "id": vid_id,
                    "title": meta.get("title", "Unknown Title"),
                    "thumbnail": meta.get("thumbnails", {}).get("medium", {}).get("url") or meta.get("thumbnails", {}).get("default", {}).get("url"),
                    "publishedAt": meta.get("publishedAt"),
                    "videoType": v_types.get(vid_id, "Video"),
                    "views": views,
                    "watchTimeMins": row[2] if row else 0,
                    "avd": row[3] if row else 0,
                    "subsGained": subs_gained,
                    "subsLost": subs_lost,
                    "netSubs": subs_gained - subs_lost,
                    "likes": row[6] if row else 0,
                    "comments": row[7] if row else 0,
                    "conv_ratio": round(((subs_gained - subs_lost) / views) * 100, 2) if views > 0 else 0
                })

        return {
            "period": {"start": start_date, "end": end_date},
            "summary": {
                "daily_performance": core.get("rows", []),
                "traffic_sources": traffic.get("rows", []),
                "demographics": demographics.get("rows", []),
                "device_breakdown": devices.get("rows", []),
                "subscription_split": subs_status.get("rows", []),
                "video_master_table": video_list
            },
            "columns": {
                "core": [c.get("name") for c in core.get("columnHeaders", [])]
            },
            "message": "✅ API 2: Full Intel Pipeline Active"
        }

    return get_cached(f"analytics:{channel_id}:{days}", CACHE_TTL_ANALYTICS, fetch)
