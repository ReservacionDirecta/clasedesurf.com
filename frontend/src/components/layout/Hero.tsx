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
    <section className="relative min-h-[450px] sm:min-h-[550px] flex items-center justify-center">

      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("/hero.png")`
        }}
      />
      
      {/* Dark Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      
      {/* Content Container */}
      <div className="relative z-50 w-full h-full flex flex-col justify-center py-12 sm:py-20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
            
          <div className="text-center text-white max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 leading-tight drop-shadow-xl tracking-tight">
              <span className="block">Surfea hoy.</span>
              <span className="block text-[#ebd936]">Vive la experiencia.</span>
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl mb-10 font-medium text-white/90 drop-shadow-md max-w-2xl mx-auto">
              Reserva las mejores clases de surf en Lima con instructores certificados.
            </p>
            
            {/* Search Bar Container */}
            <div className="w-full max-w-4xl mx-auto mb-12 shadow-2xl rounded-full">
               {children}
            </div>

            {!children && (
              <div className="flex justify-center">
                <Button 
                  variant="primary"
                  onClick={scrollToSearch}
                  className="rounded-full px-8 py-4 text-lg"
                >
                  Explorar Clases
                </Button>
              </div>
            )}

            {/* Trust Indicators - Minimal */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-sm sm:text-base font-semibold text-white/90 drop-shadow-md">
               <div className="flex items-center gap-2">
                  <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                  <span>4.9/5 Calificación</span>
               </div>
               <div className="flex items-center gap-2">
                   <LightningIcon className="w-5 h-5 text-[#2EC4B6] fill-current" />
                   <span>Reserva instantánea</span>
               </div>
               <div className="flex items-center gap-2">
                   <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                   <span>Cancelación gratuita</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}