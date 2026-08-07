import React from 'react';
import { motion } from 'framer-motion';

const colorMap = {
  white:  { icon: 'bg-white/10 text-white border-white/15',   value: 'text-white' },
  green:  { icon: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', value: 'text-emerald-400' },
  red:    { icon: 'bg-red-500/10 text-red-400 border-red-500/20',             value: 'text-red-400' },
  amber:  { icon: 'bg-amber-500/10 text-amber-400 border-amber-500/20',       value: 'text-amber-400' },
  purple: { icon: 'bg-purple-500/10 text-purple-400 border-purple-500/20',     value: 'text-purple-400' },
  blue:   { icon: 'bg-blue-500/10 text-blue-400 border-blue-500/20',           value: 'text-blue-400' },
  orange: { icon: 'bg-orange-500/10 text-orange-400 border-orange-500/20',     value: 'text-orange-400' },
};

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'white', index = 0 }) {
  const c = colorMap[color] || colorMap.white;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="glass-card p-5 flex items-start gap-4"
    >
      {Icon && (
        <div className={`p-2.5 rounded-xl border shrink-0 ${c.icon}`}>
          <Icon size={20} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <p className={`text-2xl font-bold tracking-tight ${c.value}`}>{value}</p>
        {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
