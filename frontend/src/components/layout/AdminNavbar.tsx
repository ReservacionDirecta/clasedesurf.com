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
  ChevronRight,
  Globe,
  Eye
} from 'lucide-react';

export function AdminNavbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
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
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link href="/dashboard/admin" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Waves className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    clasesde.pe
                  </h1>
                  <p className="text-xs text-purple-600 font-medium">Admin Panel</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-1 flex-1 justify-center max-w-4xl mx-4">
              <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
                {navigation.map((item) => {
                  const IconComponent = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 xl:px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        active
                          ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border border-purple-200 shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <IconComponent className={`w-4 h-4 mr-1 xl:mr-2 transition-transform duration-200 ${
                        active ? 'scale-110' : 'group-hover:scale-110'
                      }`} />
                      <span className="hidden xl:inline">{item.name}</span>
                      <span className="xl:hidden text-xs">{item.name.length > 8 ? item.name.substring(0, 6) + '...' : item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions & User Menu */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
              {/* Quick Actions Dropdown */}
              <div className="hidden xl:block relative group">
                <button className="flex items-center px-2 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Globe className="w-4 h-4 mr-1" />
                  <span className="hidden 2xl:inline">Quick Actions</span>
                  <ChevronRight className="ml-1 w-3 h-3 rotate-90" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    {quickActions.map((action) => {
                      const ActionIcon = action.icon;
                      return (
                        <Link
                          key={action.name}
                          href={action.href}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <ActionIcon className="w-4 h-4 mr-3" />
                          {action.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* User Profile Dropdown */}
              <div className="hidden md:block relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  <div className="text-right hidden lg:block">
                    <p className="text-xs xl:text-sm font-medium text-gray-900 truncate max-w-24 xl:max-w-none">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs text-purple-600 font-medium hidden xl:block">Platform Administrator</p>
                  </div>
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full overflow-hidden ring-2 ring-purple-200">
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
                        <span className="text-purple-600 font-semibold text-xs lg:text-sm">
                          {getInitials(session?.user?.name)}
                        </span>
                      </div>
                    )}
                  </div>
                  <ChevronRight 
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200">
                    {/* Profile Header */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-purple-200">
                          {profilePhoto ? (
                            <Image
                              src={profilePhoto}
                              alt={session?.user?.name || 'Admin'}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                              <span className="text-purple-600 font-semibold text-lg">
                                {getInitials(session?.user?.name)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{session?.user?.name}</p>
                          <p className="text-xs text-purple-600 truncate">{session?.user?.email}</p>
                          <div className="flex items-center mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                              Administrator
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Profile Menu Items */}
                    <div className="py-2">
                      {profileMenuItems.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-start px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <ItemIcon className="w-5 h-5 mr-3 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
                          </Link>
                        );
                      })}
                    </div>

                    {/* Logout Section */}
                    <div className="border-t border-gray-100 py-2">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleSignOut();
                        }}
                        disabled={isSigningOut}
                        className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <LogOut className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <p className="font-medium">{isSigningOut ? 'Cerrando...' : 'Sign Out'}</p>
                          <p className="text-xs text-red-500 mt-0.5">End your current session</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 transition-all duration-200"
              >
                <span className="sr-only">Open menu</span>
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-out Menu */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
        mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Slide-out Panel */}
        <div className={`absolute top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out overflow-y-auto ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 sticky top-0 z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Menú</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* User Profile in Menu */}
            <Link
              href="/dashboard/admin/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-200"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/30">
                  {profilePhoto ? (
                    <Image
                      src={profilePhoto}
                      alt={session?.user?.name || 'Admin'}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-white/20 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {getInitials(session?.user?.name)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-purple-100 truncate">
                  {session?.user?.email}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/60" />
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="p-4 space-y-2">
            {navigation.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg transition-all duration-200 ${
                      active 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${
                    active ? 'text-purple-700' : 'text-gray-400 group-hover:translate-x-1'
                  }`} />
                </Link>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="px-4 pb-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Quick Actions</p>
            <div className="space-y-2">
              {quickActions.map((action) => {
                const ActionIcon = action.icon;
                return (
                  <Link
                    key={action.name}
                    href={action.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 p-3 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ActionIcon className="w-5 h-5" />
                    <span>{action.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Logout Button */}
          <div className="sticky bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
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
