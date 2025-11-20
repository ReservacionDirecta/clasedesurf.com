'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, MapPin, Plus, StickyNote, X, BookOpen, Filter, List, Grid } from 'lucide-react';
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
  content?: string;
}

interface CalendarNote {
  id: number;
  title: string;
  content?: string;
  date: string;
  time?: string;
}

type ViewMode = 'month' | 'week' | 'day' | 'list';

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
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

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

      const [classesResponse, reservationsResponse, notesResponse] = await Promise.all([
        fetch(`/api/schools/${school.id}/classes`, { headers }),
        fetch('/api/reservations', { headers }),
        fetch('/api/notes', { headers })
      ]);

      const classes = classesResponse.ok ? await classesResponse.json() : [];
      const reservations = reservationsResponse.ok ? await reservationsResponse.json() : [];
      const notesData = notesResponse.ok ? await notesResponse.json() : [];

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

  // Swipe gestures para móvil
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) navigateMonth('next');
    if (isRightSwipe) navigateMonth('prev');
  };

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

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      days.push(currentDay);
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

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 7);
      } else {
        newDate.setDate(prev.getDate() + 7);
      }
      return newDate;
    });
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 1);
      } else {
        newDate.setDate(prev.getDate() + 1);
      }
      return newDate;
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'class':
        return 'bg-blue-500 text-white';
      case 'note':
        return 'bg-yellow-500 text-white';
      case 'reservation':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'class':
        return <BookOpen className="w-3 h-3" />;
      case 'note':
        return <StickyNote className="w-3 h-3" />;
      case 'reservation':
        return <Users className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const dayNamesFull = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const todayEvents = getEventsForDate(new Date());
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10);

  const handleTimeSlotClick = (date: Date, hour: number) => {
    setSelectedTimeSlot({ date, hour });
    setShowQuickModal('class');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header Mobile-First */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center justify-between mb-3 md:mb-0">
            <button
              onClick={() => router.push('/dashboard/school')}
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm md:text-base"
            >
              ← Volver
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="md:hidden p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-manipulation"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="hidden md:flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nueva Clase
            </button>
          </div>
          
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">Calendario</h1>
          
          {/* Selector de Vista - Mobile */}
          <div className="flex items-center justify-between md:hidden mb-3">
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors touch-manipulation ${
                  viewMode === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Mes
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors touch-manipulation ${
                  viewMode === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors touch-manipulation ${
                  viewMode === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Día
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors touch-manipulation ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Lista
              </button>
            </div>
          </div>

          {/* Navegación de Fecha */}
          <div 
            className="flex items-center justify-between"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <button
              onClick={() => {
                if (viewMode === 'month') navigateMonth('prev');
                else if (viewMode === 'week') navigateWeek('prev');
                else navigateDay('prev');
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 text-center flex-1">
              {viewMode === 'month' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              {viewMode === 'week' && `Semana del ${getWeekDays(currentDate)[0].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`}
              {viewMode === 'day' && `${dayNamesFull[currentDate.getDay()]}, ${currentDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`}
              {viewMode === 'list' && 'Próximos Eventos'}
            </h2>
            <button
              onClick={() => {
                if (viewMode === 'month') navigateMonth('next');
                else if (viewMode === 'week') navigateWeek('next');
                else navigateDay('next');
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenido del Calendario */}
      <div className="px-4 md:px-6 py-4 md:py-6" ref={calendarRef}>
        {/* Vista de Mes */}
        {viewMode === 'month' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {dayNames.map(day => (
                <div key={day} className="bg-gray-50 p-2 text-center text-xs md:text-sm font-semibold text-gray-700 hidden md:block">
                  {day}
                </div>
              ))}
              {getDaysInMonth(currentDate).map((day, index) => {
                const dayEvents = getEventsForDate(day.date);
                const isToday = day.date.toDateString() === new Date().toDateString();
                const isSelected = selectedDate?.toDateString() === day.date.toDateString();

                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(day.date)}
                    className={`min-h-[80px] md:min-h-[120px] p-1 md:p-2 bg-white cursor-pointer hover:bg-gray-50 transition-colors ${
                      !day.isCurrentMonth ? 'opacity-40' : ''
                    } ${isToday ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''} ${
                      isSelected ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className={`text-xs md:text-sm font-medium mb-1 ${
                      isToday ? 'text-blue-600 font-bold' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {day.date.getDate()}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (event.type === 'class') {
                              router.push(`/dashboard/school/classes/${event.id}/reservations`);
                            }
                          }}
                          className={`text-[10px] md:text-xs p-1 rounded ${getEventTypeColor(event.type)} truncate flex items-center gap-1`}
                          title={event.title}
                        >
                          {getEventTypeIcon(event.type)}
                          <span className="truncate">{event.startTime} {event.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-gray-500 font-medium">
                          +{dayEvents.length - 2} más
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Vista de Semana */}
        {viewMode === 'week' && (
          <div className="space-y-4">
            {getWeekDays(currentDate).map((day, index) => {
              const dayEvents = getEventsForDate(day);
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm p-4"
                >
                  <div className={`text-sm md:text-base font-semibold mb-3 pb-2 border-b ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {dayNamesFull[day.getDay()]} {day.getDate()} {monthNames[day.getMonth()]}
                  </div>
                  <div className="space-y-2">
                    {dayEvents.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">No hay eventos</p>
                    ) : (
                      dayEvents.map(event => (
                        <div
                          key={event.id}
                          onClick={() => {
                            if (event.type === 'class') {
                              router.push(`/dashboard/school/classes/${event.id}/reservations`);
                            }
                          }}
                          className={`p-3 rounded-lg ${getEventTypeColor(event.type)} cursor-pointer touch-manipulation`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getEventTypeIcon(event.type)}
                              <span className="font-medium text-sm">{event.title}</span>
                            </div>
                            <span className="text-xs opacity-90">{event.startTime}</span>
                          </div>
                          {event.instructor && (
                            <div className="text-xs mt-1 opacity-90">Instructor: {event.instructor}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Vista de Día */}
        {viewMode === 'day' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {dayNamesFull[currentDate.getDay()]} {currentDate.getDate()} {monthNames[currentDate.getMonth()]}
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {hours.map(hour => {
                const hourEvents = getEventsForDateAndHour(currentDate, hour);
                const timeString = `${hour.toString().padStart(2, '0')}:00`;

                return (
                  <div
                    key={hour}
                    onClick={() => handleTimeSlotClick(currentDate, hour)}
                    className="p-3 md:p-4 hover:bg-gray-50 cursor-pointer transition-colors touch-manipulation border-l-4 border-l-transparent hover:border-l-blue-500"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-sm font-medium text-gray-500 min-w-[60px]">{timeString}</div>
                      <div className="flex-1 space-y-2">
                        {hourEvents.length === 0 ? (
                          <div className="text-sm text-gray-400">Disponible - Toca para agregar</div>
                        ) : (
                          hourEvents.map(event => (
                            <div
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (event.type === 'class') {
                                  router.push(`/dashboard/school/classes/${event.id}/reservations`);
                                }
                              }}
                              className={`p-2 rounded-lg ${getEventTypeColor(event.type)}`}
                            >
                              <div className="flex items-center gap-2">
                                {getEventTypeIcon(event.type)}
                                <span className="font-medium text-sm">{event.title}</span>
                              </div>
                              {event.content && (
                                <div className="text-xs mt-1 opacity-90">{event.content}</div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Vista de Lista */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <p className="text-gray-500">No hay eventos próximos</p>
              </div>
            ) : (
              upcomingEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => {
                    if (event.type === 'class') {
                      router.push(`/dashboard/school/classes/${event.id}/reservations`);
                    }
                  }}
                  className="bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow touch-manipulation"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded ${getEventTypeColor(event.type)}`}>
                          {getEventTypeIcon(event.type)}
                        </div>
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 ml-8">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.date).toLocaleDateString('es-ES')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {event.startTime} - {event.endTime}
                        </div>
                        {event.instructor && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.instructor}
                          </div>
                        )}
                      </div>
                      {event.content && (
                        <div className="mt-2 text-sm text-gray-600 ml-8">{event.content}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 md:p-0">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Nueva Clase</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 touch-manipulation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 md:p-6">
              <ClassForm
                onSubmit={handleCreateClass}
                onCancel={() => setShowCreateModal(false)}
                isLoading={isCreating}
              />
            </div>
          </div>
        </div>
      )}

      {showQuickModal && selectedTimeSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedTimeSlot.hour.toString().padStart(2, '0')}:00
              </h3>
              <button
                onClick={() => {
                  setShowQuickModal(null);
                  setSelectedTimeSlot(null);
                }}
                className="text-gray-400 hover:text-gray-600 touch-manipulation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setShowQuickModal('class')}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors touch-manipulation ${
                    showQuickModal === 'class' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Clase
                </button>
                <button
                  onClick={() => setShowQuickModal('note')}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors touch-manipulation ${
                    showQuickModal === 'note' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Nota
                </button>
                <button
                  onClick={() => setShowQuickModal('reservation')}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors touch-manipulation ${
                    showQuickModal === 'reservation' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Reserva
                </button>
              </div>

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
        </div>
      )}
    </div>
  );
}

// Componentes de formularios rápidos (mantener igual que antes)
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
          <input
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors touch-manipulation font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors touch-manipulation font-medium"
        >
          {isLoading ? 'Creando...' : 'Crear Clase'}
        </button>
      </div>
    </form>
  );
}

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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
        />
      </div>
      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors touch-manipulation font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors touch-manipulation font-medium"
        >
          Crear Nota
        </button>
      </div>
    </form>
  );
}

function QuickReservationForm({ selectedDate, selectedHour, events, onSubmit, onCancel }: any) {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="ID del usuario"
          required
        />
      </div>
      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors touch-manipulation font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!selectedClassId || !userId}
          className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors touch-manipulation font-medium"
        >
          Crear Reserva
        </button>
      </div>
    </form>
  );
}
