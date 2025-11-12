"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import CreateSchoolForm from '@/components/school/CreateSchoolForm';
import AdvancedStats from '@/components/school/AdvancedStats';
import RecentActivity from '@/components/school/RecentActivity';
import ClassesCalendarWidget from '@/components/school/ClassesCalendarWidget';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  Star, 
  Clock, 
  MapPin,
  Phone,
  Mail,
  Globe,
  ChevronRight,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Edit,
  BarChart3,
  PieChart,
  Target,
  Award,
  Waves,
  Settings
} from 'lucide-react';

interface School {
  id: number;
  name: string;
  location: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  profileImage?: string;
  rating?: number;
  totalReviews?: number;
  foundedYear?: number;
  specialties?: string[];
}

interface ClassData {
  id: number;
  title: string;
  date: string;
  capacity: number;
  price: number;
  level: string;
  availableSpots?: number;
  status?: string;
  instructor?: {
    id: number;
    name: string;
    profileImage?: string;
  };
  reservations?: any[];
}

interface DashboardStats {
  totalClasses: number;
  totalInstructors: number;
  totalStudents: number;
  monthlyRevenue: number;
  averageOccupancy: number;
  averageRating: number;
  weeklyClasses: number;
  pendingReservations: number;
  completedClasses: number;
  cancelledClasses: number;
  newStudentsThisMonth: number;
  topInstructor?: string;
  popularLevel?: string;
  peakHours?: string;
  revenueGrowth?: number;
  studentGrowth?: number;
  classGrowth?: number;
  levelDistribution?: {
    BEGINNER: number;
    INTERMEDIATE: number;
    ADVANCED: number;
  };
}

interface RecentActivity {
  id: number;
  type: 'reservation' | 'payment' | 'class' | 'instructor' | 'student';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error' | 'info';
  user?: string;
  amount?: number;
  metadata?: {
    className?: string;
    instructorName?: string;
    studentCount?: number;
  };
}

export default function SchoolDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [school, setSchool] = useState<School | null>(null);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    // Check if user is SCHOOL_ADMIN
    if (session.user?.role !== 'SCHOOL_ADMIN') {
      router.push('/dashboard/student/profile');
      return;
    }

    fetchSchoolData();
  }, [session, status, router]);

  // Update stats when timeframe changes
  useEffect(() => {
    if (school) {
      generateMockStats(school);
    }
  }, [selectedTimeframe, school]);

  const fetchSchoolData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get authentication token
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Try to fetch school associated with current user
      const response = await fetch('/api/schools/my-school', { headers });
      
      if (response.status === 404) {
        // No school found for this user
        setSchool(null);
        setClasses([]);
        setStats(null);
        setRecentActivity([]);
        return;
      }
      
      if (!response.ok) {
        // Try to get error message from backend
        let errorMessage = 'Failed to fetch school data';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const schoolData = await response.json();
      setSchool(schoolData);
      
      // Fetch classes for this school
      const classesResponse = await fetch(`/api/schools/${schoolData.id}/classes`, { headers });
      if (classesResponse.ok) {
        const classesData = await classesResponse.json();
        setClasses(classesData);
      } else {
        setClasses([]);
      }

      // Generate real stats and activity data from API
      generateMockStats(schoolData);
      generateMockActivity();
      
    } catch (err) {
      console.error('Error fetching school data:', err);
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockStats = async (schoolData: School) => {
    try {
      // Get authentication token
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Fetch real stats from backend
      const [statsResponse, reservationsResponse, classesResponse] = await Promise.all([
        fetch('/api/stats/dashboard', { headers }),
        fetch('/api/reservations', { headers }),
        fetch(`/api/schools/${schoolData.id}/classes`, { headers })
      ]);
      
      if (statsResponse.ok) {
        const realStats = await statsResponse.json();
        const reservations = reservationsResponse.ok ? await reservationsResponse.json() : [];
        const allClasses = classesResponse.ok ? await classesResponse.json() : classes;
        
        // Calculate top instructor from reservations
        const instructorCounts: { [key: string]: number } = {};
        reservations.forEach((res: any) => {
          if (res.class?.instructor?.name) {
            const instructorName = res.class.instructor.name;
            instructorCounts[instructorName] = (instructorCounts[instructorName] || 0) + 1;
          }
        });
        const topInstructor = Object.keys(instructorCounts).length > 0
          ? Object.entries(instructorCounts).sort((a, b) => b[1] - a[1])[0][0]
          : '-';
        
        // Calculate popular level from reservations
        const levelCounts: { [key: string]: number } = {};
        reservations.forEach((res: any) => {
          if (res.class?.level) {
            const level = res.class.level;
            levelCounts[level] = (levelCounts[level] || 0) + 1;
          }
        });
        const popularLevelKey = Object.keys(levelCounts).length > 0
          ? Object.entries(levelCounts).sort((a, b) => b[1] - a[1])[0][0]
          : null;
        const levelMap: { [key: string]: string } = {
          'BEGINNER': 'Principiante',
          'INTERMEDIATE': 'Intermedio',
          'ADVANCED': 'Avanzado'
        };
        const popularLevel = popularLevelKey ? (levelMap[popularLevelKey] || popularLevelKey) : '-';
        
        // Calculate peak hours from class dates
        const hourCounts: { [key: number]: number } = {};
        allClasses.forEach((cls: any) => {
          if (cls.date) {
            const classDate = new Date(cls.date);
            const hour = classDate.getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
          }
        });
        const peakHourEntry = Object.keys(hourCounts).length > 0
          ? Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]
          : null;
        const peakHour = peakHourEntry ? parseInt(peakHourEntry[0]) : null;
        const peakHours = peakHour !== null
          ? `${String(peakHour).padStart(2, '0')}:00 - ${String((peakHour + 2) % 24).padStart(2, '0')}:00`
          : '-';
        
        // Calculate growth percentages (comparing current month with previous month)
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        
        // Revenue growth
        const currentMonthRevenue = realStats.monthlyRevenue || 0;
        const previousMonthPayments = reservations
          .filter((r: any) => {
            if (!r.payment?.createdAt) return false;
            const paymentDate = new Date(r.payment.createdAt);
            return paymentDate >= previousMonthStart && paymentDate <= previousMonthEnd;
          })
          .reduce((sum: number, r: any) => sum + (Number(r.payment?.amount) || 0), 0);
        const revenueGrowth = previousMonthPayments > 0
          ? Math.round(((currentMonthRevenue - previousMonthPayments) / previousMonthPayments) * 100)
          : 0;
        
        // Student growth
        const currentMonthStudents = realStats.newStudentsThisMonth || 0;
        const previousMonthStudents = reservations
          .filter((r: any) => {
            if (!r.user?.createdAt) return false;
            const userDate = new Date(r.user.createdAt);
            return userDate >= previousMonthStart && userDate <= previousMonthEnd;
          })
          .length;
        const studentGrowth = previousMonthStudents > 0
          ? Math.round(((currentMonthStudents - previousMonthStudents) / previousMonthStudents) * 100)
          : 0;
        
        // Class growth
        const currentMonthClasses = allClasses.filter((cls: any) => {
          if (!cls.createdAt) return false;
          const classDate = new Date(cls.createdAt);
          return classDate >= currentMonthStart;
        }).length;
        const previousMonthClasses = allClasses.filter((cls: any) => {
          if (!cls.createdAt) return false;
          const classDate = new Date(cls.createdAt);
          return classDate >= previousMonthStart && classDate <= previousMonthEnd;
        }).length;
        const classGrowth = previousMonthClasses > 0
          ? Math.round(((currentMonthClasses - previousMonthClasses) / previousMonthClasses) * 100)
          : 0;
        
        // Calculate level distribution from reservations
        const totalReservationsByLevel = Object.values(levelCounts).reduce((sum, count) => sum + count, 0);
        const levelDistribution = {
          BEGINNER: totalReservationsByLevel > 0 
            ? Math.round((levelCounts['BEGINNER'] || 0) / totalReservationsByLevel * 100) 
            : 0,
          INTERMEDIATE: totalReservationsByLevel > 0 
            ? Math.round((levelCounts['INTERMEDIATE'] || 0) / totalReservationsByLevel * 100) 
            : 0,
          ADVANCED: totalReservationsByLevel > 0 
            ? Math.round((levelCounts['ADVANCED'] || 0) / totalReservationsByLevel * 100) 
            : 0
        };
        
        setStats({
          ...realStats,
          topInstructor,
          popularLevel,
          peakHours,
          revenueGrowth,
          studentGrowth,
          classGrowth,
          levelDistribution
        });
      } else {
        // If API fails, set minimal stats from available data
        setStats({
          totalClasses: classes.length || 0,
          totalInstructors: 0,
          totalStudents: 0,
          monthlyRevenue: 0,
          averageOccupancy: 0,
          averageRating: 0,
          weeklyClasses: 0,
          pendingReservations: 0,
          completedClasses: 0,
          cancelledClasses: 0,
          newStudentsThisMonth: 0,
          topInstructor: '-',
          popularLevel: '-',
          peakHours: '-',
          revenueGrowth: 0,
          studentGrowth: 0,
          classGrowth: 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set minimal stats on error
      setStats({
        totalClasses: classes.length || 0,
        totalInstructors: 0,
        totalStudents: 0,
        monthlyRevenue: 0,
        averageOccupancy: 0,
        averageRating: 0,
        weeklyClasses: 0,
        pendingReservations: 0,
        completedClasses: 0,
        cancelledClasses: 0,
        newStudentsThisMonth: 0,
        topInstructor: '-',
        popularLevel: '-',
        peakHours: '-',
        revenueGrowth: 0,
        studentGrowth: 0,
        classGrowth: 0
      });
    }
  };

  const generateMockActivity = async () => {
    try {
      // Get authentication token
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Fetch real reservations from backend
      const reservationsResponse = await fetch('/api/reservations', { headers });
      
      if (!reservationsResponse.ok) {
        setRecentActivity([]);
        return;
      }
      
      const reservations = await reservationsResponse.json();
      
      // Convert reservations to activity items
      const activities: RecentActivity[] = reservations
        .slice(0, 20) // Get last 20 reservations
        .map((reservation: any, index: number) => {
          const className = reservation.class?.title || 'Clase de Surf';
          const studentName = reservation.user?.name || 'Estudiante';
          const instructorName = reservation.class?.instructor?.name || 'Instructor';
          const participants = reservation.participants?.length || 1;
          const amount = reservation.payment?.amount ? Number(reservation.payment.amount) : undefined;
          
          // Determine activity type and status
          let type: 'reservation' | 'payment' | 'class' | 'instructor' | 'student' = 'reservation';
          let status: 'success' | 'warning' | 'error' | 'info' = 'success';
          let title = 'Nueva Reserva';
          let description = `${studentName} reservó ${className}`;
          
          if (reservation.status === 'CANCELED') {
            type = 'reservation';
            status = 'error';
            title = 'Reserva Cancelada';
            description = `${studentName} canceló la reserva de ${className}`;
          } else if (reservation.payment?.status === 'PAID') {
            type = 'payment';
            status = 'success';
            title = 'Pago Recibido';
            description = `Pago de ${studentName} por ${className}`;
          } else if (reservation.payment?.status === 'PENDING') {
            type = 'payment';
            status = 'warning';
            title = 'Pago Pendiente';
            description = `Pago pendiente de ${studentName} por ${className}`;
          }
          
          return {
            id: reservation.id || index + 1,
            type,
            title,
            description,
            timestamp: reservation.createdAt || reservation.updatedAt || new Date().toISOString(),
            status,
            user: studentName,
            amount,
            metadata: {
              className,
              instructorName,
              studentCount: participants
            }
          };
        })
        .sort((a: RecentActivity, b: RecentActivity) => {
          // Sort by timestamp, most recent first
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
      
      setRecentActivity(activities);
    } catch (error) {
      console.error('Error fetching activity:', error);
      setRecentActivity([]);
    }
  };

  const handleSchoolCreated = (newSchool: School) => {
    setSchool(newSchool);
    setShowCreateForm(false);
    setClasses([]);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchSchoolData}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show create form if no school exists or user wants to create one
  if (showCreateForm || (!school && !loading)) {
    return (
      <CreateSchoolForm 
        onSchoolCreated={handleSchoolCreated}
        onCancel={school ? () => setShowCreateForm(false) : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 pb-20 sm:pb-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow p-4 sm:p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">¡Bienvenido, {session?.user?.name}! 🏄‍♂️</h1>
                <p className="text-blue-100 mb-3 text-sm sm:text-base">Gestiona tu escuela de surf desde aquí</p>
                <div className="flex items-center text-blue-100">
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base truncate">{school?.name || 'Tu Escuela de Surf'}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold mb-1">{classes.length}</div>
                <div className="text-blue-200 text-xs sm:text-sm">Clases Activas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex items-center">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              <div className="ml-2 sm:ml-4 min-w-0">
                <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-gray-900 truncate">Instructores</h3>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-blue-600">{stats?.totalInstructors ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex items-center">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
              <div className="ml-2 sm:ml-4 min-w-0">
                <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-gray-900 truncate">Estudiantes</h3>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-green-600">{stats?.totalStudents ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex items-center">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 flex-shrink-0" />
              <div className="ml-2 sm:ml-4 min-w-0">
                <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-gray-900 truncate">Ingresos</h3>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-yellow-600">S/. {stats?.monthlyRevenue?.toFixed(0) ?? '0'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex items-center">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
              <div className="ml-2 sm:ml-4 min-w-0">
                <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-gray-900 truncate">Ocupación</h3>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-purple-600">{stats?.averageOccupancy ?? 0}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Link
              href="/dashboard/school/classes"
              className="flex flex-col sm:flex-row items-center p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
            >
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mb-2 sm:mb-0 sm:mr-4 flex-shrink-0" />
              <div className="text-center sm:text-left min-w-0">
                <div className="font-semibold text-gray-900 group-hover:text-blue-900 text-sm sm:text-base truncate">Gestionar Clases</div>
                <div className="text-xs sm:text-sm text-gray-600 hidden sm:block">Crear y administrar clases</div>
              </div>
            </Link>

            <Link
              href="/dashboard/school/instructors"
              className="flex flex-col sm:flex-row items-center p-3 sm:p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
            >
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mb-2 sm:mb-0 sm:mr-4 flex-shrink-0" />
              <div className="text-center sm:text-left min-w-0">
                <div className="font-semibold text-gray-900 group-hover:text-green-900 text-sm sm:text-base truncate">Instructores</div>
                <div className="text-xs sm:text-sm text-gray-600 hidden sm:block">Administrar equipo</div>
              </div>
            </Link>

            <Link
              href="/dashboard/school/students"
              className="flex flex-col sm:flex-row items-center p-3 sm:p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
            >
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mb-2 sm:mb-0 sm:mr-4 flex-shrink-0" />
              <div className="text-center sm:text-left min-w-0">
                <div className="font-semibold text-gray-900 group-hover:text-purple-900 text-sm sm:text-base truncate">Estudiantes</div>
                <div className="text-xs sm:text-sm text-gray-600 hidden sm:block">Ver base de datos</div>
              </div>
            </Link>

            <Link
              href="/dashboard/school/payments"
              className="flex flex-col sm:flex-row items-center p-3 sm:p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors group"
            >
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 mb-2 sm:mb-0 sm:mr-4 flex-shrink-0" />
              <div className="text-center sm:text-left min-w-0">
                <div className="font-semibold text-gray-900 group-hover:text-yellow-900 text-sm sm:text-base truncate">Pagos</div>
                <div className="text-xs sm:text-sm text-gray-600 hidden sm:block">Gestionar transacciones</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Advanced Statistics Dashboard */}
        {stats && (
          <div className="mb-8">
            <AdvancedStats 
              stats={stats} 
              timeframe={selectedTimeframe}
              onTimeframeChange={setSelectedTimeframe}
            />
          </div>
        )}

        {/* Dashboard Grid Layout - Mobile Optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Calendar Widget - Mobile First */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <ClassesCalendarWidget 
              classes={classes.map(cls => ({
                id: cls.id,
                title: cls.title,
                date: cls.date,
                time: new Date(cls.date).toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }),
                capacity: cls.capacity,
                enrolled: cls.capacity - (cls.availableSpots || 0),
                level: cls.level,
                instructor: cls.instructor,
                status: 'scheduled' as const
              }))}
              onClassClick={(classId) => {
                window.location.href = `/dashboard/school/classes/${classId}/reservations`;
              }}
            />
          </div>

          {/* Recent Activity - Mobile First */}
          <div className="order-1 lg:order-2">
            <RecentActivity activities={recentActivity} maxItems={6} />
          </div>
        </div>
      </div>
    </div>
  );
}