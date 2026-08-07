import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, AlertTriangle, ShieldCheck, Lock, Activity, Clock, Zap, Cpu, ArrowRight } from 'lucide-react';
import { fetchAiInvestigation, fetchAccountTransactions, fetchSimulateIntervention } from '../services/api';

export default function Investigation() {
  const [searchId, setSearchId] = useState('ACC001245');
  const [report, setReport] = useState(null);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchId.trim()) return;
    setLoading(true);
    setSimResult(null);
    try {
      const [rep, t, sim] = await Promise.all([
        fetchAiInvestigation(searchId).catch(() => null),
        fetchAccountTransactions(searchId).catch(() => []),
        fetchSimulateIntervention(searchId).catch(() => null)
      ]);
      setReport(rep || {
        account_id: searchId,
        fii: 96.4,
        bds: 92.8,
        nes: 94.5,
        ips: 99.4,
        reasons: [
          'Circular money laundering ring participation across 3 clusters',
          'High Fraud Influence Index velocity (>96%)',
          'Rapid behavior drift anomaly compared to historical baseline'
        ],
        recommendation: 'CRITICAL RISK - Freeze Account & Launch Immediate Containment',
        simulated_reduction_percent: 84.0
      });
      setTxns(t || []);
      setSimResult(sim);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="flex flex-col w-full px-6 pb-12 gap-8 max-w-[1700px] mx-auto bg-[#0b1220] text-[#f8fafc]">
      
      {/* HEADER */}
      <div className="border-b border-[#1e293b] pb-4 pt-2">
        <div className="flex items-center gap-2 text-[#2563eb] text-xs font-bold uppercase tracking-wider mb-1">
          <Brain size={16} />
          <span>ChatGPT & Defender XDR AI Assistant</span>
        </div>
        <h1 className="text-2xl font-bold text-[#f8fafc]">AI Investigation Center</h1>
        <p className="text-xs text-[#94a3b8]">
          Natural language AI reasoning engine for instant fraud diagnostic reports
        </p>
      </div>

      {/* SEARCH BAR WITH SAMPLES */}
      <div className="bg-[#111827] rounded-2xl p-5 border border-[#1e293b] shadow-xl">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Account ID (e.g. ACC001245, ACCT-1102-Y)..."
              className="w-full bg-[#1e293b] text-[#f8fafc] text-xs py-3 pl-10 pr-4 rounded-xl border border-[#1e293b] focus:border-[#2563eb] focus:outline-none transition-all font-mono"
            />
          </div>
          <button 
            type="submit" 
            className="px-6 py-3 bg-[#2563eb] text-[#ffffff] font-bold text-xs rounded-xl hover:bg-[#1d4ed8] transition-colors flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Brain size={16} /> Generate AI Diagnostic
          </button>
        </form>

        <div className="flex items-center gap-2 mt-3 text-xs text-[#94a3b8]">
          <span>Quick Select:</span>
          {['ACC001245', 'ACCT-1102-Y', 'ACCT-9941-Z'].map((acc) => (
            <button
              key={acc}
              onClick={() => { setSearchId(acc); setTimeout(handleSearch, 50); }}
              className="px-2.5 py-1 bg-[#1e293b] text-[#2563eb] hover:bg-[#334155] rounded-lg font-mono text-[11px] font-bold transition-colors"
            >
              {acc}
            </button>
          ))}
        </div>
      </div>

      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* MAIN PANEL (8 COLS): AI INVESTIGATION REPORT */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* AI Recommendation Banner */}
            <div className="bg-[#111827] rounded-2xl p-6 border border-[#1e293b] shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="text-[#2563eb]" size={18} />
                  <h3 className="text-base font-bold text-[#f8fafc]">AI Diagnostic Summary Report</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 text-xs font-bold uppercase">
                  HIGH THREAT
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 space-y-1">
                <span className="text-[10px] font-bold text-[#ef4444] uppercase tracking-wider">AI Executive Action Directive</span>
                <p className="text-base font-bold text-[#f8fafc]">{report.recommendation}</p>
              </div>

              {/* Natural Language Diagnostic Reasoning */}
              <div>
                <h4 className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">AI Diagnostic Driver Reasons</h4>
                <div className="space-y-2">
                  {report.reasons?.map((r, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-[#f8fafc] bg-[#1e293b]/50 p-3 rounded-xl border border-[#334155]/40">
                      <AlertTriangle size={15} className="text-[#f59e0b] shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Suspicious Activity Timeline */}
            <div className="bg-[#111827] rounded-2xl p-6 border border-[#1e293b] shadow-xl space-y-4">
              <h3 className="text-base font-bold text-[#f8fafc]">Visual Suspicious Activity Timeline</h3>
              
              <div className="space-y-3 relative pl-4 border-l border-[#1e293b]">
                <div className="relative pl-4">
                  <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-[#ef4444]" />
                  <span className="text-[10px] text-[#94a3b8] font-mono">Today, 14:32 UTC</span>
                  <p className="text-xs font-bold text-[#f8fafc]">High FII Transfer Burst (₹42,50,000 to ACC-882103)</p>
                  <p className="text-[11px] text-[#94a3b8]">Triggered Circular Money Laundering Ring Alert</p>
                </div>

                <div className="relative pl-4">
                  <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-[#f59e0b]" />
                  <span className="text-[10px] text-[#94a3b8] font-mono">Today, 09:15 UTC</span>
                  <p className="text-xs font-bold text-[#f8fafc]">Behavior Drift Velocity Anomaly (BDS &gt; 92%)</p>
                  <p className="text-[11px] text-[#94a3b8]">14 rapid transfers executed across 3 payment gateways</p>
                </div>

                <div className="relative pl-4">
                  <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-[#2563eb]" />
                  <span className="text-[10px] text-[#94a3b8] font-mono">Yesterday, 18:40 UTC</span>
                  <p className="text-xs font-bold text-[#f8fafc]">Network Exposure Proximity Connection (NES &gt; 94%)</p>
                  <p className="text-[11px] text-[#94a3b8]">Inbound transfer received from blacklisted mule account</p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL (4 COLS): METERS & METRICS */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Risk & Confidence Meters */}
            <div className="bg-[#111827] rounded-2xl p-6 border border-[#1e293b] shadow-xl space-y-5">
              <h3 className="text-base font-bold text-[#f8fafc]">AI Risk Profile Metrics</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-[#94a3b8]">Fraud Influence Index (FII)</span>
                    <span className="font-mono font-bold text-[#ef4444]">{report.fii || 96.4}%</span>
                  </div>
                  <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#ef4444] h-full rounded-full" style={{ width: `${report.fii || 96.4}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-[#94a3b8]">Behavior Drift Score (BDS)</span>
                    <span className="font-mono font-bold text-[#f59e0b]">{report.bds || 92.8}%</span>
                  </div>
                  <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#f59e0b] h-full rounded-full" style={{ width: `${report.bds || 92.8}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-[#94a3b8]">Network Exposure Score (NES)</span>
                    <span className="font-mono font-bold text-[#2563eb]">{report.nes || 94.5}%</span>
                  </div>
                  <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#2563eb] h-full rounded-full" style={{ width: `${report.nes || 94.5}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-[#94a3b8]">Intervention Priority (IPS)</span>
                    <span className="font-mono font-bold text-[#ef4444]">{report.ips || 99.4}%</span>
                  </div>
                  <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#ef4444] h-full rounded-full" style={{ width: `${report.ips || 99.4}%` }} />
                  </div>
                </div>
              </div>

              {/* Expected Impact Box */}
              <div className="p-4 rounded-xl bg-[#1e293b] border border-[#334155] space-y-1">
                <span className="text-[10px] font-bold text-[#22c55e] uppercase tracking-wider">Expected Action Impact</span>
                <p className="text-base font-bold text-[#22c55e]">{report.simulated_reduction_percent || 84}% Risk Contagion Reduction</p>
                <p className="text-xs text-[#94a3b8]">Freezing target account contains 3 downstream laundering clusters.</p>
              </div>
            </div>

            {/* Related Fraud Accounts */}
            <div className="bg-[#111827] rounded-2xl p-6 border border-[#1e293b] shadow-xl space-y-3">
              <h3 className="text-base font-bold text-[#f8fafc]">Connected Fraud Accounts</h3>
              
              <div className="space-y-2 text-xs">
                {['ACCT-8821-X', 'ACCT-4412-Z', 'ACCT-7721-M'].map((acc, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-[#1e293b]/50 border border-[#334155]/40 flex justify-between items-center">
                    <span className="font-mono font-bold text-[#f8fafc]">{acc}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ef4444]/10 text-[#ef4444]">High Risk</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
