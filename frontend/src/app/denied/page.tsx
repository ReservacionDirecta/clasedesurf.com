"use client";

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DeniedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (status !== 'loading' && !session) {
      router.push('/login');
    }
  }, [session, status, router]);

  const getDashboardLink = () => {
    if (!session?.user?.role) return '/dashboard/student/profile';
    
    switch (session.user.role) {
      case 'ADMIN':
        return '/dashboard/admin';
      case 'SCHOOL_ADMIN':
        return '/dashboard/school';
      case 'INSTRUCTOR':
        return '/dashboard/instructor';
      case 'STUDENT':
      default:
        return '/dashboard/student/profile';
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <svg 
            className="w-16 h-16 text-red-500 mx-auto mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">
            No tienes permisos para acceder a esta página.
          </p>
        </div>

        {session && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Usuario:</strong> {session.user?.name || session.user?.email}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Rol:</strong> {session.user?.role || 'No definido'}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href={getDashboardLink()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors block"
          >
            Ir a Mi Dashboard
          </Link>
          
          <Link
            href="/classes"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors block"
          >
            Ver Clases Disponibles
          </Link>

          <Link
            href="/"
            className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 px-4 transition-colors block"
          >
            Volver al Inicio
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Si crees que esto es un error, contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}