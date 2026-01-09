import Link from 'next/link';
import { Package } from 'lucide-react';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  category: string;
  school?: {
    name: string;
  };
}

export function ProductHomeCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group h-full flex flex-col">
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {product.image ? (
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <Package className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-800">
          {product.category}
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="text-xs text-blue-600 font-semibold mb-1 truncate">
          {product.school?.name}
        </div>
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 flex-grow">{product.name}</h3>
        <div className="mt-auto flex justify-between items-end">
             <span className="text-lg font-bold text-gray-900">S/ {product.price}</span>
             <button className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
               Ver más
             </button>
        </div>
      </div>
    </div>
  );
}
