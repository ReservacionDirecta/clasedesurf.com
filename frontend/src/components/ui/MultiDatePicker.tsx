'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface MultiDatePickerProps {
  selectedDates: string[];
  onChange: (dates: string[]) => void;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function MultiDatePicker({
  selectedDates,
  onChange,
  minDate,
  maxDate,
  className = ''
}: MultiDatePickerProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const minDateObj = minDate ? new Date(minDate) : null;
  const maxDateObj = maxDate ? new Date(maxDate) : null;

  const toggleDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    if (selectedDates.includes(dateStr)) {
      onChange(selectedDates.filter(d => d !== dateStr));
    } else {
      onChange([...selectedDates, dateStr].sort());
    }
  };

  const isDateSelected = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return selectedDates.includes(dateStr);
  };

  const isDateDisabled = (date: Date) => {
    if (minDateObj && date < minDateObj) return true;
    if (maxDateObj && date > maxDateObj) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const days = [];
  // Días vacíos al inicio
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900">
          {MONTHS[currentMonth]} {currentYear}
        </h3>
        <button
          type="button"
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendario */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const date = new Date(currentYear, currentMonth, day);
          const isSelected = isDateSelected(date);
          const isDisabled = isDateDisabled(date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <button
              key={day}
              type="button"
              onClick={() => !isDisabled && toggleDate(date)}
              disabled={isDisabled}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all
                ${isDisabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : isSelected
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
                }
                ${isToday && !isSelected ? 'ring-2 ring-blue-300' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Fechas seleccionadas */}
      {selectedDates.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">
              Fechas seleccionadas ({selectedDates.length})
            </p>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Limpiar todas
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedDates.map((dateStr) => {
              const date = new Date(dateStr);
              return (
                <div
                  key={dateStr}
                  className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                >
                  <span>{date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                  <button
                    type="button"
                    onClick={() => onChange(selectedDates.filter(d => d !== dateStr))}
                    className="hover:text-blue-900"
                    aria-label="Eliminar fecha"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

