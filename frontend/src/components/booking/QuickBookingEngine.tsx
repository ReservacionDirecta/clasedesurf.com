'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface QuickBookingEngineProps {
  className?: string
}

export function QuickBookingEngine({ className = '' }: QuickBookingEngineProps) {
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [level, setLevel] = useState('')
  const [participants, setParticipants] = useState('1')

  const handleSearch = () => {
    // Aquí iría la lógica de búsqueda
    console.log('Búsqueda:', { location, date, level, participants })
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className={`bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-200 ${className}`}>
      <div className="mb-2">
        <h3 className="text-gray-900 font-semibold text-sm text-center">🏄‍♂️ Busca tu clase ideal</h3>
      </div>
      
      <div className="space-y-2">
        {/* Location and Date Row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-2 py-2 text-xs text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">📍 Todas las playas</option>
              <option value="miraflores">📍 Miraflores</option>
              <option value="san-bartolo">📍 San Bartolo</option>
              <option value="chorrillos">📍 Chorrillos</option>
              <option value="callao">📍 Callao</option>
              <option value="punta-negra">📍 Punta Negra</option>
              <option value="punta-hermosa">📍 Punta Hermosa</option>
            </select>
          </div>
          
          <div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              placeholder="📅 Fecha"
              className="w-full px-2 py-2 text-xs text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
        </div>

        {/* Level and Participants Row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-2 py-2 text-xs text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">🎯 Cualquier nivel</option>
              <option value="beginner">🎯 Principiante</option>
              <option value="intermediate">🎯 Intermedio</option>
              <option value="advanced">🎯 Avanzado</option>
              <option value="expert">🎯 Experto</option>
            </select>
          </div>
          
          <div>
            <select
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              className="w-full px-2 py-2 text-xs text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="1">👥 1 persona</option>
              <option value="2">👥 2 personas</option>
              <option value="3">👥 3 personas</option>
              <option value="4">👥 4 personas</option>
              <option value="5+">👥 5+ personas</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 text-sm font-medium rounded-lg transition-colors touch-target"
        >
          🔍 Buscar Clases Disponibles
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="flex justify-center space-x-4 text-xs text-gray-600">
          <span>✅ 25+ escuelas</span>
          <span>⭐ 4.8★</span>
          <span>🏄‍♂️ 150+ instructores</span>
        </div>
      </div>
    </div>
  )
}