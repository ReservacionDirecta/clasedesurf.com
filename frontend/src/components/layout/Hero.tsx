import { Button } from '@/components/ui/Button'
import { getHeroImage } from '@/lib/lima-beach-images'
import { QuickBookingEngine } from '@/components/booking/QuickBookingEngine'

export function Hero() {
  return (
    <section className="relative h-[calc(100vh-80px)] min-h-[500px] max-h-[800px] flex items-center justify-center overflow-hidden">
      {/* Background Image - Clase grupal de surf en Lima al atardecer */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("${getHeroImage()}")`
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Main Content Area - Mobile: Center, Desktop: Two Columns */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-7xl mx-auto">
            
            {/* Mobile Layout (Centered) */}
            <div className="lg:hidden text-center text-white">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
                El Marketplace de
                <span className="block text-blue-400">Surf en Perú</span>
              </h1>
              
              <p className="text-base sm:text-lg mb-6 text-gray-200 max-w-2xl mx-auto leading-relaxed">
                Conecta con las mejores escuelas de surf, compara precios, lee reseñas y sigue tu progreso. 
                La plataforma más completa para surfistas en Perú.
              </p>
              
              {/* Quick Booking Engine - Mobile */}
              <div className="mb-6">
                <QuickBookingEngine className="max-w-md mx-auto" />
              </div>
              
              {/* Alternative Action - Mobile */}
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-black border-black text-white hover:bg-white hover:text-black hover:border-white px-4 py-2 text-sm transition-all duration-200"
                >
                  Ver Todas las Clases
                </Button>
              </div>
            </div>

            {/* Desktop Layout (Two Columns) */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center lg:h-full">
              
              {/* Left Column - Text Content */}
              <div className="text-white">
                <h1 className="text-5xl xl:text-7xl font-bold mb-6 leading-tight">
                  El Marketplace de
                  <span className="block text-blue-400">Surf en Perú</span>
                </h1>
                
                <p className="text-xl xl:text-2xl mb-8 text-gray-200 leading-relaxed">
                  Conecta con las mejores escuelas de surf, compara precios, lee reseñas y sigue tu progreso. 
                  La plataforma más completa para surfistas en Perú.
                </p>
                
                {/* CTA Buttons - Desktop */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    variant="primary" 
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                  >
                    Explorar Clases
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="bg-black border-black text-white hover:bg-white hover:text-black hover:border-white px-8 py-4 text-lg transition-all duration-200"
                  >
                    Ver Todas las Clases
                  </Button>
                </div>

                {/* Trust Indicators - Desktop */}
                <div className="mt-8 bg-blue-600 bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-white text-sm">
                    🚀 <strong>¿Tienes una escuela de surf?</strong> 
                    <a href="#" className="underline hover:text-blue-300 ml-1">Únete gratis a nuestra plataforma</a>
                  </p>
                </div>
              </div>

              {/* Right Column - Booking Engine */}
              <div className="flex justify-center lg:justify-end">
                <QuickBookingEngine className="w-full max-w-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Indicators - Stats */}
        <div className="relative z-10 pb-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-4 gap-4 text-center text-white">
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-blue-400">25+</div>
                <div className="text-gray-300 text-xs lg:text-sm">Escuelas Verificadas</div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-blue-400">150+</div>
                <div className="text-gray-300 text-xs lg:text-sm">Instructores Certificados</div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-blue-400">2.5K+</div>
                <div className="text-gray-300 text-xs lg:text-sm">Estudiantes Activos</div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-blue-400">4.8⭐</div>
                <div className="text-gray-300 text-xs lg:text-sm">Rating Promedio</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}