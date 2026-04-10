/**
 * mockData.js — fallback data when backend/BQ is unreachable
 * Used automatically when API calls fail (e.g. Vercel preview without backend)
 */

// Generate daily data for the last N days
function dailyRange(days, seed = {}) {
  const rows = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const noise = () => 0.8 + Math.random() * 0.4;
    rows.push({
      date,
      subscribersGained: Math.round((seed.subsGained || 8000) * noise()),
      subscribersLost:   Math.round((seed.subsLost  || 1200) * noise()),
      netSubs:           Math.round((seed.netSubs   || 6800) * noise()),
      views:             Math.round((seed.views     || 2500000) * noise()),
      watchTimeHrs:      Math.round((seed.watchHrs  || 180000) * noise()),
      likes:             Math.round((seed.likes     || 60000) * noise()),
      comments:          Math.round((seed.comments  || 4000) * noise()),
      shares:            Math.round((seed.shares    || 2000) * noise()),
      avgViewDuration:   Math.round((seed.avd       || 420) * noise()),
      avgViewPercentage: parseFloat(((seed.avp      || 38) * noise()).toFixed(1)),
    });
  }
  return rows;
}

export const MOCK_CHANNELS = [
  { channel_id: 'UC_mock_01', channel_name: 'SSC Adda247',           subscribers: 11000000, total_views: 1629000000, total_videos: 71400, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_02', channel_name: 'Adda247',               subscribers: 9220000,  total_views: 1843000000, total_videos: 57000, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_03', channel_name: 'Teachers Adda247',      subscribers: 2370000,  total_views: 432000000,  total_videos: 41700, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_04', channel_name: 'Bihar Adda247',         subscribers: 1840000,  total_views: 335000000,  total_videos: 52400, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_05', channel_name: 'Railway Adda247',       subscribers: 1570000,  total_views: 177000000,  total_videos: 11400, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_06', channel_name: 'CUET Adda',             subscribers: 1340000,  total_views: 355000000,  total_videos: 19800, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_07', channel_name: 'Adda247 Bengali',       subscribers: 1310000,  total_views: 128000000,  total_videos: 28400, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_08', channel_name: 'Adda247 Tamil',         subscribers: 1290000,  total_views: 150000000,  total_videos: 27200, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_09', channel_name: 'Adda247 Telugu',        subscribers: 1180000,  total_views: 136000000,  total_videos: 26000, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_10', channel_name: 'UGC NET Adda247',       subscribers: 1050000,  total_views: 130000000,  total_videos: 20500, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_11', channel_name: 'Defence Adda247',       subscribers: 910000,   total_views: 147000000,  total_videos: 19000, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_12', channel_name: 'Adda247 Odia',          subscribers: 895000,   total_views: 199000000,  total_videos: 26300, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_13', channel_name: 'Engineers Adda247',     subscribers: 832000,   total_views: 128000000,  total_videos: 29100, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_14', channel_name: 'Punjab Adda247',        subscribers: 752000,   total_views: 191000000,  total_videos: 39700, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_15', channel_name: 'Science Adda247',       subscribers: 718000,   total_views: 139000000,  total_videos: 13300, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_16', channel_name: "Doctor's Adda247",      subscribers: 699000,   total_views: 131000000,  total_videos: 3400,  fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_17', channel_name: 'NEET Adda247',          subscribers: 583000,   total_views: 134000000,  total_videos: 2460,  fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_18', channel_name: 'Class 10 by Adda247',   subscribers: 508000,   total_views: 125000000,  total_videos: 10800, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_19', channel_name: 'Agriculture Adda247',   subscribers: 504000,   total_views: 78000000,   total_videos: 22300, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_20', channel_name: 'UPSC PREP BY STUDYIQ',  subscribers: 1070000,  total_views: 32000000,   total_videos: 12900, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_21', channel_name: 'Adda247 PCS',           subscribers: 242000,   total_views: 60000000,   total_videos: 9800,  fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_22', channel_name: 'Haryana StudyIQ',       subscribers: 508000,   total_views: 35000000,   total_videos: 13500, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_23', channel_name: 'StudyIQ After LL.B',    subscribers: 167000,   total_views: 28000000,   total_videos: 6200,  fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_24', channel_name: 'Skill Bangla',          subscribers: 564000,   total_views: 94000000,   total_videos: 600,   fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_25', channel_name: 'Ace Jobs',              subscribers: 423000,   total_views: 29000000,   total_videos: 2500,  fetched_at: new Date().toISOString() },
];

export const MOCK_CHANNEL_ANALYTICS = dailyRange(90, {
  subsGained: 8000, subsLost: 1200, netSubs: 6800,
  views: 2500000, watchHrs: 180000, likes: 60000,
});

export const MOCK_CHANNEL_ANALYTICS_SINGLE = dailyRange(90, {
  subsGained: 1200, subsLost: 180, netSubs: 1020,
  views: 380000, watchHrs: 28000, likes: 9000,
});

export const MOCK_BQ_VIDEOS = Array.from({ length: 20 }, (_, i) => ({
  id: `vid_mock_${i}`,
  title: `Mock Video ${i + 1} — Sample Title for Preview`,
  videoType: ['Video', 'Shorts', 'Live'][i % 3],
  publishedAt: new Date(Date.now() - i * 7 * 86400000).toISOString(),
  teacherName: ['Rahul Sir', 'Priya Ma\'am', 'Amit Sir'][i % 3],
  views: Math.round(50000 + Math.random() * 500000),
  watchTimeHrs: Math.round(1000 + Math.random() * 20000),
  avd: Math.round(200 + Math.random() * 600),
  subsGained: Math.round(100 + Math.random() * 2000),
  subsLost: Math.round(10 + Math.random() * 200),
  netSubs: Math.round(90 + Math.random() * 1800),
  likes: Math.round(500 + Math.random() * 10000),
  comments: Math.round(50 + Math.random() * 1000),
  shares: Math.round(20 + Math.random() * 500),
  convRatio: parseFloat((Math.random() * 2).toFixed(2)),
}));

export const MOCK_FACULTY = [
  { name: 'Rahul Sir',   totalVideos: 320, totalChannels: 4, totalViews: 45000000, totalWatchHrs: 3200000, avgAvd: 480, avgViewPct: 42, totalSubsGained: 180000, totalSubsLost: 22000, totalNetSubs: 158000, totalLikes: 1200000, totalComments: 85000, totalShares: 42000, avgViewsPerVideo: 140625 },
  { name: 'Priya Ma\'am', totalVideos: 210, totalChannels: 3, totalViews: 32000000, totalWatchHrs: 2100000, avgAvd: 520, avgViewPct: 45, totalSubsGained: 130000, totalSubsLost: 15000, totalNetSubs: 115000, totalLikes: 890000,  totalComments: 62000, totalShares: 31000, avgViewsPerVideo: 152380 },
  { name: 'Amit Sir',    totalVideos: 180, totalChannels: 2, totalViews: 28000000, totalWatchHrs: 1800000, avgAvd: 390, avgViewPct: 38, totalSubsGained: 110000, totalSubsLost: 18000, totalNetSubs: 92000,  totalLikes: 720000,  totalComments: 48000, totalShares: 24000, avgViewsPerVideo: 155555 },
];
