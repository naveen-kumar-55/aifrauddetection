import React, { useState, useEffect } from 'react';
import NetworkGraph from '../components/graph/NetworkGraph';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchGraphData } from '../services/api';

/**
 * Network page — wraps the graph in a full-height container.
 * No padding, no rounded wrapper — graph gets maximum screen real-estate.
 */
export default function Network() {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [nodeLimit, setNodeLimit] = useState(300);
  const [error,     setError]     = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchGraphData({ limit: nodeLimit });
      // Validate response
      if (!res || !Array.isArray(res.nodes)) {
        throw new Error('Backend returned invalid graph data structure');
      }
      console.log(`[Network] Loaded ${res.nodes.length} nodes, ${res.edges?.length ?? 0} edges`);
      setData(res);
    } catch (e) {
      console.error('[Network] Failed to load graph data:', e);
      setError(e.message || 'Failed to load graph data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [nodeLimit]);

  if (loading) {
    return <LoadingSpinner size="lg" label="Building Fraud Network Topology…" />;
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400">
        <p className="text-sm font-mono text-red-400">⚠ {error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 text-xs rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    /*
     * Full-height container with zero padding.
     * h-[calc(100vh-64px)]: subtracts only the Navbar height (pt-16 = 64px).
     * The NetworkGraph fills this completely.
     */
    <div
      className="flex overflow-hidden"
      style={{
        height: 'calc(100vh - 64px)',
        width: '100%',
      }}
    >
      <NetworkGraph
        data={data}
        nodeLimit={nodeLimit}
        onNodeLimitChange={setNodeLimit}
        onRefresh={loadData}
      />
    </div>
  );
}
