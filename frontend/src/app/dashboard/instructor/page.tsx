'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, Users, Star, BookOpen, Clock, TrendingUp } from 'lucide-react';

export default function InstructorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [instructorData, setInstructorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

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
  }, [session, status, router]);

  const fetchInstructorData = async () => {
    try {
      // Aquí puedes agregar llamadas a la API para obtener datos del instructor
      // Por ahora usamos datos mock
      setInstructorData({
        name: session?.user?.name || 'Instructor',
        email: session?.user?.email || '',
        rating: 4.9,
        totalStudents: 127,
        totalClasses: 45,
        upcomingClasses: 8,
        monthlyEarnings: 2450
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching instructor data:', error);
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Bienvenido, {instructorData?.name}! 🏄‍♂️
          </h1>
          <p className="text-gray-600 mt-2">
            Dashboard del Instructor - Gestiona tus clases y estudiantes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Rating</h3>
                <p className="text-3xl font-bold text-blue-600">{instructorData?.rating}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Estudiantes</h3>
                <p className="text-3xl font-bold text-green-600">{instructorData?.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Clases Totales</h3>
                <p className="text-3xl font-bold text-purple-600">{instructorData?.totalClasses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Próximas</h3>
                <p className="text-3xl font-bold text-yellow-600">{instructorData?.upcomingClasses}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard/instructor/classes')}
                className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-blue-900">Ver Mis Clases</span>
                </div>
                <span className="text-blue-600">→</span>
              </button>

              <button
                onClick={() => router.push('/dashboard/instructor/students')}
                className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-green-900">Mis Estudiantes</span>
                </div>
                <span className="text-green-600">→</span>
              </button>

              <button
                onClick={() => router.push('/dashboard/instructor/profile')}
                className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-purple-900">Mi Perfil</span>
                </div>
                <span className="text-purple-600">→</span>
              </button>

              <button
                onClick={() => router.push('/dashboard/instructor/earnings')}
                className="w-full flex items-center justify-between p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-yellow-600 mr-3" />
                  <span className="text-yellow-900">Mis Ganancias</span>
                </div>
                <span className="text-yellow-600">→</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Próximas Clases</h2>
            <div className="space-y-3">
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">Surf para Principiantes</h3>
                    <p className="text-sm text-gray-600">Hoy, 10:00 AM</p>
                    <p className="text-sm text-blue-600">6 estudiantes</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Confirmada
                  </span>
                </div>
              </div>

              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">Técnicas Avanzadas</h3>
                    <p className="text-sm text-gray-600">Mañana, 2:00 PM</p>
                    <p className="text-sm text-blue-600">4 estudiantes</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Pendiente
                  </span>
                </div>
              </div>

              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">Longboard Session</h3>
                    <p className="text-sm text-gray-600">Viernes, 4:00 PM</p>
                    <p className="text-sm text-blue-600">8 estudiantes</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Confirmada
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">¡Bienvenido a tu Dashboard de Instructor! 🌊</h2>
          <p className="text-blue-100 mb-4">
            Desde aquí puedes gestionar tus clases, ver tus estudiantes, actualizar tu perfil y mucho más.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => router.push('/dashboard/instructor/profile')}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Completar Perfil
            </button>
            <button
              onClick={() => router.push('/dashboard/instructor/classes')}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Ver Clases
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}