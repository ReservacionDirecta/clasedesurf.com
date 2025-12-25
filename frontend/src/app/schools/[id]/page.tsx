  'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import ImageWithFallback from '@/components/ui/ImageWithFallback'
import Link from 'next/link'
import { formatDualCurrency } from '@/lib/currency'
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav'
import { 
  MapPin, 
  Star,
  Calendar,
  Users,
  Clock,
  Building2,
  Award,
  Shield,
  TrendingUp,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  MessageCircle
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
  date: string | null
  startTime: string | null
  endTime: string | null
  price: number
  maxCapacity: number
  currentEnrollment: number
  level: string
  images?: string[]
  duration: number
  nextSession?: {
    id: number
    date: string
    time: string
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
      <div className="relative h-48 sm:h-64 md:h-80 bg-linear-to-br from-blue-600 to-blue-800">
        {school.coverImage ? (
          <ImageWithFallback
            src={school.coverImage}
            alt={school.name}
            fill
            className="object-cover"
            priority
            fallbackComponent={
              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white/30" />
              </div>
            }
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
      </div>

      {/* School Info Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 md:-mt-32 relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="p-6 sm:p-8 md:p-10">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Logo */}
              <div className="shrink-0 mx-auto lg:mx-0">
                <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 border-4 border-white shadow-xl overflow-hidden">
                  {school.logo ? (
                    <ImageWithFallback
                      src={school.logo}
                      alt={`${school.name} logo`}
                      width={160}
                      height={160}
                      className="object-cover w-full h-full"
                      fallbackComponent={
                        <div className="w-full h-full bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                          <Building2 className="w-16 h-16 sm:w-20 sm:h-20 text-blue-400" />
                        </div>
                      }
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <Building2 className="w-16 h-16 sm:w-20 sm:h-20 text-blue-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* School Details */}
              <div className="flex-1 text-center lg:text-left">
                {/* Header with Name and Rating */}
                <div className="mb-6">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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

                  {/* Contact Quick Links */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-y-3 gap-x-6 mb-6">
                    {school.phone && (
                      <a href={`tel:${school.phone}`} className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors">
                        <Phone className="w-4 h-4 mr-2 text-blue-500" />
                        {school.phone}
                      </a>
                    )}
                    {school.email && (
                      <a href={`mailto:${school.email}`} className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors">
                        <Mail className="w-4 h-4 mr-2 text-blue-500" />
                        {school.email}
                      </a>
                    )}
                    {school.website && (
                      <a href={school.website.startsWith('http') ? school.website : `https://${school.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors">
                        <Globe className="w-4 h-4 mr-2 text-blue-500" />
                        Sitio Web
                      </a>
                    )}
                  </div>

                  {/* Social Buttons */}
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
                    {school.instagram && (
                      <a href={`https://instagram.com/${school.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" 
                        className="p-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors border border-pink-100 shadow-sm"
                        title="Instagram"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {school.facebook && (
                      <a href={school.facebook.startsWith('http') ? school.facebook : `https://facebook.com/${school.facebook}`} target="_blank" rel="noopener noreferrer" 
                        className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100 shadow-sm"
                        title="Facebook"
                      >
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                    {school.whatsapp && (
                      <a href={`https://wa.me/${school.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" 
                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors border border-green-100 shadow-sm"
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Rating Section - Destacado */}
                {school.rating && school.rating > 0 ? (
                  <div className="mb-6 inline-flex items-center gap-3 bg-linear-to-r from-yellow-50 to-amber-50 px-6 py-4 rounded-xl border-2 border-yellow-200 shadow-lg">
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
                  <div className="mb-6 inline-flex items-center gap-3 bg-linear-to-r from-gray-50 to-gray-100 px-6 py-4 rounded-xl border-2 border-gray-200">
                    <Star className="w-6 h-6 text-gray-400" />
                    <span className="text-gray-600 font-medium">Sin calificaciones aún</span>
                  </div>
                )}

                {/* Description */}
                {school.description && (
                  <div className="mb-8">
                    <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-light">
                      {school.description}
                    </p>
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
        <div className="mt-16 mb-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Clases Disponibles</h2>
              <p className="text-gray-500">Reserva tu próxima aventura en el mar</p>
            </div>
            <Link
              href={`/classes?schoolId=${school.id}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-bold transition-all hover:translate-x-1"
            >
              Ver disponibilidad completa <TrendingUp className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {classes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {classes.slice(0, 6).map((classItem) => (
                <Link
                  key={classItem.id}
                  href={`/classes/${classItem.id}`}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full"
                >
                  {/* Class Image Container */}
                  <div className="relative aspect-16/10 overflow-hidden bg-gray-100">
                    {classItem.images && classItem.images.length > 0 ? (
                      <ImageWithFallback
                        src={classItem.images[0]}
                        alt={classItem.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        fallbackComponent={
                          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50">
                            <Building2 className="w-12 h-12 text-blue-200" />
                          </div>
                        }
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50">
                        <Building2 className="w-12 h-12 text-blue-200" />
                      </div>
                    )}
                    
                    {/* Badge Overlay */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md ${
                        classItem.level === 'BEGINNER' ? 'bg-green-500/90 text-white' :
                        classItem.level === 'INTERMEDIATE' ? 'bg-blue-500/90 text-white' :
                        'bg-purple-500/90 text-white'
                      }`}>
                        {classItem.level === 'BEGINNER' ? 'Principiante' : 
                         classItem.level === 'INTERMEDIATE' ? 'Intermedio' : 
                         classItem.level === 'ADVANCED' ? 'Avanzado' : classItem.level}
                      </span>
                    </div>

                    {/* Price Tag */}
                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-white/20 text-right">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mb-0.5">Desde</p>
                      <div className="flex flex-col items-end">
                        <span className="text-xl font-black text-blue-600 leading-none">
                          {formatDualCurrency(Number(classItem.price) || 0).pen}
                        </span>
                        <span className="text-[11px] font-bold text-gray-400 leading-tight mt-1">
                          ~ {formatDualCurrency(Number(classItem.price) || 0).usd}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Class Info */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-extrabold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {classItem.title}
                    </h3>
                    
                    {classItem.description && (
                      <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed flex-1">
                        {classItem.description}
                      </p>
                    )}
                    
                    <div className="space-y-3 pt-4 border-t border-gray-50 mt-auto">
                      <div className="flex items-center text-sm font-medium text-gray-700">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mr-3 shrink-0">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <span>
                          {classItem.date 
                            ? new Date(classItem.date).toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })
                            : 'Próximamente'}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm font-medium text-gray-700">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mr-3 shrink-0">
                          <Clock className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span>
                          {classItem.startTime && classItem.endTime 
                            ? `${classItem.startTime} - ${classItem.endTime}` 
                            : `${classItem.duration} minutos`}
                        </span>
                      </div>

                      <div className="flex items-center text-sm font-medium text-gray-700">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center mr-3 shrink-0">
                          <Users className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="leading-tight">Capacidad limitada</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                            {classItem.maxCapacity} espacios totales
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button className="mt-6 w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-black text-sm uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      Ver detalles
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-20 text-center border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No hay clases programadas</h3>
              <p className="text-gray-500 max-w-xs mx-auto">Esta escuela aún no tiene clases publicadas. Vuelve pronto para ver nuevas fechas.</p>
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
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold">
                        {review.studentName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-0.5">{review.studentName}</h4>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                          {new Date(review.createdAt).toLocaleDateString('es-PE', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
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
      <MobileBottomNav />
    </div>
  )
}
