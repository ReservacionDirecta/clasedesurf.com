'use client';

import React, { useRef, useState } from 'react';
import { User, Upload, Image as ImageIcon } from 'lucide-react';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

// Avatar definitions - 6 avatares relacionados con el surf
export const STUDENT_AVATARS = [
  { id: 'surfer1', name: 'Surfer Principiante', emoji: '🏄', color: 'from-blue-400 to-cyan-400' },
  { id: 'surfer2', name: 'Surfer Intermedio', emoji: '🏄‍♂️', color: 'from-blue-500 to-indigo-500' },
  { id: 'surfer3', name: 'Surfer Avanzado', emoji: '🏄‍♀️', color: 'from-cyan-400 to-blue-500' },
  { id: 'wave1', name: 'Ola Azul', emoji: '🌊', color: 'from-blue-300 to-teal-300' },
  { id: 'wave2', name: 'Ola Verde', emoji: '🌊', color: 'from-teal-400 to-cyan-400' },
  { id: 'sunset', name: 'Atardecer', emoji: '🌅', color: 'from-orange-400 to-pink-400' },
];

export const INSTRUCTOR_AVATARS = [
  { id: 'instructor1', name: 'Instructor Experto', emoji: '🏄‍♂️', color: 'from-indigo-500 to-purple-500' },
  { id: 'instructor2', name: 'Instructor Pro', emoji: '🏄', color: 'from-blue-600 to-cyan-600' },
  { id: 'coach', name: 'Coach', emoji: '🏄‍♀️', color: 'from-purple-500 to-pink-500' },
  { id: 'wave_pro', name: 'Ola Pro', emoji: '🌊', color: 'from-cyan-500 to-blue-600' },
  { id: 'trophy', name: 'Campeón', emoji: '🏆', color: 'from-yellow-400 to-orange-400' },
  { id: 'star', name: 'Estrella', emoji: '⭐', color: 'from-yellow-300 to-amber-400' },
];

interface AvatarSelectorProps {
  selectedAvatar: string | null;
  onSelectAvatar: (avatarId: string) => void;
  role?: 'STUDENT' | 'INSTRUCTOR' | 'SCHOOL' | 'ADMIN';
  size?: 'sm' | 'md' | 'lg';
}

export default function AvatarSelector({ 
  selectedAvatar, 
  onSelectAvatar, 
  role = 'STUDENT',
  size = 'md'
}: AvatarSelectorProps) {
  const avatares = role === 'INSTRUCTOR' || role === 'SCHOOL' || role === 'ADMIN' 
    ? INSTRUCTOR_AVATARS 
    : STUDENT_AVATARS;

  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
  };

  const gridSizeClasses = {
    sm: 'grid-cols-4 gap-2',
    md: 'grid-cols-4 gap-3',
    lg: 'grid-cols-4 gap-4',
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error('Error al subir imagen');
      
      const data = await res.json();
      if (data.url) {
        onSelectAvatar(data.url);
      }
    } catch (e) {
      console.error(e);
      // Optional: notify parent of error
    } finally {
      setUploading(false);
    }
  };

  const isCustomImage = selectedAvatar && (selectedAvatar.startsWith('http') || selectedAvatar.startsWith('/'));

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
      />
      <div className={`grid ${gridSizeClasses[size]} mb-4`}>
        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative ${sizeClasses[size]} rounded-full 
            bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300
            flex items-center justify-center
            transition-all duration-200
            hover:scale-105 shadow-sm hover:shadow-md
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          `}
          title="Subir Foto"
          disabled={uploading}
        >
           {uploading ? (
             <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
           ) : (
             <Upload className="w-1/2 h-1/2 text-gray-500" />
           )}
        </button>

        {/* Custom Image Preview (if selected) */}
        {isCustomImage && (
           <button
           type="button"
           className={`
             relative ${sizeClasses[size]} rounded-full 
             bg-white overflow-hidden
             flex items-center justify-center
             ring-4 ring-blue-500 ring-offset-2 shadow-lg
           `}
           title="Tu Foto"
         >
           <img src={selectedAvatar} alt="Custom" className="w-full h-full object-cover" />
         </button>
        )}

        {avatares.map((avatar) => {
          const isSelected = selectedAvatar === avatar.id;
          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => onSelectAvatar(avatar.id)}
              className={`
                relative ${sizeClasses[size]} rounded-full 
                bg-gradient-to-br ${avatar.color}
                flex items-center justify-center
                transition-all duration-200
                ${isSelected 
                  ? 'ring-4 ring-blue-500 ring-offset-2 scale-110 shadow-lg' 
                  : 'hover:scale-105 shadow-md hover:shadow-lg'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              `}
              title={avatar.name}
            >
              <span className="select-none">{avatar.emoji}</span>
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {selectedAvatar && (
        <p className="text-sm text-gray-600 text-center">
          {avatares.find(a => a.id === selectedAvatar)?.name}
        </p>
      )}
    </div>
  );
}

// Component to display avatar
interface AvatarDisplayProps {
  avatarId: string | null | undefined;
  role?: 'STUDENT' | 'INSTRUCTOR' | 'SCHOOL' | 'ADMIN';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: React.ReactNode;
}

export function AvatarDisplay({ 
  avatarId, 
  role = 'STUDENT',
  size = 'md',
  className = '',
  fallback
}: AvatarDisplayProps) {
  const avatares = role === 'INSTRUCTOR' || role === 'SCHOOL' || role === 'ADMIN' 
    ? INSTRUCTOR_AVATARS 
    : STUDENT_AVATARS;

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-24 h-24 text-4xl',
  };

  const avatar = avatarId ? avatares.find(a => a.id === avatarId) : null;

  if (!avatar && !fallback) {
    return (
      <div className={`
        ${sizeClasses[size]} rounded-full 
        bg-gradient-to-br from-gray-300 to-gray-400
        flex items-center justify-center
        ${className}
      `}>
        <User className="w-1/2 h-1/2 text-white" />
      </div>
    );
  }

  if (!avatar) {
    if (avatarId && (avatarId.startsWith('http') || avatarId.startsWith('/'))) {
        return (
            <div className={`
              ${sizeClasses[size]} rounded-full 
              overflow-hidden bg-white border border-gray-200 shadow-sm
              ${className}
            `}>
              <img src={avatarId} alt="Profile" className="w-full h-full object-cover" />
            </div>
          );
    }
    return <>{fallback}</>;
  }

  return (
    <div className={`
      ${sizeClasses[size]} rounded-full 
      bg-gradient-to-br ${avatar.color}
      flex items-center justify-center
      ${className}
    `}>
      <span className="select-none">{avatar.emoji}</span>
    </div>
  );
}

