import React from 'react';

export default function Badge({ children, variant = 'default', dot = true, className = '' }) {
  const variantStyles = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 dot-bg-emerald-400',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20 dot-bg-amber-400',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20 dot-bg-rose-400',
    info: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 dot-bg-indigo-400',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20 dot-bg-purple-400',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700/60 dot-bg-slate-400',
    default: 'bg-slate-800 text-slate-300 border-slate-700/60 dot-bg-slate-400',
  };

  const dotColors = {
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    info: 'bg-indigo-400',
    purple: 'bg-purple-400',
    neutral: 'bg-slate-400',
    default: 'bg-slate-400',
  };

  const style = variantStyles[variant] || variantStyles.default;
  const dotColor = dotColors[variant] || dotColors.default;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border capitalize transition-colors ${style} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse-subtle`} />}
      {children}
    </span>
  );
}
