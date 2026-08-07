import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, ShieldAlert, AlertTriangle, Zap, CheckCircle2, ArrowRight, Activity, Cpu } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export default function CommunityDrawer({ community, onClose, onInvestigateAccount }) {
  if (!community) return null;

  const sampleInfluential = [
    { account_id: 'ACC-8923-ALPHA', name: 'Global Logistics Corp', fii: 98.4, risk: 94.2 },
    { account_id: 'ACC-1102-BETA', name: 'Elena Rostova', fii: 91.2, risk: 88.6 },
    { account_id: 'ACC-4491-GAMMA', name: 'Apex Digital LLC', fii: 85.7, risk: 79.1 },
  ];

  const sampleExposure = [
    { account_id: 'ACC-3310-DELTA', name: 'Marcus Vance', nes: 96.1, distance: '1 hop' },
    { account_id: 'ACC-7721-EPSILON', name: 'Horizon Fintech', nes: 89.4, distance: '2 hops' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0b1220]/70 backdrop-blur-sm"
        />

        {/* Drawer Container */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative w-full max-w-xl bg-[#111827] border-l border-[#ffffff]/10 shadow-2xl h-full flex flex-col z-10"
        >
          {/* Drawer Header */}
          <div className="p-6 border-b border-[#ffffff]/10 flex items-center justify-between bg-[#1e293b]/40 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 text-[#ffb4ab]">
                <Users size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Community Cluster Details</p>
                <h2 className="text-xl font-bold text-[#ffffff]">Community #{community.cid || community.community_id || '01'}</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-[#1e293b] text-[#94a3b8] hover:text-[#ffffff] hover:bg-[#334155] transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-[#1e293b]/40 p-3 rounded-2xl border border-[#ffffff]/10 text-center">
                <p className="text-[10px] text-[#94a3b8] font-bold uppercase">Accounts</p>
                <p className="text-lg font-bold text-[#ffffff]">{community.count || 42}</p>
              </div>
              <div className="bg-[#1e293b]/40 p-3 rounded-2xl border border-[#ffffff]/10 text-center">
                <p className="text-[10px] text-[#94a3b8] font-bold uppercase">Fraud Accts</p>
                <p className="text-lg font-bold text-[#ffb4ab]">{community.fraud_count || 12}</p>
              </div>
              <div className="bg-[#1e293b]/40 p-3 rounded-2xl border border-[#ffffff]/10 text-center">
                <p className="text-[10px] text-[#94a3b8] font-bold uppercase">Avg Risk</p>
                <p className="text-lg font-bold text-[#ffb74d]">{community.avg_risk || '84.2%'}</p>
              </div>
              <div className="bg-[#1e293b]/40 p-3 rounded-2xl border border-[#ffffff]/10 text-center">
                <p className="text-[10px] text-[#94a3b8] font-bold uppercase">Cycles</p>
                <p className="text-lg font-bold text-[#38bdf8]">{community.cycles || 5}</p>
              </div>
            </div>

            {/* AI Recommendation Box */}
            <div className="p-4 rounded-2xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 flex items-start gap-3">
              <ShieldAlert className="text-[#ffb4ab] shrink-0 mt-0.5" size={22} />
              <div>
                <h4 className="text-xs font-bold text-[#ffb4ab] uppercase tracking-wider">AI Executive Directive</h4>
                <p className="text-xs text-[#e2e8f0] mt-1 leading-relaxed">
                  High density of circular transactions detected within this cluster. Immediate isolation of top influential nodes recommended to prevent contagion across connected hubs.
                </p>
              </div>
            </div>

            {/* Top Influential Accounts (FII) */}
            <div>
              <h4 className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-3 flex items-center gap-2">
                <Cpu size={14} className="text-[#ffffff]" /> Top Influential Accounts (FII)
              </h4>
              <div className="space-y-2">
                {sampleInfluential.map((acc) => (
                  <div key={acc.account_id} className="p-3 rounded-xl bg-[#1e293b]/40 border border-[#ffffff]/10 flex items-center justify-between hover:bg-[#1e293b]/70 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-[#ffffff]">{acc.name}</p>
                      <p className="text-[11px] font-mono text-[#94a3b8]">{acc.account_id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#ffffff]">FII: {acc.fii}%</span>
                      <button 
                        onClick={() => onInvestigateAccount?.(acc.account_id)}
                        className="px-2.5 py-1 rounded-lg bg-[#ffffff] text-[#0b1220] font-semibold text-[11px] hover:bg-[#e2e8f0] transition-colors"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Exposure Accounts (NES) */}
            <div>
              <h4 className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-3 flex items-center gap-2">
                <Activity size={14} className="text-[#ffb74d]" /> Exposure Risk Accounts (NES)
              </h4>
              <div className="space-y-2">
                {sampleExposure.map((acc) => (
                  <div key={acc.account_id} className="p-3 rounded-xl bg-[#1e293b]/40 border border-[#ffffff]/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#ffffff]">{acc.name}</p>
                      <p className="text-[11px] font-mono text-[#94a3b8]">{acc.account_id} • {acc.distance}</p>
                    </div>
                    <span className="text-xs font-bold text-[#ffb74d]">NES: {acc.nes}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Connected Communities */}
            <div>
              <h4 className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-3">Connected Communities</h4>
              <div className="flex gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-[#1e293b] border border-[#ffffff]/10 text-xs font-mono text-[#38bdf8]">Cluster #04 (14 Txns)</span>
                <span className="px-3 py-1.5 rounded-xl bg-[#1e293b] border border-[#ffffff]/10 text-xs font-mono text-[#ffb4ab]">Cluster #12 (8 Txns)</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
