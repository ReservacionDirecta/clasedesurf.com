import Link from 'next/link';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

const DESTINATIONS = [
  {
    name: 'Costa Verde',
    image: 'https://images.unsplash.com/photo-1533602525539-7521844b3f86?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    count: '25+ escuelas'
  },
  {
    name: 'Makaha',
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    count: 'Top spots'
  },
  {
    name: 'Punta Hermosa',
    image: 'https://images.unsplash.com/photo-1520699697851-3dc68aa3a474?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    count: 'Pro surfing'
  },
  {
    name: 'San Bartolo',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    count: 'Para todos'
  }
];

export function DestinationGrid() {
  return (
    <section className="py-12 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-black text-[#011627] tracking-tight mb-8">
          Explora por destino
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DESTINATIONS.map((dest) => (
            <Link 
              key={dest.name} 
              href={`/?q=${dest.name}`}
              className="group relative h-40 sm:h-52 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all"
            >
              <ImageWithFallback
                src={dest.image}
                alt={dest.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-bold text-lg sm:text-xl">{dest.name}</h3>
                <p className="text-xs sm:text-sm font-medium text-gray-200">{dest.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
