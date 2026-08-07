import React, { useState } from 'react';
import { Search, ShieldAlert, Cpu, AlertTriangle, Lock, CheckCircle2 } from 'lucide-react';
import { fetchAiInvestigation, fetchAccountTransactions, fetchSimulateIntervention } from '../services/api';
import GlassCard from '../components/cards/GlassCard';
import ProgressBar from '../components/common/ProgressBar';
import DataTable from '../components/tables/DataTable';
import Badge from '../components/common/Badge';

export default function Investigation() {
  const [searchId, setSearchId] = useState('ACC0002224');
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
      const [rep, t] = await Promise.all([
        fetchAiInvestigation(searchId).catch(() => null),
        fetchAccountTransactions(searchId).catch(() => [])
      ]);
      setReport(rep);
      setTxns(t || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'transaction_id', label: 'Txn ID', className: 'font-mono text-slate-300' },
    { key: 'transaction_type', label: 'Type' },
    { key: 'channel', label: 'Channel' },
    { 
      key: 'transaction_amount', 
      label: 'Amount', 
      align: 'right',
      render: (v) => `$${Number(v || 0).toLocaleString()}`
    },
    { 
      key: 'is_fraud', 
      label: 'Status',
      render: (v) => v ? <Badge variant="danger">Fraud</Badge> : <Badge variant="success">Normal</Badge>
    }
  ];

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto">
      {/* Search Bar */}
      <GlassCard>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Account ID (e.g. ACC0002224)..."
              className="input-dark pl-10"
            />
          </div>
          <button type="submit" className="btn-primary">
            Investigate Account
          </button>
        </form>
      </GlassCard>

      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Profile */}
          <GlassCard title="AI Risk Profile" subtitle={`Account: ${report.account_id}`} className="lg:col-span-1">
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${
                report.recommendation?.includes('CRITICAL') ? 'bg-red-500/10 border-red-500/25 text-red-400' :
                'bg-amber-500/10 border-amber-500/25 text-amber-400'
              }`}>
                <p className="text-[10px] font-semibold uppercase opacity-80">Recommendation</p>
                <p className="text-sm font-bold text-slate-100">{report.recommendation}</p>
              </div>

              <div className="space-y-3">
                <ProgressBar label="Fraud Influence Index (FII)" value={report.fii} color="#FFFFFF" showValue />
                <ProgressBar label="Behavior Drift Score (BDS)" value={report.bds} color="#A78BFA" showValue />
                <ProgressBar label="Network Exposure Score (NES)" value={report.nes} color="#F59E0B" showValue />
                <ProgressBar label="Intervention Priority (IPS)" value={report.ips} color="#EF4444" showValue />
              </div>
            </div>
          </GlassCard>

          {/* AI Reasons & Txns */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard title="AI Diagnostic Drivers" subtitle="Primary risk contributors">
              <ul className="space-y-2">
                {report.reasons?.map((r, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-slate-300 bg-white/4 p-2.5 rounded-lg border border-white/5">
                    <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard title="Account Transaction Log" subtitle="Recent transactions">
              <DataTable columns={columns} data={txns} maxHeight="300px" />
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
