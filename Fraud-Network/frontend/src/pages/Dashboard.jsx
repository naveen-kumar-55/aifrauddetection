import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Activity, Users, AlertTriangle, 
  DollarSign, Lock, Zap, ArrowRight, ShieldCheck, LockIcon, AlertOctagon, Eye
} from 'lucide-react';
import useApi from '../hooks/useApi';
import { fetchSummary, fetchAnalytics, fetchGraphData } from '../services/api';
import AreaTrendChart from '../components/charts/AreaTrendChart';
import BarChart from '../components/charts/BarChart';
import NetworkGraph from '../components/graph/NetworkGraph';
import DataTable from '../components/tables/DataTable';
import CommunityDrawer from '../components/graph/CommunityDrawer';
import NodePanel from '../components/graph/NodePanel';
import { formatNumber, formatPercent } from '../utils/formatters';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: summary } = useApi(fetchSummary);
  const { data: analytics } = useApi(fetchAnalytics);
  const { data: graphData } = useApi(() => fetchGraphData({ limit: 100 }));

  const [selectedAccount, setSelectedAccount] = useState(null);

  const kpis = [
    { label: 'Total Volume (24h)', val: summary?.total_transactions ? formatNumber(summary.total_transactions) : '24.5M', change: '+12.4%', up: true, icon: Activity, text: 'Network processed volume' },
    { label: 'Fraud Transactions', val: summary?.fraud_transactions ? formatNumber(summary.fraud_transactions) : '42,891', change: '+18.2%', up: true, icon: ShieldAlert, text: 'Confirmed ML fraud cases' },
    { label: 'Fraud Rate', val: summary?.fraud_rate_pct ? formatPercent(summary.fraud_rate_pct) : '0.17%', change: '0.0%', up: null, icon: AlertTriangle, text: 'Ratio to total volume' },
    { label: 'High Risk Accounts', val: summary?.high_risk_accounts ? formatNumber(summary.high_risk_accounts) : '87', change: '+5.4%', up: true, icon: Lock, text: 'Risk score > 80/100' },
    { label: 'Capital At Risk', val: '$1.42M', change: '+8.1%', up: true, icon: DollarSign, text: 'Active suspicious flows' },
  ];

  const recentAlertsColumns = [
    { key: 'account_id', label: 'Account ID', className: 'font-mono text-[#f8fafc] font-semibold' },
    { key: 'risk_score', label: 'Risk Score', render: (v) => <span className="px-2.5 py-1 bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 rounded-lg font-mono text-xs font-bold">{v || '98.2'}%</span> },
    { key: 'community', label: 'Community Cluster', className: 'text-[#94a3b8]' },
    { key: 'reason', label: 'Alert Trigger', className: 'text-[#f8fafc]' },
    { key: 'status', label: 'Status', render: (v) => <span className="flex items-center gap-1.5 text-[#ef4444] text-xs font-semibold"><span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" /> {v || 'Action Required'}</span> },
    { key: 'action', label: 'Action', align: 'center', render: (_, row) => (
      <button 
        onClick={() => setSelectedAccount({ id: row.account_id, riskScore: 98.2, communityId: 1, customerName: `Account ${row.account_id}` })}
        className="px-3 py-1 bg-[#2563eb] text-[#ffffff] rounded-lg hover:bg-[#1d4ed8] transition-colors text-xs font-semibold uppercase tracking-wider"
      >
        Inspect
      </button>
    ) }
  ];

  const sampleAlerts = [
    { account_id: 'ACC001245', risk_score: '98.2', community: 'Cluster #01', reason: 'High Fraud Influence Index (FII > 96%)', status: 'Immediate Action' },
    { account_id: 'ACCT-1102-Y', risk_score: '95.4', community: 'Cluster #04', reason: 'Behavior Drift Anomaly (BDS Burst)', status: 'Investigating' },
    { account_id: 'ACCT-9941-Z', risk_score: '88.1', community: 'Cluster #12', reason: 'Network Contagion Risk (NES > 90%)', status: 'Pending Review' },
  ];

  return (
    <div className="flex flex-col w-full px-6 pb-12 gap-8 max-w-[1700px] mx-auto bg-[#0b1220] text-[#f8fafc]">
      
      {/* 1. HERO THREAT CENTER & AI SUMMARY DIRECTIVE */}
      <div className="bg-[#111827] rounded-2xl p-6 border border-[#1e293b] shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 text-[#2563eb] text-xs font-bold uppercase tracking-wider">
              <Zap size={15} />
              <span>Microsoft Defender & Sentinel Threat Center</span>
            </div>
            
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#f8fafc]">Is the bank safe today?</h1>
              <span className="px-3 py-1 rounded-full bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 text-xs font-extrabold uppercase tracking-wider">HIGH THREAT LEVEL</span>
            </div>

            <p className="text-xs text-[#94a3b8]">
              Automated AI graph neural models detected 12 active laundering rings across 87 high-risk accounts.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              <div className="p-3 rounded-xl bg-[#1e293b]/50 border border-[#334155]/40">
                <span className="text-[11px] text-[#94a3b8] block">Detected Rings</span>
                <span className="text-base font-bold text-[#2563eb]">12 Clusters</span>
              </div>
              <div className="p-3 rounded-xl bg-[#1e293b]/50 border border-[#334155]/40">
                <span className="text-[11px] text-[#94a3b8] block">High Risk Accounts</span>
                <span className="text-base font-bold text-[#f59e0b]">87 Accounts</span>
              </div>
              <div className="p-3 rounded-xl bg-[#1e293b]/50 border border-[#334155]/40">
                <span className="text-[11px] text-[#94a3b8] block">Money At Risk</span>
                <span className="text-base font-bold text-[#ef4444]">$1.42M USD</span>
              </div>
              <div className="p-3 rounded-xl bg-[#1e293b]/50 border border-[#334155]/40">
                <span className="text-[11px] text-[#94a3b8] block">Target Account</span>
                <span className="text-base font-mono font-bold text-[#f8fafc]">ACC001245</span>
              </div>
            </div>
          </div>

          {/* AI Recommendation Directive Box */}
          <div className="w-full lg:w-96 bg-[#1e293b] border border-[#334155] rounded-xl p-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider block">AI Recommendation</span>
              <p className="text-base font-bold text-[#ef4444] mt-1">Freeze Account ACC001245</p>
              <p className="text-xs text-[#94a3b8] mt-1">Connected to 8 fraud accounts across 3 laundering cycles.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button 
                onClick={() => navigate('/investigation')}
                className="py-2.5 bg-[#2563eb] text-[#ffffff] font-semibold text-xs rounded-xl hover:bg-[#1d4ed8] transition-colors flex items-center justify-center gap-1.5"
              >
                Investigate
              </button>
              <button 
                onClick={() => navigate('/intervention')}
                className="py-2.5 bg-[#1e293b] text-[#f8fafc] border border-[#334155] font-semibold text-xs rounded-xl hover:bg-[#334155] transition-colors flex items-center justify-center gap-1.5"
              >
                Run Simulation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="bg-[#111827] rounded-2xl p-4 border border-[#1e293b] shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-[#94a3b8] text-xs font-medium mb-2">
                <div className="flex items-center gap-1.5">
                  <k.icon size={14} className="text-[#2563eb]" />
                  <span className="truncate">{k.label}</span>
                </div>
                <span className={k.up ? 'text-[#2563eb] font-bold' : 'text-[#94a3b8]'}>{k.change}</span>
              </div>
              <p className="text-2xl font-bold text-[#f8fafc]">{k.val}</p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1e293b] text-[11px] text-[#94a3b8]">
              <span>{k.text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. LARGE NETWORK SNAPSHOT PREVIEW */}
      <div className="bg-[#111827] rounded-2xl border border-[#1e293b] shadow-xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-[#1e293b] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#f8fafc]">Live Fraud Network Topology Snapshot</h2>
            <p className="text-xs text-[#94a3b8]">Graph neural topology preview — click nodes to inspect details</p>
          </div>
          <button 
            onClick={() => navigate('/network')} 
            className="px-4 py-2 bg-[#1e293b] text-[#2563eb] hover:bg-[#334155] border border-[#334155] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            Full Network Explorer <ArrowRight size={14} />
          </button>
        </div>

        <div className="h-[420px] w-full relative bg-[#0b1220]">
          <NetworkGraph data={graphData} nodeLimit={100} />
        </div>
      </div>

      {/* 4. BUSINESS INSIGHTS & ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-[#1e293b] shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-[#f8fafc]">Fraud Volume & Risk Trend</h3>
              <p className="text-xs text-[#94a3b8]">30-day historical trend of confirmed fraudulent activity</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <AreaTrendChart 
              data={analytics?.trend || []} 
              xKey="day" 
              lines={[{ key: 'fraud_rate', color: '#ef4444', name: 'Fraud Rate %' }]} 
              height={220}
            />
          </div>
        </div>

        {/* Channel Velocity */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-[#1e293b] shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-[#f8fafc]">Transaction Gateway Velocity</h3>
              <p className="text-xs text-[#94a3b8]">Volume vs Fraud count by payment gateway</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <BarChart 
              data={analytics?.channel_distribution || []} 
              xKey="channel" 
              bars={[{ key: 'volume', color: '#2563eb', name: 'Volume' }]} 
              height={220}
            />
          </div>
        </div>
      </div>

      {/* 5. LATEST ALERTS & QUICK INVESTIGATION TABLE */}
      <div className="bg-[#111827] rounded-2xl border border-[#1e293b] p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-[#f8fafc]">Recent High-Risk Anomaly Alerts Queue</h3>
            <p className="text-xs text-[#94a3b8]">Real-time flagged transactions requiring compliance officer review</p>
          </div>
        </div>
        <DataTable columns={recentAlertsColumns} data={sampleAlerts} maxHeight="260px" />
      </div>

      {/* Drawers */}
      {selectedAccount && (
        <NodePanel node={selectedAccount} onClose={() => setSelectedAccount(null)} />
      )}
    </div>
  );
}
