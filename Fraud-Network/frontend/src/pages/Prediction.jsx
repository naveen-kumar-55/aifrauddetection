import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, AlertTriangle, ShieldAlert, Clock, ArrowRight } from 'lucide-react';

export default function Prediction() {
  const predictions = [
    { account: 'ACC-882103', prob: '96.4%', reason: 'Upstream contagion from ACC-102948', time: '< 2 Hours', action: 'Freeze Account', status: 'Imminent' },
    { account: 'ACC-449102', prob: '89.2%', reason: 'Rapid velocity burst & multi-device bridge', time: '< 6 Hours', action: 'Restrict Transfers', status: 'High Risk' },
    { account: 'ACC-331049', prob: '84.8%', reason: 'Circular transaction velocity ring', time: '< 12 Hours', action: 'Enhanced KYC Review', status: 'High Risk' },
    { account: 'ACC-992011', prob: '78.5%', reason: 'Proximity to flagged community cluster #01', time: '< 24 Hours', action: 'Monitor Transactions', status: 'Medium Risk' },
  ];

  const heatmapRegions = [
    { name: 'Cluster #01 (Laundering Ring)', risk: 94, contagion: 'Extreme', nodes: 42 },
    { name: 'Cluster #04 (Crypto Bridge)', risk: 82, contagion: 'High', nodes: 28 },
    { name: 'Cluster #12 (Mule Network)', risk: 76, contagion: 'Medium', nodes: 35 },
    { name: 'Cluster #08 (ATM Cash Out)', risk: 65, contagion: 'Moderate', nodes: 19 },
  ];

  return (
    <div className="flex flex-col w-full px-6 pb-12 gap-8 max-w-[1700px] mx-auto bg-[#020617] text-[#f8fafc]">
      
      {/* HEADER */}
      <div className="border-b border-[#1e293b] pb-4 pt-2">
        <div className="flex items-center gap-2 text-[#2563eb] text-xs font-bold uppercase tracking-widest mb-1">
          <Target size={16} className="text-[#00f5d4]" />
          <span>Predictive Graph Contagion & Risk Engine</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-[#f8fafc]">
          Next Target Prediction <span className="text-[#94a3b8] font-light">| Preventive AI Forecast</span>
        </h1>
        <p className="text-xs text-[#94a3b8] mt-1">
          Predicts future target accounts likely to be compromised within the next 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT (8 cols): PREDICTION TABLE */}
        <div className="lg:col-span-8 bg-[#0f172a] rounded-2xl border border-[#1e293b] p-6 shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#f8fafc]">Predicted High-Probability Targets</h3>
            <p className="text-xs text-[#94a3b8]">AI forecast of accounts at immediate risk of fraud contagion</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e293b] text-[#94a3b8]">
                  <th className="pb-3 font-semibold">Account ID</th>
                  <th className="pb-3 font-semibold">Fraud Probability</th>
                  <th className="pb-3 font-semibold">AI Diagnostic Reason</th>
                  <th className="pb-3 font-semibold">Predicted Time</th>
                  <th className="pb-3 font-semibold">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {predictions.map((p, i) => (
                  <tr key={i} className="hover:bg-[#1e293b]/40 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-[#f8fafc]">{p.account}</td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-1 bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 rounded-lg font-mono font-bold">
                        {p.prob}
                      </span>
                    </td>
                    <td className="py-3.5 text-[#94a3b8]">{p.reason}</td>
                    <td className="py-3.5 font-semibold text-[#f59e0b] flex items-center gap-1">
                      <Clock size={13} /> {p.time}
                    </td>
                    <td className="py-3.5">
                      <button className="px-3 py-1 bg-[#2563eb] text-[#ffffff] rounded-lg hover:bg-[#1d4ed8] transition-colors text-[11px] font-bold">
                        {p.action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT (4 cols): FUTURE FRAUD RISK GAUGE */}
        <div className="lg:col-span-4 bg-[#0f172a] rounded-2xl border border-[#1e293b] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3 mb-4">
              <h3 className="text-base font-bold text-[#f8fafc]">Future Fraud Risk Gauge</h3>
              <span className="px-2 py-0.5 rounded-full bg-[#ef4444]/10 text-[#ef4444] text-[10px] font-bold">CRITICAL</span>
            </div>

            {/* Visual Circular Gauge */}
            <div className="flex flex-col items-center justify-center my-6">
              <div className="relative w-44 h-44 rounded-full border-8 border-[#1e293b] border-t-[#ef4444] border-r-[#f59e0b] flex items-center justify-center shadow-inner">
                <div className="text-center">
                  <span className="text-4xl font-black text-[#f8fafc]">89.4%</span>
                  <span className="block text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider mt-1">Network Contagion</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#1e293b]/50 border border-[#1e293b] flex justify-between">
                <span className="text-[#94a3b8]">Contagion Speed</span>
                <span className="font-bold text-[#ef4444]">High Velocity</span>
              </div>
              <div className="p-3 rounded-xl bg-[#1e293b]/50 border border-[#1e293b] flex justify-between">
                <span className="text-[#94a3b8]">Est. Financial Damage</span>
                <span className="font-bold text-[#f8fafc]">₹4.8 Cr Potential</span>
              </div>
            </div>
          </div>

          <button className="mt-6 w-full py-3 rounded-xl bg-[#00f5d4] text-[#020617] font-black text-xs hover:bg-[#00d6b9] transition-colors uppercase tracking-wider flex items-center justify-center gap-2">
            <Zap size={15} /> Execute Containment Lock
          </button>
        </div>

      </div>

      {/* HEATMAP OF POTENTIAL FRAUD EXPANSION */}
      <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] p-6 shadow-xl">
        <div className="mb-4">
          <h3 className="text-base font-bold text-[#f8fafc]">Community Heatmap — Potential Fraud Expansion</h3>
          <p className="text-xs text-[#94a3b8]">Louvain community risk vulnerability mapping</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {heatmapRegions.map((h, i) => (
            <div key={i} className="bg-[#1e293b]/40 rounded-xl p-4 border border-[#1e293b] space-y-2">
              <span className="text-xs font-bold text-[#f8fafc] block">{h.name}</span>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#94a3b8]">Risk Index</span>
                <span className="font-mono font-bold text-[#ef4444]">{h.risk}%</span>
              </div>
              <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden">
                <div className="bg-[#ef4444] h-full rounded-full" style={{ width: `${h.risk}%` }} />
              </div>
              <div className="flex justify-between items-center text-[11px] text-[#94a3b8] pt-1">
                <span>Contagion: <strong className="text-[#f8fafc]">{h.contagion}</strong></span>
                <span>{h.nodes} Nodes</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
