'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { 
  LocationIcon, 
  SurferIcon, 
  MoneyIcon,
  GroupIcon,
  TrashIcon
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
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      {/* Mobile Filter Toggle */}
      <div className="md:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between"
        >
          <span>Filtros</span>
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
      <div className={`${isOpen ? 'block' : 'hidden'} md:block`}>
        {/* Filtros Simplificados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Ubicación */}
          <div>
            <label className="flex items-center text-sm font-bold text-gray-900 mb-2">
              <LocationIcon className="w-4 h-4 mr-2 text-blue-600" />
              Ubicación
            </label>
            <select
              value={filters.locality}
              onChange={(e) => handleFilterChange('locality', e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-600 shadow-sm"
            >
              <option value="">Todas las localidades</option>
              <option value="Costa Verde">Costa Verde</option>
              <option value="Punta Hermosa">Punta Hermosa</option>
              <option value="San Bartolo">San Bartolo</option>
            </select>
          </div>

          {/* Nivel */}
          <div>
            <label className="flex items-center text-sm font-bold text-gray-900 mb-2">
              <SurferIcon className="w-4 h-4 mr-2 text-blue-600" />
              Nivel
            </label>
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-600 shadow-sm"
            >
              <option value="">Todos los niveles</option>
              <option value="BEGINNER">Principiante</option>
              <option value="INTERMEDIATE">Intermedio</option>
              <option value="ADVANCED">Avanzado</option>
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="flex items-center text-sm font-bold text-gray-900 mb-2">
              <GroupIcon className="w-4 h-4 mr-2 text-blue-600" />
              Tipo
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-600 shadow-sm"
            >
              <option value="">Todos los tipos</option>
              <option value="GROUP">Grupal</option>
              <option value="PRIVATE">Privada</option>
              <option value="INTENSIVE">Intensivo</option>
            </select>
          </div>

          {/* Precio */}
          <div>
            <label className="flex items-center text-sm font-bold text-gray-900 mb-2">
              <MoneyIcon className="w-4 h-4 mr-2 text-blue-600" />
              Precio (USD)
            </label>
            <select
              value={filters.priceRange[1]}
              onChange={(e) => handleFilterChange('priceRange', [0, parseInt(e.target.value)])}
              className="w-full p-3 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-600 shadow-sm"
            >
              <option value={100}>Cualquier precio</option>
              <option value={30}>Hasta $30</option>
              <option value={50}>Hasta $50</option>
              <option value={80}>Hasta $80</option>
            </select>
          </div>

        </div>

        {/* Botón Limpiar */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
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
              className="flex items-center text-sm"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}