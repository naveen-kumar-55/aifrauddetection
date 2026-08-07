import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Building2, AlertTriangle, Cpu, Zap, Lock, CheckCircle2, AlertOctagon, ShieldAlert, Activity, DollarSign, GitCommit, Network, Shield } from 'lucide-react';
import { fetchAiInvestigation, fetchAccountTransactions, fetchSimulateIntervention } from '../../services/api';
import { formatCurrency, formatNumber } from '../../utils/formatters';

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

  const riskScore = report?.risk_score ?? node.riskScore ?? 0;
  const isHighRisk = riskScore >= 80;
  const isMedRisk = riskScore >= 50 && riskScore < 80;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="absolute top-0 right-0 bottom-0 w-[440px] z-50 bg-[#111827]/95 backdrop-blur-xl border-l border-[#ffffff]/10 flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#ffffff]/10 flex items-center justify-between shrink-0 bg-[#1e293b]/50">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isHighRisk ? 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]' :
              isMedRisk ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]' :
              'bg-[#38bdf8]/10 border-[#38bdf8]/30 text-[#38bdf8]'
            }`}>
              {node.accountType === 'Business' ? <Building2 size={20} /> : <User size={20} />}
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Node Details</p>
              <h3 className="text-base font-bold text-[#ffffff]">{node.customerName}</h3>
              <p className="text-xs font-mono text-[#64748b]">{node.accountType} — {node.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#1e293b] text-[#94a3b8] hover:text-[#ffffff] hover:bg-[#334155] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="w-10 h-10 border-4 border-[#334155] border-t-[#38bdf8] rounded-full animate-spin" />
              <p className="text-xs text-[#94a3b8]">Computing NetworkX graph analytics...</p>
            </div>
          ) : (
            <>
              {/* Recommendation Banner */}
              {report && (
                <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                  report.recommendation?.includes('CRITICAL') ? 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]' :
                  report.recommendation?.includes('ELEVATED') ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]' :
                  'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]'
                }`}>
                  {report.recommendation?.includes('CRITICAL') ? <AlertOctagon size={22} /> :
                   report.recommendation?.includes('ELEVATED') ? <ShieldAlert size={22} /> :
                   <CheckCircle2 size={22} />}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">AI Risk Assessment</p>
                    <p className="text-xs font-bold text-[#ffffff]">{report.recommendation}</p>
                  </div>
                </div>
              )}

              {/* 1. Account & Topology Summary (4 Grid Cards) */}
              <div>
                <h4 className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-2.5">Connectivity &amp; Community</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#1e293b]/40 p-3 rounded-xl border border-[#ffffff]/10">
                    <p className="text-[10px] text-[#94a3b8] font-medium">Overall Risk Score</p>
                    <p className={`text-lg font-bold font-mono ${isHighRisk ? 'text-[#ef4444]' : isMedRisk ? 'text-[#f59e0b]' : 'text-[#38bdf8]'}`}>
                      {riskScore}%
                    </p>
                  </div>
                  <div className="bg-[#1e293b]/40 p-3 rounded-xl border border-[#ffffff]/10">
                    <p className="text-[10px] text-[#94a3b8] font-medium">Community Cluster</p>
                    <p className="text-lg font-bold font-mono text-[#ffffff]">
                      #{report?.community ?? node.communityId ?? 0}
                      <span className="text-[10px] font-normal text-[#94a3b8] ml-1">({report?.community_size ?? 1} nodes)</span>
                    </p>
                  </div>
                  <div className="bg-[#1e293b]/40 p-3 rounded-xl border border-[#ffffff]/10">
                    <p className="text-[10px] text-[#94a3b8] font-medium">Total Connections</p>
                    <p className="text-lg font-bold font-mono text-[#ffffff]">
                      {report?.connections ?? node.connections ?? node.degree ?? 0}
                    </p>
                  </div>
                  <div className="bg-[#1e293b]/40 p-3 rounded-xl border border-[#ffffff]/10">
                    <p className="text-[10px] text-[#94a3b8] font-medium">In / Out Degree</p>
                    <p className="text-sm font-bold font-mono text-[#38bdf8] mt-0.5">
                      {report?.in_degree ?? node.inDegree ?? 0} <span className="text-[#64748b]">/</span> {report?.out_degree ?? node.outDegree ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Network Centrality Analytics */}
              <div>
                <h4 className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <Network size={12} /> Graph Centrality Analytics
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#1e293b]/40 p-2.5 rounded-xl border border-[#ffffff]/10">
                    <p className="text-[10px] text-[#94a3b8]">PageRank</p>
                    <p className="text-sm font-bold font-mono text-[#ffffff]">{report?.pagerank ?? 0.0001}</p>
                  </div>
                  <div className="bg-[#1e293b]/40 p-2.5 rounded-xl border border-[#ffffff]/10">
                    <p className="text-[10px] text-[#94a3b8]">Degree Centrality</p>
                    <p className="text-sm font-bold font-mono text-[#ffffff]">{report?.degree_centrality ?? 0.001}</p>
                  </div>
                  <div className="bg-[#1e293b]/40 p-2.5 rounded-xl border border-[#ffffff]/10">
                    <p className="text-[10px] text-[#94a3b8]">Betweenness</p>
                    <p className="text-sm font-bold font-mono text-[#ffffff]">{report?.betweenness ?? 0.0012}</p>
                  </div>
                  <div className="bg-[#1e293b]/40 p-2.5 rounded-xl border border-[#ffffff]/10">
                    <p className="text-[10px] text-[#94a3b8]">Closeness</p>
                    <p className="text-sm font-bold font-mono text-[#ffffff]">{report?.closeness ?? 0.3241}</p>
                  </div>
                </div>
              </div>

              {/* 3. Fraud Proximity & Topological Risk */}
              <div>
                <h4 className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <ShieldAlert size={12} /> Fraud Exposure &amp; Topology
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#1e293b]/40 p-2.5 rounded-xl border border-[#ffffff]/10">
                    <p className="text-[10px] text-[#94a3b8]">Fraud Neighbours</p>
                    <p className="text-sm font-bold font-mono text-[#ef4444]">{report?.fraud_neighbours ?? 0}</p>
                  </div>
                  <div className="bg-[#1e293b]/40 p-2.5 rounded-xl border border-[#ffffff]/10">
                    <p className="text-[10px] text-[#94a3b8]">Shortest Dist to Fraud</p>
                    <p className="text-sm font-bold font-mono text-[#f59e0b]">
                      {report?.distance_to_fraud === 0 ? '0 (Direct Fraud Node)' :
                       (report?.distance_to_fraud !== null && report?.distance_to_fraud !== undefined) ? `${report.distance_to_fraud} hops` : 'No Path'}
                    </p>
                  </div>
                  <div className="bg-[#1e293b]/40 p-2.5 rounded-xl border border-[#ffffff]/10">
                    <p className="text-[10px] text-[#94a3b8]">Cycle Count</p>
                    <p className="text-sm font-bold font-mono text-[#ffffff]">{report?.cycle_count ?? 0}</p>
                  </div>
                  <div className="bg-[#1e293b]/40 p-2.5 rounded-xl border border-[#ffffff]/10">
                    <p className="text-[10px] text-[#94a3b8]">Bridge Status</p>
                    <p className="text-sm font-bold font-mono text-[#a855f7]">
                      {report?.bridge_status || (report?.bridge_score > 0 ? `${report.bridge_score} comms` : 'Internal Cluster')}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Transaction Volume & Velocity */}
              <div>
                <h4 className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <DollarSign size={12} /> Transaction Volume &amp; Velocity
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#1e293b]/40 p-2.5 rounded-xl border border-[#ffffff]/10">
                    <p className="text-[10px] text-[#94a3b8]">Money Sent</p>
                    <p className="text-sm font-bold font-mono text-[#ffffff]">{formatCurrency(report?.money_sent ?? 0)}</p>
                  </div>
                  <div className="bg-[#1e293b]/40 p-2.5 rounded-xl border border-[#ffffff]/10">
                    <p className="text-[10px] text-[#94a3b8]">Money Received</p>
                    <p className="text-sm font-bold font-mono text-[#ffffff]">{formatCurrency(report?.money_received ?? 0)}</p>
                  </div>
                  <div className="bg-[#1e293b]/40 p-2.5 rounded-xl border border-[#ffffff]/10">
                    <p className="text-[10px] text-[#94a3b8]">Average Transaction</p>
                    <p className="text-sm font-bold font-mono text-[#94a3b8]">{formatCurrency(report?.avg_transaction ?? 0)}</p>
                  </div>
                  <div className="bg-[#1e293b]/40 p-2.5 rounded-xl border border-[#ffffff]/10">
                    <p className="text-[10px] text-[#94a3b8]">Tx Velocity</p>
                    <p className="text-sm font-bold font-mono text-[#38bdf8]">{report?.transaction_velocity ?? 0} txns</p>
                  </div>
                </div>
              </div>

              {/* 5. Intelligence Indicators (FII, BDS, NES, IPS) */}
              <div>
                <h4 className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <Cpu size={12} /> Intelligence Indicators
                </h4>
                <div className="space-y-2">
                  {[
                    { label: 'FII (Influence Index)', value: report?.fii ?? node.fii, color: '#ffffff' },
                    { label: 'BDS (Behavior Drift)', value: report?.bds ?? node.bds, color: '#38bdf8' },
                    { label: 'NES (Exposure Score)', value: report?.nes ?? node.nes, color: '#f59e0b' },
                    { label: 'IPS (Priority Score)', value: report?.ips ?? node.ips, color: '#ef4444' },
                  ].map(m => (
                    <div key={m.label} className="bg-[#1e293b]/40 p-2.5 rounded-xl border border-[#ffffff]/10">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-[#94a3b8]">{m.label}</span>
                        <span className="font-bold font-mono" style={{ color: m.color }}>{m.value?.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-[#334155] h-1.5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, m.value || 0)}%`, background: m.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Intervention Simulator */}
              <div className="bg-[#1e293b]/60 border border-[#ffffff]/10 p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={15} className="text-[#38bdf8]" />
                  <h4 className="text-xs font-bold text-[#ffffff]">Intervention Simulator</h4>
                </div>
                {simResult ? (
                  <div className="p-3 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl text-[#10b981] text-xs">
                    <p className="font-bold flex items-center gap-1.5 mb-1"><CheckCircle2 size={14} /> Account Frozen</p>
                    <p>{simResult.message}</p>
                  </div>
                ) : (
                  <button onClick={handleFreeze} disabled={simulating} className="w-full py-2.5 rounded-xl bg-[#ffffff] text-[#0f172a] font-bold text-xs hover:bg-[#e2e8f0] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer">
                    {simulating ? 'Simulating Impact...' : <><Lock size={14} /> Freeze Account &amp; Cut Edges</>}
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
