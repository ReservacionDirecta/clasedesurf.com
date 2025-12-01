'use client'

export const dynamic = 'force-dynamic';

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ClassCard } from '@/components/classes/ClassCard'
import { BookingModal } from '@/components/booking/BookingModal'
import { AirbnbSearchBar, type FilterValues } from '@/components/classes/AirbnbSearchBar'
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav'
import { apiService, transformApiClassToFrontend } from '@/services/api'

type ApiClassResponse = Awaited<ReturnType<typeof apiService.getClasses>>
type EnhancedClass = ReturnType<typeof transformApiClassToFrontend>

const fallbackHeroHighlights = [
  {
    id: 'surf-levels',
    title: 'Progresión guiada para cada nivel',
    description: 'Diseñamos experiencias personalizadas para que mejores tu técnica con confianza.'
  },
  {
    id: 'verified-schools',
    title: 'Escuelas verificadas y equipamiento premium',
    description: 'Trabajamos con academias certificadas, equipamiento completo y protocolos de seguridad.'
  },
  {
    id: 'fast-booking',
    title: 'Reserva rápida y sin fricción',
    description: 'Gestiona tus reservas en minutos y recibe confirmaciones inmediatas por Whatsapp.'
  }
] as const

const buildQueryParams = (filters: FilterValues) => {
  const params = new URLSearchParams()
  if (filters.date) params.append('date', filters.date)
  if (filters.level) params.append('level', filters.level)
  if (filters.type) params.append('type', filters.type)
  if (filters.locality) params.append('locality', filters.locality)
  return params.toString()
}

const useClasses = () => {
  const [classes, setClasses] = useState<EnhancedClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterValues>({})

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const query = buildQueryParams(filters)
      const endpoint = query ? `/api/classes?${query}` : '/api/classes'

      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error('No se pudieron cargar las clases, intenta nuevamente más tarde.')
      }

      const data = (await response.json()) as ApiClassResponse
      const enhanced = data.map((item) => transformApiClassToFrontend(item))
      setClasses(enhanced)
    } catch (err) {
      console.error('Error loading classes:', err)
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado al cargar las clases.')
      setClasses([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  return {
    classes,
    filters,
    setFilters,
    loading,
    error,
    refetch: fetchClasses
  }
}

const useBookingState = () => {
  const [selectedClass, setSelectedClass] = useState<EnhancedClass | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpen = (classData: EnhancedClass) => {
    setSelectedClass(classData)
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setSelectedClass(null)
  }

  return {
    selectedClass,
    isModalOpen,
    handleOpen,
    handleClose
  }
}

const useFilterHandlers = (setFilters: React.Dispatch<React.SetStateAction<FilterValues>>) => {
  const handleFilterChange = useCallback((newFilters: FilterValues) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [setFilters])

  const handleReset = useCallback(() => {
    setFilters({})
  }, [setFilters])

  return { handleFilterChange, handleReset }
}

const renderSkeleton = () => (
  <div className="mt-8 sm:mt-12 grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="animate-pulse rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-lg">
        <div className="mb-4 sm:mb-6 h-40 sm:h-48 rounded-xl sm:rounded-2xl bg-gray-200" />
        <div className="mb-2 sm:mb-3 h-3 sm:h-4 rounded bg-gray-200" />
        <div className="mb-2 sm:mb-3 h-3 sm:h-4 rounded bg-gray-200" />
        <div className="h-3 sm:h-4 rounded bg-gray-200" />
      </div>
    ))}
  </div>
)

const renderEmptyState = (message?: string) => (
  <div className="mx-auto mt-8 sm:mt-12 max-w-3xl rounded-2xl sm:rounded-3xl border border-[#CBD5E1] bg-white px-4 sm:px-8 py-12 sm:py-16 text-center shadow-xl">
    <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[#E9FBF7] text-[#2EC4B6]">
      <svg className="h-8 w-8 sm:h-10 sm:w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 7l9-4 9 4-9 4-9-4Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 12l9 4 9-4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 17l9 4 9-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <h2 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-semibold text-[#011627] px-2">{message ?? 'No encontramos clases con ese filtro'}</h2>
    <p className="mt-2 text-xs sm:text-sm text-[#46515F] px-2">
      Ajusta los filtros o vuelve a intentarlo luego. Estamos conectando con más escuelas cada semana.
    </p>
  </div>
)

const renderErrorState = (message: string, retry: () => void) => (
  <div className="mx-auto mt-8 sm:mt-12 max-w-3xl rounded-2xl sm:rounded-3xl border border-red-200 bg-red-50 px-4 sm:px-8 py-12 sm:py-16 text-center shadow-xl">
    <h2 className="text-xl sm:text-2xl font-semibold text-red-700 px-2">Ocurrió un error al cargar las clases</h2>
    <p className="mt-3 text-xs sm:text-sm text-red-600 px-2">{message}</p>
    <button
      type="button"
      onClick={retry}
      className="mt-6 inline-flex rounded-xl bg-[#FF3366] px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition-transform duration-200 active:scale-95 hover:-translate-y-0.5 hover:bg-[#D12352] touch-target-lg"
      style={{ touchAction: 'manipulation' }}
    >
      Intentar nuevamente
    </button>
  </div>
)

const renderHero = () => (
  <section className="relative overflow-hidden bg-gradient-to-br from-[#011627] via-[#072F46] to-[#0F4C5C] pb-12 sm:pb-16 pt-16 sm:pt-20 safe-area-top" style={{ paddingTop: 'max(4rem, env(safe-area-inset-top))' }}>
    <div className="absolute inset-0 opacity-40">
      <svg className="h-full w-full" viewBox="0 0 1440 960" preserveAspectRatio="none">
        <defs>
          <linearGradient id="classesWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2EC4B6" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#5DE0D0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FF3366" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="classesWaveHighlight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#5DE0D0" stopOpacity="0.05" />
          </linearGradient>
          <radialGradient id="classesWaveGlow" cx="80%" cy="20%" r="60%">
            <stop offset="0%" stopColor="#FF3366" stopOpacity="0.45" />
            <stop offset="65%" stopColor="#2EC4B6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#011627" stopOpacity="0" />
          </radialGradient>
          <filter id="waveBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="70" />
          </filter>
        </defs>

        <rect width="1440" height="960" fill="url(#classesWaveGlow)" opacity="0.6" />

        {/* Main wave with animation */}
        <g filter="url(#waveBlur)" opacity="0.45">
          <path
            className="wave-animated-1"
            d="M0 360C160 300 340 320 520 280C700 240 920 260 1090 220C1210 190 1325 150 1440 120L1440 960L0 960Z"
            fill="url(#classesWaveGradient)"
          />
        </g>

        {/* Animated wave lines */}
        <path
          className="wave-animated-2"
          d="M0 340C200 300 420 420 640 340C860 260 1080 380 1300 310C1360 290 1405 270 1440 250"
          stroke="url(#classesWaveHighlight)"
          strokeWidth="3"
          fill="none"
          opacity="0.75"
        />

        <path
          className="wave-animated-3"
          d="M0 540C220 500 420 580 640 520C860 460 1060 560 1240 500C1340 470 1400 440 1440 420"
          stroke="url(#classesWaveGradient)"
          strokeWidth="4"
          fill="none"
          opacity="0.6"
        />

        <path
          className="wave-animated-4"
          d="M0 220C200 180 360 260 560 200C760 140 980 240 1180 200C1300 170 1380 150 1440 140"
          stroke="url(#classesWaveGradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.55"
        />

        <g opacity="0.4">
          <path
            className="wave-animated-5"
            d="M0 760C240 720 400 800 620 760C840 720 1020 780 1230 740C1330 720 1390 700 1440 680"
            stroke="url(#classesWaveHighlight)"
            strokeWidth="2"
            fill="none"
          />
          <path
            className="wave-animated-6"
            d="M0 640C260 600 440 660 700 640C960 620 1160 680 1340 620C1400 600 1425 580 1440 560"
            stroke="url(#classesWaveGradient)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.65"
          />
        </g>
      </svg>
    </div>

    <div className="container relative mx-auto px-3 sm:px-4 lg:px-8">
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center text-white">
        <span className="inline-flex items-center rounded-full bg-white/15 px-3 sm:px-4 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.32em] text-[#5DE0D0]">
          Marketplace de clases de surf
        </span>
        <h1 className="mt-4 sm:mt-6 text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black leading-tight px-2 sm:px-0">
          Domina cada ola con clases guiadas.
        </h1>
        <p className="mt-3 sm:mt-4 text-xs sm:text-sm lg:text-base leading-relaxed text-[#E1EDF5]/90 text-center px-2 sm:px-0">
          Tu clase ideal, a solo un clic.
        </p>
      </div>
    </div>
  </section>
)

export default function ClassesPage() {
  const { data: session } = useSession()
  const { classes, filters, setFilters, loading, error, refetch } = useClasses()
  const { selectedClass, isModalOpen, handleOpen, handleClose } = useBookingState()
  const { handleFilterChange, handleReset } = useFilterHandlers(setFilters)
  const router = useRouter()

  const handleBookingClick = (classItem: EnhancedClass) => {
    if (!session) {
      const callbackUrl = encodeURIComponent(window.location.href)
      router.push(`/login?callbackUrl=${callbackUrl}`)
      return
    }
    handleOpen(classItem)
  }

  const resultsSummary = useMemo(() => {
    if (loading) {
      return 'Buscando clases disponibles…'
    }
    if (classes.length === 0) {
      return 'Sin coincidencias con el filtro actual'
    }
    return `${classes.length} ${classes.length === 1 ? 'clase disponible' : 'clases disponibles'}`
  }, [classes, loading])

  const handleBookingSubmit = async (payload: any) => {
    try {
      console.log('Reserva enviada:', payload);
      console.log('Selected class:', selectedClass);

      // Prepare reservation data
      const reservationData = {
        classId: payload.classId?.toString() || selectedClass?.id?.toString() || '',
        classData: selectedClass || {
          id: payload.classId,
          title: payload.title || 'Clase de Surf',
          price: payload.totalAmount / (payload.participants || 1),
          date: new Date(),
          startTime: new Date(),
          endTime: new Date(),
          level: 'BEGINNER',
          capacity: 10,
          availableSpots: 10
        },
        bookingData: {
          name: payload.name,
          email: payload.email,
          age: payload.age,
          height: payload.height,
          weight: payload.weight,
          canSwim: payload.canSwim || false,
          swimmingLevel: payload.swimmingLevel || 'BEGINNER',
          hasSurfedBefore: payload.hasSurfedBefore || false,
          injuries: payload.injuries || '',
          emergencyContact: payload.emergencyContact,
          emergencyPhone: payload.emergencyPhone,
          participants: payload.participants || 1,
          specialRequest: payload.specialRequest || '',
          totalAmount: payload.totalAmount || (selectedClass?.price || 0) * (payload.participants || 1)
        },
        status: 'pending' as const
      }

      // Save reservation data to sessionStorage
      sessionStorage.setItem('pendingReservation', JSON.stringify(reservationData))
      console.log('Datos guardados en sessionStorage:', reservationData);

      // Close modal first
      handleClose()

      // Wait a bit for modal to close, then redirect
      setTimeout(() => {
        console.log('Redirigiendo a /reservations/confirmation');
        window.location.href = '/reservations/confirmation'
      }, 150)
    } catch (err) {
      console.error('Error preparing reservation:', err)
      alert('Error al procesar la reserva. Por favor, inténtalo de nuevo.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F7F8] safe-area-bottom" style={{ paddingBottom: 'max(5rem, env(safe-area-inset-bottom))' }}>
      {renderHero()}

      <main className="relative -mt-8 sm:-mt-12 pb-20 sm:pb-24">
        <section className="container mx-auto px-3 sm:px-4 lg:px-8">
          <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-xl sm:shadow-2xl ring-1 ring-gray-100 lg:p-8">
            <header className="flex flex-col gap-3 sm:gap-4 border-b border-gray-100 pb-4 sm:pb-6">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#011627] leading-tight">Encuentra tu próxima clase</h2>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#46515F] leading-relaxed">
                  Busca clases de surf por ubicación, fecha, nivel y tipo. Visualiza disponibilidad en tiempo real.
                </p>
              </div>
              <span className="inline-flex self-start rounded-full bg-[#E9FBF7] px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold uppercase tracking-wide text-[#2EC4B6]">
                {resultsSummary}
              </span>
            </header>

            <div className="mt-4 sm:mt-6">
              <AirbnbSearchBar onFilterChange={handleFilterChange} onReset={handleReset} />
            </div>

            <div className="mt-6 sm:mt-8">
              {loading && renderSkeleton()}
              {!loading && error && renderErrorState(error, refetch)}
              {!loading && !error && classes.length === 0 && renderEmptyState()}
              {!loading && !error && classes.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {classes.map((classItem) => (
                    <ClassCard
                      key={classItem.id}
                      classData={classItem}
                      onSelect={() => handleBookingClick(classItem)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {selectedClass && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={handleClose}
          classData={selectedClass}
          onSubmit={handleBookingSubmit}
        />
      )}
      <MobileBottomNav />
    </div>
  )
}