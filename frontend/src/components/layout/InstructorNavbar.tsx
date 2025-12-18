'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Home,
  User,
  BookOpen,
  Users,
  DollarSign,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Waves,
  Tag
} from 'lucide-react';

export default function InstructorNavbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

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

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard/instructor',
      icon: Home,
      description: 'Panel principal'
    },
    {
      name: 'Mi Perfil',
      href: '/dashboard/instructor/profile',
      icon: User,
      description: 'Ver y editar perfil'
    },
    {
      name: 'Mis Clases',
      href: '/dashboard/instructor/classes',
      icon: BookOpen,
      description: 'Gestionar clases'
    },
    {
      name: 'Estudiantes',
      href: '/dashboard/instructor/students',
      icon: Users,
      description: 'Ver estudiantes'
    },
    {
      name: 'Ganancias',
      href: '/dashboard/instructor/earnings',
      icon: DollarSign,
      description: 'Ver ganancias'
    },
    {
      name: 'Descuentos',
      href: '/dashboard/instructor/discounts',
      icon: Tag,
      description: 'Códigos de descuento'
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard/instructor') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      // Cerrar el menú móvil primero para evitar problemas de UI
      setMobileMenuOpen(false);
      
      // Pequeña pausa para permitir que el menú se cierre
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Limpiar cookies del cliente
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
      
      // Limpiar storage
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.warn('Error clearing storage:', e);
      }
      
      await signOut({ 
        redirect: false 
      });
      
      // Usar window.location.href para redirección más robusta en móvil
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Incluso si hay error, intentar redirigir y limpiar
      try {
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });
      } catch (e) {
        console.warn('Error clearing cookies on error:', e);
      }
      window.location.href = '/login';
    } finally {
      setIsSigningOut(false);
    }
  };

  // Get initials from name
  const getInitials = (name?: string | null) => {
    if (!name) return 'I';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link href="/dashboard/instructor" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-linear-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Waves className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    clasesde.pe
                  </h1>
                  <p className="text-xs text-gray-500">Panel de Instructor</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-2">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${active
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <IconComponent className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'
                      }`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {/* Desktop User Info */}
              <div className="hidden lg:flex lg:items-center lg:space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500">Instructor</p>
                </div>

                {/* User Avatar */}
                <div className="relative group">
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-green-100 group-hover:ring-green-300 transition-all duration-200">
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
                      <div className="w-full h-full bg-linear-to-br from-green-400 to-emerald-400 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {getInitials(session?.user?.name)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
              </div>

              {/* Logout Button Desktop */}
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="hidden lg:flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                <span>{isSigningOut ? 'Cerrando...' : 'Salir'}</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-xl text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 transition-all duration-200"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-out Menu */}
      <div className={`lg:hidden fixed inset-0 z-100 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-50' : 'opacity-0'
            }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Slide-out Panel */}
        <div className={`absolute top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`} style={{
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)'
          }}>
          {/* Header */}
          <div className="bg-linear-to-r from-green-500 to-emerald-500 p-3 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-white">Menú</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors touch-manipulation"
                aria-label="Cerrar menú"
                style={{ touchAction: 'manipulation' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Profile in Menu */}
            <Link
              href="/dashboard/instructor/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-200"
            >
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/30">
                  {profilePhoto ? (
                    <ImageWithFallback
                      src={profilePhoto}
                      alt={session?.user?.name || 'User'}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                      fallbackSrc="/logoclasedesusrf.png"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/20 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">
                        {getInitials(session?.user?.name)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 border border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {session?.user?.name}
                </p>
                <p className="text-[10px] text-green-100 truncate">
                  {session?.user?.email}
                </p>
              </div>
              <ChevronRight className="w-3 h-3 text-white/60 shrink-0" />
            </Link>
          </div>

          {/* Navigation Links - Scrollable */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-1.5 space-y-0.5 no-scrollbar" style={{
            WebkitOverflowScrolling: 'touch'
          }}>
            {navigation.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${active
                      ? 'bg-linear-to-r from-green-50 to-emerald-50 text-green-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                    }`}
                  style={{ touchAction: 'manipulation' }}
                >
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <div className={`p-1 rounded-lg transition-all duration-200 flex-shrink-0 ${active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                      }`}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${active ? 'text-green-700' : 'text-gray-400 group-hover:translate-x-1'
                    }`} />
                </Link>
              );
            })}
          </div>

          {/* Logout Button */}
          <div className="p-2 border-t border-gray-200 bg-gray-50 shrink-0" style={{
            paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))'
          }}>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-semibold text-white bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{isSigningOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
