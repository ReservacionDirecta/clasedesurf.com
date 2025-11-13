"use client";

import { useMemo, useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { 
  Home, 
  Waves, 
  School, 
  Mail, 
  User, 
  LogOut,
  Menu,
  X,
  ChevronRight
} from "lucide-react";

type RoleOption = "STUDENT" | "INSTRUCTOR" | "SCHOOL_ADMIN" | "ADMIN" | undefined;

const navLinkClass = "text-[#F6F7F8]/80 hover:text-[#FF3366] transition-colors";
const headerOutlineButtonClass = "!bg-transparent !text-white !border-white/30 hover:!text-[#011627] hover:!bg-white/10 focus:!bg-white/10";
const primaryButtonClass = "bg-gradient-to-r from-[#FF3366] to-[#D12352] hover:from-[#D12352] hover:to-[#FF3366]";
const containerClass = "bg-[#011627]/95 backdrop-blur-sm shadow-lg sticky top-0 z-40 border-b border-white/10";
const mobileSectionBorderClass = "border-t border-white/10";

const roleLinkMap: Record<Exclude<RoleOption, undefined>, { href: string; icon: JSX.Element; label: string }[]> = {
  STUDENT: [
    {
      href: "/dashboard/student",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: "Dashboard"
    }
  ],
  INSTRUCTOR: [
    {
      href: "/dashboard/instructor",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      label: "Dashboard Instructor"
    }
  ],
  SCHOOL_ADMIN: [
    {
      href: "/dashboard/school",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      label: "Dashboard Escuela"
    }
  ],
  ADMIN: [
    {
      href: "/dashboard/admin",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: "Dashboard Admin"
    }
  ]
};

const baseLinks = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/classes", label: "Clases", icon: Waves },
  { href: "/schools", label: "Escuelas", icon: School },
  { href: "/contact", label: "Contacto", icon: Mail }
];

export const Header = (): JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = (session as any)?.user?.role as RoleOption;
  const roleLinks = useMemo(() => {
    if (!role || !roleLinkMap[role as Exclude<RoleOption, undefined>]) return [];
    return roleLinkMap[role as Exclude<RoleOption, undefined>];
  }, [role]);
  
  // Detectar si estamos en una página de dashboard o páginas públicas con sidebar
  const isDashboardPage = pathname?.startsWith('/dashboard/');
  const isPublicPageWithSidebar = pathname === '/classes' || pathname === '/schools';
  const hasSidebar = isDashboardPage || isPublicPageWithSidebar;
  
  // Detectar el estado del sidebar
  useEffect(() => {
    if (!hasSidebar) {
      setSidebarWidth(0);
      setIsSidebarCollapsed(false);
      return;
    }

    const updateSidebarState = () => {
      // Intentar encontrar el sidebar según la página
      let sidebarId = '';
      if (pathname === '/classes' || pathname === '/schools') {
        sidebarId = 'public-sidebar';
      } else if (pathname?.startsWith('/dashboard/student')) {
        sidebarId = 'student-sidebar';
      } else if (pathname?.startsWith('/dashboard/school')) {
        sidebarId = 'school-sidebar';
      } else if (pathname?.startsWith('/dashboard/instructor')) {
        sidebarId = 'instructor-sidebar';
      } else if (pathname?.startsWith('/dashboard/admin')) {
        sidebarId = 'admin-sidebar';
      }

      if (sidebarId) {
        const sidebar = document.getElementById(sidebarId) as HTMLElement;
        if (sidebar) {
          const isCollapsed = sidebar.getAttribute('data-collapsed') === 'true';
          const width = isCollapsed ? 80 : 256;
          setSidebarWidth(width);
          setIsSidebarCollapsed(isCollapsed);
        }
      }
    };

    updateSidebarState();
    const interval = setInterval(updateSidebarState, 100);
    const observer = new MutationObserver(updateSidebarState);
    
    let sidebarId = '';
    if (pathname === '/classes' || pathname === '/schools') {
      sidebarId = 'public-sidebar';
    } else if (pathname?.startsWith('/dashboard/student')) {
      sidebarId = 'student-sidebar';
    } else if (pathname?.startsWith('/dashboard/school')) {
      sidebarId = 'school-sidebar';
    } else if (pathname?.startsWith('/dashboard/instructor')) {
      sidebarId = 'instructor-sidebar';
    } else if (pathname?.startsWith('/dashboard/admin')) {
      sidebarId = 'admin-sidebar';
    }
    
    if (sidebarId) {
      const sidebar = document.getElementById(sidebarId);
      if (sidebar) {
        observer.observe(sidebar, { attributes: true, attributeFilter: ['data-collapsed'] });
      }
    }

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, [pathname, hasSidebar]);
  
  const handleToggleMenu = () => setIsMenuOpen((prev) => !prev);
  
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut({ callbackUrl: "/", redirect: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setIsSigningOut(false);
    }
  };
  
  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);
  
  // Prevenir scroll cuando el menú está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);
  
  const isActive = (href: string) => {
    if (href === '/') return pathname === href;
    return pathname?.startsWith(href);
  };
  
  // Calcular el margen izquierdo solo en desktop y cuando hay sidebar
  const headerMarginLeft = hasSidebar && typeof window !== 'undefined' && window.innerWidth >= 1024 
    ? `${sidebarWidth}px` 
    : '0';
  
  // Calcular el ancho del contenedor para que se ajuste al sidebar
  const containerWidth = hasSidebar && typeof window !== 'undefined' && window.innerWidth >= 1024
    ? `calc(100% - ${sidebarWidth}px)`
    : '100%';
  
  return (
    <header 
      className={containerClass}
      style={{ 
        marginLeft: headerMarginLeft,
        width: containerWidth,
        transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out'
      }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
              <Image 
                src="/logoclasedesusrf.png" 
                alt="clasesde.pe" 
                width={40} 
                height={40} 
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>
          </Link>
          <nav className="hidden lg:flex items-center space-x-8">
            {baseLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass}>
                {link.label}
              </Link>
            ))}
            {roleLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`flex items-center space-x-1 ${navLinkClass}`}>
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
          <div className="hidden lg:flex items-center space-x-4">
            {session ? (
              <>
                <span className="text-sm text-[#F6F7F8]/80">{(session as any).user?.name}</span>
                <Button variant="outline" size="sm" className={headerOutlineButtonClass} onClick={handleSignOut} disabled={isSigningOut}>
                  {isSigningOut ? 'Cerrando...' : 'Cerrar sesión'}
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm" className={headerOutlineButtonClass}>
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm" className={primaryButtonClass}>
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>
          {/* Botón hamburguesa - solo para menú móvil (pantallas < 1024px) */}
          <button 
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"} 
            className="lg:hidden p-2 rounded-lg text-[#F6F7F8] hover:text-[#FF3366] hover:bg-white/10 transition-all duration-200 active:scale-95" 
            onClick={handleToggleMenu}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        {/* Mobile Menu - Slide Down Animation (solo en pantallas < 1024px) */}
        <div 
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
          }`}
        >
          <div className={`pb-4 ${mobileSectionBorderClass}`}>
            <nav className="flex flex-col space-y-1 mt-4">
              {/* Base Navigation Links */}
              {baseLinks.map((link) => {
                const IconComponent = link.icon;
                const active = isActive(link.href);
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-white/10 text-[#FF3366] shadow-sm'
                        : 'text-[#F6F7F8]/80 hover:text-[#FF3366] hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg transition-all duration-200 ${
                        active 
                          ? 'bg-[#FF3366]/20 text-[#FF3366]' 
                          : 'bg-white/5 text-[#F6F7F8]/60 group-hover:bg-white/10 group-hover:text-[#FF3366]'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{link.label}</span>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${
                      active ? 'text-[#FF3366]' : 'text-[#F6F7F8]/40 group-hover:translate-x-1'
                    }`} />
                </Link>
                );
              })}
              
              {/* Role-specific Dashboard Link */}
              {roleLinks.map((link) => {
                const active = isActive(link.href);
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-white/10 text-[#FF3366] shadow-sm'
                        : 'text-[#F6F7F8]/80 hover:text-[#FF3366] hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg transition-all duration-200 ${
                        active 
                          ? 'bg-[#FF3366]/20 text-[#FF3366]' 
                          : 'bg-white/5 text-[#F6F7F8]/60 group-hover:bg-white/10 group-hover:text-[#FF3366]'
                      }`}>
                  {link.icon}
                      </div>
                      <span className="font-medium">{link.label}</span>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${
                      active ? 'text-[#FF3366]' : 'text-[#F6F7F8]/40 group-hover:translate-x-1'
                    }`} />
                </Link>
                );
              })}
              
              {/* User Section */}
              {session ? (
                <div className={`flex flex-col space-y-3 pt-4 mt-4 ${mobileSectionBorderClass}`}>
                  {/* User Info Card */}
                  <div className="flex items-center space-x-3 px-4 py-3 bg-white/5 rounded-xl backdrop-blur-sm">
                    <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                      <Image 
                        src="/logoclasedesusrf.png" 
                        alt="clasesde.pe" 
                        width={40} 
                        height={40} 
                        className="w-full h-full object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {(session as any).user?.name}
                      </p>
                      <p className="text-xs text-[#F6F7F8]/60 truncate">
                        {(session as any).user?.email}
                      </p>
                    </div>
                  </div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 border border-white/20"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">
                      {isSigningOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                    </span>
                  </button>
                </div>
              ) : (
                <div className={`flex flex-col space-y-3 pt-4 mt-4 ${mobileSectionBorderClass}`}>
                  <Link 
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 active:scale-95 border border-white/20"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Iniciar Sesión</span>
                  </Link>
                  <Link 
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-[#FF3366] to-[#D12352] hover:from-[#D12352] hover:to-[#FF3366] text-white rounded-xl transition-all duration-200 active:scale-95 shadow-lg"
                  >
                    <span className="font-medium">Registrarse</span>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};