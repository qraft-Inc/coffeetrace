'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import LoadingSpinner from '../LoadingSpinner';

/**
 * Shared Dashboard Layout Component
 * Wraps all dashboard and authenticated pages with consistent sidebar navigation and top nav
 */
export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  if (status === 'loading') {
    return <LoadingSpinner fullScreen size="lg" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar session={session} collapsed={sidebarCollapsed} />
      <TopNav session={session} onToggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
      
      <main className={`pt-16 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        {children}
      </main>
    </div>
  );
}
