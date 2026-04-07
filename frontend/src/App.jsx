import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Loader2, Sun, Moon,
  TrendingUp as UpArrow, TrendingDown as DownArrow,
  ExternalLink, Settings2, CheckCircle2, Radio, Tv, Clapperboard,
  ChevronRight, ArrowLeft, ChevronLeft,
  Building2, MonitorPlay, Trophy, Search, Calendar, X
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// ============================================================
// HIERARCHY DATA
// ============================================================
const HIERARCHY = {
  businesses: [
    { id: 'TEST_PREP', name: 'Test Prep', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
    { id: 'Career_adda', name: 'Career Adda', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
    { id: 'Skilling_HE', name: 'SHE', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
    { id: 'SIQ', name: 'SIQ', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
  ],
  categories: {
    'TEST_PREP': [
      { id: 'AGRICULTURE', name: 'Agriculture', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'ANDHRA_PRADESH', name: 'Andhra Pradesh', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'BANKING', name: 'Banking', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'CAIIB_Bank Promotion', name: 'CAIIB / Bank Promotion', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'CHHATTISGARH', name: 'Chhattisgarh', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'CTET', name: 'CTET', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'DEFENCE', name: 'Defence', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'ENGINEERING', name: 'Engineering', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'FCI', name: 'FCI', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'GATE', name: 'GATE', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'GUJARAT', name: 'Gujarat', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'HARYANA', name: 'Haryana', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'INSURANCE', name: 'Insurance', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'JAIIB', name: 'JAIIB', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'JAIIB_CAIIB', name: 'JAIIB & CAIIB', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'JHARKHAND', name: 'Jharkhand', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'KERALA', name: 'Kerala', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'MADHYA_PRADESH', name: 'Madhya Pradesh', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'MAHARASHTRA', name: 'Maharashtra', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'ODISHA_STATE_EXAMS', name: 'Odisha State Exams', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'RAILWAYS', name: 'Railways', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'RAJASTHAN', name: 'Rajasthan', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'REGULATORY_BODIES', name: 'Regulatory Bodies', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'SSC', name: 'SSC', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'TAMIL_NADU', name: 'Tamil Nadu', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'UGC_NET', name: 'UGC NET', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'CSIR_NET', name: 'CSIR NET', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'UTTAR_PRADESH', name: 'Uttar Pradesh', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'UTTARAKHAND', name: 'Uttarakhand', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'WEST_BENGAL', name: 'West Bengal', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'PUNJAB_STATE_EXAMS', name: 'Punjab State Exams', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'BIHAR', name: 'Bihar', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'BIHAR TEACHING', name: 'Bihar Teaching', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'NORTH_EAST_STATE_EXAMS', name: 'North East State Exams', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'NURSING', name: 'Nursing', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'LIFE_SCIENCES', name: 'Life Sciences', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'MATHEMATICAL_SCIENCES', name: 'Mathematical Sciences', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
    ],
    'Career_adda': [
      { id: 'CLASS_10', name: 'Class 10', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'CLASS_11', name: 'Class 11', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'CLASS_12', name: 'Class 12', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'CUET', name: 'CUET', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'CUET_HINDI', name: 'CUET Hindi', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'CUET_PG', name: 'CUET PG', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'IITJEE', name: 'IIT JEE', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'IITNEET', name: 'IIT NEET', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'IPM', name: 'IPM', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'LAW', name: 'Law', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'NEET', name: 'NEET', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'NEET_HINDI', name: 'NEET Hindi', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'UG_DEFENCE', name: 'UG Defence', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
    ],
    'Skilling_HE': [
      { id: 'SKILLS', name: 'Skills', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'APTITUDE_INTERVIEW_PREP', name: 'Aptitude & Interview Prep', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'TECH_SKILLS_CODING', name: 'Tech Skills & Coding', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'Prep+Online_Degree', name: 'Prep + Online Degree', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'Online_Degree', name: 'Online Degree', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'SKILL_BOOSTER', name: 'Skill Booster', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
    ],
    'SIQ': [
      { id: 'UPSC_ONLINE', name: 'UPSC Online', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'STATE_PCS', name: 'State PCS', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'JUDICIARY', name: 'Judiciary', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
    ],
  },
  channels: {
    'AGRICULTURE': [], 'ANDHRA_PRADESH': [], 'BANKING': [], 'CAIIB_Bank Promotion': [],
    'CHHATTISGARH': [], 'CTET': [], 'DEFENCE': [], 'ENGINEERING': [], 'FCI': [], 'GATE': [],
    'GUJARAT': [], 'HARYANA': [], 'INSURANCE': [], 'JAIIB': [], 'JAIIB_CAIIB': [],
    'JHARKHAND': [], 'KERALA': [], 'MADHYA_PRADESH': [], 'MAHARASHTRA': [],
    'ODISHA_STATE_EXAMS': [], 'RAILWAYS': [], 'RAJASTHAN': [], 'REGULATORY_BODIES': [],
    'SSC': [], 'TAMIL_NADU': [], 'UGC_NET': [], 'CSIR_NET': [], 'UTTAR_PRADESH': [],
    'UTTARAKHAND': [], 'WEST_BENGAL': [], 'PUNJAB_STATE_EXAMS': [], 'BIHAR': [],
    'BIHAR TEACHING': [], 'NORTH_EAST_STATE_EXAMS': [], 'NURSING': [], 'LIFE_SCIENCES': [],
    'MATHEMATICAL_SCIENCES': [], 'CLASS_10': [], 'CLASS_11': [], 'CLASS_12': [],
    'CUET': [], 'CUET_HINDI': [], 'CUET_PG': [], 'IITJEE': [], 'IITNEET': [],
    'IPM': [], 'LAW': [], 'NEET': [], 'NEET_HINDI': [], 'UG_DEFENCE': [],
    'SKILLS': [], 'APTITUDE_INTERVIEW_PREP': [], 'TECH_SKILLS_CODING': [],
    'Prep+Online_Degree': [], 'Online_Degree': [], 'SKILL_BOOSTER': [],
    'UPSC_ONLINE': [], 'STATE_PCS': [], 'JUDICIARY': [],
  }
};

const DATA_COLUMNS = [
  { key: 'd1', label: 'Total Views' },
  { key: 'd2', label: 'Subscribers' },
  { key: 'd3', label: 'Total Videos' },
  { key: 'd4', label: 'Watch Time (H)' },
  { key: 'd5', label: 'Engagement' },
];

const ALL_VIDEO_COLUMNS = [
  { id: 'views', label: 'Views', default: true },
  { id: 'watchTime', label: 'Watch Time (H)', default: true },
  { id: 'avd', label: 'AVD', default: true },
  { id: 'subsGained', label: 'Gained', default: true },
  { id: 'subsLost', label: 'Lost', default: true },
  { id: 'netSubs', label: 'Net Subs', default: true },
  { id: 'conv_ratio', label: 'Conv %', default: false },
  { id: 'likes', label: 'Likes', default: false },
  { id: 'comments', label: 'Comments', default: false },
  { id: 'sharing', label: 'Shares', default: false },
  { id: 'engagement', label: 'Engagement', default: false },
];

// Extra cumulative columns for Channel Explorer (from video_analytics_daily — empty until backfill done)
const CHANNEL_EXTRA_COLS = [
  { id: 'views_d2', label: 'Views (D-2)', default: false },
  { id: 'watch_time', label: 'Watch Time (H)', default: false },
  { id: 'avd', label: 'Avg View Duration', default: false },
  { id: 'subs_gained', label: 'Subs Gained', default: false },
  { id: 'subs_lost', label: 'Subs Lost', default: false },
  { id: 'net_subs', label: 'Net Subs', default: false },
  { id: 'likes', label: 'Likes', default: false },
  { id: 'comments', label: 'Comments', default: false },
  { id: 'shares', label: 'Shares', default: false },
];

// CSS variable helper
const v = (name) => `var(--${name})`;

// ============================================================
// THEME TOGGLE COMPONENT
// ============================================================
function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="relative flex items-center w-14 h-7 rounded-full p-1 transition-colors duration-300"
      style={{ backgroundColor: v('toggle-bg') }}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Sun size={12} className="absolute left-1.5" style={{ color: dark ? v('text-placeholder') : '#f59e0b' }} />
      <Moon size={12} className="absolute right-1.5" style={{ color: dark ? '#818cf8' : v('text-placeholder') }} />
      <div
        className="w-5 h-5 rounded-full shadow-md transition-transform duration-300"
        style={{
          backgroundColor: v('toggle-knob'),
          transform: dark ? 'translateX(28px)' : 'translateX(0px)',
        }}
      />
    </button>
  );
}

// ============================================================
// MAIN APP
// ============================================================

function App() {
  // Theme
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  // Top-level tab
  const [mainTab, setMainTab] = useState('business');

  // Business drill-down
  const [businessView, setBusinessView] = useState('list');
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // Channel tab — BQ data
  const [channelSearch, setChannelSearch] = useState('');
  const [bqChannels, setBqChannels] = useState([]);
  const [bqLoading, setBqLoading] = useState(false);
  const [visibleExtraCols, setVisibleExtraCols] = useState([]);
  const [showColPicker, setShowColPicker] = useState(false);
  const toggleExtraCol = (id) => setVisibleExtraCols(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  useEffect(() => {
    if (mainTab === 'channel' && bqChannels.length === 0) {
      setBqLoading(true);
      axios.get(`${API_BASE_URL}/yt/channel-stats`)
        .then(res => setBqChannels(res.data.channels || []))
        .catch(() => setBqChannels([]))
        .finally(() => setBqLoading(false));
    }
  }, [mainTab]);

  // Faculty state
  const [faculty, setFaculty] = useState([]);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [facultySearch, setFacultySearch] = useState('');
  const [facultySortBy, setFacultySortBy] = useState('totalViews');

  useEffect(() => {
    if (mainTab === 'teacher' && faculty.length === 0) {
      setFacultyLoading(true);
      axios.get(`${API_BASE_URL}/yt/bq-faculty`)
        .then(res => setFaculty(res.data.faculty || []))
        .catch(() => setFaculty([]))
        .finally(() => setFacultyLoading(false));
    }
  }, [mainTab]);

  // Channel detail state
  const days = 30;
  const [profile, setProfile] = useState(null);
  const [bqVideos, setBqVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoSearch, setVideoSearch] = useState('');
  const [visibleColumns, setVisibleColumns] = useState(ALL_VIDEO_COLUMNS.filter(c => c.default).map(c => c.id));
  const [showConfig, setShowConfig] = useState(false);
  const [videoTypeFilter, setVideoTypeFilter] = useState({ Video: true, Shorts: true, Live: true });
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 50;

  // Published date range filter (client-side, no BQ re-fetch)
  const [pubDateFrom, setPubDateFrom] = useState('');
  const [pubDateTo, setPubDateTo] = useState('');

  // Expanded video state — which video row is open
  const [expandedVideoId, setExpandedVideoId] = useState(null);

  // Daily data cache — { "videoId:start:end": { daily: [...] } }
  const [dailyCache, setDailyCache] = useState({});
  const [dailyLoading, setDailyLoading] = useState(false);

  // Per-expanded-video state
  const [expandedMetric, setExpandedMetric] = useState('views');
  const [expandedDateFrom, setExpandedDateFrom] = useState('');
  const [expandedDateTo, setExpandedDateTo] = useState('');

  // Collect all channels for the Channel tab
  const allChannels = [];
  Object.entries(HIERARCHY.channels).forEach(([catId, channels]) => {
    channels.forEach(ch => {
      if (!allChannels.find(c => c.id === ch.id)) {
        let businessName = '-';
        let categoryName = catId;
        for (const [bizId, cats] of Object.entries(HIERARCHY.categories)) {
          const found = cats.find(c => c.id === catId);
          if (found) {
            businessName = HIERARCHY.businesses.find(b => b.id === bizId)?.name || bizId;
            categoryName = found.name;
            break;
          }
        }
        allChannels.push({ ...ch, business: businessName, category: categoryName });
      }
    });
  });


  // Navigation handlers
  const handleBusinessClick = (business) => {
    setSelectedBusiness(business);
    setBreadcrumbs([{ name: business.name, type: 'business' }]);
    setBusinessView('categories');
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setBreadcrumbs(prev => [...prev.slice(0, 1), { name: category.name, type: 'category' }]);
    setBusinessView('channels');
  };

  const handleChannelClick = (channel) => {
    setSelectedChannel(channel);
    setBreadcrumbs(prev => [...prev.slice(0, 2), { name: channel.name, type: 'channel' }]);
    setBusinessView('channel-detail');
    fetchData(channel.id);
  };

  const handleChannelTabClick = (channel) => {
    setSelectedChannel(channel);
    setMainTab('channel-detail-standalone');
    fetchData(channel.id);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      setBusinessView('list'); setBreadcrumbs([]);
      setSelectedBusiness(null); setSelectedCategory(null); setSelectedChannel(null);
      setProfile(null); setBqVideos([]);
    } else if (index === 0) {
      setBusinessView('categories'); setBreadcrumbs(prev => prev.slice(0, 1));
      setSelectedCategory(null); setSelectedChannel(null); setProfile(null); setBqVideos([]);
    } else if (index === 1) {
      setBusinessView('channels'); setBreadcrumbs(prev => prev.slice(0, 2));
      setSelectedChannel(null); setProfile(null); setBqVideos([]);
    }
  };

  // Data fetching
  const fetchData = async (cid) => {
    if (!cid || cid.startsWith('UC_dummy')) {
      setProfile({
        identity: { name: 'Demo Channel', id: cid, custom_url: 'demo', thumbnail_url: '', country: 'IN', description: 'Dummy channel data' },
        stats: { subscribers_actual: 42000, subscribers_rounded: 42000, total_views: 1800000, total_videos: 220 }
      });
      setBqVideos([]);
      setLoading(false);
      return;
    }
    setLoading(true); setError(null); setVideoSearch(''); setCurrentPage(1);
    try {
      const [profRes, videosRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/yt/channel/${cid}`),
        axios.get(`${API_BASE_URL}/yt/bq-videos/${cid}`)
      ]);
      setProfile(profRes.data);
      setBqVideos(videosRes.data.videos || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reach backend.");
    } finally { setLoading(false); }
  };

  const toggleColumn = (id) => setVisibleColumns(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  const toggleVideoType = (type) => setVideoTypeFilter(prev => {
    const allTypes = ['Video', 'Shorts', 'Live'];
    const activeCount = allTypes.filter(t => prev[t]).length;
    // If only this type is active, clicking it again resets to show all
    if (activeCount === 1 && prev[type]) return { Video: true, Shorts: true, Live: true };
    // Otherwise, make this type the only active one
    return { Video: type === 'Video', Shorts: type === 'Shorts', Live: type === 'Live' };
  });

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    const n = Number(num);
    if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
  };

  const formatAvd = (secs) => {
    if (!secs) return '0m 0s';
    return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  };

  // Fetch daily data for a single video — cached in React state
  const fetchDailyData = async (video, channelId, start, end) => {
    const cacheKey = `${video.id}:${start}:${end}`;
    if (dailyCache[cacheKey]) return; // already cached
    setDailyLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/yt/bq-video-daily/${video.id}?channel_id=${channelId}&start=${start}&end=${end}`
      );
      setDailyCache(prev => ({ ...prev, [cacheKey]: res.data.daily || [] }));
    } catch (e) {
      setDailyCache(prev => ({ ...prev, [cacheKey]: [] }));
    } finally {
      setDailyLoading(false);
    }
  };

  // Handle video row click — expand/collapse + fetch daily data
  const handleVideoRowClick = (video) => {
    if (expandedVideoId === video.id) {
      setExpandedVideoId(null);
      return;
    }
    setExpandedVideoId(video.id);
    // Start 1 day before publishedAt to account for UTC vs IST timezone offset
    const pubDate = video.publishedAt ? new Date(video.publishedAt) : new Date('2026-01-01');
    pubDate.setDate(pubDate.getDate() - 1);
    const start = pubDate.toISOString().substring(0, 10);
    const end = new Date().toISOString().substring(0, 10);
    setExpandedDateFrom(start);
    setExpandedDateTo(end);
    fetchDailyData(video, selectedChannel?.id, start, end);
  };

  // All filtering/search/sort done in JS — zero extra BQ queries
  const filteredVideos = bqVideos
    .filter(v => videoTypeFilter[v.videoType])
    .filter(v => !videoSearch || v.title?.toLowerCase().includes(videoSearch.toLowerCase()))
    .filter(v => {
      if (!pubDateFrom && !pubDateTo) return true;
      const pub = new Date(v.publishedAt);
      if (pubDateFrom && pub < new Date(pubDateFrom)) return false;
      if (pubDateTo && pub > new Date(pubDateTo)) return false;
      return true;
    })
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  const totalPages = Math.ceil(filteredVideos.length / videosPerPage);
  const paginatedVideos = filteredVideos.slice((currentPage - 1) * videosPerPage, currentPage * videosPerPage);
  const isChannelDetailView = businessView === 'channel-detail' || mainTab === 'channel-detail-standalone';

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen transition-all duration-500" style={{ backgroundColor: v('bg-page') }}>

      {/* ===== TOP NAV BAR ===== */}
      <nav className="sticky top-0 z-[100] px-6 py-0 glass-effect transition-all duration-300" 
        style={{ 
          backgroundColor: v('bg-nav'), 
          boxShadow: v('nav-shadow'), 
          borderBottom: `1px solid ${v('border-card')}` 
        }}>
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">

          {/* Left: Title */}
          <div className="flex items-center gap-3 py-3.5">
            {isChannelDetailView && (
              <button onClick={() => {
                if (mainTab === 'channel-detail-standalone') { setMainTab('channel'); setProfile(null); setAnalytics(null); }
                else handleBreadcrumbClick(breadcrumbs.length - 2);
              }}
                className="p-1.5 rounded-lg transition-all"
                style={{ border: `1px solid ${v('border-card')}`, color: v('text-label') }}>
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <h1 className="text-[15px] font-extrabold tracking-tight uppercase" style={{ color: v('text-heading') }}>
                ADDA<span style={{ color: v('accent') }}>247</span>
              </h1>
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em]" style={{ color: v('text-label') }}>
                YouTube Command Centre · 108 Channels
              </p>
            </div>
          </div>

          {/* Center: Tabs */}
            <div className="flex items-center gap-1">
              {[
                { id: 'business', label: 'Business Hub', icon: Building2 },
                { id: 'channel', label: 'Channel Explorer', icon: MonitorPlay },
                { id: 'teacher', label: 'Faculty Metrics', icon: Trophy },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setMainTab(tab.id); setBusinessView('list'); setBreadcrumbs([]); setProfile(null); }}
                  className="flex items-center gap-2 px-6 py-4 text-[11px] font-bold tracking-wide uppercase transition-all relative group"
                  style={{
                    color: mainTab === tab.id ? v('accent') : v('tab-inactive'),
                  }}
                >
                  <tab.icon size={14} className={mainTab === tab.id ? "text-rose-500" : "text-slate-400 group-hover:text-slate-600"} />
                  {tab.label}
                  {mainTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-t-full shadow-[0_-4px_10px_rgba(225,29,72,0.3)]" />
                  )}
                  {mainTab !== tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-transparent group-hover:bg-slate-200 transition-all" />
                  )}
                </button>
              ))}
            </div>

          {/* Right: Period selector + Theme + Live */}
          <div className="flex items-center gap-4">
            <ThemeToggle dark={dark} onToggle={() => setDark(!dark)} />
            <div className="flex items-center gap-2 text-[10px] font-bold" style={{ color: v('text-label') }}>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              {/* LIVE indicator removed */}
            </div>
          </div>
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-[1400px] mx-auto px-6 py-6">

        {error && (
          <div className="p-4 rounded-xl flex items-center gap-3 text-red-600 mb-6 text-sm font-semibold"
            style={{ backgroundColor: v('accent-soft'), border: `1px solid ${v('accent-border')}` }}>
            <Activity size={18} /> {error}
          </div>
        )}

        {/* ===================== BUSINESS TAB ===================== */}
        {mainTab === 'business' && (
          <>
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <div className="flex items-center gap-2 text-sm mb-4">
                <button onClick={() => handleBreadcrumbClick(-1)}
                  className="font-semibold transition-colors hover:text-red-500"
                  style={{ color: v('text-secondary') }}>Home</button>
                {breadcrumbs.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-2">
                    <ChevronRight size={14} style={{ color: v('text-placeholder') }} />
                    <button onClick={() => handleBreadcrumbClick(i)}
                      className="font-semibold transition-colors hover:text-red-500"
                      style={{ color: i === breadcrumbs.length - 1 ? v('breadcrumb-active-text') : v('text-secondary') }}>
                      {crumb.name}
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Hierarchy Flow */}
            <div className="flex items-center gap-1 mb-5 text-[10px] font-bold uppercase tracking-wider">
              {['Business', 'Category', 'Channel', 'Video'].map((label, i) => {
                const activeMap = { Business: 'list', Category: 'categories', Channel: 'channels', Video: 'channel-detail' };
                const isActive = businessView === activeMap[label];
                return (
                  <div key={label} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight size={10} className="mx-1" style={{ color: v('text-placeholder') }} />}
                    <div className="px-3 py-1.5 rounded-md transition-all"
                      style={{
                        color: isActive ? v('breadcrumb-active-text') : v('breadcrumb-text'),
                        backgroundColor: isActive ? v('breadcrumb-active-bg') : 'transparent',
                        border: isActive ? `1px solid ${v('breadcrumb-active-border')}` : '1px solid transparent',
                      }}>
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>

            {businessView === 'list' && (
              <DataTable title="Business Units" subtitle="Select a business unit to drill down into category and channel performance"
                rows={HIERARCHY.businesses} columns={DATA_COLUMNS} onRowClick={handleBusinessClick} />
            )}
            {businessView === 'categories' && selectedBusiness && (
              <DataTable title={selectedBusiness.name} subtitle="Categories under this business unit"
                rows={HIERARCHY.categories[selectedBusiness.id] || []} columns={DATA_COLUMNS} 
                onRowClick={handleCategoryClick} onBackClick={() => handleBreadcrumbClick(-1)} />
            )}
            {businessView === 'channels' && selectedCategory && (
              <DataTable title={selectedCategory.name} subtitle="Channels under this category"
                rows={HIERARCHY.channels[selectedCategory.id] || []} columns={DATA_COLUMNS} 
                onRowClick={handleChannelClick} onBackClick={() => handleBreadcrumbClick(0)} />
            )}
            {businessView === 'channel-detail' && (
              <ChannelDetail profile={profile} loading={loading}
                days={days} filteredVideos={filteredVideos} paginatedVideos={paginatedVideos}
                currentPage={currentPage} totalPages={totalPages} videosPerPage={videosPerPage}
                visibleColumns={visibleColumns} showConfig={showConfig} videoTypeFilter={videoTypeFilter}
                videoSearch={videoSearch} setVideoSearch={setVideoSearch}
                pubDateFrom={pubDateFrom} setPubDateFrom={setPubDateFrom}
                pubDateTo={pubDateTo} setPubDateTo={setPubDateTo}
                expandedVideoId={expandedVideoId} expandedMetric={expandedMetric} setExpandedMetric={setExpandedMetric}
                expandedDateFrom={expandedDateFrom} setExpandedDateFrom={setExpandedDateFrom}
                expandedDateTo={expandedDateTo} setExpandedDateTo={setExpandedDateTo}
                dailyCache={dailyCache} dailyLoading={dailyLoading}
                onVideoRowClick={handleVideoRowClick} fetchDailyData={fetchDailyData}
                selectedChannel={selectedChannel}
                setCurrentPage={setCurrentPage} setShowConfig={setShowConfig}
                toggleColumn={toggleColumn} toggleVideoType={toggleVideoType}
                formatNumber={formatNumber} formatAvd={formatAvd} />
            )}
          </>
        )}

        {/* ===================== CHANNEL TAB ===================== */}
        {mainTab === 'channel' && (
          <div className="rounded-2xl overflow-hidden transition-all" style={{ backgroundColor: v('bg-card'), border: `1px solid ${v('border-card')}`, boxShadow: v('card-shadow') }}>

            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between gap-4" style={{ borderBottom: `1px solid ${v('border-light')}` }}>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight" style={{ color: v('text-heading') }}>Channel Explorer</h2>
                <p className="text-xs font-semibold mt-0.5" style={{ color: v('text-label') }}>
                  {bqChannels.length > 0 ? `${bqChannels.filter(ch => ch.channel_name.toLowerCase().includes(channelSearch.toLowerCase())).length} of ${bqChannels.length} channels · sorted by subscribers` : 'Live data from BigQuery'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Column picker */}
                <div className="relative">
                  <button onClick={() => setShowColPicker(!showColPicker)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border-2"
                    style={{ backgroundColor: showColPicker ? v('accent-soft') : v('bg-input'), color: showColPicker ? v('accent') : v('text-secondary'), borderColor: showColPicker ? v('accent-border') : v('border-card') }}>
                    <Settings2 size={13} /> Columns {visibleExtraCols.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full text-white text-[9px] font-black" style={{ backgroundColor: v('accent') }}>{visibleExtraCols.length}</span>}
                  </button>
                  {showColPicker && (
                    <div className="absolute right-0 mt-2 rounded-2xl p-5 w-64 z-50 shadow-2xl"
                      style={{ backgroundColor: v('bg-card'), border: `1px solid ${v('border-card')}` }}>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: v('text-label') }}>Video Analytics Columns</p>
                      <p className="text-[10px] mb-3 font-medium" style={{ color: v('text-placeholder') }}>These will populate once video backfill is complete</p>
                      <div className="space-y-1">
                        {CHANNEL_EXTRA_COLS.map(col => (
                          <label key={col.id} className="flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer transition-colors"
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = v('bg-table-row-hover')}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <input type="checkbox" checked={visibleExtraCols.includes(col.id)} onChange={() => toggleExtraCol(col.id)}
                              className="w-3.5 h-3.5 rounded accent-rose-500" />
                            <span className="text-[11px] font-bold" style={{ color: visibleExtraCols.includes(col.id) ? v('accent') : v('text-body') }}>{col.label}</span>
                          </label>
                        ))}
                      </div>
                      <button onClick={() => setShowColPicker(false)} className="mt-4 w-full py-2 rounded-xl text-[10px] font-black uppercase text-white" style={{ backgroundColor: v('accent') }}>Done</button>
                    </div>
                  )}
                </div>
                {/* Search */}
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: v('text-placeholder') }} />
                  <input type="text" placeholder="Search channels..." value={channelSearch} onChange={e => setChannelSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none w-56 transition-all"
                    style={{ backgroundColor: v('bg-input'), border: `1px solid ${v('border-card')}`, color: v('text-body') }} />
                </div>
              </div>
            </div>

            {/* Loading */}
            {bqLoading && (
              <div className="flex items-center justify-center py-20 gap-3">
                <Loader2 size={22} className="animate-spin" style={{ color: v('accent') }} />
                <span className="text-sm font-bold" style={{ color: v('text-label') }}>Fetching from BigQuery...</span>
              </div>
            )}

            {/* Table */}
            {!bqLoading && (() => {
              const filtered = bqChannels.filter(ch =>
                ch.channel_name.toLowerCase().includes(channelSearch.toLowerCase())
              );
              return (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: v('bg-table-header') }}>
                        <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest w-12" style={{ color: v('text-table-header') }}>#</th>
                        <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest" style={{ color: v('text-table-header'), minWidth: '220px' }}>Channel</th>
                        {/* Always-on BQ columns */}
                        <th className="px-5 py-3.5 text-right text-[10px] font-black uppercase tracking-widest" style={{ color: v('text-table-header') }}>Subscribers</th>
                        <th className="px-5 py-3.5 text-right text-[10px] font-black uppercase tracking-widest" style={{ color: v('text-table-header') }}>Total Views</th>
                        <th className="px-5 py-3.5 text-right text-[10px] font-black uppercase tracking-widest" style={{ color: v('text-table-header') }}>Videos</th>
                        {/* Toggled extra columns */}
                        {visibleExtraCols.map(id => {
                          const col = CHANNEL_EXTRA_COLS.find(c => c.id === id);
                          return (
                            <th key={id} className="px-5 py-3.5 text-right text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: v('accent') }}>
                              {col?.label}
                            </th>
                          );
                        })}
                        <th className="px-5 py-3.5 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={6 + visibleExtraCols.length} className="px-5 py-16 text-center text-sm font-semibold" style={{ color: v('text-label') }}>
                          {bqChannels.length === 0 ? 'No data yet — run the channel snapshot pipeline first.' : 'No matching channels.'}
                        </td></tr>
                      ) : filtered.map((ch, idx) => (
                        <tr key={ch.channel_id}
                          onClick={() => handleChannelTabClick({ id: ch.channel_id, name: ch.channel_name })}
                          className="cursor-pointer transition-colors group"
                          style={{ borderBottom: `1px solid ${v('border-table')}` }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = v('bg-table-row-hover')}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>

                          {/* Rank */}
                          <td className="px-5 py-4">
                            <span className="text-sm font-black" style={{ color: v('row-number') }}>{String(idx + 1).padStart(2, '0')}</span>
                          </td>

                          {/* Channel name */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: v('accent-soft'), border: `1px solid ${v('accent-border')}` }}>
                                <MonitorPlay size={14} style={{ color: v('accent') }} />
                              </div>
                              <span className="text-sm font-bold group-hover:text-rose-500 transition-colors" style={{ color: v('text-heading') }}>{ch.channel_name}</span>
                            </div>
                          </td>

                          {/* BQ stats — always visible */}
                          <td className="px-5 py-4 text-right">
                            <span className="text-sm font-black" style={{ color: v('accent') }}>{formatNumber(ch.subscribers)}</span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className="text-sm font-bold" style={{ color: v('text-heading') }}>{formatNumber(ch.total_views)}</span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className="text-sm font-bold" style={{ color: v('text-heading') }}>{formatNumber(ch.total_videos)}</span>
                          </td>

                          {/* Extra toggled columns — empty until video backfill */}
                          {visibleExtraCols.map(id => (
                            <td key={id} className="px-5 py-4 text-right">
                              <span className="text-sm font-bold opacity-30" style={{ color: v('text-body') }}>—</span>
                            </td>
                          ))}

                          <td className="px-5 py-4 text-center">
                            <ChevronRight size={15} className="group-hover:text-rose-500 transition-all group-hover:translate-x-0.5" style={{ color: v('text-placeholder') }} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        )}

        {/* ===================== TEACHER TAB ===================== */}
        {mainTab === 'teacher' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              style={{ backgroundColor: v('bg-card'), border: `1px solid ${v('border-card')}`, boxShadow: v('card-shadow') }}>
              <div>
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3" style={{ color: v('text-heading') }}>
                  <Trophy size={22} className="text-amber-500" /> Faculty Metrics
                </h2>
                <p className="text-[13px] font-bold mt-1" style={{ color: v('text-label') }}>
                  Cumulative performance across all channels · Ranked by total views
                </p>
              </div>
              {/* Search */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border w-full sm:w-64"
                style={{ backgroundColor: v('bg-input'), borderColor: v('border-card') }}>
                <Search size={13} style={{ color: v('text-placeholder') }} />
                <input value={facultySearch} onChange={e => setFacultySearch(e.target.value)}
                  placeholder="Search faculty..."
                  className="bg-transparent text-[12px] font-bold outline-none w-full"
                  style={{ color: v('text-primary') }} />
              </div>
            </div>

            {/* Sort tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'totalViews', label: 'Views' },
                { id: 'totalWatchHrs', label: 'Watch Time' },
                { id: 'avgViewsPerVideo', label: 'Avg Views/Video' },
                { id: 'totalNetSubs', label: 'Net Subs' },
                { id: 'totalVideos', label: 'Videos' },
              ].map(s => (
                <button key={s.id} onClick={() => setFacultySortBy(s.id)}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all"
                  style={{
                    backgroundColor: facultySortBy === s.id ? v('accent') : 'transparent',
                    color: facultySortBy === s.id ? '#fff' : v('text-secondary'),
                    borderColor: facultySortBy === s.id ? v('accent') : v('border-card'),
                  }}>{s.label}</button>
              ))}
            </div>

            {/* Leaderboard table */}
            <div className="rounded-2xl overflow-hidden border" style={{ backgroundColor: v('bg-card'), borderColor: v('border-card'), boxShadow: v('card-shadow') }}>
              {facultyLoading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 size={32} className="animate-spin" style={{ color: v('accent') }} />
                </div>
              ) : (
                <table className="w-full text-[12px]">
                  <thead>
                    <tr style={{ backgroundColor: v('bg-table-header') }}>
                      {[
                        { label: '#', center: true },
                        { label: 'Faculty', center: false },
                        { label: 'Channels', center: true },
                        { label: 'Videos', center: true },
                        { label: 'Total Views', center: true },
                        { label: 'Watch Time', center: true },
                        { label: 'Avg Views/Video', center: true },
                        { label: 'AVD', center: true },
                        { label: 'Net Subs', center: true },
                        { label: 'Likes', center: true },
                        { label: 'Comments', center: true },
                      ].map(h => (
                        <th key={h.label} className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest ${h.center ? 'text-center' : 'text-left'}`}
                          style={{ color: v('text-table-header') }}>{h.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {faculty
                      .filter(f => !facultySearch || f.name.toLowerCase().includes(facultySearch.toLowerCase()))
                      .sort((a, b) => (b[facultySortBy] || 0) - (a[facultySortBy] || 0))
                      .map((f, idx) => (
                        <tr key={f.name}
                          className="border-t transition-all"
                          style={{ borderColor: v('border-table') }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = v('bg-table-row-hover')}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          {/* Rank */}
                          <td className="px-4 py-3 text-center">
                            {idx === 0 ? <span className="text-lg">🥇</span>
                              : idx === 1 ? <span className="text-lg">🥈</span>
                              : idx === 2 ? <span className="text-lg">🥉</span>
                              : <span className="font-black text-[11px]" style={{ color: v('text-label') }}>{idx + 1}</span>}
                          </td>
                          {/* Name */}
                          <td className="px-4 py-3">
                            <p className="font-black text-[12px]" style={{ color: v('text-heading') }}>{f.name}</p>
                          </td>
                          <td className="px-4 py-3 text-center font-bold" style={{ color: v('text-body') }}>{f.totalChannels}</td>
                          <td className="px-4 py-3 text-center font-bold" style={{ color: v('text-body') }}>{formatNumber(f.totalVideos)}</td>
                          <td className="px-4 py-3 text-center font-black" style={{ color: v('accent') }}>{formatNumber(f.totalViews)}</td>
                          <td className="px-4 py-3 text-center font-bold" style={{ color: v('text-body') }}>{formatNumber(f.totalWatchHrs)}h</td>
                          <td className="px-4 py-3 text-center font-bold" style={{ color: v('text-body') }}>{formatNumber(f.avgViewsPerVideo)}</td>
                          <td className="px-4 py-3 text-center font-bold" style={{ color: v('text-body') }}>{formatAvd(f.avgAvd)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-black ${f.totalNetSubs >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {f.totalNetSubs >= 0 ? '+' : ''}{formatNumber(f.totalNetSubs)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-bold" style={{ color: v('text-body') }}>{formatNumber(f.totalLikes)}</td>
                          <td className="px-4 py-3 text-center font-bold" style={{ color: v('text-body') }}>{formatNumber(f.totalComments)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ===================== STANDALONE CHANNEL DETAIL ===================== */}
        {mainTab === 'channel-detail-standalone' && (
          <ChannelDetail profile={profile} loading={loading}
            days={days} filteredVideos={filteredVideos} paginatedVideos={paginatedVideos}
            currentPage={currentPage} totalPages={totalPages} videosPerPage={videosPerPage}
            visibleColumns={visibleColumns} showConfig={showConfig} videoTypeFilter={videoTypeFilter}
            videoSearch={videoSearch} setVideoSearch={setVideoSearch}
            pubDateFrom={pubDateFrom} setPubDateFrom={setPubDateFrom}
            pubDateTo={pubDateTo} setPubDateTo={setPubDateTo}
            expandedVideoId={expandedVideoId} expandedMetric={expandedMetric} setExpandedMetric={setExpandedMetric}
            expandedDateFrom={expandedDateFrom} setExpandedDateFrom={setExpandedDateFrom}
            expandedDateTo={expandedDateTo} setExpandedDateTo={setExpandedDateTo}
            dailyCache={dailyCache} dailyLoading={dailyLoading}
            onVideoRowClick={handleVideoRowClick} fetchDailyData={fetchDailyData}
            selectedChannel={selectedChannel}
            setCurrentPage={setCurrentPage} setShowConfig={setShowConfig}
            toggleColumn={toggleColumn} toggleVideoType={toggleVideoType}
            formatNumber={formatNumber} formatAvd={formatAvd} />
        )}

      </main>
    </div>
  );
}

// ============================================================
// DATA TABLE COMPONENT
// ============================================================
function DataTable({ title, subtitle, rows, columns, onRowClick, onBackClick }) {
  return (
    <div className="rounded-xl overflow-hidden transition-all duration-300 animate-fade-in" 
      style={{ backgroundColor: v('bg-card'), border: `1px solid ${v('border-card')}`, boxShadow: v('card-shadow') }}>
      <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${v('border-light')}` }}>
        <div className="flex items-center gap-4">
          {onBackClick && (
            <button onClick={onBackClick} 
              className="p-2 rounded-lg back-btn-premium"
              style={{ border: `1px solid ${v('border-card')}`, color: v('text-secondary') }}>
              <ChevronLeft size={16} />
            </button>
          )}
          <div>
            <h2 className="text-xl font-extrabold tracking-tight" style={{ color: v('text-heading') }}>{title}</h2>
            <p className="text-[12px] font-medium mt-1" style={{ color: v('text-label') }}>{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: v('bg-table-header') }}>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: v('text-table-header') }}>#</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-[0.1em] min-w-[240px]" style={{ color: v('text-table-header') }}>Resource Name</th>
              {columns.map(col => (
                <th key={col.key} className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: v('text-table-header') }}>{col.label}</th>
              ))}
              <th className="px-6 py-4 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length + 3} className="px-6 py-16 text-center text-sm font-medium" style={{ color: v('text-label') }}>No active metrics detected for this segment</td></tr>
            ) : rows.map((row, idx) => (
              <tr key={row.id} onClick={() => onRowClick(row)}
                className="cursor-pointer transition-all group border-b last:border-0"
                style={{ borderBottomColor: v('border-table') }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = v('bg-table-row-hover')}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td className="px-6 py-5 text-[13px] font-bold" style={{ color: v('row-number') }}>{String(idx + 1).padStart(2, '0')}</td>
                <td className="px-6 py-5">
                  <span className="text-[14px] font-bold group-hover:text-rose-500 transition-colors" style={{ color: v('text-heading') }}>{row.name}</span>
                </td>
                {columns.map(col => (
                  <td key={col.key} className="px-6 py-5 text-center text-[14px] font-bold" style={{ color: v('text-body') }}>
                    {row[col.key] === '-' ? (
                      <span className="opacity-20">—</span>
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}
                <td className="px-6 py-5 text-center">
                  <div className="p-1 rounded-md group-hover:bg-rose-50 dark:group-hover:bg-rose-500/10 transition-colors">
                    <ChevronRight size={14} className="group-hover:text-rose-500 transition-transform group-hover:translate-x-0.5" style={{ color: v('text-placeholder') }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// DAILY DRILL-DOWN PANEL (inline expanded row)
// ============================================================
const DAILY_METRICS = [
  { id: 'views',       label: 'Views',       color: '#f43f5e' },
  { id: 'watchTimeHrs',label: 'Watch Time',  color: '#8b5cf6' },
  { id: 'avd',         label: 'AVD (s)',     color: '#f59e0b' },
  { id: 'subsGained',  label: 'Subs Gained', color: '#10b981' },
  { id: 'subsLost',    label: 'Subs Lost',   color: '#ef4444' },
  { id: 'netSubs',     label: 'Net Subs',    color: '#3b82f6' },
  { id: 'likes',       label: 'Likes',       color: '#ec4899' },
  { id: 'comments',    label: 'Comments',    color: '#14b8a6' },
  { id: 'shares',      label: 'Shares',      color: '#f97316' },
];

function VideoDrillDown({ video, channelId, dailyCache, dailyLoading, fetchDailyData,
  expandedMetric, setExpandedMetric, expandedDateFrom, setExpandedDateFrom,
  expandedDateTo, setExpandedDateTo, colSpan, formatNumber, formatAvd }) {

  const cacheKey = `${video.id}:${expandedDateFrom}:${expandedDateTo}`;
  const dailyData = dailyCache[cacheKey] || [];
  const metricMeta = DAILY_METRICS.find(m => m.id === expandedMetric) || DAILY_METRICS[0];

  // Column visibility for daily table — local to this expanded panel
  const ALL_DAILY_COLS = [
    { id: 'views',       label: 'Views' },
    { id: 'watchTime',   label: 'Watch Time' },
    { id: 'avd',         label: 'AVD' },
    { id: 'subsGained',  label: 'Subs +' },
    { id: 'subsLost',    label: 'Subs -' },
    { id: 'netSubs',     label: 'Net Subs' },
    { id: 'likes',       label: 'Likes' },
    { id: 'comments',    label: 'Comments' },
    { id: 'shares',      label: 'Shares' },
  ];
  const [visibleDailyCols, setVisibleDailyCols] = useState(ALL_DAILY_COLS.map(c => c.id));
  const [showColPicker, setShowColPicker] = useState(false);
  const toggleDailyCol = (id) => setVisibleDailyCols(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  // Min: publishedAt minus 1 day (UTC buffer for IST offset)
  const minDate = (() => {
    const d = new Date(video.publishedAt || '2020-01-01');
    d.setDate(d.getDate() - 1);
    return d.toISOString().substring(0, 10);
  })();

  // Max: today minus 2 days (YouTube Analytics D-2 lag)
  const maxDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    return d.toISOString().substring(0, 10);
  })();

  const handleDateChange = (from, to) => {
    if (from && to && from <= to) {
      fetchDailyData(video, channelId, from, to);
    }
  };

  return (
    <tr>
      <td colSpan={colSpan} className="p-0">
        {/* Visually distinct expanded panel — darker bg, left accent border */}
        <div className="mx-4 mb-4 rounded-2xl overflow-hidden border-l-4"
          style={{ borderLeftColor: '#f43f5e', backgroundColor: v('bg-expanded'), border: `1px solid ${v('border-card')}`, borderLeftWidth: '4px' }}>

          {/* Panel header */}
          <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4"
            style={{ backgroundColor: v('bg-expanded-header'), borderBottom: `1px solid ${v('border-light')}` }}>
            <div className="flex items-center gap-3">
              <img src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
                className="w-16 h-9 rounded-lg object-cover shadow" />
              <div>
                <p className="text-[12px] font-black truncate max-w-[400px]" style={{ color: v('text-heading') }}>{video.title}</p>
                <p className="text-[10px] font-bold mt-0.5" style={{ color: v('text-label') }}>
                  Daily Breakdown · {dailyData.length} days with activity
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Column picker for daily table */}
              <div className="relative">
                <button onClick={() => setShowColPicker(p => !p)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all"
                  style={{ backgroundColor: v('bg-input'), color: v('text-secondary'), borderColor: v('border-card') }}>
                  <Settings2 size={11} /> Columns
                </button>
                {showColPicker && (
                  <div className="absolute right-0 mt-2 rounded-xl p-4 w-44 z-[120] shadow-2xl border"
                    style={{ backgroundColor: v('bg-card'), borderColor: v('border-card') }}>
                    <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: v('text-label') }}>Table Columns</p>
                    <div className="space-y-1">
                      {ALL_DAILY_COLS.map(col => (
                        <label key={col.id} className="flex items-center gap-2 p-1 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                          <input type="checkbox" checked={visibleDailyCols.includes(col.id)} onChange={() => toggleDailyCol(col.id)}
                            className="w-3 h-3 accent-rose-500" />
                          <span className="text-[10px] font-bold"
                            style={{ color: visibleDailyCols.includes(col.id) ? v('accent') : v('text-secondary') }}>{col.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Date range picker */}
              <input type="date" value={expandedDateFrom}
                min={minDate} max={expandedDateTo || maxDate}
                onChange={e => { setExpandedDateFrom(e.target.value); handleDateChange(e.target.value, expandedDateTo); }}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold border outline-none"
                style={{ backgroundColor: v('bg-input'), color: v('text-primary'), borderColor: v('border-card') }} />
              <span className="text-[11px] font-black" style={{ color: v('text-label') }}>→</span>
              <input type="date" value={expandedDateTo}
                min={expandedDateFrom || minDate} max={maxDate}
                onChange={e => { setExpandedDateTo(e.target.value); handleDateChange(expandedDateFrom, e.target.value); }}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold border outline-none"
                style={{ backgroundColor: v('bg-input'), color: v('text-primary'), borderColor: v('border-card') }} />
              </div>
          </div>

          {/* Metric tabs */}
          <div className="px-6 py-3 flex flex-wrap gap-2"
            style={{ backgroundColor: v('bg-expanded-header'), borderBottom: `1px solid ${v('border-light')}` }}>
            {DAILY_METRICS.map(m => (
              <button key={m.id} onClick={() => setExpandedMetric(m.id)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border"
                style={{
                  backgroundColor: expandedMetric === m.id ? m.color : 'transparent',
                  color: expandedMetric === m.id ? '#fff' : v('text-secondary'),
                  borderColor: expandedMetric === m.id ? m.color : v('border-card'),
                }}>
                {m.label}
              </button>
            ))}
          </div>

          {dailyLoading && !dailyData.length ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={28} className="animate-spin" style={{ color: v('accent') }} />
            </div>
          ) : dailyData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-[12px] font-bold" style={{ color: v('text-label') }}>No activity data found for this date range.</p>
            </div>
          ) : (
            <>
              {/* Chart */}
              <div className="px-6 pt-6 pb-2" style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData} margin={{ top: 28, right: 24, bottom: 4, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={v('border-table')} />
                    <XAxis dataKey="date"
                      tickFormatter={d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      axisLine={false} tickLine={false}
                      tick={{ fill: v('text-label'), fontSize: 11, fontWeight: 800 }} />
                    <YAxis axisLine={false} tickLine={false}
                      tick={{ fill: v('text-label'), fontSize: 11, fontWeight: 800 }}
                      tickFormatter={n => n >= 1000 ? (n/1000).toFixed(1)+'K' : n}
                      width={48} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: v('bg-card'),
                        border: `2px solid ${metricMeta.color}`,
                        borderRadius: 12, fontSize: 12, fontWeight: 800,
                        color: v('text-heading'), padding: '10px 16px'
                      }}
                      formatter={(val) => [
                        val >= 1000 ? (val/1000).toFixed(1)+'K' : val,
                        metricMeta.label
                      ]}
                      labelFormatter={d => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    />
                    <Line
                      type="monotone"
                      dataKey={expandedMetric}
                      stroke={metricMeta.color}
                      strokeWidth={3}
                      dot={{ fill: metricMeta.color, r: 5, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8, stroke: metricMeta.color, strokeWidth: 2, fill: '#fff' }}
                      name={metricMeta.label}
                      label={{
                        position: 'top',
                        fontSize: 11,
                        fontWeight: 800,
                        fill: metricMeta.color,
                        formatter: (val) => val >= 1000 ? (val/1000).toFixed(1)+'K' : val,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Daily breakdown table */}
              <div className="mx-6 mb-6 rounded-xl overflow-hidden border" style={{ borderColor: v('border-card') }}>
                <table className="w-full text-[11px]">
                  <thead>
                    <tr style={{ backgroundColor: v('bg-daily-header') }}>
                      <th className="px-3 py-2.5 text-center font-black uppercase tracking-wider" style={{ color: v('text-table-header') }}>Date</th>
                      {visibleDailyCols.includes('views')      && <th className="px-3 py-2.5 text-center font-black uppercase tracking-wider" style={{ color: v('text-table-header') }}>Views</th>}
                      {visibleDailyCols.includes('watchTime')  && <th className="px-3 py-2.5 text-center font-black uppercase tracking-wider" style={{ color: v('text-table-header') }}>Watch Time</th>}
                      {visibleDailyCols.includes('avd')        && <th className="px-3 py-2.5 text-center font-black uppercase tracking-wider" style={{ color: v('text-table-header') }}>AVD</th>}
                      {visibleDailyCols.includes('subsGained') && <th className="px-3 py-2.5 text-center font-black uppercase tracking-wider" style={{ color: v('text-table-header') }}>Subs +</th>}
                      {visibleDailyCols.includes('subsLost')   && <th className="px-3 py-2.5 text-center font-black uppercase tracking-wider" style={{ color: v('text-table-header') }}>Subs -</th>}
                      {visibleDailyCols.includes('netSubs')    && <th className="px-3 py-2.5 text-center font-black uppercase tracking-wider" style={{ color: v('text-table-header') }}>Net</th>}
                      {visibleDailyCols.includes('likes')      && <th className="px-3 py-2.5 text-center font-black uppercase tracking-wider" style={{ color: v('text-table-header') }}>Likes</th>}
                      {visibleDailyCols.includes('comments')   && <th className="px-3 py-2.5 text-center font-black uppercase tracking-wider" style={{ color: v('text-table-header') }}>Comments</th>}
                      {visibleDailyCols.includes('shares')     && <th className="px-3 py-2.5 text-center font-black uppercase tracking-wider" style={{ color: v('text-table-header') }}>Shares</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {dailyData.map((d, i) => (
                      <tr key={d.date} style={{ backgroundColor: i % 2 === 0 ? v('bg-daily-row-even') : v('bg-daily-row-odd') }}>
                        <td className="px-3 py-2 text-center font-black" style={{ color: v('accent') }}>{d.date.split('-').reverse().join('-')}</td>
                        {visibleDailyCols.includes('views')      && <td className="px-3 py-2 text-center font-bold" style={{ color: v('text-heading') }}>{formatNumber(d.views)}</td>}
                        {visibleDailyCols.includes('watchTime')  && <td className="px-3 py-2 text-center font-bold" style={{ color: v('text-body') }}>{d.watchTimeHrs}h</td>}
                        {visibleDailyCols.includes('avd')        && <td className="px-3 py-2 text-center font-bold" style={{ color: v('text-body') }}>{formatAvd(d.avd)}</td>}
                        {visibleDailyCols.includes('subsGained') && <td className="px-3 py-2 text-center font-black text-emerald-500">+{d.subsGained}</td>}
                        {visibleDailyCols.includes('subsLost')   && <td className="px-3 py-2 text-center font-black text-rose-500">{d.subsLost > 0 ? `-${d.subsLost}` : '0'}</td>}
                        {visibleDailyCols.includes('netSubs')    && <td className="px-3 py-2 text-center font-black" style={{ color: d.netSubs >= 0 ? '#10b981' : '#ef4444' }}>{d.netSubs >= 0 ? '+' : ''}{d.netSubs}</td>}
                        {visibleDailyCols.includes('likes')      && <td className="px-3 py-2 text-center font-bold" style={{ color: v('text-body') }}>{formatNumber(d.likes)}</td>}
                        {visibleDailyCols.includes('comments')   && <td className="px-3 py-2 text-center font-bold" style={{ color: v('text-body') }}>{formatNumber(d.comments)}</td>}
                        {visibleDailyCols.includes('shares')     && <td className="px-3 py-2 text-center font-bold" style={{ color: v('text-body') }}>{formatNumber(d.shares)}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// ============================================================
// CHANNEL DETAIL COMPONENT
// ============================================================
function ChannelDetail({ profile, loading, filteredVideos, paginatedVideos,
  currentPage, totalPages, videosPerPage, visibleColumns, showConfig, videoTypeFilter,
  videoSearch, setVideoSearch,
  pubDateFrom, setPubDateFrom, pubDateTo, setPubDateTo,
  expandedVideoId, expandedMetric, setExpandedMetric,
  expandedDateFrom, setExpandedDateFrom, expandedDateTo, setExpandedDateTo,
  dailyCache, dailyLoading, onVideoRowClick, fetchDailyData, selectedChannel,
  setCurrentPage, setShowConfig, toggleColumn, toggleVideoType,
  formatNumber, formatAvd }) {

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-pulse">
        <Loader2 size={48} className="animate-spin text-rose-500 mb-4" />
        <p className="text-[14px] font-bold tracking-widest uppercase" style={{ color: v('text-label') }}>Syncing Intel...</p>
      </div>
    );
  }
  if (!profile) return null;

  const totalCols = 2 + visibleColumns.length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Channel Header */}
      <div className="rounded-2xl p-8 flex flex-col lg:flex-row items-center gap-10 transition-all duration-500"
        style={{ backgroundColor: v('bg-card'), border: `1px solid ${v('border-card')}`, boxShadow: v('card-shadow') }}>
        <div className="relative group shrink-0">
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-amber-500 rounded-[28px] opacity-20 group-hover:opacity-40 transition-all blur-md"></div>
          {profile.identity.thumbnail_url && (
            <img src={profile.identity.thumbnail_url} className="relative w-28 h-28 rounded-[24px] object-cover border-2 shadow-2xl"
              style={{ borderColor: v('bg-card') }} />
          )}
          <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full border-4 shadow-lg" style={{ borderColor: v('bg-card') }}>
            <CheckCircle2 size={16} />
          </div>
        </div>
        <div className="flex-1 space-y-3 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-4">
            <h2 className="text-3xl font-black tracking-tight" style={{ color: v('text-heading') }}>{profile.identity.name}</h2>
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100 dark:border-blue-500/20">Verified</span>
          </div>
          <p className="inline-block px-1 font-bold text-rose-500 text-[14px]">@{profile.identity.custom_url}</p>
          <p className="text-[13px] font-medium leading-relaxed max-w-2xl" style={{ color: v('text-secondary') }}>{profile.identity.description}</p>
        </div>
        <div className="grid grid-cols-3 gap-4 shrink-0">
          {[
            { label: 'Subscribers', val: formatNumber(profile.stats.subscribers_actual), accent: true },
            { label: 'Total Views', val: formatNumber(profile.stats.total_views), accent: false },
            { label: 'Active Videos', val: formatNumber(profile.stats.total_videos), accent: false },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-5 text-center min-w-[120px] transition-all"
              style={{ backgroundColor: v('bg-input'), border: `1px solid ${v('border-card')}` }}>
              <p className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: v('text-label') }}>{stat.label}</p>
              <p className="text-2xl font-black mt-2 tracking-tight" style={{ color: stat.accent ? v('accent') : v('text-heading') }}>{stat.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Video Table Container */}
      <div className="rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 border"
        style={{ backgroundColor: v('bg-card'), borderColor: v('border-card') }}>

        {/* Controls header */}
        <div className="px-6 py-6 flex flex-col gap-4" style={{ borderBottom: `1px solid ${v('border-light')}` }}>
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3" style={{ color: v('text-heading') }}>
                Live Performance Data
              </h2>
              <p className="text-[13px] font-bold mt-1" style={{ color: v('text-label') }}>
                Showing <span className="text-rose-500">{filteredVideos.length} videos</span> · Lifetime stats · Click any row to expand daily breakdown
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Video search */}
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: v('text-placeholder') }} />
                <input type="text" placeholder="Search videos..." value={videoSearch}
                  onChange={e => { setVideoSearch(e.target.value); setCurrentPage(1); }}
                  className="pl-8 pr-3 py-2 rounded-xl text-[12px] font-bold outline-none border-2 transition-all w-44"
                  style={{ backgroundColor: v('bg-input'), color: v('text-primary'), borderColor: v('border-card') }} />
              </div>
              {/* Video type filter */}
              <div className="p-1 rounded-xl flex gap-1" style={{ backgroundColor: v('bg-input') }}>
                {[{ type: 'Video', icon: Clapperboard }, { type: 'Shorts', icon: Radio }, { type: 'Live', icon: Tv }].map(({ type, icon: VIcon }) => (
                  <button key={type} onClick={() => { toggleVideoType(type); setCurrentPage(1); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                    style={{
                      backgroundColor: videoTypeFilter[type] ? v('accent') : 'transparent',
                      color: videoTypeFilter[type] ? '#fff' : v('text-secondary'),
                    }}>
                    <VIcon size={12} /> {type}
                  </button>
                ))}
              </div>
              {/* Metrics config */}
              <div className="relative">
                <button onClick={() => setShowConfig(!showConfig)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border-2"
                  style={{ backgroundColor: v('bg-card'), color: v('text-primary'), borderColor: v('border-card') }}>
                  <Settings2 size={13} /> Metrics
                </button>
                {showConfig && (
                  <div className="absolute right-0 mt-2 rounded-2xl p-5 w-56 z-[110] shadow-2xl border"
                    style={{ backgroundColor: v('bg-card'), borderColor: v('border-card') }}>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: v('text-label') }}>Configure Columns</h3>
                    <div className="space-y-1">
                      {ALL_VIDEO_COLUMNS.map(col => (
                        <label key={col.id} className="flex items-center gap-2.5 p-1.5 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                          <input type="checkbox" checked={visibleColumns.includes(col.id)} onChange={() => toggleColumn(col.id)}
                            className="w-3.5 h-3.5 accent-rose-500" />
                          <span className="text-[11px] font-bold uppercase"
                            style={{ color: visibleColumns.includes(col.id) ? v('accent') : v('text-secondary') }}>{col.label}</span>
                        </label>
                      ))}
                    </div>
                    <button onClick={() => setShowConfig(false)} className="mt-4 w-full py-2 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Done</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Published date range filter — second row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border-2"
              style={{ backgroundColor: v('bg-input'), borderColor: pubDateFrom || pubDateTo ? v('accent') : v('border-card') }}>
              <Calendar size={13} style={{ color: v('accent') }} />
              <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: v('text-label') }}>Uploaded</span>
              <input type="date" value={pubDateFrom}
                onChange={e => { setPubDateFrom(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-[11px] font-bold outline-none"
                style={{ color: v('text-primary') }} />
              <span className="text-[11px] font-black" style={{ color: v('text-label') }}>→</span>
              <input type="date" value={pubDateTo}
                onChange={e => { setPubDateTo(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-[11px] font-bold outline-none"
                style={{ color: v('text-primary') }} />
            </div>
            {(pubDateFrom || pubDateTo) && (
              <button onClick={() => { setPubDateFrom(''); setPubDateTo(''); setCurrentPage(1); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black border-2 transition-all"
                style={{ color: v('accent'), borderColor: v('accent') }}>
                <X size={12} /> Clear filter
              </button>
            )}
            {(pubDateFrom || pubDateTo) && (
              <span className="text-[11px] font-bold" style={{ color: v('text-label') }}>
                Showing videos uploaded {pubDateFrom || '...'} → {pubDateTo || 'today'}
              </span>
            )}
          </div>
        </div>

        {/* Table */}
        <div>
          <table className="w-full table-fixed">
            <colgroup>
              <col style={{ width: '3%' }} />
              <col style={{ width: `${Math.max(28, 70 - visibleColumns.length * 6)}%` }} />
              {visibleColumns.map(id => (
                <col key={id} style={{ width: `${Math.min(9, Math.floor(69 / visibleColumns.length))}%` }} />
              ))}
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: v('bg-table-header') }}>
                <th className="px-2 py-4 text-left text-[10px] font-black uppercase tracking-widest" style={{ color: v('text-table-header') }}>#</th>
                <th className="px-3 py-4 text-left text-[10px] font-black uppercase tracking-widest" style={{ color: v('text-table-header') }}>Video</th>
                {visibleColumns.map(id => (
                  <th key={id} className="px-2 py-4 text-center text-[10px] font-black uppercase tracking-widest" style={{ color: v('text-table-header') }}>
                    {ALL_VIDEO_COLUMNS.find(c => c.id === id)?.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedVideos.map((video, idx) => (
                <>
                  {/* Main video row */}
                  <tr key={video.id}
                    onClick={() => onVideoRowClick(video)}
                    className="cursor-pointer transition-all duration-200 border-b"
                    style={{
                      borderBottomColor: v('border-light'),
                      backgroundColor: expandedVideoId === video.id ? v('bg-row-expanded') : 'transparent',
                    }}
                    onMouseEnter={e => { if (expandedVideoId !== video.id) e.currentTarget.style.backgroundColor = v('bg-table-row-hover'); }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = expandedVideoId === video.id ? v('bg-row-expanded') : 'transparent'; }}>
                    <td className="px-2 py-3 text-[12px] font-black" style={{ color: v('row-number') }}>
                      {String((currentPage - 1) * videosPerPage + idx + 1).padStart(2, '0')}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
                            onError={e => { e.target.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`; }}
                            className="w-[72px] h-[40px] rounded-md object-cover shadow-sm ring-1 ring-black/5" />
                          <a href={`https://youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-all bg-black/40 rounded-md">
                            <ExternalLink size={13} className="text-white" />
                          </a>
                        </div>
                        <div className="space-y-1 overflow-hidden min-w-0">
                          <h4 className="text-[11px] font-black leading-tight truncate" style={{ color: expandedVideoId === video.id ? v('accent') : v('text-heading') }}>{video.title}</h4>
                          {video.teacherName && (
                            <p className="text-[10px] font-bold truncate" style={{ color: v('accent') }}>👤 {video.teacherName}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-wider shrink-0" style={{ color: v('text-label') }}>
                              {new Date(video.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                              video.videoType === 'Shorts' ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : video.videoType === 'Live' ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            }`}>{video.videoType}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    {visibleColumns.includes('views') && <td className="px-2 py-3 text-center text-[13px] font-black" style={{ color: v('text-heading') }}>{formatNumber(video.views)}</td>}
                    {visibleColumns.includes('watchTime') && <td className="px-2 py-3 text-center text-[12px] font-bold" style={{ color: v('text-body') }}>{formatNumber(video.watchTimeHrs)}h</td>}
                    {visibleColumns.includes('avd') && <td className="px-2 py-3 text-center text-[12px] font-bold" style={{ color: v('text-body') }}>{formatAvd(video.avd)}</td>}
                    {visibleColumns.includes('subsGained') && <td className="px-2 py-3 text-center font-black text-emerald-500 text-[12px]">+{video.subsGained}</td>}
                    {visibleColumns.includes('subsLost') && <td className="px-2 py-3 text-center font-black text-rose-500 text-[12px]">{video.subsLost > 0 ? `-${video.subsLost}` : '0'}</td>}
                    {visibleColumns.includes('netSubs') && (
                      <td className="px-2 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 font-black px-2 py-1 rounded-lg text-[10px] ${
                          video.netSubs >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {video.netSubs >= 0 ? <UpArrow size={9} /> : <DownArrow size={9} />} {Math.abs(video.netSubs)}
                        </span>
                      </td>
                    )}
                    {visibleColumns.includes('conv_ratio') && <td className="px-2 py-3 text-center font-black text-blue-500 text-[12px]">{video.convRatio}%</td>}
                    {visibleColumns.includes('likes') && <td className="px-2 py-3 text-center text-[12px] font-bold" style={{ color: v('text-body') }}>{formatNumber(video.likes)}</td>}
                    {visibleColumns.includes('comments') && <td className="px-2 py-3 text-center text-[12px] font-bold" style={{ color: v('text-body') }}>{formatNumber(video.comments)}</td>}
                    {visibleColumns.includes('sharing') && <td className="px-2 py-3 text-center text-[12px] font-bold" style={{ color: v('text-body') }}>{formatNumber(video.shares || 0)}</td>}
                    {visibleColumns.includes('engagement') && <td className="px-2 py-3 text-center text-[13px] font-black" style={{ color: v('text-heading') }}>{formatNumber((video.likes || 0) + (video.comments || 0))}</td>}
                  </tr>

                  {/* Expanded drill-down row — only renders for clicked video */}
                  {expandedVideoId === video.id && (
                    <VideoDrillDown
                      video={video}
                      channelId={selectedChannel?.id}
                      dailyCache={dailyCache}
                      dailyLoading={dailyLoading}
                      fetchDailyData={fetchDailyData}
                      expandedMetric={expandedMetric}
                      setExpandedMetric={setExpandedMetric}
                      expandedDateFrom={expandedDateFrom}
                      setExpandedDateFrom={setExpandedDateFrom}
                      expandedDateTo={expandedDateTo}
                      setExpandedDateTo={setExpandedDateTo}
                      colSpan={totalCols}
                      formatNumber={formatNumber}
                      formatAvd={formatAvd}
                    />
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-5 flex items-center justify-between" style={{ borderTop: `1px solid ${v('border-light')}`, backgroundColor: v('bg-table-header') }}>
            <p className="text-[12px] font-bold" style={{ color: v('text-label') }}>
              Showing <span className="text-rose-500 font-black">{paginatedVideos.length}</span> of {filteredVideos.length} videos
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}
                className="p-2 rounded-xl transition-all border-2 disabled:opacity-30"
                style={{ color: v('text-secondary'), borderColor: v('border-card') }}>
                <ChevronLeft size={15} />
              </button>
              <span className="font-black text-[12px]">
                <span className="text-rose-500">{currentPage}</span>
                <span style={{ color: v('text-placeholder') }}> / </span>
                <span style={{ color: v('text-secondary') }}>{totalPages}</span>
              </span>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}
                className="p-2 rounded-xl transition-all border-2 disabled:opacity-30"
                style={{ color: v('text-secondary'), borderColor: v('border-card') }}>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
