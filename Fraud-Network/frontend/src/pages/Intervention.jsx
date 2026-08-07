import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Lock, Play, ShieldCheck, Zap, RefreshCcw } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function Intervention() {
  const [selectedAccount, setSelectedAccount] = useState('ACC-102948');
  const [selectedAction, setSelectedAction] = useState('Freeze');
  const [simulated, setSimulated] = useState(true);

  const beforeData = [
    { name: 'Contagion Nodes', value: 245, color: '#ef4444' },
    { name: 'Isolated Safe Nodes', value: 55, color: '#10b981' },
  ];

  const afterData = [
    { name: 'Contagion Nodes', value: 39, color: '#ef4444' },
    { name: 'Protected Safe Nodes', value: 261, color: '#10b981' },
  ];

  return (
    <div className="flex flex-col w-full px-6 pb-12 gap-8 max-w-[1700px] mx-auto bg-[#020617] text-[#f8fafc]">
      
      {/* HEADER */}
      <div className="border-b border-[#1e293b] pb-4 pt-2">
        <div className="flex items-center gap-2 text-[#2563eb] text-xs font-bold uppercase tracking-widest mb-1">
          <Activity size={16} className="text-[#00f5d4]" />
          <span>Real-time Counter-Fraud Network Simulation Engine</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-[#f8fafc]">
          Intervention Simulator <span className="text-[#94a3b8] font-light">| Network Containment Model</span>
        </h1>
        <p className="text-xs text-[#94a3b8] mt-1">
          Simulate targeted account isolation to measure contagion containment and money protection.
        </p>
      </div>

      {/* CONTROLS CARD */}
      <div className="bg-[#0f172a] rounded-2xl p-6 border border-[#1e293b] shadow-xl">
        <h3 className="text-base font-bold text-[#f8fafc] mb-4">Simulation Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#94a3b8] block mb-1.5">Select Target Account</label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full bg-[#1e293b] text-[#f8fafc] border border-[#1e293b] rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:border-[#2563eb] focus:outline-none"
            >
              <option value="ACC-102948">ACC-102948 (High IPS Target - FII: 98.4%)</option>
              <option value="ACC-559102">ACC-559102 (BDS Anomaly - FII: 94.1%)</option>
              <option value="ACC-331049">ACC-331049 (Circular Loop - FII: 89.5%)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#94a3b8] block mb-1.5">Select Intervention Action</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full bg-[#1e293b] text-[#f8fafc] border border-[#1e293b] rounded-xl px-4 py-2.5 text-xs font-bold focus:border-[#2563eb] focus:outline-none"
            >
              <option value="Freeze">Freeze Account & Block Wire/ACH Transits</option>
              <option value="Monitor">Monitor Realtime Graph Velocity</option>
              <option value="Restrict">Restrict Daily Outflow Limit</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setSimulated(true)}
              className="w-full py-2.5 bg-[#2563eb] text-[#ffffff] font-bold text-xs rounded-xl hover:bg-[#1d4ed8] transition-all shadow-lg shadow-[#2563eb]/25 flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <Play size={16} /> Run Countermeasure Simulation
            </button>
          </div>
        </div>
      </div>

      {/* METRICS COMPARISON CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#0f172a] rounded-2xl p-6 border border-[#1e293b] shadow-xl text-center space-y-2">
          <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">Current Network Contagion</span>
          <p className="text-4xl font-black text-[#ef4444]">245 Nodes</p>
          <p className="text-xs text-[#94a3b8]">Active infected accounts across 3 rings</p>
        </motion.div>

        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#0f172a] rounded-2xl p-6 border border-[#1e293b] shadow-xl text-center space-y-2 border-t-4 border-t-[#10b981]">
          <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">After Action Contagion</span>
          <p className="text-4xl font-black text-[#10b981]">39 Nodes</p>
          <p className="text-xs text-[#94a3b8]">Isolated downstream residual nodes</p>
        </motion.div>

        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#0f172a] rounded-2xl p-6 border border-[#1e293b] shadow-xl text-center space-y-2 bg-gradient-to-br from-[#0f172a] to-[#2563eb]/20">
          <span className="text-xs font-bold text-[#00f5d4] uppercase tracking-wider">Total Fraud Contagion Reduction</span>
          <p className="text-4xl font-black text-[#00f5d4]">84% Reduction</p>
          <p className="text-xs text-[#94a3b8]">₹10.7 Cr Capital Protected</p>
        </motion.div>
      </div>

      {/* BEFORE & AFTER PIE CHARTS COMPARISON */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0f172a] rounded-2xl p-6 border border-[#1e293b] shadow-xl text-center">
          <h3 className="text-base font-bold text-[#f8fafc] mb-1">Before Action Topology</h3>
          <p className="text-xs text-[#94a3b8] mb-4">High risk contagion network spread</p>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={beforeData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value">
                  {beforeData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0f172a] rounded-2xl p-6 border border-[#1e293b] shadow-xl text-center">
          <h3 className="text-base font-bold text-[#f8fafc] mb-1">After Action Topology (Simulated)</h3>
          <p className="text-xs text-[#94a3b8] mb-4">Post isolation network containment status</p>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={afterData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value">
                  {afterData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
