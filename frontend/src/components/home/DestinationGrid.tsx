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
  lat?: number;
  lng?: number;
}

const DESTINATIONS: DestinationData[] = [
  {
    name: 'Costa Verde',
    slug: 'costa-verde',
    lat: -12.119, 
    lng: -77.043,
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
    lat: -12.126, 
    lng: -77.038,
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
    name: 'La Pampilla',
    slug: 'la-pampilla',
    lat: -12.115, 
    lng: -77.045,
    image: 'https://images.unsplash.com/photo-1537519646099-335112f03225?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    count: 'Clásico derecho',
    description: 'Derecha clásica de la Costa Verde. Ola larga y noble que permite maniobrar con comodidad. Es la favorita de los longboarders y tablistas que buscan estilo.',
    waveType: 'Point break de derecha con fondo de piedras. Rompe lejos de la orilla y ofrece un recorrido largo hasta la orilla. Aguanta bastante tamaño.',
    level: 'Intermedio',
    entryTips: [
      'Ingresa por la playa de piedras frente al estacionamiento',
      'Calcula bien los tiempos entre series para entrar',
      'Ten cuidado con las rocas al salir',
      'Respeta a los longboarders locales'
    ],
    bestTime: 'Todo el año, especialmente con crecidas del sur',
    hazards: ['Fondo de rocas', 'Erizos', 'Crowd los fines de semana'],
    conditions: {
      waveHeight: '1.0 - 1.8m',
      wavePeriod: '15s',
      windSpeed: '10 km/h',
      windDirection: 'S',
      tide: 'mid',
      tideTime: 'Estable',
      waterTemp: '17°C',
      rating: 4,
      lastUpdated: 'Hace 30 min'
    }
  },
  {
    name: 'Punta Roquitas',
    slug: 'punta-roquitas',
    lat: -12.112, 
    lng: -77.046,
    image: 'https://images.unsplash.com/photo-1505566089201-72f3e8f5223c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    count: 'Acción constante',
    description: 'Spot versátil y divertido que ofrece tanto izquierdas como derechas. Rompe cerca de la orilla y es conocido por su constancia. Ideal para quienes buscan mejorar maniobras rápidas.',
    waveType: 'Reef break de piedras que ofrece picos variables. La ola es rápida y a veces tubular en la orilla. Funciona con casi cualquier marea.',
    level: 'Intermedio',
    entryTips: [
      'Entrada directa por la orilla de piedras',
      'Usa escarpines si no estás acostumbrado a las piedras',
      'Cuidado con la corriente lateral hacia el espigón',
      'Observa bien dónde rompe el pico antes de entrar'
    ],
    bestTime: 'Todo el año, muy consistente',
    hazards: ['Rocas resbaladizas', 'Corrientes fuertes', 'Espigones cercanos'],
    conditions: {
      waveHeight: '0.8 - 1.5m',
      wavePeriod: '13s',
      windSpeed: '14 km/h',
      windDirection: 'SSW',
      tide: 'high',
      tideTime: 'Bajando',
      waterTemp: '16°C',
      rating: 3,
      lastUpdated: 'Hace 25 min'
    }
  },
  {
    name: 'Playa Redondo',
    slug: 'playa-redondo',
    lat: -12.130, 
    lng: -77.035,
    image: 'https://images.unsplash.com/photo-1415931633537-351070d20b81?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    count: 'Ideal aprendizaje',
    description: 'La continuación natural de Makaha. Ofrece condiciones similares pero suele estar menos concurrida. Sus olas nobles son perfectas para dar el salto de principiante a intermedio.',
    waveType: 'Beach break con secciones de piedras. Olas izquierdas predominantemente, suaves pero con recorrido. Menos fuerza que Pampilla o Roquitas.',
    level: 'Principiante',
    entryTips: [
      'Entrada fácil por la orilla',
      'Busca los canales definidos',
      'Ideal para primeras clases fuera de la espuma',
      'Estacionamiento disponible en el malecón'
    ],
    bestTime: 'Verano y media estación',
    hazards: ['Fondo mixto arena/piedra', 'Principiantes con tablas grandes'],
    conditions: {
      waveHeight: '0.5 - 1.0m',
      wavePeriod: '12s',
      windSpeed: '8 km/h',
      windDirection: 'SW',
      tide: 'mid',
      tideTime: 'Subiendo',
      waterTemp: '19°C',
      rating: 3,
      lastUpdated: 'Hace 45 min'
    }
  },
  {
    name: 'Barranquito',
    slug: 'barranquito',
    lat: -12.146, 
    lng: -77.025,
    image: 'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    count: 'Longboard spot',
    description: 'El spot clásico de Barranco. Conocido por su ambiente relajado y sus olas largas ideales para tablón (longboard) y SUP. Un rincón con mucha historia y mística.',
    waveType: 'Point break izquierdo muy suave y largo. No es una ola agresiva, lo que la hace perfecta para estilos clásicos y relajados.',
    level: 'Principiante',
    entryTips: [
      'Ingreso por la playa de arena/piedra chica',
      'Rema con paciencia, el pico está algo adentro',
      'Respeta el estilo relajado del lineup',
      'Disfruta la vista de los acantilados de Barranco'
    ],
    bestTime: 'Invierno para tamaño, Verano para relax',
    hazards: ['Rocas sumergidas', 'Remada larga'],
    conditions: {
      waveHeight: '0.6 - 1.2m',
      wavePeriod: '13s',
      windSpeed: '10 km/h',
      windDirection: 'S',
      tide: 'high',
      tideTime: 'Alta',
      waterTemp: '17°C',
      rating: 4,
      lastUpdated: 'Hace 1h'
    }
  },
  {
    name: 'La Herradura',
    slug: 'la-herradura',
    lat: -12.169, 
    lng: -77.029,
    image: 'https://images.unsplash.com/photo-1522055620701-081699709db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    count: 'Solo expertos',
    description: 'La leyenda de Lima. Un point break izquierdo de clase mundial ubicado en Chorrillos. Cuando entra el crecidón, ofrece tubos y secciones rápidas solo para los más experimentados.',
    waveType: 'Point break izquierdo sobre fondo de rocas. Ola muy potente, rápida y tubular. Puede alcanzar 3-4 metros en días grandes. Requiere lectura experta.',
    level: 'Avanzado',
    entryTips: [
      'Entrada complicada por las rocas (el "salto")',
      'Calcula perfectamente el timing de la serie',
      'Si dudas, mejor no entres',
      'Localismo fuerte: respeto absoluto'
    ],
    bestTime: 'Creces grandes del Sur (Invierno)',
    hazards: ['Rocas afiladas', 'Corrientes muy fuertes', 'Localismo', 'Fondos bajos'],
    conditions: {
      waveHeight: '2.0 - 3.0m',
      wavePeriod: '17s',
      windSpeed: '15 km/h',
      windDirection: 'SE',
      tide: 'low',
      tideTime: 'Baja',
      waterTemp: '15°C',
      rating: 5,
      lastUpdated: 'Hace 10 min'
    }
  },
  {
    name: 'El Triángulo',
    slug: 'el-triangulo',
    lat: -12.398, 
    lng: -76.780,
    image: 'https://images.unsplash.com/photo-1481190566236-40742a785e05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    count: 'Pico potente',
    description: 'Ubicado en las playas del sur (San Bartolo/Santa María). Un pico definido que rompe con fuerza en forma triangular, ofreciendo paredes para ambos lados.',
    waveType: 'Reef break potente. Ofrece una "A-frame" (pico triangular) con derechas e izquierdas. Ola con fuerza y buena pared para maniobras.',
    level: 'Avanzado',
    entryTips: [
      'Requiere buena remada para llegar al pico',
      'Posiciónate justo en el vértice del triángulo',
      'Cuidado con la serie sorpresa',
      'Mejor ir acompañado'
    ],
    bestTime: 'Todo el año, consistente',
    hazards: ['Fondo de roca', 'Corrientes de retorno', 'Olas con fuerza'],
    conditions: {
      waveHeight: '1.2 - 2.0m',
      wavePeriod: '14s',
      windSpeed: '12 km/h',
      windDirection: 'S',
      tide: 'mid',
      tideTime: 'Subiendo',
      waterTemp: '16°C',
      rating: 4,
      lastUpdated: 'Hace 40 min'
    }
  },
  {
    name: 'Punta Hermosa',
    slug: 'punta-hermosa',
    lat: -12.338, 
    lng: -76.820,
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
    lat: -12.392, 
    lng: -76.782,
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

const BEACH_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'costa-verde': { lat: -12.119, lng: -77.043 },
  'makaha': { lat: -12.126, lng: -77.038 },
  'la-pampilla': { lat: -12.115, lng: -77.045 },
  'punta-roquitas': { lat: -12.112, lng: -77.046 },
  'playa-redondo': { lat: -12.130, lng: -77.035 },
  'barranquito': { lat: -12.146, lng: -77.025 },
  'la-herradura': { lat: -12.169, lng: -77.029 },
  'el-triangulo': { lat: -12.398, lng: -76.780 },
  'punta-hermosa': { lat: -12.338, lng: -76.820 },
  'san-bartolo': { lat: -12.392, lng: -76.782 },
  'default': { lat: -12.12, lng: -77.04 }
};

function getCardinalDirection(angle: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(angle / 22.5) % 16];
}

async function fetchRealTimeData(lat: number, lng: number) {
  try {
    const [marineRes, weatherRes] = await Promise.all([
      fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=wave_height,wave_period,wave_direction&timezone=auto`),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m,wind_direction_10m&timezone=auto`)
    ]);

    if (!marineRes.ok || !weatherRes.ok) return null;

    const marine = await marineRes.json();
    const weather = await weatherRes.json();

    if (!marine.current || !weather.current) return null;

    return {
      waveHeight: `${marine.current.wave_height.toFixed(1)} m`,
      wavePeriod: `${marine.current.wave_period.toFixed(0)}s`,
      windSpeed: `${Math.round(weather.current.wind_speed_10m)} km/h`,
      windDirection: getCardinalDirection(weather.current.wind_direction_10m),
      waterTemp: `${Math.round(weather.current.temperature_2m)}°C`,
      lastUpdated: 'En vivo'
    };
  } catch (error) {
    console.error('Error fetching conditions:', error);
    return null;
  }
}


function WeatherIcon({ type, className }: { type: 'wave' | 'wind' | 'temp' | 'time'; className?: string }) {
  const icons = {
    wave: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
    wind: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />, // Simplified wind/face like
    temp: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />, // Sun
    time: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  };
  
  // Custom refined icons
  if (type === 'wave') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15C3 15 5.5 12 7.5 12C9.5 12 11 15 13 15C15 15 17 12 19 12C21 12 23 15 23 15" />
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9C3 9 5.5 6 7.5 6C9.5 6 11 9 13 9C15 9 17 6 19 6C21 6 23 9 23 9" />
      </svg>
    )
  }
  
  if (type === 'wind') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16h6a3 3 0 000-6h1a4 4 0 110 8h-2" />
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.5 12H19" />
      </svg>
    )
  }

  if (type === 'temp') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2 6 6 0 00-4 0 5 5 0 0010 0 6 6 0 00-4 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9l-1 1-1-1m2-2l-1 1-1-1" />
      </svg>
    ); // Placeholder, simplified
  }

  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {icons[type]}
    </svg>
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-[2rem] max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Image Area */}
        <div className="relative h-64 sm:h-72 w-full flex-shrink-0">
          <img 
            src={destination.image || 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
            alt={destination.name} 
            className="w-full h-full object-cover" 
          />
          {/* Enhanced Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 border border-white/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  destination.level === 'Principiante' ? 'bg-emerald-500 text-emerald-950' :
                  destination.level === 'Intermedio' ? 'bg-yellow-400 text-yellow-950' :
                  destination.level === 'Avanzado' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {destination.level}
                </span>
                {destination.conditions.lastUpdated === 'En vivo' && (
                   <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/90 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider text-white">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      En vivo
                   </span>
                )}
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">{destination.name}</h2>
              <p className="text-gray-300 font-medium text-lg max-w-xl line-clamp-2">{destination.description}</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
           <div className="p-6 sm:p-8 space-y-8">
             
             {/* Live Conditions Grid */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-28">
                   <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <WeatherIcon type="wave" className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase text-gray-400">Oleaje</span>
                   </div>
                   <div>
                      <span className="text-2xl font-black text-gray-900 block">{destination.conditions.waveHeight}</span>
                      <span className="text-sm text-gray-500 font-medium">{destination.conditions.wavePeriod} periodo</span>
                   </div>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-28">
                   <div className="flex items-center gap-2 text-cyan-500 mb-1">
                      <WeatherIcon type="wind" className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase text-gray-400">Viento</span>
                   </div>
                   <div>
                      <span className="text-2xl font-black text-gray-900 block">{destination.conditions.windSpeed}</span>
                      <span className="text-sm text-gray-500 font-medium">Dir: {destination.conditions.windDirection}</span>
                   </div>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-28">
                   <div className="flex items-center gap-2 text-indigo-500 mb-1">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                       <span className="text-xs font-bold uppercase text-gray-400">Marea</span>
                   </div>
                   <div>
                      <span className="text-xl font-black text-gray-900 block capitalize">{destination.conditions.tideTime}</span>
                      <div className="flex items-center gap-1 mt-1">
                         <div className={`h-1.5 w-1.5 rounded-full ${destination.conditions.tide === 'low' ? 'bg-blue-600' : 'bg-gray-200'}`} />
                         <div className={`h-1.5 w-1.5 rounded-full ${destination.conditions.tide === 'mid' ? 'bg-blue-600' : 'bg-gray-200'}`} />
                         <div className={`h-1.5 w-1.5 rounded-full ${destination.conditions.tide === 'high' ? 'bg-blue-600' : 'bg-gray-200'}`} />
                      </div>
                   </div>
                </div>
                
                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-28">
                   <div className="flex items-center gap-2 text-orange-500 mb-1">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="text-xs font-bold uppercase text-gray-400">Agua</span>
                   </div>
                   <div>
                      <span className="text-2xl font-black text-gray-900 block">{destination.conditions.waterTemp}</span>
                      <span className="text-sm text-gray-500 font-medium">Rating: {destination.conditions.rating}/5</span>
                   </div>
                </div>
             </div>

             <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column: Info */}
                <div className="space-y-6">
                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                      <h3 className="font-bold text-lg text-[#011627] mb-4 flex items-center gap-2">
                         🌊 Tipo de Ola
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-4">{destination.waveType}</p>
                      <div className="flex items-center gap-2 text-sm font-medium text-blue-800 bg-blue-50 px-4 py-2 rounded-xl inline-block w-full">
                         <span>📅 Mejor época:</span>
                         <span>{destination.bestTime}</span>
                      </div>
                   </div>

                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                     <h3 className="font-bold text-lg text-[#011627] mb-4 flex items-center gap-2">
                        ⚠️ Precauciones
                     </h3>
                     <div className="flex flex-wrap gap-2">
                       {(destination.hazards || []).map((hazard, i) => (
                         <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-bold border border-red-100">
                           <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                           </svg>
                           {hazard}
                         </span>
                       ))}
                       {(!destination.hazards || destination.hazards.length === 0) && (
                         <span className="text-gray-500 text-sm italic">Sin riesgos específicos.</span>
                       )}
                     </div>
                   </div>
                </div>

                {/* Right Column: Tips */}
                <div className="space-y-6">
                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full">
                      <h3 className="font-bold text-lg text-[#011627] mb-4 flex items-center gap-2">
                         🏊 Tips de Ingreso
                      </h3>
                      <ul className="space-y-4">
                        {(destination.entryTips || []).map((tip, i) => (
                          <li key={i} className="flex gap-4 group">
                            <span className="w-8 h-8 flex-shrink-0 bg-gray-100 text-gray-900 rounded-xl flex items-center justify-center font-black text-sm group-hover:bg-[#011627] group-hover:text-white transition-colors duration-300">
                              {i + 1}
                            </span>
                            <p className="text-gray-600 text-sm leading-relaxed pt-1.5 border-b border-gray-50 pb-4 w-full">{tip}</p>
                          </li>
                        ))}
                        {(!destination.entryTips || destination.entryTips.length === 0) && (
                           <p className="text-gray-500 text-sm italic">Información general: observa el mar antes de entrar.</p>
                        )}
                      </ul>
                   </div>
                </div>
             </div>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 p-4 sm:p-6 bg-white border-t border-gray-100 flex justify-between items-center gap-4">
           <div className="hidden sm:block">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">¿Te gusta esta playa?</p>
              <p className="text-[#011627] font-bold text-sm">Reserva una clase ahora</p>
           </div>
           <Link 
             href={`/?q=${destination.name}`}
             className="flex-1 sm:flex-none sm:w-1/2 bg-[#011627] hover:bg-black text-white font-bold py-3.5 px-8 rounded-xl text-center transition-all hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
           >
             <span>Ver Horarios Disponibles</span>
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
             </svg>
           </Link>
        </div>
      </div>
    </div>
  );
}

export function DestinationGrid() {
  const [selectedDestination, setSelectedDestination] = useState<DestinationData | null>(null);
  const [destinations, setDestinations] = useState<DestinationData[]>(DESTINATIONS);

  // Derive active destination from state (to show live updates in modal)
  const activeDestination = selectedDestination 
    ? destinations.find(d => d.slug === selectedDestination.slug) || selectedDestination 
    : null;

  useEffect(() => {
    async function initData() {
      // 1. Fetch DB data and merge with static
      let currentDestinations = [...DESTINATIONS];
      try {
        const res = await fetch('/api/beaches?active=true');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            currentDestinations = data.map((apiBeach: any) => {
               // Find static match to preserve high-res images/tips if DB is empty
               const staticMatch = DESTINATIONS.find(d => d.slug === apiBeach.slug || d.name === apiBeach.name);
               return {
                 ...staticMatch, // Defaults
                 ...apiBeach,    // Overrides
                 slug: apiBeach.slug || staticMatch?.slug,
                 lat: apiBeach.lat || staticMatch?.lat, // Preserve static coords if DB missing
                 lng: apiBeach.lng || staticMatch?.lng,
                 image: apiBeach.image || staticMatch?.image || 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Ensure image
                 conditions: { ...staticMatch?.conditions, ...apiBeach.conditions }
               };
            });
          }
        }
      } catch (error) {
        console.log('Using static destinations data', error);
      }

      // 2. Fetch Live Weather for all destinations
      // We do this AFTER merging DB data so we have the full list
      const updatedDestinations = await Promise.all(currentDestinations.map(async (dest) => {
         // Determine coordinates: prefer dest lat/lng, fallback to map
         const coord = (dest.lat && dest.lng) 
            ? { lat: dest.lat, lng: dest.lng }
            : (dest.slug && BEACH_COORDINATES[dest.slug]) || BEACH_COORDINATES['default'];
         
         if (coord) {
             const weather = await fetchRealTimeData(coord.lat, coord.lng);
             if (weather) {
                 return {
                     ...dest,
                     conditions: {
                         ...dest.conditions,
                         ...weather
                     }
                 };
             }
         }
         return dest;
      }));
      
      setDestinations(updatedDestinations);
    }
    
    initData();
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
      {activeDestination && (
        <BeachModal 
          destination={activeDestination} 
          onClose={() => setSelectedDestination(null)} 
        />
      )}
    </>
  );
}


