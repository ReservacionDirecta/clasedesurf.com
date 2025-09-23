'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface FilterPanelProps {
  onFiltersChange: (filters: any) => void
}

export function FilterPanel({ onFiltersChange }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    location: '',
    level: '',
    type: '',
    priceRange: [0, 100],
    rating: 0,
    verified: false,
    date: ''
  })

  const locations = [
    'Miraflores',
    'San Bartolo', 
    'Chorrillos',
    'Callao',
    'Punta Negra',
    'Punta Hermosa'
  ]

  const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
  const types = ['GROUP', 'PRIVATE', 'INTENSIVE', 'KIDS']

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          
          {/* Location Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Ubicación
            </label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full p-3 border-2 border-gray-400 rounded-lg text-sm font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-600 shadow-sm"
            >
              <option value="">Todas las playas</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Nivel
            </label>
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="w-full p-3 border-2 border-gray-400 rounded-lg text-sm font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-600 shadow-sm"
            >
              <option value="">Todos los niveles</option>
              <option value="BEGINNER">Principiante</option>
              <option value="INTERMEDIATE">Intermedio</option>
              <option value="ADVANCED">Avanzado</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Tipo de Clase
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full p-3 border-2 border-gray-400 rounded-lg text-sm font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-600 shadow-sm"
            >
              <option value="">Todos los tipos</option>
              <option value="GROUP">Grupal</option>
              <option value="PRIVATE">Privada</option>
              <option value="INTENSIVE">Intensivo</option>
              <option value="KIDS">Niños</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Precio (USD)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange[0]}
                onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
                className="w-full p-3 border-2 border-gray-400 rounded-lg text-sm font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-600 shadow-sm placeholder-gray-500"
              />
              <span className="text-gray-700 font-bold">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange[1]}
                onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 100])}
                className="w-full p-3 border-2 border-gray-400 rounded-lg text-sm font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-600 shadow-sm placeholder-gray-500"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Rating Mínimo
            </label>
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}
              className="w-full p-3 border-2 border-gray-400 rounded-lg text-sm font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-600 shadow-sm"
            >
              <option value={0}>Cualquier rating</option>
              <option value={4.0}>4.0+ ⭐</option>
              <option value={4.5}>4.5+ ⭐</option>
              <option value={4.8}>4.8+ ⭐</option>
            </select>
          </div>

          {/* Verified Schools */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Opciones
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="verified"
                checked={filters.verified}
                onChange={(e) => handleFilterChange('verified', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="verified" className="text-sm font-medium text-gray-900">
                Solo escuelas verificadas
              </label>
            </div>
          </div>

        </div>

        {/* Quick Filters */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange('level', 'BEGINNER')}
              className={filters.level === 'BEGINNER' ? 'bg-blue-50 border-blue-300' : ''}
            >
              Principiantes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange('type', 'PRIVATE')}
              className={filters.type === 'PRIVATE' ? 'bg-blue-50 border-blue-300' : ''}
            >
              Clases Privadas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange('rating', 4.8)}
              className={filters.rating === 4.8 ? 'bg-blue-50 border-blue-300' : ''}
            >
              Top Rated
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange('verified', true)}
              className={filters.verified ? 'bg-blue-50 border-blue-300' : ''}
            >
              Verificadas
            </Button>
          </div>
        </div>

        {/* Clear Filters */}
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const resetFilters = {
                location: '',
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
          >
            Limpiar Filtros
          </Button>
        </div>
      </div>
    </div>
  )
}