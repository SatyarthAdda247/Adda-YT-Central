import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Loader2, Activity, Sun, Moon,
  TrendingUp as UpArrow, TrendingDown as DownArrow,
  ExternalLink, Settings2, CheckCircle2, Radio, Tv, Clapperboard,
  ChevronRight, ArrowLeft, ChevronLeft, Sparkles,
  Building2, MonitorPlay, Trophy, Search
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area
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

  // Channel tab
  const [channelSearch, setChannelSearch] = useState('');

  // Channel detail state
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);
  const [visibleColumns, setVisibleColumns] = useState(ALL_VIDEO_COLUMNS.filter(c => c.default).map(c => c.id));
  const [showConfig, setShowConfig] = useState(false);
  const [videoTypeFilter, setVideoTypeFilter] = useState({ Video: true, Shorts: true, Live: true });
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 15;

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

  const filteredChannels = allChannels.filter(ch =>
    ch.name.toLowerCase().includes(channelSearch.toLowerCase()) ||
    ch.business.toLowerCase().includes(channelSearch.toLowerCase()) ||
    ch.category.toLowerCase().includes(channelSearch.toLowerCase())
  );

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
    fetchData(channel.id, days);
  };

  const handleChannelTabClick = (channel) => {
    setSelectedChannel(channel);
    setMainTab('channel-detail-standalone');
    fetchData(channel.id, days);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      setBusinessView('list'); setBreadcrumbs([]);
      setSelectedBusiness(null); setSelectedCategory(null); setSelectedChannel(null);
      setProfile(null); setAnalytics(null);
    } else if (index === 0) {
      setBusinessView('categories'); setBreadcrumbs(prev => prev.slice(0, 1));
      setSelectedCategory(null); setSelectedChannel(null); setProfile(null); setAnalytics(null);
    } else if (index === 1) {
      setBusinessView('channels'); setBreadcrumbs(prev => prev.slice(0, 2));
      setSelectedChannel(null); setProfile(null); setAnalytics(null);
    }
  };

  // Data fetching
  const fetchData = async (cid, queryDays = 30) => {
    if (!cid || cid.startsWith('UC_dummy')) {
      setProfile({
        identity: { name: 'Demo Channel', id: cid, custom_url: 'demo', thumbnail_url: '', country: 'IN', description: 'Dummy channel data' },
        stats: { subscribers_actual: 42000, subscribers_rounded: 42000, total_views: 1800000, total_videos: 220 }
      });
      setAnalytics({ summary: { video_master_table: [], daily_performance: [], traffic_sources: [] } });
      setLoading(false);
      return;
    }
    setLoading(true); setError(null);
    try {
      const [profRes, ananRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/yt/channel/${cid}`),
        axios.get(`${API_BASE_URL}/yt/analytics/${cid}?days=${queryDays}`)
      ]);
      setProfile(profRes.data); setAnalytics(ananRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reach backend.");
    } finally { setLoading(false); }
  };

  const toggleColumn = (id) => setVisibleColumns(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  const toggleVideoType = (type) => setVideoTypeFilter(prev => ({ ...prev, [type]: !prev[type] }));
  const handleDaysChange = (newDays) => { setDays(newDays); if (selectedChannel) fetchData(selectedChannel.id, newDays); };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    const n = Number(num);
    if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0m';
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const prepareChartData = (rows) => {
    if (!rows) return [];
    return rows.map(row => ({ date: row[0], views: row[1], watchTime: row[3] / 60, subs: (row[5] || 0) - (row[6] || 0) }));
  };

  const filteredVideos = analytics?.summary?.video_master_table?.filter(v => videoTypeFilter[v.videoType]) || [];
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
                  onClick={() => { setMainTab(tab.id); setBusinessView('list'); setBreadcrumbs([]); setProfile(null); setAnalytics(null); }}
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
            {isChannelDetailView && (
              <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: v('bg-input') }}>
                {[1, 7, 30, 90].map((d) => (
                  <button key={d} onClick={() => handleDaysChange(d)}
                    className="px-3 py-1.5 text-[10px] font-bold rounded-md transition-all"
                    style={{
                      backgroundColor: days === d ? v('accent') : 'transparent',
                      color: days === d ? '#ffffff' : v('text-secondary'),
                    }}>
                    {d === 1 ? 'Latest' : `${d}D`}
                  </button>
                ))}
              </div>
            )}
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
              <ChannelDetail profile={profile} analytics={analytics} loading={loading}
                days={days} filteredVideos={filteredVideos} paginatedVideos={paginatedVideos}
                currentPage={currentPage} totalPages={totalPages} videosPerPage={videosPerPage}
                visibleColumns={visibleColumns} showConfig={showConfig} videoTypeFilter={videoTypeFilter}
                setCurrentPage={setCurrentPage} setShowConfig={setShowConfig}
                toggleColumn={toggleColumn} toggleVideoType={toggleVideoType}
                formatNumber={formatNumber} formatTime={formatTime} prepareChartData={prepareChartData} />
            )}
          </>
        )}

        {/* ===================== CHANNEL TAB ===================== */}
        {mainTab === 'channel' && (
          <div className="rounded-xl overflow-hidden transition-colors" style={{ backgroundColor: v('bg-card'), border: `1px solid ${v('border-card')}`, boxShadow: v('card-shadow') }}>
            <div className="p-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${v('border-light')}` }}>
              <div>
                <h2 className="text-lg font-bold" style={{ color: v('text-heading') }}>All Channels</h2>
                <p className="text-xs mt-0.5" style={{ color: v('text-label') }}>Complete channel listing across all business units</p>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: v('text-placeholder') }} />
                <input type="text" placeholder="Search channels..." value={channelSearch} onChange={e => setChannelSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 w-64 transition-colors"
                  style={{ backgroundColor: v('bg-input'), border: `1px solid ${v('border-card')}`, color: v('text-body') }} />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: v('bg-table-header') }}>
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: v('text-table-header') }}>#</th>
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: v('text-table-header') }}>Channel</th>
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: v('text-table-header') }}>Business</th>
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: v('text-table-header') }}>Category</th>
                    {DATA_COLUMNS.map(col => (
                      <th key={col.key} className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider" style={{ color: v('text-table-header') }}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredChannels.length === 0 ? (
                    <tr><td colSpan={4 + DATA_COLUMNS.length} className="px-5 py-12 text-center text-sm" style={{ color: v('text-label') }}>
                      {allChannels.length === 0 ? 'No channels mapped yet. Channels will appear once mapped to categories.' : 'No matching channels found.'}
                    </td></tr>
                  ) : filteredChannels.map((ch, idx) => (
                    <tr key={ch.id} onClick={() => handleChannelTabClick(ch)}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: `1px solid ${v('border-table')}` }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = v('bg-table-row-hover')}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td className="px-5 py-3.5 text-sm font-medium" style={{ color: v('row-number') }}>{idx + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {ch.thumbnail ? <img src={ch.thumbnail} className="w-8 h-8 rounded-lg object-cover" /> :
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: v('bg-input'), color: v('text-label') }}><MonitorPlay size={14} /></div>}
                          <span className="text-sm font-semibold" style={{ color: v('text-heading') }}>{ch.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium" style={{ color: v('text-body') }}>{ch.business}</td>
                      <td className="px-5 py-3.5 text-sm font-medium" style={{ color: v('text-body') }}>{ch.category}</td>
                      {DATA_COLUMNS.map(col => (
                        <td key={col.key} className="px-5 py-3.5 text-center text-sm font-semibold" style={{ color: v('text-body') }}>{ch[col.key] || '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== TEACHER TAB ===================== */}
        {mainTab === 'teacher' && (
          <div className="rounded-xl overflow-hidden transition-colors" style={{ backgroundColor: v('bg-card'), border: `1px solid ${v('border-card')}`, boxShadow: v('card-shadow') }}>
            <div className="p-5" style={{ borderBottom: `1px solid ${v('border-light')}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: v('text-heading') }}>
                    <Trophy size={18} className="text-amber-500" /> Teacher Leaderboard
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: v('text-label') }}>Faculty performance based on video analytics · Data from CURL API mapping</p>
                </div>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider">Coming Soon</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: v('bg-table-header') }}>
                    {['Rank', 'Teacher', 'Channel', 'Videos', 'Total Views', 'Watch Time (H)', 'Net Subs', 'Avg Views/Video'].map((h, i) => (
                      <th key={h} className={`px-5 py-3 text-[10px] font-bold uppercase tracking-wider ${i < 3 ? 'text-left' : 'text-center'}`} style={{ color: v('text-table-header') }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr><td colSpan={8} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Trophy size={40} style={{ color: v('border-card') }} />
                      <p className="text-sm font-semibold" style={{ color: v('text-secondary') }}>Teacher leaderboard will be available once CURL API integration and BQ pipeline is connected.</p>
                      <p className="text-xs" style={{ color: v('text-label') }}>Faculty mapped via video_id from the admin scheduling system</p>
                    </div>
                  </td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== STANDALONE CHANNEL DETAIL ===================== */}
        {mainTab === 'channel-detail-standalone' && (
          <ChannelDetail profile={profile} analytics={analytics} loading={loading}
            days={days} filteredVideos={filteredVideos} paginatedVideos={paginatedVideos}
            currentPage={currentPage} totalPages={totalPages} videosPerPage={videosPerPage}
            visibleColumns={visibleColumns} showConfig={showConfig} videoTypeFilter={videoTypeFilter}
            setCurrentPage={setCurrentPage} setShowConfig={setShowConfig}
            toggleColumn={toggleColumn} toggleVideoType={toggleVideoType}
            formatNumber={formatNumber} formatTime={formatTime} prepareChartData={prepareChartData} />
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
// CHANNEL DETAIL COMPONENT
// ============================================================
function ChannelDetail({ profile, analytics, loading, days, filteredVideos, paginatedVideos,
  currentPage, totalPages, videosPerPage, visibleColumns, showConfig, videoTypeFilter,
  setCurrentPage, setShowConfig, toggleColumn, toggleVideoType,
  formatNumber, formatTime, prepareChartData }) {

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-pulse">
        <Loader2 size={48} className="animate-spin text-rose-500 mb-4" />
        <p className="text-[14px] font-bold tracking-widest uppercase" style={{ color: v('text-label') }}>Syncing Intel...</p>
      </div>
    );
  }
  if (!profile) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Channel Header - Premium Glass Card */}
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
            { label: 'Subscribers', val: formatNumber(profile.stats.subscribers_actual), color: 'text-rose-500' },
            { label: 'Total Views', val: formatNumber(profile.stats.total_views), color: 'text-slate-800 dark:text-white' },
            { label: 'Active Videos', val: formatNumber(profile.stats.total_videos), color: 'text-slate-800 dark:text-white' },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-5 text-center min-w-[120px] transition-all border group hover:border-rose-200 dark:hover:border-rose-500/30"
              style={{ backgroundColor: v('bg-input'), border: `1px solid ${v('border-card')}` }}>
              <p className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: v('text-label') }}>{stat.label}</p>
              <p className={`text-2xl font-black mt-2 tracking-tight ${stat.color}`}>{stat.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Video Table Container */}
      <div className="rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 border" 
        style={{ backgroundColor: v('bg-card'), borderColor: v('border-card') }}>
        
        <div className="px-8 py-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8" style={{ borderBottom: `1px solid ${v('border-light')}` }}>
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3" style={{ color: v('text-heading') }}>
              Live Performance Data <Sparkles size={20} className="text-amber-400" />
            </h2>
            <p className="text-[13px] font-bold mt-1.5" style={{ color: v('text-label') }}>
              Analyzing <span className="text-rose-500">{filteredVideos.length} assets</span> within the <span className="text-slate-800 dark:text-slate-200 font-black">{days === 1 ? 'Last 24 Hours' : `Last ${days} Days`}</span> window
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-1.5 rounded-xl flex gap-1.5" style={{ backgroundColor: v('bg-input') }}>
              {[
                { type: 'Video', icon: Clapperboard, label: 'Videos' },
                { type: 'Shorts', icon: Radio, label: 'Shorts' },
                { type: 'Live', icon: Tv, label: 'Live' },
              ].map(({ type, icon: VIcon, label }) => (
                <button key={type} onClick={() => { toggleVideoType(type); setCurrentPage(1); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all"
                  style={{
                    backgroundColor: videoTypeFilter[type] ? v('accent') : 'transparent',
                    color: videoTypeFilter[type] ? '#ffffff' : v('text-secondary'),
                    boxShadow: videoTypeFilter[type] ? '0 8px 20px -6px rgba(225,29,72,0.4)' : 'none',
                  }}>
                  <VIcon size={14} /> {label}
                </button>
              ))}
            </div>

            <div className="relative">
              <button onClick={() => setShowConfig(!showConfig)}
                className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] transition-all border-2"
                style={{ backgroundColor: v('bg-card'), color: v('text-primary'), borderColor: v('border-card') }}>
                <Settings2 size={15} /> Metrices
              </button>
              {showConfig && (
                <div className="absolute right-0 mt-3 rounded-2xl p-6 w-64 z-[110] glass-effect shadow-2xl border transition-all animate-fade-in"
                  style={{ backgroundColor: v('bg-card'), borderColor: v('border-card') }}>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: v('text-label') }}>Configure Display</h3>
                  <div className="space-y-1.5">
                    {ALL_VIDEO_COLUMNS.map(col => (
                      <label key={col.id} className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <input type="checkbox" checked={visibleColumns.includes(col.id)} onChange={() => toggleColumn(col.id)}
                          className="w-4 h-4 rounded-md accent-rose-500 border-gray-300" />
                        <span className="text-[11px] font-bold uppercase"
                          style={{ color: visibleColumns.includes(col.id) ? v('accent') : v('text-secondary') }}>{col.label}</span>
                      </label>
                    ))}
                  </div>
                  <button onClick={() => setShowConfig(false)} className="mt-6 w-full py-2.5 bg-rose-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20">Apply Changes</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: v('bg-table-header') }}>
                <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-widest" style={{ color: v('text-table-header') }}>#</th>
                <th className="px-6 py-5 text-left text-[11px] font-black uppercase tracking-widest min-w-[320px]" style={{ color: v('text-table-header') }}>Production Instance</th>
                {visibleColumns.map(id => (
                  <th key={id} className="px-6 py-5 text-center text-[11px] font-black uppercase tracking-widest" style={{ color: v('text-table-header') }}>
                    {ALL_VIDEO_COLUMNS.find(c => c.id === id)?.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ divideColor: v('border-light') }}>
              {paginatedVideos.map((video, idx) => (
                <tr key={video.id} className="transition-all duration-300 group hover:z-10"
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = v('bg-table-row-hover')}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td className="px-6 py-6 text-[13px] font-black" style={{ color: v('row-number') }}>{String((currentPage - 1) * videosPerPage + idx + 1).padStart(2, '0')}</td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-5">
                      <div className="relative shrink-0 group/thumb">
                        <div className="absolute -inset-0.5 bg-rose-500 rounded-lg opacity-0 group-hover/thumb:opacity-20 blur-sm transition-opacity"></div>
                        <img src={video.thumbnail} className="relative w-[100px] h-[56px] rounded-lg object-cover shadow-sm ring-1 ring-black/5" />
                        <a href={`https://youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer"
                          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-all bg-black/40 rounded-lg backdrop-blur-[2px]">
                          <ExternalLink size={18} className="text-white" />
                        </a>
                      </div>
                      <div className="space-y-1.5 overflow-hidden">
                        <h4 className="text-[14px] font-black leading-tight group-hover:text-rose-500 transition-colors truncate" style={{ color: v('text-heading') }}>{video.title}</h4>
                        <div className="flex items-center gap-3">
                          <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: v('text-label') }}>
                            {new Date(video.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md border tracking-tighter ${
                            video.videoType === 'Shorts' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-200'
                            : video.videoType === 'Live' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 border-rose-200'
                            : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200'
                          }`}>{video.videoType}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  {visibleColumns.includes('views') && <td className="px-6 py-6 text-center text-[15px] font-black" style={{ color: v('text-heading') }}>{formatNumber(video.views)}</td>}
                  {visibleColumns.includes('watchTime') && <td className="px-6 py-6 text-center text-[14px] font-bold" style={{ color: v('text-body') }}>{formatNumber(video.watchTimeMins / 60)}h</td>}
                  {visibleColumns.includes('avd') && <td className="px-6 py-6 text-center text-[14px] font-bold" style={{ color: v('text-body') }}>{formatTime(video.avd)}</td>}
                  {visibleColumns.includes('subsGained') && <td className="px-6 py-6 text-center font-black text-emerald-500 text-[14px]">+{video.subsGained}</td>}
                  {visibleColumns.includes('subsLost') && <td className="px-6 py-6 text-center font-black text-rose-500 text-[14px]">-{video.subsLost}</td>}
                  {visibleColumns.includes('netSubs') && (
                    <td className="px-6 py-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 font-black px-3 py-1.5 rounded-xl text-[11px] ${
                        video.netSubs >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600'
                      }`}>
                        {video.netSubs >= 0 ? <UpArrow size={10} /> : <DownArrow size={10} />} {Math.abs(video.netSubs)}
                      </span>
                    </td>
                  )}
                  {visibleColumns.includes('conv_ratio') && <td className="px-6 py-6 text-center font-black text-blue-500 text-[14px]">{video.conv_ratio}%</td>}
                  {visibleColumns.includes('likes') && <td className="px-6 py-6 text-center text-[14px] font-bold" style={{ color: v('text-body') }}>{formatNumber(video.likes)}</td>}
                  {visibleColumns.includes('comments') && <td className="px-6 py-6 text-center text-[14px] font-bold" style={{ color: v('text-body') }}>{formatNumber(video.comments)}</td>}
                  {visibleColumns.includes('sharing') && <td className="px-6 py-6 text-center text-[14px] font-bold" style={{ color: v('text-body') }}>{formatNumber(video.shares || 0)}</td>}
                  {visibleColumns.includes('engagement') && <td className="px-6 py-6 text-center text-[15px] font-black" style={{ color: v('text-heading') }}>{formatNumber((video.likes || 0) + (video.comments || 0))}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination - Premium Footer */}
        {totalPages > 1 && (
          <div className="px-8 py-6 flex items-center justify-between" style={{ borderTop: `1px solid ${v('border-light')}`, backgroundColor: v('bg-table-header') }}>
            <p className="text-[12px] font-bold" style={{ color: v('text-label') }}>
              Showing <span className="text-rose-500 font-black">{paginatedVideos.length}</span> of {filteredVideos.length} recordings
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}
                className="p-2.5 rounded-xl transition-all border-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-800"
                style={{ color: v('text-secondary'), borderColor: v('border-card') }}>
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1.5 px-4 font-black text-[12px]">
                <span className="text-rose-500">{currentPage}</span>
                <span style={{ color: v('text-placeholder') }}>/</span>
                <span style={{ color: v('text-secondary') }}>{totalPages}</span>
              </div>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl transition-all border-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-800"
                style={{ color: v('text-secondary'), borderColor: v('border-card') }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Insights - Charts */}
      {analytics?.summary?.daily_performance?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 rounded-2xl p-8 h-[380px] transition-all relative overflow-hidden"
            style={{ backgroundColor: v('bg-card'), border: `1px solid ${v('border-card')}`, boxShadow: v('card-shadow') }}>
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <TrendingUp size={120} strokeWidth={1} />
            </div>
            <h3 className="text-lg font-black tracking-tight mb-8" style={{ color: v('text-heading') }}>Daily Engagement Velocity</h3>
            <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={prepareChartData(analytics.summary.daily_performance)}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} /><stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={v('border-table')} />
                <XAxis dataKey="date" tickFormatter={(t) => t.substring(5)} axisLine={false} tickLine={false} tick={{ fill: v('text-label'), fontSize: 10, fontWeight: '800' }} />
                <YAxis tickFormatter={formatNumber} axisLine={false} tickLine={false} tick={{ fill: v('text-label'), fontSize: 10, fontWeight: '800' }} />
                <Area type="monotone" dataKey="views" stroke="#f43f5e" strokeWidth={3} fill="url(#colorViews)" />
                <RechartsTooltip contentStyle={{ backgroundColor: v('bg-card'), border: `1px solid ${v('border-card')}`, borderRadius: '16px', color: v('text-heading'), fontSize: '12px', fontWeight: '800', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', backdropFilter: 'blur(10px)' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl p-8 flex flex-col justify-between transition-all"
            style={{ backgroundColor: v('bg-card'), border: `1px solid ${v('border-card')}`, boxShadow: v('card-shadow') }}>
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em]" style={{ color: v('accent') }}>Traffic Sources</h3>
                <Activity size={16} className="text-slate-400" />
              </div>
              <div className="space-y-6">
                {analytics.summary.traffic_sources?.slice(0, 5).map((source, i) => (
                  <div key={i} className="group/src">
                    <div className="flex justify-between text-[11px] font-black uppercase mb-2">
                      <span className="group-hover/src:text-rose-500 transition-colors" style={{ color: v('text-body') }}>{source[0].replace(/_/g, ' ')}</span>
                      <span style={{ color: v('text-secondary') }}>{((source[1] / (analytics.summary.daily_performance?.reduce((a, r) => a + r[1], 0) || 1)) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: v('bg-input') }}>
                      <div className="h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ 
                          backgroundColor: v('accent'), 
                          width: `${analytics.summary.traffic_sources[0][1] > 0 ? (source[1] / analytics.summary.traffic_sources[0][1]) * 100 : 0}%`,
                          boxShadow: '0 0 10px rgba(225,29,72,0.3)'
                        }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 pt-6 flex items-center gap-4 border-t" style={{ borderColor: v('border-light') }}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: v('bg-input') }}>
                <MonitorPlay size={18} style={{ color: v('accent') }} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: v('text-label') }}>Sync Status</p>
                <p className="text-sm font-black" style={{ color: v('text-heading') }}>Live Intelligence Active</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
