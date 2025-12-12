'use client';

import { useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/config/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage('Si el correo existe, recibirás instrucciones para restablecer tu contraseña.');
    } catch (err: any) {
        // Show success message regardless of actual result to prevent email enumeration
        setMessage('Si el correo existe, recibirás instrucciones para restablecer tu contraseña.');
        console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg w-full max-w-md">
        <h3 className="text-2xl font-bold text-center">Recuperar Contraseña</h3>
        <p className="text-sm text-gray-600 text-center mt-2">
            Ingresa tu email y te enviaremos un enlace de recuperación.
        </p>
        
        {message ? (
             <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
                 {message}
                 <div className="mt-4 text-center">
                    <Link href="/login" className="text-sm text-blue-600 hover:underline">
                        Volver al login
                    </Link>
                 </div>
             </div>
        ) : (
            <form onSubmit={handleSubmit}>
            <div className="mt-4">
                <div>
                <label className="block text-sm" htmlFor="email">Email</label>
                <input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <div className="flex flex-col gap-4 mt-6">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 disabled:opacity-50"
                >
                    {loading ? 'Enviando...' : 'Enviar enlace'}
                </button>
                 <Link href="/login" className="text-sm text-blue-600 hover:underline text-center">
                    Volver al login
                </Link>
                </div>
            </div>
            </form>
        )}
      </div>
    </div>
  );
}
