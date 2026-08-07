import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import coseBilkent from 'cytoscape-cose-bilkent';
import cytoscape from 'cytoscape';
import {
  ZoomIn, ZoomOut, Maximize, Circle, Layers, RefreshCw, Search,
  X, ChevronDown, ChevronRight, User, Building2, AlertOctagon,
  ShieldAlert, CheckCircle2, Network, Shield, DollarSign, Cpu,
  Zap, Lock, Activity
} from 'lucide-react';
import { fetchAiInvestigation, fetchAccountTransactions, fetchSimulateIntervention } from '../../services/api';
import { getRiskTier } from '../../utils/riskHelpers';
import { formatCurrency } from '../../utils/formatters';

try { cytoscape.use(coseBilkent); } catch (e) {}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Node Card Generator
// ─────────────────────────────────────────────────────────────────────────────
const generateNodeSVG = (node) => {
  const isFraud  = node.riskScore >= 80;
  const isMedium = node.riskScore >= 50 && node.riskScore < 80;
  const ringColor   = isFraud ? '#EF4444' : isMedium ? '#F59E0B' : '#38BDF8';
  const bgColor     = '#0f172a';
  const textColor   = '#ffffff';
  const subtextColor = '#94a3b8';
  const safeName = (node.customerName || 'Unknown').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeAcc  = (node.accountNumber || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const typeStr  = (node.accountType || 'Account').toUpperCase();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="180" height="72" viewBox="0 0 180 72">
      <rect x="1" y="1" width="178" height="70" rx="10" fill="${bgColor}" stroke="${ringColor}" stroke-width="1.5" stroke-opacity="0.7"/>
      <circle cx="32" cy="36" r="16" fill="none" stroke="${ringColor}" stroke-width="2" stroke-dasharray="6 3"/>
      <circle cx="32" cy="36" r="12" fill="${ringColor}" fill-opacity="0.12"/>
      ${node.accountType === 'Business'
        ? `<rect x="27" y="30" width="10" height="12" fill="none" stroke="${ringColor}" stroke-width="1.5"/>
           <path d="M27 30L32 25L37 30" fill="none" stroke="${ringColor}" stroke-width="1.5"/>`
        : `<circle cx="32" cy="32" r="4" fill="none" stroke="${ringColor}" stroke-width="1.5"/>
           <path d="M24 43 C 24 39, 40 39, 40 43" fill="none" stroke="${ringColor}" stroke-width="1.5"/>`
      }
      <text x="58" y="24" font-family="system-ui,sans-serif" font-size="8" font-weight="700" letter-spacing="1" fill="${subtextColor}">${typeStr}</text>
      <text x="58" y="41" font-family="system-ui,sans-serif" font-size="12" font-weight="700" fill="${textColor}">${safeName}</text>
      <text x="58" y="56" font-family="monospace" font-size="9" fill="${subtextColor}">${safeAcc}</text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Accordion Section for Node Panel
// ─────────────────────────────────────────────────────────────────────────────
function Accordion({ title, icon: Icon, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white/5 hover:bg-white/10 transition-colors text-left"
      >
        <span className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          {Icon && <Icon size={11} className="text-slate-400" />}
          {title}
        </span>
        {open
          ? <ChevronDown size={13} className="text-slate-500 shrink-0" />
          : <ChevronRight size={13} className="text-slate-500 shrink-0" />
        }
      </button>
      {open && <div className="p-3 space-y-2">{children}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Grid Card
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div className="bg-white/5 p-2.5 rounded-lg border border-white/8">
      <p className="text-[9px] text-slate-500 font-medium mb-0.5">{label}</p>
      <p className="text-sm font-bold font-mono" style={{ color: color || '#ffffff' }}>{value ?? '—'}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Node Details Slide-In Panel
// ─────────────────────────────────────────────────────────────────────────────
function NodeDetailsPanel({ node, onClose }) {
  const [report, setReport]     = useState(null);
  const [txns, setTxns]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult]   = useState(null);

  useEffect(() => {
    if (!node) return;
    setLoading(true);
    setReport(null);
    setSimResult(null);
    setTxns([]);
    (async () => {
      try {
        const [rep, t] = await Promise.all([
          fetchAiInvestigation(node.id).catch(() => null),
          fetchAccountTransactions(node.id).catch(() => [])
        ]);
        setReport(rep);
        setTxns(Array.isArray(t) ? t : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [node?.id]);

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

  const riskScore  = report?.risk_score ?? node.riskScore ?? 0;
  const isHighRisk = riskScore >= 80;
  const isMedRisk  = riskScore >= 50 && riskScore < 80;
  const riskColor  = isHighRisk ? '#EF4444' : isMedRisk ? '#F59E0B' : '#38BDF8';

  return (
    /* Overlay panel — absolute, so it never shrinks the canvas */
    <div
      className="absolute top-0 right-0 bottom-0 z-50 flex"
      style={{ width: 360, pointerEvents: 'none' }}
    >
      <div
        className="absolute inset-0 flex flex-col"
        style={{
          pointerEvents: 'all',
          background: 'rgba(10,15,30,0.97)',
          backdropFilter: 'blur(16px)',
          borderLeft: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.7)',
          animation: 'slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* ── Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/8 shrink-0 bg-white/4">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: `${riskColor}18`, border: `1px solid ${riskColor}40` }}
            >
              {node.accountType === 'Business'
                ? <Building2 size={17} style={{ color: riskColor }} />
                : <User size={17} style={{ color: riskColor }} />
              }
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Node Details</p>
              <h3 className="text-sm font-bold text-white leading-tight">{node.customerName || node.id}</h3>
              <p className="text-[10px] font-mono text-slate-500 mt-0.5">{node.accountType} · {node.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Risk Score Bar */}
        <div className="px-4 py-3 border-b border-white/8 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-500 font-medium">Risk Score</span>
            <span className="text-sm font-bold font-mono" style={{ color: riskColor }}>{riskScore}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, riskScore)}%`, background: `linear-gradient(90deg, ${riskColor}80, ${riskColor})` }}
            />
          </div>
        </div>

        {/* ── Scrollable content */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-8 h-8 border-[3px] border-white/10 border-t-sky-400 rounded-full animate-spin" />
              <p className="text-[11px] text-slate-500">Loading analytics...</p>
            </div>
          ) : (
            <>
              {/* AI Recommendation Banner */}
              {report?.recommendation && (
                <div
                  className="flex items-center gap-2.5 p-3 rounded-xl border text-xs"
                  style={{
                    background: isHighRisk ? 'rgba(239,68,68,0.1)' : isMedRisk ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                    borderColor: isHighRisk ? 'rgba(239,68,68,0.3)' : isMedRisk ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)',
                    color: riskColor
                  }}
                >
                  {isHighRisk ? <AlertOctagon size={15} /> : isMedRisk ? <ShieldAlert size={15} /> : <CheckCircle2 size={15} />}
                  <div>
                    <p className="text-[9px] font-bold opacity-70 uppercase tracking-wider">AI Assessment</p>
                    <p className="font-bold text-white text-[11px] leading-tight">{report.recommendation}</p>
                  </div>
                </div>
              )}

              {/* Account Info */}
              <Accordion title="Account Information" icon={User} defaultOpen={true}>
                <div className="grid grid-cols-2 gap-1.5">
                  <StatCard label="Community" value={`#${report?.community_id ?? node.communityId ?? 0}`} />
                  <StatCard label="Connections" value={report?.degree ?? node.degree ?? 0} />
                  <StatCard label="In / Out" value={`${report?.in_degree ?? node.inDegree ?? 0} / ${report?.out_degree ?? node.outDegree ?? 0}`} color="#38BDF8" />
                  <StatCard label="Account Type" value={node.accountType} />
                </div>
              </Accordion>

              {/* Graph Metrics */}
              <Accordion title="Graph Metrics" icon={Network}>
                <div className="grid grid-cols-2 gap-1.5">
                  <StatCard label="PageRank" value={(report?.pagerank ?? node.pagerank ?? 0).toFixed(6)} />
                  <StatCard label="Degree Centrality" value={(report?.degree_centrality ?? 0.001).toFixed(4)} />
                  <StatCard label="Betweenness" value={(report?.betweenness ?? 0).toFixed(4)} />
                  <StatCard label="Closeness" value={(report?.closeness ?? 0).toFixed(4)} />
                </div>
              </Accordion>

              {/* Fraud Exposure */}
              <Accordion title="Fraud Exposure" icon={Shield}>
                <div className="grid grid-cols-2 gap-1.5">
                  <StatCard label="Fraud Neighbours" value={report?.fraud_neighbours ?? 0} color="#EF4444" />
                  <StatCard label="Dist to Fraud" value={report?.distance_to_fraud != null ? `${report.distance_to_fraud} hops` : 'No Path'} color="#F59E0B" />
                  <StatCard label="Cycle Count" value={report?.cycle_count ?? 0} />
                  <StatCard label="Bridge Status" value={report?.bridge_status || 'Internal'} color="#a855f7" />
                </div>
              </Accordion>

              {/* Transaction Volume */}
              <Accordion title="Transaction Volume" icon={DollarSign}>
                <div className="grid grid-cols-2 gap-1.5">
                  <StatCard label="Money Sent" value={formatCurrency(report?.total_sent ?? report?.money_sent ?? 0)} />
                  <StatCard label="Money Received" value={formatCurrency(report?.total_received ?? report?.money_received ?? 0)} />
                  <StatCard label="Fraud Transactions" value={report?.fraud_transactions ?? 0} color="#EF4444" />
                  <StatCard label="Velocity" value={`${report?.transaction_velocity ?? txns.length} txns`} color="#38BDF8" />
                </div>
              </Accordion>

              {/* Intelligence Indicators */}
              <Accordion title="Intelligence Indicators" icon={Cpu}>
                {[
                  { label: 'FII — Fraud Influence Index', value: report?.fii ?? node.fii ?? 0, color: '#ffffff' },
                  { label: 'BDS — Behavior Drift Score', value: report?.bds ?? node.bds ?? 0, color: '#38BDF8' },
                  { label: 'NES — Network Exposure Score', value: report?.nes ?? node.nes ?? 0, color: '#F59E0B' },
                  { label: 'IPS — Investigation Priority', value: report?.ips ?? node.ips ?? 0, color: '#EF4444' },
                ].map(m => (
                  <div key={m.label} className="bg-white/5 p-2.5 rounded-lg border border-white/8">
                    <div className="flex justify-between items-center text-[10px] mb-1.5">
                      <span className="text-slate-400">{m.label}</span>
                      <span className="font-bold font-mono" style={{ color: m.color }}>{(m.value ?? 0).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-white/8 h-1 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, m.value || 0)}%`, background: m.color }}
                      />
                    </div>
                  </div>
                ))}
              </Accordion>

              {/* Recent Transactions */}
              {txns.length > 0 && (
                <Accordion title={`Transactions (${txns.length})`} icon={Activity}>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto">
                    {txns.slice(0, 8).map((t, i) => (
                      <div key={i} className="flex justify-between items-center p-2 bg-white/5 rounded-lg border border-white/8 text-[10px]">
                        <div>
                          <span className="text-slate-300 font-mono">{(t.sender_account_id || t.sender || '').slice(0, 10)}→</span>
                          <span className="text-slate-500 font-mono">{(t.receiver_account_id || t.receiver || '').slice(0, 10)}</span>
                        </div>
                        <span className="font-bold font-mono text-white">{formatCurrency(t.transaction_amount || t.amount || 0)}</span>
                      </div>
                    ))}
                  </div>
                </Accordion>
              )}

              {/* Intervention Simulator */}
              <Accordion title="Intervention Simulator" icon={Zap} defaultOpen={true}>
                {simResult ? (
                  <div className="space-y-2">
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-[11px]">
                      <p className="font-bold flex items-center gap-1.5 mb-1">
                        <CheckCircle2 size={12} /> Simulation Complete
                      </p>
                      <p className="text-[10px] text-emerald-300/80">{simResult.recommendation || simResult.message}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <StatCard label="NDI" value={`${simResult.ndi ?? 0}%`} color="#38BDF8" />
                      <StatCard label="FSS" value={`${simResult.fss ?? 0}%`} color="#10b981" />
                      <StatCard label="IES" value={`${simResult.ies ?? 0}%`} color="#F59E0B" />
                      <StatCard label="Edges Removed" value={simResult.edges_removed ?? 0} color="#EF4444" />
                    </div>
                    <button
                      onClick={() => setSimResult(null)}
                      className="w-full py-2 text-[11px] text-slate-400 hover:text-white border border-white/10 rounded-lg transition-colors"
                    >
                      Reset Simulation
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Simulate freezing this account and measure the impact on the fraud network topology.
                    </p>
                    <button
                      onClick={handleFreeze}
                      disabled={simulating}
                      className="w-full py-2.5 rounded-lg bg-white text-slate-900 font-bold text-[11px] hover:bg-slate-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {simulating
                        ? <><div className="w-3 h-3 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" /> Simulating...</>
                        : <><Lock size={12} /> Freeze Account & Analyze Impact</>
                      }
                    </button>
                  </div>
                )}
              </Accordion>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Edge Details Slide-In Panel
// ─────────────────────────────────────────────────────────────────────────────
function EdgeDetailsPanel({ edge, onClose }) {
  if (!edge) return null;

  const score = edge.confidenceScore || 0;
  const isCritical = score >= 81;
  const isHigh = score >= 61 && score < 81;
  const isMed = score >= 31 && score < 61;
  
  const riskColor = isCritical ? '#EF4444' : isHigh ? '#F97316' : isMed ? '#F59E0B' : '#e2e8f0';

  return (
    <div
      className="absolute top-0 right-0 bottom-0 z-50 flex"
      style={{ width: 360, pointerEvents: 'none' }}
    >
      <div
        className="absolute inset-0 flex flex-col"
        style={{
          pointerEvents: 'all',
          background: 'rgba(10,15,30,0.97)',
          backdropFilter: 'blur(16px)',
          borderLeft: `1px solid ${riskColor}40`,
          boxShadow: '-8px 0 40px rgba(0,0,0,0.7)',
          animation: 'slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* ── Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/8 shrink-0 bg-white/4">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: `${riskColor}18`, border: `1px solid ${riskColor}40` }}
            >
              <Network size={17} style={{ color: riskColor }} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Connection Details</p>
              <h3 className="text-sm font-bold text-white leading-tight">Transfer</h3>
              <p className="text-[10px] font-mono text-slate-500 mt-0.5">{edge.source.substring(0,8)} → {edge.target.substring(0,8)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Confidence Score Bar */}
        <div className="px-4 py-3 border-b border-white/8 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-500 font-medium">Confidence Score</span>
            <span className="text-sm font-bold font-mono" style={{ color: riskColor }}>{score}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, score)}%`, background: `linear-gradient(90deg, ${riskColor}80, ${riskColor})` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">
            Classification: <span style={{ color: riskColor }}>{edge.confidenceLabel}</span>
          </p>
        </div>

        {/* ── Scrollable content */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          
          {/* AI Assessment Banner */}
          {score > 30 && (
            <div
              className="flex items-start gap-2.5 p-3 rounded-xl border text-xs"
              style={{
                background: `${riskColor}10`,
                borderColor: `${riskColor}30`,
                color: riskColor
              }}
            >
              {isCritical ? <AlertOctagon size={15} className="mt-0.5 shrink-0" /> : <ShieldAlert size={15} className="mt-0.5 shrink-0" />}
              <div>
                <p className="text-[9px] font-bold opacity-70 uppercase tracking-wider mb-1">AI Explanation</p>
                <p className="text-[11px] leading-relaxed text-white">
                  This connection has a {score}% fraud likelihood because:
                </p>
                <ul className="list-disc pl-4 mt-1.5 space-y-1 text-[11px] text-white/90">
                  {edge.reasons?.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Transaction Info */}
          <Accordion title="Transaction Summary" icon={DollarSign} defaultOpen={true}>
            <div className="grid grid-cols-2 gap-1.5">
              <StatCard label="Total Amount" value={formatCurrency(edge.totalAmount)} />
              <StatCard label="Frequency" value={`${edge.count} transfers`} />
              <StatCard label="Historical Fraud" value={edge.isFraud ? 'Yes' : 'No'} color={edge.isFraud ? '#EF4444' : '#e2e8f0'} />
              <StatCard label="Type" value={edge.transactionType || 'Transfer'} />
            </div>
          </Accordion>

          <Accordion title="Endpoints" icon={Activity} defaultOpen={true}>
            <div className="space-y-1.5">
              <div className="bg-white/5 p-2 rounded-lg border border-white/8 text-[10px]">
                <p className="text-slate-500 mb-0.5">Sender</p>
                <p className="font-mono text-white break-all">{edge.source}</p>
              </div>
              <div className="bg-white/5 p-2 rounded-lg border border-white/8 text-[10px]">
                <p className="text-slate-500 mb-0.5">Receiver</p>
                <p className="font-mono text-white break-all">{edge.target}</p>
              </div>
            </div>
          </Accordion>

        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main NetworkGraph Component
// ─────────────────────────────────────────────────────────────────────────────
export default function NetworkGraph({ data, nodeLimit = 300, onNodeLimitChange, onRefresh }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [layoutName,   setLayoutName]   = useState('cose');
  const cyRef = useRef(null);

  // Fit graph whenever panel opens or closes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (cyRef.current) {
        cyRef.current.fit(undefined, 60);
        cyRef.current.center();
      }
    }, 320); // after slide animation completes
    return () => clearTimeout(timer);
  }, [selectedNode, selectedEdge]);

  // ── Cytoscape Elements ───────────────────────────────────────────────────
  const elements = useMemo(() => {
    if (!data?.nodes?.length) return [];

    console.log(`[NetworkGraph] Loaded Nodes: ${data.nodes.length}, Edges: ${data.edges?.length ?? 0}`);

    const nodeSet = new Set(data.nodes.map(n => n.id));

    const nodes = data.nodes.map(node => {
      const tier = getRiskTier(node.riskScore);
      return {
        data: {
          id: node.id,
          customerName:  node.customerName  || node.accountName || node.id,
          accountType:   node.accountType   || 'Individual',
          accountNumber: node.accountNumber || node.id,
          riskScore:     node.riskScore      ?? 0,
          degree:        node.degree         ?? 0,
          connections:   node.connections    || node.degree || 0,
          inDegree:      node.inDegree || node.in_degree || 0,
          outDegree:     node.outDegree || node.out_degree || 0,
          in_degree:     node.in_degree || node.inDegree || 0,
          out_degree:    node.out_degree || node.outDegree || 0,
          communityId:   node.communityId ?? node.community ?? 0,
          fii: node.fii ?? 0,
          bds: node.bds ?? 0,
          nes: node.nes ?? 0,
          ips: node.ips ?? 0,
          pagerank: node.pagerank ?? 0,
          isFraud:  node.isFraud  ?? false,
          svgImage: generateNodeSVG(node),
          tierColor: tier.color,
        }
      };
    });

    const edges = (data.edges || [])
      .filter(e => nodeSet.has(e.source) && nodeSet.has(e.target))
      .map((edge, idx) => {
        const score = edge.confidenceScore || 0;
        let edgeClass = 'normal';
        let amountLabel = formatCurrency(edge.totalAmount ?? edge.amount ?? 0);
        
        if (score >= 81) edgeClass = 'critical';
        else if (score >= 61) edgeClass = 'high-risk';
        else if (score >= 31) edgeClass = 'medium-risk';
        
        // Also keep track if it is a cycle for ML chain styling
        if (edge.reasons?.some(r => r.includes('Circular'))) {
          edgeClass += ' ml-chain';
        }
        
        return {
          data: {
            id: `e-${edge.source}-${edge.target}-${idx}`,
            source: edge.source,
            target: edge.target,
            totalAmount: edge.totalAmount ?? edge.amount ?? 0,
            count: edge.count ?? 1,
            isFraud: edge.isFraud ?? false,
            confidenceScore: score,
            confidenceLabel: edge.confidenceLabel,
            reasons: edge.reasons,
            amountLabel: `${amountLabel}\n${score}% Suspicious`,
            shortLabel: amountLabel,
          },
          classes: edgeClass
        };
      });

    console.log(`[NetworkGraph] Visible Nodes: ${nodes.length}, Visible Edges: ${edges.length}`);
    return [...nodes, ...edges];
  }, [data]);

  // ── Cytoscape Stylesheet ─────────────────────────────────────────────────
  const stylesheet = useMemo(() => [
    {
      selector: 'node',
      style: {
        shape: 'rectangle',
        width: 180,
        height: 72,
        'background-color': 'transparent',
        'background-image': 'data(svgImage)',
        'background-fit': 'contain',
        'border-width': 0,
      }
    },
    {
      selector: 'edge',
      style: {
        width: 2,
        'line-color': '#e2e8f0',
        'target-arrow-color': '#e2e8f0',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'arrow-scale': 1.3,
        opacity: 0.9,
        label: 'data(amountLabel)',
        'font-size': '8px',
        'font-weight': '600',
        'font-family': 'monospace, system-ui',
        color: '#ffffff',
        'text-rotation': 0,
        'text-margin-y': -9,
        'text-wrap': 'wrap',
        'text-background-color': '#0f172a',
        'text-background-opacity': 0.95,
        'text-background-padding': '4px',
        'text-background-shape': 'roundrectangle',
        'text-border-color': '#334155',
        'text-border-width': 1,
        'text-border-opacity': 0.7,
        'z-index': 10,
      }
    },
    {
      selector: 'edge.normal',
      style: {
        'line-color': '#e2e8f0',
        'target-arrow-color': '#e2e8f0',
        'z-index': 10,
        label: 'data(shortLabel)',
      }
    },
    {
      selector: 'edge.medium-risk',
      style: {
        'line-color': '#F59E0B',
        'target-arrow-color': '#F59E0B',
        width: 3,
        'text-border-color': '#F59E0B',
        'z-index': 20,
      }
    },
    {
      selector: 'edge.high-risk',
      style: {
        'line-color': '#F97316',
        'line-style': 'dashed',
        'line-dash-pattern': [10, 6],
        'target-arrow-color': '#F97316',
        width: 3,
        'text-border-color': '#F97316',
        'z-index': 30,
      }
    },
    {
      selector: 'edge.critical',
      style: {
        'line-color': '#EF4444',
        'line-style': 'dashed',
        'line-dash-pattern': [12, 5],
        'target-arrow-color': '#EF4444',
        width: 4,
        'text-background-color': '#450a0a',
        'text-border-color': '#EF4444',
        'z-index': 40,
      }
    },
    {
      selector: 'edge.ml-chain',
      style: {
        'line-color': '#EF4444',
        'line-style': 'dashed',
        'line-dash-pattern': [20, 10],
        'target-arrow-color': '#EF4444',
        width: 5,
        'text-background-color': '#431407',
        'text-border-color': '#EF4444',
        'z-index': 50,
      }
    },
    { selector: 'edge.highlighted', style: { width: 5, opacity: 1, 'z-index': 150 } },
    {
      selector: 'node:selected',
      style: {
        'underlay-color': '#ffffff',
        'underlay-padding': '5px',
        'underlay-opacity': 0.85,
        'underlay-shape': 'roundrectangle',
        'z-index': 200,
      }
    },
    { selector: 'node:active',  style: { 'overlay-opacity': 0 } },
    {
      selector: 'node.search-match',
      style: {
        'underlay-color': '#38bdf8',
        'underlay-padding': '7px',
        'underlay-opacity': 1,
        'underlay-shape': 'roundrectangle',
        'z-index': 250,
      }
    },
    { selector: 'node.dimmed', style: { opacity: 0.12 } },
    { selector: 'edge.dimmed', style: { opacity: 0.08 } },
    { selector: 'node.hover',  style: { width: 188, height: 78, 'z-index': 190 } },
  ], []);

  // ── Layout ───────────────────────────────────────────────────────────────
  const layout = useMemo(() => {
    if (layoutName === 'circle') {
      return { name: 'circle', animate: false, padding: 60 };
    }
    return {
      name: 'cose',
      animate: false,
      fit: true,
      padding: 60,
      nodeRepulsion: () => 9000,
      idealEdgeLength: () => 110,
      edgeElasticity: () => 100,
      gravity: 0.25,
      numIter: 1000,
      initialTemp: 1000,
      coolingFactor: 0.99,
      minTemp: 1.0,
    };
  }, [layoutName]);

  // ── Cytoscape Init ───────────────────────────────────────────────────────
  const handleCyInit = useCallback((cy) => {
    cyRef.current = cy;

    // Debug info
    console.log(`[Cytoscape] Canvas W: ${cy.container()?.offsetWidth}, H: ${cy.container()?.offsetHeight}`);
    console.log(`[Cytoscape] Total Nodes: ${cy.nodes().length}, Total Edges: ${cy.edges().length}`);

    try {
      cy.layout(layout).run();
      cy.fit(undefined, 60);
      cy.center();
      console.log(`[Cytoscape] Layout: done, Zoom: ${cy.zoom().toFixed(3)}`);
    } catch (e) {
      console.warn('Cytoscape layout error:', e);
    }

    // Hover highlight
    cy.on('mouseover', 'node', (evt) => {
      const node = evt.target;
      node.addClass('hover');
      cy.container().style.cursor = 'pointer';
      if (!cy.scratch('selectedNodeId')) {
        cy.elements().addClass('dimmed');
        node.removeClass('dimmed');
        const conn = node.connectedEdges();
        conn.removeClass('dimmed').addClass('highlighted');
        conn.connectedNodes().removeClass('dimmed');
      }
    });

    cy.on('mouseout', 'node', (evt) => {
      evt.target.removeClass('hover');
      cy.container().style.cursor = 'default';
      if (!cy.scratch('selectedNodeId')) {
        cy.elements().removeClass('dimmed highlighted');
      }
    });

    // Select node → open panel
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedNode(node.data());
      setSelectedEdge(null);
      cy.scratch('selectedNodeId', node.id());
      cy.elements().addClass('dimmed');
      node.removeClass('dimmed');
      const conn = node.connectedEdges();
      conn.removeClass('dimmed').addClass('highlighted');
      conn.connectedNodes().removeClass('dimmed');
    });
    
    // Select edge → open panel
    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      setSelectedEdge(edge.data());
      setSelectedNode(null);
      cy.scratch('selectedNodeId', edge.id());
      cy.elements().addClass('dimmed');
      edge.removeClass('dimmed').addClass('highlighted');
      edge.connectedNodes().removeClass('dimmed');
    });

    // Tap background → close panel
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
        setSelectedEdge(null);
        cy.scratch('selectedNodeId', null);
        cy.elements().removeClass('dimmed highlighted search-match hover');
      }
    });
  }, [layout]);

  // ── Edge animation ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!cyRef.current) return;
    let frame, offset = 0, last = 0;
    const animate = (t) => {
      if (t - last > 30) {
        offset -= 1.8;
        const cy = cyRef.current;
        if (cy) {
          const susp = cy.edges('.high-risk, .critical');
          if (susp.length) susp.style('line-dash-offset', offset);
          const cyc  = cy.edges('.ml-chain');
          if (cyc.length) cyc.style('line-dash-offset', offset * 1.5);
        }
        last = t;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [data]);

  // ── Controls ─────────────────────────────────────────────────────────────
  const handleZoomIn  = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit     = () => { cyRef.current?.fit(undefined, 60); cyRef.current?.center(); };

  const handleSearch = (e) => {
    e.preventDefault();
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements().removeClass('search-match dimmed hover');

    if (!searchQuery.trim()) {
      // Empty search → show everything
      return;
    }

    const q = searchQuery.toLowerCase();
    const matches = cy.nodes().filter(n => {
      const d = n.data();
      return d.id.toLowerCase().includes(q)
          || (d.customerName && d.customerName.toLowerCase().includes(q));
    });

    if (matches.length > 0) {
      cy.elements().addClass('dimmed');
      matches.removeClass('dimmed').addClass('search-match');
      matches.connectedEdges().removeClass('dimmed');
      matches.connectedEdges().connectedNodes().removeClass('dimmed');
      cy.animate({ fit: { eles: matches, padding: 100 } }, { duration: 500 });
    }
  };

  // Failsafe: no data
  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0b1220] text-slate-400 text-sm">
        No transaction graph data available.
      </div>
    );
  }

  if (!elements.length) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0b1220] text-slate-400 text-sm">
        Graph has 0 nodes. Check backend API response.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-[#0b1220]" style={{ minHeight: 0 }}>
      {/* ── Top Control Bar ──────────────────────────────────────────────── */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-3 bg-[#111827]/85 backdrop-blur-xl px-3 py-2.5 rounded-2xl border border-white/10 shadow-2xl">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') { setSearchQuery(''); cyRef.current?.elements().removeClass('search-match dimmed hover'); } }}
            placeholder="Search account ID or name…"
            className="w-full bg-white/5 text-white text-xs py-2 pl-8 pr-3 rounded-xl border border-white/10 focus:border-white/30 focus:bg-white/8 outline-none transition-all placeholder:text-slate-600"
          />
        </form>

        {/* Node limit + filters + refresh */}
        <div className="flex items-center gap-2">
          
          <select
            onChange={(e) => {
              const val = e.target.value;
              const cy = cyRef.current;
              if(!cy) return;
              cy.elements().removeClass('dimmed');
              if (val === 'all') return;
              
              cy.elements().addClass('dimmed');
              if (val === 'critical') {
                const e = cy.edges('.critical');
                e.removeClass('dimmed');
                e.connectedNodes().removeClass('dimmed');
              } else if (val === 'ml-chain') {
                const e = cy.edges('.ml-chain');
                e.removeClass('dimmed');
                e.connectedNodes().removeClass('dimmed');
              } else if (val === 'high-risk') {
                const e = cy.edges('.high-risk, .critical, .ml-chain');
                e.removeClass('dimmed');
                e.connectedNodes().removeClass('dimmed');
              }
            }}
            className="bg-white/5 text-slate-200 text-xs py-2 px-3 rounded-xl border border-white/10 outline-none hover:bg-white/10 transition-colors cursor-pointer appearance-none"
          >
            <option value="all">All Connections</option>
            <option value="critical">Critical Connections</option>
            <option value="ml-chain">Money Laundering Chains</option>
            <option value="high-risk">High Risk+</option>
          </select>

          <select
            value={nodeLimit}
            onChange={e => onNodeLimitChange?.(parseInt(e.target.value))}
            className="bg-white/5 text-slate-200 text-xs py-2 px-3 rounded-xl border border-white/10 outline-none hover:bg-white/10 transition-colors cursor-pointer appearance-none"
          >
            <option value={100}>100 nodes</option>
            <option value={300}>300 nodes</option>
            <option value={500}>500 nodes</option>
            <option value={1000}>1000 nodes</option>
          </select>
          <button
            onClick={() => onRefresh?.()}
            className="p-2 rounded-xl bg-white/5 hover:bg-white hover:text-slate-900 text-slate-400 border border-white/10 transition-all"
            title="Refresh Graph"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Node counter */}
        <div className="text-[10px] text-slate-500 font-mono whitespace-nowrap hidden md:block">
          {data.nodes?.length ?? 0} nodes · {data.edges?.length ?? 0} edges
        </div>
      </div>

      {/* ── Left Controls ────────────────────────────────────────────────── */}
      <div className="absolute top-20 left-3 z-20 flex flex-col gap-2">
        {/* Zoom */}
        <div className="flex flex-col bg-[#111827]/85 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
          <button onClick={handleZoomIn}  className="p-2.5 hover:bg-white hover:text-slate-900 text-slate-400 transition-colors" title="Zoom In"><ZoomIn  size={16} /></button>
          <div className="h-px bg-white/10 mx-2" />
          <button onClick={handleZoomOut} className="p-2.5 hover:bg-white hover:text-slate-900 text-slate-400 transition-colors" title="Zoom Out"><ZoomOut size={16} /></button>
          <div className="h-px bg-white/10 mx-2" />
          <button onClick={handleFit}     className="p-2.5 hover:bg-white hover:text-slate-900 text-slate-400 transition-colors" title="Fit to Screen"><Maximize size={16} /></button>
        </div>

        {/* Layout */}
        <div className="flex flex-col bg-[#111827]/85 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
          <button
            onClick={() => setLayoutName('cose')}
            className={`p-2.5 transition-colors ${layoutName === 'cose' ? 'bg-white text-slate-900' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
            title="Force Directed Layout"
          ><Layers size={16} /></button>
          <div className="h-px bg-white/10 mx-2" />
          <button
            onClick={() => setLayoutName('circle')}
            className={`p-2.5 transition-colors ${layoutName === 'circle' ? 'bg-white text-slate-900' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
            title="Circle Layout"
          ><Circle size={16} /></button>
        </div>
      </div>

      {/* ── Cytoscape Canvas — full width/height ─────────────────────────── */}
      <div className="absolute inset-0" style={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <CytoscapeComponent
          elements={elements}
          layout={layout}
          stylesheet={stylesheet}
          style={{ width: '100%', height: '100%', background: 'transparent' }}
          cy={handleCyInit}
          wheelSensitivity={0.15}
        />
      </div>

      {/* ── Bottom Legend ─────────────────────────────────────────────────── */}
      <div className="absolute bottom-5 left-5 z-20 bg-[#111827]/85 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl">
        <h3 className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-3">Legend</h3>
        <div className="space-y-2">
          {[
            { color: '#EF4444', label: 'Critical Risk' },
            { color: '#F59E0B', label: 'Elevated Risk' },
            { color: '#38BDF8', label: 'Normal Account' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}60` }} />
              <span className="text-[10px] font-medium text-slate-300">{label}</span>
            </div>
          ))}
          <div className="border-t border-white/10 pt-2 space-y-2">
            {[
              { color: '#F97316', label: 'Laundering Ring', dashed: true, thick: 3.5 },
              { color: '#EF4444', label: 'Suspicious Flow', dashed: true, thick: 2.5 },
              { color: '#e2e8f0', label: 'Normal Flow',    dashed: false, thick: 2 },
            ].map(({ color, label, dashed, thick }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div className="w-7 overflow-hidden" style={{ height: thick, borderTop: `${thick}px ${dashed ? 'dashed' : 'solid'} ${color}` }} />
                <span className="text-[10px] font-medium" style={{ color }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Node Details Panel (slide-in overlay) ───────────────────────── */}
      {selectedNode && (
        <NodeDetailsPanel
          node={selectedNode}
          onClose={() => {
            setSelectedNode(null);
            if (cyRef.current) {
              cyRef.current.scratch('selectedNodeId', null);
              cyRef.current.elements().removeClass('dimmed highlighted search-match hover');
            }
          }}
        />
      )}

      {/* ── Edge Details Panel (slide-in overlay) ───────────────────────── */}
      {selectedEdge && (
        <EdgeDetailsPanel
          edge={selectedEdge}
          onClose={() => {
            setSelectedEdge(null);
            if (cyRef.current) {
              cyRef.current.scratch('selectedNodeId', null);
              cyRef.current.elements().removeClass('dimmed highlighted search-match hover');
            }
          }}
        />
      )}

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
      `}</style>
    </div>
  );
}
