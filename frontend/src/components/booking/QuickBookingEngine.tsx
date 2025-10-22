'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface QuickBookingEngineProps {
  className?: string
}

// Estructura jerárquica de ubicaciones
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

export function QuickBookingEngine({ className = '' }: QuickBookingEngineProps) {
  const [country, setCountry] = useState('Peru')
  const [region, setRegion] = useState('')
  const [locality, setLocality] = useState('')
  const [date, setDate] = useState('')
  const [level, setLevel] = useState('')
  const [participants, setParticipants] = useState('1')

  const handleSearch = () => {
    const searchData = {
      country,
      region,
      locality,
      date,
      level,
      participants
    }
    console.log('Búsqueda por localidad:', searchData)
    
    // Scroll suave hacia la sección de resultados
    const resultsSection = document.getElementById('search-results')
    if (resultsSection) {
      resultsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
    
    // Opcional: Disparar evento personalizado para que otros componentes puedan escuchar
    const searchEvent = new CustomEvent('surfSearch', {
      detail: searchData
    })
    window.dispatchEvent(searchEvent)
  }

  const today = new Date().toISOString().split('T')[0]

  // Obtener regiones disponibles según el país
  const getRegions = () => {
    if (!country || !surfLocations[country as keyof typeof surfLocations]) return []
    return Object.keys(surfLocations[country as keyof typeof surfLocations])
  }

  // Obtener localidades según región
  const getLocalities = () => {
    if (!country || !region) return []
    const countryData = surfLocations[country as keyof typeof surfLocations]
    if (!countryData || !countryData[region as keyof typeof countryData]) return []
    return Object.keys(countryData[region as keyof typeof countryData])
  }

  // Reset cascading selects
  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry)
    setRegion('')
    setLocality('')
  }

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion)
    setLocality('')
  }

  return (
    <div className={`bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200 ${className}`}>
      <div className="mb-3">
        <h3 className="text-gray-900 font-semibold text-sm text-center">🏄‍♂️ Busca tu clase ideal</h3>
        <p className="text-xs text-gray-600 text-center mt-1">Encuentra el spot perfecto para surfear</p>
      </div>
      
      <div className="space-y-3">
        {/* Location Hierarchy - País, Región, Localidad */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-700 mb-1">📍 Ubicación</div>
          
          {/* País */}
          <select
            value={country}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full px-2 py-2 text-xs text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">🌎 Todos los países</option>
            <option value="Peru">🇵🇪 Perú</option>
          </select>

          {/* Región */}
          {country && (
            <select
              value={region}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full px-2 py-2 text-xs text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">🏙️ Todas las regiones</option>
              {getRegions().map((reg) => (
                <option key={reg} value={reg}>🏙️ {reg}</option>
              ))}
            </select>
          )}

          {/* Localidad */}
          {region && (
            <select
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full px-2 py-2 text-xs text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">🏖️ Todas las localidades</option>
              {getLocalities().map((loc) => (
                <option key={loc} value={loc}>🏖️ {loc}</option>
              ))}
            </select>
          )}
        </div>

        {/* Date and Level Row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">📅 Fecha</div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              className="w-full px-2 py-2 text-xs text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
          
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">🎯 Nivel</div>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-2 py-2 text-xs text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Todos los niveles</option>
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </div>
        </div>

        {/* Participants */}
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">👥 Participantes</div>
          <select
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            className="w-full px-2 py-2 text-xs text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="1">1 persona</option>
            <option value="2">2 personas</option>
            <option value="3">3 personas</option>
            <option value="4">4 personas</option>
            <option value="5+">5+ personas</option>
          </select>
        </div>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-4 text-sm font-bold rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg touch-target"
        >
          🔍 Buscar
        </Button>

        {/* Selected Location Display */}
        {(country || region || locality) && (
          <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
            <div className="text-xs font-medium text-blue-800 mb-1">📍 Ubicación seleccionada:</div>
            <div className="text-xs text-blue-700">
              {[country, region, locality].filter(Boolean).join(' → ')}
            </div>
            {locality && (
              <div className="text-xs text-blue-600 mt-1">
                ✨ Mostrará todas las clases disponibles en {locality}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Quick Stats */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="text-xs">
            <div className="font-bold text-blue-600">25+</div>
            <div className="text-gray-600">Escuelas</div>
          </div>
          <div className="text-xs">
            <div className="font-bold text-yellow-600">5★</div>
            <div className="text-gray-600">Rating</div>
          </div>
          <div className="text-xs">
            <div className="font-bold text-green-600">15+</div>
            <div className="text-gray-600">Spots</div>
          </div>
        </div>
      </div>
    </div>
  )
}