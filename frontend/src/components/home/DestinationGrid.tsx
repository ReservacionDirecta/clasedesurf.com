'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { StarIcon } from '@/components/ui/Icons';

interface SurfConditions {
  waveHeight: string;
  wavePeriod: string;
  windSpeed: string;
  windDirection: string;
  tide: 'low' | 'mid' | 'high';
  tideTime: string;
  waterTemp: string;
  rating: number; // 1-5
  lastUpdated: string;
}

interface DestinationData {
  name: string;
  image: string;
  count: string;
  slug: string;
  description: string;
  waveType: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Todos los niveles';
  entryTips: string[];
  bestTime: string;
  hazards: string[];
  conditions: SurfConditions;
}

const DESTINATIONS: DestinationData[] = [
  {
    name: 'Costa Verde',
    slug: 'costa-verde',
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    count: '25+ escuelas',
    description: 'La playa más accesible de Lima para surfear. Se extiende desde Miraflores hasta Barranco con múltiples picos que funcionan casi todo el año. Perfecta para aprender y practicar.',
    waveType: 'Beach break con olas izquierdas y derechas que rompen sobre fondo de arena y piedras. Olas suaves ideales para principiantes en la orilla, con secciones más potentes para intermedios.',
    level: 'Todos los niveles',
    entryTips: [
      'Ingresa por las escaleras de la bajada Balta o bajada Armendáriz',
      'Camina por la orilla hasta encontrar un canal sin olas para remar',
      'Evita las zonas con rocas visibles',
      'Hay duchas y vestidores disponibles en varios puntos'
    ],
    bestTime: 'Marzo a Diciembre, mejor con marea media subiendo',
    hazards: ['Corrientes laterales', 'Rocas en algunos sectores', 'Contaminación después de lluvias'],
    conditions: {
      waveHeight: '0.8 - 1.2m',
      wavePeriod: '14s',
      windSpeed: '12 km/h',
      windDirection: 'SSW',
      tide: 'mid',
      tideTime: 'Subiendo',
      waterTemp: '18°C',
      rating: 3,
      lastUpdated: 'Hace 15 min'
    }
  },
  {
    name: 'Makaha',
    slug: 'makaha',
    image: 'https://images.unsplash.com/photo-1455729552865-3658a5d39692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    count: 'Top spots',
    description: 'Icónica playa en el corazón de Miraflores. Makaha es conocida por sus olas consistentes y su ambiente surfero. Aquí nacieron muchos de los mejores surfistas peruanos.',
    waveType: 'Point break izquierdo que rompe sobre fondo rocoso. La ola corre paralela al malecón ofreciendo paredes largas y maniobrables. Puede llegar a ser hueca con swell grande.',
    level: 'Intermedio',
    entryTips: [
      'Baja por las escaleras junto al club Waikiki',
      'Salta desde las rocas solo si conoces bien el spot',
      'Rema hacia la izquierda siguiendo la corriente del canal',
      'Respeta la localía y espera tu turno'
    ],
    bestTime: 'Abril a Octubre, funciona mejor con marea baja',
    hazards: ['Rocas en la entrada', 'Localismo fuerte', 'Erizos de mar'],
    conditions: {
      waveHeight: '1.0 - 1.5m',
      wavePeriod: '16s',
      windSpeed: '8 km/h',
      windDirection: 'S',
      tide: 'low',
      tideTime: 'Bajando',
      waterTemp: '17°C',
      rating: 4,
      lastUpdated: 'Hace 10 min'
    }
  },
  {
    name: 'Punta Hermosa',
    slug: 'punta-hermosa',
    image: 'https://images.unsplash.com/photo-1520699697851-3dc68aa3a474?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    count: 'Pro surfing',
    description: 'El destino de surf más completo al sur de Lima. Con más de 10 picos diferentes, Punta Hermosa ofrece olas para todos los niveles, desde la suave Playa Norte hasta el poderoso Pico Alto.',
    waveType: 'Variedad de point breaks y beach breaks. Caballeros ofrece paredes largas, mientras Pico Alto puede alcanzar los 8 metros en invierno. Playa Norte es ideal para principiantes.',
    level: 'Todos los niveles',
    entryTips: [
      'Playa Norte: entrada fácil por la arena',
      'Caballeros: ingresa por el canal al sur de las rocas',
      'Pico Alto: solo para expertos, requiere jet ski',
      'Hay estacionamiento y restaurantes cerca'
    ],
    bestTime: 'Todo el año, mejor de Mayo a Septiembre',
    hazards: ['Corrientes fuertes en días grandes', 'Rocas en varios picos', 'Sol intenso'],
    conditions: {
      waveHeight: '1.5 - 2.5m',
      wavePeriod: '18s',
      windSpeed: '15 km/h',
      windDirection: 'SW',
      tide: 'high',
      tideTime: 'Alta',
      waterTemp: '16°C',
      rating: 5,
      lastUpdated: 'Hace 5 min'
    }
  },
  {
    name: 'San Bartolo',
    slug: 'san-bartolo',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    count: 'Para todos',
    description: 'Balneario familiar con excelentes olas para aprender. Su playa principal ofrece olas suaves y agua más cálida que Lima. Ambiente relajado y escuelas para todos los niveles.',
    waveType: 'Beach break suave con olas que rompen despacio sobre fondo de arena. Ideal para dar las primeras remadas. Con swell sur pueden formarse buenas paredes.',
    level: 'Principiante',
    entryTips: [
      'Entrada directa por la playa principal',
      'El agua es poco profunda, cuidado al tirarse',
      'Mejor surfear frente al malecón donde hay más espacio',
      'Muchos alquileres de tablas disponibles'
    ],
    bestTime: 'Todo el año, mejor de Noviembre a Marzo',
    hazards: ['Agua poco profunda', 'Mucho crowd en verano', 'Medusas ocasionales'],
    conditions: {
      waveHeight: '0.5 - 1.0m',
      wavePeriod: '12s',
      windSpeed: '10 km/h',
      windDirection: 'SSW',
      tide: 'mid',
      tideTime: 'Subiendo',
      waterTemp: '20°C',
      rating: 3,
      lastUpdated: 'Hace 20 min'
    }
  }
];

function TideIndicator({ tide }: { tide: 'low' | 'mid' | 'high' }) {
  const levels = { low: 1, mid: 2, high: 3 };
  const labels = { low: 'Baja', mid: 'Media', high: 'Alta' };
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3].map(level => (
          <div 
            key={level} 
            className={`w-2 rounded-sm ${level <= levels[tide] ? 'bg-blue-500' : 'bg-gray-200'}`}
            style={{ height: `${level * 6 + 4}px` }}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-gray-700">{labels[tide]}</span>
    </div>
  );
}

function ConditionRating({ rating }: { rating: number }) {
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
  const labels = ['Mala', 'Regular', 'Buena', 'Muy buena', 'Excelente'];
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`w-3 h-3 rounded-full ${i <= rating ? colors[rating - 1] : 'bg-gray-200'}`} />
        ))}
      </div>
      <span className={`text-sm font-bold ${rating >= 4 ? 'text-green-600' : rating >= 3 ? 'text-yellow-600' : 'text-orange-600'}`}>
        {labels[rating - 1]}
      </span>
    </div>
  );
}

function BeachModal({ destination, onClose }: { destination: DestinationData; onClose: () => void }) {
  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-48 sm:h-56">
          <img src={destination.image} alt={destination.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-6 text-white">
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              destination.level === 'Principiante' ? 'bg-green-500' :
              destination.level === 'Intermedio' ? 'bg-yellow-500' :
              destination.level === 'Avanzado' ? 'bg-red-500' : 'bg-blue-500'
            }`}>
              {destination.level}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2">{destination.name}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-14rem)]">
          {/* Live Conditions Card */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 mb-6 border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[#011627] flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Condiciones Actuales
              </h3>
              <span className="text-xs text-gray-500">{destination.conditions.lastUpdated}</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Olas</p>
                <p className="font-bold text-lg text-[#011627]">{destination.conditions.waveHeight}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Período</p>
                <p className="font-bold text-lg text-[#011627]">{destination.conditions.wavePeriod}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Viento</p>
                <p className="font-bold text-lg text-[#011627]">{destination.conditions.windSpeed} {destination.conditions.windDirection}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Agua</p>
                <p className="font-bold text-lg text-[#011627]">{destination.conditions.waterTemp}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-blue-200/50">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Marea</p>
                  <TideIndicator tide={destination.conditions.tide} />
                </div>
                <span className="text-sm text-gray-600 bg-white/60 px-2 py-1 rounded-lg">
                  {destination.conditions.tideTime}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Calidad</p>
                <ConditionRating rating={destination.conditions.rating} />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h4 className="font-bold text-[#011627] mb-2">Sobre esta playa</h4>
            <p className="text-gray-600 leading-relaxed">{destination.description}</p>
          </div>

          {/* Wave Type */}
          <div className="mb-6">
            <h4 className="font-bold text-[#011627] mb-2 flex items-center gap-2">
              🌊 Tipo de Ola
            </h4>
            <p className="text-gray-600 leading-relaxed">{destination.waveType}</p>
            <p className="text-sm text-blue-600 mt-2 font-medium">Mejor época: {destination.bestTime}</p>
          </div>

          {/* Entry Tips */}
          <div className="mb-6">
            <h4 className="font-bold text-[#011627] mb-3 flex items-center gap-2">
              🏊 Cómo Ingresar al Mar
            </h4>
            <ul className="space-y-2">
              {destination.entryTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600">
                  <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Hazards */}
          <div className="mb-6">
            <h4 className="font-bold text-[#011627] mb-3 flex items-center gap-2">
              ⚠️ Precauciones
            </h4>
            <div className="flex flex-wrap gap-2">
              {destination.hazards.map((hazard, i) => (
                <span key={i} className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium border border-amber-200">
                  {hazard}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Link 
            href={`/?q=${destination.name}`}
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-center transition-colors"
          >
            Ver clases en {destination.name}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function DestinationGrid() {
  const [selectedDestination, setSelectedDestination] = useState<DestinationData | null>(null);
  const [destinations, setDestinations] = useState<DestinationData[]>(DESTINATIONS);

  // Try to fetch beaches from API
  useEffect(() => {
    async function fetchBeaches() {
      try {
        const res = await fetch('/api/beaches?active=true');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            // Transform API data to match DestinationData format
            const apiDestinations = data.map((beach: any) => ({
              name: beach.name,
              slug: beach.slug,
              image: beach.image || DESTINATIONS.find(d => d.name === beach.name)?.image || '',
              count: beach.count || '',
              description: beach.description || '',
              waveType: beach.waveType || '',
              level: beach.level || 'Todos los niveles',
              bestTime: beach.bestTime || '',
              entryTips: Array.isArray(beach.entryTips) ? beach.entryTips : [],
              hazards: Array.isArray(beach.hazards) ? beach.hazards : [],
              conditions: beach.conditions || {
                waveHeight: '---',
                wavePeriod: '---',
                windSpeed: '---',
                windDirection: '---',
                tide: 'mid',
                tideTime: '---',
                waterTemp: '---',
                rating: 3,
                lastUpdated: 'Sin datos'
              }
            }));
            setDestinations(apiDestinations);
          }
        }
      } catch (error) {
        console.log('Using static destinations data');
      }
    }
    fetchBeaches();
  }, []);

  return (
    <>
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-black text-[#011627] tracking-tight mb-2">
            Explora por destino
          </h2>
          <p className="text-gray-500 mb-6">Toca una playa para ver condiciones y recomendaciones</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {destinations.map((dest) => (
              <button 
                key={dest.name} 
                onClick={() => setSelectedDestination(dest)}
                className="group relative h-40 sm:h-52 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all text-left"
              >
                <ImageWithFallback
                  src={dest.image || 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                  alt={dest.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Live indicator */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[10px] text-white font-medium">
                    {dest.conditions?.waveHeight?.split(' ')[0] || '---'}
                  </span>
                </div>
                
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-bold text-lg sm:text-xl">{dest.name}</h3>
                  <p className="text-xs sm:text-sm font-medium text-gray-200">{dest.count}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedDestination && (
        <BeachModal 
          destination={selectedDestination} 
          onClose={() => setSelectedDestination(null)} 
        />
      )}
    </>
  );
}


