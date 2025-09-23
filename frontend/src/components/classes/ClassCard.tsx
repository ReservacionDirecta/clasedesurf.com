'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { getBeachImage, getClassTypeImage, getSurfImageByLevel } from '@/lib/lima-beach-images'

interface ClassData {
  id: string
  title: string
  description: string
  date: Date
  startTime: Date
  endTime: Date
  duration: number
  capacity: number
  price: number
  currency: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  type: 'GROUP' | 'PRIVATE' | 'SEMI_PRIVATE' | 'INTENSIVE' | 'KIDS'
  location?: string
  instructorName?: string
  includesBoard: boolean
  includesWetsuit: boolean
  includesInsurance: boolean
  availableSpots?: number
  school: {
    id: string
    name: string
    city: string
    rating: number
    totalReviews: number
    verified: boolean
    yearsExperience: number
    logo?: string
    description?: string
    shortReview?: string
  }
  instructor?: {
    name: string
    photo?: string
    rating: number
    experience: string
    specialties: string[]
  }
  classImage?: string
}

interface ClassCardProps {
  classData: ClassData
  onSelect: () => void
}

export function ClassCard({ classData, onSelect }: ClassCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800'
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800'
      case 'ADVANCED':
        return 'bg-orange-100 text-orange-800'
      case 'EXPERT':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'GROUP':
        return 'Grupal'
      case 'PRIVATE':
        return 'Privada'
      case 'SEMI_PRIVATE':
        return 'Semi-privada'
      case 'INTENSIVE':
        return 'Intensivo'
      case 'KIDS':
        return 'Niños'
      default:
        return type
    }
  }

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'Principiante'
      case 'INTERMEDIATE':
        return 'Intermedio'
      case 'ADVANCED':
        return 'Avanzado'
      case 'EXPERT':
        return 'Experto'
      default:
        return level
    }
  }

  // Generar imagen específica de surf en Lima basada en ubicación y nivel
  const getClassImage = (type: string, level: string) => {
    // Si hay imagen personalizada, usarla solo si es de surf
    if (classData.classImage && classData.classImage.includes('surf')) {
      return classData.classImage
    }
    
    // Priorizar imagen específica de la playa de Lima para surf
    if (classData.location) {
      return getBeachImage(classData.location, 'surf', level)
    }
    
    // Fallback a imagen de surf por tipo de clase (siempre surf en Lima)
    return getClassTypeImage(type)
  }

  // Generar logo de escuela
  const getSchoolLogo = (schoolName: string) => {
    if (classData.school.logo) {
      return classData.school.logo
    }
    // Generar avatar basado en el nombre de la escuela
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(schoolName)}&size=64&background=0066cc&color=ffffff&bold=true`
  }

  // Generar foto de instructor
  const getInstructorPhoto = (instructorName: string) => {
    if (classData.instructor?.photo) {
      return classData.instructor.photo
    }
    // Generar avatar basado en el nombre del instructor
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&size=48&background=059669&color=ffffff&bold=true`
  }

  return (
    <div className="marketplace-card overflow-hidden">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={getClassImage(classData.type, classData.level)}
          alt={`Clase de ${classData.title}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        <div className="absolute top-4 left-4">
          <span className={`${getLevelColor(classData.level)} level-${classData.level.toLowerCase()}`}>
            {getLevelLabel(classData.level)}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span className="bg-white bg-opacity-95 px-3 py-2 rounded-full text-sm font-bold text-gray-900 border-2 border-gray-200 shadow-sm">
            {getTypeLabel(classData.type)}
          </span>
        </div>

        {/* Info Toggle Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="absolute bottom-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all duration-200"
        >
          <svg 
            className={`w-5 h-5 text-gray-700 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* School Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-bold text-gray-900">{classData.school.name}</h4>
            {classData.school.verified && (
              <span className="verified-badge text-xs">
                ✓ Verificada
              </span>
            )}
          </div>
          <div className="rating-badge text-xs">
            <span className="text-yellow-600 mr-1">⭐</span>
            <span className="font-bold">{classData.school.rating}</span>
            <span className="ml-1">({classData.school.totalReviews})</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-high-contrast mb-3">
          {classData.title}
        </h3>
        
        <p className="text-medium-contrast mb-4 line-clamp-2 text-readable">
          {classData.description}
        </p>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="capitalize">{formatDate(classData.date)}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTime(classData.startTime)} - {formatTime(classData.endTime)}</span>
          </div>

          {classData.location && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{classData.location}</span>
            </div>
          )}

          {classData.instructorName && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{classData.instructorName}</span>
            </div>
          )}
        </div>

        {/* Included Equipment */}
        <div className="flex flex-wrap gap-2 mb-4">
          {classData.includesBoard && (
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
              🏄‍♂️ Tabla incluida
            </span>
          )}
          {classData.includesWetsuit && (
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
              🥽 Neopreno incluido
            </span>
          )}
          {classData.includesInsurance && (
            <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
              🛡️ Seguro incluido
            </span>
          )}
        </div>

        {/* Price and Availability */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <PriceDisplay 
              usdPrice={classData.price} 
              size="md"
              showBothCurrencies={true}
            />
            <span className="text-gray-600 text-sm">por persona</span>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">
              {classData.availableSpots ? (
                <span className="text-green-600 font-medium">
                  {classData.availableSpots} plazas disponibles
                </span>
              ) : (
                <span className="text-red-600 font-medium">
                  Completo
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              de {classData.capacity} total
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          className={`w-full touch-target ${
            classData.availableSpots && classData.availableSpots > 0 
              ? 'btn-primary-marketplace' 
              : 'btn-outline-marketplace'
          }`}
          onClick={onSelect}
          disabled={!classData.availableSpots || classData.availableSpots === 0}
        >
          {classData.availableSpots && classData.availableSpots > 0 ? 'Reservar Ahora' : 'Lista de Espera'}
        </button>
      </div>

      {/* Expandable Details Section */}
      {showDetails && (
        <div className="border-t-2 border-gray-100 bg-gray-50 p-6 animate-in slide-in-from-top duration-300">
          {/* School Information */}
          <div className="mb-6">
            <div className="flex items-start space-x-4 mb-4">
              <img
                src={getSchoolLogo(classData.school.name)}
                alt={`Logo de ${classData.school.name}`}
                className="w-16 h-16 rounded-full border-2 border-gray-200 shadow-sm"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-lg font-bold text-gray-900">{classData.school.name}</h4>
                  {classData.school.verified && (
                    <span className="verified-badge text-xs">✓</span>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <span className="rating-badge text-xs">
                    ⭐ {classData.school.rating} ({classData.school.totalReviews} reseñas)
                  </span>
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                    {classData.school.yearsExperience} años de experiencia
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {classData.school.description || 
                    `Escuela de surf especializada en ${getLevelLabel(classData.level).toLowerCase()} con instructores certificados y equipamiento de primera calidad.`
                  }
                </p>
              </div>
            </div>

            {/* Short Review */}
            {classData.school.shortReview && (
              <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-start space-x-3">
                  <div className="text-blue-500 text-lg">&ldquo;</div>
                  <div>
                    <p className="text-sm text-gray-700 italic mb-2">
                      {classData.school.shortReview}
                    </p>
                    <p className="text-xs text-gray-500">- Reseña destacada</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Instructor Information */}
          {classData.instructor && (
            <div className="border-t border-gray-200 pt-4">
              <h5 className="text-md font-bold text-gray-900 mb-3">Tu Instructor</h5>
              <div className="flex items-start space-x-4">
                <img
                  src={getInstructorPhoto(classData.instructor.name)}
                  alt={`Foto de ${classData.instructor.name}`}
                  className="w-12 h-12 rounded-full border-2 border-gray-200 shadow-sm"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h6 className="font-semibold text-gray-900">{classData.instructor.name}</h6>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                      ⭐ {classData.instructor.rating}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{classData.instructor.experience}</p>
                  <div className="flex flex-wrap gap-1">
                    {classData.instructor.specialties.map((specialty, index) => (
                      <span 
                        key={index}
                        className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}