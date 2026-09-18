import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
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
  X
} from 'lucide-react';

export default function Layout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/events', icon: <Calendar size={20} />, label: 'Events' },
    { to: '/judges', icon: <Users size={20} />, label: 'Judges' },
    { to: '/participants', icon: <UserCheck size={20} />, label: 'Participants' },
    { to: '/judging', icon: <ClipboardCheck size={20} />, label: 'Judging' },
    { to: '/results', icon: <Trophy size={20} />, label: 'Results' },
    { to: '/vendors', icon: <Store size={20} />, label: 'Vendors' },
    { to: '/mementos', icon: <Gift size={20} />, label: 'Mementos' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-1">
              TechTatva <span className="w-2 h-2 bg-purple-500 rounded-full inline-block"></span>
            </h1>
            <p className="text-xs text-gray-400 font-medium">Event Management</p>
          </div>
          <button className="md:hidden text-gray-400" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors border-l-4
                ${isActive 
                  ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500' 
                  : 'border-transparent text-gray-400 hover:bg-gray-800 hover:text-white'}
              `}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden h-16 bg-white border-b flex items-center px-4">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold text-lg text-gray-900">TechTatva</span>
        </div>

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {!supabase && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-900">
              <h3 className="font-bold text-lg mb-1">⚠️ Supabase Not Connected</h3>
              <p className="text-sm mb-2">The app cannot connect to the database. To fix this:</p>
              <ol className="text-sm list-decimal list-inside space-y-1">
                <li>Copy <code className="bg-amber-100 px-1 rounded">.env.example</code> to <code className="bg-amber-100 px-1 rounded">.env</code></li>
                <li>Fill in <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code></li>
                <li>Run <code className="bg-amber-100 px-1 rounded">schema.sql</code> then <code className="bg-amber-100 px-1 rounded">seed.sql</code> in Supabase SQL Editor</li>
                <li>Restart the dev server (<code className="bg-amber-100 px-1 rounded">npm run dev</code>)</li>
              </ol>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
