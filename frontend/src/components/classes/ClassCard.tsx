'use client'

import Image from 'next/image'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { getBeachImage, getClassTypeImage, getSurfImageByLevel } from '@/lib/lima-beach-images'
import { formatDualCurrency } from '@/lib/currency'

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
  images?: string[]  // Array de URLs de imágenes
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
    // Si hay imágenes personalizadas, usar la primera
    if (classData.images && classData.images.length > 0) {
      return classData.images[0]
    }
    
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

  // Calcular número de instructores basado en tipo de clase y capacidad
  const getInstructorCount = (type: string, capacity: number) => {
    switch (type) {
      case 'PRIVATE':
        return 1 // Clases privadas siempre 1 instructor
      case 'SEMI_PRIVATE':
        return 1 // Semi-privadas (2-3 estudiantes) 1 instructor
      case 'GROUP':
        // Clases grupales: cada 2 estudiantes van acompañados de 1 instructor
        // Capacidad 3-4 estudiantes = 2-3 instructores
        if (capacity <= 2) return 1
        if (capacity <= 4) return Math.ceil(capacity / 2) // 3-4 estudiantes = 2-3 instructores
        return Math.ceil(capacity / 2) // Máximo ratio 1:2
      case 'INTENSIVE':
        // Intensivos requieren más atención, ratio 1:1 o 1:2
        return Math.ceil(capacity / 2)
      case 'KIDS':
        // Niños requieren más supervisión, ratio 1:1.5
        return Math.ceil(capacity / 1.5)
      default:
        return Math.ceil(capacity / 2)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200">
      {/* Image Gallery */}
      <div className="relative h-52 overflow-hidden">
        {classData.images && classData.images.length > 1 ? (
          <div className="relative w-full h-full">
            {/* Main image */}
            <Image
              src={classData.images[0]}
              alt={`Clase de ${classData.title}`}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
            {/* Image counter badge */}
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              {classData.images.length} imágenes
            </div>
          </div>
        ) : (
          <Image
            src={getClassImage(classData.type, classData.level)}
            alt={`Clase de ${classData.title}`}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <span className={`${getLevelColor(classData.level)} px-3 py-1 rounded-full text-xs font-bold shadow-sm`}>
            {getLevelLabel(classData.level)}
          </span>
          <span className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm">
            {getTypeLabel(classData.type)}
          </span>
        </div>

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
            {(() => {
              const prices = formatDualCurrency(classData.price)
              return (
                <>
                  <div className="text-lg font-black text-gray-900">{prices.pen}</div>
                  <div className="text-xs text-gray-500 -mt-1">{prices.usd}</div>
                  <div className="text-xs text-gray-600 -mt-0.5">por persona</div>
                </>
              )
            })()}
          </div>
        </div>

        {/* Availability indicator */}
        <div className="absolute bottom-3 right-3">
          {classData.availableSpots && classData.availableSpots > 0 ? (
            <div className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              {classData.availableSpots} disponibles
            </div>
          ) : (
            <div className="bg-red-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              Completo
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* School header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Image
              src={getSchoolLogo(classData.school.name)}
              alt={`Logo de ${classData.school.name}`}
              width={24}
              height={24}
              className="h-6 w-6 rounded-full border border-gray-200"
            />

            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-semibold text-gray-900">{classData.school.name}</h4>
              {classData.school.verified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-lg">
            <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-bold text-yellow-700">{classData.school.rating}</span>
            <span className="text-xs text-yellow-600">({classData.school.totalReviews})</span>
          </div>
        </div>

        {/* Class title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
          {classData.title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {classData.description}
        </p>

        {/* Key details */}
        <div className="space-y-3 mb-4">
          {/* Date and time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">{formatTime(classData.startTime)} - {formatTime(classData.endTime)}</span>
            </div>
            <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
              {classData.duration} min
            </div>
          </div>

          {/* Location */}
          {classData.location && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium truncate">{classData.location}</span>
            </div>
          )}

          {/* Instructor info */}
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium">{classData.instructorName || 'Instructor certificado'}</span>
          </div>
        </div>

        {/* Included items */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4 text-xs text-gray-600">
            {classData.includesBoard && (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                <span>Tabla</span>
              </div>
            )}
            {classData.includesWetsuit && (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                <span>Neopreno</span>
              </div>
            )}
            {classData.includesInsurance && (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                <span>Seguro</span>
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {classData.capacity} max
          </div>
        </div>

        {/* Action Button */}
        <button
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 touch-target-lg ${
            classData.availableSpots && classData.availableSpots > 0 
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300'
          }`}
          onClick={onSelect}
          disabled={!classData.availableSpots || classData.availableSpots === 0}
        >
          {classData.availableSpots && classData.availableSpots > 0 ? 'Reservar Ahora' : 'Lista de Espera'}
        </button>

        {/* Quick details toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full mt-3 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center justify-center"
        >
          <span className="mr-1">{showDetails ? 'Menos detalles' : 'Más detalles'}</span>
          <svg 
            className={`w-3 h-3 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expandable Details Section */}
      {showDetails && (
        <div className="border-t-2 border-gray-100 bg-gray-50 p-6 animate-in slide-in-from-top duration-300">
          {/* School Information */}
          <div className="mb-6">
            <div className="flex items-start space-x-4 mb-4">
              <Image
                src={getSchoolLogo(classData.school.name)}
                alt={`Logo de ${classData.school.name}`}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full border-2 border-gray-200 shadow-sm"
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
                <Image
                  src={getInstructorPhoto(classData.instructor.name)}
                  alt={`Foto de ${classData.instructor.name}`}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full border-2 border-gray-200 shadow-sm"
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