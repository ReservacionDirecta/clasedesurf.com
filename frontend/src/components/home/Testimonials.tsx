'use client'

import { StarIcon } from '@/components/ui/Icons'
import { useState } from 'react'

const testimonials = [
  {
    id: 1,
    name: "Camila R.",
    role: "Principiante",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    content: "¡Increíble experiencia! Nunca había surfeado y en mi primera clase logré pararme. Los instructores tienen muchísima paciencia.",
    rating: 5,
    location: "Lima, Perú"
  },
  {
    id: 2,
    name: "Juan Diego M.",
    role: "Intermedio",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop",
    content: "La mejor plataforma para encontrar clases. Reservé a las 9am y a las 11am ya estaba en el agua. Súper recomendado.",
    rating: 5,
    location: "Máncora, Perú"
  },
  {
    id: 3,
    name: "Sophie L.",
    role: "Turista",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop",
    content: "Great service! The equipment was top notch and the instructor spoke perfect English. Will definitely book again.",
    rating: 5,
    location: "California, USA"
  }
]

export function Testimonials() {
  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-[#011627] mb-4">
            Lo que dicen nuestros alumnos
          </h2>
          <p className="text-gray-600 text-lg">
            Únete a más de 5,000 personas que han aprendido a surfear con nosotros.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <div key={item.id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative">
              {/* Quote Icon Background */}
              <div className="absolute top-6 right-8 text-gray-100 -z-0">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" />
                </svg>
              </div>

              <div className="flex items-center gap-1 mb-6 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                   <StarIcon key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed mb-8 relative z-10 text-lg italic">
                "{item.content}"
              </p>

              <div className="flex items-center gap-4 mt-auto">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div>
                  <h4 className="font-bold text-[#011627] text-sm">{item.name}</h4>
                  <p className="text-xs text-gray-500 font-medium">{item.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
