import { Button } from '@/components/ui/Button'
import { StarIcon, LightningIcon, CheckIcon } from '@/components/ui/Icons'

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
    <section className="relative min-h-[500px] sm:min-h-[600px] flex items-center justify-center overflow-hidden">

      {/* Background Image with Parallax-like fix */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
        style={{
          backgroundImage: `url("/hero.png")`
        }}
      />
      
      {/* Enhanced Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70 backdrop-blur-[1px]" />
      
      {/* Content Container */}
      <div className="relative z-50 w-full h-full flex flex-col justify-center py-16 sm:py-24">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
            
          <div className="text-center text-white max-w-5xl mx-auto">
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                <span className="text-sm font-semibold tracking-wider text-yellow-300 uppercase">
                    🌊 La plataforma líder en Perú
                </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-8 leading-tight tracking-tight drop-shadow-2xl">
              <span className="block">Domina las olas.</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                Vive la libertad.
              </span>
            </h1>
            
            <p className="text-lg sm:text-2xl mb-12 font-medium text-gray-200/90 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
              Conecta con los mejores instructores certificados y reserva tu próxima clase de surf en segundos.
            </p>
            
            {/* Search Bar Container */}
            <div className="w-full max-w-4xl mx-auto mb-12 transform hover:scale-[1.01] transition-transform duration-300">
               {children}
            </div>

            {!children && (
              <div className="flex justify-center">
                <Button 
                  variant="primary"
                  onClick={scrollToSearch}
                  className="rounded-full px-10 py-5 text-xl font-bold shadow-xl shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all transform hover:-translate-y-1"
                >
                  Explorar Clases
                </Button>
              </div>
            )}

            {/* Trust Indicators - Refined */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-8 text-sm sm:text-base font-semibold text-white/90">
               <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                  <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                  <span>4.9/5 Calificación</span>
               </div>
               <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                   <LightningIcon className="w-5 h-5 text-[#2EC4B6] fill-current" />
                   <span>Reserva instantánea</span>
               </div>
               <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                   <CheckIcon className="w-5 h-5 text-green-400" />
                   <span>Cancelación flexible</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}