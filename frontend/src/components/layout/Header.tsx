"use client"

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session } = useSession()

  const role = (session as any)?.user?.role;

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">Clase de Surf</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link href="#clases" className="text-gray-600 hover:text-blue-600 transition-colors">
              Clases
            </Link>
            <Link href="#instructores" className="text-gray-600 hover:text-blue-600 transition-colors">
              Instructores
            </Link>
            <Link href="#sobre-nosotros" className="text-gray-600 hover:text-blue-600 transition-colors">
              Sobre Nosotros
            </Link>

            {/* Role-specific dashboard links */}
            {session ? (
              <>
                {role === 'STUDENT' && (
                  <>
                    <Link href="/dashboard/student/profile" className="text-gray-600 hover:text-blue-600 transition-colors">
                      Mi Perfil
                    </Link>
                    <Link href="/dashboard/student/reservations" className="text-gray-600 hover:text-blue-600 transition-colors">
                      Mis Reservas
                    </Link>
                  </>
                )}
                {role === 'INSTRUCTOR' && (
                  <>
                    <Link href="/dashboard/instructor" className="text-gray-600 hover:text-blue-600 transition-colors">
                      Instructor
                    </Link>
                    <Link href="/dashboard/instructor/classes" className="text-gray-600 hover:text-blue-600 transition-colors">
                      Mis Clases
                    </Link>
                  </>
                )}
                {role === 'SCHOOL' && (
                  <>
                    <Link href="/dashboard/school" className="text-gray-600 hover:text-blue-600 transition-colors">
                      Escuela
                    </Link>
                    <Link href="/dashboard/school/classes" className="text-gray-600 hover:text-blue-600 transition-colors">
                      Clases Escuela
                    </Link>
                  </>
                )}
                {role === 'ADMIN' && (
                  <Link href="/dashboard/admin" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Admin
                  </Link>
                )}

                <Link href="#contacto" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Contacto
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard/admin/schools" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Escuelas
                </Link>
                <Link href="#contacto" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Contacto
                </Link>
              </>
            )}
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <span className="text-sm text-gray-700">{(session as any).user?.name}</span>
                <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4 mt-4">
              <Link href="#clases" className="text-gray-600 hover:text-blue-600 transition-colors">
                Clases
              </Link>
              <Link href="#instructores" className="text-gray-600 hover:text-blue-600 transition-colors">
                Instructores
              </Link>
              <Link href="#sobre-nosotros" className="text-gray-600 hover:text-blue-600 transition-colors">
                Sobre Nosotros
              </Link>
                {session ? (
                  <>
                    {role === 'STUDENT' && (
                      <>
                        <Link href="/dashboard/student/profile" className="text-gray-600 hover:text-blue-600 transition-colors">
                          Mi Perfil
                        </Link>
                        <Link href="/dashboard/student/reservations" className="text-gray-600 hover:text-blue-600 transition-colors">
                          Mis Reservas
                        </Link>
                      </>
                    )}
                    {role === 'INSTRUCTOR' && (
                      <>
                        <Link href="/dashboard/instructor" className="text-gray-600 hover:text-blue-600 transition-colors">
                          Instructor
                        </Link>
                        <Link href="/dashboard/instructor/classes" className="text-gray-600 hover:text-blue-600 transition-colors">
                          Mis Clases
                        </Link>
                      </>
                    )}
                    {role === 'SCHOOL' && (
                      <>
                        <Link href="/dashboard/school" className="text-gray-600 hover:text-blue-600 transition-colors">
                          Escuela
                        </Link>
                        <Link href="/dashboard/school/classes" className="text-gray-600 hover:text-blue-600 transition-colors">
                          Clases Escuela
                        </Link>
                      </>
                    )}
                    {role === 'ADMIN' && (
                      <Link href="/dashboard/admin" className="text-gray-600 hover:text-blue-600 transition-colors">
                        Admin
                      </Link>
                    )}
                    <Link href="#contacto" className="text-gray-600 hover:text-blue-600 transition-colors">
                      Contacto
                    </Link>
                    <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                      <Button variant="outline" size="sm" className="w-full" onClick={() => signOut({ callbackUrl: '/' })}>
                        Cerrar sesión
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/dashboard/admin/schools" className="text-gray-600 hover:text-blue-600 transition-colors">
                      Escuelas
                    </Link>
                    <Link href="/dashboard/student/profile" className="text-gray-600 hover:text-blue-600 transition-colors">
                      Mi Perfil
                    </Link>
                    <Link href="#contacto" className="text-gray-600 hover:text-blue-600 transition-colors">
                      Contacto
                    </Link>
                    <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                      <Link href="/login">
                        <Button variant="outline" size="sm" className="w-full">
                          Iniciar Sesión
                        </Button>
                      </Link>
                      <Link href="/register">
                        <Button variant="primary" size="sm" className="w-full">
                          Registrarse
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}