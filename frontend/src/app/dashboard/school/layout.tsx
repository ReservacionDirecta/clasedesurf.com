'use client';

import { useEffect, useState } from 'react';
import { SchoolSidebar } from '@/components/layout/SchoolSidebar';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';

export default function SchoolDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(256);

  useEffect(() => {
    const updateWidth = () => {
      const sidebar = document.getElementById('school-sidebar') as HTMLElement;
      if (sidebar) {
        const isCollapsed = sidebar.getAttribute('data-collapsed') === 'true';
        setSidebarWidth(isCollapsed ? 80 : 256);
      }
    };

    updateWidth();
    const interval = setInterval(updateWidth, 100);
    const observer = new MutationObserver(updateWidth);
    
    const sidebar = document.getElementById('school-sidebar');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['data-collapsed'] });
    }

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <SchoolSidebar />
      <div 
        className="transition-all duration-300"
        style={{ marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${sidebarWidth}px` : '0' }}
      >
        <main className="pb-20 lg:pb-0">{children}</main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
