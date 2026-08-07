import React from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({ title, subtitle, actions, children, className = '', noPad = false, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`glass-card overflow-hidden ${className}`}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between px-5 pt-5 pb-0">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-200">{title}</h3>}
            {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={noPad ? '' : 'p-5'}>
        {children}
      </div>
    </motion.div>
  );
}
