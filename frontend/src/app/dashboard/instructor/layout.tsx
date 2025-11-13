'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import InstructorSidebar from '@/components/layout/InstructorSidebar';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarWidth, setSidebarWidth] = useState(256);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.role !== 'INSTRUCTOR') {
      router.push('/dashboard/student/profile');
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    const updateWidth = () => {
      const sidebar = document.getElementById('instructor-sidebar') as HTMLElement;
      if (sidebar) {
        const isCollapsed = sidebar.getAttribute('data-collapsed') === 'true';
        setSidebarWidth(isCollapsed ? 80 : 256);
      }
    };

    updateWidth();
    const interval = setInterval(updateWidth, 100);
    const observer = new MutationObserver(updateWidth);
    
    const sidebar = document.getElementById('instructor-sidebar');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['data-collapsed'] });
    }

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'INSTRUCTOR') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <InstructorSidebar />
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