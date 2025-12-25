'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import { formatDualCurrency } from '@/lib/currency';
import { AvatarDisplay } from '@/components/avatar/AvatarSelector';

interface StudentProfile {
  name: string;
  email: string;
  profilePhoto: string | null;
  avatar: string | null;
  age?: number;
  weight?: number;
  height?: number;
  canSwim: boolean;
  phone?: string;
}

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
  reservationId?: number;
  classId: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  instructor: string;
  location: string;
  level: string;
  price: number;
  status: 'CONFIRMED' | 'PENDING';
  schoolName?: string;
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
  const [profile, setProfile] = useState<StudentProfile | null>(null);
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
      const profileData = profileRes.ok ? await profileRes.json() : {};
      
      // Set profile with photo
      setProfile({
        name: profileData.name || session?.user?.name || 'Surfista',
        email: profileData.email || session?.user?.email || '',
        profilePhoto: profileData.profilePhoto || null,
        avatar: profileData.avatar || profileData.profilePhoto || null,
        age: profileData.age,
        weight: profileData.weight,
        height: profileData.height,
        canSwim: profileData.canSwim || false,
        phone: profileData.phone
      });

      // Calculate stats from real data
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Reset to start of day for comparison
      
      const completedReservations = reservations.filter((r: any) => {
        const dateStr = r.date || r.class?.date;
        if (!dateStr) return false;
        
        const classDate = new Date(dateStr);
        classDate.setHours(0, 0, 0, 0);
        return r.status === 'CONFIRMED' && classDate < now;
      });
      
      const upcomingReservations = reservations.filter((r: any) => {
        const dateStr = r.date || r.class?.date;
        if (!dateStr) return false;

        const classDate = new Date(dateStr);
        classDate.setHours(0, 0, 0, 0);
        // Show all non-canceled reservations that are either:
        // 1. Future dates, OR
        // 2. PENDING/CONFIRMED status (regardless of date - user might have just created it)
        return r.status !== 'CANCELED' && (classDate >= now || r.status === 'PENDING' || r.status === 'CONFIRMED');
      });
      
      console.log('[Dashboard] Total reservations:', reservations.length);
      console.log('[Dashboard] Upcoming reservations:', upcomingReservations.length);
      console.log('[Dashboard] Completed reservations:', completedReservations.length);

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
        joinDate: profileData.createdAt || new Date().toISOString()
      };

      // Process upcoming classes
      const realUpcomingClasses: UpcomingClass[] = upcomingReservations
        .filter((r: any) => r.class) // Filter out reservations without class data
        .sort((a: any, b: any) => {
          const dateAStr = a.date || a.class?.date;
          const dateBStr = b.date || b.class?.date;
          const dateA = dateAStr ? new Date(dateAStr).getTime() : 0;
          const dateB = dateBStr ? new Date(dateBStr).getTime() : 0;
          return dateA - dateB;
        })
        .slice(0, 5)
        .map((r: any) => {
          const dateStr = r.date || r.class?.date || new Date().toISOString();
          const classDate = new Date(dateStr);
          const duration = r.class?.duration || 120;
          
          let startTimeStr = '00:00';
          if (r.time) {
            startTimeStr = r.time.substring(0, 5);
          } else if (r.class?.date) {
             startTimeStr = new Date(r.class.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
          }
           
          const [hours, minutes] = startTimeStr.split(':').map(Number);
          const endDate = new Date();
          endDate.setHours(hours, minutes + duration);

          return {
            id: r.class?.id || 0, // Use class ID for linking to class page
            reservationId: r.id, // Keep reservation ID for reference
            classId: r.class?.id || 0, // Explicit class ID
            title: r.class?.title || 'Clase de Surf',
            date: dateStr,
            startTime: startTimeStr,
            endTime: endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }),
            instructor: r.class?.instructor?.name || r.class?.instructor || 'Instructor',
            location: r.class?.school?.location || r.class?.location || 'Por definir',
            level: r.class?.level || 'BEGINNER',
            price: Number(r.class?.price) || 0,
            status: r.status as 'CONFIRMED' | 'PENDING',
            schoolName: r.class?.school?.name || 'Escuela'
          };
        });
      
      console.log('[Dashboard] Processed upcoming classes:', realUpcomingClasses);

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
          joinDate: profileData.createdAt || new Date().toISOString()
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
        {/* Welcome Header with Profile */}
        <div className="mb-8">
          <div className="bg-linear-to-r from-blue-500 via-blue-600 to-cyan-600 rounded-2xl shadow-xl overflow-hidden">
            <div className="relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,50 Q25,40 50,50 T100,50 L100,100 L0,100 Z" fill="white" />
                </svg>
              </div>
              
              {/* Content */}
              <div className="relative p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  {/* Profile Photo */}
                  <div className="relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/20 backdrop-blur-sm p-1 shadow-xl">
                      <div className="w-full h-full rounded-full bg-white overflow-hidden">
                        {profile?.avatar ? (
                          <AvatarDisplay 
                            avatarId={profile.avatar} 
                            role="STUDENT" 
                            size="lg"
                            className="w-full h-full"
                          />
                        ) : profile?.name ? (
                          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-400 to-cyan-400">
                            <span className="text-3xl md:text-4xl font-bold text-white">
                              {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-400 to-cyan-400">
                            <User className="w-12 h-12 md:w-16 md:h-16 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Status Badge */}
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      Activo
                    </div>
                  </div>
                  
                  {/* Profile Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                      ¡Hola, {profile?.name?.split(' ')[0] || session?.user?.name}! 🏄‍♂️
                    </h1>
                    <p className="text-blue-100 text-lg mb-4">Bienvenido a tu centro de surf</p>
                    
                    {/* Quick Stats */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-blue-100">
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <Calendar className="w-4 h-4" />
                        <span>Desde {new Date(stats.joinDate).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}</span>
                      </div>
                      
                      {profile?.age && (
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <User className="w-4 h-4" />
                          <span>{profile.age} años</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <Waves className="w-4 h-4" />
                        <span>{profile?.canSwim ? 'Sabe nadar' : 'Aprendiendo'}</span>
                      </div>
                      
                      {profile?.weight && profile?.height && (
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <Target className="w-4 h-4" />
                          <span>{profile.weight}kg / {profile.height}cm</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Stats Highlight */}
                  <div className="flex md:flex-col gap-4 md:gap-6">
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 min-w-[120px]">
                      <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                        {stats.completedClasses}
                      </div>
                      <div className="text-blue-100 text-sm">Clases Completadas</div>
                    </div>
                    
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 min-w-[120px]">
                      <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                        {stats.upcomingClasses}
                      </div>
                      <div className="text-blue-100 text-sm">Próximas Clases</div>
                    </div>
                  </div>
                </div>
                
                {/* Level Badge */}
                <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold shadow-lg ${
                    stats.currentLevel === 'BEGINNER' ? 'bg-yellow-400 text-yellow-900' :
                    stats.currentLevel === 'INTERMEDIATE' ? 'bg-orange-400 text-orange-900' :
                    'bg-red-400 text-red-900'
                  }`}>
                    <Award className="w-5 h-5" />
                    <span>
                      {stats.currentLevel === 'BEGINNER' ? 'Principiante' :
                       stats.currentLevel === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
                    </span>
                  </div>
                  
                  <Link
                    href="/dashboard/student/profile"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white font-medium transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Ver perfil completo</span>
                  </Link>
                </div>
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
                <h3 className="text-lg font-semibold text-gray-900">Total Invertido</h3>
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
                    className="bg-linear-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
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
                            {cls.schoolName && (
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                {cls.schoolName}
                              </div>
                            )}
                            {cls.instructor && (
                              <div className="flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                Instructor: {cls.instructor}
                              </div>
                            )}
                            {cls.location && (
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                {cls.location}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          {(() => {
                            const prices = formatDualCurrency(cls.price);
                            return (
                              <div>
                                <div className="text-lg font-bold text-green-600">{prices.pen}</div>
                                <div className="text-xs text-gray-500">{prices.usd}</div>
                              </div>
                            );
                          })()}
                          <div className="flex flex-col gap-2 mt-2">
                            {cls.classId > 0 && (
                              <Link
                                href={`/classes/${cls.classId}`}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Ver clase →
                              </Link>
                            )}
                            <Link
                              href={`/reservations`}
                              className="text-purple-600 hover:text-purple-800 text-sm"
                            >
                              Ver reserva →
                            </Link>
                          </div>
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