'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Clock, Users, Plus, StickyNote, X, BookOpen } from 'lucide-react';
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
  content?: string;
  noteId?: number; // ID de la nota en la base de datos
}

export default function SchoolCalendar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true); // Solo para carga inicial
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Flag para distinguir carga inicial
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ date: Date; hour: number; minute?: number } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuickModal, setShowQuickModal] = useState<'class' | 'note' | 'reservation' | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [selectedNote, setSelectedNote] = useState<CalendarEvent | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);

  const fetchEvents = useCallback(async (showLoading = false) => {
    try {
      // Solo mostrar loading si se solicita explícitamente (carga inicial)
      if (showLoading) {
        setLoading(true);
      }

      const schoolResponse = await fetch('/api/schools/my-school');
      if (!schoolResponse.ok) {
        setEvents([]);
        if (showLoading) setLoading(false);
        return;
      }

      const school = await schoolResponse.json();

      const [classesResponse, reservationsResponse, notesResponse] = await Promise.all([
        fetch(`/api/schools/${school.id}/classes`),
        fetch('/api/reservations'),
        fetch('/api/notes')
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

        return {
          id: cls.id,
          title: cls.title,
          date: dateString,
          startTime,
          endTime,
          type: 'class' as const,
          instructor: cls.instructor || 'Por asignar',
          capacity: cls.capacity,
          enrolled
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
          content: note.content || '',
          noteId: note.id // Guardar el ID de la nota para poder editarla/eliminarla
        };
      });

      setEvents([...calendarEvents, ...noteEvents]);
      if (showLoading) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
      if (showLoading) setLoading(false);
    }
  }, []); // Removido session de las dependencias para evitar recargas innecesarias

  // Guardar el ID del usuario para detectar cambios reales de sesión
  const lastUserId = useRef<string | null>(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      lastUserId.current = null;
      return;
    }
    if (session.user?.role !== 'SCHOOL_ADMIN') {
      router.push('/dashboard/student/profile');
      return;
    }
    
    const currentUserId = session.user?.id?.toString() || null;
    
    // Solo recargar eventos si el usuario realmente cambió (nueva sesión)
    // No recargar si es el mismo usuario (solo refresco de pestaña)
    if (lastUserId.current !== currentUserId) {
      lastUserId.current = currentUserId;
      // Carga inicial: mostrar loading
      fetchEvents(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, status, router]); // fetchEvents es estable, no necesita estar en dependencias

  // Listener para recargar datos silenciosamente cuando la pestaña vuelve a estar activa
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Solo recargar si la pestaña vuelve a estar visible y ya pasó la carga inicial
      if (document.visibilityState === 'visible' && !isInitialLoad && !isRefreshingRef.current) {
        isRefreshingRef.current = true;
        // Recargar silenciosamente (sin mostrar loading)
        fetchEvents(false).finally(() => {
          isRefreshingRef.current = false;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isInitialLoad, fetchEvents]);

  const handleCreateClass = async (data: Partial<Class>) => {
    try {
      setIsCreating(true);
      // No enviar headers de autorización desde el cliente
      // La ruta API del servidor manejará la autenticación

      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Error desconocido'}`);
        return;
      }

      await fetchEvents(false); // Actualización silenciosa
      setShowCreateModal(false);
      setShowQuickModal(null);
      setSelectedTimeSlot(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('Error creating class:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateNote = async (title: string, content: string, date: Date, time?: string) => {
    try {
      const dateString = date.toISOString().split('T')[0];
      const timeValue = time && time !== '00:00' ? time : null;

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: content || null,
          date: dateString,
          time: timeValue
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Error desconocido'}`);
        return;
      }

      await fetchEvents(false); // Actualización silenciosa
      setShowQuickModal(null);
      setSelectedTimeSlot(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Error al crear la nota. Por favor, intenta de nuevo.');
    }
  };

  const handleUpdateNote = async (noteId: number, title: string, content: string, date: Date, time?: string) => {
    try {
      const dateString = date.toISOString().split('T')[0];
      const timeValue = time && time !== '00:00' ? time : null;

      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: content || null,
          date: dateString,
          time: timeValue
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Error desconocido'}`);
        return;
      }

      await fetchEvents(false); // Actualización silenciosa
      setShowNoteModal(false);
      setSelectedNote(null);
      setIsEditingNote(false);
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Error al actualizar la nota. Por favor, intenta de nuevo.');
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta nota?')) {
      return;
    }

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Error desconocido'}`);
        return;
      }

      await fetchEvents(false); // Actualización silenciosa
      setShowNoteModal(false);
      setSelectedNote(null);
      setIsEditingNote(false);
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error al eliminar la nota. Por favor, intenta de nuevo.');
    }
  };

  const handleOpenReservationModal = async () => {
    try {
      // Obtener clases disponibles para la fecha y hora seleccionada
      const schoolResponse = await fetch('/api/schools/my-school');
      if (!schoolResponse.ok) return;
      
      const school = await schoolResponse.json();
      const dateString = selectedDate?.toISOString().split('T')[0];
      const [hours, minutes] = selectedTime.split(':').map(Number);
      
      // Buscar clases en esa fecha
      const classesResponse = await fetch(`/api/schools/${school.id}/classes`);
      if (classesResponse.ok) {
        const allClasses = await classesResponse.json();
        const selectedDateTime = new Date(selectedDate!);
        selectedDateTime.setHours(hours, minutes, 0, 0);
        
        // Filtrar clases que coincidan con la fecha/hora
        const matchingClasses = allClasses.filter((cls: any) => {
          const classDate = new Date(cls.date);
          const classTime = new Date(classDate);
          classTime.setHours(classDate.getHours(), classDate.getMinutes(), 0, 0);
          return classTime.getTime() === selectedDateTime.getTime();
        });
        
        setAvailableClasses(matchingClasses);
      }
      
      setShowReservationModal(true);
      setShowQuickModal(null);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const handleCreateReservation = async (classId: number, studentData: any) => {
    try {
      setIsCreatingReservation(true);
      
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          participants: [
            {
              name: studentData.name,
              email: studentData.email,
              age: studentData.age,
              height: studentData.height,
              weight: studentData.weight,
              canSwim: studentData.canSwim || false,
              swimmingLevel: studentData.swimmingLevel || 'BEGINNER',
              hasSurfedBefore: studentData.hasSurfedBefore || false,
              injuries: studentData.injuries || '',
              emergencyContact: studentData.emergencyContact || '',
              emergencyPhone: studentData.emergencyPhone || '',
              specialRequest: studentData.specialRequest || ''
            }
          ],
          status: 'CONFIRMED'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Error desconocido'}`);
        return;
      }

      await fetchEvents(false); // Actualización silenciosa
      setShowReservationModal(false);
      setSelectedTimeSlot(null);
      setSelectedDate(null);
      setAvailableClasses([]);
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Error al crear la reserva. Por favor, intenta de nuevo.');
    } finally {
      setIsCreatingReservation(false);
    }
  };

  // Calcular días del mes correctamente
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);
    
    // Día de la semana del primer día (0 = domingo, 6 = sábado)
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Días del mes anterior para completar la primera semana
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true
      });
    }
    
    // Días del mes siguiente para completar la última semana
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const dayEvents = events.filter(event => event.date === dateString);
    // Ordenar eventos por hora
    return dayEvents.sort((a, b) => {
      const [aHour, aMin] = a.startTime.split(':').map(Number);
      const [bHour, bMin] = b.startTime.split(':').map(Number);
      return aHour * 60 + aMin - (bHour * 60 + bMin);
    });
  };

  // Convertir hora HH:mm a minutos desde medianoche
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Obtener posición vertical de un evento en el día (0-100%)
  const getEventPosition = (event: CalendarEvent): { top: number; height: number } => {
    const startMinutes = timeToMinutes(event.startTime);
    const endMinutes = event.endTime ? timeToMinutes(event.endTime) : startMinutes + 60;
    const duration = endMinutes - startMinutes;
    
    // Día de 6:00 AM a 10:00 PM = 16 horas = 960 minutos
    const dayStart = 6 * 60; // 6:00 AM
    const dayEnd = 22 * 60; // 10:00 PM
    const dayDuration = dayEnd - dayStart;
    
    const top = ((startMinutes - dayStart) / dayDuration) * 100;
    const height = (duration / dayDuration) * 100;
    
    return { top: Math.max(0, top), height: Math.min(100, height) };
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

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

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

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 py-4 md:px-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/dashboard/school')}
              className="text-blue-600 hover:text-blue-800 text-sm md:text-base"
            >
              ← Volver
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Clase</span>
            </button>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Calendario</h1>
          
          {/* Navegación */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <div className="px-4 md:px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {dayNames.map(day => (
              <div key={day} className="p-3 text-center text-xs md:text-sm font-semibold text-gray-600 bg-gray-50">
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dayEvents = getEventsForDate(day.date);
              const dayDate = new Date(day.date);
              dayDate.setHours(0, 0, 0, 0);
              const isToday = dayDate.getTime() === today.getTime();
              const isSelected = selectedDate && dayDate.getTime() === selectedDate.getTime();

              return (
                <div
                  key={index}
                  className={`relative min-h-[120px] md:min-h-[180px] p-2 border-r border-b border-gray-100 ${
                    !day.isCurrentMonth ? 'bg-gray-50 opacity-50' : 'bg-white'
                  } ${isToday ? 'bg-blue-50' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div 
                    onClick={() => {
                      setSelectedDate(day.date);
                      setSelectedTimeSlot({ date: day.date, hour: 9, minute: 0 });
                      setSelectedTime('09:00');
                      setShowQuickModal(null); // Abrir selector de tipo
                    }}
                    className={`text-sm md:text-base font-medium mb-2 cursor-pointer hover:bg-gray-100 rounded px-1 ${
                      isToday ? 'text-blue-600 font-bold' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {day.date.getDate()}
                  </div>
                  
                  {/* Bloques de tiempo para eventos */}
                  <div className="relative space-y-0.5">
                    {dayEvents.map(event => {
                      const position = getEventPosition(event);
                      const [hours, minutes] = event.startTime.split(':').map(Number);
                      const timeLabel = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                      
                      return (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (event.type === 'class') {
                              router.push(`/dashboard/school/classes/${event.id}/reservations`);
                            } else if (event.type === 'note' && event.noteId) {
                              setSelectedNote(event);
                              setShowNoteModal(true);
                              setIsEditingNote(false);
                            }
                          }}
                          className={`text-[9px] md:text-[10px] p-1 rounded border cursor-pointer hover:opacity-80 transition-opacity ${getEventTypeColor(event.type)}`}
                          style={{
                            minHeight: `${Math.max(20, position.height)}%`
                          }}
                          title={`${timeLabel} - ${event.title}${event.endTime ? ` (hasta ${event.endTime})` : ''}`}
                        >
                          <div className="flex items-start gap-1">
                            <div className="flex-shrink-0 mt-0.5">
                              {event.type === 'note' && <StickyNote className="w-2.5 h-2.5" />}
                              {event.type === 'class' && <BookOpen className="w-2.5 h-2.5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold truncate">{timeLabel}</div>
                              <div className="truncate">{event.title}</div>
                              {event.type === 'class' && event.enrolled !== undefined && (
                                <div className="text-[8px] opacity-75">
                                  {event.enrolled}/{event.capacity || '∞'}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Botón para agregar evento rápido - siempre visible */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(day.date);
                        setSelectedTimeSlot({ date: day.date, hour: 9, minute: 0 });
                        setSelectedTime('09:00');
                        setShowQuickModal(null);
                      }}
                      className={`w-full text-[10px] text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded p-1 transition-colors flex items-center justify-center gap-1 ${
                        dayEvents.length > 0 ? 'mt-1 border border-dashed border-gray-300' : ''
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Modal crear clase completa */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Nueva Clase</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
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

      {/* Modal de selección de tipo */}
      {selectedDate && selectedTimeSlot && !showQuickModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedDate.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Hora</label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => {
                      setSelectedTime(e.target.value);
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      setSelectedTimeSlot({ ...selectedTimeSlot, hour: hours, minute: minutes });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedDate(null);
                  setSelectedTimeSlot(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">¿Qué deseas agregar a las {selectedTime}?</p>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setShowQuickModal('class')}
                  className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg transition-colors text-left"
                >
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Nueva Clase</div>
                    <div className="text-sm text-gray-600">Crear una nueva clase de surf</div>
                  </div>
                </button>
                <button
                  onClick={() => setShowQuickModal('note')}
                  className="flex items-center gap-3 p-4 bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-200 rounded-lg transition-colors text-left"
                >
                  <div className="p-2 bg-yellow-600 rounded-lg">
                    <StickyNote className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Nueva Nota</div>
                    <div className="text-sm text-gray-600">Agregar una nota o recordatorio</div>
                  </div>
                </button>
                <button
                  onClick={handleOpenReservationModal}
                  className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-lg transition-colors text-left"
                >
                  <div className="p-2 bg-green-600 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Nueva Reserva</div>
                    <div className="text-sm text-gray-600">Registrar reserva de alumno</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal rápido de formulario */}
      {showQuickModal && selectedTimeSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {showQuickModal === 'class' ? 'Nueva Clase' : 'Nueva Nota'}
              </h3>
              <button
                onClick={() => {
                  setShowQuickModal(null);
                  setSelectedTimeSlot(null);
                  setSelectedDate(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {showQuickModal === 'class' ? (
                <QuickClassForm
                  selectedDate={selectedTimeSlot.date}
                  selectedHour={selectedTimeSlot.hour}
                  selectedMinute={selectedTimeSlot.minute}
                  onSubmit={handleCreateClass}
                  onCancel={() => {
                    setShowQuickModal(null);
                    setSelectedTimeSlot(null);
                    setSelectedDate(null);
                  }}
                  isLoading={isCreating}
                />
              ) : (
                <QuickNoteForm
                  selectedDate={selectedTimeSlot.date}
                  selectedHour={selectedTimeSlot.hour}
                  selectedMinute={selectedTimeSlot.minute}
                  onSubmit={handleCreateNote}
                  onCancel={() => {
                    setShowQuickModal(null);
                    setSelectedTimeSlot(null);
                    setSelectedDate(null);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de ver/editar/eliminar nota */}
      {showNoteModal && selectedNote && selectedNote.noteId && (
        <NoteViewEditModal
          note={selectedNote}
          isEditing={isEditingNote}
          onEdit={() => setIsEditingNote(true)}
          onSave={(title, content, date, time) => handleUpdateNote(selectedNote.noteId!, title, content, date, time)}
          onDelete={() => handleDeleteNote(selectedNote.noteId!)}
          onClose={() => {
            setShowNoteModal(false);
            setSelectedNote(null);
            setIsEditingNote(false);
          }}
        />
      )}

      {/* Modal de reserva */}
      {showReservationModal && selectedDate && selectedTimeSlot && (
        <ReservationModal
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          availableClasses={availableClasses}
          onCreateClass={() => {
            setShowReservationModal(false);
            setShowQuickModal('class');
          }}
          onCreateReservation={handleCreateReservation}
          onCancel={() => {
            setShowReservationModal(false);
            setSelectedTimeSlot(null);
            setSelectedDate(null);
            setAvailableClasses([]);
          }}
          isLoading={isCreatingReservation}
        />
      )}
    </div>
  );
}

interface NoteViewEditModalProps {
  note: CalendarEvent;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (title: string, content: string, date: Date, time: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

function NoteViewEditModal({ note, isEditing, onEdit, onSave, onDelete, onClose }: NoteViewEditModalProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content || '');
  const [date, setDate] = useState(note.date);
  const [time, setTime] = useState(note.startTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const noteDate = new Date(date);
    onSave(title, content, noteDate, time);
  };

  const noteDate = new Date(note.date);
  const formattedDate = noteDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Editar Nota' : 'Ver Nota'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
              >
                Guardar
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Hora</label>
              <p className="text-sm text-gray-900">{time}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Título</label>
              <p className="text-base text-gray-900 font-medium">{note.title}</p>
            </div>
            {note.content && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Contenido</label>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
              </div>
            )}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={onEdit}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
              >
                Editar
              </button>
              <button
                onClick={onDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickClassForm({ selectedDate, selectedHour, selectedMinute, onSubmit, onCancel, isLoading }: any) {
  const [formData, setFormData] = useState({
    title: '',
    duration: 120,
    capacity: 10,
    price: 0
  });
  const [time, setTime] = useState(
    `${selectedHour?.toString().padStart(2, '0') || '09'}:${(selectedMinute || 0).toString().padStart(2, '0')}`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [hours, minutes] = time.split(':').map(Number);
    const dateTime = new Date(selectedDate);
    dateTime.setHours(hours, minutes, 0, 0);
    
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Hora de inicio *</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
          <input
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
        <input
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {isLoading ? 'Creando...' : 'Crear'}
        </button>
      </div>
    </form>
  );
}

interface ReservationModalProps {
  selectedDate: Date;
  selectedTime: string;
  availableClasses: any[];
  onCreateClass: () => void;
  onCreateReservation: (classId: number, studentData: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function ReservationModal({ 
  selectedDate, 
  selectedTime, 
  availableClasses, 
  onCreateClass, 
  onCreateReservation, 
  onCancel, 
  isLoading 
}: ReservationModalProps) {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    age: '',
    height: '',
    weight: '',
    canSwim: false,
    swimmingLevel: 'BEGINNER',
    hasSurfedBefore: false,
    injuries: '',
    emergencyContact: '',
    emergencyPhone: '',
    specialRequest: ''
  });

  const handleClassSelect = (classId: number) => {
    setSelectedClassId(classId);
    setShowStudentForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClassId) {
      onCreateReservation(selectedClassId, studentData);
    }
  };

  const formattedDate = selectedDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Nueva Reserva</h3>
            <p className="text-sm text-gray-500 mt-1">{formattedDate} a las {selectedTime}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {!showStudentForm ? (
            <div className="space-y-4">
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-900 mb-2">Selecciona una clase</h4>
                {availableClasses.length > 0 ? (
                  <div className="space-y-2">
                    {availableClasses.map((cls: any) => {
                      const classDate = new Date(cls.date);
                      const startTime = classDate.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      });
                      return (
                        <button
                          key={cls.id}
                          onClick={() => handleClassSelect(cls.id)}
                          className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                        >
                          <div className="font-semibold text-gray-900">{cls.title}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {startTime} - {cls.duration || 120} min | ${cls.price || 0} | Capacidad: {cls.capacity || 10}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No hay clases disponibles para esta fecha y hora.</p>
                    <button
                      onClick={onCreateClass}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Crear Nueva Clase
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowStudentForm(false);
                    setSelectedClassId(null);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  ← Volver a seleccionar clase
                </button>
              </div>

              <h4 className="text-md font-semibold text-gray-900 mb-4">Información del Alumno</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                  <input
                    type="text"
                    value={studentData.name}
                    onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={studentData.email}
                    onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Edad *</label>
                  <input
                    type="number"
                    min="8"
                    value={studentData.age}
                    onChange={(e) => setStudentData({ ...studentData, age: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
                  <input
                    type="number"
                    min="100"
                    value={studentData.height}
                    onChange={(e) => setStudentData({ ...studentData, height: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    min="20"
                    value={studentData.weight}
                    onChange={(e) => setStudentData({ ...studentData, weight: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de natación</label>
                  <select
                    value={studentData.swimmingLevel}
                    onChange={(e) => setStudentData({ ...studentData, swimmingLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="BEGINNER">Principiante</option>
                    <option value="INTERMEDIATE">Intermedio</option>
                    <option value="ADVANCED">Avanzado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={studentData.canSwim}
                    onChange={(e) => setStudentData({ ...studentData, canSwim: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">¿Sabe nadar?</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={studentData.hasSurfedBefore}
                    onChange={(e) => setStudentData({ ...studentData, hasSurfedBefore: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">¿Ha surfeado antes?</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contacto de emergencia</label>
                <input
                  type="text"
                  value={studentData.emergencyContact}
                  onChange={(e) => setStudentData({ ...studentData, emergencyContact: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de emergencia</label>
                <input
                  type="tel"
                  value={studentData.emergencyPhone}
                  onChange={(e) => setStudentData({ ...studentData, emergencyPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lesiones o condiciones médicas</label>
                <textarea
                  value={studentData.injuries}
                  onChange={(e) => setStudentData({ ...studentData, injuries: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Solicitud especial</label>
                <textarea
                  value={studentData.specialRequest}
                  onChange={(e) => setStudentData({ ...studentData, specialRequest: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {isLoading ? 'Creando...' : 'Crear Reserva'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickNoteForm({ selectedDate, selectedHour, selectedMinute, onSubmit, onCancel }: any) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [time, setTime] = useState(
    `${selectedHour?.toString().padStart(2, '0') || '09'}:${(selectedMinute || 0).toString().padStart(2, '0')}`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(title, content, selectedDate, time);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
        />
      </div>
      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
        >
          Crear Nota
        </button>
      </div>
    </form>
  );
}
