'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

// --- Types ---
interface CustomMobileDatePickerProps {
  isOpen: boolean
  onClose: () => void
  value?: string
  onChange: (date: string) => void
  minDate?: string
  // If true, behaves as an inline component (no modal wrapper)
  inline?: boolean 
}

export function CustomMobileDatePicker({
  isOpen,
  onClose,
  value,
  onChange,
  minDate,
  inline = false
}: CustomMobileDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // Sync view only when opening (if not inline) or value changes
  useEffect(() => {
    if (isOpen || inline) {
      if (value) {
        const date = new Date(value)
        const userTimezoneOffset = date.getTimezoneOffset() * 60000
        setCurrentMonth(new Date(date.getTime() + userTimezoneOffset))
      } else {
        // Only reset to today if no value is present
        // Use functional update to avoid resetting user navigation if it's already set?
        // Actually, resetting to today on open is fine.
        if (!inline) setCurrentMonth(new Date())
      }
    }
  }, [isOpen, value, inline])

  if (!isOpen && !inline) return null

  // Helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const days: (Date | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i))

  const handlePrevMonth = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCurrentMonth(new Date(year, month - 1, 1))
  }
  const handleNextMonth = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const handleDateClick = (e: React.MouseEvent, date: Date) => {
    e.stopPropagation()
    const yearStr = date.getFullYear()
    const monthStr = String(date.getMonth() + 1).padStart(2, '0')
    const dayStr = String(date.getDate()).padStart(2, '0')
    const dateString = `${yearStr}-${monthStr}-${dayStr}`
    
    onChange(dateString)
    if (!inline) onClose()
  }

  const isSelected = (date: Date) => {
    if (!value) return false
    const yearStr = date.getFullYear()
    const monthStr = String(date.getMonth() + 1).padStart(2, '0')
    const dayStr = String(date.getDate()).padStart(2, '0')
    return value === `${yearStr}-${monthStr}-${dayStr}`
  }

  const isDisabled = (date: Date) => {
    if (!minDate) return false
    const min = new Date(minDate)
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const m = new Date(min.getFullYear(), min.getMonth(), min.getDate())
    return d < m
  }

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  // --- Render Content (The Calendar) ---
  const CalendarContent = () => (
    <div className={`${inline ? 'p-0' : 'p-4'}`}>
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-2">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <div className="font-bold text-gray-800 text-sm sm:text-base">
                {months[month]} {year}
            </div>
            <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronRight size={20} className="text-gray-600" />
            </button>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 mb-1 text-center">
            {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map(day => (
                <div key={day} className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">
                    {day}
                </div>
            ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {days.map((date, index) => {
                if (!date) return <div key={`empty-${index}`} />
                
                const disabled = isDisabled(date)
                const selected = isSelected(date)
                const isToday = new Date().toDateString() === date.toDateString()

                return (
                    <button
                        key={index}
                        onClick={(e) => !disabled && handleDateClick(e, date)}
                        disabled={disabled}
                        className={`
                            h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-full text-xs sm:text-sm font-medium transition-all
                            ${selected 
                                ? 'bg-[#FF3366] text-white font-bold shadow-md scale-105' 
                                : disabled
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }
                            ${isToday && !selected ? 'border border-[#FF3366] text-[#FF3366]' : ''}
                        `}
                    >
                        {date.getDate()}
                    </button>
                )
            })}
        </div>
    </div>
  )

  // If inline, just return the content div
  if (inline) {
    return (
      <div className="w-full bg-white animate-in fade-in zoom-in-95 duration-200">
        <CalendarContent />
        {value && (
            <div className="mt-2 text-center border-t border-gray-100 pt-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); onChange(''); }}
                  className="text-xs text-red-500 font-medium hover:underline"
                >
                    Borrar fecha
                </button>
            </div>
        )}
      </div>
    )
  }

  // If modal (mobile)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-[#011627] text-white p-4 flex items-center justify-between">
            <h3 className="font-bold text-lg">Selecciona una fecha</h3>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X size={20} />
            </button>
        </div>
        <CalendarContent />
      </div>
    </div>
  )
}
