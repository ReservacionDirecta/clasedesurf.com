'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { ClassCard } from '@/components/classes/ClassCard'
import { BookingModal } from '@/components/booking/BookingModal'
import { Hero } from '@/components/layout/Hero'
import { Footer } from '@/components/layout/Footer'
import { FilterPanel } from '@/components/marketplace/FilterPanel'
import { MarketplaceStats } from '@/components/marketplace/MarketplaceStats'
import { apiService, transformApiClassToFrontend, type ClassFilters } from '@/services/api'

// Datos de ejemplo como fallback
const mockClasses = [
  {
    id: '1',
    title: 'Iniciación en Miraflores',
    description: 'Aprende surf en la icónica Playa Makaha de Miraflores. Olas perfectas para principiantes con instructores certificados. Incluye teoría básica y práctica segura.',
    date: new Date('2024-12-20T08:00:00'),
    startTime: new Date('2024-12-20T08:00:00'),
    endTime: new Date('2024-12-20T10:00:00'),
    duration: 120,
    capacity: 8,
    price: 25,
    currency: 'USD',
    level: 'BEGINNER' as const,
    type: 'GROUP' as const,
    location: 'Playa Makaha, Miraflores',
    instructorName: 'Carlos Mendoza',
    includesBoard: true,
    includesWetsuit: true,
    includesInsurance: true,
    isActive: true,
    isCanceled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    schoolId: 'school-1',
    availableSpots: 5,
    school: {
      id: 'school-1',
      name: 'Lima Surf Academy',
      city: 'Lima',
      rating: 4.9,
      totalReviews: 234,
      verified: true,
      yearsExperience: 8,
      description: 'Escuela pionera en Lima con más de 8 años formando surfistas.',
      shortReview: 'Excelente escuela, instructores muy pacientes y profesionales.'
    },
    instructor: {
      name: 'Carlos Mendoza',
      rating: 4.8,
      experience: '6 años de experiencia, Instructor ISA certificado',
      specialties: ['Iniciación', 'Técnica básica', 'Seguridad acuática']
    },
    classImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop'
  }
]

export default function Home() {
  const [selectedClass, setSelectedClass] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [classes, setClasses] = useState<any[]>([])
  const [filteredClasses, setFilteredClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ClassFilters>({})

  // Load classes from API
  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Try to fetch from API first
      const apiClasses = await apiService.getClasses()
      const transformedClasses = apiClasses.map(transformApiClassToFrontend)
      
      setClasses(transformedClasses)
      setFilteredClasses(transformedClasses)
      
      console.log('✅ Loaded classes from API:', transformedClasses.length)
    } catch (err) {
      console.warn('⚠️ Failed to load from API, using mock data:', err)
      // Fallback to mock data
      setClasses(mockClasses)
      setFilteredClasses(mockClasses)
      setError('Usando datos de ejemplo. Verifica la conexión con el backend.')
    } finally {
      setLoading(false)
    }
  }

  const handleClassSelect = (classData: any) => {
    setSelectedClass(classData)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedClass(null)
  }

  const handleBookingSubmit = (bookingData: any) => {
    console.log('Booking submitted:', bookingData)
    alert('¡Reserva enviada con éxito! Nos pondremos en contacto contigo pronto.')
    handleCloseModal()
  }

  const handleFiltersChange = async (newFilters: any) => {
    setFilters(newFilters)
    
    try {
      // Convert frontend filters to API filters
      const apiFilters: ClassFilters = {}
      
      if (newFilters.level) {
        apiFilters.level = newFilters.level
      }
      
      if (newFilters.priceRange) {
        apiFilters.minPrice = newFilters.priceRange[0]
        apiFilters.maxPrice = newFilters.priceRange[1]
      }
      
      // Fetch from API with filters
      const apiClasses = await apiService.getClasses(apiFilters)
      let transformedClasses = apiClasses.map(transformApiClassToFrontend)
      
      // Apply client-side filters
      transformedClasses = transformedClasses.filter(classItem => {
        // Filter by location (client-side)
        if (newFilters.location && !classItem.location?.includes(newFilters.location)) {
          return false
        }
        
        // Filter by type (client-side)
        if (newFilters.type && classItem.type !== newFilters.type) {
          return false
        }
        
        // Filter by rating (client-side)
        if (newFilters.rating && classItem.school.rating < newFilters.rating) {
          return false
        }
        
        // Filter by verified schools (client-side)
        if (newFilters.verified && !classItem.school.verified) {
          return false
        }
        
        return true
      })
      
      setFilteredClasses(transformedClasses)
    } catch (err) {
      console.error('Error applying filters:', err)
      // Fallback to client-side filtering with current classes
      const filtered = classes.filter(classItem => {
        if (newFilters.location && !classItem.location?.includes(newFilters.location)) {
          return false
        }
        
        if (newFilters.level && classItem.level !== newFilters.level) {
          return false
        }
        
        if (newFilters.type && classItem.type !== newFilters.type) {
          return false
        }
        
        if (newFilters.priceRange && (classItem.price < newFilters.priceRange[0] || classItem.price > newFilters.priceRange[1])) {
          return false
        }
        
        if (newFilters.rating && classItem.school.rating < newFilters.rating) {
          return false
        }
        
        if (newFilters.verified && !classItem.school.verified) {
          return false
        }
        
        return true
      })
      
      setFilteredClasses(filtered)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      
      {/* Marketplace Stats */}
      <MarketplaceStats />
      
      {/* Sección principal de clases - MEJORADA */}
      <main id="encuentra-tu-clase" className="relative bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 py-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="searchPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#searchPattern)" />
          </svg>
        </div>

        <div className="relative container mx-auto px-4">
          {/* Header Section Mejorado */}
          <div className="text-center mb-16">
            {/* Badge Superior */}
            <div className="inline-flex items-center bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-xl">
              🔍 BÚSQUEDA AVANZADA
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="text-gray-900">Encuentra tu</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600">
                Clase Perfecta
              </span>
            </h2>
            
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium mb-12">
              <span className="text-cyan-700 font-bold">Compara escuelas, precios y horarios.</span>
              <span className="block mt-2">Encuentra la clase ideal para tu nivel y ubicación preferida.</span>
            </p>

            {/* Buscador Mejorado - Inspirado en el Hero */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-3xl blur-xl opacity-20 animate-pulse"></div>
                
                {/* Buscador Principal */}
                <div className="relative bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-cyan-200/50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Ubicación */}
                    <div className="relative">
                      <label className="block text-sm font-bold text-gray-700 mb-2">📍 Ubicación</label>
                      <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-300 bg-white font-medium">
                        <option>🏖️ Todas las localidades</option>
                        <option>🏖️ Costa Verde</option>
                        <option>🏖️ Punta Hermosa</option>
                        <option>🏖️ San Bartolo</option>
                      </select>
                    </div>

                    {/* Nivel */}
                    <div className="relative">
                      <label className="block text-sm font-bold text-gray-700 mb-2">🏄‍♂️ Nivel</label>
                      <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-300 bg-white font-medium">
                        <option>Todos los niveles</option>
                        <option>Principiante</option>
                        <option>Intermedio</option>
                        <option>Avanzado</option>
                      </select>
                    </div>

                    {/* Fecha */}
                    <div className="relative">
                      <label className="block text-sm font-bold text-gray-700 mb-2">📅 Fecha</label>
                      <input 
                        type="date" 
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-300 bg-white font-medium"
                      />
                    </div>

                    {/* Botón de Búsqueda */}
                    <div className="relative">
                      <label className="block text-sm font-bold text-transparent mb-2">Buscar</label>
                      <Button 
                        variant="primary"
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black px-6 py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                      >
                        🔍 BUSCAR
                      </Button>
                    </div>
                  </div>

                  {/* Filtros Rápidos */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex flex-wrap gap-3 justify-center">
                      <button className="px-4 py-2 bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-700 rounded-full text-sm font-bold hover:from-cyan-200 hover:to-teal-200 transition-all duration-300 transform hover:scale-105">
                        ⭐ Mejor valoradas
                      </button>
                      <button className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-sm font-bold hover:from-green-200 hover:to-emerald-200 transition-all duration-300 transform hover:scale-105">
                        💰 Mejor precio
                      </button>
                      <button className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-bold hover:from-blue-200 hover:to-indigo-200 transition-all duration-300 transform hover:scale-105">
                        🏆 Escuelas verificadas
                      </button>
                      <button className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-bold hover:from-purple-200 hover:to-pink-200 transition-all duration-300 transform hover:scale-105">
                        ⚡ Disponible hoy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-cyan-100">
                <div className="text-3xl font-black text-cyan-600 mb-2">25+</div>
                <div className="text-gray-700 font-medium">Escuelas Activas</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-teal-100">
                <div className="text-3xl font-black text-teal-600 mb-2">150+</div>
                <div className="text-gray-700 font-medium">Clases Semanales</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-emerald-100">
                <div className="text-3xl font-black text-emerald-600 mb-2">2.5K+</div>
                <div className="text-gray-700 font-medium">Estudiantes</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-100">
                <div className="text-3xl font-black text-orange-600 mb-2">4.8⭐</div>
                <div className="text-gray-700 font-medium">Rating Promedio</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sección de Resultados */}
      <section className="container mx-auto px-4 py-12">

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-yellow-800 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        <FilterPanel onFiltersChange={handleFiltersChange} />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando clases disponibles...</p>
          </div>
        )}

        {/* Results Summary */}
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <div className="text-gray-900 font-medium">
              Mostrando {filteredClasses.length} de {classes.length} clases disponibles
              {error && <span className="text-yellow-600 text-sm ml-2">(datos de ejemplo)</span>}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">Ordenar por:</span>
              <select className="border-2 border-gray-400 rounded-lg px-4 py-2 text-sm font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-600 shadow-sm">
                <option>Más relevantes</option>
                <option>Precio: menor a mayor</option>
                <option>Precio: mayor a menor</option>
                <option>Mejor calificados</option>
                <option>Más cercanos</option>
              </select>
            </div>
          </div>
        )}

        {/* Grid de clases */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredClasses.map((classData) => (
              <ClassCard
                key={classData.id}
                classData={classData}
                onSelect={() => handleClassSelect(classData)}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredClasses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏄‍♂️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No encontramos clases con esos filtros
            </h3>
            <p className="text-gray-600 mb-4">
              Intenta ajustar los filtros o buscar en otras fechas
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setFilters({})
                loadClasses()
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        )}

        {/* Sección de información adicional */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Instructores Certificados</h3>
              <p className="text-gray-600">Todos nuestros instructores están certificados y tienen años de experiencia.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Seguridad Garantizada</h3>
              <p className="text-gray-600">Equipamiento de seguridad incluido y protocolos estrictos de seguridad.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Equipamiento Incluido</h3>
              <p className="text-gray-600">Tabla, neopreno y todo el equipamiento necesario incluido en el precio.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Modal de reserva */}
      {selectedClass && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          classData={selectedClass}
          onSubmit={handleBookingSubmit}
        />
      )}
    </div>
  )
}