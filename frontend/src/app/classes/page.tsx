'use client'

import { useState, useEffect } from 'react'
import { ClassCard } from '@/components/classes/ClassCard'
import { BookingModal } from '@/components/booking/BookingModal'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { ClassFilters, FilterValues } from '@/components/classes/ClassFilters'

interface ClassData {
  id: number
  title: string
  description: string
  date: string
  duration: number
  capacity: number
  price: number
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  availableSpots?: number
  school: {
    id: number
    name: string
    location: string
    description?: string
    phone?: string
    email?: string
  }
  reservations?: any[]
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})

  useEffect(() => {
    fetchClasses()
  }, [filters])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query params from filters
      const queryParams = new URLSearchParams()
      if (filters.date) queryParams.append('date', filters.date)
      if (filters.level) queryParams.append('level', filters.level)
      if (filters.type) queryParams.append('type', filters.type)
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString())
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString())
      
      const url = `http://localhost:4000/classes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Error al cargar las clases')
      }
      
      const data = await response.json()
      setClasses(data)
    } catch (err) {
      console.error('Error fetching classes:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar las clases')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleResetFilters = () => {
    setFilters({})
    // Reset form inputs
    const form = document.querySelector('form')
    if (form) form.reset()
  }

  const handleSelectClass = (classData: ClassData) => {
    setSelectedClass(classData)
    setShowBookingModal(true)
  }

  const handleCloseModal = () => {
    setShowBookingModal(false)
    setSelectedClass(null)
  }

  const calculateAvailableSpots = (classData: ClassData) => {
    // Use availableSpots from backend if available
    if (classData.availableSpots !== undefined) {
      return classData.availableSpots
    }
    
    // Fallback calculation
    if (!classData.reservations) return classData.capacity
    
    const activeReservations = classData.reservations.filter(
      (r: any) => r.status !== 'CANCELED'
    ).length
    
    return classData.capacity - activeReservations
  }

  const transformClassData = (classData: ClassData) => {
    const classDate = new Date(classData.date)
    const startTime = new Date(classDate)
    const endTime = new Date(classDate.getTime() + classData.duration * 60000)
    
    return {
      id: String(classData.id),
      title: classData.title,
      description: classData.description || 'Clase de surf',
      date: classDate,
      startTime: startTime,
      endTime: endTime,
      duration: classData.duration,
      capacity: classData.capacity,
      price: classData.price,
      currency: 'USD',
      level: classData.level,
      type: 'GROUP' as const,
      location: classData.school.location,
      instructorName: 'Instructor',
      includesBoard: true,
      includesWetsuit: true,
      includesInsurance: true,
      availableSpots: calculateAvailableSpots(classData),
      school: {
        id: String(classData.school.id),
        name: classData.school.name,
        city: classData.school.location,
        rating: 4.8,
        totalReviews: 120,
        verified: true,
        yearsExperience: 10,
        description: classData.school.description
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Clases Disponibles</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                <div className="bg-white p-6 rounded-b-lg">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Clases Disponibles</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <svg 
              className="w-12 h-12 text-red-500 mx-auto mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error al cargar las clases</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchClasses}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (classes.length === 0) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Clases Disponibles</h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-12 text-center">
            <svg 
              className="w-16 h-16 text-blue-500 mx-auto mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
              />
            </svg>
            <h2 className="text-2xl font-semibold text-blue-800 mb-2">No hay clases disponibles</h2>
            <p className="text-blue-600">Vuelve pronto para ver nuevas clases de surf</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <PublicNavbar />
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Clases Disponibles</h1>
          <p className="text-gray-600">Encuentra la clase perfecta para tu nivel</p>
        </div>

        <ClassFilters 
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        <div className="mb-4 text-sm text-gray-600">
          {classes.length} {classes.length === 1 ? 'clase encontrada' : 'clases encontradas'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classData) => (
            <ClassCard
              key={classData.id}
              classData={transformClassData(classData)}
              onSelect={() => handleSelectClass(classData)}
            />
          ))}
        </div>
      </div>

      {selectedClass && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={handleCloseModal}
          classData={transformClassData(selectedClass)}
        />
      )}
      </div>
    </>
  )
}