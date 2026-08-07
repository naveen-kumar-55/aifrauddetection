import React, { useState, useEffect } from 'react';
import NetworkGraph from '../components/graph/NetworkGraph';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchGraphData } from '../services/api';

export default function Network() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nodeLimit, setNodeLimit] = useState(300);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchGraphData({ limit: nodeLimit });
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [nodeLimit]);

  if (loading) return <LoadingSpinner size="lg" label="Building Fraud Network Topology..." />;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col rounded-2xl overflow-hidden glass-card">
      <NetworkGraph
        data={data}
        nodeLimit={nodeLimit}
        onNodeLimitChange={setNodeLimit}
        onRefresh={loadData}
      />
    </div>
  );
}
