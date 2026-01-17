"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  // Admin icons
  BarChart3,
  Users,
  Calendar,
  CreditCard,
  FileText,
  Settings,
  Tag,
  // Instructor icons
  BookOpen,
  DollarSign,
  // School icons
  GraduationCap
} from "lucide-react";

type RoleOption = "STUDENT" | "INSTRUCTOR" | "SCHOOL_ADMIN" | "ADMIN" | undefined;

const navLinkClass = "text-[#F6F7F8]/80 hover:text-[#FF3366] transition-colors";
const headerOutlineButtonClass = "!bg-transparent !text-white !border-white/30 hover:!text-[#011627] hover:!bg-white/10 focus:!bg-white/10";
const primaryButtonClass = "bg-gradient-to-r from-[#FF3366] to-[#D12352] hover:from-[#D12352] hover:to-[#FF3366]";
const containerClass = "bg-[#011627]/95 backdrop-blur-sm shadow-lg sticky top-0 z-[60] border-b border-white/10";
const mobileSectionBorderClass = "border-t border-white/10";

// Base navigation links (solo para usuarios no autenticados)
const baseLinks = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/classes", label: "Clases", icon: Waves },
  { href: "/schools", label: "Escuelas", icon: School },
  { href: "/contact", label: "Contacto", icon: Mail }
];

// Role-specific navigation items
const roleNavigationMap: Record<Exclude<RoleOption, undefined>, { href: string; icon: React.ComponentType<{ className?: string }>; label: string }[]> = {
  ADMIN: [
    { href: "/dashboard/admin", icon: Home, label: "Dashboard" },
    { href: "/dashboard/admin/overview", icon: BarChart3, label: "Overview" },
    { href: "/dashboard/admin/users", icon: Users, label: "Usuarios" },
    { href: "/dashboard/admin/schools", icon: School, label: "Escuelas" },
    { href: "/dashboard/admin/classes", icon: Waves, label: "Clases" },
    { href: "/dashboard/admin/reservations", icon: Calendar, label: "Reservas" },
    { href: "/dashboard/admin/payments", icon: CreditCard, label: "Pagos" },
    { href: "/dashboard/admin/discounts", icon: Tag, label: "Descuentos" },
    { href: "/dashboard/admin/reports", icon: FileText, label: "Reportes" },
    { href: "/dashboard/admin/settings", icon: Settings, label: "Configuración" },
  ],
  SCHOOL_ADMIN: [
    { href: "/dashboard/school", icon: Home, label: "Dashboard" },
    { href: "/dashboard/school/classes", icon: Waves, label: "Clases" },
    { href: "/dashboard/school/instructors", icon: GraduationCap, label: "Instructores" },
    { href: "/dashboard/school/students", icon: Users, label: "Estudiantes" },
    { href: "/dashboard/school/calendar", icon: Calendar, label: "Calendario" },
    { href: "/dashboard/school/reservations", icon: Calendar, label: "Reservas" },
    { href: "/dashboard/school/payments", icon: CreditCard, label: "Pagos" },
    { href: "/dashboard/school/profile", icon: Settings, label: "Perfil" },
  ],
  INSTRUCTOR: [
    { href: "/dashboard/instructor", icon: Home, label: "Dashboard" },
    { href: "/dashboard/instructor/profile", icon: User, label: "Mi Perfil" },
    { href: "/dashboard/instructor/classes", icon: BookOpen, label: "Mis Clases" },
    { href: "/dashboard/instructor/students", icon: Users, label: "Estudiantes" },
    { href: "/dashboard/instructor/earnings", icon: DollarSign, label: "Ganancias" },
  ],
  STUDENT: [
    { href: "/dashboard/student", icon: Home, label: "Dashboard" },
    { href: "/classes", icon: Waves, label: "Clases" },
    { href: "/reservations", icon: Calendar, label: "Mis Reservas" },
    { href: "/dashboard/student/profile", icon: User, label: "Mi Perfil" },
  ],
};

export const Header = (): JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [visibleItems, setVisibleItems] = useState<number>(5);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const role = (session as any)?.user?.role as RoleOption;
  
  const roleLinks = useMemo(() => {
    if (!role || !roleNavigationMap[role as Exclude<RoleOption, undefined>]) return [];
    return roleNavigationMap[role as Exclude<RoleOption, undefined>];
  }, [role]);

  // Calcular cuántos items caben en el navbar
  useEffect(() => {
    const calculateVisibleItems = () => {
      if (!navRef.current || !session) return;
      
      const navWidth = navRef.current.offsetWidth;
      const itemWidth = 140; // Ancho aproximado de cada item con texto
      const moreButtonWidth = 100; // Ancho del botón "Más"
      const userActionsWidth = 300; // Ancho de las acciones de usuario
      const logoWidth = 200; // Ancho del logo y padding
      
      const availableWidth = navWidth - logoWidth - userActionsWidth - moreButtonWidth - 40; // 40px de padding
      const maxItems = Math.floor(availableWidth / itemWidth);
      
      setVisibleItems(Math.max(3, Math.min(maxItems, roleLinks.length))); // Mínimo 3, máximo todos
    };

    calculateVisibleItems();
    window.addEventListener('resize', calculateVisibleItems);
    return () => window.removeEventListener('resize', calculateVisibleItems);
  }, [session, roleLinks.length]);
  
  // Cerrar menú "Más" al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };

    if (moreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [moreMenuOpen]);
  
  const handleToggleMenu = () => setIsMenuOpen((prev) => !prev);
  
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      // Use a timeout to force redirect if signOut hangs
      await Promise.race([
        signOut({ redirect: false, callbackUrl: '/' }),
        new Promise((resolve) => setTimeout(resolve, 1000))
      ]);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Always force a hard navigate to clear client state completely
      window.location.href = '/';
    }
  };
  
  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false);
    setMoreMenuOpen(false);
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

  // Dividir links en visibles y ocultos
  const visibleLinks = session ? roleLinks.slice(0, visibleItems) : baseLinks.slice(0, visibleItems);
  const hiddenLinks = session ? roleLinks.slice(visibleItems) : baseLinks.slice(visibleItems);
  
  return (
    <header className={containerClass}>
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
          
          {/* Desktop Navigation */}
          <nav ref={navRef} className="hidden lg:flex items-center space-x-2 flex-1 justify-center">
            {/* Links visibles con texto */}
            {visibleLinks.map((link) => {
              const IconComponent = link.icon;
              const active = isActive(link.href);
              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                    active 
                      ? 'text-[#FF3366] bg-white/10' 
                      : navLinkClass
                  }`}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              );
            })}

            {/* Botón "Más" para opciones adicionales */}
            {hiddenLinks.length > 0 && (
              <div className="relative" ref={moreMenuRef}>
                <button
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                    moreMenuOpen
                      ? 'text-[#FF3366] bg-white/10'
                      : navLinkClass
                  }`}
                >
                  <MoreHorizontal className="w-4 h-4" />
                  <span className="text-sm font-medium">Más</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {moreMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-[100] min-w-[200px] py-2 animate-fade-in">
                    {hiddenLinks.map((link) => {
                      const IconComponent = link.icon;
                      const active = isActive(link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMoreMenuOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-3 transition-all duration-200 ${
                            active
                              ? 'bg-[#FF3366]/10 text-[#FF3366]'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                          <span className="font-medium text-sm">{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </nav>
          
          {/* Desktop User Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {session ? (
              <>
                <span className="text-sm text-[#F6F7F8]/80 truncate max-w-[200px]">
                  {(session as any).user?.email || (session as any).user?.name}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={headerOutlineButtonClass} 
                  onClick={handleSignOut} 
                  disabled={isSigningOut}
                >
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
          
          {/* Mobile Menu Button */}
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
        
        {/* Mobile Menu - Slide Down Animation */}
        <div 
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
          }`}
        >
          <div className={`pb-4 ${mobileSectionBorderClass}`}>
            <nav className="flex flex-col space-y-1 mt-4">
              {/* Navigation Links */}
              {(session ? roleLinks : baseLinks).map((link) => {
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
