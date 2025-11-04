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
    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-100">
      {/* Header - Mobile Optimized */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-0">Calendario de Clases</h3>
          <div className="flex items-center space-x-2">
            <Link
              href="/dashboard/school/classes/new"
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Nueva Clase</span>
              <span className="sm:hidden">Nueva</span>
            </Link>
            <Link
              href="/dashboard/school/calendar"
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
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
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Semana anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-base sm:text-lg font-medium text-gray-900 min-w-[160px] sm:min-w-[200px] text-center">
                {weekDays[0].toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => navigateWeek('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Siguiente semana"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Level Filter - Mobile Optimized */}
          <div className="flex items-center justify-center sm:justify-end space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-0"
              aria-label="Filtrar por nivel"
            >
              {levels.map(level => (
                <option key={level} value={level}>
                  {level === 'all' ? 'Todos' : level}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Grid - Mobile Optimized */}
      <div className="p-3 sm:p-6">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-4">
          {/* Day Headers */}
          {weekDays.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                {formatDate(day)}
              </div>
              <div className="space-y-1 sm:space-y-2 min-h-[120px] sm:min-h-[160px] lg:min-h-[200px]">
                {getClassesForDay(day).map((cls) => (
                  <div
                    key={cls.id}
                    className={`p-2 sm:p-3 rounded border cursor-pointer hover:shadow-md transition-all ${getStatusColor(cls.status)}`}
                    onClick={() => onClassClick?.(cls.id)}
                  >
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getLevelColor(cls.level)}`}></div>
                      <span className="text-xs font-medium">
                        {cls.time}
                      </span>
                    </div>
                    
                    <h4 className="text-xs sm:text-sm font-medium mb-1 truncate leading-tight">
                      {cls.title}
                    </h4>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3 flex-shrink-0" />
                        <span>{cls.enrolled}/{cls.capacity}</span>
                      </div>
                      <span className="text-gray-500 text-xs truncate ml-1 hidden sm:inline">{cls.level}</span>
                    </div>
                    
                    {cls.instructor && (
                      <div className="flex items-center mt-1 sm:mt-2 text-xs text-gray-600">
                        {cls.instructor.profileImage ? (
                          <div className="relative w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0">
                            <Image 
                              src={cls.instructor.profileImage} 
                              alt={cls.instructor.name}
                              fill
                              className="rounded-full object-cover"
                              sizes="16px"
                            />
                          </div>
                        ) : (
                          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded-full mr-1 flex-shrink-0"></div>
                        )}
                        <span className="truncate text-xs">{getInstructorFirstName(cls.instructor.name)}</span>
                      </div>
                    )}
                  </div>
                ))}
                
                {getClassesForDay(day).length === 0 && (
                  <div className="text-center text-gray-400 text-sm py-8">
                    Sin clases
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Footer - Mobile Optimized */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100 rounded-b-lg sm:rounded-b-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
            <span className="text-gray-600 text-xs sm:text-sm">
              Esta semana: <span className="font-medium text-gray-900">{weekClasses.length} clases</span>
            </span>
            <span className="text-gray-600 text-xs sm:text-sm">
              Estudiantes: <span className="font-medium text-gray-900">
                {weekClasses.reduce((sum, cls) => sum + cls.enrolled, 0)}
              </span>
            </span>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Prin.</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Inter.</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Avanz.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}