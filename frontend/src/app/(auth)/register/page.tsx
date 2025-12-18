'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, Waves } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';

type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'SCHOOL_ADMIN';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(9);
  const router = useRouter();
  const { notifySuccess, error: showErrorToast, handleError } = useNotifications();
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [schools, setSchools] = useState<{id: number, name: string}[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');

  useEffect(() => {
    // Cargar lista de escuelas para el selector
    const fetchSchools = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
        const res = await fetch(`${baseUrl}/schools`);
        if (res.ok) {
          const data = await res.json();
          setSchools(data);
        }
      } catch (err) {
        console.error('Error loading schools:', err);
      }
    };
    fetchSchools();
  }, []);

  const getDashboardPath = (userRole: string) => {
    switch (userRole) {
      case 'ADMIN':
        return '/dashboard/admin';
      case 'SCHOOL_ADMIN':
        return '/dashboard/school';
      case 'INSTRUCTOR':
        return '/dashboard/instructor';
      case 'STUDENT':
      default:
        return '/dashboard/student/profile';
    }
  };

  // Limpiar intervalos cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsRedirecting(false);
    setCountdown(9);
    setIsLoading(true);

    try {
      // Post to the frontend API proxy so client-side calls are routed correctly
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role,
          schoolId: (role === 'STUDENT' && selectedSchoolId) ? selectedSchoolId : undefined
        }),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (e) {
        // response was not JSON — read as text
        const txt = await response.text();
        data = { message: txt };
      }

      if (!response.ok) {
        const errorMessage = data?.message || 'Error al registrar usuario';
        setError(errorMessage);
        showErrorToast(errorMessage);
      } else {
        const successMessage = '¡Registro exitoso! Serás redirigido en breve...';
        setSuccess(successMessage);
        notifySuccess('¡Registro exitoso!', 'Tu cuenta ha sido creada correctamente. Redirigiendo...');
        setIsRedirecting(true);

        // Intentar iniciar sesión automáticamente
        try {
          const loginResult = await signIn('credentials', {
            redirect: false,
            email,
            password,
          });

          if (loginResult?.ok) {
            // Obtener la sesión para determinar el rol
            try {
              const sessionResponse = await fetch('/api/auth/session');
              const session = await sessionResponse.json();
              
              const dashboardPath = getDashboardPath(session?.user?.role || role);
              
              // Limpiar intervalo anterior si existe
              if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
              }
              
              // Esperar 9 segundos antes de redirigir
              setCountdown(9);
              let remainingSeconds = 9;
              countdownIntervalRef.current = setInterval(() => {
                remainingSeconds--;
                setCountdown(remainingSeconds);
                if (remainingSeconds <= 0) {
                  if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                    countdownIntervalRef.current = null;
                  }
                  router.push(dashboardPath);
                }
              }, 1000);
            } catch (sessionError) {
              console.error('Error obteniendo sesión:', sessionError);
              // Si falla, redirigir al login después de 9 segundos
              if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
              }
              setCountdown(9);
              let remainingSeconds = 9;
              countdownIntervalRef.current = setInterval(() => {
                remainingSeconds--;
                setCountdown(remainingSeconds);
                if (remainingSeconds <= 0) {
                  if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                    countdownIntervalRef.current = null;
                  }
                  router.push('/login');
                }
              }, 1000);
            }
          } else {
            // Si el login automático falla, redirigir al login después de 9 segundos
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            setCountdown(9);
            let remainingSeconds = 9;
            countdownIntervalRef.current = setInterval(() => {
              remainingSeconds--;
              setCountdown(remainingSeconds);
              if (remainingSeconds <= 0) {
                if (countdownIntervalRef.current) {
                  clearInterval(countdownIntervalRef.current);
                  countdownIntervalRef.current = null;
                }
                router.push('/login');
              }
            }, 1000);
          }
        } catch (loginError) {
          console.error('Error en login automático:', loginError);
          // Si hay error, redirigir al login después de 9 segundos
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          setCountdown(9);
          let remainingSeconds = 9;
          countdownIntervalRef.current = setInterval(() => {
            remainingSeconds--;
            setCountdown(remainingSeconds);
            if (remainingSeconds <= 0) {
              if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
              }
              router.push('/login');
            }
          }, 1000);
        }
      }
    } catch (err) {
      handleError(err, 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    {
      value: 'STUDENT' as UserRole,
      label: 'Estudiante',
      description: 'Quiero aprender a surfear',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      value: 'INSTRUCTOR' as UserRole,
      label: 'Instructor',
      description: 'Soy instructor de surf',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'from-green-500 to-emerald-500'
    },
    {
      value: 'SCHOOL_ADMIN' as UserRole,
      label: 'Escuela',
      description: 'Represento una escuela de surf',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Botón Volver */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Volver al inicio</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-linear-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
            <Waves className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Únete a ClaseDeSurf</h1>
          <p className="text-gray-600">Crea tu cuenta y comienza tu aventura</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            
            {/* Google Auth Button */}
            <div className="mb-6">
              <GoogleAuthButton 
                variant="outline"
                size="md"
                className="w-full"
                text="Registrarse con Google"
                role={role}
              />
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">O completa el formulario</span>
                </div>
              </div>
            </div>
            
            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                ¿Cuál es tu perfil?
              </label>
              <div className="grid grid-cols-1 gap-3">
                {roleOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                      role === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={role === option.value}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="sr-only"
                    />
                    <div className={`shrink-0 w-12 h-12 rounded-lg bg-linear-to-r ${option.color} flex items-center justify-center text-white mr-4`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                    {role === option.value && (
                      <div className="shrink-0">
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* School Selection for Students */}
            {role === 'STUDENT' && schools.length > 0 && (
              <div className="mb-6 animate-fadeIn">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escuela Principal (Opcional)
                </label>
                <div className="relative">
                  <select
                    value={selectedSchoolId}
                    onChange={(e) => setSelectedSchoolId(e.target.value)}
                    className="block w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                  >
                    <option value="">Seleccionar escuela...</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Estarás asignado a esta escuela, lo que facilita la gestión de tus clases, pero podrás reservar en cualquier otra escuela de la plataforma.
                </p>
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">
                  Nombre Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Tu nombre completo"
                    required
                    disabled={isLoading || isRedirecting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="tu@email.com"
                    required
                    disabled={isLoading || isRedirecting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Mínimo 8 caracteres"
                    required
                    minLength={8}
                    disabled={isLoading || isRedirecting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">La contraseña debe tener al menos 8 caracteres</p>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-3 text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-green-800">{success}</p>
                    {isRedirecting && (
                      <p className="mt-1 text-sm text-green-700">
                        Redirigiendo en <span className="font-semibold">{countdown}</span> segundo{countdown !== 1 ? 's' : ''}...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isRedirecting}
              className={`w-full mt-6 px-6 py-3 bg-linear-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg transition-all transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isLoading || isRedirecting
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:from-blue-700 hover:to-cyan-700 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </span>
              ) : isRedirecting ? (
                `Redirigiendo en ${countdown}s...`
              ) : (
                'Crear Cuenta'
              )}
            </button>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Inicia Sesión
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Al crear una cuenta, aceptas nuestros{" "}
            <a href="#" className="text-blue-600 hover:underline">Términos de Servicio</a>
            {" "}y{" "}
            <a href="#" className="text-blue-600 hover:underline">Política de Privacidad</a>
          </p>
        </div>
      </div>
    </div>
  );
}
