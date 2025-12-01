'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Calendar, Users, Star, BookOpen, Clock, TrendingUp } from 'lucide-react';
import { ClassCalendar } from '@/components/instructor/ClassCalendar';

export default function InstructorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [instructorData, setInstructorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchInstructorData = useCallback(async () => {
    try {
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch real data from backend
      const [classesRes, studentsRes, earningsRes] = await Promise.all([
        fetch('/api/instructor/classes', { headers }),
        fetch('/api/instructor/students', { headers }),
        fetch('/api/instructor/earnings', { headers })
      ]);

      const classesData = classesRes.ok ? await classesRes.json() : { classes: [] };
      const studentsData = studentsRes.ok ? await studentsRes.json() : [];
      const earningsData = earningsRes.ok ? await earningsRes.json() : { totalEarnings: 0 };

      // Process classes to match the expected format
      const processedClasses = (classesData.classes || []).map((cls: any) => ({
        id: cls.id,
        title: cls.title,
        date: cls.date,
        startTime: new Date(cls.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        endTime: new Date(new Date(cls.date).getTime() + cls.duration * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        students: cls.reservations?.filter((r: any) => r.status !== 'CANCELED').length || 0,
        capacity: cls.capacity,
        location: cls.location || 'Por definir',
        status: new Date(cls.date) > new Date() ? 'CONFIRMED' as const : 'CONFIRMED' as const,
        level: cls.level || 'Intermedio'
      }));

      // Filter upcoming classes
      const now = new Date();
      const upcomingClasses = processedClasses.filter((cls: any) => new Date(cls.date) > now);

      setInstructorData({
        name: session?.user?.name || 'Instructor',
        email: session?.user?.email || '',
        rating: 4.9, // TODO: Calculate from reviews
        totalStudents: studentsData.length || 0,
        totalClasses: classesData.classes?.length || 0,
        upcomingClasses: upcomingClasses.length,
        monthlyEarnings: earningsData.totalEarnings || 0,
        classes: processedClasses.slice(0, 4) // Show first 4 classes
      });

      // Fallback to mock data if no real data
      if (classesData.classes?.length === 0) {
        setInstructorData({
          name: session?.user?.name || 'Instructor',
          email: session?.user?.email || '',
          rating: 4.9,
          totalStudents: 0,
          totalClasses: 0,
          upcomingClasses: 0,
          monthlyEarnings: 0,
          classes: [
            {
              id: 1,
              title: 'Surf para Principiantes',
              date: new Date().toISOString(),
              startTime: '10:00:00',
              endTime: '12:00:00',
              students: 6,
              capacity: 8,
              location: 'Playa Makaha',
              status: 'CONFIRMED' as const,
              level: 'Principiante'
            },
            {
              id: 2,
              title: 'Técnicas Avanzadas',
              date: new Date(Date.now() + 86400000).toISOString(),
              startTime: '14:00:00',
              endTime: '16:00:00',
              students: 4,
              capacity: 6,
              location: 'Playa Waikiki',
              status: 'CONFIRMED' as const,
              level: 'Avanzado'
            },
            {
              id: 3,
              title: 'Longboard Session',
              date: new Date(Date.now() + 172800000).toISOString(),
              startTime: '16:00:00',
              endTime: '18:00:00',
              students: 8,
              capacity: 10,
              location: 'La Herradura',
              status: 'PENDING' as const,
              level: 'Intermedio'
            },
            {
              id: 4,
              title: 'Surf Kids',
              date: new Date(Date.now() + 259200000).toISOString(),
              startTime: '11:00:00',
              endTime: '12:30:00',
              students: 7,
              capacity: 10,
              location: 'Playa Redondo',
              status: 'CONFIRMED' as const,
              level: 'Principiante'
            }
          ]
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching instructor data:', error);
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (!session) {
      router.push('/login');
      return;
    }

    // Check if user is INSTRUCTOR
    if (session.user?.role !== 'INSTRUCTOR') {
      router.push('/dashboard/student/profile');
      return;
    }

    fetchInstructorData();
  }, [fetchInstructorData, router, session, status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard del instructor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Mobile Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              ¡Hola, {instructorData?.name?.split(' ')[0]}! 🏄‍♂️
            </h1>
            <div className="flex items-center bg-blue-100 px-3 py-1 rounded-full">
              <Star className="w-4 h-4 text-blue-600 mr-1" />
              <span className="text-sm font-semibold text-blue-700">{instructorData?.rating}</span>
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Dashboard del Instructor
          </p>
        </div>

        {/* Stats Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="p-2 bg-blue-100 rounded-lg mb-2 sm:mb-0 sm:mr-4 self-start">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">Rating</h3>
                <p className="text-xl sm:text-3xl font-bold text-blue-600">{instructorData?.rating}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="p-2 bg-green-100 rounded-lg mb-2 sm:mb-0 sm:mr-4 self-start">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">Estudiantes</h3>
                <p className="text-xl sm:text-3xl font-bold text-green-600">{instructorData?.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="p-2 bg-purple-100 rounded-lg mb-2 sm:mb-0 sm:mr-4 self-start">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">Clases</h3>
                <p className="text-xl sm:text-3xl font-bold text-purple-600">{instructorData?.totalClasses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="p-2 bg-yellow-100 rounded-lg mb-2 sm:mb-0 sm:mr-4 self-start">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">Próximas</h3>
                <p className="text-xl sm:text-3xl font-bold text-yellow-600">{instructorData?.upcomingClasses}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Mobile First */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <button
                onClick={() => router.push('/dashboard/instructor/classes')}
                className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors touch-manipulation"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-blue-900 font-medium">Ver Mis Clases</span>
                </div>
                <span className="text-blue-600 text-lg">→</span>
              </button>

              <button
                onClick={() => router.push('/dashboard/instructor/students')}
                className="flex items-center justify-between p-3 sm:p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors touch-manipulation"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-green-900 font-medium">Mis Estudiantes</span>
                </div>
                <span className="text-green-600 text-lg">→</span>
              </button>

              <button
                onClick={() => router.push('/dashboard/instructor/profile')}
                className="flex items-center justify-between p-3 sm:p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors touch-manipulation"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <Star className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-purple-900 font-medium">Mi Perfil</span>
                </div>
                <span className="text-purple-600 text-lg">→</span>
              </button>

              <button
                onClick={() => router.push('/dashboard/instructor/earnings')}
                className="flex items-center justify-between p-3 sm:p-4 bg-yellow-50 hover:bg-yellow-100 rounded-xl transition-colors touch-manipulation"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                    <TrendingUp className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="text-yellow-900 font-medium">Mis Ganancias</span>
                </div>
                <span className="text-yellow-600 text-lg">→</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Próximas Clases</h2>
            <div className="space-y-3">
              <div className="p-3 sm:p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 truncate">Surf para Principiantes</h3>
                    <p className="text-sm text-gray-600 mt-1">Hoy, 10:00 AM</p>
                    <p className="text-sm text-blue-600 mt-1">6 estudiantes</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium ml-2 flex-shrink-0">
                    Confirmada
                  </span>
                </div>
              </div>

              <div className="p-3 sm:p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 truncate">Técnicas Avanzadas</h3>
                    <p className="text-sm text-gray-600 mt-1">Mañana, 2:00 PM</p>
                    <p className="text-sm text-blue-600 mt-1">4 estudiantes</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium ml-2 flex-shrink-0">
                    Pendiente
                  </span>
                </div>
              </div>

              <div className="p-3 sm:p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 truncate">Longboard Session</h3>
                    <p className="text-sm text-gray-600 mt-1">Viernes, 4:00 PM</p>
                    <p className="text-sm text-blue-600 mt-1">8 estudiantes</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium ml-2 flex-shrink-0">
                    Confirmada
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message - Mobile Optimized */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-4 sm:p-6 text-white mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-bold mb-2">¡Bienvenido a tu Dashboard! 🌊</h2>
          <p className="text-blue-100 mb-4 text-sm sm:text-base">
            Gestiona tus clases, estudiantes y perfil desde aquí.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={() => router.push('/dashboard/instructor/profile')}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium text-center touch-manipulation"
            >
              Completar Perfil
            </button>
            <button
              onClick={() => router.push('/dashboard/instructor/classes')}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors font-medium text-center touch-manipulation"
            >
              Ver Clases
            </button>
          </div>
        </div>

        {/* Calendar Section - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <ClassCalendar classes={instructorData?.classes || []} />
        </div>
      </div>
    </div>
  );
}