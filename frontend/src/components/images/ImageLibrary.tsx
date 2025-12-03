'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { X, Check, ImageIcon, Loader2 } from 'lucide-react';

interface ImageLibraryProps {
  onSelect: (imageUrl: string) => void;
  onClose: () => void;
  selectedImages?: string[];
  maxSelection?: number;
}

interface LibraryImage {
  url: string;
  classTitle: string;
  uploadedAt: string;
}

export default function ImageLibrary({ onSelect, onClose, selectedImages = [], maxSelection = 5 }: ImageLibraryProps) {
  const { data: session } = useSession();
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const token = (session as any)?.backendToken;
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch('/api/images/library', { headers });
        
        if (!response.ok) {
          throw new Error('Error al cargar la biblioteca de imágenes');
        }

        const data = await response.json();
        setImages(data.images || []);
      } catch (err) {
        console.error('Error fetching image library:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar imágenes');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchImages();
    }
  }, [session]);

  const isSelected = (url: string) => selectedImages.includes(url);
  const canSelectMore = selectedImages.length < maxSelection;

  const handleImageClick = (url: string) => {
    if (isSelected(url)) {
      // Ya está seleccionada, no hacer nada (el usuario puede deseleccionar desde el formulario principal)
      return;
    }
    
    if (!canSelectMore) {
      setError(`Máximo ${maxSelection} imágenes permitidas`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    onSelect(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Biblioteca de Imágenes</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
              <p className="text-gray-600">Cargando imágenes...</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {!loading && images.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">No hay imágenes en la biblioteca</p>
              <p className="text-sm mt-1">Sube imágenes desde el formulario de clases</p>
            </div>
          )}

          {!loading && images.length > 0 && (
            <>
              <div className="mb-4 text-sm text-gray-600">
                <p>Seleccionadas: {selectedImages.length}/{maxSelection}</p>
                <p className="text-xs mt-1">Haz clic en una imagen para agregarla</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => handleImageClick(image.url)}
                    className={`
                      relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer
                      transition-all hover:scale-105
                      ${isSelected(image.url) 
                        ? 'border-green-500 ring-2 ring-green-200' 
                        : 'border-gray-200 hover:border-blue-400'
                      }
                      ${!canSelectMore && !isSelected(image.url) ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <Image
                      src={image.url}
                      alt={image.classTitle}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    />
                    
                    {/* Selected Indicator */}
                    {isSelected(image.url) && (
                      <div className="absolute inset-0 bg-green-500 bg-opacity-30 flex items-center justify-center">
                        <div className="bg-green-500 rounded-full p-2">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Image Info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                      <p className="text-white text-xs truncate">{image.classTitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
