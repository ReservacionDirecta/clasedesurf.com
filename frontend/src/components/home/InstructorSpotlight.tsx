'use client'

import { useState, useEffect } from 'react'
import { StarIcon } from '@/components/ui/Icons'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

interface InstructorData {
  id: string | number
  name: string
  school: string
  rating: number
  reviews: number
  image: string
  specialties: string[]
}

// Fallback static data with better surf-related images
const FALLBACK_INSTRUCTORS: InstructorData[] = [
  {
    id: 'static-1',
    name: 'Carlos Mendoza',
    school: 'Lima Surf Academy',
    rating: 4.9,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=400&auto=format&fit=crop',
    specialties: ['Principiantes', 'Longboard']
  },
  {
    id: 'static-2',
    name: 'Sofia Mulanovich',
    school: 'Pro Surf Peru',
    rating: 5.0,
    reviews: 342,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
    specialties: ['Avanzado', 'Competición']
  },
  {
    id: 'static-3',
    name: 'Miguel Tudela',
    school: 'Tudela Surf School',
    rating: 4.8,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    specialties: ['Intermedio', 'Olas Grandes']
  },
  {
    id: 'static-4',
    name: 'Ana García',
    school: 'Waves Lima',
    rating: 4.7,
    reviews: 65,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop',
    specialties: ['Niños', 'Familias']
  },
  {
    id: 'static-5',
    name: 'Roberto Sánchez',
    school: 'Costa Verde Surf',
    rating: 4.6,
    reviews: 52,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
    specialties: ['Todos los niveles', 'SUP']
  }
]

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=400&auto=format&fit=crop'

export function InstructorSpotlight() {
  const router = useRouter()
  const [instructors, setInstructors] = useState<InstructorData[]>(FALLBACK_INSTRUCTORS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInstructors() {
      try {
        const res = await fetch('/api/instructors')
        if (res.ok) {
          const data = await res.json()
          
          // Filter active instructors and transform data
          const activeInstructors = data
            .filter((i: any) => i.isActive)
            .slice(0, 8) // Limit to 8 for the carousel
            .map((instructor: any) => ({
              id: instructor.id,
              name: instructor.user?.name || 'Instructor',
              school: instructor.school?.name || 'Escuela de Surf',
              rating: instructor.rating || 0,
              reviews: instructor.totalReviews || 0,
              image: instructor.profileImage || instructor.user?.profilePhoto || DEFAULT_AVATAR,
              specialties: instructor.specialties?.slice(0, 2) || []
            }))
          
          // Use API data if available, otherwise keep fallback
          if (activeInstructors.length > 0) {
            setInstructors(activeInstructors)
          }
        }
      } catch (error) {
        console.log('Using fallback instructor data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchInstructors()
  }, [])

  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#011627] tracking-tight">
              Nuestros Instructores
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Profesionales certificados listos para enseñarte
            </p>
          </div>
          <Button 
            variant="outline" 
            className="hidden sm:flex rounded-lg border-gray-200 hover:bg-gray-50 text-[#011627] text-sm px-4 py-2"
            onClick={() => router.push('/instructors')}
          >
            Ver todos
          </Button>
        </div>

        {/* Horizontal scroll container */}
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {loading ? (
            // Skeleton loaders
            [...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-56 snap-center animate-pulse">
                <div className="relative overflow-hidden rounded-2xl mb-3">
                  <div className="aspect-[3/4] bg-gray-200" />
                </div>
                <div className="flex gap-1.5">
                  <div className="h-5 w-16 bg-gray-200 rounded-full" />
                  <div className="h-5 w-20 bg-gray-200 rounded-full" />
                </div>
              </div>
            ))
          ) : (
            instructors.map((instructor) => (
              <div 
                key={instructor.id} 
                className="flex-shrink-0 w-56 snap-center group cursor-pointer"
                onClick={() => router.push(`/instructors/${instructor.id}`)}
              >
                <div className="relative overflow-hidden rounded-2xl mb-3">
                  <div className="aspect-[3/4] bg-gray-100">
                    <img 
                      src={instructor.image} 
                      alt={instructor.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_AVATAR
                      }}
                    />
                  </div>
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                     <div className="flex items-center gap-1 mb-1">
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-bold text-sm">{instructor.rating.toFixed(1)}</span>
                        <span className="text-white/70 text-xs">({instructor.reviews})</span>
                     </div>
                     <h3 className="font-bold text-base leading-tight">{instructor.name}</h3>
                     <p className="text-white/70 text-xs">{instructor.school}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1.5">
                  {instructor.specialties.length > 0 ? (
                    instructor.specialties.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                      Instructor certificado
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="sm:hidden mt-4 text-center">
          <Button 
            variant="outline" 
            className="w-full rounded-lg border-gray-200 hover:bg-gray-50 text-[#011627] text-sm"
            onClick={() => router.push('/instructors')}
          >
            Ver todos los instructores
          </Button>
        </div>
      </div>
    </section>
  )
}


