'use client'

import { useState, useRef, useEffect } from 'react'
import { CalendarIcon } from './Icons'

interface DatePickerProps {
  value?: string
  onChange?: (date: string) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ value, onChange, placeholder = "Seleccionar fecha", className = "" }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(value || '')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Cerrar el calendario cuando se hace click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    onChange?.(date)
    setIsOpen(false)
  }

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return placeholder
    
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    // Formatear fecha
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    }
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoy'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana'
    } else {
      return date.toLocaleDateString('es-ES', options)
    }
  }

  const getQuickDates = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const thisWeekend = new Date(today)
    const daysUntilSaturday = 6 - today.getDay()
    thisWeekend.setDate(today.getDate() + daysUntilSaturday)
    
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)

    return [
      { label: 'Hoy', date: today.toISOString().split('T')[0] },
      { label: 'Mañana', date: tomorrow.toISOString().split('T')[0] },
      { label: 'Este fin de semana', date: thisWeekend.toISOString().split('T')[0] },
      { label: 'Próxima semana', date: nextWeek.toISOString().split('T')[0] }
    ]
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="search-input-enhanced search-element-transition w-full px-3 py-2 rounded-lg text-sm font-medium cursor-pointer flex items-center justify-between"
      >
        <span className={selectedDate ? 'text-gray-900' : 'text-gray-500'}>
          {formatDisplayDate(selectedDate)}
        </span>
        <CalendarIcon className={`w-4 h-4 text-cyan-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Hidden native input for form submission */}
      <input
        ref={inputRef}
        type="date"
        value={selectedDate}
        onChange={(e) => handleDateChange(e.target.value)}
        className="sr-only"
      />

      {/* Custom Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Quick Date Options */}
          <div className="p-4 border-b border-gray-100">
            <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">Fechas rápidas</h4>
            <div className="grid grid-cols-2 gap-2">
              {getQuickDates().map((quickDate) => (
                <button
                  key={quickDate.label}
                  onClick={() => handleDateChange(quickDate.date)}
                  className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 rounded-lg transition-colors duration-200 font-medium"
                >
                  {quickDate.label}
                </button>
              ))}
            </div>
          </div>

          {/* Native Date Picker */}
          <div className="p-4">
            <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">Seleccionar fecha</h4>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-200 focus:border-cyan-500 text-sm"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Clear Option */}
          {selectedDate && (
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => handleDateChange('')}
                className="w-full text-center px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                Limpiar fecha
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}