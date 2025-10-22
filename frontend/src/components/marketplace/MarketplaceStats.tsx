import { 
  TrophyIcon, 
  StarIcon, 
  CheckIcon, 
  LightningIcon,
  LocationIcon,
  EquipmentIcon,
  MoneyIcon,
  ShieldIcon
} from '@/components/ui/Icons'

export function MarketplaceStats() {
  const stats = [
    {
      icon: <EquipmentIcon className="w-8 h-8" />,
      label: 'Escuelas Activas',
      value: '25+',
      description: 'Escuelas verificadas',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <CheckIcon className="w-8 h-8" />,
      label: 'Clases Completadas',
      value: '12,500+',
      description: 'Este año',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <StarIcon className="w-8 h-8" />,
      label: 'Satisfacción',
      value: '5/5',
      description: '100% Satisfacción',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: <LocationIcon className="w-8 h-8" />,
      label: 'Playas',
      value: '15+',
      description: 'Ubicaciones en Lima',
      color: 'from-cyan-500 to-teal-500'
    },
    {
      icon: <TrophyIcon className="w-8 h-8" />,
      label: 'Progreso Tracking',
      value: '100%',
      description: 'De los estudiantes',
      color: 'from-rose-500 to-pink-500'
    }
  ]

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg mx-2 sm:mx-0">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full blur-xl"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-cyan-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-32 w-24 h-24 bg-teal-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-18 h-18 bg-blue-400 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10">
        {/* Mobile-Optimized Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center mb-3 sm:mb-4">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg flex items-center">
              <StarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Plataforma Confiable
            </div>
          </div>

          <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 mb-3 sm:mb-4 leading-tight px-2 sm:px-0">
            Conectando Pasión con <span className="text-teal-700">Experiencia</span>
          </h2>

          <div className="max-w-3xl mx-auto px-4 sm:px-0">
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-700 font-medium leading-relaxed">
              La plataforma que une a surfistas con instructores expertos en toda Lima
            </p>
          </div>
        </div>

        {/* Mobile-Optimized Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center hover:bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-white/50"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

              <div className="relative z-10">
                {/* Icon with Animation */}
                <div className={`mb-3 transform group-hover:scale-110 transition-transform duration-300 text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
                  {stat.icon}
                </div>

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
        <div className="bg-gradient-to-r from-white via-teal-50 to-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md border border-teal-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            {/* Left Content */}
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start mb-3 gap-3 sm:gap-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md sm:mr-3 flex-shrink-0">
                  <EquipmentIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">¿Eres instructor o tienes una escuela?</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">Únete a nuestra plataforma y conecta con más estudiantes</p>
                </div>
              </div>
            </div>

            {/* Right Buttons */}
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button className="touch-target-lg bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 sm:px-6 py-3 rounded-lg font-bold text-sm hover:from-teal-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center">
                <LightningIcon className="w-4 h-4 mr-2" />
                Registrarse
              </button>
              <button className="touch-target-lg border-2 border-teal-200 text-teal-700 px-4 sm:px-6 py-3 rounded-lg font-bold text-sm hover:bg-teal-50 hover:border-teal-300 transition-all duration-200 flex items-center justify-center">
                <EquipmentIcon className="w-4 h-4 mr-2" />
                Más Info
              </button>
            </div>
          </div>

          {/* Mobile-Optimized Trust Indicators */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-teal-100 flex flex-wrap justify-center sm:justify-start items-center gap-3 sm:gap-4 text-xs text-gray-500">
            <div className="flex items-center">
              <CheckIcon className="w-3 h-3 text-green-500 mr-1" />
              Sin comisiones
            </div>
            <div className="flex items-center">
              <CheckIcon className="w-3 h-3 text-green-500 mr-1" />
              Setup gratuito
            </div>
            <div className="flex items-center">
              <CheckIcon className="w-3 h-3 text-green-500 mr-1" />
              Soporte 24/7
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}