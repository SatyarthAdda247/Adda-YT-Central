import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, Eye, Video, ThumbsUp, MessageCircle, Share2, Activity,
  Globe, Monitor, PlayCircle, Loader2, CalendarClock, CheckCircle, PieChart as PieIcon,
  TrendingUp, TrendingDown, Clock, LayoutDashboard, Database, Sparkles, TrendingUp as UpArrow, TrendingDown as DownArrow,
  ExternalLink, Settings2, CheckCircle2, MoreHorizontal
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';

// Global Configuration
const CHANNEL_ID = 'UCm5eucY4cn0qfAIIeLcd1SQ';
const API_BASE_URL = 'http://localhost:8000';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#facc15', '#10b981'];

const ALL_COLUMNS = [
  { id: 'views', label: 'Total Views', default: true },
  { id: 'watchTime', label: 'Watch Time (H)', default: true },
  { id: 'avd', label: 'AVD (Retention)', default: true },
  { id: 'subsGained', label: 'Gained', default: true },
  { id: 'subsLost', label: 'Lost', default: true },
  { id: 'netSubs', label: 'Net ROI', default: true },
  { id: 'conv_ratio', label: 'Conv Ratio', default: false },
  { id: 'likes', label: 'Likes', default: false },
  { id: 'comments', label: 'Comments', default: false },
  { id: 'sharing', label: 'Shares', default: false },
  { id: 'playlist', label: 'Playlists', default: false },
  { id: 'engagement', label: 'Engagement Total', default: false }
];

function StatCard({ title, value, subtitle, icon: Icon, colorClass, trend }) {
  return (
    <div className="bg-[#1a1d23] rounded-2xl p-6 border border-[#2a2d35] flex flex-col justify-between transition-all hover:border-[#3a3d45] hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon size={22} />
        </div>
        {trend && (
          <span className={`flex items-center text-xs font-bold ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend > 0 ? <TrendingUp size={14} className="mr-1"/> : <TrendingDown size={14} className="mr-1"/>}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-black text-white mt-1">{value}</h3>
        {subtitle && <p className="text-xs text-slate-600 font-medium mt-1 flex items-center"><Clock size={12} className="mr-1"/> {subtitle}</p>}
      </div>
    </div>
  );
}

function App() {
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [channelInputId, setChannelInputId] = useState(CHANNEL_ID);
  const [days, setDays] = useState(30);
  const [activeTab, setActiveTab] = useState('realtime');
  const [visibleColumns, setVisibleColumns] = useState(ALL_COLUMNS.filter(c => c.default).map(c => c.id));
  const [showConfig, setShowConfig] = useState(false);

  const fetchData = async (cid, queryDays = 30) => {
    if (!cid) return;
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

  useEffect(() => {
    fetchData(CHANNEL_ID, days);
  }, []);

  const toggleColumn = (id) => {
    setVisibleColumns(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const handleDaysChange = (newDays) => {
    setDays(newDays);
    fetchData(channelInputId, newDays);
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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const prepareChartData = (rows) => {
    if (!rows) return [];
    return rows.map(row => ({
      date: row[0],
      views: row[1],
      watchTime: row[3] / 60,
      subs: (row[5] || 0) - (row[6] || 0)
    }));
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-slate-100 font-sans selection:bg-blue-900 pb-20">

      {/* --- TOP NAV --- */}
      <nav className="sticky top-0 z-50 bg-[#12141a]/90 backdrop-blur-xl border-b border-[#1e2028] px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-lg shadow-lg shadow-red-900/30">
              <PlayCircle className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-red-500 uppercase">YT Central</h1>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest pl-0.5 italic">Mind Intelligence Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[#1a1d23] p-1.5 rounded-2xl border border-[#2a2d35]">
             <button onClick={() => setActiveTab('realtime')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${activeTab === 'realtime' ? 'bg-[#2a2d35] text-blue-400 shadow-md' : 'text-slate-600 hover:text-slate-400'}`}><LayoutDashboard size={16} /> Identity</button>
             <button onClick={() => setActiveTab('deep-dive')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${activeTab === 'deep-dive' ? 'bg-[#2a2d35] text-blue-400 shadow-md' : 'text-slate-600 hover:text-slate-400'}`}><Database size={16} /> Deep-Dive</button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); fetchData(channelInputId, days); }} className="relative flex items-center">
            <input type="text" value={channelInputId} onChange={(e) => setChannelInputId(e.target.value)} placeholder="Search Channel..." className="pl-4 pr-12 py-2 bg-[#1a1d23] border border-[#2a2d35] rounded-xl w-60 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-bold text-sm text-slate-300 placeholder-slate-600" />
            <button type="submit" className="absolute right-2 top-1 p-1 bg-[#2a2d35] rounded-lg text-slate-500 hover:text-blue-400">{loading ? <Loader2 size={16} className="animate-spin" /> : <Activity size={16} />}</button>
          </form>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-10">

        {error && (
          <div className="bg-rose-900/20 border border-rose-800/30 p-4 rounded-2xl flex items-center gap-4 text-rose-400 mb-8 font-bold text-sm"><Activity size={24} /> {error}</div>
        )}

        {profile && !loading && (
          <div>

            {/* --- VIEW 1: IDENTITY --- */}
            {activeTab === 'realtime' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-2 bg-[#1a1d23] rounded-[40px] p-10 border border-[#2a2d35] flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full translate-x-32 -translate-y-32"></div>
                     <img src={profile.identity.thumbnail_url} className="w-44 h-44 rounded-[40px] shadow-2xl border-4 border-[#2a2d35] object-cover group-hover:scale-105 transition-all duration-700 relative" />
                     <div className="flex-1 relative space-y-3">
                        <div className="flex items-center gap-3"><h2 className="text-3xl font-black text-white leading-tight">{profile.identity.name}</h2><CheckCircle2 className="text-blue-400" size={24} /></div>
                        <p className="text-blue-400 font-black text-base italic uppercase tracking-tighter">@{profile.identity.custom_url}</p>
                        <p className="text-slate-500 text-xs font-bold leading-relaxed mt-4 line-clamp-3 italic opacity-80">{profile.identity.description}</p>
                        <div className="flex gap-2 pt-6">
                           <span className="bg-[#2a2d35] px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-slate-400 tracking-widest border border-[#3a3d45]">{profile.identity.country || 'Global'}</span>
                           <span className="bg-[#2a2d35] px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-slate-400 tracking-widest border border-[#3a3d45]">ID: {profile.identity.id.substring(0, 10)}...</span>
                        </div>
                     </div>
                  </div>

                  <div className="lg:col-span-2 grid grid-cols-2 gap-6">
                     <StatCard title="Actual Subs" value={formatNumber(profile.stats.subscribers_actual)} subtitle="Master DB Refresh" icon={Users} colorClass="bg-rose-900/30 text-rose-400" />
                     <StatCard title="Total Views" value={formatNumber(profile.stats.total_views)} subtitle="Lifetime Totals" icon={Eye} colorClass="bg-blue-900/30 text-blue-400" />
                     <StatCard title="Rounded Display" value={formatNumber(profile.stats.subscribers_rounded)} subtitle="Public Facing" icon={Users} colorClass="bg-purple-900/30 text-purple-400" />
                     <StatCard title="Sub Logic Ratio" value={(profile.stats.total_views / profile.stats.subscribers_actual).toFixed(1) + ':1'} subtitle="Intelligence Depth" icon={Sparkles} colorClass="bg-emerald-900/30 text-emerald-400" />
                  </div>
                </div>
              </div>
            )}

            {/* --- VIEW 2: DEEP-DIVE --- */}
            {activeTab === 'deep-dive' && (
              <div className="space-y-12 pb-20">

                {/* Visual Header */}
                <div className="bg-gradient-to-br from-[#1a1d23] to-[#12141a] rounded-[40px] p-10 text-white relative shadow-2xl overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 border border-[#2a2d35]">
                   <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-[80px]"></div>
                   <div className="relative z-10">
                      <h2 className="text-4xl font-black italic tracking-tighter text-white">Analytics Terminal</h2>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.6em] mt-3">Verifying Historical Sequence Data</p>
                   </div>
                   <div className="flex bg-[#0d0f12] p-1.5 rounded-2xl border border-[#2a2d35] relative z-10">
                     {[1, 7, 30, 90].map((d) => (
                        <button key={d} onClick={() => handleDaysChange(d)} className={`px-5 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all ${days === d ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/30' : 'text-slate-600 hover:text-slate-300'}`}>{d === 1 ? 'Latest' : `${d}D`}</button>
                     ))}
                   </div>
                </div>

                {/* MASTER VIDEO TABLE */}
                <div className="bg-[#1a1d23] rounded-[40px] border border-[#2a2d35] overflow-hidden">
                   <div className="p-8 border-b border-[#2a2d35] flex flex-col md:flex-row justify-between items-center gap-6">
                      <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">VIDEO-WISE ROI SCANNER <Sparkles size={24} className="text-amber-400" /></h2>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mt-1">Cross-referencing Data API v3 & Analytics API</p>
                      </div>

                      {/* Column Selector */}
                      <div className="relative">
                         <button
                            onClick={() => setShowConfig(!showConfig)}
                            className="flex items-center gap-2 bg-[#2a2d35] hover:bg-[#3a3d45] px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all text-slate-400 border border-[#3a3d45]"
                         >
                            <Settings2 size={16} /> Column Configuration
                         </button>

                         {showConfig && (
                            <div className="absolute right-0 top-14 bg-[#1a1d23] border border-[#2a2d35] shadow-2xl shadow-black/50 rounded-3xl p-6 w-72 z-50">
                               <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 italic">Visible Metrics</h3>
                               <div className="grid grid-cols-1 gap-1">
                                  {ALL_COLUMNS.map(col => (
                                     <label key={col.id} className="flex items-center gap-3 p-2 hover:bg-[#2a2d35] rounded-xl cursor-pointer group">
                                        <input
                                           type="checkbox"
                                           checked={visibleColumns.includes(col.id)}
                                           onChange={() => toggleColumn(col.id)}
                                           className="w-4 h-4 rounded bg-[#2a2d35] text-blue-500 border-[#3a3d45] focus:ring-blue-500/50"
                                        />
                                        <span className={`text-[11px] font-bold ${visibleColumns.includes(col.id) ? 'text-blue-400' : 'text-slate-500'} group-hover:text-blue-400 uppercase tracking-tighter`}>{col.label}</span>
                                     </label>
                                  ))}
                               </div>
                               <div className="mt-4 pt-4 border-t border-[#2a2d35] text-center">
                                  <button onClick={() => setShowConfig(false)} className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Done</button>
                               </div>
                            </div>
                         )}
                      </div>
                   </div>

                   <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                         <thead>
                            <tr className="border-b border-[#2a2d35] italic">
                               <th className="px-6 py-5 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">Rank</th>
                               <th className="px-6 py-5 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest min-w-[320px]">Video Intel</th>

                               {visibleColumns.map(id => (
                                  <th key={id} className="px-6 py-5 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                     {ALL_COLUMNS.find(c => c.id === id)?.label}
                                  </th>
                                ))}
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-[#1e2028]">
                            {analytics?.summary.video_master_table?.map((video, idx) => (
                               <tr key={video.id} className="hover:bg-[#22252d] transition-colors group">
                                  <td className="px-6 py-7 font-black text-slate-600 italic">#{idx + 1}</td>
                                  <td className="px-6 py-7">
                                     <div className="flex items-center gap-5">
                                        <div className="relative shrink-0">
                                           <img src={video.thumbnail} className="w-24 h-14 rounded-xl object-cover shadow-sm border border-[#2a2d35] group-hover:border-blue-500/30 transition-all duration-300" />
                                           <a href={`https://youtube.com/watch?v=${video.id}`} target="_blank" className="absolute -top-2 -right-2 bg-[#2a2d35] p-1 rounded-lg text-slate-500 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-400"><ExternalLink size={12} /></a>
                                        </div>
                                        <div>
                                           <h4 className="text-sm font-black text-slate-200 line-clamp-1 leading-tight group-hover:text-blue-400">{video.title}</h4>
                                           <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">{new Date(video.publishedAt).toLocaleDateString()}</p>
                                        </div>
                                     </div>
                                  </td>

                                  {visibleColumns.includes('views') && <td className="px-6 py-7 text-center font-black text-slate-200">{formatNumber(video.views)}</td>}
                                  {visibleColumns.includes('watchTime') && <td className="px-6 py-7 text-center font-bold text-slate-400">{formatNumber(video.watchTimeMins / 60)}h</td>}
                                  {visibleColumns.includes('avd') && <td className="px-6 py-7 text-center font-bold text-slate-300">{formatTime(video.avd)}</td>}
                                  {visibleColumns.includes('subsGained') && <td className="px-6 py-7 text-center font-bold text-emerald-400">+{video.subsGained}</td>}
                                  {visibleColumns.includes('subsLost') && <td className="px-6 py-7 text-center font-bold text-rose-400">-{video.subsLost}</td>}
                                  {visibleColumns.includes('netSubs') && (
                                     <td className="px-6 py-7 text-center">
                                        <div className={`inline-flex items-center gap-1 font-black px-3 py-1 rounded-lg text-xs ${video.netSubs >= 0 ? 'bg-emerald-900/30 text-emerald-400' : 'bg-rose-900/30 text-rose-400'}`}>
                                           {video.netSubs >= 0 ? <UpArrow size={12} /> : <DownArrow size={12} />}
                                           {Math.abs(video.netSubs)}
                                        </div>
                                     </td>
                                  )}
                                  {visibleColumns.includes('conv_ratio') && <td className="px-6 py-7 text-center font-black text-blue-400 italic">{video.conv_ratio}%</td>}
                                  {visibleColumns.includes('likes') && <td className="px-6 py-7 text-center font-bold text-slate-400">{formatNumber(video.likes)}</td>}
                                  {visibleColumns.includes('comments') && <td className="px-6 py-7 text-center font-bold text-slate-400">{formatNumber(video.comments)}</td>}
                                  {visibleColumns.includes('sharing') && <td className="px-6 py-7 text-center font-bold text-slate-400">{formatNumber(video.shres || 0)}</td>}
                                  {visibleColumns.includes('playlist') && <td className="px-6 py-7 text-center font-bold text-slate-400">{formatNumber(video.videosAddedToPlaylists || 0)}</td>}
                                  {visibleColumns.includes('engagement') && <td className="px-6 py-7 text-center font-black text-slate-300">{formatNumber((video.likes || 0) + (video.comments || 0))}</td>}

                                </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>

                {/* VISUALS SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
                   <div className="md:col-span-2 bg-[#1a1d23] rounded-[40px] p-10 border border-[#2a2d35] h-[400px]">
                      <h3 className="text-xl font-black text-white mb-8 uppercase tracking-tighter italic">Engagement Flux (Views vs Growth)</h3>
                      <ResponsiveContainer width="100%" height="80%">
                         <AreaChart data={prepareChartData(analytics?.summary.daily_performance)}>
                            <defs>
                               <linearGradient id="colorViewsV2" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2028" />
                            <XAxis dataKey="date" tickFormatter={(t) => t.substring(5)} axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: '900'}} />
                            <YAxis tickFormatter={formatNumber} axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: '900'}} />
                            <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={3} fill="url(#colorViewsV2)" />
                            <RechartsTooltip contentStyle={{ backgroundColor: '#1a1d23', border: '1px solid #2a2d35', borderRadius: '12px', color: '#e2e8f0', fontSize: '12px', fontWeight: '700' }} />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>

                   <div className="bg-[#1a1d23] rounded-[40px] p-10 relative border border-[#2a2d35] flex flex-col justify-between">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
                      <div>
                         <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest italic mb-8">Discovery Intelligence</h3>
                         <div className="space-y-6">
                            {analytics?.summary.traffic_sources?.slice(0, 4).map((source, i) => (
                               <div key={i} className="relative z-10">
                                  <div className="flex justify-between text-[10px] font-black uppercase mb-2"><span className="text-slate-400">{source[0].replace(/_/g, ' ')}</span><span className="text-blue-400 italic">{((source[1] / (analytics.summary.daily_performance?.reduce((acc, row) => acc + row[1], 0) || 1)) * 100).toFixed(1)}%</span></div>
                                  <div className="w-full bg-[#2a2d35] h-1.5 rounded-full"><div className="bg-blue-500 h-full rounded-full" style={{width: `${(analytics.summary.traffic_sources[0][1] > 0 ? (source[1] / analytics.summary.traffic_sources[0][1]) * 100 : 0)}%`}}></div></div>
                               </div>
                            ))}
                         </div>
                      </div>
                      <div className="mt-8 pt-8 border-t border-[#2a2d35] flex items-center gap-3">
                         <div className="w-10 h-10 rounded-2xl bg-[#2a2d35] flex items-center justify-center"><Activity size={20} className="text-blue-400" /></div>
                         <div><p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Scan Period</p><p className="text-xs font-black text-white">{days === 1 ? 'Latest Day' : `${days} Days`} Analysis</p></div>
                      </div>
                   </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}

export default App;
