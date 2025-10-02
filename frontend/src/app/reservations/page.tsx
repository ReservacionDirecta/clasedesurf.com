"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ReservationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchReservations = async () => {
      setLoading(true);
      try {
        const token = (session as any)?.backendToken;
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/reservations`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setReservations(data);
        } else {
          throw new Error('Failed to fetch reservations');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchReservations();
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Mis Reservas</h1>

        {loading ? (
          <p className="dark:text-white">Cargando tus reservas...</p>
        ) : reservations.length === 0 ? (
          <p className="dark:text-gray-400">Aún no tienes ninguna reserva. ¡Encuentra tu próxima clase en la página principal!</p>
        ) : (
          <div className="space-y-4">
            {reservations.map(reservation => (
              <div key={reservation.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{reservation.class.title}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(reservation.class.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      reservation.status === 'CONFIRMED' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                      reservation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {reservation.status}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ID Reserva: {reservation.id}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}