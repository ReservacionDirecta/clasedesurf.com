'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/config/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden");
        return;
    }
    if (!token) {
        setError("Token no válido");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Error al restablecer contraseña');
      }

      setSuccess(true);
      setTimeout(() => {
          router.push('/login');
      }, 3000);
    } catch (err: any) {
        setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (!token) {
       return <div className="text-red-500 text-center">Token no proporcionado. Revisa tu enlace de correo.</div>;
  }

  return (
        <div>
        {success ? (
             <div className="text-center">
                 <div className="p-4 bg-green-50 text-green-700 rounded-md mb-4">
                     Contraseña actualizada exitosamente.
                 </div>
                 <p>Redirigiendo al login...</p>
             </div>
        ) : (
            <form onSubmit={handleSubmit}>
            <div className="mt-4">
                <div className="mb-4">
                    <label className="block text-sm" htmlFor="password">Nueva Contraseña</label>
                    <input
                        type="password"
                        className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm" htmlFor="confirmPassword">Confirmar Contraseña</label>
                    <input
                        type="password"
                        className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                 <div className="flex flex-col gap-4 mt-6">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 disabled:opacity-50"
                >
                    {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
                </div>
            </div>
            </form>
        )}
      </div>
  );
}

export default function ResetPasswordPage() {
    return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg w-full max-w-md">
        <h3 className="text-2xl font-bold text-center">Restablecer Contraseña</h3>
        <Suspense fallback={<div>Cargando...</div>}>
            <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
    )
}
