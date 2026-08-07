import React from 'react';

export default function LoadingSpinner({ size = 'md', label = 'Loading...' }) {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-14 h-14 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className={`${sizes[size]} border-white/20 border-t-white rounded-full animate-spin`} />
      {label && <p className="text-xs font-medium text-slate-500 animate-pulse">{label}</p>}
    </div>
  );
}
