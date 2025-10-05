'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || !(session as any).user || (session as any).user.role !== 'ADMIN') {
      router.push('/denied');
      return;
    }

    // Fetch quick stats
    const fetchStats = async () => {
      try {
        const token = (session as any)?.backendToken;
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const [usersRes, schoolsRes, classesRes, reservationsRes] = await Promise.all([
          fetch('/api/users', { headers }),
          fetch('/api/schools', { headers }),
          fetch('/api/classes', { headers }),
          fetch('/api/reservations/all', { headers })
        ]);

        const [users, schools, classes, reservations] = await Promise.all([
          usersRes.ok ? usersRes.json() : [],
          schoolsRes.ok ? schoolsRes.json() : [],
          classesRes.ok ? classesRes.json() : [],
          reservationsRes.ok ? reservationsRes.json() : []
        ]);

        setStats({
          totalUsers: users.length || 0,
          totalSchools: schools.length || 0,
          totalClasses: classes.length || 0,
          totalReservations: reservations.length || 0,
          paidReservations: reservations.filter((r: any) => r.status === 'PAID').length || 0,
          pendingReservations: reservations.filter((r: any) => r.status === 'PENDING').length || 0,
          recentUsers: users.slice(-5) || [],
          recentReservations: reservations.slice(-5) || []
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [session, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session || !(session as any).user || (session as any).user.role !== 'ADMIN') {
    return null;
  }

  const managementOptions = [
    {
      title: 'Platform Overview',
      description: 'Quick metrics and recent activity',
      href: '/dashboard/admin/overview',
      icon: '📊',
      color: 'from-blue-500 to-blue-600',
      stats: `${stats.totalUsers} users, ${stats.totalSchools} schools`
    },
    {
      title: 'Manage Users',
      description: 'View and manage all platform users',
      href: '/dashboard/admin/users',
      icon: '👥',
      color: 'from-green-500 to-green-600',
      stats: `${stats.totalUsers} total users`
    },
    {
      title: 'Manage Schools',
      description: 'Add and manage surf schools',
      href: '/dashboard/admin/schools',
      icon: '🏫',
      color: 'from-purple-500 to-purple-600',
      stats: `${stats.totalSchools} active schools`
    },
    {
      title: 'Manage Classes',
      description: 'Create, view, and manage surf classes',
      href: '/dashboard/admin/classes',
      icon: '🏄',
      color: 'from-cyan-500 to-cyan-600',
      stats: `${stats.totalClasses} total classes`
    },
    {
      title: 'View Reservations',
      description: 'Monitor and manage all bookings',
      href: '/dashboard/admin/reservations',
      icon: '📅',
      color: 'from-orange-500 to-orange-600',
      stats: `${stats.totalReservations} reservations`
    },
    {
      title: 'Payment Management',
      description: 'Register and manage payments',
      href: '/dashboard/admin/payments',
      icon: '💳',
      color: 'from-emerald-500 to-emerald-600',
      stats: `${stats.paidReservations} paid`
    },
    {
      title: 'Reports & Analytics',
      description: 'Access sales and class statistics',
      href: '/dashboard/admin/reports',
      icon: '📈',
      color: 'from-indigo-500 to-indigo-600',
      stats: 'Detailed insights'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Breadcrumbs />
      
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {(session as any).user?.name}! 👋
              </h1>
              <p className="text-purple-100 text-lg">
                Platform Administrator Dashboard
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <div className="text-2xl font-bold">{new Date().toLocaleDateString()}</div>
                <div className="text-purple-200">Today</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Schools</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSchools}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏫</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalClasses}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏄</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reservations</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalReservations}</p>
              <p className="text-sm text-green-600">{stats.paidReservations} paid</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Management Options */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Management Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managementOptions.map((option, index) => (
            <Link
              key={index}
              href={option.href}
              className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${option.color} rounded-lg flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform duration-200`}>
                  {option.icon}
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                {option.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3">{option.description}</p>
              <p className="text-xs font-medium text-purple-600">{option.stats}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
            <Link href="/dashboard/admin/users" className="text-sm text-purple-600 hover:text-purple-700">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentUsers?.slice(0, 5).map((user: any) => (
              <div key={user.id} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Reservations</h3>
            <Link href="/dashboard/admin/reservations" className="text-sm text-purple-600 hover:text-purple-700">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentReservations?.slice(0, 5).map((reservation: any) => (
              <div key={reservation.id} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    #{reservation.id} - {reservation.user?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {reservation.class?.title || 'Unknown Class'}
                  </p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  reservation.status === 'PAID' ? 'bg-green-100 text-green-800' :
                  reservation.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                  reservation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {reservation.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
