'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StarIcon } from '@/components/ui/Icons'
import { Footer } from '@/components/layout/Footer'

interface Instructor {
  id: number
  userId: number
  schoolId: number
  bio?: string
  yearsExperience: number
  specialties: string[]
  certifications: string[]
  rating: number
  totalReviews: number
  profileImage?: string
  isActive: boolean
  user: {
    name: string
    email: string
    profilePhoto?: string
  }
  school: {
    name: string
    location: string
  }
}

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop'

function InstructorCard({ instructor }: { instructor: Instructor }) {
  const router = useRouter()
  const image = instructor.profileImage || instructor.user.profilePhoto || DEFAULT_AVATAR
  
  return (
    <div 
      className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      onClick={() => router.push(`/instructors/${instructor.id}`)}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img 
          src={image} 
          alt={instructor.user.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_AVATAR
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
          <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="text-sm font-bold text-gray-900">{instructor.rating.toFixed(1)}</span>
        </div>
        
        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h3 className="text-xl font-bold mb-1">{instructor.user.name}</h3>
          <p className="text-white/80 text-sm">{instructor.school.name}</p>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {instructor.yearsExperience} años
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {instructor.school.location}
          </span>
        </div>
        
        {/* Specialties */}
        <div className="flex flex-wrap gap-2">
          {instructor.specialties.slice(0, 3).map((specialty, i) => (
            <span 
              key={i} 
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
            >
              {specialty}
            </span>
          ))}
          {instructor.specialties.length > 3 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
              +{instructor.specialties.length - 3}
            </span>
          )}
        </div>
        
        {/* Reviews count */}
        <p className="text-xs text-gray-400 mt-4">
          {instructor.totalReviews} reseñas
        </p>
      </div>
    </div>
  )
}

function InstructorSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="aspect-[4/5] bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    async function fetchInstructors() {
      try {
        const res = await fetch('/api/instructors')
        if (res.ok) {
          const data = await res.json()
          setInstructors(data.filter((i: Instructor) => i.isActive))
        }
      } catch (error) {
        console.error('Error fetching instructors:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchInstructors()
  }, [])

  const filteredInstructors = instructors.filter(instructor => {
    if (!filter) return true
    const searchLower = filter.toLowerCase()
    return (
      instructor.user.name.toLowerCase().includes(searchLower) ||
      instructor.school.name.toLowerCase().includes(searchLower) ||
      instructor.specialties.some(s => s.toLowerCase().includes(searchLower))
    )
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight">
              Nuestros Instructores
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-8">
              Profesionales certificados apasionados por enseñar. Encuentra el instructor perfecto para tu nivel y objetivos.
            </p>
            
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="Buscar por nombre, escuela o especialidad..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-5 py-4 pl-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <svg 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Instructors Grid */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <InstructorSkeleton key={i} />
              ))}
            </div>
          ) : filteredInstructors.length > 0 ? (
            <>
              <p className="text-gray-500 mb-8">
                Mostrando {filteredInstructors.length} instructor{filteredInstructors.length !== 1 ? 'es' : ''}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredInstructors.map((instructor) => (
                  <InstructorCard key={instructor.id} instructor={instructor} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No encontramos instructores</h3>
              <p className="text-gray-500">
                {filter ? `No hay resultados para "${filter}"` : 'Pronto tendremos instructores disponibles'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">
            ¿Eres instructor de surf?
          </h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Únete a nuestra plataforma y conecta con miles de estudiantes que buscan aprender contigo.
          </p>
          <a 
            href="/register-school"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition-colors"
          >
            Registrar mi escuela
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}
