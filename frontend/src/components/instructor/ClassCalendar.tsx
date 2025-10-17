'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, MapPin, Waves, Sun, Moon, Eye, ExternalLink } from 'lucide-react';

interface ClassEvent {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  students: number;
  capacity: number;
  location: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELED';
  level: string;
}

interface ClassCalendarProps {
  classes: ClassEvent[];
}

interface TooltipState {
  show: boolean;
  x: number;
  y: number;
  class: ClassEvent | null;
}

export function ClassCalendar({ classes }: ClassCalendarProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ show: false, x: 0, y: 0, class: null });
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Obtener días del mes
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días del mes anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }

    // Días del mes siguiente
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }

    return days;
  };

  // Obtener días de la semana
  const getDaysInWeek = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      days.push({
        day: currentDay.getDate(),
        isCurrentMonth: currentDay.getMonth() === date.getMonth(),
        date: currentDay
      });
    }

    return days;
  };

  const getClassesForDate = (date: Date) => {
    return classes.filter(cls => {
      const classDate = new Date(cls.date);
      return (
        classDate.getDate() === date.getDate() &&
        classDate.getMonth() === date.getMonth() &&
        classDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const previousPeriod = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    }
  };

  const nextPeriod = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleClassHover = (event: React.MouseEvent, classItem: ClassEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      class: classItem
    });
  };

  const handleClassLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, class: null });
  };

  const handleClassClick = (classItem: ClassEvent) => {
    // Navegar a la página de reservas de la clase
    router.push(`/classes/${classItem.id}`);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const days = view === 'month' ? getDaysInMonth(currentDate) : getDaysInWeek(currentDate);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-500 border-emerald-600';
      case 'PENDING':
        return 'bg-amber-500 border-amber-600';
      case 'CANCELED':
        return 'bg-rose-500 border-rose-600';
      default:
        return 'bg-slate-500 border-slate-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CANCELED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const getTimeIcon = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return <Sun className="w-3 h-3" />;
    return <Moon className="w-3 h-3" />;
  };

  const getWeekRange = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${monthNames[endOfWeek.getMonth()]} ${endOfWeek.getFullYear()}`;
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 overflow-hidden relative">
      {/* Calendar Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="p-2 sm:p-3 bg-white/20 rounded-xl mr-3 sm:mr-4">
              <Waves className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold">Calendario de Clases</h2>
              <p className="text-blue-100 text-xs sm:text-sm">Gestiona tu horario de surf</p>
            </div>
          </div>
          <div className="flex gap-2 self-start sm:self-auto">
            <button
              onClick={() => setView('month')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all touch-manipulation ${
                view === 'month'
                  ? 'bg-white text-blue-700 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all touch-manipulation ${
                view === 'week'
                  ? 'bg-white text-blue-700 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Semana
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <button
              onClick={previousPeriod}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors touch-manipulation"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <h3 className="text-lg sm:text-2xl font-bold min-w-[200px] sm:min-w-[250px] text-center">
              {view === 'month' 
                ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                : getWeekRange()
              }
            </h3>
            <button
              onClick={nextPeriod}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors touch-manipulation"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition-colors font-semibold shadow-lg text-sm sm:text-base touch-manipulation"
          >
            Ir a Hoy
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-3 sm:p-6">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs sm:text-sm font-bold text-gray-700 py-2 sm:py-3 bg-gray-50 rounded-lg">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className={`grid grid-cols-7 gap-1 sm:gap-2 ${view === 'week' ? 'min-h-[300px] sm:min-h-[400px]' : ''}`}>
          {days.map((dayInfo, index) => {
            const dayClasses = getClassesForDate(dayInfo.date);
            const hasClasses = dayClasses.length > 0;
            const isTodayDate = isToday(dayInfo.date);
            const isSelectedDate = isSelected(dayInfo.date);

            return (
              <div
                key={index}
                onClick={() => setSelectedDate(dayInfo.date)}
                className={`${view === 'week' ? 'min-h-[300px] sm:min-h-[400px]' : 'min-h-[80px] sm:min-h-[120px]'} p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all cursor-pointer touch-manipulation ${
                  dayInfo.isCurrentMonth
                    ? 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                    : 'bg-gray-50 border-gray-100'
                } ${isTodayDate ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' : ''} ${
                  isSelectedDate ? 'ring-2 ring-purple-500 border-purple-500 bg-purple-50' : ''
                } ${hasClasses ? 'hover:shadow-lg' : ''}`}
              >
                <div className="flex justify-between items-start mb-1 sm:mb-2">
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      dayInfo.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    } ${isTodayDate ? 'text-blue-700' : ''} ${isSelectedDate ? 'text-purple-700' : ''}`}
                  >
                    {dayInfo.day}
                  </span>
                  {hasClasses && (
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-1.5 sm:px-2 py-0.5 rounded-full font-semibold">
                        {dayClasses.length}
                      </span>
                    </div>
                  )}
                  {isTodayDate && (
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </div>

                {/* Classes for this day */}
                <div className="space-y-1">
                  {dayClasses.slice(0, view === 'week' ? 10 : 2).map(cls => (
                    <div
                      key={cls.id}
                      onMouseEnter={(e) => handleClassHover(e, cls)}
                      onMouseLeave={handleClassLeave}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClassClick(cls);
                      }}
                      className={`text-xs p-1.5 sm:p-2 rounded-lg border-l-3 ${getStatusColor(cls.status)} bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group touch-manipulation`}
                    >
                      <div className="font-semibold text-gray-900 truncate mb-1 group-hover:text-blue-700 transition-colors">
                        {cls.title}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 mb-1">
                        {getTimeIcon(cls.startTime)}
                        <span>{formatTime(cls.startTime)}</span>
                      </div>
                      {view === 'week' && (
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <Users className="w-3 h-3" />
                          <span>{cls.students}/{cls.capacity}</span>
                        </div>
                      )}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-3 h-3 text-blue-600" />
                      </div>
                    </div>
                  ))}
                  {dayClasses.length > (view === 'week' ? 10 : 2) && (
                    <div className="text-xs text-blue-600 font-semibold pl-2 hover:text-blue-800 transition-colors cursor-pointer">
                      +{dayClasses.length - (view === 'week' ? 10 : 2)} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-3 sm:px-6 pb-3 sm:pb-4">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm bg-gray-50 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded border border-emerald-600"></div>
            <span className="text-gray-700 font-medium">Confirmada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded border border-amber-600"></div>
            <span className="text-gray-700 font-medium">Pendiente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-rose-500 rounded border border-rose-600"></div>
            <span className="text-gray-700 font-medium">Cancelada</span>
          </div>
          <div className="flex items-center gap-2 text-blue-600">
            <Eye className="w-4 h-4" />
            <span className="font-medium">Hover para detalles • Click para ver reservas</span>
          </div>
        </div>
      </div>

      {/* Upcoming Classes List */}
      <div className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Próximas Clases</h3>
        </div>
        
        <div className="space-y-4">
          {classes
            .filter(cls => new Date(cls.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5)
            .map(cls => (
              <div
                key={cls.id}
                onClick={() => handleClassClick(cls)}
                className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-blue-200 cursor-pointer group touch-manipulation"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{cls.title}</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(cls.status)}`}
                    >
                      {cls.status === 'CONFIRMED'
                        ? 'Confirmada'
                        : cls.status === 'PENDING'
                        ? 'Pendiente'
                        : 'Cancelada'}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span className="font-medium">
                        {new Date(cls.date).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTimeIcon(cls.startTime)}
                      <span>{formatTime(cls.startTime)} - {formatTime(cls.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{cls.students}/{cls.capacity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{cls.location}</span>
                    </div>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            ))}
        </div>

        {classes.filter(cls => new Date(cls.date) >= new Date()).length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Waves className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay clases próximas</h3>
            <p className="text-gray-600">¡Es un buen momento para programar nuevas clases de surf!</p>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {tooltip.show && tooltip.class && (
        <div
          ref={tooltipRef}
          className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 max-w-sm pointer-events-none"
          style={{
            left: tooltip.x - 150,
            top: tooltip.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-gray-900 text-sm">{tooltip.class.title}</h4>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(tooltip.class.status)}`}
              >
                {tooltip.class.status === 'CONFIRMED'
                  ? 'Confirmada'
                  : tooltip.class.status === 'PENDING'
                  ? 'Pendiente'
                  : 'Cancelada'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                {getTimeIcon(tooltip.class.startTime)}
                <span>{formatTime(tooltip.class.startTime)} - {formatTime(tooltip.class.endTime)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{tooltip.class.students}/{tooltip.class.capacity} estudiantes</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{tooltip.class.location}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-blue-100 rounded text-xs flex items-center justify-center font-bold text-blue-700">
                  {tooltip.class.level.charAt(0)}
                </span>
                <span>Nivel: {tooltip.class.level}</span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                <ExternalLink className="w-4 h-4" />
                <span>Click para ver reservas</span>
              </div>
            </div>
          </div>
          
          {/* Tooltip Arrow */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div className="w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  );
}