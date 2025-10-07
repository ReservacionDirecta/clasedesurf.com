'use client';

import { useEffect, useState } from 'react';
import { Users, BookOpen, Star, Award, Calendar, TrendingUp } from 'lucide-react';
import { useApiCall } from '@/hooks/useApiCall';
import { Instructor, Class, Reservation } from '@/types';

interface InstructorStatsProps {
  instructor: Instructor;
}

interface InstructorAnalytics {
  totalClasses: number;
  totalStudents: number;
  upcomingClasses: number;
  completedClasses: number;
  averageClassSize: number;
  monthlyRevenue: number;
  recentClasses: Class[];
  studentSatisfaction: number;
}

export default function InstructorStats({ instructor }: InstructorStatsProps) {
  const [analytics, setAnalytics] = useState<InstructorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const { makeRequest } = useApiCall();

  useEffect(() => {
    fetchInstructorAnalytics();
  }, [instructor.id]);

  const fetchInstructorAnalytics = async () => {
    try {
      setLoading(true);
      
      // Obtener clases del instructor
      const classesResult = await makeRequest(`/api/classes?instructor=${encodeURIComponent(instructor.user?.name || '')}`, { method: 'GET' });
      const classes: Class[] = classesResult.data || [];
      
      // Obtener reservaciones
      const reservationsResult = await makeRequest('/api/reservations', { method: 'GET' });
      const allReservations: Reservation[] = reservationsResult.data || [];
      
      // Filtrar reservaciones de las clases de este instructor
      const instructorReservations = allReservations.filter(reservation => 
        classes.some(cls => cls.id === reservation.classId)
      );

      // Calcular estadísticas
      const now = new Date();
      const upcomingClasses = classes.filter(cls => new Date(cls.date) > now);
      const completedClasses = classes.filter(cls => new Date(cls.date) <= now);
      
      const uniqueStudents = new Set(instructorReservations.map(r => r.userId));
      const totalStudents = uniqueStudents.size;
      
      const averageClassSize = classes.length > 0 
        ? instructorReservations.length / classes.length 
        : 0;

      // Calcular ingresos del mes actual
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const monthlyRevenue = instructorReservations
        .filter(r => {
          const reservationDate = new Date(r.createdAt || '');
          return reservationDate.getMonth() === currentMonth && 
                 reservationDate.getFullYear() === currentYear &&
                 r.payment?.status === 'PAID';
        })
        .reduce((sum, r) => sum + (r.class?.price || 0), 0);

      // Clases recientes (últimas 5)
      const recentClasses = classes
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      setAnalytics({
        totalClasses: classes.length,
        totalStudents,
        upcomingClasses: upcomingClasses.length,
        completedClasses: completedClasses.length,
        averageClassSize: Math.round(averageClassSize * 10) / 10,
        monthlyRevenue,
        recentClasses,
        studentSatisfaction: instructor.rating
      });
      
    } catch (error) {
      console.error('Error fetching instructor analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">No se pudieron cargar las estadísticas del instructor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas Principales */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas del Instructor</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{analytics.totalClasses}</div>
            <div className="text-sm text-gray-600">Clases Totales</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{analytics.totalStudents}</div>
            <div className="text-sm text-gray-600">Estudiantes</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Calendar className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">{analytics.upcomingClasses}</div>
            <div className="text-sm text-gray-600">Próximas Clases</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {analytics.studentSatisfaction > 0 ? analytics.studentSatisfaction.toFixed(1) : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Calificación</div>
          </div>
        </div>
      </div>

      {/* Métricas Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Rendimiento</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Clases Completadas</span>
              <span className="font-semibold">{analytics.completedClasses}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Promedio por Clase</span>
              <span className="font-semibold">{analytics.averageClassSize} estudiantes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ingresos del Mes</span>
              <span className="font-semibold text-green-600">${analytics.monthlyRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Experiencia</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Años de Experiencia</span>
              <span className="font-semibold">{instructor.yearsExperience} años</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Especialidades</span>
              <span className="font-semibold">{instructor.specialties?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Certificaciones</span>
              <span className="font-semibold">{instructor.certifications?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clases Recientes */}
      {analytics.recentClasses.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Clases Recientes</h4>
          <div className="space-y-3">
            {analytics.recentClasses.map((cls) => (
              <div key={cls.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{cls.title}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(cls.date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">${cls.price}</div>
                  <div className="text-sm text-gray-500">{cls.level}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Especialidades y Certificaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {instructor.specialties && instructor.specialties.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Especialidades</h4>
            <div className="flex flex-wrap gap-2">
              {instructor.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {instructor.certifications && instructor.certifications.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Certificaciones</h4>
            <div className="space-y-2">
              {instructor.certifications.map((cert, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}