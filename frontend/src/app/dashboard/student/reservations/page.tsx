'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  CreditCard,
  Eye,
  Star
} from 'lucide-react';

interface StudentReservation {
  id: number;
  classId: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'PAID';
  specialRequest?: string;
  createdAt: string;
  updatedAt: string;
  class: {
    id: number;
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    price: number;
    level: string;
    location: string;
    instructor: string;
    images?: string[];
  };
  payment?: {
    id: number;
    amount: number;
    status: string;
    paymentMethod: string;
    paidAt?: string;
  };
}

export default function StudentReservations() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reservations, setReservations] = useState<StudentReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'canceled'>('all');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.role !== 'STUDENT') {
      router.push('/dashboard/school');
      return;
    }

    fetchReservations();
  }, [session, status, router]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      
      const token = (session as any)?.backendToken;
      
      if (!token) {
        setReservations([]);
        setLoading(false);
        return;
      }
      
      const headers: any = {
        'Authorization': `Bearer ${token}`
      };

      const reservationsRes = await fetch('/api/reservations', { headers });

      if (!reservationsRes.ok) {
        throw new Error('Failed to fetch reservations');
      }

      const reservationsData = await reservationsRes.json();

      const processedReservations: StudentReservation[] = reservationsData.map((r: any) => ({
        id: r.id,
        classId: r.classId,
        status: r.status,
        specialRequest: r.specialRequest,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        class: {
          id: r.class?.id || 0,
          title: r.class?.title || 'Clase de Surf',
          description: r.class?.description || '',
          date: r.class?.date || new Date().toISOString(),
          startTime: new Date(r.class?.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          endTime: new Date(new Date(r.class?.date).getTime() + (r.class?.duration || 120) * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          duration: r.class?.duration || 120,
          price: Number(r.class?.price) || 0,
          level: r.class?.level || 'BEGINNER',
          location: r.class?.location || 'Por definir',
          instructor: r.class?.instructor || 'Instructor',
          images: r.class?.images || []
        },
        payment: r.payment ? {
          id: r.payment.id,
          amount: Number(r.payment.amount),
          status: r.payment.status,
          paymentMethod: r.payment.paymentMethod || 'N/A',
          paidAt: r.payment.paidAt
        } : undefined
      }));

      setReservations(processedReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to cancel a reservation
  const cancelReservation = async (reservationId: number) => {
    try {
      const token = (session as any)?.backendToken;
      const res = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'CANCELED' })
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Error al cancelar reserva: ${err.message || res.statusText}`);
        return;
      }
      fetchReservations();
    } catch (e) {
      console.error('Cancel error', e);
      alert('Error inesperado al cancelar la reserva');
    }
  };

  // Render reservation cards
  const renderReservations = () => {
    if (reservations.length === 0) {
      return <p className="text-gray-600">No tienes reservas.</p>;
    }
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reservations.map((r) => {
          const canCancel = r.status !== 'CANCELED' && (!r.payment || r.payment.status !== 'PAID');
          return (
            <div key={r.id} className="bg-white rounded-lg shadow overflow-hidden flex flex-col justify-between">
              {/* Class Image */}
              <div className="h-40 w-full bg-gray-200 relative">
                {r.class.images && r.class.images.length > 0 ? (
                  <img 
                    src={r.class.images[0]} 
                    alt={r.class.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                    <span className="text-xs">Sin imagen</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 rounded text-xs font-bold shadow-sm">
                  {r.status}
                </div>
              </div>
              
              <div className="p-4 flex-grow">
                <h3 className="text-xl font-semibold mb-2 line-clamp-1">{r.class.title}</h3>
                <p className="text-gray-700 mb-2 text-sm line-clamp-2">{r.class.description}</p>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-center">
                    <span className="font-medium mr-2">Fecha:</span> 
                    {new Date(r.class.date).toLocaleDateString()}
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium mr-2">Hora:</span> 
                    {r.class.startTime} - {r.class.endTime}
                  </p>
                  {r.payment && (
                    <p className="flex items-center mt-2 pt-2 border-t border-gray-100">
                      <span className="font-medium mr-2">Pago:</span>
                      <span className={r.payment.status === 'PAID' ? 'text-green-600 font-medium' : 'text-orange-600'}>
                        {r.payment.status}
                      </span>
                    </p>
                  )}
                </div>
              </div>
              
              <div className="px-4 pb-4">
                {canCancel && (
                  <button
                    onClick={() => cancelReservation(r.id)}
                    className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition"
                  >
                    Cancelar reserva
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Reservas</h1>
        {renderReservations()}
      </div>
    </div>
  );
}