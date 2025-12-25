'use client';

import Image from 'next/image';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { useState } from 'react';
import Link from 'next/link'
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { getBeachImage, getClassTypeImage, getSurfImageByLevel } from '@/lib/lima-beach-images';
import { formatDualCurrency } from '@/lib/currency';

interface ClassData {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  duration: number;
  capacity: number;
  price: number;
  currency: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  type: 'GROUP' | 'PRIVATE' | 'SEMI_PRIVATE' | 'INTENSIVE' | 'KIDS';
  location?: string;
  beach?: {
    name: string;
    location?: string;
  };
  instructorName?: string;
  includesBoard: boolean;
  includesWetsuit: boolean;
  includesInsurance: boolean;
  availableSpots?: number;
  school: {
    id: string;
    name: string;
    city: string;
    rating: number;
    totalReviews: number;
    verified: boolean;
    yearsExperience: number;
    logo?: string | null;
    coverImage?: string | null;
    description?: string | null;
    shortReview?: string | null;
  };
  instructor?: {
    name: string;
    photo?: string;
    rating: number;
    experience: string;
    specialties: string[];
  };
  classImage?: string;
  images?: string[]; // Array de URLs de imágenes
  isRecurring?: boolean;
  recurrencePattern?: {
    days: number[];
    times: string[];
  };
  startDate?: string | Date;
  endDate?: string | Date;
}

interface ClassCardProps {
  classData: ClassData;
  onSelect: () => void;
  priority?: boolean;
  searchContext?: {
    participants?: string | number;
  };
}

export function ClassCard({ classData, onSelect, priority = false, searchContext }: ClassCardProps) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  // ... (handleReserveClick) ...
  const handleReserveClick = () => {
    const params = new URLSearchParams();
    if (searchContext?.participants) {
      params.append('participants', searchContext.participants.toString());
    }
    const queryString = params.toString();
    const url = `/classes/${classData.id}${queryString ? `?${queryString}` : ''}`;
    
    router.push(url);
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  // ... (getLevelColor, getTypeLabel, getLevelLabel, getClassImage, getSchoolLogo, getInstructorPhoto, getInstructorCount) ...
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-orange-100 text-orange-800';
      case 'EXPERT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'GROUP': return 'Grupal';
      case 'PRIVATE': return 'Privada';
      case 'SEMI_PRIVATE': return 'Semi-privada';
      case 'INTENSIVE': return 'Intensivo';
      case 'KIDS': return 'Niños';
      default: return type;
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'Principiante';
      case 'INTERMEDIATE': return 'Intermedio';
      case 'ADVANCED': return 'Avanzado';
      case 'EXPERT': return 'Experto';
      default: return level;
    }
  };

  const getClassImage = (type: string, level: string) => {
    if (classData.images && classData.images.length > 0) return classData.images[0];
    if (classData.classImage && classData.classImage.includes('surf')) return classData.classImage;
    if (classData.location) return getBeachImage(classData.location, 'surf', level);
    return getClassTypeImage(type);
  };

  const getSchoolLogo = (schoolName: string) => {
    if (classData.school.logo) return classData.school.logo;
    if (classData.school.coverImage) return classData.school.coverImage;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(schoolName)}&size=64&background=0066cc&color=ffffff&bold=true`;
  };

  const getInstructorPhoto = (instructorName: string) => {
    if (classData.instructor?.photo) return classData.instructor.photo;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&size=48&background=059669&color=ffffff&bold=true`;
  };

  // Skip getInstructorCount implementation in replacement for brevity if untouched, but need to be careful with range.
  // Actually, I am replacing the top part and getInstructorCount is below.
  // Wait, I am replacing a huge chunk. I should target specific blocks.
  
  // Refactor: Just matching the interface update and isPast logic first.
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let isPast = false;
  if (classData.isRecurring && classData.endDate) {
      isPast = new Date(classData.endDate) < today;
  } else {
      isPast = new Date(classData.date) < today;
  }

  const getDayNames = (days: number[]) => {
      const dayMap = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return days.map(d => dayMap[d]).join(', ');
  };

  return (
    <div className={`bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 ${isPast ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      {/* ... (Image Gallery - keep existing logic) ... */}
      <div className="relative h-44 sm:h-52 overflow-hidden">
        {classData.images &&
        classData.images.length > 0 &&
        classData.images[0] &&
        classData.images[0].trim() !== '' ? (
          <div className="relative w-full h-full">
            <ImageWithFallback
              src={classData.images[0]}
              alt={`Clase de ${classData.title}`}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              priority={priority}
              loading={priority ? undefined : 'lazy'}
              fallbackSrc={getClassImage(classData.type, classData.level)}
              unoptimized={true} 
            />
            {classData.images.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                {classData.images.length} imágenes
              </div>
            )}
          </div>
        ) : (
             /* ... Keep Fallback Logic ... */
             (() => {
                const imageSrc = getClassImage(classData.type, classData.level);
                return (
                  <ImageWithFallback
                    src={imageSrc}
                    alt={`Clase de ${classData.title}`}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    priority={priority}
                    loading={priority ? undefined : 'lazy'}
                    unoptimized={true}
                  />
                );
             })()
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-black/10" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <span
            className={`${getLevelColor(classData.level)} px-3 py-1 rounded-full text-xs font-bold shadow-sm`}
          >
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
              const prices = formatDualCurrency(classData.price);
              return (
                <>
                  <div className="text-lg font-black text-gray-900">{prices.pen}</div>
                  <div className="text-xs text-gray-500 -mt-1">{prices.usd}</div>
                  <div className="text-xs text-gray-600 -mt-0.5">por persona</div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Availability indicator */}
        <div className="absolute bottom-3 right-3">
          {isPast ? (
            <div className="bg-gray-800/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              Finalizada
            </div>
          ) : classData.availableSpots && classData.availableSpots > 0 ? (
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
      <div className="p-4 sm:p-5">
        {/* School header ... */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
             <ImageWithFallback
               src={getSchoolLogo(classData.school.name)}
               alt={`Logo de ${classData.school.name}`}
               width={24}
               height={24}
               className="h-5 w-5 sm:h-6 sm:w-6 rounded-full border border-gray-200 shrink-0"
               fallbackSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(classData.school.name)}&size=64&background=0066cc&color=ffffff&bold=true`}
             />
             <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
               <h4 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                 {classData.school.name}
               </h4>
               {classData.school.verified && (
                 <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                   <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                   </svg>
                 </div>
               )}
             </div>
          </div>
          <div className="flex items-center space-x-0.5 sm:space-x-1 bg-yellow-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg shrink-0">
            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-[10px] sm:text-xs font-bold text-yellow-700">{classData.school.rating}</span>
            <span className="text-[10px] sm:text-xs text-yellow-600 hidden sm:inline">({classData.school.totalReviews})</span>
          </div>
        </div>

        {/* Class title */}
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2 line-clamp-1">
          {classData.title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
          {classData.description}
        </p>

        {/* Key details */}
        <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
          {/* Date and time */}
          {/* Duration only */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2">
            <svg 
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{classData.duration} min</span>
          </div>

          {/* Location - Muestra nombre de playa y ubicación */}
          {(classData.beach || classData.location) && (
            <div className="flex items-center text-xs sm:text-sm text-gray-600 min-w-0">
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-gray-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="font-medium truncate">
                {classData.beach
                  ? `${classData.beach.name}${classData.beach.location ? ` - ${classData.beach.location}` : classData.location ? ` - ${classData.location}` : ''}`
                  : classData.location}
              </span>
            </div>
          )}

          {/* Instructor info */}
          <div className="flex items-center text-xs sm:text-sm text-gray-600 min-w-0">
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-gray-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="font-medium truncate">
              {classData.instructorName || 'Instructor calificado'}
            </span>
          </div>
        </div>

        {/* Included items */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 sm:space-x-4 text-[10px] sm:text-xs text-gray-600 flex-wrap gap-1 sm:gap-0">
            {classData.includesBoard && (
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-1"></div>
                <span>Tabla</span>
              </div>
            )}
            {classData.includesWetsuit && (
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-1"></div>
                <span>Neopreno</span>
              </div>
            )}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500 shrink-0 ml-2">
            {classData.capacity} max
          </div>
        </div>

        {/* Action Button */}
        <button
          className={`w-full py-2.5 sm:py-3 px-4 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 touch-target-lg ${
            isPast 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : (classData.availableSpots ?? 0) > 0
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md hover:shadow-lg active:scale-95'
                : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
          }`}
          onClick={handleReserveClick}
          disabled={isPast || (classData.availableSpots ?? 0) <= 0}
          style={{ touchAction: 'manipulation' }}
        >
          {isPast 
            ? 'Clase Finalizada'
            : (classData.availableSpots ?? 0) > 0
              ? 'Reservar Ahora'
              : 'Lista de Espera'}
        </button>

        {/* Quick details toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full mt-3 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center justify-center"
        >
          <span className="mr-1">{showDetails ? 'Ver menos' : 'Más detalles'}</span>
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
        <div className="border-t border-gray-100 bg-gray-50/50 p-4 sm:p-5 animate-in slide-in-from-top duration-300">
          {/* School Header - Compact Grid */}
          <div className="flex items-start gap-4 mb-5">
            <Link href={`/schools/${classData.school.id}`} className="shrink-0 hover:opacity-80 transition-opacity">
              <ImageWithFallback
                src={getSchoolLogo(classData.school.name)}
                alt={`Logo de ${classData.school.name}`}
                width={56}
                height={56}
                className="h-14 w-14 rounded-full border border-gray-200 shadow-sm"
                fallbackSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(classData.school.name)}&size=64&background=0066cc&color=ffffff&bold=true`}
              />
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link href={`/schools/${classData.school.id}`}>
                  <h4 className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
                    {classData.school.name}
                  </h4>
                </Link>
                {classData.school.verified && (
                  <span className="text-blue-500" title="Escuela Verificada">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>

              {/* Meta info row */}
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                <span className="flex items-center gap-1 font-medium text-gray-700">
                  <span className="text-yellow-400">★</span> {classData.school.rating}
                  <span className="text-gray-400 font-normal">({classData.school.totalReviews})</span>
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span>{classData.school.yearsExperience} años exp.</span>
              </div>

              <Link 
                href={`/schools/${classData.school.id}`}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center"
              >
                Ver perfil
                <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
             {classData.school.description || 
               `Escuela de surf especializada en ${getLevelLabel(classData.level).toLowerCase()} con instructores certificados.`
             }
          </p>

          {/* Featured Review - Cleaner look */}
          {classData.school.shortReview && (
            <div className="relative pl-3 border-l-2 border-blue-200 mb-5">
              <p className="text-xs italic text-gray-600 leading-relaxed">
                "{classData.school.shortReview}"
              </p>
            </div>
          )}

          {/* Instructor Compact */}
          {classData.instructor && (
            <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3 shadow-sm">
              <ImageWithFallback
                src={getInstructorPhoto(classData.instructor.name)}
                alt={classData.instructor.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover border border-gray-100 shrink-0"
                fallbackSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(classData.instructor.name)}&size=48&background=059669&color=ffffff&bold=true`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <h5 className="text-sm font-semibold text-gray-900 truncate">
                    {classData.instructor.name}
                  </h5>
                  <span className="flex items-center text-[10px] font-bold text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded">
                    <span className="text-yellow-400 mr-0.5">★</span>
                    {classData.instructor.rating}
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-xs text-blue-600 font-medium whitespace-nowrap">Instructor</span>
                  {classData.instructor.specialties.slice(0, 2).map((spec, i) => (
                    <span key={i} className="text-[10px] text-gray-500 bg-gray-50 px-1.5 rounded truncate border border-gray-100">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
