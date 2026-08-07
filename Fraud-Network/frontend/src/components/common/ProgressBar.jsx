import React from 'react';

export default function ProgressBar({ value = 0, max = 100, color = '#FFFFFF', height = 6, label, showValue = false }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-[11px] text-slate-400 font-medium">{label}</span>}
          {showValue && <span className="text-[11px] font-bold" style={{ color }}>{value.toFixed(1)}%</span>}
        </div>
      )}
      <div className="w-full rounded-full overflow-hidden" style={{ height, background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
