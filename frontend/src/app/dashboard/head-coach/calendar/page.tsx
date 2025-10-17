"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, MapPin } from 'lucide-react';

interface CalendarClass {
  id: number;
  title: string;
  date: Date;
  time: string;
  duration: number;
  instructor: string;
  capacity: number;
  enrolled: number;
  location: string;
  level: string;
}

export default function HeadCoachCalendar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [classes, setClasses] = useState<CalendarClass[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    // TODO: Fetch classes from backend
    // Mock data for now
    const mockClasses: CalendarClass[] = [
      {
        id: 1,
        title: 'Surf para Principiantes',
        date: new Date(),
        time: '09:00',
        duration: 90,
        instructor: 'Juan Pérez',
        capacity: 8,
        enrolled: 6,
        location: 'Playa Norte',
        level: 'Principiante'
      },
      {
        id: 2,
        title: 'Surf Intermedio',
        date: new Date(),
        time: '11:00',
        duration: 120,
        instructor: 'María García',
        capacity: 6,
        enrolled: 6,
        location: 'Playa Sur',
        level: 'Intermedio'
      }
    ];
    setClasses(mockClasses);
  }, [session, status, router]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getClassesForDate = (day: number) => {
    return classes.filter(c => {
      const classDate = new Date(c.date);
      return classDate.getDate() === day && 
             classDate.getMonth() === month && 
             classDate.getFullYear() === year;
    });
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20 sm:pb-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/head-coach')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center text-sm"
          >
            ← Volver al Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <Calendar className="w-8 h-8 mr-3" />
            Calendario de Clases
          </h1>
        </div>

        {/* Calendar Controls */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 flex items-center justify-between border-b border-gray-200">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center font-semibold text-gray-600 text-sm">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const dayClasses = getClassesForDate(day);
                const isToday = new Date().getDate() === day && 
                               new Date().getMonth() === month && 
                               new Date().getFullYear() === year;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(new Date(year, month, day))}
                    className={`aspect-square p-2 rounded-lg border transition-colors ${
                      isToday
                        ? 'bg-blue-100 border-blue-500 font-bold'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-sm">{day}</div>
                    {dayClasses.length > 0 && (
                      <div className="flex justify-center mt-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Classes List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedDate 
                ? `Clases del ${selectedDate.getDate()} de ${monthNames[selectedDate.getMonth()]}`
                : 'Todas las clases del mes'}
            </h2>
          </div>
          <div className="p-6">
            {classes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay clases programadas</p>
            ) : (
              <div className="space-y-4">
                {classes
                  .filter(c => !selectedDate || (
                    new Date(c.date).getDate() === selectedDate.getDate() &&
                    new Date(c.date).getMonth() === selectedDate.getMonth() &&
                    new Date(c.date).getFullYear() === selectedDate.getFullYear()
                  ))
                  .map((classItem) => (
                    <div key={classItem.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{classItem.title}</h3>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600 flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              {classItem.time} - {classItem.duration} minutos
                            </p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              Instructor: {classItem.instructor}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              {classItem.location}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                            {classItem.level}
                          </span>
                          <p className="text-sm text-gray-600">
                            {classItem.enrolled}/{classItem.capacity} estudiantes
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
