import { Button } from '@/components/ui/Button'
import { StarIcon, LightningIcon } from '@/components/ui/Icons'

export function Hero() {
  // Función para hacer scroll a la sección de búsqueda
  const scrollToSearch = () => {
    const searchSection = document.getElementById('encuentra-tu-clase')
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth' })
    }
  }
  return (
    <section className="relative min-h-screen sm:min-h-screen py-12 sm:py-20 flex items-center justify-center overflow-hidden">
      {/* Background Image - Hero local personalizada */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("/hero.png")`
        }}
      />
      
      {/* Simple Light Overlay */}
      <div className="absolute inset-0 bg-white/20" />
      
      {/* Animated Wave Pattern Overlay */}
      <div className="absolute inset-0 opacity-20">
        <svg className="absolute bottom-0 left-0 w-full h-32" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z" fill="url(#waveGradient)" />
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#f0f9ff" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Main Content Area - Optimized for Mobile */}
        <div className="flex-1 flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8">
          <div className="w-full max-w-7xl mx-auto">
            
            {/* Mobile-Optimized Layout */}
            <div className="text-center">
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-black mb-4 sm:mb-6 lg:mb-8 leading-tight text-white drop-shadow-2xl">
                <span className="block">El Marketplace de</span>
                <span className="block">Surf N°1</span>
              </h1>
              
              <p className="text-sm xs:text-base sm:text-lg lg:text-xl xl:text-2xl mb-6 sm:mb-8 lg:mb-10 max-w-3xl mx-auto leading-relaxed font-medium text-white drop-shadow-lg px-2 sm:px-0">
                <span>Encuentra tus clases.</span>
                <span className="font-bold ml-1 sm:ml-2">Impulsa tu pasión.</span>
              </p>
              
              {/* Mobile-Optimized CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center mb-6 sm:mb-8 lg:mb-12 px-4 sm:px-0">
                <Button 
                  variant="primary"
                  onClick={scrollToSearch}
                  className="touch-target-lg bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-4 sm:px-8 sm:py-3 lg:px-10 lg:py-5 text-sm sm:text-base lg:text-xl rounded-xl lg:rounded-2xl transition-all duration-300 transform hover:-translate-y-1 lg:hover:-translate-y-2 hover:shadow-xl w-full sm:w-auto"
                >
                  EXPLORA SURF AHORA
                </Button>
                <Button 
                  variant="outline"
                  className="touch-target-lg bg-white/10 border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold px-6 py-4 sm:px-8 sm:py-3 lg:px-10 lg:py-5 text-sm sm:text-base lg:text-xl rounded-xl lg:rounded-2xl transition-all duration-300 transform hover:-translate-y-1 lg:hover:-translate-y-2 hover:shadow-xl w-full sm:w-auto"
                >
                  PARA ESCUELAS
                </Button>
              </div>

              {/* Mobile-Optimized Trust Indicators */}
              <div className="max-w-sm sm:max-w-md mx-auto px-4 sm:px-0">
                <div className="bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-xl border border-white/30">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                      <LightningIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <p className="text-xs sm:text-sm lg:text-lg font-bold text-white leading-tight">
                        ¿Tienes una escuela de surf?
                      </p>
                      <p className="text-xs sm:text-xs lg:text-sm text-white leading-tight">
                        <a href="#" className="underline hover:text-blue-200 transition-colors font-medium">
                          Únete gratis a nuestra plataforma
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Bottom Stats */}
        <div className="relative z-10 pb-4 sm:pb-8">
          <div className="max-w-7xl mx-auto px-3 sm:px-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-center text-white">
              <div className="p-2 sm:p-0">
                <div className="text-lg sm:text-2xl lg:text-3xl font-bold">25+</div>
                <div className="text-xs sm:text-xs lg:text-sm opacity-90 leading-tight">Escuelas Verificadas</div>
              </div>
              <div className="p-2 sm:p-0">
                <div className="text-lg sm:text-2xl lg:text-3xl font-bold">150+</div>
                <div className="text-xs sm:text-xs lg:text-sm opacity-90 leading-tight">Instructores Certificados</div>
              </div>
              <div className="p-2 sm:p-0">
                <div className="text-lg sm:text-2xl lg:text-3xl font-bold">2.5K+</div>
                <div className="text-xs sm:text-xs lg:text-sm opacity-90 leading-tight">Estudiantes Activos</div>
              </div>
              <div className="p-2 sm:p-0">
                <div className="flex items-center justify-center text-lg sm:text-2xl lg:text-3xl font-bold">
                  4.8
                  <StarIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ml-1" />
                </div>
                <div className="text-xs sm:text-xs lg:text-sm opacity-90 leading-tight">Rating Promedio</div>
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