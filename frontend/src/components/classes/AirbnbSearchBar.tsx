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
  const [dropdownPosition, setDropdownPosition] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dateInputRef = useRef<HTMLInputElement>(null)
  const buttonRefs = {
    locality: useRef<HTMLDivElement>(null),
    date: useRef<HTMLDivElement>(null),
    level: useRef<HTMLDivElement>(null),
    type: useRef<HTMLDivElement>(null)
  }

  // Calculate dropdown position when activeDropdown changes
  useEffect(() => {
    if (!activeDropdown || typeof window === 'undefined' || window.innerWidth < 640) {
      return
    }

    const updatePosition = () => {
      const buttonRef = buttonRefs[activeDropdown as keyof typeof buttonRefs]
      if (buttonRef?.current && containerRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect()
        const containerRect = containerRef.current.getBoundingClientRect()
        const left = buttonRect.left - containerRect.left
        setDropdownPosition(left)
      }
    }

    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      updatePosition()
    })

    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDropdown])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!activeDropdown) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return
      }
      setActiveDropdown(null)
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
    setActiveDropdown(null)
  }

  const handleReset = () => {
    setFilters({})
    onReset()
    setActiveDropdown(null)
  }

  const toggleDropdown = (field: string) => {
    // En móvil, para el campo de fecha, abrir directamente el datepicker nativo
    if (field === 'date' && typeof window !== 'undefined' && window.innerWidth < 640) {
      setTimeout(() => {
        if (dateInputRef.current) {
          try {
            // showPicker puede retornar void o Promise<void>
            // Intentamos llamarlo y si retorna una Promise, manejamos el error
            const input = dateInputRef.current
            const showPickerResult = input.showPicker?.()
            
            // Si showPicker retorna algo (no void), verificamos si es una Promise
            if (showPickerResult !== undefined && showPickerResult !== null) {
              // Verificamos si tiene el método 'then' que caracteriza a una Promise
              const resultAsAny = showPickerResult as unknown
              if (typeof resultAsAny === 'object' && resultAsAny !== null && 'then' in resultAsAny) {
                (resultAsAny as Promise<void>).catch(() => {
                  input.click()
                })
              }
            }
          } catch (error) {
            // Fallback si showPicker no está disponible o falla
            dateInputRef.current?.click()
          }
        }
      }, 100)
      return
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
    switch (activeDropdown) {
      case 'locality':
        return (
          <div className="animate-fade-in">
            <h3 className="text-lg font-semibold text-[#011627] mb-4">Selecciona ubicación</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleChange('locality', '')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-150 ease-out text-sm ${
                  !filters.locality
                    ? 'bg-[#E9FBF7] text-[#2EC4B6] font-semibold'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                Todas las ubicaciones
              </button>
              {locationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleChange('locality', option.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-150 ease-out text-sm ${
                    filters.locality === option.value
                      ? 'bg-[#E9FBF7] text-[#2EC4B6] font-semibold'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )
      case 'date':
        return (
          <div className="hidden sm:block animate-fade-in">
            <h3 className="text-lg font-semibold text-[#011627] mb-4">Selecciona fecha</h3>
            <input
              type="date"
              value={filters.date || ''}
              onChange={(e) => handleChange('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-[#2EC4B6]"
            />
            {filters.date && (
              <button
                onClick={() => handleChange('date', '')}
                className="mt-4 text-sm text-[#2EC4B6] hover:underline"
              >
                Limpiar fecha
              </button>
            )}
          </div>
        )
      case 'level':
        return (
          <div className="animate-fade-in">
            <h3 className="text-lg font-semibold text-[#011627] mb-4">Selecciona nivel</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleChange('level', '')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-150 ease-out text-sm ${
                  !filters.level
                    ? 'bg-[#E9FBF7] text-[#2EC4B6] font-semibold'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                Todos los niveles
              </button>
              {levelOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleChange('level', option.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-150 ease-out text-sm ${
                    filters.level === option.value
                      ? 'bg-[#E9FBF7] text-[#2EC4B6] font-semibold'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )
      case 'type':
        return (
          <div className="animate-fade-in">
            <h3 className="text-lg font-semibold text-[#011627] mb-4">Selecciona tipo de clase</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleChange('type', '')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-150 ease-out text-sm ${
                  !filters.type
                    ? 'bg-[#E9FBF7] text-[#2EC4B6] font-semibold'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                Todos los tipos
              </button>
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleChange('type', option.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-150 ease-out text-sm ${
                    filters.type === option.value
                      ? 'bg-[#E9FBF7] text-[#2EC4B6] font-semibold'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl sm:rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200 overflow-hidden">
        {/* Location Button */}
        <div ref={buttonRefs.locality} className="relative flex-1">
          <button
            onClick={() => toggleDropdown('locality')}
            className={`w-full px-4 sm:px-6 py-3 sm:py-4 text-left border-b sm:border-b-0 sm:border-r border-gray-200 hover:bg-gray-50 transition-all duration-200 ease-out ${
              filters.locality ? 'font-semibold text-[#011627]' : 'text-gray-600'
            } ${activeDropdown === 'locality' ? 'bg-gray-50' : ''}`}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">¿Dónde?</div>
            <div className="text-sm truncate mt-1">
              {getDisplayValue('locality', locationOptions) || 'Cualquier ubicación'}
            </div>
          </button>
        </div>

        {/* Date Button */}
        <div ref={buttonRefs.date} className="relative flex-1">
          <button
            onClick={() => toggleDropdown('date')}
            type="button"
            className={`w-full px-4 sm:px-6 py-3 sm:py-4 text-left border-b sm:border-b-0 sm:border-r border-gray-200 hover:bg-gray-50 transition-all duration-200 ease-out ${
              filters.date ? 'font-semibold text-[#011627]' : 'text-gray-600'
            } ${activeDropdown === 'date' ? 'bg-gray-50' : ''}`}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">¿Cuándo?</div>
            <div className="text-sm truncate mt-1">
              {formatDate(filters.date) || 'Cualquier fecha'}
            </div>
          </button>
          {/* Input de fecha oculto para móvil - se activa directamente */}
          <input
            ref={dateInputRef}
            type="date"
            value={filters.date || ''}
            onChange={(e) => handleChange('date', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="absolute inset-0 w-full h-full opacity-0 pointer-events-none sm:hidden"
            aria-label="Seleccionar fecha"
            tabIndex={-1}
          />
        </div>

        {/* Level Button */}
        <div ref={buttonRefs.level} className="relative flex-1">
          <button
            onClick={() => toggleDropdown('level')}
            className={`w-full px-4 sm:px-6 py-3 sm:py-4 text-left border-b sm:border-b-0 sm:border-r border-gray-200 hover:bg-gray-50 transition-all duration-200 ease-out ${
              filters.level ? 'font-semibold text-[#011627]' : 'text-gray-600'
            } ${activeDropdown === 'level' ? 'bg-gray-50' : ''}`}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Nivel</div>
            <div className="text-sm truncate mt-1">
              {getDisplayValue('level', levelOptions) || 'Cualquier nivel'}
            </div>
          </button>
        </div>

        {/* Type Button */}
        <div ref={buttonRefs.type} className="relative flex-1">
          <button
            onClick={() => toggleDropdown('type')}
            className={`w-full px-4 sm:px-6 py-3 sm:py-4 text-left border-b-0 sm:border-b-0 sm:border-r border-gray-200 hover:bg-gray-50 transition-all duration-200 ease-out ${
              filters.type ? 'font-semibold text-[#011627]' : 'text-gray-600'
            } ${activeDropdown === 'type' ? 'bg-gray-50' : ''}`}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Tipo</div>
            <div className="text-sm truncate mt-1">
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
            className="w-full sm:w-auto bg-gradient-to-r from-[#FF3366] to-[#D12352] hover:from-[#D12352] hover:to-[#B01E45] text-white font-semibold rounded-full flex items-center justify-center px-6 py-3 transition-all duration-200"
            aria-label="Buscar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="ml-2 hidden sm:inline">Buscar</span>
          </button>
        </div>
      </div>

      {/* Dropdown Container - Modal on mobile, Dropdown on desktop */}
      {activeDropdown && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[9998] sm:hidden animate-fade-in"
            onClick={() => setActiveDropdown(null)}
          />
          {/* Dropdown - Posicionado relativo al botón activo en desktop */}
          <div
            ref={dropdownRef}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white rounded-2xl shadow-2xl z-[9999] p-6 max-h-[85vh] overflow-y-auto
                       animate-slide-down
                       sm:absolute sm:top-full sm:mt-2 sm:w-auto sm:min-w-[400px] sm:max-w-md sm:rounded-xl sm:translate-x-0 sm:translate-y-0
                       sm:animate-scale-in"
            style={{
              ...(typeof window !== 'undefined' && window.innerWidth >= 640
                ? { left: `${dropdownPosition}px` }
                : {})
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {renderDropdownContent()}
            {hasActiveFilters && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleReset}
                  className="w-full text-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#011627] hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Limpiar todos los filtros
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
