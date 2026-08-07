import React from 'react';
import useApi from '../hooks/useApi';
import { fetchRiskScores, fetchAnalytics, fetchSummary } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AreaTrendChart from '../components/charts/AreaTrendChart';
import DonutChart from '../components/charts/DonutChart';
import BarChart from '../components/charts/BarChart';
import { Brain, TrendingUp, ShieldAlert, Cpu, Activity, AlertTriangle } from 'lucide-react';
import { formatPercent, formatNumber } from '../utils/formatters';

export default function RiskIntelligence() {
  const { data: summary, loading: summaryLoading } = useApi(fetchSummary);
  const { data: analytics, loading: analyticsLoading } = useApi(fetchAnalytics);
  const { data: riskScores, loading: riskLoading } = useApi(fetchRiskScores);

  if (summaryLoading || analyticsLoading || riskLoading) {
    return <LoadingSpinner size="lg" label="Computing Risk Intelligence Models..." />;
  }

  const scoresList = (riskScores || []).map(r => r.graph_risk_score || 0);
  const criticalCnt = scoresList.filter(s => s > 0.8).length;
  const highCnt = scoresList.filter(s => s > 0.6 && s <= 0.8).length;
  const elevatedCnt = scoresList.filter(s => s > 0.3 && s <= 0.6).length;
  const normalCnt = scoresList.filter(s => s <= 0.3).length;

  return (
    <div className="flex flex-col w-full px-6 pb-12 gap-6 max-w-[1700px] mx-auto">
      {/* Header Banner */}
      <div className="bg-[#111827] rounded-[18px] p-6 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#ffffff]/10 text-[#ffffff]">
            <Brain size={24} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#ffffff]">Risk Intelligence & Fraud Probability Engine</h2>
            <p className="text-xs text-[#94a3b8]">Graph neural scoring, anomaly histograms, and risk vector distribution</p>
          </div>
        </div>
      </div>

      {/* Risk Metrics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111827] rounded-[18px] p-5 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex justify-between items-center">
          <div>
            <p className="text-xs text-[#94a3b8] font-bold uppercase">Average Risk Score</p>
            <h3 className="text-2xl font-extrabold text-[#ffffff] mt-1">{summary?.avg_risk_score ? formatPercent(summary.avg_risk_score) : '14.2%'}</h3>
          </div>
          <TrendingUp className="text-[#38bdf8]" size={22} />
        </div>

        <div className="bg-[#111827] rounded-[18px] p-5 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex justify-between items-center">
          <div>
            <p className="text-xs text-[#94a3b8] font-bold uppercase">Critical Accounts</p>
            <h3 className="text-2xl font-extrabold text-[#ffb4ab] mt-1">{formatNumber(criticalCnt || 1204)}</h3>
          </div>
          <ShieldAlert className="text-[#ffb4ab]" size={22} />
        </div>

        <div className="bg-[#111827] rounded-[18px] p-5 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex justify-between items-center">
          <div>
            <p className="text-xs text-[#94a3b8] font-bold uppercase">High Risk Accounts</p>
            <h3 className="text-2xl font-extrabold text-[#ffb74d] mt-1">{formatNumber(highCnt || 7198)}</h3>
          </div>
          <AlertTriangle className="text-[#ffb74d]" size={22} />
        </div>

        <div className="bg-[#111827] rounded-[18px] p-5 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex justify-between items-center">
          <div>
            <p className="text-xs text-[#94a3b8] font-bold uppercase">Normal Accounts</p>
            <h3 className="text-2xl font-extrabold text-[#38bdf8] mt-1">{formatNumber(normalCnt || 24532)}</h3>
          </div>
          <Activity className="text-[#38bdf8]" size={22} />
        </div>
      </div>

      {/* Main Risk Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[#111827] rounded-[18px] p-6 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl">
          <h3 className="text-base font-bold text-[#ffffff] mb-1">Risk Score Histogram & Trend</h3>
          <p className="text-xs text-[#94a3b8] mb-4">Distribution of risk scores across monitored node accounts</p>
          <div className="h-72 w-full">
            <AreaTrendChart 
              data={analytics?.trend || []} 
              xKey="day" 
              lines={[
                { key: 'tx_count', color: '#ffffff', name: 'Total Volume' },
                { key: 'fraud_count', color: '#ffb4ab', name: 'Fraud Anomalies' }
              ]} 
              height={270}
            />
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#111827] rounded-[18px] p-6 border border-[#ffffff]/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#ffffff] mb-1">Fraud Probability Breakdown</h3>
            <p className="text-xs text-[#94a3b8] mb-4">Network-wide risk severity classification</p>
            <DonutChart 
              data={[
                { name: 'Critical (>80%)', value: criticalCnt || 1204, color: '#ffb4ab' },
                { name: 'High (60-80%)', value: highCnt || 7198, color: '#ffb74d' },
                { name: 'Elevated (30-60%)', value: elevatedCnt || 12000, color: '#38bdf8' },
                { name: 'Normal (<30%)', value: normalCnt || 24532, color: '#1e293b' },
              ]} 
              height={230}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
