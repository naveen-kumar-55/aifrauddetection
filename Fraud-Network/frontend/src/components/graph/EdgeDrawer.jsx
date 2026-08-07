import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, ArrowRight, Lock, Flag, User, Users, CheckCircle2, AlertOctagon, Activity, FileText } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function EdgeDrawer({ edgeData, onClose, onViewAccount, onViewCommunity }) {
  const [frozen, setFrozen] = useState(false);
  const [flagged, setFlagged] = useState(false);

  if (!edgeData) return null;

  const senderId = edgeData.source || 'ACC-8923-X';
  const receiverId = edgeData.target || 'ACC-1102-Y';
  const amountStr = formatCurrency(edgeData.totalAmount || 8718);
  const riskScore = edgeData.avgRisk || (edgeData.isFraud ? 96 : 35);
  const isSuspicious = edgeData.isFraud || edgeData.isSuspicious || riskScore > 75;

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
          className="relative w-full max-w-lg bg-[#111827] border-l border-[#ffffff]/10 shadow-2xl h-full flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#ffffff]/10 flex items-center justify-between bg-[#1e293b]/40 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl border ${
                isSuspicious ? 'bg-[#ffb4ab]/10 border-[#ffb4ab]/20 text-[#ffb4ab]' : 'bg-[#38bdf8]/10 border-[#38bdf8]/20 text-[#38bdf8]'
              }`}>
                <ShieldAlert size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Transaction Link Inspector</p>
                <h2 className="text-xl font-bold font-mono text-[#ffffff]">TXN-10384</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-[#1e293b] text-[#94a3b8] hover:text-[#ffffff] hover:bg-[#334155] transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Transfer Direction Card */}
            <div className="p-4 rounded-2xl bg-[#1e293b]/40 border border-[#ffffff]/10 flex items-center justify-between">
              <div className="text-left">
                <p className="text-[10px] font-bold text-[#94a3b8] uppercase">Sender Account</p>
                <p className="text-sm font-bold font-mono text-[#ffffff]">{senderId}</p>
                <button onClick={() => onViewAccount?.(senderId)} className="text-[11px] text-[#38bdf8] hover:underline font-medium mt-1">View Account</button>
              </div>

              <div className="flex flex-col items-center px-4">
                <span className="text-xs font-extrabold font-mono text-[#ffffff] mb-1">{amountStr}</span>
                <ArrowRight className="text-[#ffb4ab] animate-pulse" size={20} />
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold text-[#94a3b8] uppercase">Receiver Account</p>
                <p className="text-sm font-bold font-mono text-[#ffffff]">{receiverId}</p>
                <button onClick={() => onViewAccount?.(receiverId)} className="text-[11px] text-[#38bdf8] hover:underline font-medium mt-1">View Account</button>
              </div>
            </div>

            {/* Risk & Fraud Score Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#1e293b]/40 p-3.5 rounded-2xl border border-[#ffffff]/10 text-center">
                <p className="text-[10px] text-[#94a3b8] font-bold uppercase">Risk Score</p>
                <p className={`text-xl font-extrabold ${riskScore > 75 ? 'text-[#ffb4ab]' : 'text-[#38bdf8]'}`}>{riskScore}%</p>
              </div>
              <div className="bg-[#1e293b]/40 p-3.5 rounded-2xl border border-[#ffffff]/10 text-center">
                <p className="text-[10px] text-[#94a3b8] font-bold uppercase">Transfer Freq</p>
                <p className="text-xl font-extrabold text-[#ffffff]">{edgeData.txCount || 12} txns</p>
              </div>
              <div className="bg-[#1e293b]/40 p-3.5 rounded-2xl border border-[#ffffff]/10 text-center">
                <p className="text-[10px] text-[#94a3b8] font-bold uppercase">Community</p>
                <p className="text-xl font-extrabold text-[#ffb74d]">Cluster #01</p>
              </div>
            </div>

            {/* Triggered Rules */}
            <div>
              <h4 className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-3">Detection Rules Triggered</h4>
              <div className="space-y-2">
                {(edgeData.fraudTypes?.length > 0 ? edgeData.fraudTypes : ['High Velocity Transfer', 'Circular Ring Connection', 'High Risk Node']).map((rule, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 text-xs font-bold text-[#ffb4ab] flex items-center gap-2">
                    <AlertOctagon size={16} />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Explanation */}
            <div className="p-4 rounded-2xl bg-[#1e293b]/50 border border-[#ffffff]/10">
              <h4 className="text-xs font-bold text-[#ffffff] uppercase tracking-wider mb-1 flex items-center gap-2">
                <Activity size={14} className="text-[#38bdf8]" /> AI Reasoning
              </h4>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                This transaction represents a rapid high-value transfer within a known money laundering ring topology. The velocity pattern indicates potential structuring/layering prior to cash out.
              </p>
            </div>

            {/* Recommended Action */}
            <div className="p-4 rounded-2xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/30">
              <h4 className="text-xs font-bold text-[#ffb4ab] uppercase tracking-wider mb-1">Recommended Action</h4>
              <p className="text-xs text-[#e2e8f0]">
                Immediate hold on outbound transfers for receiver account {receiverId}. Initiate SAR regulatory report.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => setFrozen(true)}
                className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  frozen ? 'bg-[#34d399] text-[#0b1220]' : 'bg-[#ffb4ab] text-[#0b1220] hover:bg-[#fca5a5]'
                }`}
              >
                <Lock size={14} />
                {frozen ? 'Transaction Frozen' : 'Freeze Transaction'}
              </button>

              <button 
                onClick={() => setFlagged(true)}
                className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${
                  flagged ? 'bg-[#38bdf8] text-[#0b1220] border-[#38bdf8]' : 'bg-[#1e293b] text-[#ffffff] border-[#ffffff]/20 hover:bg-[#334155]'
                }`}
              >
                <Flag size={14} />
                {flagged ? 'Case Flagged' : 'Flag Investigation'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
