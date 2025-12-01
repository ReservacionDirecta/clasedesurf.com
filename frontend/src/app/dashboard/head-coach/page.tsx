"use client";

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Calendar, Users, Clock, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface ClassSummary {
  id: number;
  title: string;
  date: string;
  time: string;
  instructor: string;
  capacity: number;
  enrolled: number;
  status: 'upcoming' | 'in-progress' | 'completed';
}

interface InstructorSchedule {
  id: number;
  name: string;
  classesToday: number;
  nextClass: string;
  status: 'available' | 'busy' | 'off';
}

export default function HeadCoachDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [todayClasses, setTodayClasses] = useState<ClassSummary[]>([]);
  const [instructors, setInstructors] = useState<InstructorSchedule[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // TODO: Implementar endpoints en backend para obtener datos del dashboard
      // Por ahora usamos datos de ejemplo
      setTodayClasses([
        {
          id: 1,
          title: 'Surf para Principiantes',
          date: new Date().toISOString(),
          time: '09:00',
          instructor: 'Juan Pérez',
          capacity: 8,
          enrolled: 6,
          status: 'upcoming'
        },
        {
          id: 2,
          title: 'Surf Intermedio',
          date: new Date().toISOString(),
          time: '11:00',
          instructor: 'María García',
          capacity: 6,
          enrolled: 6,
          status: 'in-progress'
        }
      ]);

      setInstructors([
        {
          id: 1,
          name: 'Juan Pérez',
          classesToday: 2,
          nextClass: '09:00',
          status: 'available'
        },
        {
          id: 2,
          name: 'María García',
          classesToday: 3,
          nextClass: '11:00',
          status: 'busy'
        }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    // TODO: Verificar que el usuario sea HEAD_COACH
    // Por ahora permitimos INSTRUCTOR también para testing
    if (session.user?.role !== 'INSTRUCTOR' && session.user?.role !== 'SCHOOL_ADMIN') {
      router.push('/dashboard/student/profile');
      return;
    }

    fetchDashboardData();
  }, [session, status, router, fetchDashboardData]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20 sm:pb-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Dashboard Head Coach
          </h1>
          <p className="text-gray-600 mt-2">
            Bienvenido, {session?.user?.name}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clases Hoy</p>
                <p className="text-3xl font-bold text-blue-600">{todayClasses.length}</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Instructores Activos</p>
                <p className="text-3xl font-bold text-green-600">{instructors.length}</p>
              </div>
              <Users className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Próxima Clase</p>
                <p className="text-3xl font-bold text-purple-600">09:00</p>
              </div>
              <Clock className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ocupación</p>
                <p className="text-3xl font-bold text-orange-600">85%</p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-600 opacity-20" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clases del Día */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Clases del Día
              </h2>
            </div>
            <div className="p-6">
              {todayClasses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay clases programadas para hoy</p>
              ) : (
                <div className="space-y-4">
                  {todayClasses.map((classItem) => (
                    <div key={classItem.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{classItem.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {classItem.time}
                          </p>
                          <p className="text-sm text-gray-600">
                            Instructor: {classItem.instructor}
                          </p>
                          <div className="flex items-center mt-2">
                            <Users className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-600">
                              {classItem.enrolled}/{classItem.capacity} estudiantes
                            </span>
                          </div>
                        </div>
                        <div>
                          {classItem.status === 'upcoming' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Próxima
                            </span>
                          )}
                          {classItem.status === 'in-progress' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              En curso
                            </span>
                          )}
                          {classItem.status === 'completed' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completada
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Instructores Programados */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Instructores Programados
              </h2>
            </div>
            <div className="p-6">
              {instructors.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay instructores programados</p>
              ) : (
                <div className="space-y-4">
                  {instructors.map((instructor) => (
                    <div key={instructor.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{instructor.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {instructor.classesToday} {instructor.classesToday === 1 ? 'clase' : 'clases'} hoy
                          </p>
                          <p className="text-sm text-gray-600">
                            Próxima clase: {instructor.nextClass}
                          </p>
                        </div>
                        <div>
                          {instructor.status === 'available' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Disponible
                            </span>
                          )}
                          {instructor.status === 'busy' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Ocupado
                            </span>
                          )}
                          {instructor.status === 'off' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              No disponible
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/dashboard/head-coach/calendar')}
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Ver Calendario
            </button>
            <button
              onClick={() => router.push('/dashboard/head-coach/instructors')}
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Users className="w-5 h-5 mr-2" />
              Gestionar Instructores
            </button>
            <button
              onClick={() => router.push('/dashboard/head-coach/classes')}
              className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Clock className="w-5 h-5 mr-2" />
              Programar Clases
            </button>
            <button
              onClick={() => router.push('/dashboard/head-coach/reports')}
              className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Ver Reportes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
