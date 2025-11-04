"use client";

import { useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

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
      label: "Mi Dashboard"
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
  { href: "/", label: "Inicio" },
  { href: "/classes", label: "Clases" },
  { href: "/schools", label: "Escuelas" },
  { href: "/contact", label: "Contacto" }
];

export const Header = (): JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();
  const role = (session as any)?.user?.role as RoleOption;
  const roleLinks = useMemo(() => {
    if (!role || !roleLinkMap[role as Exclude<RoleOption, undefined>]) return [];
    return roleLinkMap[role as Exclude<RoleOption, undefined>];
  }, [role]);
  const handleToggleMenu = () => setIsMenuOpen((prev) => !prev);
  const handleSignOut = () => signOut({ callbackUrl: "/" });
  return (
    <header className={containerClass}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF3366] to-[#D12352] shadow-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">clasesde.pe</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
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
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <span className="text-sm text-[#F6F7F8]/80">{(session as any).user?.name}</span>
                <Button variant="outline" size="sm" className={headerOutlineButtonClass} onClick={handleSignOut}>
                  Cerrar sesión
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
          <button aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"} className="md:hidden p-2 rounded-md text-[#F6F7F8] hover:text-[#FF3366] hover:bg-white/10" onClick={handleToggleMenu}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        {isMenuOpen && (
          <div className={`md:hidden mt-4 pb-4 ${mobileSectionBorderClass}`}>
            <nav className="flex flex-col space-y-4 mt-4">
              {baseLinks.map((link) => (
                <Link key={link.href} href={link.href} className={navLinkClass}>
                  {link.label}
                </Link>
              ))}
              {roleLinks.map((link) => (
                <Link key={link.href} href={link.href} className={`flex.items-center space-x-2 ${navLinkClass}`}>
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
              {session ? (
                <div className={`flex flex-col space-y-2 pt-4 ${mobileSectionBorderClass.replace("border-white/10", "border-gray-200")}`}>
                  <span className="text-sm text-[#F6F7F8]/80 px-2">{(session as any).user?.name}</span>
                  <Button variant="outline" size="sm" className={`${headerOutlineButtonClass} w-full`} onClick={handleSignOut}>
                    Cerrar sesión
                  </Button>
                </div>
              ) : (
                <div className={`flex flex-col space-y-2 pt-4 ${mobileSectionBorderClass.replace("border-white/10", "border-gray-200")}`}>
                  <Link href="/login">
                    <Button variant="outline" size="sm" className={`${headerOutlineButtonClass} w-full`}>
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm" className={`${primaryButtonClass} w-full`}>
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};