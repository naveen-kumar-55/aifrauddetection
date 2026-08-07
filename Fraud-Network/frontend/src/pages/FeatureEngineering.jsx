import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Activity, TrendingUp, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, ZAxis 
} from 'recharts';

export default function FeatureEngineering() {
  // 4 Feature Innovation Cards
  const features = [
    { title: 'Fraud Influence Index (FII)', code: 'FII', value: '98.4%', trend: '+4.2%', icon: Zap, color: 'text-[#00f5d4]', desc: 'Quantifies graph centrality & money laundering network control of a given account node.' },
    { title: 'Behavior Drift Score (BDS)', code: 'BDS', value: '96.8%', trend: '+6.1%', icon: Activity, color: 'text-[#2563eb]', desc: 'Detects sudden velocity anomalies & temporal shifts compared to historical transaction baseline.' },
    { title: 'Network Exposure Score (NES)', code: 'NES', value: '94.5%', trend: '+3.8%', icon: ShieldAlert, color: 'text-[#f59e0b]', desc: 'Measures contagion risk and topological proximity to known blacklisted fraud clusters.' },
    { title: 'Intervention Priority (IPS)', code: 'IPS', value: '99.4%', trend: '+8.0%', icon: TrendingUp, color: 'text-[#ef4444]', desc: 'Combines FII, BDS, and NES to calculate the maximum fraud reduction ratio upon freezing.' },
  ];

  // Horizontal Bar Feature Importance
  const featureImportance = [
    { name: 'IPS (Intervention Priority)', importance: 94 },
    { name: 'FII (Fraud Influence Index)', importance: 88 },
    { name: 'NES (Network Exposure)', importance: 82 },
    { name: 'BDS (Behavior Drift)', importance: 76 },
    { name: 'Transaction Amount', importance: 58 },
  ];

  // Scatter Plot Data: NES vs Fraud Probability
  const scatterData = [
    { nes: 20, prob: 15, z: 200 },
    { nes: 35, prob: 28, z: 300 },
    { nes: 45, prob: 42, z: 400 },
    { nes: 60, prob: 68, z: 500 },
    { nes: 75, prob: 84, z: 700 },
    { nes: 88, prob: 92, z: 900 },
    { nes: 95, prob: 98, z: 1000 },
  ];

  const topAccounts = [
    { account: 'ACC-102948', fii: '98.4%', bds: '94.2%', nes: '96.5%', ips: '99.4%', status: 'Critical' },
    { account: 'ACC-559102', fii: '94.1%', bds: '96.8%', nes: '91.2%', ips: '96.2%', status: 'High' },
    { account: 'ACC-331049', fii: '89.5%', bds: '88.4%', nes: '94.5%', ips: '92.8%', status: 'High' },
    { account: 'ACC-882103', fii: '82.0%', bds: '91.0%', nes: '84.0%', ips: '88.5%', status: 'Medium' },
  ];

  return (
    <div className="flex flex-col w-full px-6 pb-12 gap-8 max-w-[1700px] mx-auto bg-[#020617] text-[#f8fafc]">
      
      {/* HEADER */}
      <div className="border-b border-[#1e293b] pb-4 pt-2">
        <div className="flex items-center gap-2 text-[#2563eb] text-xs font-bold uppercase tracking-widest mb-1">
          <Cpu size={16} className="text-[#00f5d4]" />
          <span>Graph Neural Network & Statistical Feature Innovation</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-[#f8fafc]">
          Feature Engineering <span className="text-[#94a3b8] font-light">| Proprietary Fraud Metrics</span>
        </h1>
        <p className="text-xs text-[#94a3b8] mt-1">
          Custom graph centrality indices and behavioral anomaly metrics designed for financial crime discovery.
        </p>
      </div>

      {/* 4 FEATURE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#0f172a] rounded-2xl p-5 border border-[#1e293b] shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <f.icon size={20} className={f.color} />
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#1e293b] text-[#00f5d4]">
                  {f.code}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#f8fafc] mb-1">{f.title}</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed mb-4">{f.desc}</p>
            </div>
            
            <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between">
              <span className="text-2xl font-black text-[#f8fafc]">{f.value}</span>
              <span className="text-[#10b981] font-bold text-xs flex items-center gap-0.5">
                <ArrowUpRight size={14} /> {f.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Horizontal Bar: Feature Importance */}
        <div className="bg-[#0f172a] rounded-2xl p-6 border border-[#1e293b] shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#f8fafc]">Proprietary Feature Importance Ranking</h3>
            <p className="text-xs text-[#94a3b8]">XGBoost & GNN weight attribution per metric</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={160} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                <Bar dataKey="importance" fill="#2563eb" radius={[0, 6, 6, 0]} name="Importance Weight %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scatter Plot: NES vs Fraud Probability */}
        <div className="bg-[#0f172a] rounded-2xl p-6 border border-[#1e293b] shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#f8fafc]">Network Exposure vs Fraud Probability</h3>
            <p className="text-xs text-[#94a3b8]">Scatter correlation showing exponential fraud risk at high NES</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="nes" name="Network Exposure Score" stroke="#94a3b8" fontSize={11} unit="%" />
                <YAxis dataKey="prob" name="Fraud Probability" stroke="#94a3b8" fontSize={11} unit="%" />
                <ZAxis dataKey="z" range={[100, 500]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                <Scatter name="Accounts" data={scatterData} fill="#00f5d4" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* TOP INFLUENTIAL ACCOUNTS TABLE */}
      <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] p-6 shadow-xl">
        <div className="mb-4">
          <h3 className="text-base font-bold text-[#f8fafc]">Top Influential Fraud Hub Accounts</h3>
          <p className="text-xs text-[#94a3b8]">Highest calculated FII and IPS score targets across the network graph</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e293b] text-[#94a3b8]">
                <th className="pb-3 font-semibold">Account ID</th>
                <th className="pb-3 font-semibold">Fraud Influence (FII)</th>
                <th className="pb-3 font-semibold">Behavior Drift (BDS)</th>
                <th className="pb-3 font-semibold">Exposure Score (NES)</th>
                <th className="pb-3 font-semibold">Intervention Priority (IPS)</th>
                <th className="pb-3 font-semibold">Threat Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {topAccounts.map((a, i) => (
                <tr key={i} className="hover:bg-[#1e293b]/40 transition-colors">
                  <td className="py-3 font-mono font-bold text-[#f8fafc]">{a.account}</td>
                  <td className="py-3 font-mono text-[#00f5d4] font-bold">{a.fii}</td>
                  <td className="py-3 font-mono text-[#2563eb] font-bold">{a.bds}</td>
                  <td className="py-3 font-mono text-[#f59e0b] font-bold">{a.nes}</td>
                  <td className="py-3 font-mono text-[#ef4444] font-bold">{a.ips}</td>
                  <td className="py-3">
                    <span className="px-2.5 py-1 bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 rounded-lg font-bold">
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
