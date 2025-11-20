'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, MapPin, Eye, Plus, StickyNote, BookOpen, X } from 'lucide-react';
import ClassForm from '@/components/forms/ClassForm';
import { Class } from '@/types';

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'class' | 'note' | 'reservation';
  instructor?: string;
  capacity?: number;
  enrolled?: number;
  location?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
  content?: string; // Para notas
}

interface CalendarNote {
  id: number;
  title: string;
  content?: string;
  date: string;
  time?: string;
}

export default function SchoolCalendar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [notes, setNotes] = useState<CalendarNote[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ date: Date; hour: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuickModal, setShowQuickModal] = useState<'class' | 'reservation' | 'note' | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [schoolId, setSchoolId] = useState<number | null>(null);

  // Horarios disponibles (de 6 AM a 10 PM)
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Obtener la escuela del usuario
      const schoolResponse = await fetch('/api/schools/my-school', { headers });
      if (!schoolResponse.ok) {
        console.error('No se pudo obtener la escuela');
        setEvents([]);
        setNotes([]);
        setLoading(false);
        return;
      }

      const school = await schoolResponse.json();
      setSchoolId(school.id);

      // Obtener clases, reservas y notas en paralelo
      const [classesResponse, reservationsResponse, notesResponse] = await Promise.all([
        fetch(`/api/schools/${school.id}/classes`, { headers }),
        fetch('/api/reservations', { headers }),
        fetch('/api/notes', { headers })
      ]);

      const classes = classesResponse.ok ? await classesResponse.json() : [];
      const reservations = reservationsResponse.ok ? await reservationsResponse.json() : [];
      const notesData = notesResponse.ok ? await notesResponse.json() : [];

      // Contar participantes por clase
      const reservationsByClass: { [key: number]: number } = {};
      reservations.forEach((res: any) => {
        if (res.classId && res.status !== 'CANCELED') {
          if (res.participants && Array.isArray(res.participants)) {
            reservationsByClass[res.classId] = (reservationsByClass[res.classId] || 0) + res.participants.length;
          } else {
            reservationsByClass[res.classId] = (reservationsByClass[res.classId] || 0) + 1;
          }
        }
      });

      // Convertir clases a eventos del calendario
      const calendarEvents: CalendarEvent[] = classes.map((cls: any) => {
        const classDate = new Date(cls.date);
        const startTime = classDate.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        const duration = cls.duration || 120;
        const endDate = new Date(classDate.getTime() + duration * 60000);
        const endTime = endDate.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        const dateString = classDate.toISOString().split('T')[0];
        const enrolled = reservationsByClass[cls.id] || 0;

        const now = new Date();
        let status: 'scheduled' | 'completed' | 'cancelled' = 'scheduled';
        if (classDate < now) {
          status = 'completed';
        }

        return {
          id: cls.id,
          title: cls.title,
          date: dateString,
          startTime,
          endTime,
          type: 'class' as const,
          instructor: cls.instructor || 'Por asignar',
          capacity: cls.capacity,
          enrolled,
          location: school.location || 'Por definir',
          status
        };
      });

      // Convertir notas a eventos del calendario
      const noteEvents: CalendarEvent[] = notesData.map((note: any) => {
        const noteDate = new Date(note.date);
        const dateString = noteDate.toISOString().split('T')[0];
        const time = note.time || '00:00';

        return {
          id: note.id,
          title: note.title,
          date: dateString,
          startTime: time,
          endTime: time,
          type: 'note' as const,
          content: note.content || ''
        };
      });

      setEvents([...calendarEvents, ...noteEvents]);
      setNotes(notesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
      setNotes([]);
      setLoading(false);
    }
  }, [session]);

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

    if (session) {
      fetchEvents();
    }
  }, [session, status, router, fetchEvents]);

  const handleCreateClass = async (data: Partial<Class>) => {
    try {
      setIsCreating(true);
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/classes', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error al crear clase: ${errorData.message || 'Error desconocido'}`);
        throw new Error(errorData.message || 'Failed to create class');
      }

      await fetchEvents();
      setShowCreateModal(false);
      setShowQuickModal(null);
      setSelectedTimeSlot(null);
      alert('¡Clase creada exitosamente!');
    } catch (error) {
      console.error('Error creating class:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateNote = async (title: string, content: string, date: Date, time?: string) => {
    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const dateString = date.toISOString().split('T')[0];
      const timeString = time || `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title,
          content,
          date: dateString,
          time: timeString
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error al crear nota: ${errorData.message || 'Error desconocido'}`);
        return;
      }

      await fetchEvents();
      setShowQuickModal(null);
      setSelectedTimeSlot(null);
      alert('¡Nota creada exitosamente!');
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Error al crear la nota');
    }
  };

  const handleCreateQuickReservation = async (classId: number, userId: number) => {
    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          classId,
          participants: [{ name: 'Reserva rápida', age: 18 }]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error al crear reserva: ${errorData.message || 'Error desconocido'}`);
        return;
      }

      await fetchEvents();
      setShowQuickModal(null);
      setSelectedTimeSlot(null);
      alert('¡Reserva creada exitosamente!');
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Error al crear la reserva');
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

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false });
    }

    return days;
  };

  const getEventsForDateAndHour = (date: Date, hour: number) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => {
      if (event.date !== dateString) return false;
      const eventHour = parseInt(event.startTime.split(':')[0]);
      return eventHour === hour;
    });
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
      case 'note':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reservation':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const handleTimeSlotClick = (date: Date, hour: number) => {
    setSelectedTimeSlot({ date, hour });
    setShowQuickModal('class'); // Por defecto mostrar opción de clase
  };

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

              {/* Grilla del Calendario con Bloques de Horarios */}
              <div className="p-6">
                {/* Días de la semana */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Días del mes con bloques de horarios */}
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentDate).map((day, dayIndex) => {
                    const dayEvents = getEventsForDate(day.date);
                    const isToday = day.date.toDateString() === new Date().toDateString();
                    const isSelected = selectedDate?.toDateString() === day.date.toDateString();

                    return (
                      <div
                        key={dayIndex}
                        className={`min-h-[400px] border border-gray-200 ${!day.isCurrentMonth ? 'bg-gray-50' : 'bg-white'} ${isToday ? 'bg-blue-50 border-blue-200' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        {/* Número del día */}
                        <div
                          onClick={() => setSelectedDate(day.date)}
                          className={`p-2 cursor-pointer hover:bg-gray-100 ${isToday ? 'bg-blue-100' : ''}`}
                        >
                          <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                            {day.date.getDate()}
                          </div>
                        </div>

                        {/* Bloques de horarios */}
                        <div className="px-1 pb-1 space-y-0.5 max-h-[360px] overflow-y-auto">
                          {hours.map(hour => {
                            const hourEvents = getEventsForDateAndHour(day.date, hour);
                            const timeString = `${hour.toString().padStart(2, '0')}:00`;

                            return (
                              <div
                                key={hour}
                                onClick={() => handleTimeSlotClick(day.date, hour)}
                                className="min-h-[20px] p-1 border border-gray-200 rounded text-xs cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors relative group"
                                title={`Haz clic para agregar algo a las ${timeString}`}
                              >
                                <div className="text-gray-400 text-[10px] mb-0.5">{timeString}</div>
                                {hourEvents.map(event => (
                                  <div
                                    key={event.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (event.type === 'class') {
                                        router.push(`/dashboard/school/classes/${event.id}/reservations`);
                                      }
                                    }}
                                    className={`text-[10px] p-0.5 rounded mb-0.5 truncate ${getEventTypeColor(event.type)}`}
                                    title={event.title}
                                  >
                                    {event.type === 'note' && <StickyNote className="w-2 h-2 inline mr-0.5" />}
                                    {event.startTime} {event.title}
                                  </div>
                                ))}
                                {hourEvents.length === 0 && (
                                  <div className="opacity-0 group-hover:opacity-100 text-[10px] text-gray-400">
                                    + Agregar
                                  </div>
                                )}
                              </div>
                            );
                          })}
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
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(event.type)}`}>
                          {event.type === 'class' ? 'Clase' : event.type === 'note' ? 'Nota' : 'Reserva'}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        </div>
                        {event.content && (
                          <div className="text-gray-500 text-xs">{event.content}</div>
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
                          {event.type === 'class' ? 'Clase' : event.type === 'note' ? 'Nota' : 'Reserva'}
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Creación de Clase Completa */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Nueva Clase</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ClassForm
                onSubmit={handleCreateClass}
                onCancel={() => setShowCreateModal(false)}
                isLoading={isCreating}
              />
            </div>
          </div>
        )}

        {/* Modal Rápido para Agregar Clase, Reserva o Nota */}
        {showQuickModal && selectedTimeSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Agregar a las {selectedTimeSlot.hour.toString().padStart(2, '0')}:00
                </h3>
                <button
                  onClick={() => {
                    setShowQuickModal(null);
                    setSelectedTimeSlot(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Selector de tipo */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setShowQuickModal('class')}
                  className={`flex-1 px-4 py-2 rounded-lg ${showQuickModal === 'class' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Clase
                </button>
                <button
                  onClick={() => setShowQuickModal('note')}
                  className={`flex-1 px-4 py-2 rounded-lg ${showQuickModal === 'note' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Nota
                </button>
                <button
                  onClick={() => setShowQuickModal('reservation')}
                  className={`flex-1 px-4 py-2 rounded-lg ${showQuickModal === 'reservation' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Reserva
                </button>
              </div>

              {/* Formulario según el tipo */}
              {showQuickModal === 'class' && (
                <QuickClassForm
                  selectedDate={selectedTimeSlot.date}
                  selectedHour={selectedTimeSlot.hour}
                  onSubmit={handleCreateClass}
                  onCancel={() => {
                    setShowQuickModal(null);
                    setSelectedTimeSlot(null);
                  }}
                  isLoading={isCreating}
                />
              )}

              {showQuickModal === 'note' && (
                <QuickNoteForm
                  selectedDate={selectedTimeSlot.date}
                  selectedHour={selectedTimeSlot.hour}
                  onSubmit={handleCreateNote}
                  onCancel={() => {
                    setShowQuickModal(null);
                    setSelectedTimeSlot(null);
                  }}
                />
              )}

              {showQuickModal === 'reservation' && (
                <QuickReservationForm
                  selectedDate={selectedTimeSlot.date}
                  selectedHour={selectedTimeSlot.hour}
                  events={events}
                  onSubmit={handleCreateQuickReservation}
                  onCancel={() => {
                    setShowQuickModal(null);
                    setSelectedTimeSlot(null);
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para formulario rápido de clase
function QuickClassForm({ selectedDate, selectedHour, onSubmit, onCancel, isLoading }: any) {
  const [formData, setFormData] = useState({
    title: '',
    duration: 120,
    capacity: 10,
    price: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateTime = new Date(selectedDate);
    dateTime.setHours(selectedHour, 0, 0, 0);
    
    onSubmit({
      ...formData,
      date: dateTime.toISOString(),
      level: 'BEGINNER',
      description: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
          <input
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Creando...' : 'Crear Clase'}
        </button>
      </div>
    </form>
  );
}

// Componente para formulario rápido de nota
function QuickNoteForm({ selectedDate, selectedHour, onSubmit, onCancel }: any) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timeString = `${selectedHour.toString().padStart(2, '0')}:00`;
    onSubmit(title, content, selectedDate, timeString);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
        >
          Crear Nota
        </button>
      </div>
    </form>
  );
}

// Componente para formulario rápido de reserva
function QuickReservationForm({ selectedDate, selectedHour, events, onSubmit, onCancel }: any) {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // Filtrar clases disponibles para la fecha y hora seleccionada
  const availableClasses = events.filter((event: CalendarEvent) => {
    if (event.type !== 'class') return false;
    const eventDate = new Date(event.date);
    const eventHour = parseInt(event.startTime.split(':')[0]);
    return eventDate.toDateString() === selectedDate.toDateString() && eventHour === selectedHour;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClassId && userId) {
      onSubmit(selectedClassId, userId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Clase *</label>
        <select
          value={selectedClassId || ''}
          onChange={(e) => setSelectedClassId(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          required
        >
          <option value="">Seleccionar clase</option>
          {availableClasses.map((event: CalendarEvent) => (
            <option key={event.id} value={event.id}>
              {event.title} - {event.startTime}
            </option>
          ))}
        </select>
        {availableClasses.length === 0 && (
          <p className="text-sm text-gray-500 mt-1">No hay clases disponibles para este horario</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ID de Usuario *</label>
        <input
          type="number"
          value={userId || ''}
          onChange={(e) => setUserId(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="ID del usuario"
          required
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!selectedClassId || !userId}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          Crear Reserva
        </button>
      </div>
    </form>
  );
}
