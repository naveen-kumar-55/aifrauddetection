import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Activity, Users, AlertTriangle, 
  DollarSign, Lock, Zap, ArrowUpRight, ArrowDownRight, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();

  // 6 KPI Cards
  const kpiData = [
    { label: 'Total Transactions', val: '1,250,642', change: '+14.2%', up: true, icon: Activity, desc: 'Processed volume 24h' },
    { label: 'Fraud Transactions', val: '3,218', change: '+18.5%', up: true, icon: ShieldAlert, desc: 'Confirmed ML fraud' },
    { label: 'High Risk Accounts', val: '154', change: '+8.1%', up: true, icon: Lock, desc: 'Risk score > 80%' },
    { label: 'Money at Risk', val: '₹12.8 Cr', change: '+12.4%', up: true, icon: DollarSign, desc: 'Active in suspicious rings' },
    { label: 'Network Risk Score', val: '89%', change: '+5.0%', up: true, icon: AlertTriangle, desc: 'Graph threat topology' },
    { label: 'AI Confidence', val: '96%', change: '+2.1%', up: true, icon: ShieldCheck, desc: 'Ensemble model score' },
  ];

  // Mock Trend Line Data
  const fraudTrendData = [
    { day: 'Day 1', fraud: 120, baseline: 140 },
    { day: 'Day 5', fraud: 180, baseline: 150 },
    { day: 'Day 10', fraud: 240, baseline: 160 },
    { day: 'Day 15', fraud: 190, baseline: 155 },
    { day: 'Day 20', fraud: 310, baseline: 170 },
    { day: 'Day 25', fraud: 450, baseline: 180 },
    { day: 'Day 30', fraud: 280, baseline: 165 },
  ];

  // Mock Hourly Bar Data
  const hourlyData = [
    { hour: '00:00', count: 42 },
    { hour: '04:00', count: 18 },
    { hour: '08:00', count: 85 },
    { hour: '12:00', count: 190 },
    { hour: '16:00', count: 240 },
    { hour: '20:00', count: 320 },
  ];

  // Mock Pie Distribution
  const pieData = [
    { name: 'Normal (99.7%)', value: 1247424, color: '#10b981' },
    { name: 'Suspicious (0.2%)', value: 2500, color: '#f59e0b' },
    { name: 'Confirmed Fraud (0.1%)', value: 718, color: '#ef4444' },
  ];

  // Mock Volume Area Data
  const volumeData = [
    { time: 'Mon', volume: 180000 },
    { time: 'Tue', volume: 220000 },
    { time: 'Wed', volume: 195000 },
    { time: 'Thu', volume: 240000 },
    { time: 'Fri', volume: 290000 },
    { time: 'Sat', volume: 310000 },
    { time: 'Sun', volume: 215000 },
  ];

  const recentAlerts = [
    { account: 'ACC-102948', risk: 98, type: 'Circular Transfer Loop', amount: '₹42,50,000', status: 'Critical' },
    { account: 'ACC-559102', risk: 94, type: 'Rapid Behavior Drift', amount: '₹18,20,000', status: 'High' },
    { account: 'ACC-331049', risk: 88, type: 'Network Contagion', amount: '₹95,00,000', status: 'High' },
    { account: 'ACC-882103', risk: 82, type: 'Multi-device Bridge', amount: '₹12,40,000', status: 'Medium' },
  ];

  return (
    <div className="flex flex-col w-full px-6 pb-12 gap-8 max-w-[1700px] mx-auto bg-[#020617] text-[#f8fafc]">
      
      {/* HERO TITLE SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-2 border-b border-[#1e293b] pb-6"
      >
        <div>
          <div className="flex items-center gap-2 text-[#2563eb] text-xs font-bold uppercase tracking-widest mb-1">
            <Zap size={16} className="text-[#00f5d4]" />
            <span>Palantir & Sentinel Inspired AI Platform</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#f8fafc]">
            DATASPHERE <span className="text-[#2563eb] font-light">| AI Fraud Intelligence Platform</span>
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Real-time financial crime discovery, graph neural topology & automated intervention engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/investigation')}
            className="px-4 py-2.5 rounded-xl bg-[#2563eb] text-[#ffffff] font-bold text-xs hover:bg-[#1d4ed8] transition-all shadow-lg shadow-[#2563eb]/25 flex items-center gap-2"
          >
            Launch AI Investigation
          </button>
          <button 
            onClick={() => navigate('/network')}
            className="px-4 py-2.5 rounded-xl bg-[#0f172a] text-[#00f5d4] border border-[#1e293b] font-bold text-xs hover:bg-[#1e293b] transition-all flex items-center gap-2"
          >
            Network Explorer
          </button>
        </div>
      </motion.div>

      {/* 6 KPI CARDS WITH COUNT-UP ANIMATION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiData.map((k, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#0f172a] rounded-2xl p-4 border border-[#1e293b] shadow-xl flex flex-col justify-between hover:border-[#2563eb]/50 transition-all"
          >
            <div>
              <div className="flex justify-between items-center text-[#94a3b8] text-xs font-medium mb-2">
                <div className="flex items-center gap-1.5">
                  <k.icon size={15} className="text-[#2563eb]" />
                  <span className="truncate">{k.label}</span>
                </div>
              </div>
              <p className="text-2xl font-black text-[#f8fafc] tracking-tight">{k.val}</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#1e293b] flex justify-between items-center text-[10px] text-[#94a3b8]">
              <span>{k.desc}</span>
              <span className="text-[#10b981] font-bold flex items-center gap-0.5">
                <ArrowUpRight size={12} /> {k.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 4 CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Fraud Trend Line Chart */}
        <div className="bg-[#0f172a] rounded-2xl p-6 border border-[#1e293b] shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-[#f8fafc]">30-Day Fraud Trend Analysis</h3>
              <p className="text-xs text-[#94a3b8]">Confirmed fraud instances vs expected baseline</p>
            </div>
            <span className="px-2.5 py-1 bg-[#2563eb]/10 text-[#2563eb] text-[10px] font-bold rounded-lg border border-[#2563eb]/20">Realtime Feed</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fraudTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                <Line type="monotone" dataKey="fraud" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} name="Fraud Instances" />
                <Line type="monotone" dataKey="baseline" stroke="#2563eb" strokeWidth={2} strokeDasharray="4 4" name="Baseline" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Fraud by Hour Bar Chart */}
        <div className="bg-[#0f172a] rounded-2xl p-6 border border-[#1e293b] shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-[#f8fafc]">Hourly Fraud Distribution</h3>
              <p className="text-xs text-[#94a3b8]">Peak transaction velocity window analysis</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Fraud Events" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Fraud Distribution Pie Chart */}
        <div className="bg-[#0f172a] rounded-2xl p-6 border border-[#1e293b] shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-[#f8fafc]">Network Fraud Distribution</h3>
              <p className="text-xs text-[#94a3b8]">Breakdown by risk category classification</p>
            </div>
          </div>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Transaction Volume Area Chart */}
        <div className="bg-[#0f172a] rounded-2xl p-6 border border-[#1e293b] shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-[#f8fafc]">Weekly Transaction Volume</h3>
              <p className="text-xs text-[#94a3b8]">Total network throughput volume in INR</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                <Area type="monotone" dataKey="volume" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} name="Volume (INR)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* RECENT ALERTS TABLE WITH RISK BADGES */}
      <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-[#f8fafc]">Recent High-Risk Intelligence Alerts</h3>
            <p className="text-xs text-[#94a3b8]">Live streaming anomaly events flagged by AI network graph engine</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e293b] text-[#94a3b8]">
                <th className="pb-3 font-semibold">Account ID</th>
                <th className="pb-3 font-semibold">Risk Index</th>
                <th className="pb-3 font-semibold">Anomaly Pattern</th>
                <th className="pb-3 font-semibold">Money At Risk</th>
                <th className="pb-3 font-semibold">Alert Status</th>
                <th className="pb-3 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {recentAlerts.map((a, i) => (
                <tr key={i} className="hover:bg-[#1e293b]/40 transition-colors">
                  <td className="py-3 font-mono font-bold text-[#f8fafc]">{a.account}</td>
                  <td className="py-3">
                    <span className="px-2.5 py-1 bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 rounded-lg font-mono font-bold">
                      {a.risk}%
                    </span>
                  </td>
                  <td className="py-3 text-[#94a3b8]">{a.type}</td>
                  <td className="py-3 font-mono font-semibold text-[#f8fafc]">{a.amount}</td>
                  <td className="py-3">
                    <span className="flex items-center gap-1.5 text-[#ef4444] font-bold">
                      <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" /> {a.status}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <button 
                      onClick={() => navigate('/investigation')}
                      className="px-3 py-1 bg-[#2563eb] text-[#ffffff] rounded-lg hover:bg-[#1d4ed8] transition-colors text-[11px] font-bold uppercase tracking-wider"
                    >
                      Investigate
                    </button>
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
