"use client";

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  Home,
  BarChart3,
  Users,
  School,
  Waves,
  Calendar,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Globe,
  Eye,
  Tag,
  Bell
} from 'lucide-react';

import { notificationService } from '@/services/notificationService';

export function AdminNavbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Load unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (session?.user) {
        try {
          const count = await notificationService.getUnreadCount();
          setUnreadCount(count);
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      }
    };

    fetchUnreadCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [session, pathname]);

  // Load profile photo
  useEffect(() => {
    const loadProfile = async () => {
      if (!session) return;
// ... existing loadProfile logic

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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileDropdownOpen]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard/admin', icon: Home, description: 'Panel principal' },
    { name: 'Notificaciones', href: '/dashboard/admin/notifications', icon: Bell, description: 'Historial de notificaciones' },
    { name: 'Overview', href: '/dashboard/admin/overview', icon: BarChart3, description: 'Vista general' },
    { name: 'Users', href: '/dashboard/admin/users', icon: Users, description: 'Gestionar usuarios' },
    { name: 'Schools', href: '/dashboard/admin/schools', icon: School, description: 'Gestionar escuelas' },
    { name: 'Classes', href: '/dashboard/admin/classes', icon: Waves, description: 'Gestionar clases' },
    { name: 'Reservations', href: '/dashboard/admin/reservations', icon: Calendar, description: 'Ver reservas' },
    { name: 'Payments', href: '/dashboard/admin/payments', icon: CreditCard, description: 'Ver pagos' },
    { name: 'Descuentos', href: '/dashboard/admin/discounts', icon: Tag, description: 'Códigos de descuento' },
    { name: 'Reports', href: '/dashboard/admin/reports', icon: FileText, description: 'Ver reportes' },
    { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings, description: 'Configuración' },
  ];

  const quickActions = [
    { name: 'View Public Site', href: '/', icon: Globe },
    { name: 'All Classes', href: '/classes', icon: Eye },
  ];

  const profileMenuItems = [
    { name: 'My Profile', href: '/dashboard/admin/profile', icon: Users, description: 'View and edit your profile' },
    { name: 'Account Settings', href: '/dashboard/admin/account', icon: Settings, description: 'Manage account preferences' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard/admin') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      // Cerrar el menú móvil primero para evitar problemas de UI
      setMobileMenuOpen(false);
      setProfileDropdownOpen(false);
      
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
      <header className="bg-[#011627]/95 backdrop-blur-sm shadow-lg sticky top-0 z-60 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <Link href="/dashboard/admin" className="flex items-center">
              <div className="w-10 h-10 flex items-center justify-center overflow-auto">
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

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2 flex-1 justify-center">
              {navigation.slice(0, 5).map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.href);
                const isNotificationItem = item.href === '/dashboard/admin/notifications';

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap relative ${active
                      ? 'text-[#FF3366] bg-white/10'
                      : 'text-[#F6F7F8]/80 hover:text-[#FF3366] transition-colors'
                      }`}
                  >
                    <div className="relative">
                      <IconComponent className="w-4 h-4 flex-shrink-0" />
                      {isNotificationItem && unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1 border border-[#011627]">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
              {navigation.length > 5 && (
                <div className="relative group">
                  <button className="flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap text-[#F6F7F8]/80 hover:text-[#FF3366] transition-colors">
                    <span className="text-sm font-medium">Más</span>
                    <ChevronRight className="w-3 h-3 transition-transform duration-200 group-hover:rotate-90" />
                  </button>
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-100 min-w-[200px] py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                    {navigation.slice(5).map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center space-x-3 px-4 py-3 transition-all duration-200 text-gray-700 hover:bg-gray-50"
                        >
                          <IconComponent className="w-4 h-4" />
                          <span className="font-medium text-sm">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </nav>

            {/* Desktop User Info & Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <span className="text-sm text-[#F6F7F8]/80 truncate max-w-[200px]">
                {session?.user?.email}
              </span>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="inline-flex items-center justify-center font-bold transition-all duration-200 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none touch-target btn-outline-marketplace h-10 px-4 text-sm min-h-[40px] !bg-transparent !text-white !border-white/30 hover:!text-[#011627] hover:!bg-white/10 focus:!bg-white/10"
              >
                Cerrar sesión
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              className="lg:hidden p-2 rounded-lg text-[#F6F7F8] hover:text-[#FF3366] hover:bg-white/10 transition-all duration-200 active:scale-95"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`lg:hidden fixed inset-0 z-100 transition-all duration-300 ${
        mobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
      }`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 z-0"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div className={`absolute top-0 right-0 bottom-0 w-[280px] bg-[#011627] border-l border-white/10 shadow-2xl transition-transform duration-300 flex flex-col z-10 ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
            <span className="text-white font-bold text-lg">Menú</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg text-[#F6F7F8] hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Scrollable Navigation */}
          <div className="flex-1 overflow-y-auto overscroll-contain py-2 px-3 space-y-1 scrollbar-hide" style={{
            WebkitOverflowScrolling: 'touch'
          }}>
            {navigation.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.href);
              const isNotificationItem = item.href === '/dashboard/admin/notifications';

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-[#FF3366]/10 text-[#FF3366]'
                      : 'text-[#F6F7F8]/80 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${active ? 'text-[#FF3366]' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.name}</span>
                  {isNotificationItem && unreadCount > 0 && (
                     <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                       {unreadCount > 9 ? '9+' : unreadCount}
                     </span>
                  )}
                  {active && !isNotificationItem && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </div>

          {/* User Profile & Logout - Fixed Bottom */}
          <div className="p-4 border-t border-white/10 bg-[#011627] flex-shrink-0 space-y-4" style={{
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 20px))'
          }}>
            {/* User Info */}
            <div className="flex items-center space-x-3 px-3 py-2 bg-white/5 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#FF3366] to-[#FF3366]/60 flex items-center justify-center text-white font-bold shadow-lg">
                {getInitials(session?.user?.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {session?.user?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 border border-white/10 active:scale-95"
            >
              <LogOut className="w-5 h-5" />
              <span>{isSigningOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}
