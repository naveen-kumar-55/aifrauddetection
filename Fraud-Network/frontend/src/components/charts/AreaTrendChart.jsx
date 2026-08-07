import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
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

export default function AreaTrendChart({
  data = [],
  xKey = 'day',
  lines = [{ key: 'tx_count', color: '#FFFFFF', name: 'Transactions' }],
  height = 280,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          {lines.map(line => (
            <linearGradient key={line.key} id={`grad-${line.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={line.color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={line.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey={xKey}
          tick={{ fill: '#475569', fontSize: 10 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#475569', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        {lines.map(line => (
          <Area
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color}
            strokeWidth={2}
            fill={`url(#grad-${line.key})`}
            dot={false}
            activeDot={{ r: 4, fill: line.color, stroke: '#0B1220', strokeWidth: 2 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
