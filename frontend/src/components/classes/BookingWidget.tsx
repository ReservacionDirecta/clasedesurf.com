import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { formatDualCurrency } from '@/lib/currency';
import { Users, Calendar, Check, Info, ChevronDown } from 'lucide-react';

interface AvailableDate {
  date: string;
  id: string | number;
  startTime: string;
  endTime: string;
  price?: number;
  availableSpots?: number;
}

interface BookingWidgetProps {
  classData: {
    id: number | string;
    price: number;
    currency: string;
    date: string | Date;
    startTime: string | Date;
    endTime: string | Date;
    availableSpots: number;
    capacity: number;
  };
  initialParticipants?: number;
  onReserve: (participants: number) => void;
  availableDates?: AvailableDate[];
  onDateChange?: (classId: string | number) => void;
  selectedDateId?: string | number;
}

export function BookingWidget({ classData, initialParticipants = 1, onReserve, availableDates = [], onDateChange, selectedDateId }: BookingWidgetProps) {
  const [participants, setParticipants] = useState(initialParticipants);

  useEffect(() => {
    setParticipants(initialParticipants);
  }, [initialParticipants]);

  // Determine effective class data based on selection
  const selectedDateObj = availableDates.find(d => d.id.toString() === (selectedDateId?.toString() || classData.id.toString()));
  
  const effectivePrice = selectedDateObj?.price ?? classData.price;
  const effectiveAvailableSpots = selectedDateObj?.availableSpots ?? classData.availableSpots;

  // Ensure strict participants limit based on available spots
  const maxParticipants = Math.min(effectiveAvailableSpots, 10);
  
  // Calculate total price
  const totalPrice = effectivePrice * participants; // Precio base es por persona
  const prices = formatDualCurrency(totalPrice);

  const handleParticipantsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setParticipants(Number(e.target.value));
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onDateChange) {
      onDateChange(e.target.value);
    }
  };

  const formatDateLabel = (dateStr: string | Date, start: string | Date, end: string | Date) => {
    const d = new Date(dateStr);
    
    // Helper to extract time string
    const formatTimeStr = (t: string | Date) => {
      if (t instanceof Date) return t.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
      if (typeof t === 'string' && t.includes('T')) return new Date(t).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
      return String(t).substring(0, 5); // Assume HH:mm or HH:mm:ss
    };

    return `${d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })} • ${formatTimeStr(start)}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden sticky top-24">
      {/* Header: Price */}
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <p className="text-sm text-gray-500 font-medium mb-1">Precio total</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[#011627]">{prices.pen}</span>
          <span className="text-lg text-gray-500">{prices.usd}</span>
        </div>
        <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
          <Check className="w-3 h-3" /> Sin cargos ocultos
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Date & Time Selector */}
        <div>
           <label className="block text-sm font-bold text-gray-700 mb-2">Fecha y Hora</label>
           
           {/* If we have available dates, show split selectors */}
           {availableDates && availableDates.length > 0 ? (
              <div className="space-y-4">
                 {/* 1. Date Selector */}
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <select
                      value={(() => {
                         // Find the date string of the currently selected session
                         const currentSession = availableDates.find(d => d.id.toString() === selectedDateId?.toString());
                         if (currentSession) return new Date(currentSession.date).toDateString();
                         // Default to first available date string if nothing selected
                         return availableDates.length > 0 ? new Date(availableDates[0].date).toDateString() : '';
                      })()}
                      onChange={(e) => {
                         // When date changes, auto-select the first time slot for that new date
                         // Or just switch the view??
                         // Better UX: Switch view to that date, let user pick time? 
                         // But we need to trigger onDateChange with a VALID session ID.
                         // Let's find the first session of the new date.
                         const newDateStr = e.target.value; // timestamp string or date string?
                         // e.target.value will be the one we set in <option value=...>
                         
                         const firstSessionOfDate = availableDates.find(d => new Date(d.date).toDateString() === newDateStr);
                         if (firstSessionOfDate && onDateChange) {
                            onDateChange(firstSessionOfDate.id);
                         }
                      }}
                      className="block w-full pl-10 pr-10 py-3 text-sm font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                       {/* Get Unique Dates */}
                       {Array.from(new Set(availableDates.map(d => new Date(d.date).toDateString()))).map(dateStr => {
                          // Display Label
                          const dateObj = new Date(dateStr); // This might be approximate if dateStr is simple
                          // We need a robust way. Let's find the first session with this dateStr to use its date object for formatting
                          const repSession = availableDates.find(d => new Date(d.date).toDateString() === dateStr);
                          if (!repSession) return null;
                          
                          const d = new Date(repSession.date);
                          const label = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
                          return (
                             <option key={dateStr} value={dateStr}>
                                {label.charAt(0).toUpperCase() + label.slice(1)}
                             </option>
                          );
                       })}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                       <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                 </div>

                 {/* 2. Time Selector (Buttons) */}
                 <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Horarios disponibles</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                       {(() => {
                           // Filter sessions for the currently selected date
                           const currentSelectedSession = availableDates.find(d => d.id.toString() === selectedDateId?.toString());
                           const targetDateString = currentSelectedSession 
                              ? new Date(currentSelectedSession.date).toDateString()
                              : (availableDates.length > 0 ? new Date(availableDates[0].date).toDateString() : '');
                           
                           const sessionsOnDate = availableDates.filter(d => new Date(d.date).toDateString() === targetDateString);
                           
                           return sessionsOnDate.map(session => {
                              const isSelected = selectedDateId?.toString() === session.id.toString();
                              const timeLabel = session.startTime.substring(0, 5);
                              
                              return (
                                 <button
                                    key={session.id}
                                    onClick={() => onDateChange && onDateChange(session.id)}
                                    className={`
                                       py-2 px-3 rounded-lg text-sm font-bold border transition-all relative
                                       ${isSelected 
                                          ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' 
                                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'}
                                    `}
                                 >
                                    {timeLabel}
                                    {isSelected && <Check className="w-3 h-3 absolute top-1 right-1 text-white/80" />}
                                 </button>
                              );
                           });
                       })()}
                    </div>
                 </div>
              </div>
           ) : (
              // Single date display (fallback)
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 pl-10 flex items-center justify-between">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Calendar className="w-5 h-5 text-gray-400" />
                 </div>
                 <div>
                   <p className="text-sm font-semibold text-gray-900">
                      {new Date(classData.date).toLocaleDateString('es-ES', { 
                        weekday: 'short', day: 'numeric', month: 'short' 
                      })}
                   </p>
                   <p className="text-xs text-gray-600">
                      {typeof classData.startTime === 'string' && !classData.startTime.includes('T') 
                         ? classData.startTime.substring(0, 5) 
                         : new Date(classData.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                   </p>
                 </div>
              </div>
           )}
        </div>

        {/* Participants Selector */}
        <div>
          <label htmlFor="participants-widget" className="block text-sm font-bold text-gray-700 mb-2">
            Participantes
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <select
              id="participants-widget"
              value={participants}
              onChange={handleParticipantsChange}
              disabled={maxParticipants === 0}
              className="block w-full pl-10 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border hover:border-gray-400 transition-colors bg-white appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {maxParticipants > 0 ? (
                  Array.from({ length: Math.min(maxParticipants, 5) }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'persona' : 'personas'}
                    </option>
                  ))
              ) : (
                  <option value="0">0 personas</option>
              )}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
          {maxParticipants <= 3 && maxParticipants > 0 && (
            <p className="text-xs text-orange-600 mt-2 flex items-center gap-1 font-medium">
              <Info className="w-3 h-3" />
              ¡Solo quedan {maxParticipants} lugares!
            </p>
          )}
          {maxParticipants === 0 && (
             <p className="text-xs text-red-600 mt-2 flex items-center gap-1 font-medium">
              <Info className="w-3 h-3" />
              Agotado para esta fecha
            </p>
          )}
        </div>

        {/* CTA Button */}
        <Button 
          onClick={() => onReserve(participants)}
          disabled={maxParticipants === 0}
          className="w-full bg-[#0071EB] hover:bg-[#005bbd] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all h-auto text-lg touch-target"
        >
          {maxParticipants === 0 ? 'Agotado' : 'Reservar ahora'}
        </Button>

        {/* Trust signals */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            <span>Reserva gratuita - Paga luego</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            <span>Cancelación gratuita hasta 24h antes</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            <span>Confirmación inmediata</span>
          </div>
        </div>
      </div>
    </div>
  );
}
