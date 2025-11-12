"use client";

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export function AdminNavbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

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
    { name: 'Dashboard', href: '/dashboard/admin', icon: '🏠' },
    { name: 'Overview', href: '/dashboard/admin/overview', icon: '📊' },
    { name: 'Users', href: '/dashboard/admin/users', icon: '👥' },
    { name: 'Schools', href: '/dashboard/admin/schools', icon: '🏫' },
    { name: 'Classes', href: '/dashboard/admin/classes', icon: '🏄' },
    { name: 'Reservations', href: '/dashboard/admin/reservations', icon: '📅' },
    { name: 'Payments', href: '/dashboard/admin/payments', icon: '💳' },
    { name: 'Reports', href: '/dashboard/admin/reports', icon: '📈' },
    { name: 'Logs', href: '/dashboard/admin/logs', icon: '📋' },
    { name: 'Settings', href: '/dashboard/admin/settings', icon: '⚙️' },
  ];

  const quickActions = [
    { name: 'View Public Site', href: '/', icon: '🌐' },
    { name: 'All Classes', href: '/classes', icon: '🌊' },
  ];

  const profileMenuItems = [
    { name: 'My Profile', href: '/dashboard/admin/profile', icon: '👤', description: 'View and edit your profile' },
    { name: 'Account Settings', href: '/dashboard/admin/account', icon: '⚙️', description: 'Manage account preferences' },
    { name: 'Security', href: '/dashboard/admin/security', icon: '🔒', description: 'Password and security settings' },
    { name: 'Notifications', href: '/dashboard/admin/notifications', icon: '🔔', description: 'Notification preferences' },
    { name: 'Activity Log', href: '/dashboard/admin/my-activity', icon: '📋', description: 'View your recent activity' },
    { name: 'Help & Support', href: '/dashboard/admin/help', icon: '❓', description: 'Get help and support' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard/admin') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const [isSigningOut, setIsSigningOut] = useState(false);

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
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
      <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/dashboard/admin" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">🏄</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">clasesde.pe</h1>
                <p className="text-xs text-purple-600 font-medium">Admin Panel</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1 flex-1 justify-center max-w-4xl mx-4">
            <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-2 xl:px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive(item.href)
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-1 xl:mr-2 text-sm">{item.icon}</span>
                  <span className="hidden xl:inline">{item.name}</span>
                  <span className="xl:hidden text-xs">{item.name.length > 8 ? item.name.substring(0, 6) + '...' : item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Actions & User Menu */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
            {/* Quick Actions Dropdown */}
            <div className="hidden xl:block relative group">
              <button className="flex items-center px-2 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="mr-1">⚡</span>
                <span className="hidden 2xl:inline">Quick Actions</span>
                <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  {quickActions.map((action) => (
                    <Link
                      key={action.name}
                      href={action.href}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <span className="mr-3">{action.icon}</span>
                      {action.name}
                    </Link>
                  ))}
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
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center border-2 border-purple-200">
                  <span className="text-purple-600 font-semibold text-xs lg:text-sm">
                    {session?.user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <svg 
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200">
                  {/* Profile Header */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center border-2 border-purple-200">
                        <span className="text-purple-600 font-semibold text-lg">
                          {session?.user?.name?.charAt(0).toUpperCase()}
                        </span>
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
                    {profileMenuItems.map((item, index) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-start px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg mr-3 mt-0.5">{item.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
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
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
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
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              <span className="sr-only">Open menu</span>
              {mobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex flex-col items-center px-2 py-3 rounded-lg text-xs font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="text-lg mb-1">{item.icon}</span>
                  <span className="text-center leading-tight">{item.name}</span>
                </Link>
              ))}
            </div>
            
            {/* Mobile Quick Actions */}
            <div className="border-t border-gray-200 pt-3 mt-3">
              <p className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Quick Actions</p>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    href={action.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col items-center px-2 py-3 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <span className="text-lg mb-1">{action.icon}</span>
                    <span className="text-center leading-tight">{action.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {/* Mobile User Info */}
          <div className="border-t border-gray-200 bg-gray-50">
            {/* Profile Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center border-2 border-purple-200">
                  <span className="text-purple-600 font-semibold text-lg">
                    {session?.user?.name?.charAt(0).toUpperCase()}
                  </span>
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

            {/* Mobile Profile Menu */}
            <div className="px-4 py-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Profile & Settings</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {profileMenuItems.slice(0, 4).map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col items-center px-2 py-3 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-lg mb-1">{item.icon}</span>
                    <span className="text-center leading-tight">{item.name}</span>
                  </Link>
                ))}
              </div>
              
              {/* Additional Profile Options */}
              <div className="space-y-1 mb-3">
                {profileMenuItems.slice(4).map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-base mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>

              {/* Mobile Logout */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                disabled={isSigningOut}
                className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {isSigningOut ? 'Cerrando...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </nav>
  );
}