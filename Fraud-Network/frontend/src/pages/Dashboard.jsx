import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, TrendingUp, TrendingDown, Minus, ShieldAlert, Users, Activity, Cpu, AlertTriangle, 
  ArrowRight, ShieldCheck, HelpCircle, Eye, RefreshCw, Zap, DollarSign, Lock, Play, Layers
} from 'lucide-react';
import useApi from '../hooks/useApi';
import { fetchSummary, fetchAnalytics, fetchCommunities, fetchFraudIntelligence } from '../services/api';
import AreaTrendChart from '../components/charts/AreaTrendChart';
import BarChart from '../components/charts/BarChart';
import DonutChart from '../components/charts/DonutChart';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CommunityDrawer from '../components/graph/CommunityDrawer';
import { formatNumber, formatPercent } from '../utils/formatters';

export default function Dashboard() {
  const { data: summary, loading: summaryLoading } = useApi(fetchSummary);
  const { data: analytics, loading: analyticsLoading } = useApi(fetchAnalytics);
  const { data: communitiesData, loading: communitiesLoading } = useApi(fetchCommunities);
  const { data: fraudIntel, loading: intelLoading } = useApi(fetchFraudIntelligence);

  const [selectedCommunity, setSelectedCommunity] = useState(null);

  if (summaryLoading || analyticsLoading || communitiesLoading || intelLoading) {
    return <LoadingSpinner size="lg" label="Initializing Executive Fraud Intelligence..." />;
  }

  // 8 Top Executive KPI Cards with Tooltips
  const kpis = [
    { label: 'Total Txns', val: summary?.total_transactions ? formatNumber(summary.total_transactions) : '24.5M', change: '+12.4%', up: true, color: 'text-[#ffffff]', icon: Activity, tooltip: 'Total volume of processed network transactions in the last 24h.' },
    { label: 'Total Accounts', val: summary?.total_accounts ? formatNumber(summary.total_accounts) : '1.2M', change: '+2.1%', up: true, color: 'text-[#ffffff]', icon: Users, tooltip: 'Total active accounts monitored in the graph database.' },
    { label: 'Fraud Txns', val: summary?.fraud_transactions ? formatNumber(summary.fraud_transactions) : '42,891', change: '+18.2%', up: true, color: 'text-[#ffb4ab]', icon: ShieldAlert, tooltip: 'Confirmed fraudulent transactions flagged by risk rules & ML.' },
    { label: 'Fraud Rate', val: summary?.fraud_rate_pct ? formatPercent(summary.fraud_rate_pct) : '0.17%', change: '0.0%', up: null, color: 'text-[#94a3b8]', icon: TrendingUp, tooltip: 'Ratio of fraudulent transactions to total volume.' },
    { label: 'Active Fraud Rings', val: summary?.cycles ? formatNumber(summary.cycles) : '47', change: '+3', up: true, color: 'text-[#ffb4ab]', icon: Zap, tooltip: 'Circular money-laundering loops discovered.' },
    { label: 'High Risk Accts', val: summary?.high_risk_accounts ? formatNumber(summary.high_risk_accounts) : '8,402', change: '+5.4%', up: true, color: 'text-[#ffb74d]', icon: AlertTriangle, tooltip: 'Accounts with a risk score above 80/100.' },
    { label: 'Money at Risk', val: '$1.42M', change: '+8.6%', up: true, color: 'text-[#ffb4ab]', icon: DollarSign, tooltip: 'Total volume currently passing through high-risk clusters.' },
    { label: 'Communities', val: summary?.communities ? formatNumber(summary.communities) : '342', change: '+12', up: true, color: 'text-[#38bdf8]', icon: Layers, tooltip: 'Louvain/Leiden detected community clusters.' },
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

  return (
    <div className="flex flex-col w-full px-6 pb-12 gap-6 max-w-[1700px] mx-auto bg-[#0b1220]">
      {/* Homepage Executive Status Banner */}
      <div className="relative overflow-hidden rounded-[20px] bg-[#111827] border border-[#ffffff]/10 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 text-[#ffb4ab] animate-pulse">
              <ShieldAlert size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ffb4ab]">EXECUTIVE NETWORK HEALTH</span>
                <span className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-ping" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#ffffff] tracking-tight mt-0.5">
                Is My Financial Network Safe Today?
              </h1>
              <p className="text-xs text-[#94a3b8]">
                Network threat level is <span className="font-bold text-[#ffb4ab]">ELEVATED</span>. 12 active laundering rings and 87 critical accounts require immediate intervention.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-[#1e293b]/60 border border-[#ffffff]/10 text-right">
              <p className="text-[10px] text-[#94a3b8] font-bold uppercase">Containment Priority</p>
              <p className="text-sm font-extrabold text-[#ffb4ab]">HIGH (87 Targets)</p>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Top KPI Grid (8 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {kpis.map((kpi, i) => (
          <div 
            key={i} 
            className="group relative bg-[#111827] rounded-[20px] p-4 flex flex-col justify-between border border-[#ffffff]/10 shadow-xl hover:border-[#ffffff]/30 transition-all duration-300 backdrop-blur-xl"
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

            <div className="my-2">
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

      {/* 2. Second Section: Charts & Community Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fraud & Risk Trend Line/Area Chart */}
        <div className="lg:col-span-8 bg-[#111827] rounded-[20px] p-6 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-base font-bold text-[#ffffff]">Fraud Volume & Risk Trend</h3>
              <p className="text-xs text-[#94a3b8]">30-day transaction volume vs detected fraud anomalies</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-xl bg-[#1e293b] text-xs font-mono text-[#38bdf8] border border-[#ffffff]/10">Realtime Stream</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <AreaTrendChart 
              data={analytics?.trend || []} 
              xKey="day" 
              lines={[
                { key: 'tx_count', color: '#ffffff', name: 'Total Volume' },
                { key: 'fraud_count', color: '#ffb4ab', name: 'Fraud Anomalies' }
              ]} 
              height={240}
            />
          </div>
        </div>

        {/* Community Threat Heatmap */}
        <div className="lg:col-span-4 bg-[#111827] rounded-[20px] p-6 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#ffffff] mb-1">Community Threat Heatmap</h3>
            <p className="text-xs text-[#94a3b8] mb-4">Clusters categorized by threat density</p>
            
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-[#ffb4ab]">Community #03 (High Density)</p>
                  <p className="text-[11px] text-[#94a3b8]">34.2% Fraud Ratio • 42 Accounts</p>
                </div>
                <span className="text-sm font-bold font-mono text-[#ffb4ab]">CRITICAL</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#ffb74d]/10 border border-[#ffb74d]/20 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-[#ffb74d]">Community #01 (Elevated Risk)</p>
                  <p className="text-[11px] text-[#94a3b8]">22.1% Fraud Ratio • 68 Accounts</p>
                </div>
                <span className="text-sm font-bold font-mono text-[#ffb74d]">HIGH</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-[#38bdf8]">Community #04 (Monitoring)</p>
                  <p className="text-[11px] text-[#94a3b8]">12.5% Fraud Ratio • 110 Accounts</p>
                </div>
                <span className="text-sm font-bold font-mono text-[#38bdf8]">ELEVATED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Third Section: Today's AI Executive Directive Card */}
      <div className="p-6 rounded-[20px] bg-[#111827] border border-[#ffb4ab]/30 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-[#ffb4ab]">
              <Brain size={20} />
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#ffb4ab]">TODAY'S AI EXECUTIVE DIRECTIVE</span>
            </div>

            <h3 className="text-lg font-bold text-[#ffffff]">Today's Automated Analysis Summary</h3>
            <p className="text-xs text-[#e2e8f0] leading-relaxed">
              12 fraud communities detected in the current graph state. <span className="font-bold text-[#ffb4ab]">Community #3</span> has the highest fraud density. <span className="font-bold text-[#ffffff]">87 accounts</span> require immediate investigation to contain ring contagion.
            </p>
          </div>

          {/* Recommended Action Pill */}
          <div className="p-4 rounded-2xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 flex flex-col items-start md:items-end shrink-0 w-full md:w-auto">
            <span className="text-[10px] font-bold text-[#ffb4ab] uppercase tracking-wider">Recommended Action</span>
            <p className="text-sm font-extrabold text-[#ffffff] my-1">Freeze Account ACC001245 Immediately</p>
            <button className="mt-2 py-2 px-4 rounded-xl bg-[#ffb4ab] text-[#0b1220] font-bold text-xs hover:bg-[#fca5a5] transition-all flex items-center gap-1.5 shadow-lg">
              <Lock size={14} /> Execute Freeze Command
            </button>
          </div>
        </div>
      </div>

      {/* 4. Fourth Section: Core Innovation Metrics (FII, BDS, NES, IPS) */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-[#ffffff]">AI Graph Innovation Metrics</h3>
          <p className="text-xs text-[#94a3b8]">Realtime topological indicators powered by graph neural scoring</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* FII Card */}
          <div className="bg-[#111827] rounded-[20px] p-6 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded-xl bg-[#ffffff]/10 text-[#ffffff]">
                  <Cpu size={18} />
                </div>
                <h4 className="text-sm font-bold text-[#ffffff]">Fraud Influence Index (FII)</h4>
              </div>
              <p className="text-xs text-[#94a3b8] mb-4">Accounts exerting highest topological control over fraud flows.</p>
              
              <div className="space-y-2">
                {(fraudIntel?.top_fii || [
                  { account_id: 'ACC-8923-X', fii: 98.4 },
                  { account_id: 'ACC-1102-Y', fii: 92.1 }
                ]).slice(0, 2).map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#1e293b]/40 border border-[#ffffff]/5 flex justify-between items-center text-xs">
                    <span className="font-mono text-[#ffffff]">{item.account_id}</span>
                    <span className="font-bold text-[#ffffff]">FII: {item.fii}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BDS Card */}
          <div className="bg-[#111827] rounded-[20px] p-6 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded-xl bg-[#38bdf8]/10 text-[#38bdf8]">
                  <Activity size={18} />
                </div>
                <h4 className="text-sm font-bold text-[#ffffff]">Behavior Drift Score (BDS)</h4>
              </div>
              <p className="text-xs text-[#94a3b8] mb-4">Accounts exhibiting sudden velocity & channel shifts.</p>
              
              <div className="space-y-2">
                {(fraudIntel?.top_bds || [
                  { account_id: 'ACC-4412-Z', bds: 96.8 },
                  { account_id: 'ACC-0092-W', bds: 89.3 }
                ]).slice(0, 2).map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#1e293b]/40 border border-[#ffffff]/5 flex justify-between items-center text-xs">
                    <span className="font-mono text-[#ffffff]">{item.account_id}</span>
                    <span className="font-bold text-[#38bdf8]">BDS: {item.bds}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* NES Card */}
          <div className="bg-[#111827] rounded-[20px] p-6 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded-xl bg-[#ffb74d]/10 text-[#ffb74d]">
                  <AlertTriangle size={18} />
                </div>
                <h4 className="text-sm font-bold text-[#ffffff]">Network Exposure (NES)</h4>
              </div>
              <p className="text-xs text-[#94a3b8] mb-4">Accounts at immediate risk of contagion from ring nodes.</p>
              
              <div className="space-y-2">
                {(fraudIntel?.top_nes || [
                  { account_id: 'ACC-7721-M', nes: 94.5 },
                  { account_id: 'ACC-3310-N', nes: 88.0 }
                ]).slice(0, 2).map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#1e293b]/40 border border-[#ffffff]/5 flex justify-between items-center text-xs">
                    <span className="font-mono text-[#ffffff]">{item.account_id}</span>
                    <span className="font-bold text-[#ffb74d]">NES: {item.nes}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* IPS Card */}
          <div className="bg-[#111827] rounded-[20px] p-6 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded-xl bg-[#ffb4ab]/10 text-[#ffb4ab]">
                  <Zap size={18} />
                </div>
                <h4 className="text-sm font-bold text-[#ffffff]">Intervention Priority (IPS)</h4>
              </div>
              <p className="text-xs text-[#94a3b8] mb-4">Prime targets for account freeze to maximize containment.</p>
              
              <div className="space-y-2">
                {(fraudIntel?.top_ips || [
                  { account_id: 'ACC-7710-P', ips: 99.4 },
                  { account_id: 'ACC-3329-Q', ips: 94.1 }
                ]).slice(0, 2).map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#1e293b]/40 border border-[#ffffff]/5 flex justify-between items-center text-xs">
                    <span className="font-mono text-[#ffffff]">{item.account_id}</span>
                    <span className="font-bold text-[#ffb4ab]">IPS: {item.ips}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedCommunity && (
        <CommunityDrawer 
          community={selectedCommunity} 
          onClose={() => setSelectedCommunity(null)} 
        />
      )}
    </div>
  );
}


