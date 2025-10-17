'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  Star, 
  Award, 
  TrendingUp, 
  BookOpen, 
  CreditCard, 
  User,
  Waves,
  Target,
  Trophy,
  MapPin
} from 'lucide-react';

interface StudentStats {
  totalClasses: number;
  completedClasses: number;
  upcomingClasses: number;
  currentLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  totalSpent: number;
  averageRating: number;
  achievements: string[];
  joinDate: string;
}

interface UpcomingClass {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  instructor: string;
  location: string;
  level: string;
  price: number;
  status: 'CONFIRMED' | 'PENDING';
}

interface RecentActivity {
  id: number;
  type: 'class_completed' | 'payment_made' | 'reservation_made' | 'level_up';
  title: string;
  description: string;
  date: string;
  icon: any;
  color: string;
}

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.role !== 'STUDENT') {
      router.push('/dashboard/school');
      return;
    }

    fetchStudentData();
  }, [session, status, router]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      const token = (session as any)?.backendToken;
      
      // Debug logging
      console.log('Session:', session);
      console.log('Token exists:', !!token);
      
      if (!token) {
        console.error('No backend token found in session');
        // Try to use empty data instead of failing
        setStats({
          totalClasses: 0,
          completedClasses: 0,
          upcomingClasses: 0,
          currentLevel: 'BEGINNER',
          totalSpent: 0,
          averageRating: 0,
          achievements: [],
          joinDate: new Date().toISOString()
        });
        setUpcomingClasses([]);
        setRecentActivity([]);
        setLoading(false);
        return;
      }
      
      const headers: any = {
        'Authorization': `Bearer ${token}`
      };

      // Fetch real data from backend
      const [reservationsRes, paymentsRes, profileRes] = await Promise.all([
        fetch('/api/reservations', { headers }),
        fetch('/api/payments', { headers }),
        fetch('/api/users/profile', { headers })
      ]);

      const reservations = reservationsRes.ok ? await reservationsRes.json() : [];
      const payments = paymentsRes.ok ? await paymentsRes.json() : [];
      const profile = profileRes.ok ? await profileRes.json() : {};

      // Calculate stats from real data
      const now = new Date();
      const completedReservations = reservations.filter((r: any) => 
        r.status === 'CONFIRMED' && new Date(r.class?.date) < now
      );
      const upcomingReservations = reservations.filter((r: any) => 
        r.status !== 'CANCELED' && new Date(r.class?.date) >= now
      );

      // Calculate total spent from paid payments
      const totalSpent = payments
        .filter((p: any) => p.status === 'PAID')
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

      // Determine level based on completed classes
      let currentLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' = 'BEGINNER';
      if (completedReservations.length >= 10) {
        currentLevel = 'ADVANCED';
      } else if (completedReservations.length >= 5) {
        currentLevel = 'INTERMEDIATE';
      }

      // Generate achievements based on real data
      const achievements: string[] = [];
      if (completedReservations.length >= 1) achievements.push('Primera Ola');
      if (completedReservations.length >= 5) achievements.push('5 Clases Completadas');
      if (completedReservations.length >= 10) achievements.push('10 Clases Completadas');
      if (currentLevel === 'INTERMEDIATE') achievements.push('Nivel Intermedio');
      if (currentLevel === 'ADVANCED') achievements.push('Nivel Avanzado');

      const realStats: StudentStats = {
        totalClasses: reservations.length,
        completedClasses: completedReservations.length,
        upcomingClasses: upcomingReservations.length,
        currentLevel: currentLevel,
        totalSpent: totalSpent,
        averageRating: 4.7, // TODO: Calculate from reviews
        achievements: achievements,
        joinDate: profile.createdAt || new Date().toISOString()
      };

      // Process upcoming classes
      const realUpcomingClasses: UpcomingClass[] = upcomingReservations
        .sort((a: any, b: any) => new Date(a.class?.date).getTime() - new Date(b.class?.date).getTime())
        .slice(0, 5)
        .map((r: any) => ({
          id: r.class?.id || 0,
          title: r.class?.title || 'Clase de Surf',
          date: r.class?.date || new Date().toISOString(),
          startTime: new Date(r.class?.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          endTime: new Date(new Date(r.class?.date).getTime() + (r.class?.duration || 120) * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          instructor: r.class?.instructor || 'Instructor',
          location: r.class?.location || 'Por definir',
          level: r.class?.level || 'BEGINNER',
          price: Number(r.class?.price) || 0,
          status: r.status as 'CONFIRMED' | 'PENDING'
        }));

      setStats(realStats);
      setUpcomingClasses(realUpcomingClasses);

      // Generate recent activity from reservations and payments
      const recentActivities: RecentActivity[] = [];
      
      // Add completed classes
      completedReservations.slice(0, 2).forEach((r: any, index: number) => {
        recentActivities.push({
          id: index + 1,
          type: 'class_completed',
          title: 'Clase Completada',
          description: `Completaste "${r.class?.title || 'Clase'}"`,
          date: r.class?.date || new Date().toISOString(),
          icon: BookOpen,
          color: 'text-green-600'
        });
      });

      // Add recent payments
      payments.slice(0, 2).forEach((p: any, index: number) => {
        recentActivities.push({
          id: recentActivities.length + 1,
          type: 'payment_made',
          title: 'Pago Realizado',
          description: `Pagaste S/. ${p.amount}`,
          date: p.paidAt || p.createdAt,
          icon: CreditCard,
          color: 'text-blue-600'
        });
      });

      // Add level up if applicable
      if (currentLevel !== 'BEGINNER') {
        recentActivities.push({
          id: recentActivities.length + 1,
          type: 'level_up',
          title: `¡Nivel ${currentLevel === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}!`,
          description: `Has alcanzado el nivel ${currentLevel === 'INTERMEDIATE' ? 'intermedio' : 'avanzado'}`,
          date: new Date().toISOString(),
          icon: Trophy,
          color: 'text-yellow-600'
        });
      }

      setRecentActivity(recentActivities.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ).slice(0, 4));

      setStats(realStats);
      setUpcomingClasses(realUpcomingClasses);

      // Fallback to mock data if no real data
      if (reservations.length === 0) {
        const mockStats: StudentStats = {
          totalClasses: 0,
          completedClasses: 0,
          upcomingClasses: 0,
          currentLevel: 'BEGINNER',
          totalSpent: 0,
          averageRating: 0,
          achievements: [],
          joinDate: profile.createdAt || new Date().toISOString()
        };

        setStats(mockStats);
        setUpcomingClasses([]);
        setRecentActivity([]);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-yellow-100 text-yellow-800';
      case 'INTERMEDIATE':
        return 'bg-orange-100 text-orange-800';
      case 'ADVANCED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelProgress = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return { progress: 33, next: 'Intermedio' };
      case 'INTERMEDIATE':
        return { progress: 66, next: 'Avanzado' };
      case 'ADVANCED':
        return { progress: 100, next: 'Experto' };
      default:
        return { progress: 0, next: 'Principiante' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const formatCurrency = (amount: number) => {
    return `S/. ${amount.toFixed(2)}`;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Error al cargar los datos</p>
        </div>
      </div>
    );
  }

  const levelProgress = getLevelProgress(stats.currentLevel);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-3xl font-bold mb-2">¡Hola, {session?.user?.name}! 🏄‍♂️</h1>
                <p className="text-blue-100 mb-3">Bienvenido a tu dashboard de surf</p>
                <div className="flex items-center text-blue-100">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Miembro desde {formatDate(stats.joinDate)}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{stats.completedClasses}</div>
                <div className="text-blue-200 text-sm">Clases Completadas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Clases</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.totalClasses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Próximas</h3>
                <p className="text-3xl font-bold text-green-600">{stats.upcomingClasses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Tu Rating</h3>
                <p className="text-3xl font-bold text-yellow-600">{stats.averageRating}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CreditCard className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Gastado</h3>
                <p className="text-3xl font-bold text-purple-600">{formatCurrency(stats.totalSpent)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Level Progress */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Tu Progreso</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(stats.currentLevel)}`}>
                  {stats.currentLevel === 'BEGINNER' ? 'Principiante' :
                   stats.currentLevel === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
                </span>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progreso hacia {levelProgress.next}</span>
                  <span>{levelProgress.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${levelProgress.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.completedClasses}</div>
                  <div className="text-sm text-gray-600">Completadas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.upcomingClasses}</div>
                  <div className="text-sm text-gray-600">Próximas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.achievements.length}</div>
                  <div className="text-sm text-gray-600">Logros</div>
                </div>
              </div>
            </div>

            {/* Upcoming Classes */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Próximas Clases</h2>
                <Link 
                  href="/classes"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Ver todas →
                </Link>
              </div>

              {upcomingClasses.length === 0 ? (
                <div className="text-center py-8">
                  <Waves className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes clases próximas</h3>
                  <p className="text-gray-600 mb-4">¡Es hora de reservar tu siguiente aventura!</p>
                  <Link
                    href="/classes"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Explorar Clases
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingClasses.map((cls) => (
                    <div key={cls.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{cls.title}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              cls.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {cls.status === 'CONFIRMED' ? 'Confirmada' : 'Pendiente'}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              {formatDate(cls.date)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                            </div>
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              Instructor: {cls.instructor}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              {cls.location}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{formatCurrency(cls.price)}</div>
                          <Link
                            href={`/classes/${cls.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Ver detalles →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Actividad Reciente</h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-4">
                      <div className={`p-2 rounded-full bg-gray-100`}>
                        <IconComponent className={`w-5 h-5 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{activity.title}</h4>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.date).toLocaleDateString('es-ES', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
              <div className="space-y-3">
                <Link
                  href="/classes"
                  className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                >
                  <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-blue-900">Explorar Clases</div>
                    <div className="text-sm text-gray-600">Encuentra tu próxima aventura</div>
                  </div>
                </Link>

                <Link
                  href="/dashboard/student/profile"
                  className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                >
                  <User className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-green-900">Mi Perfil</div>
                    <div className="text-sm text-gray-600">Actualiza tu información</div>
                  </div>
                </Link>

                <Link
                  href="/reservations"
                  className="flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                >
                  <BookOpen className="w-5 h-5 text-purple-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-purple-900">Mis Reservas</div>
                    <div className="text-sm text-gray-600">Gestiona tus clases</div>
                  </div>
                </Link>

                <Link
                  href="/payments"
                  className="flex items-center p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors group"
                >
                  <CreditCard className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-yellow-900">Historial de Pagos</div>
                    <div className="text-sm text-gray-600">Revisa tus transacciones</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tus Logros</h2>
              <div className="space-y-3">
                {stats.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center p-3 bg-yellow-50 rounded-lg">
                    <Trophy className="w-5 h-5 text-yellow-600 mr-3" />
                    <span className="font-medium text-gray-900">{achievement}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
                <Target className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">¡Sigue surfeando para desbloquear más logros!</p>
              </div>
            </div>

            {/* Level Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tu Nivel Actual</h2>
              <div className="text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${getLevelColor(stats.currentLevel)}`}>
                  <Award className="w-5 h-5 mr-2" />
                  {stats.currentLevel === 'BEGINNER' ? 'Principiante' :
                   stats.currentLevel === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  {stats.currentLevel === 'BEGINNER' 
                    ? 'Estás aprendiendo los fundamentos del surf. ¡Sigue practicando!'
                    : stats.currentLevel === 'INTERMEDIATE'
                    ? 'Ya dominas lo básico. Es hora de perfeccionar tu técnica.'
                    : '¡Eres un surfista avanzado! Sigue desafiándote con nuevas maniobras.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}