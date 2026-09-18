'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import {
  LayoutDashboard, Users, Calendar, Trophy, Award,
  ClipboardCheck, Package, Store, Gift, ChevronLeft,
  ChevronRight, LogOut, Boxes, FileText, BarChart3, Zap
} from 'lucide-react';

const adminNav = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Events', href: '/admin/events', icon: Calendar },
  { label: 'Judges', href: '/admin/judges', icon: Users },
  { label: 'Participants', href: '/admin/participants', icon: Users },
  { label: 'Evaluations', href: '/admin/evaluations', icon: ClipboardCheck },
  { label: 'Results', href: '/admin/results', icon: BarChart3 },
];

const judgeNav = [
  { label: 'My Events', href: '/judge', icon: Calendar },
];

const vendorNav = [
  { label: 'Overview', href: '/vendor', icon: LayoutDashboard },
  { label: 'Prizes', href: '/vendor/prizes', icon: Trophy },
  { label: 'Mementos', href: '/vendor/mementos', icon: Gift },
  { label: 'Vendors', href: '/vendor/vendors', icon: Store },
  { label: 'Other Items', href: '/vendor/other-items', icon: Boxes },
];

export default function Sidebar() {
  const { currentRole, sidebarOpen, setSidebarOpen, logout } = useApp();
  const pathname = usePathname();

  if (!currentRole) return null;

  const navItems = currentRole === 'admin'
    ? adminNav
    : currentRole === 'judge'
    ? judgeNav
    : vendorNav;

  const roleLabels = {
    admin: 'Admin Panel',
    judge: 'Judge Panel',
    vendor: 'Inventory Panel',
  };

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-brand-600 text-white flex flex-col z-40 sidebar-transition ${sidebarOpen ? 'w-64' : 'w-[68px]'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-accent-500 flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {sidebarOpen && (
          <div className="min-w-0">
            <h1 className="font-bold text-sm leading-tight truncate">TechTatva</h1>
            <p className="text-[11px] text-white/60 truncate">{roleLabels[currentRole]}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && item.href !== '/judge' && item.href !== '/vendor' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 space-y-1">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full"
        >
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          {sidebarOpen && <span>Collapse</span>}
        </button>
        <Link
          href="/"
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-colors w-full"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span>Switch Role</span>}
        </Link>
      </div>
    </aside>
  );
}
