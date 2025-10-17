"use client";

import { usePathname } from 'next/navigation';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { Header } from './Header';

export function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // La página principal (marketplace) solo debe tener el Header superior
  const isMarketplacePage = pathname === '/';
  
  // Páginas que no necesitan navegación (login, register, etc.)
  const noNavPages = ['/login', '/register', '/denied'];
  const shouldShowNav = !noNavPages.includes(pathname || '');

  return (
    <>
      {/* Header superior - se muestra en todas las páginas excepto las de noNavPages */}
      {shouldShowNav && <Header />}
      
      {/* Contenido principal */}
      {children}
      
      {/* Navbar móvil inferior - se muestra en todas las páginas EXCEPTO el marketplace */}
      {shouldShowNav && !isMarketplacePage && <MobileBottomNav />}
    </>
  );
}
