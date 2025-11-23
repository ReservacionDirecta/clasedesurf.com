"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  School,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Waves,
  ArrowRight,
  Activity,
  BarChart3,
  PieChart,
  Eye
} from 'lucide-react';

export default function AdminOverviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [summary, setSummary] = useState<any>({ 
    classes: [], 
    reservations: [], 
    payments: [],
    users: [],
    schools: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('month');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !(session as any).user || (session as any).user.role !== 'ADMIN') {
      router.push('/denied');
      return;
    }

    fetchAll();
  }, [session, status, router, timeRange]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [classesRes, reservationsRes, paymentsRes, usersRes, schoolsRes] = await Promise.all([
        fetch('/api/classes', { headers }),
        fetch('/api/reservations/all', { headers }),
        fetch('/api/payments', { headers }),
        fetch('/api/users', { headers }).catch(() => ({ ok: false, json: async () => [] })),
        fetch('/api/schools', { headers }),
      ]);

      const [classesData, reservationsData, paymentsData, usersData, schoolsData] = await Promise.all([
        classesRes.ok ? classesRes.json().catch(() => []) : [],
        reservationsRes.ok ? reservationsRes.json().catch(() => []) : [],
        paymentsRes.ok ? paymentsRes.json().catch(() => []) : [],
        usersRes.ok ? usersRes.json().catch(() => []) : [],
        schoolsRes.ok ? schoolsRes.json().catch(() => []) : [],
      ]);

      // Asegurar que todos los datos sean arrays
      const safeArray = (data: any) => Array.isArray(data) ? data : [];
      
      setSummary({ 
        classes: safeArray(classesData), 
        reservations: safeArray(reservationsData), 
        payments: safeArray(paymentsData),
        users: safeArray(usersData),
        schools: safeArray(schoolsData)
      });
    } catch (err) {
      console.error('Error fetching overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    // Asegurar que todos los datos sean arrays
    const safeArray = (data: any) => Array.isArray(data) ? data : [];
    const reservations = safeArray(summary.reservations);
    const payments = safeArray(summary.payments);
    const classes = safeArray(summary.classes);
    const users = safeArray(summary.users);
    
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const filterByTimeRange = (date: string) => {
      const itemDate = new Date(date);
      switch (timeRange) {
        case 'today':
          return itemDate >= today;
        case 'week':
          return itemDate >= weekAgo;
        case 'month':
          return itemDate >= monthAgo;
        default:
          return true;
      }
    };

    const filteredReservations = reservations.filter((r: any) => 
      filterByTimeRange(r.createdAt || r.class?.date || new Date().toISOString())
    );

    const filteredPayments = payments.filter((p: any) => 
      filterByTimeRange(p.createdAt || new Date().toISOString())
    );

    const activeReservations = filteredReservations.filter((r: any) => 
      r.status !== 'CANCELED'
    );

    const paidReservations = filteredReservations.filter((r: any) => 
      r.payment?.status === 'PAID' || r.status === 'PAID'
    );

    const totalRevenue = filteredPayments
      .filter((p: any) => p.status === 'PAID')
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    const upcomingClasses = classes.filter((c: any) => {
      const classDate = new Date(c.date);
      return classDate >= today;
    });

    const completedClasses = classes.filter((c: any) => {
      const classDate = new Date(c.date);
      return classDate < today;
    });

    const totalStudents = new Set(
      activeReservations.map((r: any) => r.userId || r.user?.id)
    ).size;

    const averageClassOccupancy = classes.length > 0
      ? classes.reduce((sum: number, c: any) => {
          const enrolled = Array.isArray(c.reservations) 
            ? c.reservations.filter((r: any) => r.status !== 'CANCELED').length 
            : 0;
          const capacity = c.capacity || 1;
          return sum + (enrolled / capacity * 100);
        }, 0) / classes.length
      : 0;

    return {
      totalClasses: classes.length,
      upcomingClasses: upcomingClasses.length,
      completedClasses: completedClasses.length,
      totalReservations: filteredReservations.length,
      activeReservations: activeReservations.length,
      paidReservations: paidReservations.length,
      pendingReservations: filteredReservations.filter((r: any) => r.status === 'PENDING').length,
      canceledReservations: filteredReservations.filter((r: any) => r.status === 'CANCELED').length,
      totalRevenue,
      totalStudents,
      totalUsers: users.length,
      totalSchools: safeArray(summary.schools).length,
      averageOccupancy: averageClassOccupancy,
      conversionRate: filteredReservations.length > 0
        ? (paidReservations.length / filteredReservations.length) * 100
        : 0
    };
  };

  const stats = calculateStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'PAID': return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELED': return 'bg-red-100 text-red-800 border-red-300';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'CONFIRMED': 'Confirmada',
      'PAID': 'Pagada',
      'CANCELED': 'Cancelada',
      'COMPLETED': 'Completada'
    };
    return labels[status] || status;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando resumen...</p>
        </div>
      </div>
    );
  }

  // Asegurar que los datos sean arrays antes de usar métodos de array
  const safeArray = (data: any) => Array.isArray(data) ? data : [];
  const reservations = safeArray(summary.reservations);
  const classes = safeArray(summary.classes);
  
  const recentReservations = reservations
    .sort((a: any, b: any) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 10);

  const upcomingClasses = classes
    .filter((c: any) => new Date(c.date) >= new Date())
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8" style={{ paddingBottom: 'max(5rem, env(safe-area-inset-bottom))' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Resumen General</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Vista general de la plataforma</p>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="today">Hoy</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mes</option>
                <option value="all">Todo el Tiempo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 opacity-90" />
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 opacity-75" />
            </div>
            <h3 className="text-xs sm:text-sm font-medium opacity-90 mb-1">Ingresos Totales</h3>
            <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-xs opacity-75 mt-1">
              {stats.paidReservations} reservas pagadas
            </p>
          </div>

          {/* Total Classes */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Waves className="w-6 h-6 sm:w-8 sm:h-8 opacity-90" />
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 opacity-75" />
            </div>
            <h3 className="text-xs sm:text-sm font-medium opacity-90 mb-1">Total Clases</h3>
            <p className="text-2xl sm:text-3xl font-bold">{stats.totalClasses}</p>
            <p className="text-xs opacity-75 mt-1">
              {stats.upcomingClasses} próximas
            </p>
          </div>

          {/* Total Reservations */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 opacity-90" />
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 opacity-75" />
            </div>
            <h3 className="text-xs sm:text-sm font-medium opacity-90 mb-1">Reservas Activas</h3>
            <p className="text-2xl sm:text-3xl font-bold">{stats.activeReservations}</p>
            <p className="text-xs opacity-75 mt-1">
              {stats.totalStudents} estudiantes únicos
            </p>
          </div>

          {/* Conversion Rate */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 opacity-90" />
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 opacity-75" />
            </div>
            <h3 className="text-xs sm:text-sm font-medium opacity-90 mb-1">Tasa de Conversión</h3>
            <p className="text-2xl sm:text-3xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
            <p className="text-xs opacity-75 mt-1">
              Reservas pagadas
            </p>
          </div>
        </div>

        {/* Secondary Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-blue-400">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{stats.upcomingClasses}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Próximas</div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-green-400">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.completedClasses}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Completadas</div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-yellow-400">
            <div className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.pendingReservations}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Pendientes</div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-red-400">
            <div className="text-lg sm:text-2xl font-bold text-red-600">{stats.canceledReservations}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Canceladas</div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-indigo-400">
            <div className="text-lg sm:text-2xl font-bold text-indigo-600">{stats.totalUsers}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Usuarios</div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-cyan-400">
            <div className="text-lg sm:text-2xl font-bold text-cyan-600">{stats.totalSchools}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Escuelas</div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Reservations */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Reservas Recientes</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Últimas reservas registradas</p>
              </div>
              <Link
                href="/dashboard/admin/reservations"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
              >
                Ver todas
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
              {recentReservations.length > 0 ? (
                recentReservations.map((reservation: any) => (
                  <Link
                    key={reservation.id}
                    href={`/dashboard/admin/reservations?classId=${reservation.classId}`}
                    className="block p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                          <span className="text-sm sm:text-base font-semibold text-gray-900">
                            Reserva #{reservation.id}
                          </span>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(reservation.status)}`}>
                            {getStatusLabel(reservation.status)}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{reservation.user?.name || 'Usuario'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Waves className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{reservation.class?.title || 'Clase'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>{formatDate(reservation.class?.date || reservation.createdAt)}</span>
                          </div>
                          {reservation.payment && (
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span>{formatCurrency(reservation.payment.amount || 0)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-8 sm:p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm sm:text-base">No hay reservas recientes</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Classes & Quick Stats */}
          <div className="space-y-4 sm:space-y-6">
            {/* Upcoming Classes */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Próximas Clases</h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Clases programadas</p>
                </div>
                <Link
                  href="/dashboard/admin/classes"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                >
                  Ver todas
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
                {upcomingClasses.length > 0 ? (
                  upcomingClasses.map((classItem: any) => {
                    const enrolled = classItem.reservations?.filter((r: any) => r.status !== 'CANCELED').length || 0;
                    const occupancy = classItem.capacity > 0 ? (enrolled / classItem.capacity) * 100 : 0;
                    
                    return (
                      <Link
                        key={classItem.id}
                        href={`/dashboard/admin/classes`}
                        className="block p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1">
                            {classItem.title}
                          </h3>
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>{formatDate(classItem.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-3 h-3 flex-shrink-0" />
                            <span>{enrolled}/{classItem.capacity} estudiantes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <School className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{classItem.school?.name || 'Escuela'}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">Ocupación</span>
                            <span className="font-medium">{occupancy.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                occupancy >= 80 ? 'bg-green-500' :
                                occupancy >= 50 ? 'bg-yellow-500' :
                                'bg-blue-500'
                              }`}
                              style={{ width: `${Math.min(occupancy, 100)}%` }}
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="p-8 text-center">
                    <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">No hay clases próximas</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Estadísticas Rápidas</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <PieChart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Ocupación Promedio</p>
                      <p className="text-lg font-bold text-gray-900">{stats.averageOccupancy.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Reservas Pagadas</p>
                      <p className="text-lg font-bold text-gray-900">{stats.paidReservations}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Estudiantes Activos</p>
                      <p className="text-lg font-bold text-gray-900">{stats.totalStudents}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
