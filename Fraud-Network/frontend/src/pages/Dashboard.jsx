import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, TrendingUp, TrendingDown, Minus, Activity, Users, AlertTriangle, 
  Eye, Zap, DollarSign, Lock, RotateCcw, Cpu, AlertOctagon, CheckCircle2, ShieldCheck
} from 'lucide-react';
import useApi from '../hooks/useApi';
import { fetchSummary, fetchAnalytics, fetchCommunities } from '../services/api';
import AreaTrendChart from '../components/charts/AreaTrendChart';
import BarChart from '../components/charts/BarChart';
import DataTable from '../components/tables/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CommunityDrawer from '../components/graph/CommunityDrawer';
import NodePanel from '../components/graph/NodePanel';
import { formatNumber, formatPercent } from '../utils/formatters';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: summary, loading: summaryLoading } = useApi(fetchSummary);
  const { data: analytics, loading: analyticsLoading } = useApi(fetchAnalytics);
  const { data: communitiesData, loading: communitiesLoading } = useApi(fetchCommunities);

  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // 8 Executive KPI Cards
  const kpis = [
    { label: 'Total Transactions', val: summary?.total_transactions ? formatNumber(summary.total_transactions) : '24.5M', change: '+12.4%', up: true, icon: Activity, text: 'Total volume processed in last 24h' },
    { label: 'Fraud Transactions', val: summary?.fraud_transactions ? formatNumber(summary.fraud_transactions) : '42,891', change: '+18.2%', up: true, icon: ShieldAlert, text: 'Confirmed ML fraud instances' },
    { label: 'Fraud Rate', val: summary?.fraud_rate_pct ? formatPercent(summary.fraud_rate_pct) : '0.17%', change: '0.0%', up: null, icon: AlertTriangle, text: 'Fraud volume ratio to total' },
    { label: 'Communities', val: summary?.communities ? formatNumber(summary.communities) : '342', change: '+12', up: true, icon: Users, text: 'Active Louvain clusters' },
    { label: 'High Risk Accounts', val: summary?.high_risk_accounts ? formatNumber(summary.high_risk_accounts) : '87', change: '+5.4%', up: true, icon: Lock, text: 'Risk score above 80/100' },
    { label: 'Money At Risk', val: '$1.42M', change: '+8.1%', up: true, icon: DollarSign, text: 'Capital in suspicious flows' },
    { label: 'Detected Cycles', val: summary?.cycles ? formatNumber(summary.cycles) : '2,613', change: '+14', up: true, icon: RotateCcw, text: 'Circular laundering loops' },
    { label: 'Average Risk Score', val: summary?.avg_risk_score ? formatPercent(summary.avg_risk_score) : '14.2%', change: '-0.2%', up: false, icon: ShieldCheck, text: 'Network average risk index' },
  ];

  const recentAlertsColumns = [
    { key: 'account_id', label: 'Account ID', className: 'font-mono text-[#f8fafc] font-semibold' },
    { key: 'risk_score', label: 'Risk Score', render: (v) => <span className="px-2.5 py-1 bg-[#ff2a6d]/10 text-[#ff2a6d] border border-[#ff2a6d]/20 rounded-lg font-mono text-xs font-bold">{v || '98.2'}%</span> },
    { key: 'community', label: 'Community Cluster', className: 'text-[#8e9bae]' },
    { key: 'reason', label: 'Alert Trigger', className: 'text-[#f8fafc]' },
    { key: 'status', label: 'Status', render: (v) => <span className="flex items-center gap-1.5 text-[#ff2a6d] text-xs font-bold"><span className="w-2 h-2 rounded-full bg-[#ff2a6d] animate-ping" /> {v || 'Pending Action'}</span> },
    { key: 'action', label: 'Action', align: 'center', render: (_, row) => (
      <button 
        onClick={() => setSelectedAccount({ id: row.account_id, riskScore: 98.2, communityId: 1, customerName: `Account ${row.account_id}` })}
        className="px-3 py-1 bg-[#00f5d4] text-[#090a0f] rounded-lg hover:bg-[#00d6b9] transition-colors text-xs font-bold uppercase tracking-wider"
      >
        Inspect
      </button>
    ) }
  ];

  const sampleAlerts = [
    { account_id: 'ACC001245', risk_score: '98.2', community: 'Cluster #01', reason: 'High FII Velocity Ring', status: 'Immediate Action' },
    { account_id: 'ACCT-1102-Y', risk_score: '95.4', community: 'Cluster #04', reason: 'Behavior Drift Anomaly (BDS)', status: 'Investigating' },
    { account_id: 'ACCT-9941-Z', risk_score: '88.1', community: 'Cluster #12', reason: 'Network Exposure Contagion (NES)', status: 'Pending Review' },
    { account_id: 'ACCT-7710-P', risk_score: '99.4', community: 'Cluster #02', reason: 'Intervention Priority Target (IPS)', status: 'Immediate Freeze' },
  ];

  return (
    <div className="flex flex-col w-full px-6 pb-12 gap-8 max-w-[1700px] mx-auto bg-[#090a0f]">
      
      {/* SECTION 1: AI EXECUTIVE SUMMARY (HERO CARD) */}
      <div className="bg-[#12151e] rounded-2xl p-6 border border-[#222738] shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 text-[#00f5d4] text-xs font-bold uppercase tracking-wider">
              <Zap size={15} />
              <span>Today's Executive AI Status Briefing</span>
            </div>
            
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#f8fafc]">Today's Risk Level:</h1>
              <span className="px-3 py-1 rounded-full bg-[#ff2a6d]/10 text-[#ff2a6d] border border-[#ff2a6d]/20 text-xs font-extrabold uppercase tracking-wider">HIGH THREAT LEVEL</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              <div className="p-3.5 rounded-xl bg-[#1a1e2e]/60 border border-[#2e354b]/50">
                <span className="text-[11px] text-[#8e9bae] block">Detected Fraud Rings</span>
                <span className="text-base font-bold text-[#00f5d4]">12 Clusters</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#1a1e2e]/60 border border-[#2e354b]/50">
                <span className="text-[11px] text-[#8e9bae] block">High Risk Accounts</span>
                <span className="text-base font-bold text-[#ffb800]">87 Accounts</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#1a1e2e]/60 border border-[#2e354b]/50">
                <span className="text-[11px] text-[#8e9bae] block">Money At Risk</span>
                <span className="text-base font-bold text-[#ff2a6d]">$1.42M USD</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#1a1e2e]/60 border border-[#2e354b]/50">
                <span className="text-[11px] text-[#8e9bae] block">Target Account</span>
                <span className="text-base font-mono font-bold text-[#f8fafc]">ACC001245</span>
              </div>
            </div>
          </div>

          {/* AI Action Box */}
          <div className="w-full lg:w-96 bg-[#1a1e2e] border border-[#2e354b] rounded-xl p-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#8e9bae] uppercase tracking-wider block">AI Recommended Directive</span>
              <p className="text-base font-bold text-[#ff2a6d] mt-1">Freeze Account ACC001245</p>
              <p className="text-xs text-[#8e9bae] mt-1">Connected to 8 fraud accounts across 3 laundering cycles.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button 
                onClick={() => navigate('/investigation')}
                className="py-2.5 bg-[#00f5d4] text-[#090a0f] font-extrabold text-xs rounded-xl hover:bg-[#00d6b9] transition-colors flex items-center justify-center gap-1.5"
              >
                Investigate
              </button>
              <button 
                onClick={() => navigate('/intervention')}
                className="py-2.5 bg-[#12151e] text-[#f8fafc] border border-[#2e354b] font-semibold text-xs rounded-xl hover:bg-[#1a1e2e] transition-colors flex items-center justify-center gap-1.5"
              >
                Run Simulation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: EXECUTIVE KPI CARDS (8 CARDS) */}
      <div>
        <div className="mb-3">
          <h2 className="text-base font-bold text-[#f8fafc]">Executive KPI Metrics</h2>
          <p className="text-xs text-[#8e9bae]">High-level network performance & risk exposure metrics</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          {kpis.map((k, i) => (
            <div key={i} className="bg-[#12151e] rounded-2xl p-4 border border-[#222738] shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-[#8e9bae] text-xs font-medium mb-2">
                  <div className="flex items-center gap-1.5">
                    <k.icon size={14} className="text-[#00f5d4]" />
                    <span className="truncate">{k.label}</span>
                  </div>
                </div>
                <p className="text-xl font-bold text-[#f8fafc]">{k.val}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-[#222738] flex justify-between items-center text-[10px] text-[#8e9bae]">
                <span>{k.text}</span>
                <span className={k.up ? 'text-[#00f5d4] font-bold' : 'text-[#8e9bae]'}>{k.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: ANALYTICS DASHBOARD (BUSINESS CHARTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 30-Day Fraud & Risk Rate Trend */}
        <div className="bg-[#12151e] rounded-2xl p-6 border border-[#222738] shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-[#f8fafc]">Fraud & Risk Rate Trend</h3>
              <p className="text-xs text-[#8e9bae]">30-day historical volume vs confirmed fraudulent instances</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <AreaTrendChart 
              data={analytics?.trend || []} 
              xKey="day" 
              lines={[{ key: 'fraud_rate', color: '#ff2a6d', name: 'Fraud Rate %' }]} 
              height={230}
            />
          </div>
        </div>

        {/* Transaction Gateway Velocity */}
        <div className="bg-[#12151e] rounded-2xl p-6 border border-[#222738] shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-[#f8fafc]">Transaction Gateway Velocity</h3>
              <p className="text-xs text-[#8e9bae]">Volume distribution across Wire, ACH, Crypto, and ATM channels</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <BarChart 
              data={analytics?.channel_distribution || []} 
              xKey="channel" 
              bars={[{ key: 'volume', color: '#00f5d4', name: 'Volume' }]} 
              height={230}
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: AI INSIGHTS */}
      <div>
        <div className="mb-3">
          <h2 className="text-base font-bold text-[#f8fafc]">AI Fraud Intelligence Insights</h2>
          <p className="text-xs text-[#8e9bae]">Automated AI rankings for top risk accounts & threat clusters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-[#12151e] p-4 rounded-2xl border border-[#222738] shadow-xl space-y-2">
            <span className="text-[10px] font-bold text-[#8e9bae] uppercase">Top Dangerous Community</span>
            <p className="text-lg font-bold text-[#ff2a6d]">Cluster #01</p>
            <p className="text-xs text-[#8e9bae]">Fraud Density: <strong className="text-[#ff2a6d]">34.2%</strong></p>
          </div>

          <div className="bg-[#12151e] p-4 rounded-2xl border border-[#222738] shadow-xl space-y-2">
            <span className="text-[10px] font-bold text-[#8e9bae] uppercase">Most Influential Account</span>
            <p className="text-lg font-mono font-bold text-[#f8fafc]">ACC-8923-X</p>
            <p className="text-xs text-[#8e9bae]">Fraud Influence Index: <strong className="text-[#00f5d4]">98.4%</strong></p>
          </div>

          <div className="bg-[#12151e] p-4 rounded-2xl border border-[#222738] shadow-xl space-y-2">
            <span className="text-[10px] font-bold text-[#8e9bae] uppercase">Highest Behavior Drift</span>
            <p className="text-lg font-mono font-bold text-[#f8fafc]">ACC-4412-Z</p>
            <p className="text-xs text-[#8e9bae]">Behavior Drift Score: <strong className="text-[#00f5d4]">96.8%</strong></p>
          </div>

          <div className="bg-[#12151e] p-4 rounded-2xl border border-[#222738] shadow-xl space-y-2">
            <span className="text-[10px] font-bold text-[#8e9bae] uppercase">Highest Exposure Score</span>
            <p className="text-lg font-mono font-bold text-[#f8fafc]">ACC-7721-M</p>
            <p className="text-xs text-[#8e9bae]">Network Exposure: <strong className="text-[#ffb800]">94.5%</strong></p>
          </div>

          <div className="bg-[#12151e] p-4 rounded-2xl border border-[#222738] shadow-xl space-y-2">
            <span className="text-[10px] font-bold text-[#8e9bae] uppercase">Highest Intervention Priority</span>
            <p className="text-lg font-mono font-bold text-[#f8fafc]">ACC-7710-P</p>
            <p className="text-xs text-[#8e9bae]">Intervention Priority: <strong className="text-[#ff2a6d]">99.4%</strong></p>
          </div>
        </div>
      </div>

      {/* SECTION 5: RECENT ALERTS */}
      <div className="bg-[#12151e] rounded-2xl border border-[#222738] p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-[#f8fafc]">Recent Critical Risk Alerts Queue</h3>
            <p className="text-xs text-[#8e9bae]">Real-time high-risk events requiring compliance officer review</p>
          </div>
        </div>
        <DataTable columns={recentAlertsColumns} data={sampleAlerts} maxHeight="280px" />
      </div>

      {/* Drawers */}
      {selectedCommunity && (
        <CommunityDrawer community={selectedCommunity} onClose={() => setSelectedCommunity(null)} />
      )}

      {selectedAccount && (
        <NodePanel node={selectedAccount} onClose={() => setSelectedAccount(null)} />
      )}
    </div>
  );
}
