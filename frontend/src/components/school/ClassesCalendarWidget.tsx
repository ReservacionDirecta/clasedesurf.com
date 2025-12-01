'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  MapPin,
  Eye,
  Edit,
  Plus,
  Filter
} from 'lucide-react';

interface ClassData {
  id: number;
  title: string;
  date: string;
  time: string;
  capacity: number;
  enrolled: number;
  level: string;
  instructor?: {
    name: string;
    profileImage?: string;
  };
  location?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

interface ClassesCalendarWidgetProps {
  classes: ClassData[];
  onClassClick?: (classId: number) => void;
}

export default function ClassesCalendarWidget({ classes, onClassClick }: ClassesCalendarWidgetProps) {
  const getInstructorFirstName = (name?: string): string => {
    if (!name) {
      return 'Sin instructor';
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      return 'Sin instructor';
    }
    return trimmedName.split(/\s+/)[0];
  };

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Get unique levels for filter
  const levels = ['all', ...Array.from(new Set(classes.map(c => c.level)))];

  // Filter classes by selected level
  const filteredClasses = classes.filter(cls =>
    selectedLevel === 'all' || cls.level === selectedLevel
  );

  // Get classes for current week
  const getWeekClasses = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return filteredClasses.filter(cls => {
      const classDate = new Date(cls.date);
      return classDate >= startOfWeek && classDate <= endOfWeek;
    });
  };

  const weekClasses = getWeekClasses();

  // Get week days
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'principiante':
        return 'bg-green-500';
      case 'intermedio':
        return 'bg-blue-500';
      case 'avanzado':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const getClassesForDay = (day: Date) => {
    return weekClasses.filter(cls => {
      const classDate = new Date(cls.date);
      return classDate.toDateString() === day.toDateString();
    });
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-100 flex flex-col relative overflow-hidden">
      {/* Sticky Header - Mobile Optimized */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-0">Calendario de Clases</h3>
            <div className="flex items-center space-x-2">
              <Link
                href="/dashboard/school/classes/new"
                className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Nueva Clase</span>
                <span className="sm:hidden">Nueva</span>
              </Link>
              <Link
                href="/dashboard/school/calendar"
                className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
              >
                <Calendar className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Ver Todo</span>
                <span className="sm:hidden">Ver</span>
              </Link>
            </div>
          </div>

          {/* Navigation and Filters - Mobile Optimized */}
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-center sm:justify-start">
              <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                <button
                  onClick={() => navigateWeek('prev')}
                  className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600"
                  aria-label="Semana anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm sm:text-base font-semibold text-gray-900 min-w-[140px] sm:min-w-[180px] text-center capitalize px-2">
                  {weekDays[0].toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => navigateWeek('next')}
                  className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600"
                  aria-label="Siguiente semana"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Level Filter - Mobile Optimized */}
            <div className="flex items-center justify-center sm:justify-end space-x-2">
              <div className="relative">
                <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg pl-9 pr-8 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none cursor-pointer hover:border-gray-400 transition-colors"
                  aria-label="Filtrar por nivel"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>
                      {level === 'all' ? 'Todos los niveles' : level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid - Scrollable on Mobile */}
      <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[600px]">
        <div className="p-3 sm:p-6 min-w-[800px]">
          <div className="grid grid-cols-7 gap-2 lg:gap-4">
            {/* Day Headers */}
            {weekDays.map((day, index) => {
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div key={index} className="flex flex-col h-full">
                  <div className={`text-center mb-3 pb-2 border-b ${isToday ? 'border-blue-500' : 'border-transparent'}`}>
                    <div className={`text-xs font-medium uppercase mb-1 ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                      {day.toLocaleDateString('es-ES', { weekday: 'short' })}
                    </div>
                    <div className={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {day.getDate()}
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 min-h-[150px] bg-gray-50/50 rounded-lg p-2">
                    {getClassesForDay(day).map((cls) => (
                      <div
                        key={cls.id}
                        className={`group relative p-2.5 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all cursor-pointer overflow-hidden`}
                        onClick={() => onClassClick?.(cls.id)}
                      >
                        {/* Level Indicator Strip */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${getLevelColor(cls.level)}`}></div>

                        <div className="pl-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                              {cls.time}
                            </span>
                            {cls.status === 'cancelled' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Cancelada"></span>
                            )}
                          </div>

                          <h4 className="text-xs font-semibold text-gray-900 mb-1.5 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                            {cls.title}
                          </h4>

                          <div className="flex items-center justify-between text-[10px] text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{cls.enrolled}/{cls.capacity}</span>
                            </div>

                            {cls.instructor && (
                              <div className="flex items-center" title={cls.instructor.name}>
                                {cls.instructor.profileImage ? (
                                  <div className="relative w-4 h-4 rounded-full overflow-hidden border border-gray-100">
                                    <Image
                                      src={cls.instructor.profileImage}
                                      alt={cls.instructor.name}
                                      fill
                                      className="object-cover"
                                      sizes="16px"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-500">
                                    {cls.instructor.name?.charAt(0) || '?'}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {getClassesForDay(day).length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8 opacity-50">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <span className="text-xs">Sin clases</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Footer - Mobile Optimized */}
      <div className="sticky bottom-0 z-30 px-4 sm:px-6 py-3 bg-white border-t border-gray-100 rounded-b-lg sm:rounded-b-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-100 rounded-md">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Clases</span>
                <span className="font-bold text-gray-900 leading-none">{weekClasses.length}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-green-100 rounded-md">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Alumnos</span>
                <span className="font-bold text-gray-900 leading-none">
                  {weekClasses.reduce((sum, cls) => sum + cls.enrolled, 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 border-t sm:border-t-0 border-gray-200 pt-2 sm:pt-0">
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-sm"></div>
              <span className="text-xs text-gray-600 font-medium">Principiante</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div>
              <span className="text-xs text-gray-600 font-medium">Intermedio</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 bg-purple-500 rounded-sm"></div>
              <span className="text-xs text-gray-600 font-medium">Avanzado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}