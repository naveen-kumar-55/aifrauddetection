import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="glass-card px-3 py-2 text-xs border border-white/10">
      <p className="font-semibold" style={{ color: d.payload.color }}>{d.name}</p>
      <p className="text-slate-300">{Number(d.value).toLocaleString()}</p>
    </div>
  );
};

export default function DonutChart({ data = [], height = 260, innerRadius = 60, outerRadius = 90 }) {
  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color || '#64748B'} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 justify-center mt-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}
