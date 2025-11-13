"use client";

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
  ChevronLeft,
  ChevronRight,
  Globe,
  Eye
} from 'lucide-react';

export function AdminSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminSidebarCollapsed') === 'true';
    }
    return false;
  });
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Save collapsed state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminSidebarCollapsed', String(isCollapsed));
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
    { name: 'Reports', href: '/dashboard/admin/reports', icon: FileText, description: 'Ver reportes' },
    { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings, description: 'Configuración' },
  ];

  const quickActions = [
    { name: 'View Public Site', href: '/', icon: Globe },
    { name: 'All Classes', href: '/classes', icon: Eye },
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
        callbackUrl: '/login',
        redirect: true 
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
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
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6 text-gray-700" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        id="admin-sidebar"
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-lg z-40
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        data-collapsed={isCollapsed}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {!isCollapsed && (
            <Link href="/dashboard/admin" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Waves className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  clasesde.pe
                </h1>
                <p className="text-xs text-purple-600 font-medium">Admin Panel</p>
              </div>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/dashboard/admin" className="flex items-center justify-center w-full">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
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

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {navigation.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    group flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${active
                      ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 shadow-sm'
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
                      {active && <div className="w-2 h-2 bg-purple-500 rounded-full"></div>}
                    </>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Actions Section */}
          {!isCollapsed && (
            <div className="px-2 mt-4 pt-4 border-t border-gray-200">
              <p className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Quick Actions</p>
              <div className="space-y-1">
                {quickActions.map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <Link
                      key={action.name}
                      href={action.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ActionIcon className="w-4 h-4 mr-3" />
                      <span>{action.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-200 p-4">
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className={`
                w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? (session?.user?.name ?? undefined) : ''}
            >
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-200">
                  {profilePhoto ? (
                    <Image
                      src={profilePhoto}
                      alt={session?.user?.name || 'Admin'}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-sm">
                        {getInitials(session?.user?.name)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-purple-600 truncate">
                    Administrator
                  </p>
                </div>
              )}
              {!isCollapsed && (
                <ChevronRight 
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-90' : ''}`} 
                />
              )}
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && !isCollapsed && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  <Link
                    href="/dashboard/admin/profile"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Users className="w-4 h-4 mr-3" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/dashboard/admin/account"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    <span>Account Settings</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

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

