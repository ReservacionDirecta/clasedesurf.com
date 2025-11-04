'use client'

import type { ChangeEvent } from 'react'

interface DatePickerProps {
  value?: string
  onChange?: (date: string) => void
  placeholder?: string
  className?: string
  min?: string
  max?: string
}

export function DatePicker({
  value = '',
  onChange,
  placeholder = 'Seleccionar fecha',
  className = '',
  min,
  max
}: DatePickerProps) {
  const hasValue = value !== ''

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value)
  }

  return (
    <div className={`relative ${className}`}>
      {!hasValue && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
          {placeholder}
        </span>
      )}
      <input
        type="date"
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        aria-label={placeholder}
        className={`w-full appearance-none rounded-lg border border-[#CBD5E1] bg-white px-3 py-3 sm:py-2 text-sm font-medium text-[#011627] transition-all duration-200 focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#9DE6DC] ${hasValue ? '' : 'text-transparent'} cursor-pointer`}
      />
    </div>
  )
}