'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

interface CuratedSectionProps {
  title: string;
  subtitle?: string;
  linkHref?: string;
  linkText?: string;
  children: React.ReactNode;
  bgWhite?: boolean;
}

export function CuratedSection({ 
  title, 
  subtitle, 
  linkHref = '#', 
  linkText = 'Ver todo', 
  children,
  bgWhite = false 
}: CuratedSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <section className={`py-12 ${bgWhite ? 'bg-white' : 'bg-[#F6F7F8]'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#011627] tracking-tight mb-1">
              {title}
            </h2>
            {subtitle && (
              <p className="text-gray-600 text-sm sm:text-base font-medium">
                {subtitle}
              </p>
            )}
          </div>
          
          <Link 
            href={linkHref}
            className="hidden sm:flex items-center gap-1 text-blue-600 font-bold text-sm hover:underline"
          >
            {linkText} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="relative group">
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x snap-mandatory"
          >
            {children}
          </div>
          
          {/* Scroll shadows if needed in future */}
        </div>
        
         <Link 
            href={linkHref}
            className="flex sm:hidden items-center justify-center gap-1 text-blue-600 font-bold text-sm mt-4 border border-blue-200 rounded-lg py-3 w-full active:bg-blue-50"
          >
            {linkText}
          </Link>
      </div>
    </section>
  );
}
