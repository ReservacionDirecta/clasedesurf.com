'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { ClassCard } from '@/components/classes/ClassCard'
import { BookingModal } from '@/components/booking/BookingModal'
import { Hero } from '@/components/layout/Hero'
import { Footer } from '@/components/layout/Footer'
import { FilterPanel } from '@/components/marketplace/FilterPanel'
import { MarketplaceStats } from '@/components/marketplace/MarketplaceStats'
import { 
  SearchIcon, 
  LocationIcon, 
  SurferIcon, 
  CalendarIcon, 
  StarIcon, 
  MoneyIcon, 
  ShieldIcon, 
  LightningIcon, 
  TrophyIcon,
  CheckIcon,
  LockIcon,
  EquipmentIcon
} from '@/components/ui/Icons'
import { DatePicker } from '@/components/ui/DatePicker'
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
      
      {/* Sección principal de clases - Mobile Optimized */}
      <main id="encuentra-tu-clase" className="relative bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 py-4 sm:py-8">
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

        <div className="relative container mx-auto px-3 sm:px-4">
          {/* Mobile-Optimized Header Section */}
          <div className="text-center mb-4 sm:mb-8">
            {/* Mobile Badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 shadow-xl">
              <SearchIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              BÚSQUEDA AVANZADA
            </div>
            
            <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 leading-tight px-2 sm:px-0">
              <span className="text-gray-900">Encuentra tu</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600">
                Clase Perfecta
              </span>
            </h2>
            
            <p className="text-sm xs:text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium mb-4 sm:mb-6 px-4 sm:px-0">
              <span className="text-cyan-700 font-bold">Compara escuelas, precios y horarios.</span>
              <span className="block mt-1">Encuentra la clase ideal para tu nivel y ubicación preferida.</span>
            </p>

            {/* Mobile-Optimized Search Engine */}
            <div className="max-w-5xl mx-auto mb-4 sm:mb-6">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-cyan-200/30 mx-2 sm:mx-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-3 items-end">
                  {/* Ubicación */}
                  <div className="sm:col-span-1 lg:col-span-1">
                    <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                      <LocationIcon className="w-3 h-3 mr-1 text-cyan-600" />
                      Ubicación
                    </label>
                    <select className="search-input-enhanced search-select-enhanced search-element-transition w-full px-3 py-3 sm:py-2 rounded-lg text-sm font-medium touch-target-md">
                      <option>Todas</option>
                      <option>Costa Verde</option>
                      <option>Punta Hermosa</option>
                      <option>San Bartolo</option>
                    </select>
                  </div>

                  {/* Nivel */}
                  <div className="sm:col-span-1 lg:col-span-1">
                    <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                      <SurferIcon className="w-3 h-3 mr-1 text-cyan-600" />
                      Nivel
                    </label>
                    <select className="search-input-enhanced search-select-enhanced search-element-transition w-full px-3 py-3 sm:py-2 rounded-lg text-sm font-medium touch-target-md">
                      <option>Todos</option>
                      <option>Principiante</option>
                      <option>Intermedio</option>
                      <option>Avanzado</option>
                    </select>
                  </div>

                  {/* Fecha */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                      <CalendarIcon className="w-3 h-3 mr-1 text-cyan-600" />
                      Fecha
                    </label>
                    <DatePicker 
                      placeholder="Cualquier fecha"
                      onChange={(date) => console.log('Fecha seleccionada:', date)}
                      className="touch-target-md"
                    />
                  </div>

                  {/* Precio */}
                  <div className="sm:col-span-1 lg:col-span-1">
                    <label className="flex items-center text-xs font-semibold text-gray-700 mb-1">
                      <MoneyIcon className="w-3 h-3 mr-1 text-cyan-600" />
                      Precio
                    </label>
                    <select className="search-input-enhanced search-select-enhanced search-element-transition w-full px-3 py-3 sm:py-2 rounded-lg text-sm font-medium touch-target-md">
                      <option>Cualquier precio</option>
                      <option>Hasta $30</option>
                      <option>Hasta $50</option>
                      <option>Hasta $80</option>
                    </select>
                  </div>

                  {/* Botón de Búsqueda */}
                  <div className="sm:col-span-1 lg:col-span-1">
                    <Button 
                      variant="primary"
                      className="search-element-transition touch-target-lg w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-4 py-3 sm:py-2 rounded-lg transition-all duration-300 flex items-center justify-center text-sm shadow-lg hover:shadow-xl"
                    >
                      <SearchIcon className="w-4 h-4 mr-1" />
                      BUSCAR
                    </Button>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </main>

      {/* Mobile-Optimized Results Section */}
      <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">

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

        {/* Mobile-Optimized Results Summary */}
        {!loading && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
            <div className="text-gray-900 font-medium text-sm sm:text-base">
              Mostrando {filteredClasses.length} de {classes.length} clases disponibles
              {error && <span className="text-yellow-600 text-xs sm:text-sm ml-2">(datos de ejemplo)</span>}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs sm:text-sm font-medium text-gray-900 mobile-hidden flex-shrink-0">Ordenar:</span>
              <select className="border-2 border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-600 shadow-sm touch-target-md flex-1 sm:flex-none min-w-0 max-w-full">
                <option value="relevance">Relevancia</option>
                <option value="price-asc">Precio ↑</option>
                <option value="price-desc">Precio ↓</option>
                <option value="rating">Rating</option>
                <option value="distance">Distancia</option>
              </select>
            </div>
          </div>
        )}

        {/* Mobile-Optimized Grid de clases */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <SurferIcon className="w-12 h-12 text-gray-400" />
            </div>
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
                <CheckIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instructores Certificados</h3>
              <p className="text-gray-600">Todos nuestros instructores están certificados y tienen años de experiencia.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Seguridad Garantizada</h3>
              <p className="text-gray-600">Equipamiento de seguridad incluido y protocolos estrictos de seguridad.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <EquipmentIcon className="w-8 h-8 text-purple-600" />
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