import React from 'react';
import useApi from '../hooks/useApi';
import { fetchCommunities } from '../services/api';
import GlassCard from '../components/cards/GlassCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import { Users } from 'lucide-react';

export default function Communities() {
  const { data: communities, loading } = useApi(fetchCommunities);

  if (loading) return <LoadingSpinner size="lg" label="Clustering Network Communities..." />;

  // Group by community_id
  const clusters = {};
  (communities || []).forEach(c => {
    clusters[c.community_id] = (clusters[c.community_id] || 0) + 1;
  });

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto">
      <GlassCard title="Network Community Clusters" subtitle="Louvain community detection breakdown">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(clusters).slice(0, 16).map(([cid, count]) => (
            <div key={cid} className="p-4 rounded-xl bg-white/4 border border-white/6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Users size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Cluster #{cid}</h4>
                  <p className="text-xs text-slate-500">{count} accounts</p>
                </div>
              </div>
              <Badge variant="purple">Louvain</Badge>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
