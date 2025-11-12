'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { ClassCard } from '@/components/classes/ClassCard'
import { BookingModal } from '@/components/booking/BookingModal'
import { Hero } from '@/components/layout/Hero'
import { Footer } from '@/components/layout/Footer'
import { FilterPanel } from '@/components/marketplace/FilterPanel'
import { MarketplaceStats } from '@/components/marketplace/MarketplaceStats'
import { DatePicker } from '@/components/ui/DatePicker'
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

type HighlightCard = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly ctaLabel: string;
  readonly ctaHref: string;
  readonly imageUrl: string;
  readonly ctaClasses: string;
  readonly ariaLabel: string;
};

const discoveryHighlights: readonly HighlightCard[] = [
  {
    id: 'beginners',
    title: 'Clases para Principiantes',
    description: 'Da tus primeros pasos con acompañamiento experto y protocolos de seguridad.',
    ctaLabel: 'Explorar',
    ctaHref: '#encuentra-tu-clase',
    imageUrl: 'https://images.unsplash.com/photo-1533539343-0e7389aec51f?auto=format&fit=crop&q=80&w=1536',
    ctaClasses: 'bg-[#FF3366] text-white hover:brightness-110 focus-visible:outline-[#FF3366]',
    ariaLabel: 'Explorar clases para principiantes'
  },
  {
    id: 'advanced',
    title: 'Mejora tu Técnica',
    description: 'Perfecciona maniobras avanzadas, domina nuevas líneas y eleva tu nivel.',
    ctaLabel: 'Ver clases',
    ctaHref: '#encuentra-tu-clase',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1734640922103-97b588a33908?auto=format&fit=crop&q=80&w=1171',
    ctaClasses: 'bg-[#2EC4B6] text-[#011627] hover:brightness-110 focus-visible:outline-[#2EC4B6]',
    ariaLabel: 'Ver clases para mejorar técnica'
  },
  {
    id: 'schools',
    title: 'Escuelas Certificadas',
    description: 'Encuentra academias verificadas con instructores confiables y evaluaciones reales.',
    ctaLabel: 'Ver escuelas',
    ctaHref: '#encuentra-tu-clase',
    imageUrl: 'https://images.unsplash.com/photo-1607438028123-c4254b08f66d?auto=format&fit=crop&q=80&w=1090',
    ctaClasses: 'bg-[#011627] text-white hover:brightness-110 focus-visible:outline-[#011627]',
    ariaLabel: 'Ver escuelas certificadas'
  }
]

export default function Home() {
  const router = useRouter()
  const { data: session } = useSession()
  const [selectedClass, setSelectedClass] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [classes, setClasses] = useState<any[]>([])
  const [filteredClasses, setFilteredClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ClassFilters>({})
  const [selectedDate, setSelectedDate] = useState<string>('')

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate)
    handleFiltersChange({ ...filters, date: newDate })
  }

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

  const handleBookingSubmit = async (bookingData: any) => {
    try {
      console.log('Reserva enviada:', bookingData);
      
      // Prepare reservation data
      const reservationData = {
        classId: selectedClass?.id?.toString() || bookingData.classId,
        classData: selectedClass,
        bookingData: {
          name: bookingData.name,
          email: bookingData.email,
          age: bookingData.age,
          height: bookingData.height,
          weight: bookingData.weight,
          canSwim: bookingData.canSwim || false,
          swimmingLevel: bookingData.swimmingLevel || 'BEGINNER',
          hasSurfedBefore: bookingData.hasSurfedBefore || false,
          injuries: bookingData.injuries || '',
          emergencyContact: bookingData.emergencyContact,
          emergencyPhone: bookingData.emergencyPhone,
          participants: bookingData.participants || 1,
          specialRequest: bookingData.specialRequest || '',
          totalAmount: bookingData.totalAmount || (selectedClass?.price || 0) * (bookingData.participants || 1)
        },
        status: 'pending' as const
      }

      // Save reservation data to sessionStorage
      sessionStorage.setItem('pendingReservation', JSON.stringify(reservationData))
      console.log('Datos guardados en sessionStorage:', reservationData);

      // Close modal first
      handleCloseModal()

      // Wait a bit for modal to close, then redirect
      // Using window.location.href for more reliable navigation
      setTimeout(() => {
        console.log('Redirigiendo a /reservations/confirmation');
        window.location.href = '/reservations/confirmation'
      }, 150)
    } catch (err) {
      console.error('Error preparing reservation:', err)
      alert('Error al procesar la reserva. Por favor, inténtalo de nuevo.')
    }
  }

  const handleFiltersChange = async (newFilters: any) => {
    setFilters(newFilters)

    const matchesDateFilter = (classItem: any) => {
      if (!newFilters.date) {
        return true
      }

      const dateCandidates = [classItem.date, classItem.startTime, classItem.scheduledDate]

      return dateCandidates.some((candidate) => {
        if (!candidate) {
          return false
        }

        const candidateDate = candidate instanceof Date ? candidate : new Date(candidate)

        if (Number.isNaN(candidateDate.getTime())) {
          return false
        }

        return candidateDate.toISOString().split('T')[0] === newFilters.date
      })
    }

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

      if (newFilters.date) {
        apiFilters.date = newFilters.date
      }

      // Fetch from API with filters
      const apiClasses = await apiService.getClasses(apiFilters)
      let transformedClasses = apiClasses.map(transformApiClassToFrontend)

      // Apply client-side filters
      transformedClasses = transformedClasses.filter(classItem => {
        if (!matchesDateFilter(classItem)) {
          return false
        }

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
        if (!matchesDateFilter(classItem)) {
          return false
        }

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
    <div className="min-h-screen bg-[#F6F7F8]">
      <Hero />

      {/* Discover & Learn Section */}
      <section className="relative overflow-hidden bg-[#F6F7F8] py-10 sm:py-16">
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 720" preserveAspectRatio="none">
            <path d="M0 160C120 140 240 180 360 160C480 140 600 180 720 160C840 140 960 180 1080 160C1170 146 1260 168 1350 182" stroke="#D8E8F1" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
            <path d="M0 320C140 308 280 356 420 332C560 308 700 356 840 332C980 308 1120 356 1260 332C1350 316 1440 340 1440 340" stroke="#C2DEE9" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.35" />
            <path d="M0 480C160 468 320 516 480 492C640 468 800 516 960 492C1120 468 1280 516 1440 492" stroke="#B3D5E4" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3" />
          </svg>
          <div className="absolute -top-24 -left-20 h-60 w-60 rounded-full bg-white/70 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[#2EC4B6]/10 blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <span className="inline-block text-xs sm:text-sm font-bold tracking-widest text-[#2EC4B6] uppercase">Descubre y Aprende</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black text-[#011627] leading-tight">Encuentra tu clase perfecta. Aprende de los mejores.</h2>
            <p className="mt-4 text-sm sm:text-base text-[#46515F]">
              Explora experiencias diseñadas para cada nivel: desde tus primeras olas hasta sesiones especializadas con escuelas certificadas.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {discoveryHighlights.map((highlight) => (
              <article
                key={highlight.id}
                className="group flex flex-col rounded-3xl bg-[#F6F7F8] shadow-xl shadow-[#011627]/20 ring-1 ring-[#011627]/10 transition-transform duration-300 hover:-translate-y-2"
              >
                <div className="relative h-48 w-full overflow-hidden rounded-t-3xl">
                  <Image
                    src={highlight.imageUrl}
                    alt={highlight.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={highlight.id === 'beginners'}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-4 p-6">
                  <div>
                    <h3 className="text-xl font-semibold text-[#011627]">{highlight.title}</h3>
                    <p className="mt-2 text-sm text-[#011627]/70">{highlight.description}</p>
                  </div>
                  <div className="mt-auto">
                    <Link
                      href={highlight.ctaHref}
                      aria-label={highlight.ariaLabel}
                      className={`inline-flex items-center justify-center rounded-full ${highlight.ctaClasses} px-6 py-2 text-sm font-semibold shadow-lg transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2`}
                    >
                      {highlight.ctaLabel}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      
      {/* Sección principal de clases - Mobile Optimized */}
      <main id="encuentra-tu-clase" className="relative overflow-hidden bg-gradient-to-br from-[#011627] via-[#072F46] to-[#0F4C5C] py-6 sm:py-10">
        {/* Background Wave Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 1440 960" preserveAspectRatio="none">
              <defs>
                <linearGradient id="searchWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2EC4B6" stopOpacity="0.65" />
                  <stop offset="50%" stopColor="#FF3366" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#2EC4B6" stopOpacity="0.65" />
                </linearGradient>
              </defs>
              <path d="M0 200C180 150 360 230 540 190C720 150 900 230 1080 190C1260 150 1440 210 1440 210" stroke="url(#searchWaveGradient)" strokeWidth="4" fill="none" opacity="0.55" />
              <path d="M0 360C200 320 400 400 600 360C800 320 1000 400 1200 360C1320 340 1440 380 1440 380" stroke="url(#searchWaveGradient)" strokeWidth="3" fill="none" opacity="0.35" />
              <path d="M0 540C200 500 400 580 600 540C800 500 1000 580 1200 540C1320 520 1440 560 1440 560" stroke="url(#searchWaveGradient)" strokeWidth="2" fill="none" opacity="0.25" />
            </svg>
          </div>
          <div className="absolute -top-32 -left-16 h-72 w-72 rounded-full bg-[#FF3366]/25 blur-3xl" />
          <div className="absolute -bottom-24 -right-10 h-64 w-64 rounded-full bg-[#2EC4B6]/25 blur-3xl" />
          <div className="absolute top-1/3 right-1/4 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        </div>

        <div className="relative z-10 container mx-auto px-3 sm:px-4">
          {/* Mobile-Optimized Header Section */}
          <div className="text-center mb-4 sm:mb-8">
            {/* Mobile Badge */}
            <div className="inline-flex items-center bg-gradient-to-b from-[#FF3366] to-[#2EC4B6] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 shadow-xl">
              <SearchIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              BÚSQUEDA AVANZADA
            </div>
            
            <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 leading-tight px-2 sm:px-0">
              <span className="text-white">Encuentra tu</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF3366] via-[#FF668C] to-[#2EC4B6]">
                Clase Perfecta
              </span>
            </h2>
            
            <p className="text-sm xs:text-base sm:text-lg lg:text-xl text-[#E1EDF5] max-w-2xl mx-auto leading-relaxed font-medium mb-4 sm:mb-6 px-4 sm:px-0">
              <span className="text-[#5DE0D0] font-bold">Compara academias, precios y horarios.</span>
              <span className="block mt-1">Encuentra la clase ideal para tu nivel y ubicación preferida.</span>
            </p>

            {/* Mobile-Optimized Search Engine */}
            <div className="max-w-5xl mx-auto mb-4 sm:mb-6">
              <div className="relative bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl ring-1 ring-[#2EC4B6]/15 border border-white/60 mx-2 sm:mx-0 overflow-visible">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 items-end">
                  {/* Ubicación */}
                  <div className="sm:col-span-1 lg:col-span-1">
                    <label htmlFor="search-location" className="flex items-center text-xs font-semibold text-[#011627] mb-1">
                      <LocationIcon className="w-3 h-3 mr-1 text-[#2EC4B6]" />
                      Ubicación
                    </label>
                    <select
                      id="search-location"
                      className="search-input-enhanced search-select-enhanced search-element-transition w-full px-3 py-3 sm:py-2 rounded-lg text-sm font-medium touch-target-md border-[#CBD5E1] text-[#011627] focus:border-[#2EC4B6] focus:ring-[#9DE6DC]"
                    >
                      <option>Todas</option>
                      <option>Costa Verde</option>
                      <option>Punta Hermosa</option>
                      <option>San Bartolo</option>
                    </select>
                  </div>

                  {/* Nivel */}
                  <div className="sm:col-span-1 lg:col-span-1">
                    <label htmlFor="search-level" className="flex items-center text-xs font-semibold text-[#011627] mb-1">
                      <SurferIcon className="w-3 h-3 mr-1 text-[#2EC4B6]" />
                      Nivel
                    </label>
                    <select
                      id="search-level"
                      className="search-input-enhanced search-select-enhanced search-element-transition w-full px-3 py-3 sm:py-2 rounded-lg text-sm font-medium touch-target-md border-[#CBD5E1] text-[#011627] focus:border-[#2EC4B6] focus:ring-[#9DE6DC]"
                    >
                      <option>Todos</option>
                      <option>Principiante</option>
                      <option>Intermedio</option>
                      <option>Avanzado</option>
                    </select>
                  </div>

                  {/* Fecha */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label htmlFor="search-date" className="flex items-center text-xs font-semibold text-[#011627] mb-1">
                      <CalendarIcon className="w-3 h-3 mr-1 text-[#2EC4B6]" />
                      Fecha
                    </label>
                    <DatePicker
                      value={selectedDate}
                      onChange={handleDateChange}
                      placeholder="Cualquier fecha"
                      className="w-full touch-target-md"
                    />
                  </div>

                  {/* Precio */}
                  <div className="sm:col-span-1 lg:col-span-1">
                    <label htmlFor="search-price" className="flex items-center text-xs font-semibold text-[#011627] mb-1">
                      <MoneyIcon className="w-3 h-3 mr-1 text-[#2EC4B6]" />
                      Precio
                    </label>
                    <select
                      id="search-price"
                      className="search-input-enhanced search-select-enhanced search-element-transition w-full px-3 py-3 sm:py-2 rounded-lg text-sm font-medium touch-target-md border-[#CBD5E1] text-[#011627] focus:border-[#2EC4B6] focus:ring-[#9DE6DC]"
                    >
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
                      className="search-element-transition touch-target-lg w-full bg-gradient-to-r from-[#FF3366] to-[#D12352] text-white font-bold px-4 py-3 sm:py-2 rounded-lg transition-all duration-300 flex items-center justify-center text-sm shadow-lg hover:shadow-xl"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF3366] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando clases disponibles...</p>
          </div>
        )}

        {/* Mobile-Optimized Results Summary */}
        {!loading && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
            <div className="text-[#011627] font-medium text-sm sm:text-base">
              Mostrando {filteredClasses.length} de {classes.length} clases disponibles
              {error && <span className="text-yellow-600 text-xs sm:text-sm ml-2">(datos de ejemplo)</span>}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label htmlFor="search-sort" className="text-xs sm:text-sm font-medium text-[#011627] mobile-hidden flex-shrink-0">Ordenar:</label>
              <select
                id="search-sort"
                className="border-2 border-[#CBD5E1] rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-[#011627] bg-white focus:ring-2 focus:ring-[#9DE6DC] focus:border-[#2EC4B6] shadow-sm touch-target-md flex-1 sm:flex-none min-w-0 max-w-full"
              >
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
            <div className="w-24 h-24 mx-auto mb-4 bg-[#F6F7F8] rounded-full flex items-center justify-center border border-[#FF3366]/20">
              <SurferIcon className="w-12 h-12 text-[#2EC4B6]" />
            </div>
            <h3 className="text-xl font-semibold text-[#011627] mb-2">
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
        <div className="mt-16 bg-[#F6F7F8] rounded-2xl shadow-lg p-8 border border-[#E2E8F0]">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FFCCD9] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="w-8 h-8 text-[#FF3366]" />
              </div>
              <h3 className="text-xl font-semibold text-[#011627] mb-2">Instructores Certificados</h3>
              <p className="text-gray-600">Todos nuestros instructores están certificados y tienen años de experiencia.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#CCF4EF] rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldIcon className="w-8 h-8 text-[#2EC4B6]" />
              </div>
              <h3 className="text-xl font-semibold text-[#011627] mb-2">Seguridad Garantizada</h3>
              <p className="text-gray-600">Equipamiento de seguridad incluido y protocolos estrictos de seguridad.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#D9E8FF] rounded-full flex items-center justify-center mx-auto mb-4">
                <EquipmentIcon className="w-8 h-8 text-[#2D5BE3]" />
              </div>
              <h3 className="text-xl font-semibold text-[#011627] mb-2">Equipamiento Incluido</h3>
              <p className="text-gray-600">Tabla, neopreno y todo el equipamiento necesario incluido en el precio.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Stats */}
      <MarketplaceStats />

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