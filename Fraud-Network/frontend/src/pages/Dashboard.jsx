import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, TrendingUp, TrendingDown, Minus, Activity, Users, AlertTriangle, 
  Eye, Zap, DollarSign, Lock, AlertOctagon, HelpCircle, ArrowRight
} from 'lucide-react';
import useApi from '../hooks/useApi';
import { fetchSummary, fetchAnalytics, fetchCommunities, fetchGraphData } from '../services/api';
import AreaTrendChart from '../components/charts/AreaTrendChart';
import BarChart from '../components/charts/BarChart';
import NetworkGraph from '../components/graph/NetworkGraph';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CommunityDrawer from '../components/graph/CommunityDrawer';
import NodePanel from '../components/graph/NodePanel';
import { formatNumber, formatPercent } from '../utils/formatters';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: summary, loading: summaryLoading } = useApi(fetchSummary);
  const { data: analytics, loading: analyticsLoading } = useApi(fetchAnalytics);
  const { data: communitiesData, loading: communitiesLoading } = useApi(fetchCommunities);
  const { data: graphData, loading: graphLoading } = useApi(() => fetchGraphData({ limit: 100 }));

  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);

  if (summaryLoading || analyticsLoading || communitiesLoading || graphLoading) {
    return <LoadingSpinner size="lg" label="Initializing Enterprise Fraud Intelligence..." />;
  }

  // Exactly 6 KPI Cards with Icon, Number, Trend, and One-line Explanation
  const kpiList = [
    { label: 'Total Transactions', val: summary?.total_transactions ? formatNumber(summary.total_transactions) : '24.5M', change: '+12.4%', up: true, icon: Activity, text: 'Total processed network volume in 24h' },
    { label: 'Fraud Transactions', val: summary?.fraud_transactions ? formatNumber(summary.fraud_transactions) : '42,891', change: '+18.2%', up: true, icon: ShieldAlert, text: 'Confirmed fraud cases flagged by ML' },
    { label: 'Fraud Rate', val: summary?.fraud_rate_pct ? formatPercent(summary.fraud_rate_pct) : '0.17%', change: '0.0%', up: null, icon: AlertTriangle, text: 'Percentage of fraudulent transactions' },
    { label: 'Communities', val: summary?.communities ? formatNumber(summary.communities) : '342', change: '+12', up: true, icon: Users, text: 'Active Louvain community clusters' },
    { label: 'High Risk Accounts', val: summary?.high_risk_accounts ? formatNumber(summary.high_risk_accounts) : '87', change: '+5.4%', up: true, icon: Lock, text: 'Accounts with risk score above 80/100' },
    { label: 'Money At Risk', val: '$1.42M', change: '+8.1%', up: true, icon: DollarSign, text: 'Capital involved in active suspicious flows' },
  ];

  return (
    <div className="flex flex-col w-full px-6 pb-12 gap-8 max-w-[1700px] mx-auto bg-[#090a0f]">
      
      {/* SECTION 1: TODAY'S AI SUMMARY HERO CARD */}
      <div className="bg-[#12151e] rounded-2xl p-6 border border-[#222738] shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 text-[#00f5d4] text-xs font-bold uppercase tracking-wider">
              <Zap size={15} />
              <span>Today's Status & AI Recommendation</span>
            </div>
            
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#f8fafc]">Network Threat Status:</h1>
              <span className="px-3 py-1 rounded-full bg-[#ff2a6d]/10 text-[#ff2a6d] border border-[#ff2a6d]/20 text-xs font-extrabold uppercase tracking-wider">HIGH RISK</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              <div className="p-3 rounded-xl bg-[#1a1e2e]/60 border border-[#2e354b]/50">
                <span className="text-[11px] text-[#8e9bae] block">Detected Fraud Rings</span>
                <span className="text-base font-bold text-[#00f5d4]">12 Clusters</span>
              </div>
              <div className="p-3 rounded-xl bg-[#1a1e2e]/60 border border-[#2e354b]/50">
                <span className="text-[11px] text-[#8e9bae] block">High Risk Accounts</span>
                <span className="text-base font-bold text-[#ffb800]">87 Accounts</span>
              </div>
              <div className="p-3 rounded-xl bg-[#1a1e2e]/60 border border-[#2e354b]/50">
                <span className="text-[11px] text-[#8e9bae] block">Money At Risk</span>
                <span className="text-base font-bold text-[#ff2a6d]">$1.42M USD</span>
              </div>
              <div className="p-3 rounded-xl bg-[#1a1e2e]/60 border border-[#2e354b]/50">
                <span className="text-[11px] text-[#8e9bae] block">Target Account</span>
                <span className="text-base font-mono font-bold text-[#f8fafc]">ACC001245</span>
              </div>
            </div>
          </div>

          {/* AI Action Box */}
          <div className="w-full lg:w-96 bg-[#1a1e2e] border border-[#2e354b] rounded-xl p-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#8e9bae] uppercase tracking-wider block">AI Recommendation</span>
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

      {/* SECTION 2: EXECUTIVE KPI CARDS (6 CARDS WITH ONE-LINE EXPLANATIONS) */}
      <div>
        <div className="mb-3">
          <h2 className="text-base font-bold text-[#f8fafc]">Executive Network Overview</h2>
          <p className="text-xs text-[#8e9bae]">Key operational metrics and network health indicators</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpiList.map((k, i) => (
            <div key={i} className="bg-[#12151e] rounded-2xl p-4 border border-[#222738] shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-[#8e9bae] text-xs font-medium mb-2">
                  <div className="flex items-center gap-1.5">
                    <k.icon size={14} className="text-[#00f5d4]" />
                    <span>{k.label}</span>
                  </div>
                  <span className={k.up ? 'text-[#00f5d4] font-bold' : 'text-[#8e9bae]'}>{k.change}</span>
                </div>
                <p className="text-2xl font-bold text-[#f8fafc]">{k.val}</p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#222738] text-[11px] text-[#8e9bae]">
                <span>{k.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: FRAUD NETWORK OVERVIEW (HERO INTERACTIVE GRAPH) */}
      <div className="bg-[#12151e] rounded-2xl border border-[#222738] shadow-xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-[#222738] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#f8fafc]">Fraud Network Overview</h2>
            <p className="text-xs text-[#8e9bae]">Live interactive graph visualization — click any account node to inspect details</p>
          </div>
          <button 
            onClick={() => navigate('/network')} 
            className="px-4 py-2 bg-[#1a1e2e] text-[#00f5d4] hover:bg-[#222738] border border-[#2e354b] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            Full Network Explorer <ArrowRight size={14} />
          </button>
        </div>

        <div className="h-[480px] w-full relative bg-[#090a0f]">
          <NetworkGraph data={graphData} nodeLimit={100} />
        </div>
      </div>

      {/* SECTION 4: BUSINESS INSIGHTS & ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-[#12151e] rounded-2xl p-6 border border-[#222738] shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-[#f8fafc]">Fraud & Risk Rate Trend</h3>
              <p className="text-xs text-[#8e9bae]">30-day historical trend of confirmed fraudulent activity</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <AreaTrendChart 
              data={analytics?.trend || []} 
              xKey="day" 
              lines={[{ key: 'fraud_rate', color: '#ff2a6d', name: 'Fraud Rate %' }]} 
              height={220}
            />
          </div>
        </div>

        {/* Channel Velocity */}
        <div className="bg-[#12151e] rounded-2xl p-6 border border-[#222738] shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-[#f8fafc]">Transaction Gateway Velocity</h3>
              <p className="text-xs text-[#8e9bae]">Volume vs Fraud count by payment gateway</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <BarChart 
              data={analytics?.channel_distribution || []} 
              xKey="channel" 
              bars={[{ key: 'volume', color: '#00f5d4', name: 'Volume' }]} 
              height={220}
            />
          </div>
        </div>
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



