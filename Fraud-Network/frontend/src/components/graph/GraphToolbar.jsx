import React from 'react';
import { 
  Search, Eye, EyeOff, Route, RotateCcw, Download, Maximize2, Minimize2 
} from 'lucide-react';

export default function GraphToolbar({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  riskFilter,
  onRiskFilterChange,
  fraudOnly,
  onFraudOnlyToggle,
  communityHighlight,
  onCommunityChange,
  communityIds = [],
  shortestPathMode,
  onShortestPathToggle,
  nodeLimit,
  onNodeLimitChange,
  onReset,
  onExport,
  isFullscreen,
  onFullscreenToggle,
}) {
  return (
    <div className="absolute top-4 left-4 right-4 z-30 flex items-center gap-2 flex-wrap graph-toolbar px-4 py-2.5">
      <form onSubmit={onSearchSubmit} className="relative flex items-center">
        <Search className="absolute left-2.5 text-slate-500" size={14} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search account or name..."
          className="graph-search-input"
        />
      </form>

      <div className="w-px h-6 bg-white/10 mx-1" />

      <button onClick={() => onRiskFilterChange('all')} className={`graph-filter-btn ${riskFilter === 'all' ? 'active' : ''}`}>
        <Eye size={12} /> All
      </button>
      <button onClick={() => onRiskFilterChange('low')} className={`graph-filter-btn ${riskFilter === 'low' ? 'active' : ''}`}>
        <div className="w-2 h-2 rounded-full bg-blue-500" /> Normal
      </button>
      <button onClick={() => onRiskFilterChange('medium')} className={`graph-filter-btn ${riskFilter === 'medium' ? 'active' : ''}`}>
        <div className="w-2 h-2 rounded-full bg-amber-500" /> Medium
      </button>
      <button onClick={() => onRiskFilterChange('high')} className={`graph-filter-btn ${riskFilter === 'high' ? 'active' : ''}`}>
        <div className="w-2 h-2 rounded-full bg-orange-500" /> High
      </button>
      <button onClick={() => onRiskFilterChange('fraud')} className={`graph-filter-btn ${riskFilter === 'fraud' ? 'active' : ''}`}>
        <div className="w-2 h-2 rounded-full bg-red-500" /> Fraud
      </button>

      <div className="w-px h-6 bg-white/10 mx-1" />

      <button onClick={onFraudOnlyToggle} className={`graph-filter-btn ${fraudOnly ? 'active' : ''}`}>
        {fraudOnly ? <EyeOff size={12} /> : <Eye size={12} />} Fraud Only
      </button>

      <select
        value={communityHighlight ?? ''}
        onChange={(e) => onCommunityChange(e.target.value === '' ? null : parseInt(e.target.value))}
        className="graph-filter-btn appearance-none pr-6 cursor-pointer bg-transparent"
      >
        <option value="" className="bg-slate-900 text-slate-300">Community</option>
        {communityIds.map(id => (
          <option key={id} value={id} className="bg-slate-900 text-slate-300">Cluster #{id}</option>
        ))}
      </select>

      <button onClick={onShortestPathToggle} className={`graph-filter-btn ${shortestPathMode ? 'active' : ''}`}>
        <Route size={12} /> Shortest Path
      </button>

      <div className="flex-1" />

      <select
        value={nodeLimit}
        onChange={(e) => onNodeLimitChange(parseInt(e.target.value))}
        className="graph-filter-btn appearance-none pr-6 cursor-pointer bg-transparent"
      >
        <option value={100} className="bg-slate-900">100 nodes</option>
        <option value={300} className="bg-slate-900">300 nodes</option>
        <option value={500} className="bg-slate-900">500 nodes</option>
      </select>

      <button onClick={onReset} className="graph-filter-btn" title="Reset Graph">
        <RotateCcw size={12} />
      </button>
      <button onClick={onExport} className="graph-filter-btn" title="Export PNG">
        <Download size={12} />
      </button>
      <button onClick={onFullscreenToggle} className="graph-filter-btn" title="Fullscreen">
        {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
      </button>
    </div>
  );
}
