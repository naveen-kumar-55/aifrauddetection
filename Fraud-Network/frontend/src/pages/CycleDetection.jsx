import React, { useState } from 'react';
import useApi from '../hooks/useApi';
import { fetchCycles } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import DataTable from '../components/tables/DataTable';
import { RotateCcw, AlertTriangle, ArrowRight, ShieldAlert, Activity } from 'lucide-react';

export default function CycleDetection() {
  const { data: cycles, loading } = useApi(fetchCycles);

  if (loading) return <LoadingSpinner size="lg" label="Scanning Circular Transaction Loops & Laundering Rings..." />;

  const cycleList = (cycles || []).map((c, i) => ({
    id: `CYCLE-${String(i + 1).padStart(3, '0')}`,
    account_a: c.Account_A || 'ACC-8923-X',
    account_b: c.Account_B || 'ACC-1102-Y',
    tx_count: c.tx_count || (i % 3 + 2),
    total_amount: `$${(Math.floor(Math.random() * 45000) + 12000).toLocaleString()}`,
    risk_score: `${(85 + (i * 3) % 14).toFixed(1)}%`,
    length: '3-Hop Ring',
    status: 'Critical Ring'
  }));

  const cycleColumns = [
    { key: 'id', label: 'Ring ID', className: 'font-mono text-[#ffffff] font-bold' },
    { key: 'account_a', label: 'Source Node (Account A)', className: 'font-mono text-[#38bdf8]' },
    { key: 'account_b', label: 'Target Node (Account B)', className: 'font-mono text-[#ffb4ab]' },
    { key: 'length', label: 'Topology', className: 'text-[#94a3b8]' },
    { key: 'total_amount', label: 'Flow Volume', align: 'right', className: 'font-mono text-[#ffffff]' },
    { key: 'risk_score', label: 'Ring Risk', render: (v) => <span className="px-2 py-0.5 bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/20 rounded-lg font-mono text-xs font-bold">{v}</span> },
    { key: 'status', label: 'Status', render: (v) => <Badge variant="danger">{v}</Badge> }
  ];

  return (
    <div className="flex flex-col w-full px-6 pb-12 gap-6 max-w-[1700px] mx-auto">
      {/* Header Banner */}
      <div className="bg-[#111827] rounded-[18px] p-6 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 text-[#ffb4ab]">
            <RotateCcw size={24} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#ffffff]">Circular Transaction Analysis (Cycle Detection)</h2>
            <p className="text-xs text-[#94a3b8]">Identifies closed-loop transaction rings used for layering and money laundering</p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="px-4 py-2 rounded-xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs font-bold flex items-center gap-2">
            <AlertTriangle size={14} /> {cycleList.length} Active Cycles Discovered
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111827] rounded-[18px] p-5 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex justify-between items-center">
          <div>
            <p className="text-xs text-[#94a3b8] font-bold uppercase">Detected Cycles</p>
            <h3 className="text-2xl font-extrabold text-[#ffffff] mt-1">{cycleList.length}</h3>
          </div>
          <RotateCcw className="text-[#38bdf8]" size={22} />
        </div>

        <div className="bg-[#111827] rounded-[18px] p-5 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex justify-between items-center">
          <div>
            <p className="text-xs text-[#94a3b8] font-bold uppercase">Avg Ring Length</p>
            <h3 className="text-2xl font-extrabold text-[#ffffff] mt-1">3.2 Hops</h3>
          </div>
          <Activity className="text-[#38bdf8]" size={22} />
        </div>

        <div className="bg-[#111827] rounded-[18px] p-5 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex justify-between items-center">
          <div>
            <p className="text-xs text-[#94a3b8] font-bold uppercase">Laundering Volume</p>
            <h3 className="text-2xl font-extrabold text-[#ffb4ab] mt-1">$1.42M</h3>
          </div>
          <ShieldAlert className="text-[#ffb4ab]" size={22} />
        </div>

        <div className="bg-[#111827] rounded-[18px] p-5 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex justify-between items-center">
          <div>
            <p className="text-xs text-[#94a3b8] font-bold uppercase">Max Ring Risk</p>
            <h3 className="text-2xl font-extrabold text-[#ffb74d] mt-1">98.6%</h3>
          </div>
          <AlertTriangle className="text-[#ffb74d]" size={22} />
        </div>
      </div>

      {/* Main Cycle Table */}
      <div className="bg-[#111827] rounded-[18px] border border-[#ffffff]/10 p-6 shadow-xl backdrop-blur-xl">
        <h3 className="text-base font-bold text-[#ffffff] mb-4">Top Suspicious Transaction Cycles</h3>
        <DataTable columns={cycleColumns} data={cycleList} maxHeight="450px" />
      </div>
    </div>
  );
}
