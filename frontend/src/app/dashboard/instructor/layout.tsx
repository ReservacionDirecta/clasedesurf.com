'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import InstructorNavbar from '@/components/layout/InstructorNavbar';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

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
      <InstructorNavbar />
      <main className="pb-20 md:pb-0">{children}</main>
      <MobileBottomNav />
    </div>
  );
}