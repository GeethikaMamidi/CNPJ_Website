import React from 'react';
import { Sparkles } from 'lucide-react';

export default function EmptyState({ title, description, actionLabel, onAction, icon: Icon = Sparkles }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 backdrop-blur-xl">
      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 shadow-glow">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="font-display text-lg font-bold text-white mb-1.5">{title}</h3>
      <p className="text-sm text-slate-400 mb-6 max-w-md leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm shadow-md hover:shadow-indigo-500/25 transition-all duration-200 active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
