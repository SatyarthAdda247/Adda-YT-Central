import os
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from googleapiclient.discovery import build

# Import the credential manager from our auth service
from auth_service import get_credentials

youtube_router = APIRouter(prefix="/yt", tags=["YouTube API"])


@youtube_router.get("/channel/{channel_id}")
def get_channel_profile(channel_id: str):
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authorized.")

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


@youtube_router.get("/analytics/{channel_id}")
def get_channel_analytics(channel_id: str, days: int = 30):
    creds = get_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Not authorized.")

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

    # 3. VIDEO-LEVEL MASTER DATA (THE SCHEMA WE DISCUSSED)
    video_reports = query_yt(
        metrics="views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost,likes,comments",
        dimensions="video",
        sort="-views",
        max_results=20
    )

    # Resolve Video IDs to Titles/Thumbnails (Data API Batch Call)
    video_list = []
    if video_reports.get("rows"):
        video_ids = [row[0] for row in video_reports["rows"]]
        
        # Batch Fetch Metadata
        v_res = youtube_data.videos().list(
            part="snippet,contentDetails",
            id=",".join(video_ids)
        ).execute()

        v_meta = {v["id"]: v["snippet"] for v in v_res.get("items", [])}
        v_durations = {v["id"]: v["contentDetails"].get("duration") for v in v_res.get("items", [])}

        for row in video_reports["rows"]:
            vid_id = row[0]
            meta = v_meta.get(vid_id, {})
            video_list.append({
                "id": vid_id,
                "title": meta.get("title", "Unknown Title"),
                "thumbnail": meta.get("thumbnails", {}).get("default", {}).get("url"),
                "publishedAt": meta.get("publishedAt"),
                "views": row[1],
                "watchTimeMins": row[2],
                "avd": row[3],
                "subsGained": row[4],
                "subsLost": row[5],
                "netSubs": row[4] - row[5],
                "likes": row[6],
                "comments": row[7],
                "conv_ratio": round(( (row[4] - row[5]) / row[1] ) * 100, 2) if row[1] > 0 else 0
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
