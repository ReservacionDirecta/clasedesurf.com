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
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden lg:sticky lg:top-24 transition-all hover:shadow-2xl duration-300">
      {/* Header: Price */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Precio total</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-slate-900 tracking-tight">{prices.pen}</span>
          <span className="text-lg text-slate-500 font-medium">{prices.usd}</span>
        </div>
        <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" /> Sin cargos ocultos
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Date & Time Selector */}
        <div>
           <label className="block text-sm font-bold text-slate-700 mb-2">Fecha y Hora</label>
           
           {/* If we have available dates, show split selectors */}
           {availableDates && availableDates.length > 0 ? (
              <div className="space-y-4">
                 {/* 1. Date Selector */}
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <select
                      value={(() => {
                         const currentSession = availableDates.find(d => d.id.toString() === selectedDateId?.toString());
                         if (currentSession) return new Date(currentSession.date).toDateString();
                         return availableDates.length > 0 ? new Date(availableDates[0].date).toDateString() : '';
                      })()}
                      onChange={(e) => {
                         const newDateStr = e.target.value;
                         const firstSessionOfDate = availableDates.find(d => new Date(d.date).toDateString() === newDateStr);
                         if (firstSessionOfDate && onDateChange) {
                            onDateChange(firstSessionOfDate.id);
                         }
                      }}
                      className="block w-full h-14 pl-12 pr-10 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 appearance-none cursor-pointer hover:border-blue-300 transition-all text-base"
                    >
                       {Array.from(new Set(availableDates.map(d => new Date(d.date).toDateString()))).map(dateStr => {
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
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                       <ChevronDown className="w-5 h-5 text-slate-400" />
                    </div>
                 </div>

                 {/* 2. Time Selector (Buttons) */}
                 <div>
                    <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Horarios disponibles</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                       {(() => {
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
                                        h-12 rounded-xl text-sm font-bold border-2 transition-all relative flex items-center justify-center
                                        ${isSelected 
                                           ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 transform scale-[1.02]' 
                                           : 'bg-white text-slate-600 border-slate-100 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600'}
                                     `}
                                  >
                                     {timeLabel}
                                     {isSelected && <Check className="w-3.5 h-3.5 absolute top-1 right-1 text-white/80" />}
                                  </button>
                               );
                           });
                       })()}
                    </div>
                 </div>
              </div>
           ) : (
              // Single date display (fallback)
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm text-blue-600">
                     <Calendar className="w-5 h-5" />
                 </div>
                 <div>
                   <p className="font-bold text-slate-900">
                      {new Date(classData.date).toLocaleDateString('es-ES', { 
                        weekday: 'short', day: 'numeric', month: 'short' 
                      })}
                   </p>
                   <p className="text-sm text-slate-500 font-medium">
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
          <label htmlFor="participants-widget" className="block text-sm font-bold text-slate-700 mb-2">
            Participantes
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <select
              id="participants-widget"
              value={participants}
              onChange={handleParticipantsChange}
              disabled={maxParticipants === 0}
              className="block w-full h-14 pl-12 pr-10 text-base bg-white border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl text-slate-900 font-bold shadow-sm transition-all appearance-none cursor-pointer hover:border-blue-300 disabled:bg-slate-50 disabled:cursor-not-allowed"
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
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          {maxParticipants <= 3 && maxParticipants > 0 && (
            <p className="text-xs text-orange-600 mt-2 flex items-center gap-1.5 font-bold animate-pulse">
              <Info className="w-3.5 h-3.5" />
              ¡Solo quedan {maxParticipants} lugares!
            </p>
          )}
          {maxParticipants === 0 && (
             <p className="text-xs text-red-600 mt-2 flex items-center gap-1.5 font-bold">
              <Info className="w-3.5 h-3.5" />
              Agotado para esta fecha
            </p>
          )}
        </div>

        {/* CTA Button */}
        <Button 
          onClick={() => onReserve(participants)}
          disabled={maxParticipants === 0}
          className="w-full h-16 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300 transition-all transform active:scale-[0.98]"
        >
          {maxParticipants === 0 ? 'Agotado' : 'Reservar ahora'}
        </Button>

        {/* Trust signals */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
           <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-green-500" /> Reserva flexible</span>
              <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-green-500" /> Pago seguro</span>
           </div>
        </div>
      </div>
    </div>
  );
}
