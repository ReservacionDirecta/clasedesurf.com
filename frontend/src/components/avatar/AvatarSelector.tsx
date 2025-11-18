'use client';

import React from 'react';
import { User } from 'lucide-react';

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
    sm: 'grid-cols-3 gap-2',
    md: 'grid-cols-3 gap-3',
    lg: 'grid-cols-3 gap-4',
  };

  return (
    <div className="w-full">
      <div className={`grid ${gridSizeClasses[size]} mb-4`}>
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

