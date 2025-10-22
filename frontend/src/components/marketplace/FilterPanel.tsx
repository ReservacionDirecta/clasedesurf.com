'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { 
  LocationIcon, 
  SurferIcon, 
  MoneyIcon,
  GroupIcon,
  BroomIcon
} from '@/components/ui/Icons'

interface FilterPanelProps {
  onFiltersChange: (filters: any) => void
}

export function FilterPanel({ onFiltersChange }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    country: 'Peru',
    region: '',
    locality: '',
    level: '',
    type: '',
    priceRange: [0, 100],
    rating: 0,
    verified: false,
    date: ''
  })

  // Estructura jerárquica de ubicaciones (misma que QuickBookingEngine)
  const surfLocations = {
    'Peru': {
      'Lima': {
        'Costa Verde': [
          'Playa Punta Roquitas',
          'Playa Pampilla', 
          'Playa Makaha',
          'Playa Redondo',
          'Playa Barranquito',
          'Los Yuyos',
          'Playa Sombrillas',
          'Playa Agua Dulce'
        ],
        'Punta Hermosa': [
          'Playa Negra',
          'Señoritas',
          'Caballeros', 
          'La Isla'
        ],
        'San Bartolo': [
          'Playa Derechitas',
          'Playa Izquierditas',
          'Playa Peñascal'
        ]
      }
    }
  }

  // Funciones para obtener opciones jerárquicas
  const getRegions = () => {
    if (!filters.country || !surfLocations[filters.country as keyof typeof surfLocations]) return []
    return Object.keys(surfLocations[filters.country as keyof typeof surfLocations])
  }

  const getLocalities = () => {
    if (!filters.country || !filters.region) return []
    const countryData = surfLocations[filters.country as keyof typeof surfLocations]
    if (!countryData || !countryData[filters.region as keyof typeof countryData]) return []
    return Object.keys(countryData[filters.region as keyof typeof countryData])
  }



  const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
  const types = ['GROUP', 'PRIVATE', 'INTENSIVE', 'KIDS']

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    
    // Reset cascading selects when parent changes
    if (key === 'country') {
      newFilters.region = ''
      newFilters.locality = ''
    } else if (key === 'region') {
      newFilters.locality = ''
    }
    
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6 mx-2 sm:mx-0">
      {/* Mobile Filter Toggle */}
      <div className="sm:hidden mb-3">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between py-3 touch-target-md"
        >
          <span className="text-sm font-medium">Filtros</span>
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      </div>

      {/* Filter Content */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:block`}>
        {/* Mobile-Optimized Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">

          {/* Ubicación */}
          <div>
            <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
              <LocationIcon className="w-3 h-3 mr-1 text-blue-600" />
              Ubicación
            </label>
            <select
              value={filters.locality}
              onChange={(e) => handleFilterChange('locality', e.target.value)}
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 touch-target-md"
            >
              <option value="">Todas</option>
              <option value="Costa Verde">Costa Verde</option>
              <option value="Punta Hermosa">Punta Hermosa</option>
              <option value="San Bartolo">San Bartolo</option>
            </select>
          </div>

          {/* Nivel */}
          <div>
            <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
              <SurferIcon className="w-3 h-3 mr-1 text-blue-600" />
              Nivel
            </label>
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 touch-target-md"
            >
              <option value="">Todos</option>
              <option value="BEGINNER">Principiante</option>
              <option value="INTERMEDIATE">Intermedio</option>
              <option value="ADVANCED">Avanzado</option>
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
              <GroupIcon className="w-3 h-3 mr-1 text-blue-600" />
              Tipo
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 touch-target-md"
            >
              <option value="">Todos</option>
              <option value="GROUP">Grupal</option>
              <option value="PRIVATE">Privada</option>
              <option value="INTENSIVE">Intensivo</option>
            </select>
          </div>

          {/* Precio */}
          <div>
            <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
              <MoneyIcon className="w-3 h-3 mr-1 text-blue-600" />
              Precio
            </label>
            <select
              value={filters.priceRange[1]}
              onChange={(e) => handleFilterChange('priceRange', [0, parseInt(e.target.value)])}
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 touch-target-md"
            >
              <option value={100}>Cualquier precio</option>
              <option value={30}>Hasta $30</option>
              <option value={50}>Hasta $50</option>
              <option value={80}>Hasta $80</option>
            </select>
          </div>

          {/* Botón Limpiar */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                const resetFilters = {
                  country: 'Peru',
                  region: '',
                  locality: '',
                  level: '',
                  type: '',
                  priceRange: [0, 100],
                  rating: 0,
                  verified: false,
                  date: ''
                }
                setFilters(resetFilters)
                onFiltersChange(resetFilters)
              }}
              className="px-3 py-3 sm:py-2 border border-gray-300 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center touch-target-md"
              title="Limpiar filtros"
            >
              <BroomIcon className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}