'use client'

import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export function CallToAction() {
  const router = useRouter()

  const handleSearch = () => {
    // Scroll to top/search or redirect
    const searchSection = document.getElementById('search-hero')
    if (searchSection) {
        searchSection.scrollIntoView({ behavior: 'smooth' })
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <section className="py-20 bg-blue-600 relative overflow-hidden">
        {/* Abstract shapes / patterns */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-400 rounded-full blur-3xl opacity-50" />

        <div className="container mx-auto px-4 relative z-10 text-center">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight">
                ¿Listo para tu primera ola?
            </h2>
            <p className="text-blue-100 text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-medium">
                No necesitas esperar al verano. Encuentra clases disponibles hoy mismo y empieza tu aventura en el mar.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                    onClick={handleSearch}
                    className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 h-auto text-lg rounded-xl font-bold shadow-xl shadow-blue-900/20 w-full sm:w-auto"
                >
                    Buscar Clases
                </Button>
                <Button 
                    variant="outline"
                    className="border-2 border-blue-400 text-white hover:bg-blue-700 hover:border-blue-700 px-8 py-4 h-auto text-lg rounded-xl font-bold hidden w-full sm:w-auto"
                >
                    Soy Instructor
                </Button>
            </div>
            
            <p className="mt-8 text-sm text-blue-200 opacity-80">
                Cancelación gratuita hasta 24h antes • Pago seguro garantizado
            </p>
        </div>
    </section>
  )
}
