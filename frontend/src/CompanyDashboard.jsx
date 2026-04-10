/**
 * CompanyDashboard.jsx
 * Sources: /yt/channel-stats (snapshot) · /yt/channel-analytics/:id (daily channel metrics)
 */
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Loader2, Users, Eye, PlaySquare, TrendingUp, ChevronDown, ChevronRight } from 'lucide-react';
import { MOCK_CHANNELS, MOCK_ANALYTICS_MAP, MOCK_CHANNEL_ANALYTICS_SINGLE } from './mockData';
const API = import.meta.env.VITE_API_URL || '';
const v   = (n) => `var(--${n})`;
const C   = { green: '#22c55e', blue: '#60a5fa', purple: '#a78bfa', amber: '#fbbf24', red: '#ef4444' };

const fmt = (n) => {
  if (n == null) return '0';
  const x = Number(n);
  if (x >= 1e9) return (x / 1e9).toFixed(2) + 'B';
  if (x >= 1e6) return (x / 1e6).toFixed(2) + 'M';
  if (x >= 1e3) return (x / 1e3).toFixed(1) + 'K';
  return x.toLocaleString();
};
const fmtH = (n) => {
  if (n == null) return '0';
  const x = Number(n);
  if (x >= 1e6) return (x / 1e6).toFixed(1) + 'M h';
  if (x >= 1e3) return (x / 1e3).toFixed(1) + 'K h';
  return x.toFixed(0) + ' h';
};

// ── Business units matching the app's HIERARCHY ──────────────────────────────
// Maps channel names to the 4 business units via keyword matching
const BUSINESS_UNITS = [
  {
    id: 'TEST_PREP', label: 'Test Prep',
    keywords: [
      'ssc','railway','adda247','banking','bank','insurance','jaiib','caiib','officers',
      'agriculture','andhra','chhattisgarh','ctet','defence','engineering','fci','gate',
      'gujarat','haryana','jharkhand','kerala','madhya pradesh','maharashtra','odisha',
      'rajasthan','regulatory','tamil','ugc net','csir','uttar pradesh','uttarakhand',
      'west bengal','punjab','bihar','north east','nursing','life sciences','mathematical',
      'teachers adda','tgt','pgt','tet','shikshak','nda','police','jawan','capf',
      'bankers','govt jobs','competition','notification','humanities','science adda',
      'ca intermediate','iti','opsc','bpsc','clat','jaiib caiib english','apsc',
      'traders','board breakers','class 8','class 9','language adda','pharma',
      'commerce adda','finance career','skill bangla','skill odia','skill telugu',
      'women & work','bfsi','ace jobs','studyiq','upsc prep by studyiq','haryana studyiq',
    ]
  },
  {
    id: 'Career_adda', label: 'Career Adda',
    keywords: [
      'class 10','class 11','class 12','cuet','iit jee','iit neet','ipm','law entrance',
      'neet adda','neet hindi','ug defence','career247','doctor','vidya neet',
      'ncert neet','ca foundation','ipmat','cuet counselling','cuet pg',
    ]
  },
  {
    id: 'Skilling_HE', label: 'SHE',
    keywords: [
      'skill booster','aptitude','tech skills','online degree','prep+online','ace jobs',
      'skill bangla','skill odia','skill telugu','women & work','bfsi career',
    ]
  },
  {
    id: 'SIQ', label: 'SIQ',
    keywords: [
      'upsc','state pcs','judiciary','studyiq','pcs adda','adda247 pcs',
    ]
  },
];

// Priority order: SIQ first (specific), then Career_adda, SHE, TEST_PREP (broadest last)
const MATCH_ORDER = ['SIQ', 'Career_adda', 'Skilling_HE', 'TEST_PREP'];

function assignBusiness(channels) {
  const result = { TEST_PREP: [], Career_adda: [], Skilling_HE: [], SIQ: [] };
  channels.forEach(ch => {
    const name = ch.channel_name.toLowerCase();
    let assigned = false;
    for (const bizId of MATCH_ORDER) {
      const biz = BUSINESS_UNITS.find(b => b.id === bizId);
      if (biz.keywords.some(kw => name.includes(kw))) {
        result[bizId].push(ch);
        assigned = true;
        break;
      }
    }
    if (!assigned) result['TEST_PREP'].push(ch); // fallback
  });
  return result;
}

// ── Shared tooltip ────────────────────────────────────────────────────────────
function ChartTip({ active, payload, label, fmtFn = fmt }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: v('bg-card'), border: `1px solid ${v('border-card')}`,
      borderRadius: 10, padding: '10px 14px', fontSize: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
      <p style={{ color: v('text-label'), marginBottom: 6, fontWeight: 700 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 800, margin: '2px 0' }}>
          {p.name}: {fmtFn(p.value)}
        </p>
      ))}
    </div>
  );
}

// ── KPI card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, valueColor }) {
  return (
    <div style={{ background: v('bg-card'), border: `1px solid ${v('border-card')}`,
      borderRadius: 16, padding: '20px 22px', flex: 1, minWidth: 0,
      position: 'relative', overflow: 'hidden', boxShadow: v('card-shadow') }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${v('border-card')}, transparent)` }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p style={{ color: v('text-label'), fontSize: 10, fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>{label}</p>
        {Icon && <Icon size={14} color={v('text-placeholder')} />}
      </div>
      <p style={{ color: valueColor || v('text-heading'), fontSize: 28, fontWeight: 900,
        lineHeight: 1, letterSpacing: '-0.02em', margin: 0 }}>{value}</p>
      {sub && <p style={{ color: v('text-label'), fontSize: 11, marginTop: 6, fontWeight: 600 }}>{sub}</p>}
    </div>
  );
}

// ── Chart card ────────────────────────────────────────────────────────────────
function ChartCard({ title, sub, height = 240, action, children }) {
  return (
    <div style={{ background: v('bg-card'), border: `1px solid ${v('border-card')}`,
      borderRadius: 16, padding: '20px 20px 12px', overflow: 'hidden', boxShadow: v('card-shadow') }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <h3 style={{ color: v('text-heading'), fontSize: 14, fontWeight: 900, margin: 0 }}>{title}</h3>
          {sub && <p style={{ color: v('text-label'), fontSize: 11, marginTop: 3, fontWeight: 600 }}>{sub}</p>}
        </div>
        {action && <div style={{ display: 'flex', gap: 6 }}>{action}</div>}
      </div>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

function Spin() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8 }}>
      <Loader2 size={16} className="animate-spin" style={{ color: v('text-label') }} />
      <span style={{ color: v('text-label'), fontSize: 12, fontWeight: 600 }}>Loading…</span>
    </div>
  );
}

// ── Range button row ──────────────────────────────────────────────────────────
const RANGES = [
  { id: '7d',  label: '7 Days',  days: 7 },
  { id: '30d', label: '30 Days', days: 30 },
  { id: '90d', label: '90 Days', days: 90 },
  { id: '1y',  label: '1 Year',  days: 365 },
];

export default function CompanyDashboard() {
  const [channels, setChannels]             = useState(MOCK_CHANNELS);
  const [analytics, setAnalytics]           = useState(MOCK_ANALYTICS_MAP);
  const [loadingCh, setLoadingCh]           = useState(false);
  const [loadingAn, setLoadingAn]           = useState(false);
  const [dateRange, setDateRange]           = useState('30d');
  const [expandedCat, setExpandedCat]       = useState(null);
  const [activeMetric, setActiveMetric]     = useState('subscribersGained');
  const [networkCompare, setNetworkCompare] = useState(false);
  const [networkSelected, setNetworkSelected] = useState(['subscribersGained']);

  // per-channel drill-down state
  const [expandedChannel, setExpandedChannel]         = useState(null);
  const [channelAnalytics, setChannelAnalytics]       = useState({});
  const [channelAnalyticsLoading, setChannelAnalyticsLoading] = useState({});
  const [channelMetric, setChannelMetric]             = useState('subscribersGained');
  const [channelCompare, setChannelCompare]           = useState(false);   // compare mode on/off
  const [channelSelected, setChannelSelected]         = useState(['subscribersGained']); // multi-select

  const handleChannelRowClick = (ch) => {
    if (expandedChannel === ch.channel_id) { setExpandedChannel(null); return; }
    setExpandedChannel(ch.channel_id);
    if (channelAnalytics[ch.channel_id]) return; // already loaded
    setChannelAnalyticsLoading(prev => ({ ...prev, [ch.channel_id]: true }));
    const days = RANGES.find(r => r.id === dateRange)?.days || 30;
    const start = new Date(); start.setDate(start.getDate() - days);
    axios.get(`${API}/yt/channel-analytics/${ch.channel_id}?start=${start.toISOString().slice(0,10)}`)
      .then(r => setChannelAnalytics(prev => ({ ...prev, [ch.channel_id]: r.data.daily || [] })))
      .catch(() => setChannelAnalytics(prev => ({ ...prev, [ch.channel_id]: (MOCK_ANALYTICS_MAP[ch.channel_id] || MOCK_CHANNEL_ANALYTICS_SINGLE).slice(0, days + 1) })))
      .finally(() => setChannelAnalyticsLoading(prev => ({ ...prev, [ch.channel_id]: false })));
  };

  // 1. /yt/channel-stats — try real API, keep mock on failure
  useEffect(() => {
    axios.get(`${API}/yt/channel-stats`)
      .then(r => { if (r.data.channels?.length) setChannels(r.data.channels); })
      .catch(() => {});
  }, []);

  // 2. /yt/channel-analytics/:id — always runs, falls back to MOCK_ANALYTICS_MAP per channel
  useEffect(() => {
    if (!channels.length) return;
    setLoadingAn(true);
    const days = RANGES.find(r => r.id === dateRange)?.days || 30;
    const start = new Date();
    start.setDate(start.getDate() - days);
    const startStr = start.toISOString().slice(0, 10);
    const isMock = channels[0]?.channel_id?.startsWith('UC_mock');
    if (isMock) {
      // Use pre-built mock analytics map directly — no API calls
      const sliced = {};
      channels.forEach(ch => {
        sliced[ch.channel_id] = (MOCK_ANALYTICS_MAP[ch.channel_id] || MOCK_CHANNEL_ANALYTICS_SINGLE).slice(0, days + 1);
      });
      setAnalytics(sliced);
      setLoadingAn(false);
      return;
    }
    Promise.allSettled(
      channels.map(ch =>
        axios.get(`${API}/yt/channel-analytics/${ch.channel_id}?start=${startStr}`)
          .then(r => ({ id: ch.channel_id, daily: r.data.daily?.length ? r.data.daily : (MOCK_ANALYTICS_MAP[ch.channel_id] || MOCK_CHANNEL_ANALYTICS_SINGLE).slice(0, days + 1) }))
          .catch(() => ({ id: ch.channel_id, daily: (MOCK_ANALYTICS_MAP[ch.channel_id] || MOCK_CHANNEL_ANALYTICS_SINGLE).slice(0, days + 1) }))
      )
    ).then(results => {
      const map = {};
      results.forEach(r => { if (r.status === 'fulfilled') map[r.value.id] = r.value.daily; });
      setAnalytics(map);
    }).finally(() => setLoadingAn(false));
  }, [channels, dateRange]);

  // ── Snapshot totals (from /yt/channel-stats) ─────────────────────────────
  const totals = useMemo(() => ({
    subscribers: channels.reduce((s, c) => s + (c.subscribers || 0), 0),
    views:       channels.reduce((s, c) => s + (c.total_views || 0), 0),
    videos:      channels.reduce((s, c) => s + (c.total_videos || 0), 0),
    count:       channels.length,
  }), [channels]);

  // ── Merge daily analytics by date ────────────────────────────────────────
  const mergedDaily = useMemo(() => {
    const byDate = {};
    Object.values(analytics).forEach(daily => {
      daily.forEach(row => {
        if (!byDate[row.date]) byDate[row.date] = {
          date: row.date, subscribersGained: 0, views: 0, watchTimeHrs: 0, likes: 0,
        };
        const d = byDate[row.date];
        d.subscribersGained += row.subscribersGained || 0;
        d.views             += row.views             || 0;
        d.watchTimeHrs      += row.watchTimeHrs      || 0;
        d.likes             += row.likes             || 0;
      });
    });
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  }, [analytics]);

  // ── Period totals from analytics ─────────────────────────────────────────
  const periodTotals = useMemo(() => ({
    subscribersGained: mergedDaily.reduce((s, d) => s + d.subscribersGained, 0),
    views:             mergedDaily.reduce((s, d) => s + d.views, 0),
    watchHrs:          mergedDaily.reduce((s, d) => s + d.watchTimeHrs, 0),
    likes:             mergedDaily.reduce((s, d) => s + d.likes, 0),
  }), [mergedDaily]);

  // ── Business unit grouping ────────────────────────────────────────────────
  const bizMap     = useMemo(() => assignBusiness(channels), [channels]);
  const bizSummary = useMemo(() => BUSINESS_UNITS.map(biz => {
    const chs = bizMap[biz.id] || [];
    return {
      ...biz,
      channels:    chs,
      subscribers: chs.reduce((s, c) => s + (c.subscribers || 0), 0),
      views:       chs.reduce((s, c) => s + (c.total_views || 0), 0),
      videos:      chs.reduce((s, c) => s + (c.total_videos || 0), 0),
    };
  }), [bizMap]);

  if (loadingCh) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, gap: 12 }}>
      <Loader2 size={22} className="animate-spin" style={{ color: v('text-label') }} />
      <span style={{ color: v('text-label'), fontWeight: 700 }}>Loading…</span>
    </div>
  );

  return (
    <div style={{ background: v('bg-page'), minHeight: '80vh', padding: '0 0 48px', margin: '-24px -24px 0' }}>

      {/* ── Header ── */}
      <div style={{ background: v('bg-card'), borderBottom: `1px solid ${v('border-card')}`,
        padding: '24px 24px 18px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: v('text-label'), fontSize: 10, fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>
              Adda247 · YouTube Network
            </p>
            <h1 style={{ color: v('text-heading'), fontSize: 24, fontWeight: 900,
              letterSpacing: '-0.03em', margin: 0 }}>Company Scorecard</h1>
            <p style={{ color: v('text-label'), fontSize: 11, marginTop: 3, fontWeight: 600 }}>
              {channels.length} channels · channel-level analytics · all channels aggregated
            </p>
          </div>
          {/* Date range */}
          <div style={{ display: 'flex', gap: 6 }}>
            {RANGES.map(r => (
              <button key={r.id} onClick={() => setDateRange(r.id)} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer',
                border: `1px solid ${dateRange === r.id ? v('text-secondary') : v('border-card')}`,
                background: dateRange === r.id ? v('bg-table-header') : 'transparent',
                color: dateRange === r.id ? v('text-heading') : v('text-label'),
                transition: 'all 0.15s',
              }}>{r.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>

        {/* ── KPI Row ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <KpiCard label="Total Subscribers" value={fmt(totals.subscribers)}
            sub={`${totals.count} channels · live snapshot`} icon={Users} />
          <KpiCard label="Total Views (All Time)" value={fmt(totals.views)}
            sub="Lifetime · channel snapshot" icon={Eye} />
          <KpiCard label="Total Videos" value={fmt(totals.videos)}
            sub="Published across network" icon={PlaySquare} />
          <KpiCard label={`Subs Gained (${dateRange})`}
            value={periodTotals.subscribersGained ? '+' + fmt(periodTotals.subscribersGained) : '—'}
            sub="New subscribers · all channels" icon={TrendingUp} valueColor={C.green} />
          <KpiCard label={`Views (${dateRange})`}
            value={periodTotals.views ? fmt(periodTotals.views) : '—'}
            sub="All channels · Analytics API" icon={Eye} valueColor={C.blue} />
          <KpiCard label={`Watch Hrs (${dateRange})`}
            value={periodTotals.watchHrs ? fmtH(periodTotals.watchHrs) : '—'}
            sub="All channels" icon={PlaySquare} valueColor={C.purple} />
        </div>

        {/* ── Single-metric trend chart with metric toggle buttons ── */}
        <div style={{ marginBottom: 20 }}>
          <ChartCard
            title="Network Trends"
            sub={`Daily aggregated across all channels · ${dateRange}`}
            height={280}
            action={(() => {
              const NM = [
                { id: 'subscribersGained', label: 'Subs Gained', color: C.green,  fmtFn: fmt },
                { id: 'views',             label: 'Views',        color: C.blue,   fmtFn: fmt },
                { id: 'watchTimeHrs',      label: 'Watch Hrs',    color: C.purple, fmtFn: fmtH },
                { id: 'likes',             label: 'Likes',        color: C.amber,  fmtFn: fmt },
              ];
              const activeIds = networkCompare ? networkSelected : [activeMetric];
              const toggle = (id) => {
                if (!networkCompare) { setActiveMetric(id); return; }
                setNetworkSelected(prev =>
                  prev.includes(id)
                    ? prev.length === 1 ? prev : prev.filter(x => x !== id)
                    : [...prev, id]
                );
              };
              return [
                ...NM.map(m => {
                  const isActive = activeIds.includes(m.id);
                  return (
                    <button key={m.id} onClick={() => toggle(m.id)} style={{
                      padding: '5px 14px', borderRadius: 8, fontSize: 11, fontWeight: 800,
                      cursor: 'pointer', transition: 'all 0.15s',
                      border: `1.5px solid ${isActive ? m.color : v('border-card')}`,
                      background: isActive ? v('bg-table-header') : 'transparent',
                      color: isActive ? m.color : v('text-label'),
                      boxShadow: isActive ? `0 0 0 2px ${m.color}22` : 'none',
                    }}>
                      {isActive && <span style={{ display: 'inline-block', width: 6, height: 6,
                        borderRadius: '50%', background: m.color, marginRight: 6,
                        verticalAlign: 'middle' }} />}
                      {m.label}
                    </button>
                  );
                }),
                <div key="sep" style={{ width: 1, height: 18, background: v('border-card'), margin: '0 4px' }} />,
                <button key="compare" onClick={() => {
                  const next = !networkCompare;
                  setNetworkCompare(next);
                  if (!next) setNetworkSelected([activeMetric]);
                  else setNetworkSelected([activeMetric]);
                }} style={{
                  padding: '5px 16px', borderRadius: 8, fontSize: 11, fontWeight: 900,
                  cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.04em',
                  border: `1.5px solid ${networkCompare ? v('accent') : v('border-card')}`,
                  background: networkCompare ? v('accent') : v('bg-input'),
                  color: networkCompare ? '#fff' : v('text-secondary'),
                }}>
                  {networkCompare ? '✕ Exit Comparison' : '+ Comparison'}
                </button>,
              ];
            })()}
          >
            {loadingAn ? <Spin /> : mergedDaily.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100%', color: v('text-label'), fontSize: 12 }}>
                No analytics data for this period
              </div>
            ) : (() => {
              const NM = [
                { id: 'subscribersGained', label: 'Subs Gained', color: C.green,  fmtFn: fmt },
                { id: 'views',             label: 'Views',        color: C.blue,   fmtFn: fmt },
                { id: 'watchTimeHrs',      label: 'Watch Hrs',    color: C.purple, fmtFn: fmtH },
                { id: 'likes',             label: 'Likes',        color: C.amber,  fmtFn: fmt },
              ];
              const activeIds  = networkCompare ? networkSelected : [activeMetric];
              const needsDual  = activeIds.includes('watchTimeHrs') && activeIds.length > 1;
              const soloMeta   = NM.find(m => m.id === activeMetric) || NM[0];
              return (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mergedDaily}
                    margin={{ top: 4, right: needsDual ? 56 : 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={v('border-light')} vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: v('text-label'), fontSize: 10 }}
                      tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false}
                      interval="preserveStartEnd" />
                    <YAxis yAxisId="left" tick={{ fill: v('text-label'), fontSize: 10 }}
                      axisLine={false} tickLine={false}
                      tickFormatter={!networkCompare ? soloMeta.fmtFn : fmt} width={56} />
                    {needsDual && (
                      <YAxis yAxisId="right" orientation="right"
                        tick={{ fill: C.purple, fontSize: 10 }}
                        axisLine={false} tickLine={false} tickFormatter={fmtH} width={56} />
                    )}
                    <Tooltip content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div style={{ background: v('bg-card'), border: `1px solid ${v('border-card')}`,
                          borderRadius: 10, padding: '10px 14px', fontSize: 12,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
                          <p style={{ color: v('text-label'), marginBottom: 6, fontWeight: 700 }}>{label}</p>
                          {payload.map((p, i) => {
                            const meta = NM.find(m => m.id === p.dataKey);
                            return (
                              <p key={i} style={{ color: p.color, fontWeight: 800, margin: '2px 0' }}>
                                {p.name}: {meta ? meta.fmtFn(p.value) : fmt(p.value)}
                              </p>
                            );
                          })}
                        </div>
                      );
                    }} />
                    {activeIds.map(id => {
                      const meta = NM.find(m => m.id === id);
                      if (!meta) return null;
                      const axis = (id === 'watchTimeHrs' && needsDual) ? 'right' : 'left';
                      return (
                        <Line key={id} yAxisId={axis} type="monotone"
                          dataKey={id} name={meta.label} stroke={meta.color}
                          strokeWidth={2.5} dot={false}
                          activeDot={{ r: 5, fill: meta.color, strokeWidth: 0 }} />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              );
            })()}
          </ChartCard>
        </div>

        {/* ── Category Summary Table with expandable channels ── */}
        <div style={{ background: v('bg-card'), border: `1px solid ${v('border-card')}`,
          borderRadius: 16, overflow: 'hidden', boxShadow: v('card-shadow'), marginBottom: 32 }}>
          <div style={{ padding: '18px 24px 14px', borderBottom: `1px solid ${v('border-light')}` }}>
            <h3 style={{ color: v('text-heading'), fontSize: 14, fontWeight: 900, margin: 0 }}>
              Category Summary
            </h3>
            <p style={{ color: v('text-label'), fontSize: 11, marginTop: 3, fontWeight: 600 }}>
              Click a category to see its channels · source: channel_nearrealtime_snapshot
            </p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: v('bg-table-header') }}>
                {['Category', 'Channels', 'Subscribers', 'Total Views', 'Videos'].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: h === 'Channels' ? 'center' : 'left',
                    color: v('text-table-header'), fontSize: 10, fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    borderBottom: `1px solid ${v('border-table')}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bizSummary.map(biz => {
                const isOpen = expandedCat === biz.id;
                return (
                  <>
                    {/* Business unit row */}
                    <tr key={biz.id}
                      onClick={() => setExpandedCat(isOpen ? null : biz.id)}
                      style={{ borderBottom: `1px solid ${v('border-table')}`,
                        background: isOpen ? v('bg-table-row-hover') : 'transparent',
                        cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = v('bg-table-row-hover'); }}
                      onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }}>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {isOpen
                            ? <ChevronDown size={14} color={v('accent')} />
                            : <ChevronRight size={14} color={v('text-placeholder')} />}
                          <span style={{ color: v('text-heading'), fontSize: 13, fontWeight: 800 }}>
                            {biz.label}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px', textAlign: 'center',
                        color: v('text-label'), fontSize: 12, fontWeight: 700 }}>
                        {biz.channels.length}
                      </td>
                      <td style={{ padding: '13px 16px', color: v('text-heading'), fontSize: 14, fontWeight: 900 }}>
                        {fmt(biz.subscribers)}
                      </td>
                      <td style={{ padding: '13px 16px', color: v('text-secondary'), fontSize: 13, fontWeight: 700 }}>
                        {fmt(biz.views)}
                      </td>
                      <td style={{ padding: '13px 16px', color: v('text-label'), fontSize: 13, fontWeight: 700 }}>
                        {fmt(biz.videos)}
                      </td>
                    </tr>

                    {/* Expanded channels */}
                    {isOpen && biz.channels.map((ch, ci) => {
                      const isChOpen = expandedChannel === ch.channel_id;
                      const chDaily  = channelAnalytics[ch.channel_id] || [];
                      const chLoading = channelAnalyticsLoading[ch.channel_id];
                      const CH_METRICS = [
                        { id: 'subscribersGained', label: 'Subs Gained', color: C.green,  fmtFn: fmt },
                        { id: 'netSubs',           label: 'Net Subs',    color: C.blue,   fmtFn: fmt },
                        { id: 'views',             label: 'Views',       color: C.purple, fmtFn: fmt },
                        { id: 'watchTimeHrs',      label: 'Watch Hrs',   color: C.amber,  fmtFn: fmtH },
                      ];
                      // active IDs: compare mode = multi-select, solo = single
                      const activeIds  = channelCompare ? channelSelected : [channelMetric];
                      // dual axis: watchTimeHrs on right, everything else on left
                      const needsDual  = activeIds.includes('watchTimeHrs') && activeIds.length > 1;
                      const toggleMetric = (id) => {
                        if (!channelCompare) { setChannelMetric(id); return; }
                        setChannelSelected(prev =>
                          prev.includes(id)
                            ? prev.length === 1 ? prev : prev.filter(x => x !== id)
                            : [...prev, id]
                        );
                      };
                      return (
                        <>
                          <tr key={ch.channel_id}
                            onClick={() => handleChannelRowClick(ch)}
                            style={{ borderBottom: isChOpen ? 'none' : `1px solid ${v('border-table')}`,
                              background: isChOpen ? v('bg-table-row-hover') : v('bg-table-row-alt'),
                              cursor: 'pointer', transition: 'background 0.15s' }}
                            onMouseEnter={e => { if (!isChOpen) e.currentTarget.style.background = v('bg-table-row-hover'); }}
                            onMouseLeave={e => { if (!isChOpen) e.currentTarget.style.background = v('bg-table-row-alt'); }}>
                            <td style={{ padding: '10px 16px 10px 44px', color: v('text-body'),
                              fontSize: 12, fontWeight: 700 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {isChOpen
                                  ? <ChevronDown size={12} color={v('accent')} />
                                  : <ChevronRight size={12} color={v('text-placeholder')} />}
                                <span style={{ color: v('row-number'), marginRight: 6, fontSize: 11 }}>{ci + 1}</span>
                                {ch.channel_name}
                              </div>
                            </td>
                            <td style={{ padding: '10px 16px', textAlign: 'center' }} />
                            <td style={{ padding: '10px 16px', color: v('text-heading'), fontSize: 13, fontWeight: 800 }}>
                              {fmt(ch.subscribers)}
                            </td>
                            <td style={{ padding: '10px 16px', color: v('text-secondary'), fontSize: 12, fontWeight: 700 }}>
                              {fmt(ch.total_views)}
                            </td>
                            <td style={{ padding: '10px 16px', color: v('text-label'), fontSize: 12, fontWeight: 700 }}>
                              {fmt(ch.total_videos)}
                            </td>
                          </tr>

                          {/* Inline channel chart */}
                          {isChOpen && (
                            <tr key={`${ch.channel_id}-chart`}
                              style={{ borderBottom: `1px solid ${v('border-table')}` }}>
                              <td colSpan={5} style={{ padding: '0 24px 20px 44px',
                                background: v('bg-table-row-alt') }}>

                                {/* Controls */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6,
                                  paddingTop: 14, marginBottom: 12, flexWrap: 'wrap' }}>
                                  {CH_METRICS.map(m => {
                                    const isActive = activeIds.includes(m.id);
                                    return (
                                      <button key={m.id}
                                        onClick={e => { e.stopPropagation(); toggleMetric(m.id); }}
                                        style={{
                                          padding: '5px 14px', borderRadius: 8, fontSize: 11,
                                          fontWeight: 800, cursor: 'pointer', transition: 'all 0.15s',
                                          border: `1.5px solid ${isActive ? m.color : v('border-card')}`,
                                          background: isActive ? v('bg-card') : 'transparent',
                                          color: isActive ? m.color : v('text-label'),
                                          boxShadow: isActive ? `0 0 0 2px ${m.color}22` : 'none',
                                        }}>
                                        {isActive && <span style={{ display: 'inline-block', width: 6,
                                          height: 6, borderRadius: '50%', background: m.color,
                                          marginRight: 6, verticalAlign: 'middle' }} />}
                                        {m.label}
                                      </button>
                                    );
                                  })}
                                  <div style={{ width: 1, height: 18, background: v('border-card'), margin: '0 6px' }} />
                                  <button onClick={e => {
                                    e.stopPropagation();
                                    const next = !channelCompare;
                                    setChannelCompare(next);
                                    if (!next) setChannelSelected([channelMetric]);
                                    else setChannelSelected([channelMetric]);
                                  }} style={{
                                    padding: '5px 16px', borderRadius: 8, fontSize: 11,
                                    fontWeight: 900, cursor: 'pointer', transition: 'all 0.15s',
                                    border: `1.5px solid ${channelCompare ? v('accent') : v('border-card')}`,
                                    background: channelCompare ? v('accent') : v('bg-input'),
                                    color: channelCompare ? '#fff' : v('text-secondary'),
                                    letterSpacing: '0.04em',
                                  }}>
                                    {channelCompare ? '✕ Exit Comparison' : '+ Comparison'}
                                  </button>
                                  <span style={{ marginLeft: 'auto', color: v('text-label'),
                                    fontSize: 11, fontWeight: 600 }}>
                                    {ch.channel_name} · {dateRange}
                                  </span>
                                </div>

                                {chLoading ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8,
                                    height: 180, justifyContent: 'center' }}>
                                    <Loader2 size={16} className="animate-spin" style={{ color: v('text-label') }} />
                                    <span style={{ color: v('text-label'), fontSize: 12 }}>Loading…</span>
                                  </div>
                                ) : chDaily.length === 0 ? (
                                  <div style={{ height: 180, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', color: v('text-label'), fontSize: 12 }}>
                                    No analytics data available for this period
                                  </div>
                                ) : (
                                  <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={chDaily}
                                      margin={{ top: 4, right: needsDual ? 56 : 8, left: 0, bottom: 0 }}>
                                      <CartesianGrid strokeDasharray="3 3" stroke={v('border-light')} vertical={false} />
                                      <XAxis dataKey="date" tick={{ fill: v('text-label'), fontSize: 9 }}
                                        tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false}
                                        interval="preserveStartEnd" />
                                      <YAxis yAxisId="left" tick={{ fill: v('text-label'), fontSize: 9 }}
                                        axisLine={false} tickLine={false} tickFormatter={fmt} width={52} />
                                      {needsDual && (
                                        <YAxis yAxisId="right" orientation="right"
                                          tick={{ fill: C.amber, fontSize: 9 }}
                                          axisLine={false} tickLine={false} tickFormatter={fmtH} width={52} />
                                      )}
                                      <Tooltip content={({ active, payload, label }) => {
                                        if (!active || !payload?.length) return null;
                                        return (
                                          <div style={{ background: v('bg-card'), border: `1px solid ${v('border-card')}`,
                                            borderRadius: 10, padding: '10px 14px', fontSize: 12,
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
                                            <p style={{ color: v('text-label'), marginBottom: 6, fontWeight: 700 }}>{label}</p>
                                            {payload.map((p, i) => {
                                              const meta = CH_METRICS.find(m => m.id === p.dataKey);
                                              return (
                                                <p key={i} style={{ color: p.color, fontWeight: 800, margin: '2px 0' }}>
                                                  {p.name}: {meta ? meta.fmtFn(p.value) : fmt(p.value)}
                                                </p>
                                              );
                                            })}
                                          </div>
                                        );
                                      }} />
                                      {activeIds.map(id => {
                                        const meta = CH_METRICS.find(m => m.id === id);
                                        if (!meta) return null;
                                        const axis = (id === 'watchTimeHrs' && needsDual) ? 'right' : 'left';
                                        return (
                                          <Line key={id} yAxisId={axis} type="monotone"
                                            dataKey={id} name={meta.label} stroke={meta.color}
                                            strokeWidth={2} dot={false}
                                            activeDot={{ r: 4, fill: meta.color, strokeWidth: 0 }} />
                                        );
                                      })}
                                    </LineChart>
                                  </ResponsiveContainer>
                                )}
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
