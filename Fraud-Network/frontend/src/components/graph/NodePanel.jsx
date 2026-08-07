import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Building2, AlertTriangle, Cpu, Zap, Lock, CheckCircle2, AlertOctagon, ShieldAlert, ArrowRight } from 'lucide-react';
import { fetchAiInvestigation, fetchAccountTransactions, fetchSimulateIntervention } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

export default function NodePanel({ node, onClose }) {
  const [report, setReport] = useState(null);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);

  useEffect(() => {
    if (!node) return;
    const load = async () => {
      setLoading(true);
      setSimResult(null);
      try {
        const [rep, t] = await Promise.all([
          fetchAiInvestigation(node.id).catch(() => null),
          fetchAccountTransactions(node.id).catch(() => [])
        ]);
        setReport(rep);
        setTxns(t || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [node]);

  const handleFreeze = async () => {
    if (!node) return;
    setSimulating(true);
    try {
      const res = await fetchSimulateIntervention(node.id);
      setSimResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  if (!node) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="absolute top-0 right-0 bottom-0 w-[420px] z-50 bg-[#1c1b1b] border-l border-[#444748]/30 flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#444748]/30 flex items-center justify-between shrink-0 bg-[#201f1f]">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg border ${
              node.isFraud ? 'bg-[#ffb4ab]/10 border-[#ffb4ab]/30 text-[#ffb4ab]' : 'bg-[#4cd7f6]/10 border-[#4cd7f6]/30 text-[#4cd7f6]'
            }`}>
              {node.accountType === 'Business' ? <Building2 size={20} /> : <User size={20} />}
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#c4c7c8] uppercase tracking-wider">Node Details</p>
              <h3 className="text-base font-bold text-[#ffffff]">{node.customerName}</h3>
              <p className="text-xs text-[#c4c7c8]">{node.accountType} — {node.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-[#2a2a2a] text-[#c4c7c8] hover:text-[#ffffff] hover:bg-[#353434] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-10 h-10 border-4 border-[#444748] border-t-[#4cd7f6] rounded-full animate-spin" />
              <p className="text-xs text-[#c4c7c8]">Loading risk metrics...</p>
            </div>
          ) : (
            <>
              {report && (
                <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                  report.recommendation?.includes('CRITICAL') ? 'bg-[#ffb4ab]/10 border-[#ffb4ab]/30 text-[#ffb4ab]' :
                  report.recommendation?.includes('ELEVATED') ? 'bg-[#ffb74d]/10 border-[#ffb74d]/30 text-[#ffb74d]' :
                  'bg-[#81c784]/10 border-[#81c784]/30 text-[#81c784]'
                }`}>
                  {report.recommendation?.includes('CRITICAL') ? <AlertOctagon size={22} /> :
                   report.recommendation?.includes('ELEVATED') ? <ShieldAlert size={22} /> :
                   <CheckCircle2 size={22} />}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Recommendation</p>
                    <p className="text-xs font-bold text-[#e5e2e1]">{report.recommendation}</p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-[10px] font-semibold text-[#c4c7c8] uppercase tracking-wider mb-2.5">Account Summary</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#201f1f] p-2.5 rounded-lg border border-[#444748]/30 text-center">
                    <p className="text-[10px] text-[#c4c7c8]">Risk Score</p>
                    <p className={`text-base font-bold ${node.riskScore >= 80 ? 'text-[#ffb4ab]' : node.riskScore >= 50 ? 'text-[#ffb74d]' : 'text-[#4cd7f6]'}`}>
                      {node.riskScore}%
                    </p>
                  </div>
                  <div className="bg-[#201f1f] p-2.5 rounded-lg border border-[#444748]/30 text-center">
                    <p className="text-[10px] text-[#c4c7c8]">Community</p>
                    <p className="text-base font-bold text-[#e5e2e1]">#{node.communityId}</p>
                  </div>
                  <div className="bg-[#201f1f] p-2.5 rounded-lg border border-[#444748]/30 text-center">
                    <p className="text-[10px] text-[#c4c7c8]">Connections</p>
                    <p className="text-base font-bold text-[#e5e2e1]">{node.degree}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-semibold text-[#c4c7c8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Cpu size={11} /> Intelligence Indicators
                </h4>
                <div className="space-y-2">
                  {[
                    { label: 'FII (Influence)', value: report?.fii ?? node.fii, color: '#ffffff' },
                    { label: 'BDS (Behavior Drift)', value: report?.bds ?? node.bds, color: '#4cd7f6' },
                    { label: 'NES (Exposure)', value: report?.nes ?? node.nes, color: '#ffb74d' },
                    { label: 'IPS (Priority)', value: report?.ips ?? node.ips, color: '#ffb4ab' },
                  ].map(m => (
                    <div key={m.label} className="bg-[#201f1f] p-2 rounded-lg border border-[#444748]/30">
                      <div className="flex justify-between items-center text-[11px] mb-1">
                        <span className="text-[#c4c7c8]">{m.label}</span>
                        <span className="font-bold font-mono" style={{ color: m.color }}>{m.value?.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-[#353434] h-1.5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, m.value || 0)}%`, background: m.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#201f1f] border border-[#444748]/30 p-3.5 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-[#4cd7f6]" />
                  <h4 className="text-xs font-bold text-[#e5e2e1]">Intervention Simulator</h4>
                </div>
                {simResult ? (
                  <div className="p-2.5 bg-[#81c784]/10 border border-[#81c784]/30 rounded-lg text-[#81c784] text-[11px]">
                    <p className="font-bold flex items-center gap-1.5 mb-1"><CheckCircle2 size={13} /> Account Frozen</p>
                    <p>{simResult.message}</p>
                  </div>
                ) : (
                  <button onClick={handleFreeze} disabled={simulating} className="btn-primary w-full py-2 text-xs">
                    {simulating ? 'Simulating Impact...' : <><Lock size={13} /> Freeze Account & Cut Edges</>}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
