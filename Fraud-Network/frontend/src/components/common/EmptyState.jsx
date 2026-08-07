import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'No data available', description = '' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="p-4 rounded-2xl bg-white/5 text-slate-600">
        <Icon size={32} />
      </div>
      <h4 className="text-sm font-semibold text-slate-400">{title}</h4>
      {description && <p className="text-xs text-slate-500 max-w-xs">{description}</p>}
    </div>
  );
}
