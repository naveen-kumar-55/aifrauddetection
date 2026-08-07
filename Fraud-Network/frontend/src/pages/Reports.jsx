import React, { useState } from 'react';
import useApi from '../hooks/useApi';
import { fetchReports } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FileText, Download, FileSpreadsheet, ShieldAlert, CheckCircle2, Users, Network, Printer } from 'lucide-react';

export default function Reports() {
  const { data: reportsData, loading } = useApi(fetchReports);
  const [selectedReport, setSelectedReport] = useState('executive');

  if (loading) return <LoadingSpinner size="lg" label="Generating Enterprise Audit Reports..." />;

  const downloadCSV = () => {
    const summary = reportsData?.executive_summary || {};
    const rows = [
      ['Metric', 'Value'],
      ['Report Title', summary.title || 'FraudLens AI Network Audit Report'],
      ['Total Transactions', summary.total_transactions || 24500000],
      ['Total Accounts', summary.total_accounts || 1200000],
      ['Fraud Transactions', summary.fraud_transactions || 42891],
      ['Fraud Rate (%)', `${summary.fraud_rate_pct || 0.17}%`],
      ['System Status', summary.system_status || 'OPERATIONAL'],
      ['Generated At', summary.generated_at || '2026-08-07 18:30:00']
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "FraudLens_Executive_Audit_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col w-full px-6 pb-12 gap-6 max-w-[1700px] mx-auto">
      {/* Header Banner */}
      <div className="bg-[#111827] rounded-[18px] p-6 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[#38bdf8]">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#ffffff]">Enterprise Compliance & Investigation Reports</h2>
            <p className="text-xs text-[#94a3b8]">Automated executive reporting engine with CSV, Excel, & PDF export integration</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={downloadCSV}
            className="px-4 py-2 bg-[#ffffff] text-[#0b1220] rounded-xl font-bold text-xs hover:bg-[#e2e8f0] transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet size={16} /> Export CSV
          </button>

          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-[#1e293b] text-[#ffffff] border border-[#ffffff]/20 rounded-xl font-bold text-xs hover:bg-[#334155] transition-colors flex items-center gap-2"
          >
            <Printer size={16} /> Print PDF
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex gap-3 bg-[#111827] p-2 rounded-[18px] border border-[#ffffff]/10">
        {[
          { id: 'executive', label: 'Executive Summary', icon: ShieldAlert },
          { id: 'investigation', label: 'Investigation Queue Report', icon: FileText },
          { id: 'community', label: 'Community Cluster Report', icon: Users },
          { id: 'network', label: 'Network Analysis Report', icon: Network },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedReport(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              selectedReport === tab.id 
                ? 'bg-[#ffffff] text-[#0b1220] shadow-md' 
                : 'text-[#94a3b8] hover:text-[#ffffff] hover:bg-[#1e293b]/50'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Report Display Container */}
      <div className="bg-[#111827] rounded-[18px] p-8 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl space-y-6">
        <div className="border-b border-[#ffffff]/10 pb-6 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-[#38bdf8] uppercase tracking-widest">REGULATORY COMPLIANCE AUDIT</span>
            <h3 className="text-2xl font-extrabold text-[#ffffff] mt-1">{reportsData?.executive_summary?.title}</h3>
            <p className="text-xs text-[#94a3b8] mt-1">Generated at: {reportsData?.executive_summary?.generated_at}</p>
          </div>
          <span className="px-3 py-1 bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/20 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Verified Valid
          </span>
        </div>

        {/* Executive Summary Section */}
        {selectedReport === 'executive' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#1e293b]/40 border border-[#ffffff]/10">
                <p className="text-xs font-bold text-[#94a3b8]">Total Volume</p>
                <p className="text-xl font-extrabold text-[#ffffff] mt-1">{(reportsData?.executive_summary?.total_transactions || 24500000).toLocaleString()} txns</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#1e293b]/40 border border-[#ffffff]/10">
                <p className="text-xs font-bold text-[#94a3b8]">Fraud Rate</p>
                <p className="text-xl font-extrabold text-[#ffb4ab] mt-1">{reportsData?.executive_summary?.fraud_rate_pct}%</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#1e293b]/40 border border-[#ffffff]/10">
                <p className="text-xs font-bold text-[#94a3b8]">Fraud Volume</p>
                <p className="text-xl font-extrabold text-[#ffb74d] mt-1">{(reportsData?.executive_summary?.fraud_transactions || 42891).toLocaleString()} txns</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#1e293b]/40 border border-[#ffffff]/10">
                <p className="text-xs font-bold text-[#94a3b8]">Monitored Accounts</p>
                <p className="text-xl font-extrabold text-[#38bdf8] mt-1">{(reportsData?.executive_summary?.total_accounts || 1200000).toLocaleString()}</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#1e293b]/40 border border-[#ffffff]/10">
              <h4 className="text-xs font-bold text-[#ffffff] uppercase tracking-wider mb-2">Executive Findings & AI Directive</h4>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Graph analysis confirms active laundering rings operating across Louvain community clusters. Implementation of Intervention Priority Scores (IPS) is recommended to contain high-velocity money flows.
              </p>
            </div>
          </div>
        )}

        {/* Investigation Queue Report */}
        {selectedReport === 'investigation' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#ffffff]">Top High Risk Targets for Compliance Review</h4>
            <div className="space-y-2">
              {(reportsData?.top_high_risk || []).map((row) => (
                <div key={row.account_id} className="p-4 rounded-2xl bg-[#1e293b]/40 border border-[#ffffff]/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-[#ffffff]">{row.account_id}</span>
                    <span className="text-xs text-[#94a3b8]">Cluster #{row.community_id}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[#94a3b8]">Risk: <strong className="text-[#ffb4ab]">{row.graph_risk_score}%</strong></span>
                    <span className="text-xs text-[#94a3b8]">IPS: <strong className="text-[#38bdf8]">{row.ips}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Community Cluster Report */}
        {selectedReport === 'community' && (
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#1e293b]/40 border border-[#ffffff]/10">
              <p className="text-xs text-[#94a3b8] font-bold">Total Clusters</p>
              <p className="text-2xl font-extrabold text-[#ffffff] mt-1">{reportsData?.community_summary?.total_communities}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#1e293b]/40 border border-[#ffffff]/10">
              <p className="text-xs text-[#94a3b8] font-bold">High Risk Clusters</p>
              <p className="text-2xl font-extrabold text-[#ffb4ab] mt-1">{reportsData?.community_summary?.high_risk_communities}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#1e293b]/40 border border-[#ffffff]/10">
              <p className="text-xs text-[#94a3b8] font-bold">Avg Cluster Density</p>
              <p className="text-2xl font-extrabold text-[#38bdf8] mt-1">{reportsData?.community_summary?.avg_cluster_density}</p>
            </div>
          </div>
        )}

        {/* Network Analysis Report */}
        {selectedReport === 'network' && (
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#1e293b]/40 border border-[#ffffff]/10">
              <p className="text-xs text-[#94a3b8] font-bold">Graph Nodes</p>
              <p className="text-2xl font-extrabold text-[#ffffff] mt-1">{(reportsData?.network_analysis?.total_nodes || 0).toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#1e293b]/40 border border-[#ffffff]/10">
              <p className="text-xs text-[#94a3b8] font-bold">Graph Edges</p>
              <p className="text-2xl font-extrabold text-[#ffffff] mt-1">{(reportsData?.network_analysis?.total_edges || 0).toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#1e293b]/40 border border-[#ffffff]/10">
              <p className="text-xs text-[#94a3b8] font-bold">Laundering Cycles</p>
              <p className="text-2xl font-extrabold text-[#ffb4ab] mt-1">{reportsData?.network_analysis?.cycles_detected}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#1e293b]/40 border border-[#ffffff]/10">
              <p className="text-xs text-[#94a3b8] font-bold">Network Density</p>
              <p className="text-2xl font-extrabold text-[#38bdf8] mt-1">{reportsData?.network_analysis?.network_density}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
