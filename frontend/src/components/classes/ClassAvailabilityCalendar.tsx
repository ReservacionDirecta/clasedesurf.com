import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, DollarSign, Users, Lock, Unlock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { formatCurrency } from '@/lib/currency';

interface Slot {
  date: string;
  time: string;
  price: number;
  capacity: number;
  reserved: number;
  available: number;
  isClosed: boolean;
  hasOverride: boolean;
}

interface ClassAvailabilityCalendarProps {
  classId: number | string;
}

export function ClassAvailabilityCalendar({ classId }: ClassAvailabilityCalendarProps) {
  const { data: session } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal State
  const [editPrice, setEditPrice] = useState<number | ''>('');
  const [editCapacity, setEditCapacity] = useState<number | ''>('');
  const [editIsClosed, setEditIsClosed] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSlots = useCallback(async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth(); // 0-indexed
      
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0); // Last day of month

      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/classes/${classId}/calendar?start=${start.toISOString()}&end=${end.toISOString()}`, {
        headers
      });

      if (res.ok) {
        const data = await res.json();
        setSlots(data);
      }
    } catch (error) {
      console.error('Error fetching calendar:', error);
    } finally {
      setLoading(false);
    }
  }, [classId, currentDate, session]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSlotClick = (slot: Slot) => {
    setSelectedSlot(slot);
    setEditPrice(slot.price);
    setEditCapacity(slot.capacity);
    setEditIsClosed(slot.isClosed);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedSlot) return;

    try {
      setSaving(true);
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/classes/${classId}/availability`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          date: selectedSlot.date,
          time: selectedSlot.time,
          price: editPrice === '' ? undefined : Number(editPrice),
          capacity: editCapacity === '' ? undefined : Number(editCapacity),
          isClosed: editIsClosed
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchSlots(); // Refresh
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  // Calendar Grid Generation
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sun
  
  // Group slots by date
  const slotsByDate: {[key: string]: Slot[]} = {};
  slots.forEach(slot => {
    if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
    slotsByDate[slot.date].push(slot);
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Disponibilidad e Inventario</h2>
        <div className="flex items-center gap-4">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
          <span className="font-medium text-lg capitalize">
            {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}

        {/* Empty cells before start of month */}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-white min-h-[100px]" />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0]; // simple YYYY-MM-DD
          // Localize dateStr issue: simpler to construct YYYY-MM-DD manually to avoid timezone shifts
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, '0');
          const dayStr = String(day).padStart(2, '0');
          const dateKey = `${year}-${month}-${dayStr}`;
          
          const daySlots = slotsByDate[dateKey] || [];
          const isPast = new Date(dateKey) < new Date(new Date().setHours(0,0,0,0));

          return (
            <div key={day} className={`bg-white min-h-[100px] p-2 border-t border-l border-transparent hover:bg-gray-50 transition-colors ${isPast ? 'bg-gray-50' : ''}`}>
              <div className="text-right text-sm text-gray-500 mb-2">{day}</div>
              <div className="space-y-1">
                {daySlots.map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSlotClick(slot)}
                    className={`w-full text-left text-xs p-1.5 rounded border transition-all
                      ${slot.isClosed 
                        ? 'bg-red-50 border-red-200 text-red-700' 
                        : slot.hasOverride 
                          ? 'bg-blue-50 border-blue-200 text-blue-700' 
                          : 'bg-green-50 border-green-200 text-green-700'}
                      ${slot.available === 0 && !slot.isClosed ? 'bg-gray-100 text-gray-500 border-gray-200' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{slot.time}</span>
                      {slot.isClosed ? <Lock className="w-3 h-3" /> : (slot.hasOverride && <DollarSign className="w-3 h-3" />)}
                    </div>
                    {!slot.isClosed && (
                      <div className="flex justify-between mt-1">
                         <span>{slot.available}/{slot.capacity}</span>
                         <span>S/.{slot.price}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {isModalOpen && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Gestionar Horario: {selectedSlot.date} {selectedSlot.time}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${editIsClosed ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {editIsClosed ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Estado del Turno</p>
                    <p className="text-xs text-gray-500">{editIsClosed ? 'Cerrado para reservas' : 'Abierto y disponible'}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={!editIsClosed}
                    onChange={(e) => setEditIsClosed(!e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {!editIsClosed && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio (Override)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">S/.</span>
                      </div>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        placeholder={String(selectedSlot.price)}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Deja vacío para usar el precio base de la clase.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad Total</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        value={editCapacity}
                        onChange={(e) => setEditCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                        className="pl-9 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        placeholder={String(selectedSlot.capacity)}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedSlot.reserved} reservados actualmente.
                    </p>
                  </div>
                </>
              )}
              
              <div className="pt-4 flex gap-3">
                 <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
