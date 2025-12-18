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
  School,
  Mail,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export function PublicSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('publicSidebarCollapsed') === 'true';
    }
    return false;
  });
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Save collapsed state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('publicSidebarCollapsed', String(isCollapsed));
    }
  }, [isCollapsed]);

  // Load profile photo if user is logged in
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
      name: 'Inicio', 
      href: '/', 
      icon: Home,
      description: 'Página principal'
    },
    { 
      name: 'Clases', 
      href: '/classes', 
      icon: Waves,
      description: 'Explorar clases'
    },
    { 
      name: 'Escuelas', 
      href: '/schools', 
      icon: School,
      description: 'Ver escuelas'
    },
    { 
      name: 'Contacto', 
      href: '/contact', 
      icon: Mail,
      description: 'Contáctanos'
    },
  ];

  // Add dashboard link if user is logged in
  const getDashboardLink = () => {
    if (!session?.user?.role) return null;
    
    const role = session.user.role;
    switch (role) {
      case 'STUDENT':
        return { name: 'Dashboard', href: '/dashboard/student', icon: User, description: 'Mi panel' };
      case 'SCHOOL_ADMIN':
        return { name: 'Dashboard', href: '/dashboard/school', icon: School, description: 'Panel escuela' };
      case 'INSTRUCTOR':
        return { name: 'Dashboard', href: '/dashboard/instructor', icon: User, description: 'Panel instructor' };
      case 'ADMIN':
        return { name: 'Dashboard', href: '/dashboard/admin', icon: User, description: 'Panel admin' };
      default:
        return null;
    }
  };

  const dashboardLink = getDashboardLink();
  const allNavigation = dashboardLink ? [...navigation, dashboardLink] : navigation;

  const isActive = (href: string) => {
    if (href === '/') {
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
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setIsSigningOut(false);
      // Intentar redirección manual incluso si hay error
      router.push('/');
    }
  };

  // Get initials from name
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
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
        id="public-sidebar"
        className={`
          hidden lg:block fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-lg z-40
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
        data-collapsed={isCollapsed}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {!isCollapsed && (
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                <ImageWithFallback 
                  src="/logoclasedesusrf.png" 
                  alt="clasesde.pe" 
                  width={40} 
                  height={40} 
                  className="w-full h-full object-contain"
                  fallbackSrc="/logoclasedesusrf.png"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  clasesde.pe
                </h1>
                <p className="text-xs text-gray-500">Navegación</p>
              </div>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/" className="flex items-center justify-center w-full">
              <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                <ImageWithFallback 
                  src="/logoclasedesusrf.png" 
                  alt="clasesde.pe" 
                  width={40} 
                  height={40} 
                  className="w-full h-full object-contain"
                  fallbackSrc="/logoclasedesusrf.png"
                />
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

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {allNavigation.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${active
                      ? 'bg-linear-to-r from-blue-50 to-cyan-50 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? item.name : ''}
                >
                  <IconComponent className={`w-5 h-5 transition-transform duration-200 ${
                    active ? 'scale-110' : 'group-hover:scale-110'
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

        {/* User Section - Only if logged in */}
        {session && (
          <div className="border-t border-gray-200 p-4">
            <Link
              href={dashboardLink?.href || '/dashboard/student'}
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
                    <div className="w-full h-full bg-linear-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
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
                    {session?.user?.email}
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
        )}

        {/* Login/Register Section - Only if not logged in */}
        {!session && !isCollapsed && (
          <div className="border-t border-gray-200 p-4 space-y-2">
            <Link
              href="/login"
              className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 border border-gray-200"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl transition-all duration-200"
            >
              Registrarse
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

