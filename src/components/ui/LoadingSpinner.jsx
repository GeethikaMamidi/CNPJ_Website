import React from 'react';

export default function LoadingSpinner({ label = 'Loading data...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[220px]">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
        <div className="absolute w-6 h-6 rounded-full border-2 border-purple-500/30 border-b-purple-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400 animate-pulse">{label}</p>
    </div>
  );
}
