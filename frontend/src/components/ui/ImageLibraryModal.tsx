"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { limaBeachImages } from '@/lib/lima-beach-images';

interface ImageLibraryModalProps {
  onSelect: (url: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function ImageLibraryModal({ onSelect, onClose, isOpen }: ImageLibraryModalProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'uploads' | 'stock'>('uploads');
  const [uploadedImages, setUploadedImages] = useState<{ url: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Load uploaded images
  useEffect(() => {
    if (isOpen && activeTab === 'uploads') {
      const fetchImages = async () => {
        setLoading(true);
        try {
          const token = (session as any)?.backendToken;
          const headers: any = {};
          if (token) headers['Authorization'] = `Bearer ${token}`;
          
          const res = await fetch('/api/upload', { headers });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              setUploadedImages(data);
            }
          }
        } catch (err) {
          console.error("Error loading images", err);
        } finally {
          setLoading(false);
        }
      };
      fetchImages();
    }
  }, [isOpen, activeTab, session]);

  if (!isOpen) return null;

  // Flatten Stock Images
  const stockImages: { url: string; label: string; category: string }[] = [];
  
  if (limaBeachImages) {
      if (limaBeachImages.beaches) {
        Object.entries(limaBeachImages.beaches).forEach(([name, urls]: [string, any]) => {
             if (urls.surf) stockImages.push({ url: urls.surf, label: `${name} (Surf)`, category: 'Playas' });
             if (urls.general) stockImages.push({ url: urls.general, label: `${name} (General)`, category: 'Playas' });
        });
      }

      if (limaBeachImages.waterSports && limaBeachImages.waterSports.surf) {
        Object.entries(limaBeachImages.waterSports.surf).forEach(([level, url]) => {
             stockImages.push({ url: url as string, label: `Nivel: ${level}`, category: 'Niveles' });
        });
      }

      if (limaBeachImages.classTypes) {
        Object.entries(limaBeachImages.classTypes).forEach(([type, url]) => {
             stockImages.push({ url: url as string, label: `Clase: ${type}`, category: 'Clases' });
        });
      }
      
      if (limaBeachImages.hero) {
          stockImages.push({ url: limaBeachImages.hero.groupSunset, label: 'Hero (Sunset)', category: 'Hero' });
      }
  }

  // Remove duplicate URLs
  const uniqueStock = Array.from(new Map(stockImages.map(item => [item.url, item])).values());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Biblioteca de Imágenes</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button 
             className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'uploads' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
             onClick={() => setActiveTab('uploads')}
          >
            Mis Imágenes (Subidas)
          </button>
          <button 
             className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'stock' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
             onClick={() => setActiveTab('stock')}
          >
            Galería Global
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
           {activeTab === 'uploads' ? (
              loading ? (
                 <div className="flex justify-center items-center h-40">
                    <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                 </div>
              ) : uploadedImages.length === 0 ? (
                 <div className="text-center text-gray-500 py-10">
                    <p>No hay imágenes subidas aún.</p>
                    <p className="text-sm mt-2">Sube archivos directamente en el formulario.</p>
                 </div>
              ) : (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {uploadedImages.map((img, idx) => (
                       <button key={idx} onClick={() => { onSelect(img.url); onClose(); }} className="group relative block w-full aspect-video rounded-lg overflow-hidden border hover:border-blue-500 focus:ring-2 ring-blue-500 transition-all bg-white">
                          <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                             {img.name}
                          </div>
                       </button>
                    ))}
                 </div>
              )
           ) : (
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {uniqueStock.map((img, idx) => (
                      <button key={idx} onClick={() => { onSelect(img.url); onClose(); }} className="group relative block w-full aspect-video rounded-lg overflow-hidden border hover:border-blue-500 focus:ring-2 ring-blue-500 transition-all bg-white">
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 truncate">
                           {img.label}
                        </div>
                        <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] px-1 py-0.5 rounded-bl shadow-sm">
                           {img.category}
                        </div>
                      </button>
                  ))}
               </div>
           )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t bg-white flex justify-end">
           <button onClick={onClose} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">Cancelar</button>
        </div>
      </div>
    </div>
  );
}
