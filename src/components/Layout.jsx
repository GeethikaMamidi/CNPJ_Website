import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UserCheck, 
  ClipboardCheck, 
  Trophy, 
  Store, 
  Gift,
  Menu,
  X,
  Sparkles,
  Database,
  ExternalLink
} from 'lucide-react';

export default function Layout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={19} />, label: 'Dashboard', badge: null },
    { to: '/events', icon: <Calendar size={19} />, label: 'Events', badge: null },
    { to: '/judges', icon: <Users size={19} />, label: 'Judges', badge: null },
    { to: '/participants', icon: <UserCheck size={19} />, label: 'Participants', badge: null },
    { to: '/judging', icon: <ClipboardCheck size={19} />, label: 'Judging Terminal', badge: 'Live' },
    { to: '/results', icon: <Trophy size={19} />, label: 'Leaderboard', badge: null },
    { to: '/vendors', icon: <Store size={19} />, label: 'Vendors', badge: null },
    { to: '/mementos', icon: <Gift size={19} />, label: 'Mementos', badge: null },
  ];

  const currentRouteName = navItems.find(i => i.to === location.pathname)?.label || 'TechTatva';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/95 border-r border-slate-800/80 flex flex-col backdrop-blur-2xl transition-transform duration-300 ease-in-out md:translate-x-0 md:static
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl shadow-black' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xl tracking-tight text-white">TechTatva</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 tracking-wider uppercase">Event Suite 2026</p>
            </div>
          </div>
          <button 
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800" 
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Navigation</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `
                group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-lg shadow-indigo-600/25' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'}
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="flex items-center gap-3">
                <span className="transition-transform group-hover:scale-110">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* System & DB Status Footer */}
        <div className="p-4 border-t border-slate-800/70 bg-slate-900/60">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-xs font-semibold text-slate-200">Supabase DB</p>
                <p className="text-[10px] text-slate-400">
                  {supabase ? 'Online & Linked' : 'Offline Mode'}
                </p>
              </div>
            </div>
            <span className={`w-2 h-2 rounded-full ${supabase ? 'bg-emerald-400 shadow-glow-emerald animate-pulse' : 'bg-amber-400'}`} />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        {/* Top Header */}
        <header className="h-16 md:h-20 bg-slate-900/40 border-b border-slate-800/70 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>
            <div>
              <h1 className="font-display font-extrabold text-lg md:text-xl text-white tracking-tight">
                {currentRouteName}
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Fest Administration & Live Scoring Console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>TechTatva '26 Live</span>
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {!supabase && (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 backdrop-blur-xl shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                    <Database size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-amber-100 mb-1">Database Configuration Required</h3>
                    <p className="text-sm text-amber-200/90 mb-3">
                      Supabase client environment variables are not detected. Follow these steps to link your instance:
                    </p>
                    <ol className="text-xs list-decimal list-inside space-y-1 font-mono text-amber-300/90">
                      <li>Configure <code className="bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">VITE_SUPABASE_URL</code> and <code className="bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">VITE_SUPABASE_ANON_KEY</code> in <code className="bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">.env</code></li>
                      <li>Run <code className="bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">supabase/schema.sql</code> and <code className="bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">supabase/seed.sql</code> in your Supabase SQL Editor</li>
                      <li>Restart Vite server with <code className="bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">npm run dev</code></li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
