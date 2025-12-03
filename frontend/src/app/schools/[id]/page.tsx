'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Instagram, 
  Facebook, 
  MessageCircle,
  Star,
  Calendar,
  Users,
  Clock,
  Building2
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

export default function SchoolDetailPage() {
  const params = useParams()
  const router = useRouter()
  const schoolId = params?.id as string

  const [school, setSchool] = useState<School | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
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
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
              {/* Logo */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden">
                  {school.logo ? (
                    <Image
                      src={school.logo}
                      alt={`${school.name} logo`}
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Building2 className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* School Details */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                  <div className="text-center md:text-left">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">{school.name}</h1>
                    <div className="flex items-center justify-center md:justify-start text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{school.location}</span>
                    </div>
                    {school.foundedYear && (
                      <p className="text-xs sm:text-sm text-gray-500">
                        Fundada en {school.foundedYear} • {new Date().getFullYear() - school.foundedYear} años de experiencia
                      </p>
                    )}
                  </div>
                  {school.rating && school.rating > 0 && (
                    <div className="flex items-center justify-center bg-yellow-50 px-3 sm:px-4 py-2 rounded-lg mx-auto sm:mx-0">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current mr-1" />
                      <span className="text-base sm:text-lg font-bold text-gray-900">{school.rating.toFixed(1)}</span>
                      <span className="text-xs sm:text-sm text-gray-500 ml-1">({school.totalReviews || 0})</span>
                    </div>
                  )}
                </div>

                {school.description && (
                  <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 text-center md:text-left">{school.description}</p>
                )}

                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {school.phone && (
                    <a
                      href={`tel:${school.phone}`}
                      className="flex items-center justify-center md:justify-start text-gray-700 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                    >
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                      <span className="text-sm sm:text-base truncate">{school.phone}</span>
                    </a>
                  )}
                  {school.email && (
                    <a
                      href={`mailto:${school.email}`}
                      className="flex items-center justify-center md:justify-start text-gray-700 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                    >
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                      <span className="text-sm sm:text-base truncate">{school.email}</span>
                    </a>
                  )}
                  {school.website && (
                    <a
                      href={school.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center md:justify-start text-gray-700 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                    >
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                      <span className="text-sm sm:text-base">Sitio web</span>
                    </a>
                  )}
                  {school.whatsapp && (
                    <a
                      href={`https://wa.me/${school.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center md:justify-start text-gray-700 hover:text-green-600 transition-colors p-2 hover:bg-green-50 rounded-lg"
                    >
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                      <span className="text-sm sm:text-base">WhatsApp</span>
                    </a>
                  )}
                  {school.instagram && (
                    <a
                      href={`https://instagram.com/${school.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center md:justify-start text-gray-700 hover:text-pink-600 transition-colors p-2 hover:bg-pink-50 rounded-lg"
                    >
                      <Instagram className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                      <span className="text-sm sm:text-base truncate">@{school.instagram.replace('@', '')}</span>
                    </a>
                  )}
                  {school.facebook && (
                    <a
                      href={school.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center md:justify-start text-gray-700 hover:text-blue-700 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                    >
                      <Facebook className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                      <span className="text-sm sm:text-base">Facebook</span>
                    </a>
                  )}
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

        {/* Reviews Section - Placeholder for future implementation */}
        <div className="mt-12 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reseñas</h2>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Las reseñas estarán disponibles próximamente</p>
          </div>
        </div>
      </div>
    </div>
  )
}
