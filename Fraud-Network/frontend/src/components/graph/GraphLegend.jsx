import React from 'react';

export default function GraphLegend({ stats }) {
  return (
    <>
      <div className="absolute bottom-4 left-4 z-20 graph-legend px-4 py-3 flex flex-col gap-2">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Risk Tiers</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-blue-400/50" /> Normal
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <div className="w-3 h-3 rounded-full bg-amber-500 border-2 border-amber-400/50" /> Medium
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <div className="w-3 h-3 rounded-full bg-orange-500 border-2 border-orange-400/50" /> High
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-400/50" /> Fraud
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <div className="w-5 h-0 border-t border-slate-400" /> Normal Edge
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <div className="w-5 h-0 border-t-2 border-dashed border-red-500" /> Fraud Edge
          </div>
        </div>
      </div>

      {stats && (
        <div className="absolute bottom-4 right-4 z-20 graph-legend px-4 py-3 flex gap-4">
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Nodes</p>
            <p className="text-sm font-bold text-slate-200">{stats.total}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Edges</p>
            <p className="text-sm font-bold text-slate-200">{stats.edges}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-red-500 uppercase font-semibold">Fraud</p>
            <p className="text-sm font-bold text-red-400">{stats.fraud}</p>
          </div>
        </div>
      )}
    </>
  );
}
