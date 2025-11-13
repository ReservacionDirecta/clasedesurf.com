'use client'

import React from 'react'

interface ClassFiltersProps {
  onFilterChange: (filters: FilterValues) => void
  onReset: () => void
}

export interface FilterValues {
  date?: string
  level?: string
  type?: string
  locality?: string
}

export function ClassFilters({ onFilterChange, onReset }: ClassFiltersProps) {
  const [filters, setFilters] = React.useState<FilterValues>({})

  const handleChange = (field: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [field]: value || undefined }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSearch = () => {
    onFilterChange(filters)
  }

  const handleReset = () => {
    setFilters({})
    onReset()
  }

  return (
    <div className="relative bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl ring-1 ring-[#2EC4B6]/15 border border-white/60 mx-2 sm:mx-0 overflow-visible">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 items-end">
        {/* Location Filter */}
        <div className="sm:col-span-1 lg:col-span-1">
          <label htmlFor="search-location" className="flex items-center text-xs font-semibold text-[#011627] mb-1">
            <svg className="w-3 h-3 mr-1 text-[#2EC4B6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Ubicación
          </label>
          <select
            id="search-location"
            value={filters.locality || ''}
            onChange={(e) => handleChange('locality', e.target.value)}
            className="search-input-enhanced search-select-enhanced search-element-transition w-full px-3 py-3 sm:py-2 rounded-lg text-sm font-medium touch-target-md border-[#CBD5E1] text-[#011627] focus:border-[#2EC4B6] focus:ring-[#9DE6DC]"
          >
            <option value="">Todas</option>
            <option value="Costa Verde">Costa Verde</option>
            <option value="Punta Hermosa">Punta Hermosa</option>
            <option value="San Bartolo">San Bartolo</option>
          </select>
        </div>

        {/* Level Filter */}
        <div className="sm:col-span-1 lg:col-span-1">
          <label htmlFor="search-level" className="flex items-center text-xs font-semibold text-[#011627] mb-1">
            <svg className="w-3 h-3 mr-1 text-[#2EC4B6]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4S13.1 6 12 6 10 5.1 10 4 10.9 2 12 2M21 9V7L15 1H9V3H7.5C7.1 3 6.7 3.1 6.4 3.2L4 4.2C3.4 4.4 3 5 3 5.6V6C3 6.6 3.4 7 4 7H5.2L6.2 16.8C6.3 17.4 6.8 17.8 7.4 17.8H8.6C9.2 17.8 9.7 17.4 9.8 16.8L10.8 7H15V9C15 9.6 15.4 10 16 10S17 9.6 17 10V9H21M19 12H5C4.4 12 4 12.4 4 13S4.4 14 5 14H19C19.6 14 20 13.6 20 13S19.6 12 19 12Z"></path>
            </svg>
            Nivel
          </label>
          <select
            id="search-level"
            value={filters.level || ''}
            onChange={(e) => handleChange('level', e.target.value)}
            className="search-input-enhanced search-select-enhanced search-element-transition w-full px-3 py-3 sm:py-2 rounded-lg text-sm font-medium touch-target-md border-[#CBD5E1] text-[#011627] focus:border-[#2EC4B6] focus:ring-[#9DE6DC]"
          >
            <option value="">Todos</option>
            <option value="BEGINNER">Principiante</option>
            <option value="INTERMEDIATE">Intermedio</option>
            <option value="ADVANCED">Avanzado</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="search-date" className="flex items-center text-xs font-semibold text-[#011627] mb-1">
            <svg className="w-3 h-3 mr-1 text-[#2EC4B6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Fecha
          </label>
          <div className="relative w-full touch-target-md">
            <input
              id="search-date"
              aria-label="Cualquier fecha"
              type="date"
              value={filters.date || ''}
              onChange={(e) => handleChange('date', e.target.value)}
              className="w-full appearance-none rounded-lg border border-[#CBD5E1] bg-white px-3 py-3 sm:py-2 text-sm font-medium text-[#011627] transition-all duration-200 focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#9DE6DC] cursor-pointer"
            />
          </div>
        </div>

        {/* Type Filter (replaces price) */}
        <div className="sm:col-span-1 lg:col-span-1">
          <label htmlFor="search-type" className="flex items-center text-xs font-semibold text-[#011627] mb-1">
            <svg className="w-3 h-3 mr-1 text-[#2EC4B6]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 4C18.2 4 20 5.8 20 8S18.2 12 16 12 12 10.2 12 8 13.8 4 16 4M16 14C18.7 14 24 15.3 24 18V20H8V18C8 15.3 13.3 14 16 14M8 4C10.2 4 12 5.8 12 8S10.2 12 8 12 4 10.2 4 8 5.8 4 8 4M8 14C10.7 14 16 15.3 16 18V20H0V18C0 15.3 5.3 14 8 14Z"></path>
            </svg>
            Tipo de Clase
          </label>
          <select
            id="search-type"
            value={filters.type || ''}
            onChange={(e) => handleChange('type', e.target.value)}
            className="search-input-enhanced search-select-enhanced search-element-transition w-full px-3 py-3 sm:py-2 rounded-lg text-sm font-medium touch-target-md border-[#CBD5E1] text-[#011627] focus:border-[#2EC4B6] focus:ring-[#9DE6DC]"
          >
            <option value="">Todos</option>
            <option value="GROUP">Grupales</option>
            <option value="PRIVATE">Personalizadas</option>
            <option value="INTENSIVE">Pro</option>
          </select>
        </div>

        {/* Search Button */}
        <div className="sm:col-span-1 lg:col-span-1">
          <button
            onClick={handleSearch}
            className="inline-flex items-center justify-center font-bold transition-all duration-200 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none touch-target btn-primary-marketplace h-12 py-3 px-6 text-base min-h-[48px] search-element-transition touch-target-lg w-full bg-gradient-to-r from-[#FF3366] to-[#D12352] text-white font-bold px-4 py-3 sm:py-2 rounded-lg transition-all duration-300 flex items-center justify-center text-sm shadow-lg hover:shadow-xl"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            BUSCAR
          </button>
        </div>
      </div>

      {/* Reset Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleReset}
          className="px-3 py-2 border border-[#CBD5E1] rounded-md text-[#46515F] hover:text-[#011627] hover:bg-[#E9FBF7] transition-colors duration-200 flex items-center justify-center touch-target-md"
          title="Limpiar filtros"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.36 2.72L20.78 4.14L15.06 9.85C16.13 11.39 16.28 13.24 15.38 14.44L9.06 8.12C10.26 7.22 12.11 7.37 13.65 8.44L19.36 2.72M5.93 17.57C3.92 15.56 2.69 13.16 2.35 10.92L7.23 8.83L14.67 16.27L12.58 21.15C10.34 20.81 7.94 19.58 5.93 17.57Z"></path>
          </svg>
          Limpiar filtros
        </button>
      </div>
    </div>
  )
}
