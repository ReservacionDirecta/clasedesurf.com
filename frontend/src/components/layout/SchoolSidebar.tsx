"use client";

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Home,
  Waves,
  Users,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
  GraduationCap,
  ChevronLeft,
  Tag,
  Package
} from 'lucide-react';

export function SchoolSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('schoolSidebarCollapsed') === 'true';
    }
    return false;
  });
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Save collapsed state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('schoolSidebarCollapsed', String(isCollapsed));
    }
  }, [isCollapsed]);

  // Load profile photo
  useEffect(() => {
    const loadProfile = async () => {
      if (!session) return;

      try {
        const token = (session as any)?.backendToken;
        const res = await fetch('/api/users/profile', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (res.ok) {
          const data = await res.json();
          setProfilePhoto(data.profilePhoto || null);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, [session]);


  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard/school',
      icon: Home,
      description: 'Panel principal'
    },
    {
      name: 'Clases',
      href: '/dashboard/school/classes',
      icon: Waves,
      description: 'Gestionar clases'
    },
    {
      name: 'Instructores',
      href: '/dashboard/school/instructors',
      icon: GraduationCap,
      description: 'Gestionar instructores'
    },
    {
      name: 'Estudiantes',
      href: '/dashboard/school/students',
      icon: Users,
      description: 'Ver estudiantes'
    },
    {
      name: 'Reservas',
      href: '/dashboard/school/reservations',
      icon: Calendar,
      description: 'Gestionar reservas'
    },
    {
      name: 'Pagos',
      href: '/dashboard/school/payments',
      icon: CreditCard,
      description: 'Ver pagos'
    },
    {
      name: 'Descuentos',
      href: '/dashboard/school/discounts',
      icon: Tag,
      description: 'Códigos de descuento'
    },
    {
      name: 'Inventario',
      href: '/dashboard/school/inventory',
      icon: Package,
      description: 'Gestionar productos sugeridos'
    },
    {
      name: 'Perfil',
      href: '/dashboard/school/profile',
      icon: Settings,
      description: 'Configuración'
    },
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
        redirect: false
      });
      // Redirección manual para evitar problemas con NEXTAUTH_URL
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setIsSigningOut(false);
      // Intentar redirección manual incluso si hay error
      router.push('/login');
    }
  };

  // Get initials from name
  const getInitials = (name?: string | null) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Sidebar - Solo visible en desktop (lg y superior) */}
      <aside
        id="school-sidebar"
        className={`
          hidden lg:flex lg:flex-col fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-lg z-40
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
        data-collapsed={isCollapsed}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
          {!isCollapsed && (
            <Link href="/dashboard/school" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Waves className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  clasesde.pe
                </h1>
                <p className="text-xs text-gray-500">Panel Admin</p>
              </div>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/dashboard/school" className="flex items-center justify-center w-full">
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <Waves className="w-6 h-6 text-white" />
              </div>
            </Link>
          )}

          {/* Collapse Button - Desktop Only */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto py-4 min-h-0">
          <div className="space-y-1 px-2">
            {navigation.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${active
                      ? 'bg-linear-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? item.name : ''}
                >
                  <IconComponent className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'
                    } ${isCollapsed ? '' : 'mr-3'}`} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {active && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-200 p-4 shrink-0">
          <Link
            href="/dashboard/school/profile"
            className={`
              flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? (session?.user?.name ?? undefined) : ''}
          >
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-blue-100">
                {profilePhoto ? (
                  <ImageWithFallback
                    src={profilePhoto}
                    alt={session?.user?.name || 'User'}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    fallbackSrc="/logoclasedesusrf.png"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-blue-400 to-indigo-400 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {getInitials(session?.user?.name)}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Administrador
                </p>
              </div>
            )}
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className={`
              w-full mt-3 flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Cerrar Sesión' : ''}
          >
            <LogOut className={`w-5 h-5 ${isCollapsed ? '' : 'mr-2'}`} />
            {!isCollapsed && (
              <span>{isSigningOut ? 'Cerrando...' : 'Cerrar Sesión'}</span>
            )}
          </button>
        </div>
      </aside>

    </>
  );
}

