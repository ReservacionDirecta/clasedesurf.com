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
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-3xl p-8 mb-12 shadow-xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full blur-xl"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-cyan-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-32 w-24 h-24 bg-teal-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-18 h-18 bg-blue-400 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg flex items-center">
              <TrophyIcon className="w-4 h-4 mr-2" />
              Líder del Mercado
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 mb-6 leading-tight">
            El Marketplace de <span className="text-blue-700">Surf</span> N°1
          </h2>

          <div className="max-w-4xl mx-auto">
            <p className="text-xl md:text-2xl text-gray-700 font-medium leading-relaxed mb-4">
              Conectamos estudiantes con las mejores escuelas de surf
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Ofreciendo <span className="font-semibold text-blue-600">transparencia</span>,
              <span className="font-semibold text-cyan-600"> calidad</span> y
              <span className="font-semibold text-teal-600"> seguimiento de progreso</span>
            </p>
          </div>

          {/* Decorative Wave */}
          <div className="flex justify-center mt-8">
            <svg className="w-24 h-6 text-blue-300" viewBox="0 0 100 20" fill="currentColor">
              <path d="M0,10 Q25,0 50,10 T100,10 V20 H0 Z" />
            </svg>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-white/50"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

              <div className="relative z-10">
                {/* Icon with Animation */}
                <div className={`mb-4 transform group-hover:scale-110 transition-transform duration-300 text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
                  {stat.icon}
                </div>

                {/* Value with Gradient */}
                <div className={`text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r ${stat.color} group-hover:scale-105 transition-transform duration-300`}>
                  {stat.value}
                </div>

                {/* Label */}
                <div className="text-sm font-bold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">
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

      {/* Enhanced Call to Action for Schools */}
      <div className="relative">
        <div className="bg-gradient-to-r from-white via-blue-50 to-white rounded-2xl p-8 shadow-lg border border-blue-100">
          <div className="text-center">
            {/* Icon Header */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-6 shadow-lg">
              <EquipmentIcon className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              ¿Tienes una escuela de surf?
            </h3>

            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Únete a nuestro marketplace y llega a <span className="font-semibold text-blue-600">miles de estudiantes potenciales</span>.
              Gestiona tus clases, instructores y pagos en una sola plataforma.
            </p>

            {/* Enhanced Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="group relative bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl flex items-center">
                <span className="relative z-10 flex items-center">
                  <LightningIcon className="w-5 h-5 mr-2" />
                  Registrar Escuela
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              <button className="group border-2 border-blue-200 text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 flex items-center">
                <EquipmentIcon className="w-5 h-5 mr-2" />
                Más Información
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
                Sin comisiones el primer mes
              </div>
              <div className="flex items-center">
                <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
                Configuración gratuita
              </div>
              <div className="flex items-center">
                <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
                Soporte 24/7
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}