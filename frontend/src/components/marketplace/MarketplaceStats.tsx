import { useState } from 'react'
import Link from 'next/link'
import { 
  StarIcon, 
  CheckIcon, 
  LightningIcon,
  EquipmentIcon
} from '@/components/ui/Icons'

export function MarketplaceStats() {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)

  const handleOpenInfoModal = () => {
    setIsInfoModalOpen(true)
  }

  const handleCloseInfoModal = () => {
    setIsInfoModalOpen(false)
  }

  const stats = [
    {
      label: 'Academias Activas',
      value: '50+',
      description: 'Academias verificadas',
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Clases Completadas',
      value: '25,000+',
      description: 'Este año',
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Satisfacción',
      value: '4.9/5',
      description: '98% Satisfacción',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      label: 'Categorías',
      value: '12+',
      description: 'Tipos de clases',
      color: 'from-cyan-500 to-teal-500'
    },
    {
      label: 'Progreso Tracking',
      value: '100%',
      description: 'De los estudiantes',
      color: 'from-rose-500 to-pink-500'
    }
  ]

  return (
    <>
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-2 sm:mb-4 shadow-lg mx-2 sm:mx-0 -mt-4 sm:-mt-8 bg-gradient-to-br from-[#011627] via-[#032d47] to-[#0f4c5c]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full blur-xl"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-cyan-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-32 w-24 h-24 bg-teal-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-18 h-18 bg-blue-400 rounded-full blur-xl"></div>
      </div>

      {/* Sección para Escuelas - Diseño basado en referencia */}
      <div className="relative mt-6 sm:mt-8">
        <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-white rounded-3xl p-6 sm:p-8 lg:p-12 shadow-2xl border border-white/60">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-[#011627] mb-3 sm:mb-4 leading-tight">
              PARA ESCUELAS: IMPULSA TU NEGOCIO
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-[#46515F] font-medium max-w-3xl mx-auto leading-relaxed">
              Únete a clasesde.pe y transforma tu gestión y promoción de tu escuela
            </p>
          </div>

          {/* Feature Cards - 3 Cards Horizontal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
            {/* Card 1: Perfil Profesional */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden">
              {/* Background Image - Subtle */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-2xl"></div>
              </div>
              <div className="relative z-10">
                {/* Icon - Two figures with gear */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 mb-4 flex items-center justify-center relative">
                  <svg className="w-full h-full text-[#011627]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    {/* Left figure */}
                    <circle cx="8" cy="10" r="3" />
                    <path d="M8 13c-2 0-4 1-4 3v1h8v-1c0-2-2-3-4-3z" />
                    {/* Right figure */}
                    <circle cx="16" cy="10" r="3" />
                    <path d="M16 13c-2 0-4 1-4 3v1h8v-1c0-2-2-3-4-3z" />
                    {/* Gear icon on right figure */}
                    <circle cx="16" cy="10" r="2.5" fill="none" strokeWidth={1.5} />
                    <circle cx="16" cy="10" r="1" fill="currentColor" />
                    <line x1="16" y1="7.5" x2="16" y2="8.5" strokeWidth={1.5} />
                    <line x1="18.5" y1="10" x2="17.5" y2="10" strokeWidth={1.5} />
                    <line x1="16" y1="12.5" x2="16" y2="11.5" strokeWidth={1.5} />
                    <line x1="13.5" y1="10" x2="14.5" y2="10" strokeWidth={1.5} />
                  </svg>
                </div>
                {/* Title */}
                <h3 className="text-lg sm:text-xl font-black text-[#011627] mb-2">
                  PERFIL PROFESIONAL
                </h3>
                {/* Description */}
                <p className="text-sm sm:text-base text-[#46515F] leading-relaxed">
                  Crea tu página con horarios, servicios y fotos
                </p>
              </div>
            </div>

            {/* Card 2: Gestión Sencilla */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-2xl"></div>
              </div>
              <div className="relative z-10">
                {/* Icon - Calendar with checkmark */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 mb-4 flex items-center justify-center">
                  <svg className="w-full h-full text-[#011627]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    {/* Calendar */}
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    {/* Checkmark in a square */}
                    <rect x="7" y="12" width="6" height="6" rx="1" fill="currentColor" opacity="0.2" />
                    <path d="M9 14l1.5 1.5L13 11" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                {/* Title */}
                <h3 className="text-lg sm:text-xl font-black text-[#011627] mb-2">
                  GESTIÓN SENCILLA
                </h3>
                {/* Description */}
                <p className="text-sm sm:text-base text-[#46515F] leading-relaxed">
                  Administra reservas, pagos y comunicados
                </p>
              </div>
            </div>

            {/* Card 3: Mayor Visibilidad */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden">
              {/* Background Image - More visible on this card */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-400 to-red-400 rounded-full blur-2xl"></div>
              </div>
              <div className="relative z-10">
                {/* Icon */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 mb-4 flex items-center justify-center">
                  <svg className="w-full h-full text-[#011627]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                {/* Title */}
                <h3 className="text-lg sm:text-xl font-black text-[#011627] mb-2">
                  MAYOR VISIBILIDAD
                </h3>
                {/* Description */}
                <p className="text-sm sm:text-base text-[#46515F] leading-relaxed">
                  Llega a miles de nuevos estudiantes
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Link
              href="/register"
              className="inline-block bg-gradient-to-r from-orange-500 to-[#FF3366] hover:from-[#FF3366] hover:to-orange-600 text-white font-black text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-5 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              REGISTRA TU ESCUELA
            </Link>
          </div>
        </div>
      </div>
    </div>

    {isInfoModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
        <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
          <div className="max-h-[80vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h4 className="text-2xl font-bold text-[#011627] mb-1">Programa para Escuelas e Instructores</h4>
                <p className="text-sm text-gray-600">Conoce cómo potenciar tu academia dentro de clasesde.pe</p>
              </div>
              <button
                type="button"
                onClick={handleCloseInfoModal}
                className="text-gray-500 hover:text-[#011627] focus:outline-none focus:ring-2 focus:ring-[#FF3366] focus:ring-offset-2 rounded-full"
                aria-label="Cerrar información"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 text-sm sm:text-base text-gray-700 leading-relaxed">
              <section>
                <h5 className="text-lg font-semibold text-[#011627] mb-2">Beneficios clave</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>Visibilidad inmediata frente a miles de estudiantes de todo el país.</li>
                  <li>Gestión centralizada de clases, instructores y equipamiento.</li>
                  <li>Pagos seguros y seguimiento en tiempo real del desempeño de tu academia.</li>
                </ul>
              </section>

              <section>
                <h5 className="text-lg font-semibold text-[#011627] mb-2">Requisitos</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>Certificaciones vigentes para cada instructor registrado.</li>
                  <li>Protocolos de seguridad y equipamiento en buen estado.</li>
                  <li>Información clara sobre niveles, horarios y precios de las clases.</li>
                </ul>
              </section>

              <section>
                <h5 className="text-lg font-semibold text-[#011627] mb-2">Tips para destacar</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>Agrega fotografías profesionales de tus clases y tu escuela.</li>
                  <li>Responde rápidamente a solicitudes y mantén tu calendario actualizado.</li>
                  <li>Solicita reseñas a tus alumnos para mejorar tu reputación.</li>
                </ul>
              </section>

              <section>
                <h5 className="text-lg font-semibold text-[#011627] mb-2">¿Listo para comenzar?</h5>
                <p className="mb-3">Regístrate y un asesor especializado te ayudará a configurar tu escuela en pocos minutos.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/register"
                    className="flex-1 bg-gradient-to-r from-[#FF3366] to-[#D12352] text-white font-bold py-3 px-4 rounded-xl text-center hover:from-[#D12352] hover:to-[#FF3366] transition-all duration-300"
                  >
                    Comenzar registro
                  </Link>
                  <button
                    type="button"
                    onClick={handleCloseInfoModal}
                    className="flex-1 border-2 border-[#2EC4B6] text-[#011627] font-bold py-3 px-4 rounded-xl hover:bg-[#E9FBF7] transition-all duration-300"
                  >
                    Seguir explorando
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}