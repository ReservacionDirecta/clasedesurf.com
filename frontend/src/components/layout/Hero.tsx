import { Button } from '@/components/ui/Button'
import { StarIcon, LightningIcon } from '@/components/ui/Icons'

interface HeroProps {
  children?: React.ReactNode
}

export function Hero({ children }: HeroProps) {
  // Función para hacer scroll a la sección de búsqueda
  const scrollToSearch = () => {
    const searchSection = document.getElementById('encuentra-tu-clase')
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth' })
    }
  }
  return (
    <section className="relative min-h-[600px] sm:min-h-[700px] py-12 sm:py-20 flex items-center justify-center overflow-hidden">

      {/* Background Image - Hero local personalizada */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("/hero.png")`
        }}
      />
      
      {/* Simple Light Overlay */}
      <div className="absolute inset-0 bg-[#011627]/60" />
      
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
            <div className="text-center text-white">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 sm:mb-6 leading-tight text-white drop-shadow-2xl">
                <span className="block">Surfea hoy.</span>
                <span className="block text-[#2EC4B6]">Vive la experiencia.</span>
              </h1>
              
              <p className="text-base xs:text-lg sm:text-xl lg:text-2xl mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed font-medium text-gray-100 drop-shadow-lg px-2 sm:px-0">
                La plataforma líder para reservar clases de surf en Lima.
              </p>
              
              {/* Search Bar Container */}
              <div className="w-full max-w-5xl mx-auto mb-10 sm:mb-16">
                 {children}
              </div>

              {!children && (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center mb-6 sm:mb-8 lg:mb-12 px-4 sm:px-0">
                  <Button 
                    variant="primary"
                    onClick={scrollToSearch}
                    className="touch-target-lg text-sm sm:text-base lg:text-xl rounded-xl lg:rounded-2xl transition-all duration-300 transform hover:-translate-y-1 lg:hover:-translate-y-2 w-full sm:w-auto"
                  >
                    EXPLORAR CLASES
                  </Button>
                </div>
              )}

              {/* Mobile-Optimized Trust Indicators */}
              <div className="max-w-sm sm:max-w-md mx-auto px-4 sm:px-0">
                <div className="flex items-center justify-center gap-6 text-sm sm:text-base font-medium text-gray-200">
                   <div className="flex items-center gap-2">
                      <StarIcon className="w-5 h-5 text-yellow-400" />
                      <span>4.9/5 Rating</span>
                   </div>
                   <div className="flex items-center gap-2">
                       <LightningIcon className="w-5 h-5 text-[#2EC4B6]" />
                       <span>Reserva instantánea</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Bottom Stats */}
        <div className="relative z-10 pb-4 sm:pb-8">
          <div className="max-w-7xl mx-auto px-3 sm:px-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-center text-white/90">
              <div className="p-2 sm:p-0">
                <div className="text-lg sm:text-2xl lg:text-3xl font-bold">50+</div>
                <div className="text-xs sm:text-sm font-medium">Academias</div>
              </div>
              <div className="p-2 sm:p-0">
                <div className="text-lg sm:text-2xl lg:text-3xl font-bold">300+</div>
                <div className="text-xs sm:text-sm font-medium">Instructores</div>
              </div>
              <div className="p-2 sm:p-0">
                <div className="text-lg sm:text-2xl lg:text-3xl font-bold">5K+</div>
                <div className="text-xs sm:text-sm font-medium">Estudiantes</div>
              </div>
              <div className="p-2 sm:p-0">
                 <div className="text-lg sm:text-2xl lg:text-3xl font-bold">100%</div>
                 <div className="text-xs sm:text-sm font-medium">Diversión</div>
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