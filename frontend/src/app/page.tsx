'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ClassCard } from '@/components/classes/ClassCard'
import { BookingModal } from '@/components/booking/BookingModal'
import { Hero } from '@/components/layout/Hero'
import { Footer } from '@/components/layout/Footer'
import { FilterPanel } from '@/components/marketplace/FilterPanel'
import { MarketplaceStats } from '@/components/marketplace/MarketplaceStats'

// Datos de ejemplo para el marketplace de escuelas de surf en Lima, Perú
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
    price: 25, // USD
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
      description: 'Escuela pionera en Lima con más de 8 años formando surfistas. Especializada en clases de iniciación con metodología probada y equipamiento de primera calidad.',
      shortReview: 'Excelente escuela, instructores muy pacientes y profesionales. Mi primera experiencia de surf fue increíble gracias a ellos.'
    },
    instructor: {
      name: 'Carlos Mendoza',
      rating: 4.8,
      experience: '6 años de experiencia, Instructor ISA certificado',
      specialties: ['Iniciación', 'Técnica básica', 'Seguridad acuática']
    },
    classImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'Intermedio en San Bartolo',
    description: 'Perfecciona tu técnica en Playa Waikiki, San Bartolo. Olas más desafiantes para surfistas con experiencia básica. Aprende maniobras y lectura de olas.',
    date: new Date('2024-12-20T16:00:00'),
    startTime: new Date('2024-12-20T16:00:00'),
    endTime: new Date('2024-12-20T18:00:00'),
    duration: 120,
    capacity: 6,
    price: 35, // USD
    currency: 'USD',
    level: 'INTERMEDIATE' as const,
    type: 'GROUP' as const,
    location: 'Playa Waikiki, San Bartolo',
    instructorName: 'Ana Rodriguez',
    includesBoard: true,
    includesWetsuit: true,
    includesInsurance: true,
    isActive: true,
    isCanceled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    schoolId: 'school-2',
    availableSpots: 3,
    school: {
      id: 'school-2',
      name: 'Waikiki Surf School',
      city: 'Lima',
      rating: 4.7,
      totalReviews: 189,
      verified: true,
      yearsExperience: 5,
      description: 'Escuela especializada en perfeccionamiento técnico ubicada en San Bartolo. Enfoque en maniobras avanzadas y lectura de olas para surfistas intermedios.',
      shortReview: 'Increíble progreso en pocas clases. Ana es una instructora excepcional que realmente entiende cómo enseñar surf.'
    },
    instructor: {
      name: 'Ana Rodriguez',
      rating: 4.9,
      experience: '8 años de experiencia, Ex-competidora nacional',
      specialties: ['Maniobras avanzadas', 'Lectura de olas', 'Competición']
    },
    classImage: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '3',
    title: 'Privada en La Herradura',
    description: 'Clase privada exclusiva en La Herradura, Chorrillos. Atención personalizada 1 a 1 con instructor experto. Progreso acelerado garantizado.',
    date: new Date('2024-12-21T09:00:00'),
    startTime: new Date('2024-12-21T09:00:00'),
    endTime: new Date('2024-12-21T11:00:00'),
    duration: 120,
    capacity: 1,
    price: 60, // USD
    currency: 'USD',
    level: 'BEGINNER' as const,
    type: 'PRIVATE' as const,
    location: 'Playa La Herradura, Chorrillos',
    instructorName: 'Miguel Santos',
    includesBoard: true,
    includesWetsuit: true,
    includesInsurance: true,
    isActive: true,
    isCanceled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    schoolId: 'school-3',
    availableSpots: 1,
    school: {
      id: 'school-3',
      name: 'Elite Surf Coaching',
      city: 'Lima',
      rating: 5.0,
      totalReviews: 67,
      verified: true,
      yearsExperience: 12,
      description: 'Coaching de élite con atención personalizada 1 a 1. Metodología exclusiva para acelerar el aprendizaje con instructores de nivel internacional.',
      shortReview: 'La mejor inversión que he hecho. Miguel es un instructor de clase mundial, mi nivel mejoró dramáticamente.'
    },
    instructor: {
      name: 'Miguel Santos',
      rating: 5.0,
      experience: '12 años de experiencia, Instructor ISA Level 2',
      specialties: ['Coaching personalizado', 'Técnica avanzada', 'Mentalidad competitiva']
    },
    classImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '4',
    title: 'Surf Kids en Callao',
    description: 'Clases especiales para niños (8-14 años) en Playa Redondo, Callao. Ambiente seguro y divertido con instructores especializados en enseñanza infantil.',
    date: new Date('2024-12-21T11:00:00'),
    startTime: new Date('2024-12-21T11:00:00'),
    endTime: new Date('2024-12-21T12:30:00'),
    duration: 90,
    capacity: 10,
    price: 20, // USD
    currency: 'USD',
    level: 'BEGINNER' as const,
    type: 'KIDS' as const,
    location: 'Playa Redondo, Callao',
    instructorName: 'Laura Fernandez',
    includesBoard: true,
    includesWetsuit: true,
    includesInsurance: true,
    isActive: true,
    isCanceled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    schoolId: 'school-4',
    availableSpots: 7,
    school: {
      id: 'school-4',
      name: 'Surf Kids Academy',
      city: 'Lima',
      rating: 4.8,
      totalReviews: 156,
      verified: true,
      yearsExperience: 6,
      description: 'Especialistas en enseñanza de surf para niños y adolescentes. Ambiente seguro, divertido y educativo con instructores especializados en pedagogía infantil.',
      shortReview: 'Mi hijo de 10 años aprendió súper rápido y se divirtió mucho. Laura tiene una paciencia increíble con los niños.'
    },
    instructor: {
      name: 'Laura Fernandez',
      rating: 4.9,
      experience: '7 años de experiencia, Especialista en pedagogía deportiva',
      specialties: ['Enseñanza infantil', 'Seguridad acuática', 'Juegos didácticos']
    },
    classImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '5',
    title: 'Intensivo Punta Rocas',
    description: 'Curso intensivo de fin de semana en la legendaria Punta Rocas, Punta Negra. 4 horas de surf intensivo con teoría avanzada y práctica en olas de calidad mundial.',
    date: new Date('2024-12-22T08:00:00'),
    startTime: new Date('2024-12-22T08:00:00'),
    endTime: new Date('2024-12-22T12:00:00'),
    duration: 240,
    capacity: 12,
    price: 80, // USD
    currency: 'USD',
    level: 'INTERMEDIATE' as const,
    type: 'INTENSIVE' as const,
    location: 'Punta Rocas, Punta Negra',
    instructorName: 'David Lopez',
    includesBoard: true,
    includesWetsuit: true,
    includesInsurance: true,
    isActive: true,
    isCanceled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    schoolId: 'school-5',
    availableSpots: 8,
    school: {
      id: 'school-5',
      name: 'Punta Rocas Pro',
      city: 'Lima',
      rating: 4.9,
      totalReviews: 98,
      verified: true,
      yearsExperience: 15,
      description: 'Escuela de surf de alto rendimiento en la legendaria Punta Rocas. Cursos intensivos para surfistas serios que buscan llevar su nivel al máximo.',
      shortReview: 'Punta Rocas es mágico y David conoce cada ola como la palma de su mano. Experiencia transformadora.'
    },
    instructor: {
      name: 'David Lopez',
      rating: 4.8,
      experience: '15 años de experiencia, Ex-surfista profesional',
      specialties: ['Olas grandes', 'Técnica avanzada', 'Preparación física']
    },
    classImage: 'https://images.unsplash.com/photo-1549419137-b93547285514?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '6',
    title: 'Avanzado en Señoritas',
    description: 'Clase avanzada en Playa Señoritas, Punta Hermosa. Para surfistas experimentados que buscan perfeccionar maniobras complejas en una de las mejores olas de Lima.',
    date: new Date('2024-12-22T15:00:00'),
    startTime: new Date('2024-12-22T15:00:00'),
    endTime: new Date('2024-12-22T17:00:00'),
    duration: 120,
    capacity: 4,
    price: 45, // USD
    currency: 'USD',
    level: 'ADVANCED' as const,
    type: 'GROUP' as const,
    location: 'Playa Señoritas, Punta Hermosa',
    instructorName: 'Roberto Sanchez',
    includesBoard: true,
    includesWetsuit: true,
    includesInsurance: true,
    isActive: true,
    isCanceled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    schoolId: 'school-6',
    availableSpots: 2,
    school: {
      id: 'school-6',
      name: 'Señoritas Surf Club',
      city: 'Lima',
      rating: 4.6,
      totalReviews: 143,
      verified: true,
      yearsExperience: 10,
      description: 'Club de surf enfocado en surfistas avanzados que buscan perfeccionar maniobras complejas en una de las mejores olas de Lima.',
      shortReview: 'Roberto es un maestro del surf. Sus consejos técnicos me ayudaron a mejorar maniobras que llevaba años intentando.'
    },
    instructor: {
      name: 'Roberto Sanchez',
      rating: 4.7,
      experience: '10 años de experiencia, Juez de competencias WSL',
      specialties: ['Maniobras aéreas', 'Surf de performance', 'Análisis técnico']
    },
    classImage: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '7',
    title: 'Paddleboard en Barranco',
    description: 'Aprende Stand Up Paddle (SUP) en las tranquilas aguas de Barranco. Perfecto para principiantes que buscan un deporte acuático relajante y divertido.',
    date: new Date('2024-12-23T10:00:00'),
    startTime: new Date('2024-12-23T10:00:00'),
    endTime: new Date('2024-12-23T11:30:00'),
    duration: 90,
    capacity: 6,
    price: 30, // USD
    currency: 'USD',
    level: 'BEGINNER' as const,
    type: 'GROUP' as const,
    location: 'Playa Barranco, Lima',
    instructorName: 'Sofia Martinez',
    includesBoard: true,
    includesWetsuit: false,
    includesInsurance: true,
    isActive: true,
    isCanceled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    schoolId: 'school-7',
    availableSpots: 4,
    school: {
      id: 'school-7',
      name: 'Lima Water Sports',
      city: 'Lima',
      rating: 4.5,
      totalReviews: 87,
      verified: true,
      yearsExperience: 4,
      description: 'Escuela especializada en deportes acuáticos diversos. Ofrecemos SUP, kayak y natación en aguas abiertas con enfoque en seguridad y diversión.',
      shortReview: 'Excelente introducción al SUP. Sofia es muy paciente y las vistas desde el agua son espectaculares.'
    },
    instructor: {
      name: 'Sofia Martinez',
      rating: 4.6,
      experience: '5 años de experiencia, Instructora SUP certificada',
      specialties: ['Stand Up Paddle', 'Equilibrio', 'Deportes acuáticos']
    },
    classImage: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '8',
    title: 'Natación en Aguas Abiertas',
    description: 'Mejora tu técnica de natación en el océano Pacífico. Clase especializada para surfistas que quieren fortalecer su nado y confianza en el mar.',
    date: new Date('2024-12-23T07:00:00'),
    startTime: new Date('2024-12-23T07:00:00'),
    endTime: new Date('2024-12-23T08:00:00'),
    duration: 60,
    capacity: 8,
    price: 22, // USD
    currency: 'USD',
    level: 'INTERMEDIATE' as const,
    type: 'GROUP' as const,
    location: 'Playa Costa Verde, Miraflores',
    instructorName: 'Ricardo Vargas',
    includesBoard: false,
    includesWetsuit: true,
    includesInsurance: true,
    isActive: true,
    isCanceled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    schoolId: 'school-8',
    availableSpots: 6,
    school: {
      id: 'school-8',
      name: 'Ocean Swimming Lima',
      city: 'Lima',
      rating: 4.4,
      totalReviews: 112,
      verified: true,
      yearsExperience: 7,
      description: 'Especialistas en natación en aguas abiertas y preparación física para deportes acuáticos. Fortalece tu técnica de nado para ser mejor surfista.',
      shortReview: 'Ricardo me ayudó a superar mi miedo al mar abierto. Ahora nado con mucha más confianza cuando surfeo.'
    },
    instructor: {
      name: 'Ricardo Vargas',
      rating: 4.5,
      experience: '9 años de experiencia, Ex-nadador de aguas abiertas',
      specialties: ['Natación oceánica', 'Técnica de nado', 'Seguridad acuática']
    },
    classImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600&auto=format&fit=crop'
  }
]

export default function Home() {
  const [selectedClass, setSelectedClass] = useState<typeof mockClasses[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filteredClasses, setFilteredClasses] = useState(mockClasses)
  const [filters, setFilters] = useState<any>({})

  const handleClassSelect = (classData: typeof mockClasses[0]) => {
    setSelectedClass(classData)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedClass(null)
  }

  const handleBookingSubmit = (bookingData: any) => {
    console.log('Booking submitted:', bookingData)
    // Aquí se implementará la lógica de reserva
    alert('¡Reserva enviada con éxito! Nos pondremos en contacto contigo pronto.')
    handleCloseModal()
  }

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
    
    let filtered = mockClasses.filter(classItem => {
      // Filter by location
      if (newFilters.location && !classItem.location?.includes(newFilters.location)) {
        return false
      }
      
      // Filter by level
      if (newFilters.level && classItem.level !== newFilters.level) {
        return false
      }
      
      // Filter by type
      if (newFilters.type && classItem.type !== newFilters.type) {
        return false
      }
      
      // Filter by price range
      if (classItem.price < newFilters.priceRange[0] || classItem.price > newFilters.priceRange[1]) {
        return false
      }
      
      // Filter by rating
      if (newFilters.rating && classItem.school.rating < newFilters.rating) {
        return false
      }
      
      // Filter by verified schools
      if (newFilters.verified && !classItem.school.verified) {
        return false
      }
      
      return true
    })
    
    setFilteredClasses(filtered)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      
      {/* Marketplace Stats */}
      <MarketplaceStats />
      
      {/* Sección principal de clases */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Encuentra tu Clase Perfecta
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Compara escuelas, precios, horarios y reseñas. Encuentra la clase ideal para tu nivel y ubicación preferida.
          </p>
        </div>

        {/* Advanced Filters */}
        <FilterPanel onFiltersChange={handleFiltersChange} />

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-900 font-medium">
            Mostrando {filteredClasses.length} de {mockClasses.length} clases disponibles
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

        {/* Grid de clases */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredClasses.map((classData) => (
            <ClassCard
              key={classData.id}
              classData={classData}
              onSelect={() => handleClassSelect(classData)}
            />
          ))}
        </div>

        {/* No Results */}
        {filteredClasses.length === 0 && (
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
              onClick={() => handleFiltersChange({})}
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
      </main>

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