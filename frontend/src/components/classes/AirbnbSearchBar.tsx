'use client'

import React, { useState, useRef, useEffect } from 'react'

interface AirbnbSearchBarProps {
  onFilterChange: (filters: FilterValues) => void
  onReset: () => void
}

export interface FilterValues {
  date?: string
  level?: string
  type?: string
  locality?: string
}

export function AirbnbSearchBar({ onFilterChange, onReset }: AirbnbSearchBarProps) {
  const [filters, setFilters] = useState<FilterValues>({})
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dateInputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!activeDropdown) return

    const handleClickOutside = (event: MouseEvent) => {
      const isMobile = window.innerWidth < 640
      if (isMobile) {
        // On mobile, backdrop click handles closing, which is handled inline.
        return
      }

      if (
        searchBarRef.current && !searchBarRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [activeDropdown])

  const handleChange = (field: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [field]: value || undefined }
    setFilters(newFilters)
    onFilterChange(newFilters)
    // Don't close dropdown on mobile to allow multiple selections
    const isMobile = window.innerWidth < 640
    if (!isMobile) {
      setActiveDropdown(null)
    }
  }
  
  const handleMobileChangeAndClose = (field: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [field]: value || undefined }
    setFilters(newFilters)
    onFilterChange(newFilters)
    setActiveDropdown(null)
  }


  const handleReset = () => {
    setFilters({})
    onReset()
    setActiveDropdown(null)
  }

  const toggleDropdown = (field: string) => {
    if (field === 'date') {
      const isMobile = window.innerWidth < 640
      if (isMobile) {
        setTimeout(() => {
          if (dateInputRef.current) {
            try {
              dateInputRef.current.showPicker()
            } catch (error) {
              dateInputRef.current.click()
            }
          }
        }, 50)
        return
      }
    }
    setActiveDropdown(activeDropdown === field ? null : field)
  }

  const getDisplayValue = (field: keyof FilterValues, options: { value: string; label: string }[]) => {
    const value = filters[field]
    if (!value) return null
    const option = options.find(opt => opt.value === value)
    return option?.label || value
  }

  const locationOptions = [
    { value: 'Costa Verde', label: 'Costa Verde' },
    { value: 'Punta Hermosa', label: 'Punta Hermosa' },
    { value: 'San Bartolo', label: 'San Bartolo' }
  ]

  const levelOptions = [
    { value: 'BEGINNER', label: 'Principiante' },
    { value: 'INTERMEDIATE', label: 'Intermedio' },
    { value: 'ADVANCED', label: 'Avanzado' }
  ]

  const typeOptions = [
    { value: 'GROUP', label: 'Grupales' },
    { value: 'PRIVATE', label: 'Personalizadas' },
    { value: 'INTENSIVE', label: 'Pro' }
  ]

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    })
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '')

  const renderDropdownContent = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
    const changeHandler = isMobile ? handleMobileChangeAndClose : handleChange

    switch (activeDropdown) {
      case 'locality':
        return (
          <div>
            <h3 className="text-lg font-semibold text-[#011627] mb-4">Selecciona ubicación</h3>
            <div className="space-y-2">
              <button
                onClick={() => changeHandler('locality', '')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-sm ${
                  !filters.locality
                    ? 'bg-gray-100 text-blue-600 font-semibold'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                Todas las ubicaciones
              </button>
              {locationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => changeHandler('locality', option.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-sm ${
                    filters.locality === option.value
                      ? 'bg-gray-100 text-blue-600 font-semibold'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 'date':
         return (
          <div className="hidden sm:block">
            <h3 className="text-lg font-semibold text-[#011627] mb-4">Selecciona fecha</h3>
            <input
              type="date"
              value={filters.date || ''}
              onChange={(e) => handleChange('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {filters.date && (
              <button
                onClick={() => handleChange('date', '')}
                className="mt-4 text-sm text-blue-600 hover:underline"
              >
                Limpiar fecha
              </button>
            )}
          </div>
        );
      case 'level':
        return (
          <div>
            <h3 className="text-lg font-semibold text-[#011627] mb-4">Selecciona nivel</h3>
            <div className="space-y-2">
              <button
                onClick={() => changeHandler('level', '')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-sm ${
                  !filters.level
                    ? 'bg-gray-100 text-blue-600 font-semibold'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                Todos los niveles
              </button>
              {levelOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => changeHandler('level', option.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-sm ${
                    filters.level === option.value
                      ? 'bg-gray-100 text-blue-600 font-semibold'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 'type':
        return (
          <div>
            <h3 className="text-lg font-semibold text-[#011627] mb-4">Selecciona tipo de clase</h3>
            <div className="space-y-2">
              <button
                onClick={() => changeHandler('type', '')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-sm ${
                  !filters.type
                    ? 'bg-gray-100 text-blue-600 font-semibold'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                Todos los tipos
              </button>
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => changeHandler('type', option.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-sm ${
                    filters.type === option.value
                      ? 'bg-gray-100 text-blue-600 font-semibold'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="relative w-full">
      {/* Main Search Bar */}
      <div ref={searchBarRef} className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl sm:rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200 overflow-hidden">
        {/* Location Button */}
        <div className="flex-1">
          <button
            onClick={() => toggleDropdown('locality')}
            className={`w-full px-4 sm:px-6 py-3 sm:py-4 text-left border-b sm:border-b-0 sm:border-r border-gray-200 hover:bg-gray-50 transition-colors ${
              filters.locality ? 'font-semibold text-gray-900' : 'text-gray-500'
            } ${activeDropdown === 'locality' ? 'bg-gray-50' : ''}`}
          >
            <div className="text-xs font-bold uppercase tracking-wider">¿Dónde?</div>
            <div className="text-sm truncate">
              {getDisplayValue('locality', locationOptions) || 'Cualquier ubicación'}
            </div>
          </button>
        </div>

        {/* Date Button */}
        <div className="relative flex-1">
          <button
            onClick={() => toggleDropdown('date')}
            type="button"
            className={`w-full px-4 sm:px-6 py-3 sm:py-4 text-left border-b sm:border-b-0 sm:border-r border-gray-200 hover:bg-gray-50 transition-colors ${
              filters.date ? 'font-semibold text-gray-900' : 'text-gray-500'
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider">¿Cuándo?</div>
            <div className="text-sm truncate">
              {formatDate(filters.date) || 'Cualquier fecha'}
            </div>
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={filters.date || ''}
            onChange={(e) => handleChange('date', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="absolute inset-0 w-full h-full opacity-0 sm:hidden"
            aria-label="Seleccionar fecha"
            tabIndex={-1}
          />
        </div>

        {/* Level Button */}
        <div className="flex-1">
          <button
            onClick={() => toggleDropdown('level')}
            className={`w-full px-4 sm:px-6 py-3 sm:py-4 text-left border-b sm:border-b-0 sm:border-r border-gray-200 hover:bg-gray-50 transition-colors ${
              filters.level ? 'font-semibold text-gray-900' : 'text-gray-500'
            } ${activeDropdown === 'level' ? 'bg-gray-50' : ''}`}
          >
            <div className="text-xs font-bold uppercase tracking-wider">Nivel</div>
            <div className="text-sm truncate">
              {getDisplayValue('level', levelOptions) || 'Cualquier nivel'}
            </div>
          </button>
        </div>

        {/* Type Button */}
        <div className="flex-1">
          <button
            onClick={() => toggleDropdown('type')}
            className={`w-full px-4 sm:px-6 py-3 sm:py-4 text-left border-b-0 sm:border-b-0 sm:border-r-0 sm:border-r border-gray-200 hover:bg-gray-50 transition-colors ${
              filters.type ? 'font-semibold text-gray-900' : 'text-gray-500'
            } ${activeDropdown === 'type' ? 'bg-gray-50' : ''}`}
          >
            <div className="text-xs font-bold uppercase tracking-wider">Tipo</div>
            <div className="text-sm truncate">
              {getDisplayValue('type', typeOptions) || 'Cualquier tipo'}
            </div>
          </button>
        </div>

        {/* Search Button */}
        <div className="p-2">
          <button
            onClick={() => {
              onFilterChange(filters)
              setActiveDropdown(null)
            }}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full flex items-center justify-center p-3"
            aria-label="Buscar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="sr-only sm:not-sr-only sm:ml-2">Buscar</span>
          </button>
        </div>
      </div>

      {/* Unified Dropdown Container - Modal on mobile, Dropdown on desktop */}
      {activeDropdown && (
        <>
          {/* Backdrop for mobile modal */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
            onClick={() => setActiveDropdown(null)}
          />
          <div
            ref={dropdownRef}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg bg-white rounded-2xl shadow-lg z-50 p-6 max-h-[90vh] overflow-y-auto 
                       sm:absolute sm:top-full sm:left-auto sm:right-0 sm:w-96 sm:translate-x-0 sm:translate-y-0 sm:mt-2"
            onClick={(e) => e.stopPropagation()}
          >
            {renderDropdownContent()}
            {hasActiveFilters && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleReset}
                  className="w-full text-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

