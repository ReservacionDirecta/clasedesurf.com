'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { StarIcon } from '@/components/ui/Icons'
import { Footer } from '@/components/layout/Footer'
import { InstructorReviewForm } from '@/components/instructors/InstructorReviewForm'

interface InstructorReview {
  id: number
  studentName: string
  rating: number
  comment?: string
  createdAt: string
}

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
    id: number
    name: string
    location: string
    logo?: string
  }
  reviews?: InstructorReview[]
}

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=400&auto=format&fit=crop'

export default function InstructorDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [instructor, setInstructor] = useState<Instructor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInstructor() {
      try {
        const res = await fetch(`/api/instructors/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setInstructor(data)
        } else {
          router.push('/instructors')
        }
      } catch (error) {
        console.error('Error fetching instructor:', error)
        router.push('/instructors')
      } finally {
        setLoading(false)
      }
    }
    if (params.id) {
      fetchInstructor()
    }
  }, [params.id, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!instructor) {
    return null
  }

  const image = instructor.profileImage || instructor.user.profilePhoto || DEFAULT_AVATAR

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          
          <a 
            href={`/schools/${instructor.school.id}`}
            className="text-sm text-blue-600 hover:underline"
          >
            Ver escuela
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="relative h-48 sm:h-64 bg-gradient-to-r from-blue-600 to-indigo-700">
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id="waves" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M0 10 Q5 5, 10 10 T 20 10" fill="none" stroke="white" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#waves)"/>
                </svg>
              </div>
            </div>
            
            <div className="relative px-6 sm:px-8 pb-8">
              {/* Avatar */}
              <div className="absolute -top-16 sm:-top-20 left-6 sm:left-8">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                  <img 
                    src={image} 
                    alt={instructor.user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_AVATAR
                    }}
                  />
                </div>
              </div>
              
              {/* Info */}
              <div className="pt-20 sm:pt-24">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
                      {instructor.user.name}
                    </h1>
                    <p className="text-gray-600 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {instructor.school.name} · {instructor.school.location}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <StarIcon className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="text-xl font-bold">{instructor.rating.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-gray-500">{instructor.totalReviews} reseñas</p>
                    </div>
                    
                    <div className="text-center px-4 border-l border-gray-200">
                      <span className="text-xl font-bold">{instructor.yearsExperience}</span>
                      <p className="text-xs text-gray-500">años exp.</p>
                    </div>
                  </div>
                </div>
                
                {/* Bio */}
                {instructor.bio && (
                  <p className="mt-6 text-gray-600 leading-relaxed">
                    {instructor.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Specialties & Certifications */}
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            {/* Specialties */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Especialidades
              </h2>
              <div className="flex flex-wrap gap-2">
                {instructor.specialties.map((specialty, i) => (
                  <span 
                    key={i} 
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium"
                  >
                    {specialty}
                  </span>
                ))}
                {instructor.specialties.length === 0 && (
                  <p className="text-gray-400 text-sm">Sin especialidades registradas</p>
                )}
              </div>
            </div>
            
            {/* Certifications */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Certificaciones
              </h2>
              <div className="space-y-2">
                {instructor.certifications.map((cert, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-700">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {cert}
                  </div>
                ))}
                {instructor.certifications.length === 0 && (
                  <p className="text-gray-400 text-sm">Sin certificaciones registradas</p>
                )}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Reseñas de estudiantes
            </h2>
            
            {instructor.reviews && instructor.reviews.length > 0 ? (
              <div className="space-y-6 mb-8">
                {instructor.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{review.studentName}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('es-PE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon 
                          key={i} 
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} 
                        />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8 italic mb-8">
                Aún no hay reseñas. ¡Sé el primero en opinar!
              </p>
            )}

            {/* Add Review Form */}
            <div className="pt-6 border-t border-gray-100">
              <InstructorReviewForm 
                instructorId={instructor.id} 
                onReviewAdded={() => {
                  // Re-fetch instructor data to show new rating and reviews
                  if (params.id) {
                    const fetchInstructor = async () => {
                        try {
                            const res = await fetch(`/api/instructors/${params.id}`)
                            if (res.ok) {
                            const data = await res.json()
                            setInstructor(data)
                            }
                        } catch (error) {
                            console.error('Error refreshing instructor:', error)
                        }
                    }
                    fetchInstructor()
                  }
                }} 
              />
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <a 
              href={`/schools/${instructor.school.id}`}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition-colors"
            >
              Ver clases de {instructor.school.name}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
