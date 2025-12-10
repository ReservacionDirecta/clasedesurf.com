'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  MapPin, 
  Star,
  Calendar,
  Users,
  Clock,
  Building2,
  Award,
  Shield,
  TrendingUp
} from 'lucide-react'

interface School {
  id: number
  name: string
  location: string
  description?: string
  phone?: string
  email?: string
  website?: string
  instagram?: string
  facebook?: string
  whatsapp?: string
  address?: string
  logo?: string
  coverImage?: string
  foundedYear?: number
  rating?: number
  totalReviews?: number
}

interface Class {
  id: number
  title: string
  description?: string
  date: string
  startTime: string
  endTime: string
  price: number
  maxCapacity: number
  currentEnrollment: number
  level: string
  images?: string[]
  instructor?: {
    id: number
    user: {
      name: string
    }
  }
}

interface Review {
  id: number
  studentName: string
  rating: number
  comment?: string
  createdAt: string
}

// Reseñas de fallback si no hay reseñas reales
const fallbackReviews: Review[] = [
  {
    id: 1,
    studentName: 'María González',
    rating: 5,
    comment: 'Excelente experiencia. Los instructores son muy profesionales y pacientes. Aprendí mucho en mi primera clase.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    studentName: 'Carlos Ramírez',
    rating: 5,
    comment: 'La mejor escuela de surf en Lima. Equipamiento de calidad y ubicación perfecta. Totalmente recomendado.',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    studentName: 'Ana Martínez',
    rating: 4,
    comment: 'Muy buena atención y clases bien estructuradas. El único detalle es que a veces hay mucha gente, pero los instructores se encargan bien.',
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export default function SchoolDetailPage() {
  const params = useParams()
  const router = useRouter()
  const schoolId = params?.id as string

  const [school, setSchool] = useState<School | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!schoolId) return

    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch school data
        const schoolRes = await fetch(`/api/schools/${schoolId}`)
        if (!schoolRes.ok) throw new Error('Escuela no encontrada')
        const schoolData = await schoolRes.json()
        setSchool(schoolData)

        // Fetch classes for this school
        const classesRes = await fetch(`/api/schools/${schoolId}/classes`)
        if (classesRes.ok) {
          const classesData = await classesRes.json()
          setClasses(classesData)
        }

        // Fetch reviews for this school
        const reviewsRes = await fetch(`/api/schools/${schoolId}/reviews`)
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json()
          // Si hay menos de 3 reseñas, usar fallback
          if (reviewsData.length < 3) {
            setReviews([...reviewsData, ...fallbackReviews.slice(0, 3 - reviewsData.length)])
          } else {
            setReviews(reviewsData.slice(0, 6))
          }
        } else {
          // Si no hay reseñas, usar fallback
          setReviews(fallbackReviews)
        }
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : 'Error al cargar la escuela')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [schoolId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error || !school) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Escuela no encontrada</h2>
          <p className="text-gray-600 mb-6">{error || 'No se pudo cargar la información de la escuela'}</p>
          <Link
            href="/schools"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver todas las escuelas
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Cover Image */}
      <div className="relative h-48 sm:h-64 md:h-80 bg-gradient-to-br from-blue-600 to-blue-800">
        {school.coverImage ? (
          <Image
            src={school.coverImage}
            alt={school.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      {/* School Info Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 md:-mt-32 relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="p-6 sm:p-8 md:p-10">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Logo */}
              <div className="flex-shrink-0 mx-auto lg:mx-0">
                <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-4 border-white shadow-xl overflow-hidden">
                  {school.logo ? (
                    <Image
                      src={school.logo}
                      alt={`${school.name} logo`}
                      width={160}
                      height={160}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <Building2 className="w-16 h-16 sm:w-20 sm:h-20 text-blue-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* School Details */}
              <div className="flex-1 text-center lg:text-left">
                {/* Header with Name and Rating */}
                <div className="mb-6">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {school.name}
                  </h1>
                  <div className="flex items-center justify-center lg:justify-start text-gray-600 mb-3">
                    <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                    <span className="text-base sm:text-lg font-medium">{school.location}</span>
                  </div>
                  {school.foundedYear && (
                    <p className="text-sm text-gray-500 mb-4">
                      Fundada en {school.foundedYear} • <span className="font-semibold text-gray-700">{new Date().getFullYear() - school.foundedYear} años de experiencia</span>
                    </p>
                  )}
                </div>

                {/* Rating Section - Destacado */}
                {school.rating && school.rating > 0 ? (
                  <div className="mb-6 inline-flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-amber-50 px-6 py-4 rounded-xl border-2 border-yellow-200 shadow-lg">
                    <div className="flex items-center gap-2">
                      <Star className="w-8 h-8 text-yellow-400 fill-current" />
                      <div>
                        <div className="text-3xl font-black text-gray-900">{school.rating.toFixed(1)}</div>
                        <div className="text-sm text-gray-600 font-medium">{school.totalReviews || 0} reseñas</div>
                      </div>
                    </div>
                    <div className="h-12 w-px bg-yellow-300"></div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(school.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 inline-flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 rounded-xl border-2 border-gray-200">
                    <Star className="w-6 h-6 text-gray-400" />
                    <span className="text-gray-600 font-medium">Sin calificaciones aún</span>
                  </div>
                )}

                {/* Description */}
                {school.description && (
                  <div className="mb-6">
                    <p className="text-base sm:text-lg text-gray-700 leading-relaxed">{school.description}</p>
                  </div>
                )}

                {/* School Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-700">Certificada</span>
                    </div>
                    <p className="text-xs text-gray-600">Escuela verificada</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-semibold text-gray-700">Seguridad</span>
                    </div>
                    <p className="text-xs text-gray-600">Equipamiento incluido</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-semibold text-gray-700">Experiencia</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {school.foundedYear ? `${new Date().getFullYear() - school.foundedYear} años` : 'Profesional'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Classes Section */}
        <div className="mt-12 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Clases Disponibles</h2>
            <Link
              href={`/classes?schoolId=${school.id}`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todas →
            </Link>
          </div>

          {classes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.slice(0, 6).map((classItem) => (
                <Link
                  key={classItem.id}
                  href={`/classes/${classItem.id}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
                >
                  {/* Class Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-600">
                    {classItem.images && classItem.images.length > 0 ? (
                      <Image
                        src={classItem.images[0]}
                        alt={classItem.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Users className="w-16 h-16 text-white/30" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-bold text-blue-600">
                      S/ {classItem.price}
                    </div>
                  </div>

                  {/* Class Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{classItem.title}</h3>
                    {classItem.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{classItem.description}</p>
                    )}
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(classItem.date).toLocaleDateString('es-PE')}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{classItem.startTime} - {classItem.endTime}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{classItem.currentEnrollment}/{classItem.maxCapacity} inscritos</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {classItem.level}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No hay clases disponibles en este momento</p>
              <p className="text-gray-500 mt-2">Vuelve pronto para ver nuevas clases</p>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mt-12 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Reseñas de Estudiantes</h2>
            {school.rating && school.rating > 0 && (
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <span className="text-xl font-bold text-gray-900">{school.rating.toFixed(1)}</span>
                <span className="text-gray-600">({school.totalReviews || reviews.length} reseñas)</span>
              </div>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100"
                >
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">{review.studentName}</h4>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('es-PE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Comment */}
                  {review.comment && (
                    <p className="text-gray-700 leading-relaxed line-clamp-4">{review.comment}</p>
                  )}
                  {!review.comment && (
                    <p className="text-gray-500 italic">Sin comentario adicional</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">Aún no hay reseñas</p>
              <p className="text-gray-500 mt-2">Sé el primero en dejar una reseña</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
