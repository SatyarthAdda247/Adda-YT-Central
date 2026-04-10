/**
 * mockData.js
 * Used as initial state — real data replaces it when API succeeds.
 * Ensures UI is always populated on Vercel/preview deployments.
 */

function dailyRange(days, seed = {}) {
  const rows = [];
  const now = new Date();
  // Use deterministic values (no Math.random) so SSR/hydration is stable
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const wave = 0.85 + 0.3 * Math.sin(i / 7);
    rows.push({
      date,
      subscribersGained: Math.round((seed.subsGained || 8000)  * wave),
      subscribersLost:   Math.round((seed.subsLost   || 1200)  * wave),
      netSubs:           Math.round((seed.netSubs    || 6800)  * wave),
      views:             Math.round((seed.views      || 2500000) * wave),
      watchTimeHrs:      Math.round((seed.watchHrs   || 180000) * wave),
      likes:             Math.round((seed.likes      || 60000)  * wave),
      comments:          Math.round((seed.comments   || 4000)   * wave),
      shares:            Math.round((seed.shares     || 2000)   * wave),
      avgViewDuration:   Math.round((seed.avd        || 420)    * wave),
      avgViewPercentage: parseFloat(((seed.avp       || 38)     * wave).toFixed(1)),
    });
  }
  return rows;
}

export const MOCK_CHANNELS = [
  { channel_id: 'UC_mock_01', channel_name: 'SSC Adda247',              subscribers: 11000000, total_views: 1629000000, total_videos: 71400, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_02', channel_name: 'Adda247',                  subscribers: 9220000,  total_views: 1843000000, total_videos: 57000, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_03', channel_name: 'Teachers Adda247',         subscribers: 2370000,  total_views: 432000000,  total_videos: 41700, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_04', channel_name: 'Bihar Adda247',            subscribers: 1840000,  total_views: 335000000,  total_videos: 52400, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_05', channel_name: 'Railway Adda247',          subscribers: 1570000,  total_views: 177000000,  total_videos: 11400, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_06', channel_name: 'CUET Adda',                subscribers: 1340000,  total_views: 355000000,  total_videos: 19800, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_07', channel_name: 'Adda247 Bengali',          subscribers: 1310000,  total_views: 128000000,  total_videos: 28400, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_08', channel_name: 'Adda247 Tamil',            subscribers: 1290000,  total_views: 150000000,  total_videos: 27200, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_09', channel_name: 'Adda247 Telugu',           subscribers: 1180000,  total_views: 136000000,  total_videos: 26000, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_10', channel_name: 'UGC NET Adda247',          subscribers: 1050000,  total_views: 130000000,  total_videos: 20500, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_11', channel_name: 'Defence Adda247',          subscribers: 910000,   total_views: 147000000,  total_videos: 19000, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_12', channel_name: 'Adda247 Odia',             subscribers: 895000,   total_views: 199000000,  total_videos: 26300, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_13', channel_name: 'Engineers Adda247',        subscribers: 832000,   total_views: 128000000,  total_videos: 29100, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_14', channel_name: 'Punjab Adda247',           subscribers: 752000,   total_views: 191000000,  total_videos: 39700, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_15', channel_name: 'Science Adda247',          subscribers: 718000,   total_views: 139000000,  total_videos: 13300, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_16', channel_name: "Doctor's Adda247",         subscribers: 699000,   total_views: 131000000,  total_videos: 3400,  fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_17', channel_name: 'NEET Adda247',             subscribers: 583000,   total_views: 134000000,  total_videos: 2460,  fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_18', channel_name: 'Class 10 by Adda247',      subscribers: 508000,   total_views: 125000000,  total_videos: 10800, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_19', channel_name: 'Agriculture Adda247',      subscribers: 504000,   total_views: 78000000,   total_videos: 22300, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_20', channel_name: 'UPSC PREP BY STUDYIQ',     subscribers: 1070000,  total_views: 32000000,   total_videos: 12900, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_21', channel_name: 'Adda247 PCS',              subscribers: 242000,   total_views: 60000000,   total_videos: 9800,  fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_22', channel_name: 'Haryana StudyIQ',          subscribers: 508000,   total_views: 35000000,   total_videos: 13500, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_23', channel_name: 'StudyIQ After LL.B',       subscribers: 167000,   total_views: 28000000,   total_videos: 6200,  fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_24', channel_name: 'Skill Bangla',             subscribers: 564000,   total_views: 94000000,   total_videos: 600,   fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_25', channel_name: 'Ace Jobs',                 subscribers: 423000,   total_views: 29000000,   total_videos: 2500,  fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_26', channel_name: 'Rajasthan Career247',      subscribers: 393000,   total_views: 54000000,   total_videos: 18800, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_27', channel_name: 'Govt Jobs Adda247',        subscribers: 310000,   total_views: 48000000,   total_videos: 4500,  fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_28', channel_name: 'Adda247 Regulatory Bodies',subscribers: 292000,   total_views: 50000000,   total_videos: 19000, fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_29', channel_name: 'Judiciary Adda247',        subscribers: 180000,   total_views: 22000000,   total_videos: 3200,  fetched_at: new Date().toISOString() },
  { channel_id: 'UC_mock_30', channel_name: 'BPSC PCS Adda247',         subscribers: 20400,    total_views: 1900000,    total_videos: 1300,  fetched_at: new Date().toISOString() },
];

export const MOCK_CHANNEL_ANALYTICS = dailyRange(90, {
  subsGained: 8000, subsLost: 1200, netSubs: 6800,
  views: 2500000, watchHrs: 180000, likes: 60000,
});

export const MOCK_CHANNEL_ANALYTICS_SINGLE = dailyRange(90, {
  subsGained: 1200, subsLost: 180, netSubs: 1020,
  views: 380000, watchHrs: 28000, likes: 9000,
});

// Pre-build analytics map for all mock channels so CompanyDashboard renders immediately
export const MOCK_ANALYTICS_MAP = Object.fromEntries(
  MOCK_CHANNELS.map((ch, i) => [
    ch.channel_id,
    dailyRange(90, {
      subsGained: Math.round(8000 * (1 - i * 0.03)),
      subsLost:   Math.round(1200 * (1 - i * 0.03)),
      netSubs:    Math.round(6800 * (1 - i * 0.03)),
      views:      Math.round(2500000 * (1 - i * 0.03)),
      watchHrs:   Math.round(180000  * (1 - i * 0.03)),
      likes:      Math.round(60000   * (1 - i * 0.03)),
    }),
  ])
);

export const MOCK_BQ_VIDEOS = Array.from({ length: 20 }, (_, i) => ({
  id: `vid_mock_${i}`,
  title: [
    'Complete SSC CGL 2025 Preparation Strategy',
    'Banking Awareness Top 100 Questions',
    'Railway NTPC Previous Year Paper',
    'UPSC Prelims 2025 Current Affairs',
    'NEET Biology Chapter-wise Questions',
    'Class 10 Maths Full Revision',
    'Defence NDA Mathematics Mock Test',
    'UGC NET Paper 1 Complete Guide',
    'Bihar BPSC 70th Notification Details',
    'Rajasthan RPSC RAS Preparation',
    'SSC CHSL Tier 1 English Grammar',
    'CUET 2025 Domain Subject Strategy',
    'IIT JEE Physics Mechanics Lecture',
    'Punjab Police Constable Exam Guide',
    'Agriculture IBPS AFO Mock Test',
    'Haryana CET Group D Full Paper',
    'Odisha OPSC OAS Prelims Strategy',
    'Maharashtra Police Bharti 2025',
    'West Bengal PSC Clerkship Exam',
    'Skill Development Course Overview',
  ][i],
  videoType: ['Video', 'Shorts', 'Live'][i % 3],
  publishedAt: new Date(Date.now() - i * 5 * 86400000).toISOString(),
  teacherName: ['Rahul Sir', "Priya Ma'am", 'Amit Sir', 'Neha Ma\'am', 'Vikash Sir'][i % 5],
  views:        Math.round(50000  + (20 - i) * 25000),
  watchTimeHrs: Math.round(1000   + (20 - i) * 1000),
  avd:          Math.round(300    + (20 - i) * 15),
  subsGained:   Math.round(200    + (20 - i) * 80),
  subsLost:     Math.round(20     + (20 - i) * 5),
  netSubs:      Math.round(180    + (20 - i) * 75),
  likes:        Math.round(1000   + (20 - i) * 400),
  comments:     Math.round(100    + (20 - i) * 40),
  shares:       Math.round(50     + (20 - i) * 20),
  convRatio:    parseFloat(((180 + (20 - i) * 75) / (50000 + (20 - i) * 25000) * 100).toFixed(2)),
}));

export const MOCK_FACULTY = [
  { name: 'Rahul Sir',    totalVideos: 320, totalChannels: 4, totalViews: 45000000, totalWatchHrs: 3200000, avgAvd: 480, avgViewPct: 42, totalSubsGained: 180000, totalSubsLost: 22000, totalNetSubs: 158000, totalLikes: 1200000, totalComments: 85000, totalShares: 42000, avgViewsPerVideo: 140625 },
  { name: "Priya Ma'am",  totalVideos: 210, totalChannels: 3, totalViews: 32000000, totalWatchHrs: 2100000, avgAvd: 520, avgViewPct: 45, totalSubsGained: 130000, totalSubsLost: 15000, totalNetSubs: 115000, totalLikes: 890000,  totalComments: 62000, totalShares: 31000, avgViewsPerVideo: 152380 },
  { name: 'Amit Sir',     totalVideos: 180, totalChannels: 2, totalViews: 28000000, totalWatchHrs: 1800000, avgAvd: 390, avgViewPct: 38, totalSubsGained: 110000, totalSubsLost: 18000, totalNetSubs: 92000,  totalLikes: 720000,  totalComments: 48000, totalShares: 24000, avgViewsPerVideo: 155555 },
  { name: "Neha Ma'am",   totalVideos: 145, totalChannels: 2, totalViews: 18000000, totalWatchHrs: 1200000, avgAvd: 440, avgViewPct: 41, totalSubsGained: 75000,  totalSubsLost: 9000,  totalNetSubs: 66000,  totalLikes: 480000,  totalComments: 32000, totalShares: 16000, avgViewsPerVideo: 124137 },
  { name: 'Vikash Sir',   totalVideos: 120, totalChannels: 2, totalViews: 14000000, totalWatchHrs: 950000,  avgAvd: 360, avgViewPct: 35, totalSubsGained: 58000,  totalSubsLost: 8000,  totalNetSubs: 50000,  totalLikes: 380000,  totalComments: 25000, totalShares: 12000, avgViewsPerVideo: 116666 },
];
