import React from 'react';

const colorMap = {
  blue: {
    bg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-blue-500/10',
    ring: 'group-hover:ring-blue-500/30',
    glow: 'from-blue-500/10 to-transparent'
  },
  green: {
    bg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-emerald-500/10',
    ring: 'group-hover:ring-emerald-500/30',
    glow: 'from-emerald-500/10 to-transparent'
  },
  purple: {
    bg: 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-purple-500/10',
    ring: 'group-hover:ring-purple-500/30',
    glow: 'from-purple-500/10 to-transparent'
  },
  orange: {
    bg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-amber-500/10',
    ring: 'group-hover:ring-amber-500/30',
    glow: 'from-amber-500/10 to-transparent'
  },
  red: {
    bg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-rose-500/10',
    ring: 'group-hover:ring-rose-500/30',
    glow: 'from-rose-500/10 to-transparent'
  },
  indigo: {
    bg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-indigo-500/10',
    ring: 'group-hover:ring-indigo-500/30',
    glow: 'from-indigo-500/10 to-transparent'
  },
  pink: {
    bg: 'bg-pink-500/10 text-pink-400 border border-pink-500/20 shadow-pink-500/10',
    ring: 'group-hover:ring-pink-500/30',
    glow: 'from-pink-500/10 to-transparent'
  },
  teal: {
    bg: 'bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-teal-500/10',
    ring: 'group-hover:ring-teal-500/30',
    glow: 'from-teal-500/10 to-transparent'
  },
};

export default function Card({ title, value, icon, color = 'blue', subtitle }) {
  const scheme = colorMap[color] || colorMap.blue;
  
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-slate-900/80 p-5 md:p-6 border border-slate-800/80 backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-slate-700/80 hover:shadow-xl">
      {/* Subtle top-corner gradient ambient glow */}
      <div className={`pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br ${scheme.glow} blur-2xl opacity-50 transition-opacity group-hover:opacity-100`} />
      
      <div className="relative flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="font-display text-3xl font-extrabold text-white tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${scheme.bg} shadow-md transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
