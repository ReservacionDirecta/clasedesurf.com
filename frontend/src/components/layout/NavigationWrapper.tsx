"use client";

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { Header } from './Header';

export function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // La página principal (marketplace) solo debe tener el Header superior
  const isMarketplacePage = pathname === '/';
  
  // Páginas que no necesitan navegación (login, register, etc.)
  const noNavPages = ['/login', '/register', '/denied'];
  const shouldShowNav = !noNavPages.includes(pathname || '');
  
  // MobileBottomNav solo se muestra si hay sesión (en móvil)
  const shouldShowMobileNav = session?.user && typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <>
      {/* Header superior - se muestra en todas las páginas excepto las de noNavPages */}
      {shouldShowNav && <Header />}
      
      {/* Contenido principal */}
      {children}
      
      {/* Navbar móvil inferior - se muestra solo si hay sesión (los dashboards ya lo incluyen en su layout) */}
      {/* No lo mostramos aquí porque los layouts de dashboard ya lo incluyen */}
    </>
  );
}
