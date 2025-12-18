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
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-2 sm:mb-4 shadow-lg mx-2 sm:mx-0 -mt-4 sm:-mt-8 bg-linear-to-br from-[#011627] via-[#032d47] to-[#0f4c5c]">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-cyan-500 rounded-full blur-xl animate-pulse delay-700"></div>
          <div className="absolute bottom-20 left-32 w-24 h-24 bg-teal-500 rounded-full blur-xl animate-pulse delay-300"></div>
          <div className="absolute bottom-10 right-10 w-18 h-18 bg-blue-400 rounded-full blur-xl"></div>
        </div>

        {/* Sección para Escuelas - Diseño Mejorado */}
        <div className="relative mt-6 sm:mt-8">
          <div className="bg-linear-to-r from-blue-50 via-cyan-50 to-white rounded-3xl p-6 sm:p-8 lg:p-12 shadow-2xl border border-white/60 backdrop-blur-sm">
            
            {/* Header Section */}
            <div className="text-center mb-8 sm:mb-12">
              <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-600 text-xs font-bold tracking-widest mb-3 uppercase">Para Socios</span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#011627] mb-3 sm:mb-4 leading-tight tracking-tight">
                IMPULSA TU ESCUELA DE SURF
              </h2>
              <p className="text-sm sm:text-lg lg:text-xl text-[#46515F] font-medium max-w-2xl mx-auto leading-relaxed px-2">
                Únete a la plataforma líder en Perú y transforma la gestión y promoción de tu negocio hoy mismo.
              </p>
            </div>

            {/* Feature Cards - 3 Cards Horizontal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-14">
              
              {/* Card 1: Perfil Profesional */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                   <svg className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                   </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#011627] mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors">
                  Perfil Profesional
                </h3>
                <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                  Crea tu página oficial con galería de fotos, lista de instructores, horarios detallados y precios claros.
                </p>
              </div>

              {/* Card 2: Gestión Sencilla */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#011627] mb-2 sm:mb-3 group-hover:text-purple-600 transition-colors">
                   Gestión Sencilla
                </h3>
                <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                   Administra tus reservas, pagos y disponibilidad desde un panel de control intuitivo y fácil de usar.
                </p>
              </div>

              {/* Card 3: Mayor Visibilidad */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                   <svg className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                   </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#011627] mb-2 sm:mb-3 group-hover:text-orange-600 transition-colors">
                   Mayor Visibilidad
                </h3>
                <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                   Aparece en las búsquedas de miles de estudiantes potenciales y aumenta tus reservas significativamente.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center relative z-10">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-[#FF3366] hover:bg-[#E62E5C] text-white font-bold text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-5 rounded-xl shadow-lg hover:shadow-xl hover:shadow-pink-500/20 transition-all duration-300 transform hover:-translate-y-1 group"
              >
                Registrar mi Escuela
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 font-medium">
                 Registro gratuito • Sin tarjeta de crédito
              </p>
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
                    className="flex-1 bg-linear-to-r from-[#FF3366] to-[#D12352] text-white font-bold py-3 px-4 rounded-xl text-center hover:from-[#D12352] hover:to-[#FF3366] transition-all duration-300"
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