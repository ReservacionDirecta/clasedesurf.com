'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, MapPin, Eye, Plus } from 'lucide-react';
import ClassForm from '@/components/forms/ClassForm';
import { Class } from '@/types';

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'class' | 'meeting' | 'maintenance';
  instructor?: string;
  capacity?: number;
  enrolled?: number;
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export default function SchoolCalendar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      // Datos mock de eventos del calendario
      const mockEvents: CalendarEvent[] = [
        {
          id: 1,
          title: 'Iniciación en Miraflores',
          date: '2025-01-15',
          startTime: '10:00',
          endTime: '12:00',
          type: 'class',
          instructor: 'Carlos Mendoza',
          capacity: 8,
          enrolled: 6,
          location: 'Playa Makaha',
          status: 'scheduled'
        },
        {
          id: 2,
          title: 'Intermedio en San Bartolo',
          date: '2025-01-16',
          startTime: '14:00',
          endTime: '16:00',
          type: 'class',
          instructor: 'Maria Rodriguez',
          capacity: 6,
          enrolled: 4,
          location: 'Playa Waikiki',
          status: 'scheduled'
        },
        {
          id: 3,
          title: 'Avanzado en La Herradura',
          date: '2025-01-17',
          startTime: '16:00',
          endTime: '18:00',
          type: 'class',
          instructor: 'Juan Perez',
          capacity: 4,
          enrolled: 3,
          location: 'La Herradura',
          status: 'scheduled'
        },
        {
          id: 4,
          title: 'Clase de Prueba Corregida',
          date: '2025-01-18',
          startTime: '09:00',
          endTime: '11:00',
          type: 'class',
          instructor: 'Gabriel Barrera',
          capacity: 8,
          enrolled: 1,
          location: 'Playa de Prueba',
          status: 'scheduled'
        },
        {
          id: 5,
          title: 'Reunión de Instructores',
          date: '2025-01-20',
          startTime: '18:00',
          endTime: '19:30',
          type: 'meeting',
          location: 'Escuela',
          status: 'scheduled'
        },
        {
          id: 6,
          title: 'Mantenimiento de Equipos',
          date: '2025-01-22',
          startTime: '08:00',
          endTime: '12:00',
          type: 'maintenance',
          location: 'Almacén',
          status: 'scheduled'
        },
        {
          id: 7,
          title: 'Surf Matutino',
          date: '2025-01-10',
          startTime: '07:00',
          endTime: '09:00',
          type: 'class',
          instructor: 'Carlos Mendoza',
          capacity: 8,
          enrolled: 8,
          location: 'Playa San Bartolo',
          status: 'completed'
        }
      ];

      setEvents(mockEvents);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.role !== 'SCHOOL_ADMIN') {
      router.push('/dashboard/student/profile');
      return;
    }

    fetchEvents();
  }, [session, status, router, fetchEvents]);

  const handleCreateClass = async (data: Partial<Class>) => {
    try {
      setIsCreating(true);
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      console.log('📤 Datos enviados al backend:', data);
      console.log('🔑 Token presente:', !!token);

      const response = await fetch('/api/classes', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      console.log('📥 Respuesta del servidor:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error del backend:', errorData);
        console.error('❌ Errores detallados:', JSON.stringify(errorData.errors, null, 2));
        
        let errorMsg = errorData.message || 'Error desconocido';
        if (errorData.errors && Array.isArray(errorData.errors)) {
          console.error('❌ Cada error:', errorData.errors.forEach((e: any, i: number) => {
            console.error(`Error ${i}:`, e);
          }));
          errorMsg += '\n\nDetalles:\n' + errorData.errors.map((e: any) => 
            `- Campo: ${e.path?.join('.') || 'desconocido'}\n  Mensaje: ${e.message}`
          ).join('\n');
        }
        
        alert(`Error al crear clase:\n${errorMsg}`);
        throw new Error(errorData.message || 'Failed to create class');
      }

      const result = await response.json();
      console.log('✅ Clase creada exitosamente:', result);
      
      await fetchEvents();
      setShowCreateModal(false);
      alert('¡Clase creada exitosamente!');
    } catch (error) {
      console.error('Error creating class:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }
    
    // Días del mes siguiente para completar la grilla
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false });
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'class':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'meeting':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (time: string) => {
    return time;
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const todayEvents = getEventsForDate(new Date());
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date() && event.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/school')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Volver al Dashboard
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calendario de Clases</h1>
              <p className="text-gray-600 mt-2">Visualiza y gestiona el horario de tu escuela</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-5 h-5 mr-2" />
              Nueva Clase
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendario Principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* Header del Calendario */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Hoy
                  </button>
                </div>
              </div>

              {/* Grilla del Calendario */}
              <div className="p-6">
                {/* Días de la semana */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Días del mes */}
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentDate).map((day, index) => {
                    const dayEvents = getEventsForDate(day.date);
                    const isToday = day.date.toDateString() === new Date().toDateString();
                    const isSelected = selectedDate?.toDateString() === day.date.toDateString();

                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedDate(day.date)}
                        className={`min-h-[100px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                          !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                        } ${isToday ? 'bg-blue-50 border-blue-200' : ''} ${
                          isSelected ? 'ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          isToday ? 'text-blue-600' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {day.date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded border ${getEventTypeColor(event.type)} truncate`}
                              title={event.title}
                            >
                              {event.startTime} {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayEvents.length - 2} más
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Eventos de Hoy */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Eventos de Hoy</h3>
              {todayEvents.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay eventos programados para hoy</p>
              ) : (
                <div className="space-y-3">
                  {todayEvents.map(event => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                          {event.status === 'scheduled' ? 'Programado' : 
                           event.status === 'completed' ? 'Completado' : 'Cancelado'}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        </div>
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {event.location}
                          </div>
                        )}
                        {event.capacity && (
                          <div className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {event.enrolled}/{event.capacity} estudiantes
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Próximos Eventos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos Eventos</h3>
              {upcomingEvents.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay eventos próximos</p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getEventTypeColor(event.type)}`}>
                          {event.type === 'class' ? 'Clase' :
                           event.type === 'meeting' ? 'Reunión' : 'Mantenimiento'}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(event.date).toLocaleDateString('es-ES')}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        </div>
                        {event.instructor && (
                          <div className="text-gray-500">
                            Instructor: {event.instructor}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Estadísticas Rápidas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Clases este mes</span>
                  <span className="font-semibold text-blue-600">
                    {events.filter(e => e.type === 'class' && new Date(e.date).getMonth() === currentDate.getMonth()).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Clases completadas</span>
                  <span className="font-semibold text-green-600">
                    {events.filter(e => e.type === 'class' && e.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Estudiantes totales</span>
                  <span className="font-semibold text-purple-600">
                    {events.filter(e => e.type === 'class').reduce((sum, e) => sum + (e.enrolled || 0), 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Evento Seleccionado */}
        {/* Modal de Creación de Clase */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nueva Clase</h3>
              <ClassForm 
                onSubmit={handleCreateClass} 
                onCancel={() => setShowCreateModal(false)} 
                isLoading={isCreating} 
              />
            </div>
          </div>
        )}

        {selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Eventos del {selectedDate.toLocaleDateString('es-ES')}
                </h3>
                <button 
                  onClick={() => setSelectedDate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                {getEventsForDate(selectedDate).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay eventos programados para este día</p>
                ) : (
                  getEventsForDate(selectedDate).map(event => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getEventTypeColor(event.type)}`}>
                          {event.type === 'class' ? 'Clase' :
                           event.type === 'meeting' ? 'Reunión' : 'Mantenimiento'}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        </div>
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {event.location}
                          </div>
                        )}
                        {event.instructor && (
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            Instructor: {event.instructor}
                          </div>
                        )}
                        {event.capacity && (
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            {event.enrolled}/{event.capacity} estudiantes
                          </div>
                        )}
                      </div>
                      {event.type === 'class' && (
                        <div className="mt-3">
                          <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                            Ver Detalles de la Clase
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex justify-end mt-6">
                <button 
                  onClick={() => setSelectedDate(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}