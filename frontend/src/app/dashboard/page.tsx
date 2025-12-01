'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    // Redirect based on user role
    const role = (session as any)?.user?.role;
    switch (role) {
      case 'ADMIN':
        router.push('/dashboard/admin');
        break;
      case 'SCHOOL_ADMIN':
        router.push('/dashboard/school');
        break;
      case 'INSTRUCTOR':
        router.push('/dashboard/instructor');
        break;
      case 'STUDENT':
        router.push('/dashboard/student');
        break;
      default:
        router.push('/login');
    }
  }, [session, status, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
}

