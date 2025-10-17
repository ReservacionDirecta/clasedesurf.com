'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, Edit, Calendar as CalendarIcon, Clock, Users, DollarSign } from 'lucide-react';
import { useApiCall } from '@/hooks/useApiCall';
import { Reservation, Class } from '@/types';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  reservations: Reservation[];
}

interface ReservationCalendarProps {
  onViewReservation?: (reservation: Reservation) => void;
  onEditReservation?: (reservation: Reservation) => void;
  schoolId?: number;
}

export default function ReservationCalendar({ 
  onViewReservation, 
  onEditReservation,
  schoolId 
}: ReservationCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredReservation, setHoveredReservation] = useState<Reservation | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { makeRequest } = useApiCall();

  useEffect(() => {
    fetchReservations();
  }, [currentDate, schoolId]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const params = new URLSearchParams({
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString()
      });
      
      if (schoolId) {
        params.append('schoolId', schoolId.toString());
      }

      const result = await makeRequest(`/api/reservations?${params}`, { method: 'GET' });
      if (result.data) {
        setReservations(result.data);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const currentDateIter = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayReservations = reservations.filter(reservation => {
        if (!reservation.class?.date) return false;
        const reservationDate = new Date(reservation.class.date);
        return (
          reservationDate.getDate() === currentDateIter.getDate() &&
          reservationDate.getMonth() === currentDateIter.getMonth() &&
          reservationDate.getFullYear() === currentDateIter.getFullYear()
        );
      });

      days.push({
        date: new Date(currentDateIter),
        isCurrentMonth: currentDateIter.getMonth() === month,
        reservations: dayReservations
      });
      
      currentDateIter.setDate(currentDateIter.getDate() + 1);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-blue-500';
      case 'PAID':
        return 'bg-green-500';
      case 'PENDING':
        return 'bg-yellow-500';
      case 'CANCELED':
        return 'bg-red-500';
      case 'COMPLETED':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleMouseEnter = (reservation: Reservation, event: React.MouseEvent) => {
    setHoveredReservation(reservation);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredReservation(null);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (hoveredReservation) {
      setMousePosition({ x: event.clientX, y: event.clientY });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const days = getDaysInMonth();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden" onMouseMove={handleMouseMove}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CalendarIcon className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1 bg-white/20 text-white rounded-md hover:bg-white/30 transition-colors text-sm"
            >
              Hoy
            </button>
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-white hover:bg-white/20 rounded-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-white hover:bg-white/20 rounded-md transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const isToday = 
              day.date.getDate() === new Date().getDate() &&
              day.date.getMonth() === new Date().getMonth() &&
              day.date.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={index}
                className={`min-h-[100px] p-2 border border-gray-200 rounded-lg ${
                  day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                } ${isToday ? 'text-blue-600' : ''}`}>
                  {day.date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {day.reservations.slice(0, 3).map((reservation) => (
                    <div
                      key={reservation.id}
                      className={`text-xs p-1 rounded cursor-pointer transition-all hover:scale-105 ${getStatusColor(reservation.status)} text-white`}
                      onMouseEnter={(e) => handleMouseEnter(reservation, e)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => onViewReservation?.(reservation)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate flex-1">
                          {reservation.user?.name?.split(' ')[0] || 'Usuario'}
                        </span>
                        <div className="flex gap-1 ml-1">
                          {onViewReservation && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewReservation(reservation);
                              }}
                              className="hover:bg-white/20 rounded p-0.5"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                          )}
                          {onEditReservation && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditReservation(reservation);
                              }}
                              className="hover:bg-white/20 rounded p-0.5"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-xs opacity-90">
                        {reservation.class?.date ? formatTime(reservation.class.date.toString()) : ''}
                      </div>
                    </div>
                  ))}
                  
                  {day.reservations.length > 3 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{day.reservations.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Tooltip */}
      {hoveredReservation && (
        <div
          className="fixed z-50 bg-gray-900 text-white p-3 rounded-lg shadow-xl max-w-sm pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="font-semibold mb-2">
            {hoveredReservation.class?.title || 'Clase de Surf'}
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{hoveredReservation.user?.name || 'Usuario'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                {hoveredReservation.class?.date ? 
                  new Date(hoveredReservation.class.date).toLocaleString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: 'numeric',
                    month: 'short'
                  }) : 'Fecha no disponible'
                }
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>
                {hoveredReservation.class?.price ? 
                  formatCurrency(hoveredReservation.class.price) : 'Precio no disponible'
                }
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(hoveredReservation.status)}`}></div>
              <span className="capitalize">
                {hoveredReservation.status.toLowerCase().replace('_', ' ')}
              </span>
            </div>
            
            {hoveredReservation.specialRequest && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <div className="text-xs text-gray-300">Solicitud especial:</div>
                <div className="text-sm">{hoveredReservation.specialRequest}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}