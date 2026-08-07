import React from 'react';
import { 
  Brain, Play, TrendingUp, TrendingDown, Minus, AlertTriangle, Network, Users, ShieldAlert,
  ArrowRight, Activity, Zap
} from 'lucide-react';
import useApi from '../hooks/useApi';
import { fetchSummary, fetchAnalytics } from '../services/api';
import AreaTrendChart from '../components/charts/AreaTrendChart';
import DonutChart from '../components/charts/DonutChart';
import BarChart from '../components/charts/BarChart';
import DataTable from '../components/tables/DataTable';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatNumber, formatPercent, formatCurrency } from '../utils/formatters';

export default function Dashboard() {
  const { data: summary, loading: summaryLoading } = useApi(fetchSummary);
  const { data: analytics, loading: analyticsLoading } = useApi(fetchAnalytics);

  if (summaryLoading || analyticsLoading) {
    return <LoadingSpinner size="lg" label="Initializing Fraud Network Intelligence..." />;
  }

  // 8 KPIs
  const kpis = [
    { label: 'Total Txns', val: summary?.total_transactions ? formatNumber(summary.total_transactions) : '24.5M', change: '+12.4%', up: true, color: 'text-primary' },
    { label: 'Total Accounts', val: summary?.total_accounts ? formatNumber(summary.total_accounts) : '1.2M', change: '+2.1%', up: true, color: 'text-primary' },
    { label: 'Fraud Txns', val: summary?.fraud_transactions ? formatNumber(summary.fraud_transactions) : '42,891', change: '+18.2%', up: true, color: 'text-[#ffb4ab]' },
    { label: 'Fraud Rate', val: summary?.fraud_rate_pct ? formatPercent(summary.fraud_rate_pct) : '0.17%', change: '0.0%', up: null, color: 'text-[#c6c6c7]' },
    { label: 'High-Risk Accts', val: summary?.high_risk_accounts ? formatNumber(summary.high_risk_accounts) : '8,402', change: '+5.4%', up: true, color: 'text-primary' },
    { label: 'Communities', val: summary?.communities ? formatNumber(summary.communities) : '342', change: '+12', up: true, color: 'text-[#4cd7f6]' },
    { label: 'Fraud Rings', val: summary?.cycles ? formatNumber(summary.cycles) : '47', change: '+3', up: true, color: 'text-primary' },
    { label: 'Avg Risk Score', val: summary?.avg_risk_score ? formatPercent(summary.avg_risk_score) : '12.4', change: '-0.2', up: false, color: 'text-primary' },
  ];

  const recentAlertsColumns = [
    { key: 'account_id', label: 'Account ID', className: 'font-mono text-[#ffffff] font-medium' },
    { key: 'risk_score', label: 'Risk Score', render: (v) => <span className="px-2 py-0.5 bg-[#ffb4ab]/10 text-[#ffb4ab] rounded font-mono text-xs">{v || '98.2'}</span> },
    { key: 'community', label: 'Community', className: 'text-[#c4c7c8]' },
    { key: 'amount', label: 'Amount', align: 'right', className: 'font-mono text-[#e5e2e1]' },
    { key: 'reason', label: 'Reason', className: 'text-[#c4c7c8]' },
    { key: 'status', label: 'Status', render: (v) => <span className="flex items-center gap-1 text-[#ffb4ab]"><span className="w-2 h-2 rounded-full bg-[#ffb4ab]" /> {v || 'Pending'}</span> },
    { key: 'action', label: 'Action', align: 'center', render: () => <button className="px-3 py-1 border border-[#444748] rounded hover:bg-[#353434] transition-colors text-xs uppercase font-semibold">Review</button> }
  ];

  const sampleAlerts = [
    { account_id: 'ACCT-8923-X', risk_score: '98.2', community: 'Ring_Alpha_77', amount: '$45,200.00', reason: 'Velocity Spike (IP Match)', status: 'Pending' },
    { account_id: 'ACCT-1102-Y', risk_score: '95.4', community: 'Ring_Gamma_02', amount: '$12,050.50', reason: 'Synthetic Identity Match', status: 'Frozen' },
    { account_id: 'ACCT-9941-Z', risk_score: '82.1', community: 'Isolated', amount: '$3,400.00', reason: 'Geographic Anomaly', status: 'Investigating' },
  ];

  const liveTxnsColumns = [
    { key: 'sender_id', label: 'Sender ID', className: 'font-mono' },
    { key: 'receiver_id', label: 'Receiver ID', className: 'font-mono' },
    { key: 'amount', label: 'Amount', align: 'right', className: 'font-mono' },
    { key: 'risk_level', label: 'Risk Level', render: (v) => v === 'Critical' ? <span className="text-[#ffb4ab] font-medium text-xs">Critical</span> : <span className="text-[#4cd7f6] text-xs">Normal</span> },
    { key: 'timestamp', label: 'Timestamp', className: 'font-mono text-[#c4c7c8]' },
    { key: 'status', label: 'Status' }
  ];

  const sampleLiveTxns = [
    { sender_id: 'USR-4421-A', receiver_id: 'MERCH-882-B', amount: '$45.00', risk_level: 'Low', timestamp: '10:42:01 AM', status: 'Cleared' },
    { sender_id: 'USR-9921-X', receiver_id: 'ACCT-8923-X', amount: '$12,500.00', risk_level: 'Critical', timestamp: '10:41:58 AM', status: 'Blocked' },
    { sender_id: 'USR-1102-C', receiver_id: 'MERCH-114-D', amount: '$890.50', risk_level: 'Elevated', timestamp: '10:41:45 AM', status: 'Flagged' },
  ];

  return (
    <div className="flex flex-col w-full px-6 pb-10 gap-5">
      {/* Hero Banner Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end w-full relative overflow-hidden rounded-xl bg-[#2a2a2a] p-8 shadow-lg group border border-[#444748]/30">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4cd7f6]/10 via-transparent to-[#ffb4ab]/10 opacity-50 transition-opacity duration-700 group-hover:opacity-100" />
        <div className="relative z-10 flex flex-col gap-3 max-w-2xl">
          <div className="flex items-center gap-3 text-[#4cd7f6]">
            <Brain className="text-[#4cd7f6]" size={28} />
            <span className="text-xs font-bold uppercase tracking-widest text-[#4cd7f6]">SYSTEM ACTIVE</span>
          </div>
          <h1 className="text-3xl font-bold text-[#ffffff] tracking-tight font-heading">Fraud Network Intelligence</h1>
          <p className="text-sm text-[#c4c7c8] leading-relaxed max-w-xl">
            Real-time fraud detection and transaction graph analytics powered by graph intelligence. Monitoring high-risk vectors across distributed networks.
          </p>
        </div>
        <div className="relative z-10 mt-6 md:mt-0 flex gap-4">
          <button className="px-6 py-3 rounded-lg bg-[#ffffff] text-[#141313] font-semibold hover:bg-[#e2e2e2] transition-all flex items-center gap-2 shadow-md hover:-translate-y-0.5 text-sm">
            <Play size={18} />
            Run Simulation
          </button>
        </div>
      </div>

      {/* 8 KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-[#201f1f] rounded-lg p-4 flex flex-col gap-1.5 border border-[#444748]/30 shadow-sm hover:border-[#4cd7f6]/40 transition-all">
            <span className="text-[11px] font-semibold text-[#c4c7c8] uppercase tracking-wider">{kpi.label}</span>
            <span className={`text-xl font-bold ${kpi.color}`}>{kpi.val}</span>
            <div className="flex items-center gap-1 text-xs font-mono text-[#c4c7c8] mt-0.5">
              {kpi.up === true && <TrendingUp size={12} className="text-[#4cd7f6]" />}
              {kpi.up === false && <TrendingDown size={12} className="text-[#81c784]" />}
              {kpi.up === null && <Minus size={12} className="text-[#c4c7c8]" />}
              <span>{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row (70% Left + 30% Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (70%) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Interactive Fraud Trend Chart */}
          <div className="bg-[#201f1f] rounded-xl p-6 border border-[#444748]/30 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#ffffff]">Interactive Fraud Trend</h3>
                <p className="text-xs text-[#c4c7c8]">Volume vs Detection Rate over 30 days</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded bg-[#353434] text-[#e5e2e1] text-xs font-medium hover:text-[#ffffff]">1D</button>
                <button className="px-3 py-1 rounded bg-[#4cd7f6]/20 text-[#4cd7f6] text-xs font-semibold">7D</button>
                <button className="px-3 py-1 rounded bg-[#353434] text-[#e5e2e1] text-xs font-medium hover:text-[#ffffff]">30D</button>
              </div>
            </div>
            <div className="h-72 w-full">
              <AreaTrendChart 
                data={analytics?.trend || []} 
                xKey="day" 
                lines={[
                  { key: 'tx_count', color: '#ffffff', name: 'Total Volume' },
                  { key: 'fraud_count', color: '#4cd7f6', name: 'Fraud Volume' }
                ]} 
                height={280}
              />
            </div>
          </div>

          {/* Transaction Velocity by Channel */}
          <div className="bg-[#201f1f] rounded-xl p-6 border border-[#444748]/30 shadow-sm">
            <h3 className="text-lg font-bold text-[#ffffff] mb-1">Transaction Velocity</h3>
            <p className="text-xs text-[#c4c7c8] mb-4">Transactions per minute by access channel</p>
            <BarChart 
              data={analytics?.channel_distribution || [
                { channel: 'Web', volume: 4500 },
                { channel: 'Mobile', volume: 8200 },
                { channel: 'ATM', volume: 3100 },
                { channel: 'Branch', volume: 2400 },
                { channel: 'POS', volume: 6700 },
              ]} 
              xKey="channel" 
              bars={[{ key: 'volume', color: '#4cd7f6', name: 'Volume' }]} 
              height={200}
            />
          </div>
        </div>

        {/* Right Column (30%) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Fraud Distribution Donut */}
          <div className="bg-[#201f1f] rounded-xl p-6 border border-[#444748]/30 shadow-sm flex flex-col items-center">
            <div className="w-full text-left mb-2">
              <h3 className="text-lg font-bold text-[#ffffff]">Fraud Distribution</h3>
              <p className="text-xs text-[#c4c7c8]">By detection category</p>
            </div>
            <DonutChart 
              data={analytics?.fraud_distribution || [
                { name: 'Account Takeover', value: 45, color: '#ffb4ab' },
                { name: 'Synthetic ID', value: 30, color: '#4cd7f6' },
                { name: 'Card Testing', value: 25, color: '#353434' },
              ]} 
              height={220}
            />
          </div>

          {/* Risk Level Breakdown List */}
          <div className="bg-[#201f1f] rounded-xl p-6 border border-[#444748]/30 shadow-sm flex-1">
            <h3 className="text-lg font-bold text-[#ffffff] mb-1">Risk Level Breakdown</h3>
            <p className="text-xs text-[#c4c7c8] mb-4">Active nodes by severity</p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#141313] hover:bg-[#353434] transition-colors cursor-pointer group border border-[#444748]/20">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-[#ffb4ab] rounded-full" />
                  <div>
                    <div className="text-sm font-semibold text-[#ffffff] group-hover:text-[#ffb4ab] transition-colors">Critical Risk</div>
                    <div className="font-mono text-xs text-[#c4c7c8]">Score &gt; 90</div>
                  </div>
                </div>
                <span className="text-lg font-bold text-[#ffffff]">1,204</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#141313] hover:bg-[#353434] transition-colors cursor-pointer group border border-[#444748]/20">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-[#ffb74d] rounded-full" />
                  <div>
                    <div className="text-sm font-semibold text-[#ffffff]">High Risk</div>
                    <div className="font-mono text-xs text-[#c4c7c8]">Score 70-89</div>
                  </div>
                </div>
                <span className="text-lg font-bold text-[#ffffff]">7,198</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#141313] hover:bg-[#353434] transition-colors cursor-pointer group border border-[#444748]/20">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-[#4cd7f6] rounded-full" />
                  <div>
                    <div className="text-sm font-semibold text-[#ffffff]">Elevated</div>
                    <div className="font-mono text-xs text-[#c4c7c8]">Score 40-69</div>
                  </div>
                </div>
                <span className="text-lg font-bold text-[#ffffff]">24,532</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Fraud Alerts & Live Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-[#201f1f] rounded-xl border border-[#444748]/30 p-6">
          <h3 className="text-lg font-bold text-[#ffffff] mb-4">Recent Fraud Alerts</h3>
          <DataTable columns={recentAlertsColumns} data={sampleAlerts} maxHeight="260px" />
        </div>

        <div className="bg-[#201f1f] rounded-xl border border-[#444748]/30 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-[#ffffff]">Live Transactions Stream</h3>
            <span className="flex items-center gap-2 text-xs font-semibold text-[#4cd7f6]">
              <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-pulse" /> Live Updates
            </span>
          </div>
          <DataTable columns={liveTxnsColumns} data={sampleLiveTxns} maxHeight="260px" />
        </div>
      </div>
    </div>
  );
}
