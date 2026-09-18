'use client';

import { useApp } from '@/contexts/AppContext';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }) {
  const { currentRole, sidebarOpen } = useApp();

  if (!currentRole) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className={`sidebar-transition ${sidebarOpen ? 'ml-64' : 'ml-[68px]'} min-h-screen`}>
        <div className="p-6 lg:p-8 max-w-[1600px]">
          {children}
        </div>
      </main>
    </div>
  );
}
