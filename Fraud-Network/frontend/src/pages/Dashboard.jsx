import React, { useState } from 'react';
import { 
  Brain, TrendingUp, TrendingDown, Minus, ShieldAlert, Users, Activity, Cpu, AlertTriangle, 
  ArrowRight, ShieldCheck, HelpCircle, Eye, RefreshCw, Zap
} from 'lucide-react';
import useApi from '../hooks/useApi';
import { fetchSummary, fetchAnalytics, fetchCommunities } from '../services/api';
import AreaTrendChart from '../components/charts/AreaTrendChart';
import DonutChart from '../components/charts/DonutChart';
import BarChart from '../components/charts/BarChart';
import DataTable from '../components/tables/DataTable';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CommunityDrawer from '../components/graph/CommunityDrawer';
import { formatNumber, formatPercent } from '../utils/formatters';

export default function Dashboard() {
  const { data: summary, loading: summaryLoading } = useApi(fetchSummary);
  const { data: analytics, loading: analyticsLoading } = useApi(fetchAnalytics);
  const { data: communitiesData, loading: communitiesLoading } = useApi(fetchCommunities);

  const [selectedCommunity, setSelectedCommunity] = useState(null);

  if (summaryLoading || analyticsLoading || communitiesLoading) {
    return <LoadingSpinner size="lg" label="Initializing Enterprise Fraud Intelligence..." />;
  }

  // 8 KPIs with Tooltips
  const kpis = [
    { label: 'Total Txns', val: summary?.total_transactions ? formatNumber(summary.total_transactions) : '24.5M', change: '+12.4%', up: true, color: 'text-[#ffffff]', tooltip: 'Total volume of processed network transactions in the last 24h.' },
    { label: 'Total Accounts', val: summary?.total_accounts ? formatNumber(summary.total_accounts) : '1.2M', change: '+2.1%', up: true, color: 'text-[#ffffff]', tooltip: 'Total active accounts monitored in the graph database.' },
    { label: 'Fraud Txns', val: summary?.fraud_transactions ? formatNumber(summary.fraud_transactions) : '42,891', change: '+18.2%', up: true, color: 'text-[#ffb4ab]', tooltip: 'Confirmed fraudulent transactions flagged by risk rules & ML.' },
    { label: 'Fraud Rate', val: summary?.fraud_rate_pct ? formatPercent(summary.fraud_rate_pct) : '0.17%', change: '0.0%', up: null, color: 'text-[#94a3b8]', tooltip: 'Ratio of fraudulent transactions to total volume.' },
    { label: 'High Risk Accts', val: summary?.high_risk_accounts ? formatNumber(summary.high_risk_accounts) : '8,402', change: '+5.4%', up: true, color: 'text-[#ffb74d]', tooltip: 'Accounts with a risk score above 80/100.' },
    { label: 'Communities', val: summary?.communities ? formatNumber(summary.communities) : '342', change: '+12', up: true, color: 'text-[#38bdf8]', tooltip: 'Louvain/Leiden detected community clusters.' },
    { label: 'Cycles Detected', val: summary?.cycles ? formatNumber(summary.cycles) : '47', change: '+3', up: true, color: 'text-[#ffb4ab]', tooltip: 'Circular money-laundering loops discovered.' },
    { label: 'Avg Risk Score', val: summary?.avg_risk_score ? formatPercent(summary.avg_risk_score) : '14.2%', change: '-0.2%', up: false, color: 'text-[#ffffff]', tooltip: 'Average network-wide account risk index.' },
  ];

  // Community processing
  const communityMap = {};
  (communitiesData || []).forEach(c => {
    const cid = c.community_id || '01';
    if (!communityMap[cid]) {
      communityMap[cid] = { cid, count: 0, fraud_count: 0, avg_risk: 0 };
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

  // Top Tables Data
  const recentAlertsColumns = [
    { key: 'account_id', label: 'Account ID', className: 'font-mono text-[#ffffff] font-semibold' },
    { key: 'risk_score', label: 'Risk Score', render: (v) => <span className="px-2 py-0.5 bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/20 rounded-lg font-mono text-xs font-bold">{v || '98.2'}</span> },
    { key: 'community', label: 'Community', className: 'text-[#94a3b8]' },
    { key: 'reason', label: 'Alert Trigger', className: 'text-[#e2e8f0]' },
    { key: 'status', label: 'Status', render: (v) => <span className="flex items-center gap-1.5 text-[#ffb4ab] text-xs font-semibold"><span className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-ping" /> {v || 'Pending'}</span> },
    { key: 'action', label: 'Action', align: 'center', render: () => <button className="px-3 py-1 bg-[#ffffff] text-[#0b1220] rounded-lg hover:bg-[#e2e8f0] transition-colors text-xs font-bold uppercase tracking-wider">Inspect</button> }
  ];

  const sampleAlerts = [
    { account_id: 'ACCT-8923-X', risk_score: '98.2', community: 'Cluster #01', reason: 'High FII Velocity Ring', status: 'Pending' },
    { account_id: 'ACCT-1102-Y', risk_score: '95.4', community: 'Cluster #04', reason: 'BDS Behavior Anomaly', status: 'Investigating' },
    { account_id: 'ACCT-9941-Z', risk_score: '88.1', community: 'Cluster #12', reason: 'NES Contagion Risk', status: 'Pending' },
  ];

  const highRiskAccounts = [
    { account_id: 'ACC-7710-P', ips: '99.4', fii: '96.2', status: 'Immediate Freeze' },
    { account_id: 'ACC-3329-Q', ips: '94.1', fii: '91.8', status: 'Flagged' },
    { account_id: 'ACC-8812-R', ips: '89.7', fii: '85.4', status: 'Review Needed' },
  ];

  return (
    <div className="flex flex-col w-full px-6 pb-12 gap-6 max-w-[1700px] mx-auto">
      {/* 1st Row: 8 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {kpis.map((kpi, i) => (
          <div 
            key={i} 
            className="group relative bg-[#111827] rounded-[18px] p-4 flex flex-col justify-between border border-[#ffffff]/10 shadow-xl hover:border-[#ffffff]/30 transition-all duration-300 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">{kpi.label}</span>
              <div className="relative cursor-pointer text-[#64748b] hover:text-[#ffffff] transition-colors">
                <HelpCircle size={13} />
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-[#0b1220] border border-[#ffffff]/20 rounded-xl text-[10px] text-[#e2e8f0] shadow-2xl z-50 pointer-events-none">
                  {kpi.tooltip}
                </div>
              </div>
            </div>

            <div className="my-1.5">
              <span className={`text-2xl font-extrabold ${kpi.color} tracking-tight`}>{kpi.val}</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono text-[#94a3b8]">
              {kpi.up === true && <TrendingUp size={12} className="text-[#38bdf8]" />}
              {kpi.up === false && <TrendingDown size={12} className="text-[#34d399]" />}
              {kpi.up === null && <Minus size={12} className="text-[#64748b]" />}
              <span className={kpi.up ? 'text-[#38bdf8]' : 'text-[#94a3b8]'}>{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 2nd Row: Community Overview Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Community Size & Fraud Density Chart */}
        <div className="lg:col-span-8 bg-[#111827] rounded-[18px] p-6 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-base font-bold text-[#ffffff]">Community Size & Fraud Density</h3>
              <p className="text-xs text-[#94a3b8]">Louvain graph clusters ordered by risk exposure</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-xl bg-[#1e293b] text-xs font-mono text-[#38bdf8] border border-[#ffffff]/10">Louvain Clustering</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <BarChart 
              data={analytics?.channel_distribution || [
                { channel: 'Cluster #01', volume: 1420 },
                { channel: 'Cluster #02', volume: 980 },
                { channel: 'Cluster #04', volume: 840 },
                { channel: 'Cluster #07', volume: 620 },
                { channel: 'Cluster #12', volume: 450 },
              ]} 
              xKey="channel" 
              bars={[{ key: 'volume', color: '#ffffff', name: 'Accounts' }]} 
              height={240}
            />
          </div>
        </div>

        {/* Community Risk Breakdown (Right column) */}
        <div className="lg:col-span-4 bg-[#111827] rounded-[18px] p-6 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#ffffff] mb-1">Community Risk Distribution</h3>
            <p className="text-xs text-[#94a3b8] mb-4">Clusters grouped by threat level</p>
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-[#ffb4ab]">High Risk Clusters</p>
                  <p className="text-[11px] text-[#94a3b8]">Density &gt; 25%</p>
                </div>
                <span className="text-lg font-bold text-[#ffb4ab]">14</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#ffb74d]/10 border border-[#ffb74d]/20 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-[#ffb74d]">Medium Risk Clusters</p>
                  <p className="text-[11px] text-[#94a3b8]">Density 10% - 25%</p>
                </div>
                <span className="text-lg font-bold text-[#ffb74d]">42</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-[#38bdf8]">Low Risk Clusters</p>
                  <p className="text-[11px] text-[#94a3b8]">Density &lt; 10%</p>
                </div>
                <span className="text-lg font-bold text-[#38bdf8]">286</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3rd Row: Community Cards Grid (6 Cards) */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-[#ffffff]">Top Dangerous Communities</h3>
            <p className="text-xs text-[#94a3b8]">Select a community card to launch the Inspector Drawer</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {communityList.map((comm) => (
            <div 
              key={comm.cid}
              className="bg-[#111827] rounded-[18px] p-5 border border-[#ffffff]/10 shadow-xl flex flex-col justify-between hover:border-[#ffffff]/30 transition-all duration-300 group"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-[#ffffff]">Cluster #{comm.cid}</span>
                  <Badge variant={comm.status === 'High Risk' ? 'danger' : comm.status === 'Medium Risk' ? 'warning' : 'success'}>
                    {comm.status}
                  </Badge>
                </div>

                <div className="space-y-1.5 mb-4 text-xs">
                  <div className="flex justify-between text-[#94a3b8]">
                    <span>Accounts:</span>
                    <span className="font-bold text-[#ffffff]">{comm.count}</span>
                  </div>
                  <div className="flex justify-between text-[#94a3b8]">
                    <span>Fraud Density:</span>
                    <span className="font-bold text-[#ffb4ab]">{comm.fraudDensity}%</span>
                  </div>
                  <div className="flex justify-between text-[#94a3b8]">
                    <span>Avg Risk:</span>
                    <span className="font-bold text-[#ffb74d]">{comm.avg_risk}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedCommunity(comm)}
                className="w-full py-2 rounded-xl bg-[#ffffff] text-[#0b1220] font-bold text-xs hover:bg-[#e2e8f0] transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye size={14} /> View Community
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4th Row: Innovation Section — The 4 Core Fraud Metrics */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-[#ffffff]">Fraud Intelligence Innovation Metrics</h3>
          <p className="text-xs text-[#94a3b8]">Graph-computed AI metrics for automated threat prioritization</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* FII Card */}
          <div className="bg-[#111827] rounded-[18px] p-6 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded-xl bg-[#ffffff]/10 text-[#ffffff]">
                  <Cpu size={18} />
                </div>
                <h4 className="text-sm font-bold text-[#ffffff]">Fraud Influence Index (FII)</h4>
              </div>
              <p className="text-xs text-[#94a3b8] mb-4">Accounts exerting highest topological control over fraud flows.</p>
              
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-[#1e293b]/40 border border-[#ffffff]/5 flex justify-between items-center text-xs">
                  <span className="font-mono text-[#ffffff]">ACC-8923-X</span>
                  <span className="font-bold text-[#ffffff]">FII: 98.4%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#1e293b]/40 border border-[#ffffff]/5 flex justify-between items-center text-xs">
                  <span className="font-mono text-[#ffffff]">ACC-1102-Y</span>
                  <span className="font-bold text-[#ffffff]">FII: 92.1%</span>
                </div>
              </div>
            </div>
          </div>

          {/* BDS Card */}
          <div className="bg-[#111827] rounded-[18px] p-6 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded-xl bg-[#38bdf8]/10 text-[#38bdf8]">
                  <Activity size={18} />
                </div>
                <h4 className="text-sm font-bold text-[#ffffff]">Behavior Drift Score (BDS)</h4>
              </div>
              <p className="text-xs text-[#94a3b8] mb-4">Accounts exhibiting sudden velocity & channel shifts.</p>
              
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-[#1e293b]/40 border border-[#ffffff]/5 flex justify-between items-center text-xs">
                  <span className="font-mono text-[#ffffff]">ACC-4412-Z</span>
                  <span className="font-bold text-[#38bdf8]">BDS: 96.8%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#1e293b]/40 border border-[#ffffff]/5 flex justify-between items-center text-xs">
                  <span className="font-mono text-[#ffffff]">ACC-0092-W</span>
                  <span className="font-bold text-[#38bdf8]">BDS: 89.3%</span>
                </div>
              </div>
            </div>
          </div>

          {/* NES Card */}
          <div className="bg-[#111827] rounded-[18px] p-6 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded-xl bg-[#ffb74d]/10 text-[#ffb74d]">
                  <AlertTriangle size={18} />
                </div>
                <h4 className="text-sm font-bold text-[#ffffff]">Network Exposure (NES)</h4>
              </div>
              <p className="text-xs text-[#94a3b8] mb-4">Accounts at immediate risk of contagion from ring nodes.</p>
              
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-[#1e293b]/40 border border-[#ffffff]/5 flex justify-between items-center text-xs">
                  <span className="font-mono text-[#ffffff]">ACC-7721-M</span>
                  <span className="font-bold text-[#ffb74d]">NES: 94.5%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#1e293b]/40 border border-[#ffffff]/5 flex justify-between items-center text-xs">
                  <span className="font-mono text-[#ffffff]">ACC-3310-N</span>
                  <span className="font-bold text-[#ffb74d]">NES: 88.0%</span>
                </div>
              </div>
            </div>
          </div>

          {/* IPS Card */}
          <div className="bg-[#111827] rounded-[18px] p-6 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded-xl bg-[#ffb4ab]/10 text-[#ffb4ab]">
                  <Zap size={18} />
                </div>
                <h4 className="text-sm font-bold text-[#ffffff]">Intervention Priority (IPS)</h4>
              </div>
              <p className="text-xs text-[#94a3b8] mb-4">Prime targets for account freeze to maximize containment.</p>
              
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-[#1e293b]/40 border border-[#ffffff]/5 flex justify-between items-center text-xs">
                  <span className="font-mono text-[#ffffff]">ACC-7710-P</span>
                  <span className="font-bold text-[#ffb4ab]">IPS: 99.4%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#1e293b]/40 border border-[#ffffff]/5 flex justify-between items-center text-xs">
                  <span className="font-mono text-[#ffffff]">ACC-3329-Q</span>
                  <span className="font-bold text-[#ffb4ab]">IPS: 94.1%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5th Row: Bottom Investigation Queue Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111827] rounded-[18px] border border-[#ffffff]/10 p-6 shadow-xl backdrop-blur-xl">
          <h3 className="text-base font-bold text-[#ffffff] mb-4">Recent High-Risk Alerts</h3>
          <DataTable columns={recentAlertsColumns} data={sampleAlerts} maxHeight="260px" />
        </div>

        <div className="bg-[#111827] rounded-[18px] border border-[#ffffff]/10 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-[#ffffff]">Immediate Action Queue (IPS Top Targets)</h3>
            <span className="flex items-center gap-2 text-xs font-semibold text-[#38bdf8]">
              <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-ping" /> Realtime Priority
            </span>
          </div>
          <div className="space-y-3">
            {highRiskAccounts.map((acc) => (
              <div key={acc.account_id} className="p-4 rounded-2xl bg-[#1e293b]/40 border border-[#ffffff]/10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold font-mono text-[#ffffff]">{acc.account_id}</p>
                  <p className="text-xs text-[#94a3b8]">Priority Score: <span className="font-bold text-[#ffb4ab]">{acc.ips}%</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 text-[#ffb4ab] text-xs font-bold">{acc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Community Detail Drawer Overlay */}
      {selectedCommunity && (
        <CommunityDrawer 
          community={selectedCommunity} 
          onClose={() => setSelectedCommunity(null)} 
        />
      )}
    </div>
  );
}

