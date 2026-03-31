import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, Eye, Activity,
  PlayCircle, Loader2,
  TrendingUp, TrendingDown, Clock, Sparkles, TrendingUp as UpArrow, TrendingDown as DownArrow,
  ExternalLink, Settings2, CheckCircle2, Radio, Tv, Clapperboard,
  ChevronRight, ArrowLeft, Building2, FolderOpen, MonitorPlay, Video,
  ChevronLeft
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const API_BASE_URL = 'http://localhost:8000';

// ============================================================
// HIERARCHY DATA — Business & Category mapping (hardcoded)
// Channel-to-Category mapping will come from Admin panel
// ============================================================
const HIERARCHY = {
  businesses: [
    { id: 'NATIONAL', name: 'National', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
    { id: 'STATE', name: 'State', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
    { id: 'VERNAC', name: 'Vernacular', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
    { id: 'K12', name: 'K12', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
    { id: 'UPSC', name: 'UPSC', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
    { id: 'CA', name: 'CA', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
    { id: 'Skilling_HE', name: 'SHE', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
    { id: 'OFFLINE BATCH', name: 'Offline Batch', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
  ],
  categories: {
    'NATIONAL': [
      { id: 'AGRICULTURE', name: 'Agriculture', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'BANKING', name: 'Banking', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'CAIIB_Bank Promotion', name: 'CAIIB / Bank Promotion', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'CTET', name: 'CTET', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'DEFENCE', name: 'Defence', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'ENGINEERING', name: 'Engineering', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'FCI', name: 'FCI', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'GATE', name: 'GATE', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'INSURANCE', name: 'Insurance', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'IPM', name: 'IPM', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'JAIIB', name: 'JAIIB', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'JAIIB_CAIIB', name: 'JAIIB & CAIIB', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'RAILWAYS', name: 'Railways', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'REGULATORY_BODIES', name: 'Regulatory Bodies', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'SSC', name: 'SSC', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'UGC_NET', name: 'UGC NET', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'CSIR_NET', name: 'CSIR NET', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'NURSING', name: 'Nursing', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'LIFE_SCIENCES', name: 'Life Sciences', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'MATHEMATICAL_SCIENCES', name: 'Mathematical Sciences', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'BIHAR', name: 'Bihar', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'BIHAR TEACHING', name: 'Bihar Teaching', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'NORTH_EAST_STATE_EXAMS', name: 'North East State Exams', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
    ],
    'STATE': [
      { id: 'CHHATTISGARH', name: 'Chhattisgarh', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'GUJARAT', name: 'Gujarat', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'HARYANA', name: 'Haryana', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'JHARKHAND', name: 'Jharkhand', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'MADHYA_PRADESH', name: 'Madhya Pradesh', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'MAHARASHTRA', name: 'Maharashtra', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'RAJASTHAN', name: 'Rajasthan', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'UTTAR_PRADESH', name: 'Uttar Pradesh', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'UTTARAKHAND', name: 'Uttarakhand', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
    ],
    'VERNAC': [
      { id: 'ANDHRA_PRADESH', name: 'Andhra Pradesh', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'KERALA', name: 'Kerala', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'ODISHA_STATE_EXAMS', name: 'Odisha State Exams', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'TAMIL_NADU', name: 'Tamil Nadu', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'WEST_BENGAL', name: 'West Bengal', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'PUNJAB_STATE_EXAMS', name: 'Punjab State Exams', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
    ],
    'K12': [
      { id: 'CLASS_10', name: 'Class 10', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'CLASS_11', name: 'Class 11', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'CLASS_12', name: 'Class 12', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'CUET', name: 'CUET', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'CUET_HINDI', name: 'CUET Hindi', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'CUET_PG', name: 'CUET PG', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'IITJEE', name: 'IIT JEE', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'IITNEET', name: 'IIT NEET', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'LAW', name: 'Law', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'UG_DEFENCE', name: 'UG Defence', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'NEET', name: 'NEET', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'NEET_HINDI', name: 'NEET Hindi', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
    ],
    'UPSC': [
      { id: 'UPSC_BANK', name: 'UPSC Bank', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'JUDICIARY', name: 'Judiciary', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'UPSC', name: 'UPSC', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
    ],
    'CA': [
      { id: 'CA_FOUNDATION', name: 'CA Foundation', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'CA_INTERMEDIATE', name: 'CA Intermediate', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'CA_FINAL', name: 'CA Final', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
    ],
    'Skilling_HE': [
      { id: 'BFSI', name: 'BFSI', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'SKILLS', name: 'Skills', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'APTITUDE_INTERVIEW_PREP', name: 'Aptitude & Interview Prep', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'TECH_SKILLS_CODING', name: 'Tech Skills & Coding', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'Prep+Online_Degree', name: 'Prep + Online Degree', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'Online_Degree', name: 'Online Degree', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'SKILL_BOOSTER', name: 'Skill Booster', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
    ],
    'OFFLINE BATCH': [
      { id: 'OFFLINE BATCH', name: 'Offline Batch', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
      { id: 'CUET OFFLINE', name: 'CUET Offline', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
    ],
  },
  // Channels per category — empty for now, will be populated via Admin drag-drop
  channels: {
    'AGRICULTURE': [],
    'BANKING': [],
    'CAIIB_Bank Promotion': [],
    'CTET': [],
    'DEFENCE': [],
    'ENGINEERING': [],
    'FCI': [],
    'GATE': [],
    'INSURANCE': [],
    'IPM': [],
    'JAIIB': [],
    'JAIIB_CAIIB': [],
    'RAILWAYS': [],
    'REGULATORY_BODIES': [],
    'SSC': [],
    'UGC_NET': [],
    'CSIR_NET': [],
    'NURSING': [],
    'LIFE_SCIENCES': [],
    'MATHEMATICAL_SCIENCES': [],
    'BIHAR': [],
    'BIHAR TEACHING': [],
    'NORTH_EAST_STATE_EXAMS': [],
    'CHHATTISGARH': [],
    'GUJARAT': [],
    'HARYANA': [],
    'JHARKHAND': [],
    'MADHYA_PRADESH': [],
    'MAHARASHTRA': [],
    'RAJASTHAN': [],
    'UTTAR_PRADESH': [],
    'UTTARAKHAND': [],
    'ANDHRA_PRADESH': [],
    'KERALA': [],
    'ODISHA_STATE_EXAMS': [],
    'TAMIL_NADU': [],
    'WEST_BENGAL': [],
    'PUNJAB_STATE_EXAMS': [],
    'CLASS_10': [],
    'CLASS_11': [],
    'CLASS_12': [],
    'CUET': [],
    'CUET_HINDI': [],
    'CUET_PG': [],
    'IITJEE': [],
    'IITNEET': [],
    'LAW': [],
    'UG_DEFENCE': [],
    'NEET': [],
    'NEET_HINDI': [],
    'UPSC_BANK': [],
    'JUDICIARY': [],
    'UPSC': [],
    'CA_FOUNDATION': [],
    'CA_INTERMEDIATE': [],
    'CA_FINAL': [],
    'BFSI': [
      { id: 'UCx5IVi4ELn5Wt60RiT-HvBA', name: 'BFSI Career247 Official', d1: '-', d2: '-', d3: '-', d4: '-', d5: '-' },
    ],
    'SKILLS': [],
    'APTITUDE_INTERVIEW_PREP': [],
    'TECH_SKILLS_CODING': [],
    'Prep+Online_Degree': [],
    'Online_Degree': [],
    'SKILL_BOOSTER': [],
    'OFFLINE BATCH': [],
    'CUET OFFLINE': [],
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

// ============================================================
// REUSABLE COMPONENTS
// ============================================================

function HierarchyTable({ title, subtitle, icon: Icon, rows, columns, onRowClick, breadcrumbs, onBreadcrumbClick }) {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => onBreadcrumbClick(-1)} className="text-slate-500 hover:text-blue-400 font-bold transition-colors">Home</button>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              <ChevronRight size={14} className="text-slate-700" />
              <button
                onClick={() => onBreadcrumbClick(i)}
                className={`font-bold transition-colors ${i === breadcrumbs.length - 1 ? 'text-blue-400' : 'text-slate-500 hover:text-blue-400'}`}
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a1d23] to-[#12141a] rounded-3xl p-8 border border-[#2a2d35] flex items-center gap-4">
        <div className="bg-blue-600/20 p-3 rounded-2xl">
          <Icon size={28} className="text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">{title}</h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">{subtitle}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a1d23] rounded-3xl border border-[#2a2d35] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#2a2d35]">
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest w-12">#</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest min-w-[250px]">Name</th>
                {columns.map(col => (
                  <th key={col.key} className="px-6 py-5 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">{col.label}</th>
                ))}
                <th className="px-6 py-5 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2028]">
              {rows.map((row, idx) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick(row)}
                  className="hover:bg-[#22252d] transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-6 font-black text-slate-600 italic text-sm">{idx + 1}</td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      {row.thumbnail ? (
                        <img src={row.thumbnail} className="w-10 h-10 rounded-xl object-cover border border-[#2a2d35]" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-[#2a2d35] flex items-center justify-center text-slate-500">
                          <Icon size={18} />
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-black text-slate-200 group-hover:text-blue-400 transition-colors">{row.name}</h4>
                        {row.subtitle && <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">{row.subtitle}</p>}
                      </div>
                    </div>
                  </td>
                  {columns.map(col => (
                    <td key={col.key} className="px-6 py-6 text-center font-bold text-slate-400 text-sm">{row[col.key] || '-'}</td>
                  ))}
                  <td className="px-6 py-6 text-center">
                    <ChevronRight size={18} className="text-slate-700 group-hover:text-blue-400 transition-colors mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================

function App() {
  // Navigation state
  const [view, setView] = useState('businesses'); // businesses | categories | channels | channel-detail
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

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

  // Navigation handlers
  const handleBusinessClick = (business) => {
    setSelectedBusiness(business);
    setBreadcrumbs([{ name: business.name, type: 'business' }]);
    setView('categories');
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setBreadcrumbs(prev => [...prev.slice(0, 1), { name: category.name, type: 'category' }]);
    setView('channels');
  };

  const handleChannelClick = (channel) => {
    setSelectedChannel(channel);
    setBreadcrumbs(prev => [...prev.slice(0, 2), { name: channel.name, type: 'channel' }]);
    setView('channel-detail');
    fetchData(channel.id, days);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      setView('businesses');
      setBreadcrumbs([]);
      setSelectedBusiness(null);
      setSelectedCategory(null);
      setSelectedChannel(null);
      setProfile(null);
      setAnalytics(null);
    } else if (index === 0) {
      setView('categories');
      setBreadcrumbs(prev => prev.slice(0, 1));
      setSelectedCategory(null);
      setSelectedChannel(null);
      setProfile(null);
      setAnalytics(null);
    } else if (index === 1) {
      setView('channels');
      setBreadcrumbs(prev => prev.slice(0, 2));
      setSelectedChannel(null);
      setProfile(null);
      setAnalytics(null);
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
    setLoading(true);
    setError(null);
    try {
      const [profRes, ananRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/yt/channel/${cid}`),
        axios.get(`${API_BASE_URL}/yt/analytics/${cid}?days=${queryDays}`)
      ]);
      setProfile(profRes.data);
      setAnalytics(ananRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reach backend.");
    } finally {
      setLoading(false);
    }
  };

  const toggleColumn = (id) => setVisibleColumns(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  const toggleVideoType = (type) => setVideoTypeFilter(prev => ({ ...prev, [type]: !prev[type] }));
  const handleDaysChange = (newDays) => {
    setDays(newDays);
    if (selectedChannel) fetchData(selectedChannel.id, newDays);
  };

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

  // Pagination
  const filteredVideos = analytics?.summary?.video_master_table?.filter(v => videoTypeFilter[v.videoType]) || [];
  const totalPages = Math.ceil(filteredVideos.length / videosPerPage);
  const paginatedVideos = filteredVideos.slice((currentPage - 1) * videosPerPage, currentPage * videosPerPage);

  return (
    <div className="min-h-screen bg-[#0d0f12] text-slate-100 font-sans selection:bg-blue-900 pb-20">

      {/* --- TOP NAV --- */}
      <nav className="sticky top-0 z-50 bg-[#12141a]/90 backdrop-blur-xl border-b border-[#1e2028] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {view !== 'businesses' && (
              <button onClick={() => handleBreadcrumbClick(breadcrumbs.length - 2)} className="p-2 rounded-xl bg-[#1a1d23] border border-[#2a2d35] text-slate-400 hover:text-blue-400 transition-colors mr-2">
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="bg-red-600 p-2 rounded-lg shadow-lg shadow-red-900/30">
              <PlayCircle className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-red-500 uppercase">YT Central</h1>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest pl-0.5 italic">Mind Intelligence Engine</p>
            </div>
          </div>

          {view === 'channel-detail' && (
            <div className="flex items-center gap-4 bg-[#1a1d23] p-1.5 rounded-2xl border border-[#2a2d35]">
              {[1, 7, 30, 90].map((d) => (
                <button key={d} onClick={() => handleDaysChange(d)} className={`px-5 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${days === d ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/30' : 'text-slate-600 hover:text-slate-300'}`}>{d === 1 ? 'Latest' : `${d}D`}</button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-8">

        {/* Hierarchy Flow Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6 text-[10px] font-black uppercase tracking-[0.3em]">
          {[
            { label: 'Business', icon: Building2, active: view === 'businesses' },
            { label: 'Category', icon: FolderOpen, active: view === 'categories' },
            { label: 'Channel', icon: MonitorPlay, active: view === 'channels' },
            { label: 'Video', icon: Video, active: view === 'channel-detail' },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              {i > 0 && <ChevronRight size={12} className="text-slate-700" />}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${step.active ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-600'}`}>
                <step.icon size={12} />
                <span>{step.label}</span>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-rose-900/20 border border-rose-800/30 p-4 rounded-2xl flex items-center gap-4 text-rose-400 mb-8 font-bold text-sm"><Activity size={24} /> {error}</div>
        )}

        {/* ===================== BUSINESS LIST ===================== */}
        {view === 'businesses' && (
          <HierarchyTable
            title="Business Units"
            subtitle="Select a business unit to drill down"
            icon={Building2}
            rows={HIERARCHY.businesses}
            columns={DATA_COLUMNS}
            onRowClick={handleBusinessClick}
            breadcrumbs={[]}
            onBreadcrumbClick={handleBreadcrumbClick}
          />
        )}

        {/* ===================== CATEGORY LIST ===================== */}
        {view === 'categories' && selectedBusiness && (
          <HierarchyTable
            title={selectedBusiness.name}
            subtitle="Categories under this business unit"
            icon={FolderOpen}
            rows={HIERARCHY.categories[selectedBusiness.id] || []}
            columns={DATA_COLUMNS}
            onRowClick={handleCategoryClick}
            breadcrumbs={breadcrumbs}
            onBreadcrumbClick={handleBreadcrumbClick}
          />
        )}

        {/* ===================== CHANNEL LIST ===================== */}
        {view === 'channels' && selectedCategory && (
          <HierarchyTable
            title={selectedCategory.name}
            subtitle="Channels under this category"
            icon={MonitorPlay}
            rows={HIERARCHY.channels[selectedCategory.id] || []}
            columns={DATA_COLUMNS}
            onRowClick={handleChannelClick}
            breadcrumbs={breadcrumbs}
            onBreadcrumbClick={handleBreadcrumbClick}
          />
        )}

        {/* ===================== CHANNEL DETAIL ===================== */}
        {view === 'channel-detail' && (
          <div className="space-y-8">

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm">
              <button onClick={() => handleBreadcrumbClick(-1)} className="text-slate-500 hover:text-blue-400 font-bold transition-colors">Home</button>
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-2">
                  <ChevronRight size={14} className="text-slate-700" />
                  <button onClick={() => handleBreadcrumbClick(i)} className={`font-bold transition-colors ${i === breadcrumbs.length - 1 ? 'text-blue-400' : 'text-slate-500 hover:text-blue-400'}`}>{crumb.name}</button>
                </span>
              ))}
            </div>

            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={40} className="animate-spin text-blue-400" />
              </div>
            )}

            {profile && !loading && (
              <>
                {/* Channel Header */}
                <div className="bg-gradient-to-br from-[#1a1d23] to-[#12141a] rounded-3xl p-8 border border-[#2a2d35] flex flex-col md:flex-row items-center gap-8">
                  {profile.identity.thumbnail_url && (
                    <img src={profile.identity.thumbnail_url} className="w-28 h-28 rounded-3xl border-4 border-[#2a2d35] object-cover" />
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-black text-white">{profile.identity.name}</h2>
                      <CheckCircle2 className="text-blue-400" size={22} />
                    </div>
                    <p className="text-blue-400 font-bold text-sm">@{profile.identity.custom_url}</p>
                    <p className="text-slate-500 text-xs line-clamp-2">{profile.identity.description}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#0d0f12] rounded-2xl p-4 border border-[#2a2d35] text-center">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Subscribers</p>
                      <p className="text-xl font-black text-white mt-1">{formatNumber(profile.stats.subscribers_actual)}</p>
                    </div>
                    <div className="bg-[#0d0f12] rounded-2xl p-4 border border-[#2a2d35] text-center">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Views</p>
                      <p className="text-xl font-black text-white mt-1">{formatNumber(profile.stats.total_views)}</p>
                    </div>
                    <div className="bg-[#0d0f12] rounded-2xl p-4 border border-[#2a2d35] text-center">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Videos</p>
                      <p className="text-xl font-black text-white mt-1">{formatNumber(profile.stats.total_videos)}</p>
                    </div>
                  </div>
                </div>

                {/* Video Table */}
                <div className="bg-[#1a1d23] rounded-3xl border border-[#2a2d35] overflow-hidden">
                  <div className="p-6 border-b border-[#2a2d35] flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <h2 className="text-xl font-black text-white flex items-center gap-3">Video Analytics <Sparkles size={20} className="text-amber-400" /></h2>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mt-1">{days === 1 ? 'Latest Day' : `Last ${days} Days`} | {filteredVideos.length} videos</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {[
                        { type: 'Video', icon: Clapperboard, label: 'Videos' },
                        { type: 'Shorts', icon: Radio, label: 'Shorts' },
                        { type: 'Live', icon: Tv, label: 'Live' },
                      ].map(({ type, icon: Icon, label }) => (
                        <button key={type} onClick={() => { toggleVideoType(type); setCurrentPage(1); }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all border ${videoTypeFilter[type] ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'bg-[#2a2d35] text-slate-600 border-[#3a3d45]'}`}>
                          <Icon size={12} /> {label}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <button onClick={() => setShowConfig(!showConfig)}
                        className="flex items-center gap-2 bg-[#2a2d35] hover:bg-[#3a3d45] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all text-slate-400 border border-[#3a3d45]">
                        <Settings2 size={14} /> Columns
                      </button>
                      {showConfig && (
                        <div className="absolute right-0 top-12 bg-[#1a1d23] border border-[#2a2d35] shadow-2xl shadow-black/50 rounded-2xl p-5 w-64 z-50">
                          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Visible Metrics</h3>
                          {ALL_VIDEO_COLUMNS.map(col => (
                            <label key={col.id} className="flex items-center gap-3 p-1.5 hover:bg-[#2a2d35] rounded-lg cursor-pointer">
                              <input type="checkbox" checked={visibleColumns.includes(col.id)} onChange={() => toggleColumn(col.id)}
                                className="w-3.5 h-3.5 rounded bg-[#2a2d35] text-blue-500 border-[#3a3d45]" />
                              <span className={`text-[10px] font-bold uppercase tracking-tighter ${visibleColumns.includes(col.id) ? 'text-blue-400' : 'text-slate-500'}`}>{col.label}</span>
                            </label>
                          ))}
                          <button onClick={() => setShowConfig(false)} className="mt-3 w-full text-center text-[10px] font-black text-blue-400 uppercase">Done</button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-[#2a2d35]">
                          <th className="px-5 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">#</th>
                          <th className="px-5 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest min-w-[300px]">Video</th>
                          {visibleColumns.map(id => (
                            <th key={id} className="px-5 py-4 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
                              {ALL_VIDEO_COLUMNS.find(c => c.id === id)?.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e2028]">
                        {paginatedVideos.map((video, idx) => (
                          <tr key={video.id} className="hover:bg-[#22252d] transition-colors group">
                            <td className="px-5 py-5 font-black text-slate-600 italic text-sm">{(currentPage - 1) * videosPerPage + idx + 1}</td>
                            <td className="px-5 py-5">
                              <div className="flex items-center gap-4">
                                <div className="relative shrink-0">
                                  <img src={video.thumbnail} className="w-20 h-12 rounded-lg object-cover border border-[#2a2d35] group-hover:border-blue-500/30 transition-all" />
                                  <a href={`https://youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer"
                                    className="absolute -top-1.5 -right-1.5 bg-[#2a2d35] p-0.5 rounded text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-400">
                                    <ExternalLink size={10} />
                                  </a>
                                </div>
                                <div>
                                  <h4 className="text-xs font-black text-slate-200 line-clamp-1 group-hover:text-blue-400">{video.title}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{new Date(video.publishedAt).toLocaleDateString()}</p>
                                    <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${video.videoType === 'Shorts' ? 'bg-amber-900/30 text-amber-400' : video.videoType === 'Live' ? 'bg-rose-900/30 text-rose-400' : 'bg-blue-900/30 text-blue-400'}`}>{video.videoType}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            {visibleColumns.includes('views') && <td className="px-5 py-5 text-center font-black text-slate-200 text-sm">{formatNumber(video.views)}</td>}
                            {visibleColumns.includes('watchTime') && <td className="px-5 py-5 text-center font-bold text-slate-400 text-sm">{formatNumber(video.watchTimeMins / 60)}h</td>}
                            {visibleColumns.includes('avd') && <td className="px-5 py-5 text-center font-bold text-slate-300 text-sm">{formatTime(video.avd)}</td>}
                            {visibleColumns.includes('subsGained') && <td className="px-5 py-5 text-center font-bold text-emerald-400 text-sm">+{video.subsGained}</td>}
                            {visibleColumns.includes('subsLost') && <td className="px-5 py-5 text-center font-bold text-rose-400 text-sm">-{video.subsLost}</td>}
                            {visibleColumns.includes('netSubs') && (
                              <td className="px-5 py-5 text-center">
                                <span className={`inline-flex items-center gap-1 font-black px-2 py-0.5 rounded text-xs ${video.netSubs >= 0 ? 'bg-emerald-900/30 text-emerald-400' : 'bg-rose-900/30 text-rose-400'}`}>
                                  {video.netSubs >= 0 ? <UpArrow size={10} /> : <DownArrow size={10} />} {Math.abs(video.netSubs)}
                                </span>
                              </td>
                            )}
                            {visibleColumns.includes('conv_ratio') && <td className="px-5 py-5 text-center font-black text-blue-400 text-sm">{video.conv_ratio}%</td>}
                            {visibleColumns.includes('likes') && <td className="px-5 py-5 text-center font-bold text-slate-400 text-sm">{formatNumber(video.likes)}</td>}
                            {visibleColumns.includes('comments') && <td className="px-5 py-5 text-center font-bold text-slate-400 text-sm">{formatNumber(video.comments)}</td>}
                            {visibleColumns.includes('sharing') && <td className="px-5 py-5 text-center font-bold text-slate-400 text-sm">{formatNumber(video.shares || 0)}</td>}
                            {visibleColumns.includes('engagement') && <td className="px-5 py-5 text-center font-black text-slate-300 text-sm">{formatNumber((video.likes || 0) + (video.comments || 0))}</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="p-4 border-t border-[#2a2d35] flex justify-between items-center">
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        Page {currentPage} of {totalPages} | {filteredVideos.length} videos
                      </p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                          className="p-2 rounded-lg bg-[#2a2d35] border border-[#3a3d45] text-slate-400 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                          <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let page;
                          if (totalPages <= 5) page = i + 1;
                          else if (currentPage <= 3) page = i + 1;
                          else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                          else page = currentPage - 2 + i;
                          return (
                            <button key={page} onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-[#2a2d35] text-slate-500 hover:text-blue-400 border border-[#3a3d45]'}`}>
                              {page}
                            </button>
                          );
                        })}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                          className="p-2 rounded-lg bg-[#2a2d35] border border-[#3a3d45] text-slate-400 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Charts */}
                {analytics?.summary?.daily_performance?.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-[#1a1d23] rounded-3xl p-8 border border-[#2a2d35] h-[350px]">
                      <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tighter">Views Trend</h3>
                      <ResponsiveContainer width="100%" height="80%">
                        <AreaChart data={prepareChartData(analytics.summary.daily_performance)}>
                          <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2028" />
                          <XAxis dataKey="date" tickFormatter={(t) => t.substring(5)} axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: '900' }} />
                          <YAxis tickFormatter={formatNumber} axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: '900' }} />
                          <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={3} fill="url(#colorViews)" />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#1a1d23', border: '1px solid #2a2d35', borderRadius: '12px', color: '#e2e8f0', fontSize: '12px', fontWeight: '700' }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-[#1a1d23] rounded-3xl p-8 border border-[#2a2d35] flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-6">Traffic Sources</h3>
                        <div className="space-y-5">
                          {analytics.summary.traffic_sources?.slice(0, 5).map((source, i) => (
                            <div key={i}>
                              <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                                <span className="text-slate-400">{source[0].replace(/_/g, ' ')}</span>
                                <span className="text-blue-400">{((source[1] / (analytics.summary.daily_performance?.reduce((a, r) => a + r[1], 0) || 1)) * 100).toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-[#2a2d35] h-1.5 rounded-full">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${analytics.summary.traffic_sources[0][1] > 0 ? (source[1] / analytics.summary.traffic_sources[0][1]) * 100 : 0}%` }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-6 pt-6 border-t border-[#2a2d35] flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#2a2d35] flex items-center justify-center"><Activity size={16} className="text-blue-400" /></div>
                        <div><p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Period</p><p className="text-xs font-black text-white">{days === 1 ? 'Latest Day' : `${days} Days`}</p></div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
