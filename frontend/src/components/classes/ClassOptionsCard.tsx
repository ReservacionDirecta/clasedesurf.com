'use client';

import { useState } from 'react';
import { Clock, Users, MapPin, ChevronDown, ChevronUp, CheckCircle, Globe } from 'lucide-react';
import { formatDualCurrency } from '@/lib/currency';

export interface ClassOption {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  price: number;
  currency?: string;
  type: 'GROUP' | 'SEMI_PRIVATE' | 'PRIVATE';
  maxParticipants?: number;
  language?: string;
  meetingPoint?: string;
  features?: string[];
  freeCancellation?: boolean;
  isPopular?: boolean;
  discount?: number; // percentage
}

interface ClassOptionsCardProps {
  options: ClassOption[];
  onSelect: (option: ClassOption) => void;
  showAllByDefault?: boolean;
}

export function ClassOptionsCard({ options, onSelect, showAllByDefault = false }: ClassOptionsCardProps) {
  const [showAll, setShowAll] = useState(showAllByDefault);
  const [expandedOption, setExpandedOption] = useState<string | null>(null);

  const visibleOptions = showAll ? options : options.slice(0, 3);
  const hasMoreOptions = options.length > 3;

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours} h ${mins} min` : `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
    return `${minutes} min`;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'GROUP':
        return 'Clase grupal';
      case 'SEMI_PRIVATE':
        return 'Clase semiprivada';
      case 'PRIVATE':
        return 'Clase privada';
      default:
        return 'Clase';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'GROUP':
        return '👥';
      case 'SEMI_PRIVATE':
        return '👫';
      case 'PRIVATE':
        return '🎯';
      default:
        return '🏄';
    }
  };

  return (
    <div className="class-options-container" id="class-options">
      {/* Section Title */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#011627]">Selecciona una opción</h2>
        <span className="text-sm text-gray-500">{options.length} opciones disponibles</span>
      </div>

      {/* Options List */}
      <div className="space-y-4">
        {visibleOptions.map((option, index) => {
          const isExpanded = expandedOption === option.id;
          const priceFormatted = formatDualCurrency(option.price);

          return (
            <div
              key={option.id}
              className={`
                relative border rounded-2xl bg-white overflow-hidden transition-all duration-300
                ${option.isPopular ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200'}
                hover:shadow-lg hover:border-blue-300
              `}
            >
              {/* Popular Badge */}
              {option.isPopular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold py-1.5 px-4 text-center">
                  ⭐ Opción más popular
                </div>
              )}

              <div className={`p-5 ${option.isPopular ? 'pt-10' : ''}`}>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{getTypeIcon(option.type)}</span>
                      <h3 className="text-lg font-bold text-[#011627]">{option.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{option.description}</p>
                  </div>

                  {/* Discount Badge */}
                  {option.discount && option.discount > 0 && (
                    <span className="shrink-0 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                      -{option.discount}%
                    </span>
                  )}
                </div>

                {/* Features Icons Row */}
                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="font-semibold">{formatDuration(option.duration)}</span>
                  </div>

                  {option.language && (
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-semibold">{option.language}</span>
                    </div>
                  )}

                  {option.maxParticipants && (
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="font-semibold">Máx. {option.maxParticipants} personas</span>
                    </div>
                  )}
                </div>

                {/* Meeting Point (Clickable) */}
                {option.meetingPoint && (
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-blue-600 transition-colors mb-4 group"
                    onClick={() => setExpandedOption(isExpanded ? null : option.id)}
                  >
                    <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="font-semibold group-hover:underline underline-offset-2">
                      {option.meetingPoint}
                    </span>
                  </button>
                )}

                {/* Expandable Section */}
                {isExpanded && option.features && option.features.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-4 animate-in slide-in-from-top-2 duration-300">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Qué incluye:</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {option.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Footer: Price + CTA */}
                <div className="flex items-end justify-between gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-xs text-gray-500 block">A partir de</span>
                    <div className="flex items-baseline gap-1">
                      {option.discount && option.discount > 0 && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatDualCurrency(option.price / (1 - option.discount / 100)).pen}
                        </span>
                      )}
                      <span className="text-2xl font-bold text-[#011627]">{priceFormatted.pen}</span>
                    </div>
                    <span className="text-xs text-gray-500">por persona</span>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={() => onSelect(option)}
                      className="bg-[#0071EB] hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-lg active:scale-95 whitespace-nowrap"
                    >
                      Seleccionar
                    </button>

                    {option.freeCancellation && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        <span>Cancelación gratuita</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More / Show Less */}
      {hasMoreOptions && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 hover:shadow-md"
          >
            {showAll ? (
              <>
                <span>Ver menos opciones</span>
                <ChevronUp className="w-5 h-5" />
              </>
            ) : (
              <>
                <span>Ver todas las opciones ({options.length})</span>
                <ChevronDown className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// Helper function to generate sample options from class data
export function generateClassOptions(classData: {
  title: string;
  price: number;
  duration: number;
  location?: string;
  type?: string;
}) : ClassOption[] {
  const basePrice = classData.price;

  return [
    {
      id: 'group',
      title: 'Clase de surf en grupo',
      description: 'Las clases de surf en grupo son una forma divertida y efectiva de aprender a surfear junto a otros estudiantes.',
      duration: classData.duration || 120,
      price: basePrice,
      type: 'GROUP',
      maxParticipants: 8,
      language: 'Español',
      meetingPoint: classData.location || 'Por confirmar',
      features: [
        'Instructor certificado',
        'Tabla de surf incluida',
        'Wetsuit incluido',
        'Fotos de la sesión',
        'Grupos reducidos',
        'Seguro incluido'
      ],
      freeCancellation: true,
      isPopular: true
    },
    {
      id: 'semi-private',
      title: 'Clase de surf semiprivada',
      description: 'Nunca es demasiado tarde para empezar a surfear. Gana confianza con atención más personalizada.',
      duration: classData.duration || 120,
      price: Math.round(basePrice * 1.5),
      type: 'SEMI_PRIVATE',
      maxParticipants: 3,
      language: 'Español',
      meetingPoint: classData.location || 'Por confirmar',
      features: [
        'Instructor certificado',
        'Tabla de surf incluida',
        'Wetsuit incluido',
        'Fotos y video de la sesión',
        'Atención personalizada',
        'Feedback técnico detallado'
      ],
      freeCancellation: true
    },
    {
      id: 'private',
      title: 'Clase privada de surf',
      description: 'La mejor manera de tener clases 100% personalizadas para maximizar tu experiencia de surf.',
      duration: classData.duration || 120,
      price: Math.round(basePrice * 2.2),
      type: 'PRIVATE',
      maxParticipants: 1,
      language: 'Español, Inglés',
      meetingPoint: classData.location || 'Por confirmar',
      features: [
        'Instructor dedicado 1:1',
        'Tabla de surf premium',
        'Wetsuit premium',
        'Video análisis incluido',
        'Horario flexible',
        'Pickup opcional disponible'
      ],
      freeCancellation: true
    }
  ];
}

export default ClassOptionsCard;
