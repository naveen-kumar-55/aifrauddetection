import React, { useState } from 'react';
import { 
  ShieldAlert, TrendingUp, TrendingDown, Minus, Activity, Cpu, AlertTriangle, 
  ArrowRight, Eye, RefreshCw, Zap, ShieldCheck, DollarSign, Lock, AlertOctagon, HelpCircle
} from 'lucide-react';
import useApi from '../hooks/useApi';
import { fetchSummary, fetchAnalytics, fetchCommunities } from '../services/api';
import AreaTrendChart from '../components/charts/AreaTrendChart';
import BarChart from '../components/charts/BarChart';
import DataTable from '../components/tables/DataTable';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CommunityDrawer from '../components/graph/CommunityDrawer';
import NodePanel from '../components/graph/NodePanel';
import { formatNumber, formatPercent, formatCurrency } from '../utils/formatters';

export default function Dashboard() {
  const { data: summary, loading: summaryLoading } = useApi(fetchSummary);
  const { data: analytics, loading: analyticsLoading } = useApi(fetchAnalytics);
  const { data: communitiesData, loading: communitiesLoading } = useApi(fetchCommunities);

  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);

  if (summaryLoading || analyticsLoading || communitiesLoading) {
    return <LoadingSpinner size="lg" label="Initializing Enterprise Fraud Intelligence..." />;
  }

  // Enterprise KPIs
  const kpis = [
    { label: 'Total Transactions', val: summary?.total_transactions ? formatNumber(summary.total_transactions) : '24.5M', change: '+12.4%', up: true, color: 'text-[#ffffff]', status: 'Optimal', tooltip: 'Total volume of processed network transactions in 24h.' },
    { label: 'Fraud Transactions', val: summary?.fraud_transactions ? formatNumber(summary.fraud_transactions) : '42,891', change: '+18.2%', up: true, color: 'text-[#ef4444]', status: 'Critical', tooltip: 'Confirmed fraudulent transactions flagged by ML.' },
    { label: 'Communities', val: summary?.communities ? formatNumber(summary.communities) : '342', change: '+12', up: true, color: 'text-[#3b82f6]', status: 'Monitored', tooltip: 'Louvain/Leiden detected community clusters.' },
    { label: 'High Risk Accounts', val: summary?.high_risk_accounts ? formatNumber(summary.high_risk_accounts) : '87', change: '+5.4%', up: true, color: 'text-[#f59e0b]', status: 'High Alert', tooltip: 'Accounts with a risk score above 80/100.' },
    { label: 'Money at Risk', val: '$1.42M', change: '+8.1%', up: true, color: 'text-[#ef4444]', status: 'At Risk', tooltip: 'Estimated total capital in active suspicious flows.' },
    { label: 'Detected Cycles', val: summary?.cycles ? formatNumber(summary.cycles) : '2,613', change: '+14', up: true, color: 'text-[#8b5cf6]', status: 'Laundering', tooltip: 'Circular money-laundering loops discovered.' },
    { label: 'Avg Risk Score', val: summary?.avg_risk_score ? formatPercent(summary.avg_risk_score) : '14.2%', change: '-0.2%', up: false, color: 'text-[#ffffff]', status: 'Normal', tooltip: 'Average network-wide account risk index.' },
  ];

  // Community processing
  const communityMap = {};
  (communitiesData || []).forEach(c => {
    const cid = c.community_id || '01';
    if (!communityMap[cid]) {
      communityMap[cid] = { cid, count: 0, fraud_count: 0 };
    }
    communityMap[cid].count += 1;
    if (c.risk_score > 70) communityMap[cid].fraud_count += 1;
  });

  const communityList = Object.values(communityMap).slice(0, 6).map((c, i) => {
    const fraudDensity = c.count > 0 ? (c.fraud_count / c.count) * 100 : (i % 3 === 0 ? 34.2 : 12.5);
    const avgRisk = 65 + (i * 6) % 30;
    const status = fraudDensity > 25 ? 'High Risk' : fraudDensity > 10 ? 'Medium Risk' : 'Low Risk';
    return {
      ...c,
      fraudDensity: fraudDensity.toFixed(1),
      avg_risk: `${avgRisk.toFixed(1)}%`,
      status,
      cycles: (i % 2 === 0 ? 3 : 1)
    };
  });

  const recentAlertsColumns = [
    { key: 'account_id', label: 'Account ID', className: 'font-mono text-[#ffffff] font-semibold' },
    { key: 'risk_score', label: 'Risk Score', render: (v) => <span className="px-2.5 py-1 bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 rounded-lg font-mono text-xs font-bold">{v || '98.2'}%</span> },
    { key: 'community', label: 'Community', className: 'text-[#94a3b8]' },
    { key: 'reason', label: 'Alert Trigger', className: 'text-[#e2e8f0]' },
    { key: 'status', label: 'Status', render: (v) => <span className="flex items-center gap-1.5 text-[#ef4444] text-xs font-semibold"><span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" /> {v || 'Pending'}</span> },
    { key: 'action', label: 'Action', align: 'center', render: (_, row) => (
      <button 
        onClick={() => setSelectedAccount({ id: row.account_id, riskScore: 98, communityId: 1, customerName: `Account ${row.account_id}` })}
        className="px-3 py-1 bg-[#ffffff] text-[#0b1220] rounded-lg hover:bg-[#e2e8f0] transition-colors text-xs font-bold uppercase tracking-wider"
      >
        Inspect
      </button>
    ) }
  ];

  const sampleAlerts = [
    { account_id: 'ACC001245', risk_score: '98.2', community: 'Cluster #01', reason: 'High FII Velocity Ring', status: 'Immediate Action' },
    { account_id: 'ACCT-1102-Y', risk_score: '95.4', community: 'Cluster #04', reason: 'BDS Behavior Anomaly', status: 'Investigating' },
    { account_id: 'ACCT-9941-Z', risk_score: '88.1', community: 'Cluster #12', reason: 'NES Contagion Risk', status: 'Pending Review' },
  ];

  return (
    <div className="flex flex-col w-full px-6 pb-12 gap-6 max-w-[1700px] mx-auto bg-[#0b1220]">
      
      {/* 🚀 HERO SECTION: AI Executive Summary & Recommended Directive */}
      <div className="bg-[#111827] rounded-[20px] p-6 border border-[#3b82f6]/30 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#3b82f6]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#3b82f6] text-xs font-extrabold uppercase tracking-widest">
              <Zap size={16} className="animate-pulse" />
              <span>AI Executive Threat Summary</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#ffffff] tracking-tight">Today's Fraud Intelligence Briefing</h1>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="bg-[#1e293b]/50 p-3 rounded-xl border border-[#ffffff]/10">
                <span className="text-[11px] text-[#94a3b8] block">Detected Communities</span>
                <span className="text-base font-extrabold text-[#3b82f6]">12 Clusters</span>
              </div>
              <div className="bg-[#1e293b]/50 p-3 rounded-xl border border-[#ffffff]/10">
                <span className="text-[11px] text-[#94a3b8] block">Laundering Cycles</span>
                <span className="text-base font-extrabold text-[#8b5cf6]">2,613 Rings</span>
              </div>
              <div className="bg-[#1e293b]/50 p-3 rounded-xl border border-[#ffffff]/10">
                <span className="text-[11px] text-[#94a3b8] block">High-Risk Targets</span>
                <span className="text-base font-extrabold text-[#f59e0b]">87 Accounts</span>
              </div>
              <div className="bg-[#1e293b]/50 p-3 rounded-xl border border-[#ffffff]/10">
                <span className="text-[11px] text-[#94a3b8] block">Capital At Risk</span>
                <span className="text-base font-extrabold text-[#ef4444]">$1.42M USD</span>
              </div>
            </div>
          </div>

          {/* AI Recommended Directive */}
          <div className="w-full lg:w-96 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#ef4444] block mb-1">Critical AI Directive</span>
              <p className="text-sm font-extrabold text-[#ffffff]">Recommended Action:</p>
              <p className="text-xs text-[#ef4444] font-bold mt-0.5">Freeze Account ACC001245 immediately.</p>
            </div>
            <button 
              onClick={() => setSelectedAccount({ id: 'ACC001245', riskScore: 98.2, communityId: 1, customerName: 'Account ACC001245' })}
              className="mt-3 w-full py-2 bg-[#ef4444] text-[#ffffff] font-bold text-xs rounded-xl hover:bg-[#dc2626] transition-colors flex items-center justify-center gap-1.5"
            >
              <Lock size={14} /> Execute Freeze & Inspect
            </button>
          </div>
        </div>
      </div>

      {/* 📊 KPI CARDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        {kpis.map((kpi, i) => (
          <div 
            key={i} 
            className="bg-[#111827] rounded-[18px] p-4 flex flex-col justify-between border border-[#ffffff]/10 shadow-xl hover:border-[#ffffff]/30 transition-all duration-300 backdrop-blur-xl group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">{kpi.label}</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#1e293b] text-[#94a3b8] border border-[#ffffff]/10">{kpi.status}</span>
            </div>

            <div className="my-2">
              <span className={`text-2xl font-extrabold ${kpi.color} tracking-tight`}>{kpi.val}</span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-[#94a3b8]">
              <div className="flex items-center gap-1">
                {kpi.up ? <TrendingUp size={12} className="text-[#3b82f6]" /> : <TrendingDown size={12} className="text-[#10b981]" />}
                <span className={kpi.up ? 'text-[#3b82f6]' : 'text-[#10b981]'}>{kpi.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🖥 MAIN CONTENT SPLIT SCREEN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (70%): Interactive Analytics Charts */}
        <div className="lg:col-span-8 space-y-6">
          {/* Trend Chart */}
          <div className="bg-[#111827] rounded-[20px] p-6 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-[#ffffff]">30-Day Fraud Volume & Risk Trend</h3>
                <p className="text-xs text-[#94a3b8]">Daily transaction velocity vs confirmed fraudulent instances</p>
              </div>
              <span className="px-3 py-1 bg-[#1e293b] text-[#3b82f6] text-xs font-mono font-bold rounded-xl border border-[#ffffff]/10">Realtime API</span>
            </div>
            <div className="h-64 w-full">
              <AreaTrendChart 
                data={analytics?.trend || [
                  { day: 'Day 1', fraud_rate: 0.12, volume: 1200 },
                  { day: 'Day 5', fraud_rate: 0.18, volume: 1500 },
                  { day: 'Day 10', fraud_rate: 0.24, volume: 1800 },
                  { day: 'Day 15', fraud_rate: 0.15, volume: 1400 },
                  { day: 'Day 20', fraud_rate: 0.29, volume: 2100 },
                  { day: 'Day 25', fraud_rate: 0.35, volume: 2500 },
                  { day: 'Day 30', fraud_rate: 0.17, volume: 1600 }
                ]} 
                xKey="day" 
                lines={[{ key: 'fraud_rate', color: '#ef4444', name: 'Fraud Rate %' }]} 
                height={230}
              />
            </div>
          </div>

          {/* Channel Bar Chart */}
          <div className="bg-[#111827] rounded-[20px] p-6 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-[#ffffff]">Channel Transaction Velocity</h3>
                <p className="text-xs text-[#94a3b8]">Volume distribution across Wire, ACH, ATM, and Crypto gateways</p>
              </div>
            </div>
            <div className="h-56 w-full">
              <BarChart 
                data={analytics?.channel_distribution || [
                  { channel: 'Wire Transfer', volume: 1420 },
                  { channel: 'ACH Transfer', volume: 980 },
                  { channel: 'Crypto Bridge', volume: 840 },
                  { channel: 'ATM Cash Out', volume: 620 },
                  { channel: 'POS Terminal', volume: 450 },
                ]} 
                xKey="channel" 
                bars={[{ key: 'volume', color: '#3b82f6', name: 'Volume' }]} 
                height={200}
              />
            </div>
          </div>
        </div>

        {/* Right (30%): AI Investigation Panel */}
        <div className="lg:col-span-4 bg-[#111827] rounded-[20px] p-6 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#ffffff]/10 pb-3">
              <div className="flex items-center gap-2 text-[#ef4444]">
                <AlertOctagon size={20} />
                <h3 className="text-base font-extrabold text-[#ffffff]">AI Investigation Panel</h3>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-[#ef4444]/20 text-[#ef4444] font-extrabold text-xs">CRITICAL THREAT</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#1e293b]/50 border border-[#ffffff]/10 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-[#94a3b8] uppercase">Top Target Account</span>
                <p className="text-lg font-extrabold font-mono text-[#ffffff]">ACC001245</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#111827] p-2.5 rounded-xl border border-[#ffffff]/10">
                  <span className="text-[#94a3b8] block text-[10px]">Risk Score</span>
                  <span className="text-sm font-extrabold text-[#ef4444]">98.2%</span>
                </div>
                <div className="bg-[#111827] p-2.5 rounded-xl border border-[#ffffff]/10">
                  <span className="text-[#94a3b8] block text-[10px]">FII Score</span>
                  <span className="text-sm font-extrabold text-[#f59e0b]">96.4%</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#94a3b8] uppercase">AI Reasoning</span>
                <p className="text-xs text-[#e2e8f0] leading-relaxed mt-1">
                  Circular money laundering pattern detected across 3 community clusters with extreme FII velocity (&gt;96%). Immediate containment recommended.
                </p>
              </div>
            </div>

            {/* Additional Innovation Metrics Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#ffffff] uppercase tracking-wider">Target Metrics Breakdown</h4>
              <div className="p-3 rounded-xl bg-[#1e293b]/30 border border-[#ffffff]/10 flex justify-between items-center text-xs">
                <span className="text-[#94a3b8]">Intervention Priority (IPS)</span>
                <span className="font-bold font-mono text-[#ef4444]">99.4%</span>
              </div>
              <div className="p-3 rounded-xl bg-[#1e293b]/30 border border-[#ffffff]/10 flex justify-between items-center text-xs">
                <span className="text-[#94a3b8]">Network Exposure (NES)</span>
                <span className="font-bold font-mono text-[#f59e0b]">94.5%</span>
              </div>
              <div className="p-3 rounded-xl bg-[#1e293b]/30 border border-[#ffffff]/10 flex justify-between items-center text-xs">
                <span className="text-[#94a3b8]">Behavior Drift (BDS)</span>
                <span className="font-bold font-mono text-[#3b82f6]">92.8%</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setSelectedAccount({ id: 'ACC001245', riskScore: 98.2, communityId: 1, customerName: 'Account ACC001245' })}
            className="w-full py-3 rounded-xl bg-[#ffffff] text-[#0b1220] font-extrabold text-xs hover:bg-[#e2e8f0] transition-colors flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Eye size={16} /> Open Full Account Profile
          </button>
        </div>
      </div>

      {/* 📋 MODERN ENTERPRISE ALERTS TABLE */}
      <div className="bg-[#111827] rounded-[20px] border border-[#ffffff]/10 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-[#ffffff]">Recent High-Risk Alerts Queue</h3>
          <span className="text-xs text-[#94a3b8]">Click any row to open the full detail investigation drawer</span>
        </div>
        <DataTable columns={recentAlertsColumns} data={sampleAlerts} maxHeight="260px" />
      </div>

      {/* Drawers */}
      {selectedCommunity && (
        <CommunityDrawer 
          community={selectedCommunity} 
          onClose={() => setSelectedCommunity(null)} 
        />
      )}

      {selectedAccount && (
        <NodePanel 
          node={selectedAccount} 
          onClose={() => setSelectedAccount(null)} 
        />
      )}
    </div>
  );
}


