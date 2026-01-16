'use client';

import { 
  Globe, 
  GraduationCap, 
  Users, 
  Crown, 
  Smile, 
  Tent 
} from 'lucide-react';

export type CategoryId = 'all' | 'beginner' | 'group' | 'private' | 'kids' | 'camps';

interface Category {
  id: CategoryId;
  label: string;
  icon: React.ElementType;
  color: string; // Active color accent
}

const CATEGORIES: Category[] = [
  { id: 'all', label: 'Todos', icon: Globe, color: 'text-blue-600' },
  { id: 'beginner', label: 'Principiantes', icon: GraduationCap, color: 'text-green-600' },
  { id: 'group', label: 'Grupales', icon: Users, color: 'text-purple-600' },
  { id: 'private', label: 'Privadas', icon: Crown, color: 'text-yellow-600' },
  { id: 'kids', label: 'Niños', icon: Smile, color: 'text-pink-500' },
  { id: 'camps', label: 'Surf Camps', icon: Tent, color: 'text-teal-600' },
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
          <div className="min-w-full inline-flex justify-center items-center gap-6 md:gap-10 px-4 md:px-8">
            {CATEGORIES.map((category) => {
              const isActive = activeCategory === category.id;
              const Icon = category.icon;
              
              return (
                <button
                  key={category.id}
                  onClick={() => onSelectCategory(category.id)}
                  className={`
                    flex flex-col items-center min-w-[72px] transition-all duration-200 group shrink-0 select-none outline-none
                    ${isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'}
                  `}
                >
                  <div 
                    className={`
                      w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-2xl mb-2 transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-br from-gray-900 to-gray-700 shadow-lg shadow-gray-900/20 scale-105' 
                        : 'bg-gray-100 hover:bg-gray-200 group-hover:scale-105'
                      }
                    `}
                  >
                    <Icon 
                      className={`
                        w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300
                        ${isActive ? 'text-white' : 'text-gray-600'}
                      `} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>
                  
                  <div className="relative h-6 flex items-center justify-center">
                    <span 
                      className={`
                        text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-200
                        ${isActive ? 'text-gray-900' : 'text-gray-500'}
                      `}
                    >
                      {category.label}
                    </span>
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gray-900 rounded-full animate-in fade-in zoom-in duration-300" />
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

