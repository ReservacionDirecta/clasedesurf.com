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

      <div className="relative z-10">
        {/* Mobile-Optimized Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-flex items-center justify-center mb-2 sm:mb-3">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg flex items-center">
              <StarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Plataforma Confiable
            </div>
          </div>

          <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 mb-2 sm:mb-3 leading-tight px-2 sm:px-0">
            Conectando Estudiantes con <span className="text-teal-700">Expertos</span>
          </h2>

          <div className="max-w-3xl mx-auto px-4 sm:px-0">
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-white font-medium leading-relaxed">
              La plataforma que conecta estudiantes con instructores expertos en todo Perú
            </p>
          </div>
        </div>

        {/* Mobile-Optimized Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center hover:bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-white/50"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

              <div className="relative z-10">
                {/* Value with Gradient */}
                <div className={`text-2xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r ${stat.color} group-hover:scale-105 transition-transform duration-300`}>
                  {stat.value}
                </div>

                {/* Label */}
                <div className="text-xs font-bold text-gray-800 mb-1 group-hover:text-gray-900 transition-colors">
                  {stat.label}
                </div>

                {/* Description */}
                <div className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">
                  {stat.description}
                </div>
              </div>

              {/* Subtle Border Glow */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300 -z-10`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile-Optimized Call to Action for Schools */}
      <div className="relative">
        <div className="bg-[#F6F7F8] rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/40">
          {/* Mobile-First Layout */}
          <div className="text-center mb-4">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4 bg-gradient-to-br from-[#2EC4B6] to-[#FF3366]">
              <EquipmentIcon className="w-8 h-8 text-white drop-shadow" />
            </div>
            
            {/* Content */}
            <h3 className="text-xl sm:text-2xl font-black text-[#011627] mb-2 leading-tight">
              ¿Eres instructor o tienes una academia?
            </h3>
            <p className="text-sm sm:text-base text-[#46515F] mb-6 leading-relaxed max-w-md mx-auto">
              Únete a clasesde.pe y conecta con estudiantes de todo el país con una experiencia de onboarding guiada
            </p>
            
            {/* Buttons - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-gradient-to-r from-[#FF3366] to-[#D12352] text-white px-8 py-4 rounded-xl font-bold text-base hover:from-[#D12352] hover:to-[#FF3366] transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <LightningIcon className="w-5 h-5 mr-2" />
                Registrarse ahora
              </Link>
              <button
                type="button"
                onClick={handleOpenInfoModal}
                className="w-full sm:w-auto border-2 border-[#2EC4B6] text-[#011627] px-8 py-4 rounded-xl font-bold text-base hover:bg-[#E9FBF7] hover:border-[#1BAA9C] transition-all duration-300 flex items-center justify-center hover:shadow-lg transform hover:-translate-y-1"
              >
                <EquipmentIcon className="w-5 h-5 mr-2" />
                Más Info
              </button>
            </div>
          </div>

          {/* Trust Indicators - Mobile Optimized */}
          <div className="pt-5 border-t border-[#E2E8F0]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
              <div className="flex items-center justify-center bg-white/70 rounded-xl px-4 py-3 shadow-sm">
                <CheckIcon className="w-4 h-4 text-[#2EC4B6] mr-2 flex-shrink-0" />
                <span className="text-sm font-semibold text-[#011627]">Sin comisiones</span>
              </div>
              <div className="flex items-center justify-center bg-white/70 rounded-xl px-4 py-3 shadow-sm">
                <CheckIcon className="w-4 h-4 text-[#2EC4B6] mr-2 flex-shrink-0" />
                <span className="text-sm font-semibold text-[#011627]">Setup gratuito</span>
              </div>
              <div className="flex items-center justify-center bg-white/70 rounded-xl px-4 py-3 shadow-sm">
                <CheckIcon className="w-4 h-4 text-[#2EC4B6] mr-2 flex-shrink-0" />
                <span className="text-sm font-semibold text-[#011627]">Soporte 24/7</span>
              </div>
            </div>
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