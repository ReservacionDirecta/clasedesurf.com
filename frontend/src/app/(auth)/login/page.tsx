'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Waves, AlertCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { error: showErrorToast, handleError } = useNotifications();
  
  // Check if user was redirected due to expired token
  const isExpired = searchParams?.get('expired') === 'true';
  const [sessionCleared, setSessionCleared] = useState(false);
  
  // Función para limpiar cookies del cliente
  const clearClientCookies = () => {
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
  };
  
  useEffect(() => {
    // Si la sesión expiró, limpiar todo automáticamente
    if (isExpired && !sessionCleared) {
      const cleanupSession = async () => {
        try {
          // Limpiar cookies
          clearClientCookies();
          
          // Limpiar storage
          try {
            localStorage.clear();
            sessionStorage.clear();
          } catch (e) {
            console.warn('Error clearing storage:', e);
          }
          
          // Intentar cerrar sesión de forma silenciosa
          try {
            await signOut({ redirect: false });
          } catch (e) {
            console.warn('Error during silent signOut:', e);
          }
          
          setSessionCleared(true);
        } catch (error) {
          console.error('Error cleaning up expired session:', error);
          setSessionCleared(true);
        }
      };
      
      cleanupSession();
      setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      showErrorToast('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    }
  }, [isExpired, sessionCleared, showErrorToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        const errorMessage = result.error === 'CredentialsSignin' 
          ? 'Credenciales inválidas. Por favor, verifica tu email y contraseña.'
          : result.error;
        setError(errorMessage);
        showErrorToast(errorMessage);
      } else if (result?.ok) {
        // Check for callbackUrl
        const callbackUrl = searchParams?.get('callbackUrl');

        if (callbackUrl) {
          router.push(callbackUrl);
          return;
        }

        // Get user session to determine role-based redirect
        try {
          const response = await fetch('/api/auth/session');
          const session = await response.json();

          if (session?.user?.role) {
            switch (session.user.role) {
              case 'ADMIN':
                router.push('/dashboard/admin');
                break;
              case 'SCHOOL_ADMIN':
                router.push('/dashboard/school');
                break;
              case 'INSTRUCTOR':
                router.push('/dashboard/instructor');
                break;
              case 'STUDENT':
              default:
                router.push('/dashboard/student/profile');
                break;
            }
          } else {
            // Fallback to student dashboard if role is not available
            router.push('/dashboard/student/profile');
          }
        } catch (error) {
          console.error('Error getting session:', error);
          // Fallback to student dashboard on error
          router.push('/dashboard/student/profile');
        }
      }
    } catch (err) {
      handleError(err, 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
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
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
            <Waves className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido de vuelta</h1>
          <p className="text-gray-600">Inicia sesión para continuar</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Expired Session Message */}
              {isExpired && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">
                      Tu sesión ha expirado
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Por favor, inicia sesión nuevamente para continuar.
                    </p>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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
                    placeholder="Tu contraseña"
                    required
                    disabled={isLoading}
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
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="ml-3 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Forgot Password Link */}
              <div className="flex items-center justify-end">
                <Link 
                  href="/register" 
                  className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg transition-all transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isLoading
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
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O también puedes</span>
              </div>
            </div>

            {/* Google Auth Button */}
            <div className="mb-6">
              <GoogleAuthButton 
                variant="outline"
                size="md"
                className="w-full"
                text="Continuar con Google"
              />
            </div>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes una cuenta?{" "}
                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Al iniciar sesión, aceptas nuestros{" "}
            <a href="#" className="text-blue-600 hover:underline">Términos de Servicio</a>
            {" "}y{" "}
            <a href="#" className="text-blue-600 hover:underline">Política de Privacidad</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg animate-pulse">
            <Waves className="w-10 h-10 text-white" />
          </div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
