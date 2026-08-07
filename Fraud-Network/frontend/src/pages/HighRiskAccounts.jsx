import React, { useState } from 'react';
import useApi from '../hooks/useApi';
import { fetchHighRiskAccounts } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DataTable from '../components/tables/DataTable';
import NodePanel from '../components/graph/NodePanel';
import { ShieldAlert, Search, Filter, Eye } from 'lucide-react';

export default function HighRiskAccounts() {
  const { data: accounts, loading } = useApi(fetchHighRiskAccounts);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) return <LoadingSpinner size="lg" label="Retrieving High Risk Account Profiles..." />;

  const filtered = (accounts || []).filter(a => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return String(a.account_id).toLowerCase().includes(q) || String(a.community_id).includes(q);
  });

  const columns = [
    { key: 'account_id', label: 'Account ID', className: 'font-mono text-[#ffffff] font-bold' },
    { key: 'graph_risk_score', label: 'Risk Score', render: (v) => <span className="px-2.5 py-1 bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/20 rounded-xl font-mono text-xs font-bold">{v}%</span> },
    { key: 'community_id', label: 'Community', render: (v) => <span className="font-mono text-[#38bdf8]">Cluster #{v}</span> },
    { key: 'fii', label: 'FII', render: (v) => <span className="font-mono text-[#ffffff] font-semibold">{v}%</span> },
    { key: 'bds', label: 'BDS', render: (v) => <span className="font-mono text-[#38bdf8] font-semibold">{v}%</span> },
    { key: 'nes', label: 'NES', render: (v) => <span className="font-mono text-[#ffb74d] font-semibold">{v}%</span> },
    { key: 'ips', label: 'IPS', render: (v) => <span className="font-mono text-[#ffb4ab] font-bold">{v}%</span> },
    { key: 'action', label: 'Action', align: 'center', render: (_, row) => (
      <button 
        onClick={() => setSelectedNode({
          id: row.account_id,
          riskScore: row.graph_risk_score,
          communityId: row.community_id,
          degree: row.degree,
          fii: row.fii,
          bds: row.bds,
          nes: row.nes,
          ips: row.ips,
          customerName: `Account ${row.account_id}`,
          accountType: 'Individual'
        })}
        className="px-3 py-1.5 bg-[#ffffff] text-[#0b1220] rounded-xl hover:bg-[#e2e8f0] transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mx-auto"
      >
        <Eye size={14} /> Inspect
      </button>
    )}
  ];

  return (
    <div className="flex flex-col w-full px-6 pb-12 gap-6 max-w-[1700px] mx-auto">
      {/* Header Banner */}
      <div className="bg-[#111827] rounded-[18px] p-6 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 text-[#ffb4ab]">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#ffffff]">High-Risk Account Investigation Queue</h2>
            <p className="text-xs text-[#94a3b8]">Prioritized registry of accounts exhibiting anomalous FII, BDS, NES, and IPS metrics</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#111827] rounded-[18px] p-4 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by Account ID or Community ID..."
            className="w-full bg-[#1e293b]/50 text-[#ffffff] text-sm py-2 pl-10 pr-4 rounded-xl border border-[#ffffff]/10 focus:border-[#ffffff]/30 outline-none placeholder:text-[#64748b]"
          />
        </div>
      </div>

      {/* High Risk Table */}
      <div className="bg-[#111827] rounded-[18px] border border-[#ffffff]/10 p-6 shadow-xl backdrop-blur-xl">
        <h3 className="text-base font-bold text-[#ffffff] mb-4">Top 20 Critical Risk Accounts</h3>
        <DataTable columns={columns} data={filtered} maxHeight="500px" />
      </div>

      {/* Drawer Overlay */}
      {selectedNode && (
        <NodePanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      )}
    </div>
  );
}
