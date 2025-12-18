'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { ClassCard } from '@/components/classes/ClassCard'
import { BookingModal } from '@/components/booking/BookingModal'
import { Hero } from '@/components/layout/Hero'
import { Footer } from '@/components/layout/Footer'
import { MarketplaceStats } from '@/components/marketplace/MarketplaceStats'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { 
  ShieldIcon, 
  CheckIcon,
  EquipmentIcon
} from '@/components/ui/Icons'
import { apiService, transformApiClassToFrontend, type ClassFilters } from '@/services/api'
import { AirbnbSearchBar, type FilterValues as AirbnbFilterValues } from '@/components/classes/AirbnbSearchBar'

// New Components
import { CategoryRail, type CategoryId } from '@/components/home/CategoryRail'
import { CuratedSection } from '@/components/home/CuratedSection'
import { DestinationGrid } from '@/components/home/DestinationGrid'

// Datos de ejemplo como fallback (Offline Mode)
const getMockDate = () => {
  const d = new Date()
  d.setDate(d.getDate() + 2) // 2 días en el futuro
  d.setHours(8, 0, 0, 0)
  return d
}

const mockDate = getMockDate()
const mockEndTime = new Date(mockDate)
mockEndTime.setHours(10, 0, 0, 0)

const mockClasses = [
  {
    id: '1',
    title: 'Iniciación en Miraflores',
    description: 'Aprende surf en la icónica Playa Makaha de Miraflores. Olas perfectas para principiantes con instructores calificados. Incluye teoría básica y práctica segura.',
    date: mockDate,
    startTime: mockDate,
    endTime: mockEndTime,
    duration: 120,
    capacity: 8,
    price: 90,
    currency: 'PEN', 
    level: 'BEGINNER' as const,
    type: 'GROUP' as const,
    location: 'Playa Makaha, Miraflores',
    instructorName: 'Carlos Mendoza',
    includesBoard: true,
    includesWetsuit: true,
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
      experience: '6 años de experiencia, Instructor ISA calificado',
      specialties: ['Iniciación', 'Técnica básica', 'Seguridad acuática']
    },
    classImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'Clase Privada Avanzada',
    description: 'Mejora tu técnica con videoanálisis y coaching personalizado 1 a 1.',
    date: mockDate,
    startTime: mockDate,
    endTime: mockEndTime,
    duration: 90,
    price: 150,
    currency: 'PEN',
    level: 'ADVANCED' as const,
    type: 'PRIVATE' as const,
    location: 'Punta Roquitas, Miraflores',
    instructorName: 'Sofia Mulanovich',
    includesBoard: true,
    includesWetsuit: true,
    isActive: true,
    isCanceled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    schoolId: 'school-2',
    availableSpots: 1,
    capacity: 1,
    school: {
      id: 'school-2',
      name: 'Pro Surf Peru',
      city: 'Lima',
      rating: 5.0,
      totalReviews: 120,
      verified: true,
      yearsExperience: 12
    },
    classImage: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=600&auto=format&fit=crop'
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
  
  // UI State
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all')
  const [isSearchMode, setIsSearchMode] = useState(false)

  // Derived Curated Lists
  const trendingClasses = useMemo(() => classes.slice(0, 6), [classes]);
  const beginnerClasses = useMemo(() => classes.filter(c => c.level === 'BEGINNER').slice(0, 6), [classes]);
  const privateClasses = useMemo(() => classes.filter(c => c.type === 'PRIVATE').slice(0, 6), [classes]);

  const handleAirbnbFilterChange = (airbnbFilters: AirbnbFilterValues) => {
    const newFilters: ClassFilters = {}
    if (airbnbFilters.date) newFilters.date = airbnbFilters.date
    if (airbnbFilters.level) newFilters.level = airbnbFilters.level
    if (airbnbFilters.type) newFilters.type = airbnbFilters.type
    if (airbnbFilters.locality) newFilters.locality = airbnbFilters.locality
    if (airbnbFilters.participants) newFilters.participants = airbnbFilters.participants
    if (airbnbFilters.q) newFilters.q = airbnbFilters.q
    
    // Actively switch to search mode if filters are applied
    const hasFilters = Object.values(airbnbFilters).some(v => v !== undefined && v !== '');
    if (hasFilters) {
      setIsSearchMode(true);
      // Ensure specific category is deselected if searching
      if (!newFilters.type && activeCategory !== 'all') {
         // Optionally keep category selected if it maps to type, otherwise reset visual
         // For now, simple behavior: generic search deselects specific visual category
         setActiveCategory('all');
      }
    }
    
    handleFiltersChange(newFilters)
  }

  const handleAirbnbReset = () => {
    setFilters({})
    setIsSearchMode(false)
    setActiveCategory('all')
    loadClasses() // Reload default future classes
  }

  const handleCategorySelect = (id: CategoryId) => {
    setActiveCategory(id);
    if (id === 'all') {
      setIsSearchMode(false);
      handleFiltersChange({});
    } else {
      setIsSearchMode(true);
      // Map category to filters
      const newFilters: ClassFilters = {};
      
      // Clear generic search when switching categories via rail for clarity
      // or keep it to refine? Let's keep it simple: category click resets text search usually
      // But keeping it composable is better. For now, let's just apply the category filter.
      
      if (id === 'beginner') newFilters.level = 'BEGINNER';
      if (id === 'group') newFilters.type = 'GROUP';
      if (id === 'private') newFilters.type = 'PRIVATE';
      if (id === 'kids') newFilters.type = 'KIDS';
      // Camps logic could be type='CAMP' or similar
      
      handleFiltersChange(newFilters);
    }
  };

  // Load classes from API on mount
  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const apiClasses = await apiService.getClasses() // No params = all classes
      const transformedClasses = apiClasses.map(transformApiClassToFrontend)
      
      const now = new Date()
      // By default show only future classes
      const futureClasses = transformedClasses.filter(c => c.startTime > now)
      
      setClasses(futureClasses)
      setFilteredClasses(futureClasses)
      
    } catch (err) {
      console.warn('⚠️ Failed to load from API, using mock data:', err)
      const now = new Date()
      const futureMockClasses = mockClasses.filter(c => c.startTime > now)
      
      setClasses(futureMockClasses)
      setFilteredClasses(futureMockClasses)
      setError('Usando datos de ejemplo (Modo Offline)')
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
      // Prepare reservation data
      const reservationData = {
        classId: selectedClass?.id?.toString() || bookingData.classId,
        classData: selectedClass,
        bookingData: {
            ...bookingData,
            totalAmount: bookingData.totalAmount || (selectedClass?.price || 0) * (bookingData.participants || 1)
        },
        status: 'pending' as const
      }

      sessionStorage.setItem('pendingReservation', JSON.stringify(reservationData))
      handleCloseModal()
      setTimeout(() => {
        window.location.href = '/reservations/confirmation'
      }, 150)
    } catch (err) {
      console.error('Error preparing reservation:', err)
      alert('Error al procesar la reserva.')
    }
  }

  const handleFiltersChange = async (newFilters: any) => {
    setLoading(true); // Explicit loading state for search
    setFilters(newFilters)

    try {
      const apiFilters: ClassFilters = { ...newFilters }
      
      // Ensure number/string mapping for price
      if (newFilters.priceRange) {
        apiFilters.minPrice = newFilters.priceRange[0]
        apiFilters.maxPrice = newFilters.priceRange[1]
      }
      if (newFilters.location || newFilters.locality) {
        apiFilters.locality = newFilters.location || newFilters.locality
      }

      console.log('🔍 Searching with filters:', apiFilters);
      
      // Fetch directly from API with the new filters
      const apiClasses = await apiService.getClasses(apiFilters)
      let transformedClasses = apiClasses.map(transformApiClassToFrontend)

      // --- Client Side Logic Fix ---
      // When strictly searching by name ('q'), we should NOT enforce strictly future dates
      // unless specifically asked. Sometimes users search for a past memorable class or
      // the backend returns exact matches that are technically 'yesterday' but relevant.
      // However, for booking, we usually want future.
      
      // Strategy: 
      // 1. If 'date' filter is provided, enforce it strictly.
      // 2. If 'q' is provided, relax date constraint slightly OR trust backend results mostly.
      // 3. Otherwise, default to future classes only.

      const matchStrictDate = (classItem: any) => {
         if (!newFilters.date) return true; // Pass if no date filter
         const candidates = [classItem.date, classItem.startTime, classItem.scheduledDate]
         return candidates.some((c) => {
             if (!c) return false;
             const d = c instanceof Date ? c : new Date(c);
             return !Number.isNaN(d.getTime()) && d.toISOString().split('T')[0] === newFilters.date;
         });
      }

      transformedClasses = transformedClasses.filter(classItem => {
         // Strict date check if filter exists
         if (newFilters.date && !matchStrictDate(classItem)) {
             return false;
         }
         
         // If no date filter AND no search query, perform default "future only" cleanup
         // This prevents showing old classes on generic category clicks if API returns them
         const isGenericBrowsing = !newFilters.q && !newFilters.date;
         if (isGenericBrowsing) {
             if (classItem.startTime < new Date()) return false;
         }

         return true;
      })
      
      setFilteredClasses(transformedClasses)
    } catch (err) {
      console.error('❌ Error applying filters:', err)
      // Fallback: Filter the ALREADY LOADED classes (from initial load)
      // This handles the "Offline" or "API Error" case gracefully
       const filtered = classes.filter(classItem => {
          if (newFilters.q) {
             const q = newFilters.q.toLowerCase();
             const match = classItem.title.toLowerCase().includes(q) || 
                           classItem.location?.toLowerCase().includes(q) ||
                           classItem.school?.name.toLowerCase().includes(q);
             if (!match) return false;
          }
          if (newFilters.level && classItem.level !== newFilters.level) return false
          if (newFilters.type && classItem.type !== newFilters.type) return false
          return true
       })
       setFilteredClasses(filtered)
    } finally {
       setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <Hero>
        <AirbnbSearchBar 
          onFilterChange={handleAirbnbFilterChange}
          onReset={handleAirbnbReset}
        />
      </Hero>
      
      {/* Navigation Rail (Sticky) */}
      <CategoryRail 
        activeCategory={activeCategory} 
        onSelectCategory={handleCategorySelect} 
      />

      {/* Main Content Area */}
      <div className="min-h-[600px] bg-[#F6F7F8]">
      
         {/* -- DISCOVERY MODE (Default) -- */}
         {!isSearchMode && !loading && (
            <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* 1. Trending / Popular */}
               <CuratedSection title="Tendencia esta semana" subtitle="Las clases más reservadas en los últimos 7 días" bgWhite>
                  {trendingClasses.map((item) => (
                      <div key={item.id} className="min-w-[280px] sm:min-w-[320px] max-w-[320px] snap-center">
                          <ClassCard classData={item} onSelect={() => handleClassSelect(item)} />
                      </div>
                  ))}
               </CuratedSection>

               {/* 2. Destination Grid */}
               <DestinationGrid />

               {/* 3. For Beginners */}
               <CuratedSection title="Ideal para Principiantes" subtitle="Clases suaves con instructores pacientes" linkHref="/?level=BEGINNER&mode=search">
                  {beginnerClasses.map((item) => (
                      <div key={item.id} className="min-w-[280px] sm:min-w-[320px] max-w-[320px] snap-center">
                          <ClassCard classData={item} onSelect={() => handleClassSelect(item)} />
                      </div>
                  ))}
               </CuratedSection>

               {/* 4. Private & Premium */}
               <CuratedSection title="Clases Privadas & Premium" subtitle="Atención 1 a 1 para progresar más rápido" bgWhite>
                  {privateClasses.map((item) => (
                      <div key={item.id} className="min-w-[280px] sm:min-w-[320px] max-w-[320px] snap-center">
                          <ClassCard classData={item} onSelect={() => handleClassSelect(item)} />
                      </div>
                  ))}
               </CuratedSection>
               
               {/* 5. Why Us Section */}
               <div className="mt-12 bg-white py-16">
                  <div className="container mx-auto px-4">
                     <div className="text-center max-w-2xl mx-auto mb-12">
                        <h3 className="text-2xl sm:text-3xl font-black text-[#011627]">¿Por qué reservar con nosotros?</h3>
                     </div>
                     <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
                        <div className="text-center group">
                           <div className="w-20 h-20 bg-[#FFCCD9] rounded-3xl flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-[#FF3366]/10">
                              <CheckIcon className="w-10 h-10 text-[#FF3366]" />
                           </div>
                           <h3 className="text-xl font-bold text-[#011627] mb-3">Instructores Certificados</h3>
                           <p className="text-gray-600 leading-relaxed px-4">Todos nuestros instructores están certificados y tienen años de experiencia.</p>
                        </div>
                        <div className="text-center group">
                           <div className="w-20 h-20 bg-[#CCF4EF] rounded-3xl flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110 group-hover:-rotate-3 shadow-lg shadow-[#2EC4B6]/10">
                              <ShieldIcon className="w-10 h-10 text-[#2EC4B6]" />
                           </div>
                           <h3 className="text-xl font-bold text-[#011627] mb-3">Seguridad Garantizada</h3>
                           <p className="text-gray-600 leading-relaxed px-4">Equipamiento de seguridad incluido y protocolos estrictos de seguridad.</p>
                        </div>
                        <div className="text-center group">
                           <div className="w-20 h-20 bg-[#D9E8FF] rounded-3xl flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110 shadow-lg shadow-blue-500/10">
                              <EquipmentIcon className="w-10 h-10 text-[#2D5BE3]" />
                           </div>
                           <h3 className="text-xl font-bold text-[#011627] mb-3">Equipamiento Incluido</h3>
                           <p className="text-gray-600 leading-relaxed px-4">Tabla, neopreno y todo el equipamiento necesario incluido en el precio.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}


         {/* -- SEARCH MODE (Activo cuando hay filtros) -- */}
         {(isSearchMode || loading) && (
            <div className="container mx-auto px-3 sm:px-4 py-8">
               {/* Fixed Height Placeholder to prevent layout shift initially (optional) */}
               
               {/* Controls / Sort */}
               {!loading && filteredClasses.length > 0 && (
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                     <div>
                        <h2 className="text-2xl font-bold text-[#011627]">
                           {filteredClasses.length > 0 ? (
                               filters.q ? `Resultados para "${filters.q}"` : 'Clases encontradas'
                           ) : 'Buscando...'}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                           Mostrando {filteredClasses.length} experiencias disponibles
                        </p>
                     </div>
                     
                     <div className="flex items-center gap-2 bg-white p-1 pr-4 rounded-xl shadow-sm border border-gray-100 self-end sm:self-auto">
                         <span className="text-xs font-bold text-gray-400 pl-3 uppercase tracking-wider">Ordenar:</span>
                         <select className="bg-transparent border-none text-sm font-bold text-[#011627] focus:ring-0 cursor-pointer py-2 pl-2">
                            <option value="relevance">Relevancia</option>
                            <option value="price_asc">Precio: Menor a Mayor</option>
                            <option value="price_desc">Precio: Mayor a Menor</option>
                         </select>
                     </div>
                  </div>
               )}

               {/* Stats / Loading / Empty */}
                {loading ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <LoadingSkeleton />
                      <LoadingSkeleton />
                      <LoadingSkeleton />
                   </div>
                ) : (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                      {filteredClasses.map((classData, idx) => (
                         <div key={classData.id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards">
                            <ClassCard
                               classData={classData}
                               onSelect={() => handleClassSelect(classData)}
                               searchContext={{ participants: filters.participants }}
                            />
                         </div>
                      ))}
                   </div>
                )}
                
                {/* Empty State */}
                {!loading && filteredClasses.length === 0 && (
                   <div className="text-center py-24 px-4">
                      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100 animate-bounce">
                         <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <h3 className="text-2xl font-bold text-[#011627] mb-3">No encontramos resultados</h3>
                      <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        Intentamos buscar "{filters.q || 'tu selección'}" pero no hubo suerte. Prueba ajustando los filtros o fechas.
                      </p>
                      <Button onClick={handleAirbnbReset} variant="outline" className="px-8 py-6 text-base rounded-xl hover:bg-gray-50 border-gray-200">
                         Ver todas las clases disponibles
                      </Button>
                   </div>
                )}
            </div>
         )}
      </div>

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