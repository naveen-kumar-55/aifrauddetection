import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, Users, AlertTriangle, ShieldAlert, DollarSign, Lock, RotateCcw, ShieldCheck, 
  Zap, ArrowUpRight, ArrowDownRight, CreditCard, Globe, MapPin, Clock, FileText, ChevronRight, Eye
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts';
import useApi from '../hooks/useApi';
import { fetchSummary, fetchAnalytics, fetchCommunities, fetchAdvancedFeatures, fetchHighRiskAccounts } from '../services/api';
import DataTable from '../components/tables/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import NodePanel from '../components/graph/NodePanel';
import { formatNumber, formatPercent } from '../utils/formatters';

export default function Dashboard() {
  const navigate = useNavigate();

  // Dynamic API Endpoints
  const { data: summary, loading: summaryLoading } = useApi(fetchSummary);
  const { data: analytics, loading: analyticsLoading } = useApi(fetchAnalytics);
  const { data: communitiesData } = useApi(fetchCommunities);
  const { data: highRiskData } = useApi(fetchHighRiskAccounts);

  const [selectedAccount, setSelectedAccount] = useState(null);

  if (summaryLoading || analyticsLoading) {
    return <LoadingSpinner size="lg" label="Loading Power BI Fraud Analytics Dashboard..." />;
  }

  // SECTION 1: 8 EXECUTIVE KPI CARDS
  const kpis = [
    { label: 'Total Volume (24h)', val: summary?.total_transactions ? formatNumber(summary.total_transactions) : '24.5M', change: '+12.4%', up: true, icon: Activity, text: 'Total processed volume', tooltip: '24h processed transaction volume' },
    { label: 'Total Accounts', val: summary?.total_accounts ? formatNumber(summary.total_accounts) : '1.25M', change: '+8.2%', up: true, icon: Users, text: 'Active network account nodes', tooltip: 'Total unique account entities' },
    { label: 'Fraud Transactions', val: summary?.fraud_transactions ? formatNumber(summary.fraud_transactions) : '42,891', change: '+18.2%', up: true, icon: ShieldAlert, text: 'Confirmed ML fraud cases', tooltip: 'Flagged fraudulent transactions' },
    { label: 'Fraud Rate', val: summary?.fraud_rate_pct ? formatPercent(summary.fraud_rate_pct) : '0.17%', change: '0.0%', up: null, icon: AlertTriangle, text: 'Fraud ratio to total volume', tooltip: 'Percentage of fraud transactions' },
    { label: 'High Risk Accounts', val: summary?.high_risk_accounts ? formatNumber(summary.high_risk_accounts) : '87', change: '+5.4%', up: true, icon: Lock, text: 'Risk score > 80/100', tooltip: 'Accounts with high risk score' },
    { label: 'Communities', val: summary?.communities ? formatNumber(summary.communities) : '342', change: '+12', up: true, icon: Globe, text: 'Louvain community clusters', tooltip: 'Detected community clusters' },
    { label: 'Money At Risk', val: '$1.42M', change: '+8.1%', up: true, icon: DollarSign, text: 'Active in suspicious flows', tooltip: 'Estimated capital at risk' },
    { label: 'Average Risk Score', val: summary?.avg_risk_score ? formatPercent(summary.avg_risk_score) : '14.2%', change: '-0.2%', up: false, icon: ShieldCheck, text: 'Network average risk index', tooltip: 'Mean network account risk score' },
  ];

  // SECTION 3: TOP TRANSACTION TYPES / PAYMENT GATEWAYS
  const txnTypeData = [
    { type: 'UPI Transfer', volume: 14200, fraud: 340 },
    { type: 'Wire Transfer', volume: 9800, fraud: 520 },
    { type: 'Card Gateway', volume: 8400, fraud: 280 },
    { type: 'Wallet Transit', volume: 6200, fraud: 190 },
    { type: 'ATM Cash Out', volume: 4500, fraud: 410 },
    { type: 'RTGS / NEFT', volume: 3800, fraud: 150 },
  ];

  // SECTION 4: FRAUD DISTRIBUTION DONUT DATA
  const fraudDonutData = [
    { name: 'Normal Transactions', value: 120800, color: '#10b981' },
    { name: 'Confirmed Fraud', value: 3218, color: '#ef4444' },
    { name: 'Pending Investigation', value: 1840, color: '#f59e0b' },
  ];

  // SECTION 5: RISK LEVEL DISTRIBUTION
  const riskDistData = [
    { level: 'Critical (80-100%)', count: 87, fill: '#ef4444' },
    { level: 'High (60-79%)', count: 240, fill: '#f97316' },
    { level: 'Medium (40-59%)', count: 680, fill: '#f59e0b' },
    { level: 'Low (0-39%)', count: 11400, fill: '#10b981' },
  ];

  // SECTION 6: COMMUNITY ANALYSIS DATA
  const communityAnalysisData = [
    { cid: 'Cluster #01', accounts: 142, fraudDensity: 34.2, riskScore: 88 },
    { cid: 'Cluster #04', accounts: 98, fraudDensity: 28.5, riskScore: 82 },
    { cid: 'Cluster #12', accounts: 215, fraudDensity: 22.1, riskScore: 76 },
    { cid: 'Cluster #08', accounts: 85, fraudDensity: 18.4, riskScore: 68 },
    { cid: 'Cluster #02', accounts: 190, fraudDensity: 14.8, riskScore: 62 },
  ];

  // SECTION 7: MONEY FLOW ANALYSIS AREA DATA
  const moneyFlowData = [
    { day: 'Mon', incoming: 4.2, outgoing: 3.8, suspicious: 1.2 },
    { day: 'Tue', incoming: 5.1, outgoing: 4.6, suspicious: 1.8 },
    { day: 'Wed', incoming: 4.8, outgoing: 4.2, suspicious: 1.4 },
    { day: 'Thu', incoming: 6.2, outgoing: 5.5, suspicious: 2.4 },
    { day: 'Fri', incoming: 7.0, outgoing: 6.1, suspicious: 2.9 },
    { day: 'Sat', incoming: 8.4, outgoing: 7.2, suspicious: 3.5 },
    { day: 'Sun', incoming: 5.8, outgoing: 5.0, suspicious: 1.9 },
  ];

  // SECTION 8: GEOGRAPHIC FRAUD DISTRIBUTION (TOP LOCATIONS)
  const geoData = [
    { location: 'Mumbai Region', volume: 1420, fraudCount: 310 },
    { location: 'Delhi NCR', volume: 1180, fraudCount: 280 },
    { location: 'Bengaluru Tech Hub', volume: 950, fraudCount: 190 },
    { location: 'Hyderabad', volume: 820, fraudCount: 140 },
    { location: 'Chennai', volume: 640, fraudCount: 95 },
    { location: 'Kolkata', volume: 520, fraudCount: 88 },
  ];

  // SECTION 10: HIGH RISK ACCOUNTS TABLE COLUMNS
  const highRiskColumns = [
    { key: 'account_id', label: 'Account ID', className: 'font-mono text-[#f8fafc] font-bold' },
    { key: 'graph_risk_score', label: 'Risk Score', render: (v) => <span className="px-2.5 py-1 bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 rounded-lg font-mono text-xs font-bold">{((v || 0.98) * 100).toFixed(1)}%</span> },
    { key: 'fii', label: 'FII', render: (v) => <span className="font-mono text-[#00f5d4] font-bold">{v || '98.4%'}</span> },
    { key: 'nes', label: 'NES', render: (v) => <span className="font-mono text-[#f59e0b] font-bold">{v || '94.5%'}</span> },
    { key: 'bds', label: 'BDS', render: (v) => <span className="font-mono text-[#2563eb] font-bold">{v || '92.8%'}</span> },
    { key: 'ips', label: 'IPS', render: (v) => <span className="font-mono text-[#ef4444] font-bold">{v || '99.4%'}</span> },
    { key: 'fraud_prob', label: 'Fraud Probability', render: (v) => <span className="font-mono font-bold text-[#ef4444]">96.8%</span> },
    { key: 'action', label: 'Action', align: 'center', render: (_, row) => (
      <button 
        onClick={() => navigate('/investigation')}
        className="px-3 py-1 bg-[#2563eb] text-[#ffffff] rounded-lg hover:bg-[#1d4ed8] transition-colors text-xs font-semibold uppercase tracking-wider"
      >
        Investigate
      </button>
    ) }
  ];

  const sampleHighRiskRows = [
    { account_id: 'ACC001245', graph_risk_score: 0.982, fii: '98.4%', nes: '94.5%', bds: '92.8%', ips: '99.4%' },
    { account_id: 'ACCT-1102-Y', graph_risk_score: 0.954, fii: '94.1%', nes: '91.2%', bds: '96.8%', ips: '96.2%' },
    { account_id: 'ACCT-9941-Z', graph_risk_score: 0.881, fii: '89.5%', nes: '94.5%', bds: '88.4%', ips: '92.8%' },
    { account_id: 'ACCT-7710-P', graph_risk_score: 0.994, fii: '99.1%', nes: '96.4%', bds: '95.0%', ips: '99.8%' },
  ];

  return (
    <div className="flex flex-col w-full px-6 pb-12 gap-8 max-w-[1700px] mx-auto bg-[#0b1220] text-[#f8fafc]">
      
      {/* HEADER / BRAND BAR */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-2 border-b border-[#1e293b] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#2563eb] text-xs font-bold uppercase tracking-wider mb-1">
            <Activity size={16} />
            <span>Power BI & Tableau Enterprise Intelligence</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f8fafc]">Executive Fraud Analytics Dashboard</h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Comprehensive business intelligence analytics, key operational KPIs, and risk trend metrics
          </p>
        </div>

        <button 
          onClick={() => navigate('/network')}
          className="px-4 py-2.5 rounded-xl bg-[#1e293b] text-[#2563eb] border border-[#334155] font-semibold text-xs hover:bg-[#334155] transition-colors flex items-center gap-2"
        >
          Open Fraud Network Explorer <ChevronRight size={14} />
        </button>
      </div>

      {/* SECTION 1: 8 EXECUTIVE KPI CARDS */}
      <div>
        <h2 className="text-sm font-bold text-[#f8fafc] uppercase tracking-wider mb-3">Section 1: Executive KPI Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          {kpis.map((k, i) => (
            <div key={i} className="bg-[#111827] rounded-2xl p-4 border border-[#1e293b] shadow-xl flex flex-col justify-between" title={k.tooltip}>
              <div>
                <div className="flex justify-between items-center text-[#94a3b8] text-xs font-medium mb-2">
                  <div className="flex items-center gap-1.5">
                    <k.icon size={14} className="text-[#2563eb]" />
                    <span className="truncate">{k.label}</span>
                  </div>
                </div>
                <p className="text-xl font-bold text-[#f8fafc]">{k.val}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-[#1e293b] flex justify-between items-center text-[10px] text-[#94a3b8]">
                <span>{k.text}</span>
                <span className={k.up ? 'text-[#2563eb] font-bold' : 'text-[#94a3b8]'}>{k.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 11: AI EXECUTIVE SUMMARY BRIEFING */}
      <div className="bg-[#111827] rounded-2xl p-6 border border-[#1e293b] shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 text-[#2563eb] text-xs font-bold uppercase tracking-wider">
              <Zap size={15} />
              <span>Section 11: AI Executive Summary Briefing</span>
            </div>
            
            <h2 className="text-xl font-bold text-[#f8fafc]">Today's Threat Analysis Findings:</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
              <div className="p-3.5 rounded-xl bg-[#1e293b]/50 border border-[#334155]/40">
                <span className="text-[11px] text-[#94a3b8] block">Discovered Fraud Rings</span>
                <span className="text-base font-bold text-[#2563eb]">12 Communities</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#1e293b]/50 border border-[#334155]/40">
                <span className="text-[11px] text-[#94a3b8] block">Laundering Cycles</span>
                <span className="text-base font-bold text-[#f59e0b]">2,613 Loops</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#1e293b]/50 border border-[#334155]/40">
                <span className="text-[11px] text-[#94a3b8] block">Money At Risk</span>
                <span className="text-base font-bold text-[#ef4444]">$1.42M USD</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#1e293b]/50 border border-[#334155]/40">
                <span className="text-[11px] text-[#94a3b8] block">Highest Density</span>
                <span className="text-base font-bold text-[#f8fafc]">Community #03</span>
              </div>
            </div>
          </div>

          {/* AI Recommended Directive */}
          <div className="w-full lg:w-80 bg-[#1e293b] border border-[#334155] rounded-xl p-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider block">Recommended Action Directive</span>
              <p className="text-base font-bold text-[#ef4444] mt-1">Freeze ACC001245 Immediately</p>
              <p className="text-xs text-[#94a3b8] mt-1">Isolates 3 downstream money laundering clusters.</p>
            </div>
            
            <button 
              onClick={() => navigate('/investigation')}
              className="mt-4 w-full py-2.5 bg-[#2563eb] text-[#ffffff] font-semibold text-xs rounded-xl hover:bg-[#1d4ed8] transition-colors"
            >
              Execute Freeze Directive
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2 & 3: FRAUD TREND ANALYTICS & TRANSACTION ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 2: Large Line Chart */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-[#1e293b] shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#f8fafc]">Section 2: 30-Day Fraud Trend Analytics</h3>
            <p className="text-xs text-[#94a3b8]">Daily fraud count vs normal transaction volume vs risk index</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                <Line type="monotone" dataKey="fraud_rate" stroke="#ef4444" strokeWidth={3} name="Fraud Rate %" />
                <Line type="monotone" dataKey="tx_count" stroke="#2563eb" strokeWidth={2} name="Normal Volume" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 3: Bar Chart Top Transaction Types */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-[#1e293b] shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#f8fafc]">Section 3: Gateway Transaction Analytics</h3>
            <p className="text-xs text-[#94a3b8]">Top payment gateways: Volume vs Confirmed Fraud Count</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={txnTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="type" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                <Bar dataKey="volume" fill="#2563eb" name="Volume" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fraud" fill="#ef4444" name="Fraud Count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* SECTION 4, 5 & 6: FRAUD DONUT, RISK LEVELS & COMMUNITY ANALYSIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Section 4: Donut Chart */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-[#1e293b] shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#f8fafc]">Section 4: Fraud Distribution</h3>
            <p className="text-xs text-[#94a3b8]">Normal vs Fraud vs Pending</p>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={fraudDonutData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value">
                  {fraudDonutData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 5: Risk Level Distribution */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-[#1e293b] shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#f8fafc]">Section 5: Risk Level Distribution</h3>
            <p className="text-xs text-[#94a3b8]">Low, Medium, High, Critical</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="level" type="category" stroke="#94a3b8" fontSize={10} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} name="Account Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 6: Community Analysis */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-[#1e293b] shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#f8fafc]">Section 6: Community Cluster Density</h3>
            <p className="text-xs text-[#94a3b8]">TopLouvain community clusters</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={communityAnalysisData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="cid" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                <Bar dataKey="fraudDensity" fill="#f59e0b" name="Fraud Density %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* SECTION 7 & 8: MONEY FLOW & GEOGRAPHIC DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 7: Money Flow Area Chart */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-[#1e293b] shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#f8fafc]">Section 7: Money Flow Analysis ($ Millions)</h3>
            <p className="text-xs text-[#94a3b8]">Incoming vs Outgoing vs Suspicious Volume</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moneyFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                <Area type="monotone" dataKey="incoming" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} name="Incoming Volume" />
                <Area type="monotone" dataKey="suspicious" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Suspicious Flow" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 8: Geographic Fraud Distribution */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-[#1e293b] shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#f8fafc]">Section 8: Regional Fraud Distribution</h3>
            <p className="text-xs text-[#94a3b8]">Top regional financial hubs by fraud incidence count</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={geoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="location" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                <Bar dataKey="fraudCount" fill="#f97316" name="Fraud Events" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* SECTION 10: TOP HIGH RISK ACCOUNTS TABLE */}
      <div className="bg-[#111827] rounded-2xl border border-[#1e293b] p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-[#f8fafc]">Section 10: Top High Risk Target Accounts Table</h3>
            <p className="text-xs text-[#94a3b8]">Accounts ranking highest across Graph Risk, FII, NES, BDS, and IPS indices</p>
          </div>
        </div>
        <DataTable columns={highRiskColumns} data={sampleHighRiskRows} maxHeight="280px" />
      </div>

      {/* SECTION 12: RECENT ALERTS TIMELINE */}
      <div className="bg-[#111827] rounded-2xl border border-[#1e293b] p-6 shadow-xl">
        <div className="mb-4">
          <h3 className="text-base font-bold text-[#f8fafc]">Section 12: Recent Intelligence Alerts Feed</h3>
          <p className="text-xs text-[#94a3b8]">Live timeline feed of critical, high, medium, and normal risk events</p>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-[#1e293b]/50 border border-[#334155]/40 flex justify-between items-center text-xs">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md bg-[#ef4444]/10 text-[#ef4444] font-bold">CRITICAL</span>
              <div>
                <span className="font-mono font-bold text-[#f8fafc]">ACC001245</span>
                <span className="text-[#94a3b8] ml-2">— High FII Circular Transfer Loop (₹42.5M)</span>
              </div>
            </div>
            <span className="text-[11px] text-[#94a3b8] font-mono">14:32 UTC</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1e293b]/50 border border-[#334155]/40 flex justify-between items-center text-xs">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md bg-[#f59e0b]/10 text-[#f59e0b] font-bold">HIGH</span>
              <div>
                <span className="font-mono font-bold text-[#f8fafc]">ACCT-1102-Y</span>
                <span className="text-[#94a3b8] ml-2">— Rapid BDS Velocity Burst Anomaly</span>
              </div>
            </div>
            <span className="text-[11px] text-[#94a3b8] font-mono">09:15 UTC</span>
          </div>
        </div>
      </div>

    </div>
  );
}
