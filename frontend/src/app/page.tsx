'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { ClassCard } from '@/components/classes/ClassCard'
import { BookingModal } from '@/components/booking/BookingModal'
import { Header } from '@/components/layout/Header'
import { Hero } from '@/components/layout/Hero'
import { Footer } from '@/components/layout/Footer'
import { FilterPanel } from '@/components/marketplace/FilterPanel'
import { MarketplaceStats } from '@/components/marketplace/MarketplaceStats'

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedClass, setSelectedClass] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [allClasses, setAllClasses] = useState<any[]>([])
  const [filteredClasses, setFilteredClasses] = useState<any[]>([])
  const [filters, setFilters] = useState<any>({})
  const [loadingClasses, setLoadingClasses] = useState(true)

  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/classes`);
        if (res.ok) {
          const data = await res.json();
          setAllClasses(data);
          setFilteredClasses(data);
        }
      } catch (error) {
        console.error("Failed to fetch classes", error);
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  const handleClassSelect = (classData: any) => {
    setSelectedClass(classData)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedClass(null)
  }

  const handleBookingSubmit = async (bookingData: any) => {
    if (!session) {
      router.push('/login?callbackUrl=' + window.location.pathname);
      return;
    }

    try {
      const token = (session as any)?.backendToken;
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          classId: selectedClass.id,
          specialRequest: bookingData.specialRequest,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create reservation');
      }

      alert('¡Reserva enviada con éxito! Revisa tu perfil para ver los detalles.');
      handleCloseModal();
    } catch (err: any) {
      console.error(err);
      alert(`Error al reservar: ${err.message}`);
    }
  }

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
    
    let filtered = allClasses.filter(classItem => {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <Hero />
      
      <MarketplaceStats />
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Encuentra tu Clase Perfecta
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Compara escuelas, precios, horarios y reseñas. Encuentra la clase ideal para tu nivel y ubicación preferida.
          </p>
        </div>

        <FilterPanel onFiltersChange={handleFiltersChange} />

        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-900 dark:text-gray-300 font-medium">
            Mostrando {filteredClasses.length} de {allClasses.length} clases disponibles
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Ordenar por:</span>
            <select className="border-2 border-gray-400 rounded-lg px-4 py-2 text-sm font-medium text-gray-900 bg-white dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-600 shadow-sm">
              <option>Más relevantes</option>
              <option>Precio: menor a mayor</option>
              <option>Precio: mayor a menor</option>
              <option>Mejor calificados</option>
              <option>Más cercanos</option>
            </select>
          </div>
        </div>

        {loadingClasses ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">Cargando clases...</div>
        ) : (
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

        {filteredClasses.length === 0 && !loadingClasses && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏄‍♂️</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No encontramos clases con esos filtros
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Intenta ajustar los filtros o buscar en otras fechas
            </p>
            <Button 
              variant="outline" 
              onClick={() => handleFiltersChange({})}
            >
              Limpiar Filtros
            </Button>
          </div>
        )}

        <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Instructores Certificados</h3>
              <p className="text-gray-600 dark:text-gray-400">Todos nuestros instructores están certificados y tienen años de experiencia.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Seguridad Garantizada</h3>
              <p className="text-gray-600 dark:text-gray-400">Equipamiento de seguridad incluido y protocolos estrictos de seguridad.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Equipamiento Incluido</h3>
              <p className="text-gray-600 dark:text-gray-400">Tabla, neopreno y todo el equipamiento necesario incluido en el precio.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />

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