export function MarketplaceStats() {
  const stats = [
    {
      icon: '🏫',
      label: 'Escuelas Activas',
      value: '25+',
      description: 'Escuelas verificadas'
    },
    {
      icon: '🏄‍♂️',
      label: 'Instructores',
      value: '150+',
      description: 'Certificados y experimentados'
    },
    {
      icon: '📚',
      label: 'Clases Completadas',
      value: '12,500+',
      description: 'Este año'
    },
    {
      icon: '⭐',
      label: 'Satisfacción',
      value: '4.8/5',
      description: 'Rating promedio'
    },
    {
      icon: '🏖️',
      label: 'Playas',
      value: '15+',
      description: 'Ubicaciones en Lima'
    },
    {
      icon: '🎯',
      label: 'Progreso Tracking',
      value: '100%',
      description: 'De los estudiantes'
    }
  ]

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/50 dark:to-cyan-900/50 rounded-2xl p-8 mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          El Marketplace de Surf Más Grande de Perú
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Conectamos estudiantes con las mejores escuelas de surf, 
          ofreciendo transparencia, calidad y seguimiento de progreso.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {stat.label}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {stat.description}
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action for Schools */}
      <div className="mt-8 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            ¿Tienes una escuela de surf?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Únete a nuestro marketplace y llega a miles de estudiantes potenciales
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Registrar Escuela
            </button>
            <button className="border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Más Información
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}