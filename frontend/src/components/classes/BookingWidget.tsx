import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { formatDualCurrency } from '@/lib/currency';
import { Users, Calendar, Check, Info, ChevronDown } from 'lucide-react';

interface AvailableDate {
  date: string;
  id: string | number;
  startTime: string;
  endTime: string;
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
  
  // Ensure strict participants limit based on available spots
  const maxParticipants = Math.min(classData.availableSpots, 10);
  
  // Calculate total price
  const totalPrice = classData.price * participants; // Precio base es por persona
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
    const s = new Date(start);
    const e = new Date(end);
    
    return `${d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })} • ${s.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
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
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
               <Calendar className="w-5 h-5 text-blue-600" />
             </div>
             
             {/* If we have available dates, show a Select, otherwise just a read-only-like div */}
             {availableDates && availableDates.length > 0 ? (
                <div className="relative">
                  <select
                    value={selectedDateId ? selectedDateId.toString() : classData.id.toString()}
                    onChange={handleDateChange}
                    className="block w-full pl-10 pr-10 py-3 text-sm font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    {availableDates.map((date) => (
                      <option key={date.id} value={date.id.toString()}>
                         {formatDateLabel(date.date, date.startTime, date.endTime)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                     <ChevronDown className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
             ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 pl-10 flex items-center justify-between">
                   <div>
                     <p className="text-sm font-semibold text-gray-900">
                        {new Date(classData.date).toLocaleDateString('es-ES', { 
                          weekday: 'short', day: 'numeric', month: 'short' 
                        })}
                     </p>
                     <p className="text-xs text-gray-600">
                        {new Date(classData.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(classData.endTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                     </p>
                   </div>
                </div>
             )}
          </div>
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
              className="block w-full pl-10 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border hover:border-gray-400 transition-colors bg-white appearance-none cursor-pointer"
            >
              {Array.from({ length: Math.min(maxParticipants, 5) }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'persona' : 'personas'}
                </option>
              ))}
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
              Agotado
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
