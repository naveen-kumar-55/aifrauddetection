import React from 'react';
import useApi from '../hooks/useApi';
import { fetchAnalytics } from '../services/api';
import GlassCard from '../components/cards/GlassCard';
import AreaTrendChart from '../components/charts/AreaTrendChart';
import BarChart from '../components/charts/BarChart';
import DonutChart from '../components/charts/DonutChart';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Analytics() {
  const { data: analytics, loading } = useApi(fetchAnalytics);

  if (loading) return <LoadingSpinner size="lg" label="Loading Deep Analytics..." />;

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto">
      <GlassCard title="Comprehensive Fraud Rate Trend" subtitle="Daily percentage of fraudulent activity">
        <AreaTrendChart 
          data={analytics?.trend || []} 
          xKey="day" 
          lines={[
            { key: 'fraud_rate', color: '#EF4444', name: 'Fraud Rate (%)' }
          ]} 
          height={320}
        />
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard title="Transaction Channel Analysis" subtitle="Volume vs Fraud count by channel">
          <BarChart 
            data={analytics?.channel_distribution || []} 
            xKey="channel" 
            bars={[
              { key: 'volume', color: '#FFFFFF', name: 'Volume' },
              { key: 'fraud_count', color: '#EF4444', name: 'Fraud' }
            ]} 
          />
        </GlassCard>

        <GlassCard title="Transaction Types Risk Ratio" subtitle="Method volumes">
          <BarChart 
            data={analytics?.type_distribution || []} 
            xKey="transaction_type" 
            bars={[
              { key: 'volume', color: '#3B82F6', name: 'Volume' },
              { key: 'fraud_count', color: '#EF4444', name: 'Fraud' }
            ]} 
          />
        </GlassCard>
      </div>
    </div>
  );
}
