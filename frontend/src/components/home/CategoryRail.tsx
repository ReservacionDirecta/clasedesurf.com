'use client';

import { useState } from 'react';
import { SurferIcon, GroupIcon, StarIcon, WaveIcon } from '@/components/ui/Icons';
import { Trophy, Baby, Tent, Globe } from 'lucide-react';

export type CategoryId = 'all' | 'beginner' | 'group' | 'private' | 'kids' | 'camps';

interface Category {
  id: CategoryId;
  label: string;
  icon: React.ElementType;
}

const CATEGORIES: Category[] = [
  { id: 'all', label: 'Todos', icon: Globe },
  { id: 'beginner', label: 'Principiantes', icon: SurferIcon },
  { id: 'group', label: 'Grupales', icon: GroupIcon },
  { id: 'private', label: 'Privadas', icon: StarIcon },
  { id: 'kids', label: 'Niños', icon: Baby },
  { id: 'camps', label: 'Surf Camps', icon: Tent },
];

interface CategoryRailProps {
  activeCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
}

export function CategoryRail({ activeCategory, onSelectCategory }: CategoryRailProps) {
  return (
    <div className="sticky top-[74px] z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="w-full max-w-[2000px] mx-auto">
        <div className="overflow-x-auto no-scrollbar scroll-smooth py-3 md:py-4">
          <div className="min-w-full inline-flex justify-center items-center gap-4 md:gap-8 px-4 md:px-8">
            {CATEGORIES.map((category) => {
              const isActive = activeCategory === category.id;
              const Icon = category.icon;
              
              return (
                <button
                  key={category.id}
                  onClick={() => {
                     if (category.id === 'all') {
                        // For 'all', we explicitly want to reset/show all classes
                        onSelectCategory('all');
                     } else {
                        onSelectCategory(category.id);
                     }
                  }}
                  className={`
                    flex flex-col items-center min-w-[64px] transition-all duration-200 group shrink-0 select-none outline-none
                    ${isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'}
                  `}
                >
                  <div 
                    className={`
                      w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full mb-2 transition-all duration-300
                      ${isActive ? 'bg-gray-100 scale-105 shadow-sm' : 'bg-transparent hover:bg-gray-50'}
                    `}
                  >
                    <Icon 
                      className={`
                        w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300
                        ${isActive ? 'text-[#011627] stroke-[2.5px]' : 'text-gray-500 stroke-2'}
                      `} 
                    />
                  </div>
                  
                  <div className="relative h-6 flex items-center justify-center">
                    <span 
                      className={`
                        text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all duration-200
                        ${isActive ? 'text-[#011627] font-bold' : 'text-gray-500'}
                      `}
                    >
                      {category.label}
                    </span>
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#011627] rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300"></span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
