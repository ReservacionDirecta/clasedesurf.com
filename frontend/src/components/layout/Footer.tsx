import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#011627] via-[#072F46] to-[#0F4C5C] text-white relative overflow-hidden">
      {/* Decorative waves */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="absolute bottom-0 w-full h-32" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z" fill="url(#footerWaveGradient)" />
          <defs>
            <linearGradient id="footerWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2EC4B6" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FF3366" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo and Description */}
          <div className="col-span-1 sm:col-span-2">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center overflow-hidden bg-white/10 rounded-xl backdrop-blur-sm p-2">
                <Image 
                  src="/logoclasedesusrf.png" 
                  alt="clasesde.pe" 
                  width={48} 
                  height={48} 
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
            </div>
            <p className="text-gray-300 mb-6 sm:mb-8 max-w-md text-sm sm:text-base leading-relaxed">
              La plataforma líder de clases de surf en Lima, Perú. 
              Conectamos surfistas con las mejores escuelas e instructores. Expandiéndose a nuevos destinos.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a href="#" className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 hover:bg-[#2EC4B6] rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm" aria-label="Twitter">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 hover:bg-[#2EC4B6] rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm" aria-label="Facebook">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 hover:bg-[#FF3366] rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm" aria-label="Pinterest">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.222.083.343-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 hover:bg-[#FF3366] rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm" aria-label="Instagram">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-white">Enlaces Rápidos</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/classes" className="text-gray-300 hover:text-[#2EC4B6] transition-colors duration-200 text-sm sm:text-base flex items-center group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-[#2EC4B6] transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  Todas las Clases
                </Link>
              </li>
              <li>
                <Link href="/instructors" className="text-gray-300 hover:text-[#2EC4B6] transition-colors duration-200 text-sm sm:text-base flex items-center group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-[#2EC4B6] transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  Nuestros Instructores
                </Link>
              </li>
              <li>
                <Link href="/locations" className="text-gray-300 hover:text-[#2EC4B6] transition-colors duration-200 text-sm sm:text-base flex items-center group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-[#2EC4B6] transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  Ubicaciones
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-300 hover:text-[#2EC4B6] transition-colors duration-200 text-sm sm:text-base flex items-center group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-[#2EC4B6] transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  Precios
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-[#2EC4B6] transition-colors duration-200 text-sm sm:text-base flex items-center group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-[#2EC4B6] transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/new-destinations" className="text-gray-300 hover:text-[#2EC4B6] transition-colors duration-200 text-sm sm:text-base flex items-center group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-[#2EC4B6] transition-all duration-200 mr-0 group-hover:mr-2"></span>
                  Nuevos Destinos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-white">Contacto</h3>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start space-x-3 text-gray-300 text-sm sm:text-base group hover:text-[#2EC4B6] transition-colors duration-200">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5 text-[#2EC4B6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Lima, Perú</span>
              </li>
              <li className="flex items-start space-x-3 text-gray-300 text-sm sm:text-base group hover:text-[#2EC4B6] transition-colors duration-200">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5 text-[#2EC4B6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+51 1 234 5678</span>
              </li>
              <li className="flex items-start space-x-3 text-gray-300 text-sm sm:text-base group hover:text-[#2EC4B6] transition-colors duration-200">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5 text-[#2EC4B6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@clasedesurf.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-10 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
            © 2024 Clase de Surf. Todos los derechos reservados.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link href="/privacy" className="text-gray-400 hover:text-[#2EC4B6] text-xs sm:text-sm transition-colors duration-200">
              Política de Privacidad
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-[#2EC4B6] text-xs sm:text-sm transition-colors duration-200">
              Términos de Uso
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-[#2EC4B6] text-xs sm:text-sm transition-colors duration-200">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
