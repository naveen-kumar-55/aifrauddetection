import React from 'react';
import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs border border-white/10">
      <p className="text-slate-400 font-medium mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="font-semibold" style={{ color: entry.color }}>
          {entry.name}: {Number(entry.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function BarChart({
  data = [],
  xKey = 'name',
  bars = [{ key: 'volume', color: '#FFFFFF', name: 'Volume' }],
  height = 260,
  layout = 'horizontal',
}) {
  const isHorizontal = layout === 'horizontal';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={isHorizontal ? 'horizontal' : 'vertical'}
        margin={{ top: 4, right: 8, left: isHorizontal ? -20 : 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        {isHorizontal ? (
          <>
            <XAxis dataKey={xKey} tick={{ fill: '#475569', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
            <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
          </>
        ) : (
          <>
            <XAxis type="number" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey={xKey} tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
          </>
        )}
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        {bars.map(bar => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name}
            fill={bar.color}
            radius={[4, 4, 4, 4]}
            maxBarSize={32}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
