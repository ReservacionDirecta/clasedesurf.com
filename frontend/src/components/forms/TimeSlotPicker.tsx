
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Clock } from 'lucide-react';
import React from 'react';

interface TimeSlotPickerProps {
  times: string[];
  onChange: (times: string[]) => void;
  className?: string;
  label?: string;
}

export function TimeSlotPicker({ times, onChange, className = '', label = 'Horarios' }: TimeSlotPickerProps) {
  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    onChange(newTimes);
  };

  const addTime = () => {
    onChange([...times, '']);
  };

  const removeTime = (index: number) => {
    if (times.length <= 1) {
      if (times.length === 1) handleTimeChange(0, '');
      return;
    }
    const newTimes = times.filter((_, i) => i !== index);
    onChange(newTimes);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <Clock className="w-4 h-4 text-slate-400" />
        {label}
      </label>
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
        {times.map((time, idx) => (
          <div key={idx} className="flex gap-2 animate-in fade-in zoom-in duration-200 w-full sm:w-auto">
            <input
              type="time"
              value={time}
              onChange={(e) => handleTimeChange(idx, e.target.value)}
              className="flex-1 sm:w-32 h-10 text-center font-mono rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 p-2.5 text-sm transition-all shadow-sm border placeholder:text-slate-400"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={times.length === 1 && !time} // Disable trash if only one empty slot
              onClick={() => removeTime(idx)}
              className="h-10 w-10 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors shrink-0"
              title="Eliminar horario"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={addTime}
          className="h-10 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar hora
        </Button>
      </div>
      {times.filter(t => !!t).length === 0 && (
         <p className="text-xs text-amber-600 font-medium mt-1">
           * Debes agregar al menos un horario.
         </p>
      )}
    </div>
  );
}
