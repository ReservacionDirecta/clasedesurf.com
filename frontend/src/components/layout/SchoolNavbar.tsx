"use client";

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function SchoolNavbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard/school', icon: '🏠' },
    { name: 'Clases', href: '/dashboard/school/classes', icon: '🏄' },
    { name: 'Instructores', href: '/dashboard/school/instructors', icon: '👨‍🏫' },
    { name: 'Estudiantes', href: '/dashboard/school/students', icon: '👥' },
    { name: 'Reservas', href: '/dashboard/school/reservations', icon: '📅' },
    { name: 'Pagos', href: '/dashboard/school/payments', icon: '💰' },
    { name: 'Calendario', href: '/dashboard/school/calendar', icon: '📆' },
    { name: 'Perfil', href: '/dashboard/school/profile', icon: '🏫' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard/school') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut({ 
        callbackUrl: '/login',
        redirect: true 
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setIsSigningOut(false);
    }
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/dashboard/school" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">🏄</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">clasesde.pe</h1>
                <p className="text-xs text-gray-500">Panel de Administración</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 min-w-0">
            <div className="flex items-center gap-1 w-full overflow-x-auto no-scrollbar whitespace-nowrap">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  <span className="hidden lg:inline">{item.name}</span>
                  <span className="lg:hidden">{item.name.slice(0, 10)}{item.name.length > 10 ? '…' : ''}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* User Info */}
            <div className="hidden sm:flex sm:items-center sm:space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">Administrador de Escuela</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="hidden sm:flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {isSigningOut ? 'Cerrando...' : 'Salir'}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Abrir menú</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
          
          {/* Mobile User Info */}
          <div className="border-t border-gray-200 px-4 py-3">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">{session?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {isSigningOut ? 'Cerrando...' : 'Cerrar Sesión'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}