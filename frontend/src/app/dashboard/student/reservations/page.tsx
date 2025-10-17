'use client';

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
      
      // Debug logging
      console.log('Session:', session);
      console.log('Token exists:', !!token);
      
      if (!token) {
        console.error('No backend token found in session');
        setReservations([]);
        setLoading(false);
        return;
      }
      
      const headers: any = {
        'Authorization': `Bearer ${token}`
      };

      // Fetch real reservations from backend
      const reservationsRes = await fetch('/api/reservations', { headers });

      if (!reservationsRes.ok) {
        throw new Error('Failed to fetch reservations');
      }

      const reservationsData = await reservationsRes.json();

      // Process reservations to match the expected format
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
          instructor: r.class?.instructor || 'Instructor'
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
      setLoading(false);

      // Fallback to mock data if no real data
      if (processedReservations.length === 0) {
        const mockReservations: StudentReservation[] = [
        {
          id: 1,
          classId: 25,
          status: 'CONFIRMED',
          specialRequest: 'Primera vez surfeando, necesito ayuda extra',
          createdAt: '2025-01-10T10:00:00.000Z',
          updatedAt: '2025-01-10T10:00:00.000Z',
          class: {
            id: 25,
            title: 'Iniciación en Miraflores',
            description: 'Clase perfecta para principiantes',
            date: '2025-01-15T13:00:00.000Z',
            startTime: '13:00',
            endTime: '15:00',
            duration: 120,
            price: 25,
            level: 'BEGINNER',
            location: 'Playa Makaha, Miraflores',
            instructor: 'Carlos Mendoza'
          },
          payment: {
            id: 1,
            amount: 25,
            status: 'PAID',
            paymentMethod: 'credit_card',
            paidAt: '2025-01-10T15:30:00.000Z'
          }
        }
      ];

        setReservations(mockReservations);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tus reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Reservas</h1>
        {/* Contenido de reservas aquí */}
      </div>
    </div>
  );
}