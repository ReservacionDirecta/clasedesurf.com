"use client";

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
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
  Tag
} from 'lucide-react';

export function AdminNavbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

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
      <header className="bg-[#011627]/95 backdrop-blur-sm shadow-lg sticky top-0 z-[60] border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <Link href="/dashboard/admin" className="flex items-center">
              <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                <Image
                  src="/logoclasedesusrf.png"
                  alt="clasesde.pe"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2 flex-1 justify-center">
              {navigation.slice(0, 5).map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${active
                      ? 'text-[#FF3366] bg-white/10'
                      : 'text-[#F6F7F8]/80 hover:text-[#FF3366] transition-colors'
                      }`}
                  >
                    <IconComponent className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
              {navigation.length > 5 && (
                <div className="relative">
                  <button className="flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap text-[#F6F7F8]/80 hover:text-[#FF3366] transition-colors">
                    <span className="text-sm font-medium">Más</span>
                    <ChevronRight className="w-3 h-3 transition-transform duration-200" />
                  </button>
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
      <div className={`lg:hidden fixed inset-0 z-[100] transition-all duration-300 ${
        mobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
      }`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div className={`absolute top-0 right-0 bottom-0 w-[280px] bg-[#011627] border-l border-white/10 shadow-2xl transition-transform duration-300 flex flex-col ${
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
          <div className="flex-1 overflow-y-auto overscroll-contain py-2 px-3 space-y-1" style={{
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
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-[#FF3366]/10 text-[#FF3366]'
                      : 'text-[#F6F7F8]/80 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${active ? 'text-[#FF3366]' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.name}</span>
                  {active && <ChevronRight className="w-4 h-4 ml-auto" />}
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF3366] to-[#FF3366]/60 flex items-center justify-center text-white font-bold shadow-lg">
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
