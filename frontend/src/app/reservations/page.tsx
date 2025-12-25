'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PaymentUpload from '@/components/payments/PaymentUpload';
import { formatDualCurrency } from '@/lib/currency';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

interface Class {
  id: number;
  title: string;
  description: string;
  date: string;
  startTime?: string;
  endTime?: string;
  duration?: number; // Duration in minutes
  capacity: number;
  price: number;
  level: string;
  school: {
    id: number;
    name: string;
  };
  images?: string[];
}

interface Reservation {
  id: number;
  classId: number;
  userId: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'PAID' | 'COMPLETED';
  specialRequest: string | null;
  createdAt: string;
  date: string;
  time: string;
  class: Class;
  payment?: {
    id: number;
    amount: number;
    originalAmount?: number;
    discountAmount?: number;
    status: string;
    paymentMethod: string;
    voucherImage?: string;
    voucherNotes?: string;
    paidAt?: string;
    discountCode?: {
      id: number;
      code: string;
    };
  };
}

export default function ReservationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchReservations();
    }
  }, [session]);

  const handleCancelReservation = async (reservation: Reservation) => {
    const isPaid = reservation.payment?.status === 'PAID';
    const actionTerm = isPaid ? 'suspender' : 'cancelar';
    const actionTermCap = isPaid ? 'Suspender' : 'Cancelar';

    // Confirmar acción
    if (!confirm(`¿Estás seguro de que deseas ${actionTerm} esta reserva? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const token = (session as any)?.backendToken;
      if (!token) {
        alert(`Debes estar autenticado para ${actionTerm} la reserva`);
        return;
      }

      setLoading(true);

      // Llamar a la API para cancelar la reserva
      const response = await fetch(`/api/reservations/${reservation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'CANCELED'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al ${actionTerm} la reserva`);
      }

      // Recargar las reservas para reflejar el cambio
      await fetchReservations();

      alert(`Reserva ${isPaid ? 'suspendida' : 'cancelada'} exitosamente`);
    } catch (error) {
      console.error(`Error al ${actionTerm} reserva:`, error);
      alert(error instanceof Error ? error.message : `Error al ${actionTerm} la reserva. Por favor, inténtalo de nuevo.`);
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);

      const token = (session as any)?.backendToken;

      if (!token) {
        console.error('No backend token found in session');
        setReservations([]);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/reservations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar reservas');
      }

      const data = await response.json();
      console.log('[Reservations] Raw data from API:', data);
      
      const processedData = data.map((res: any) => {
        if (!res.class) {
          console.warn('[Reservations] Reservation without class data:', res);
        }
        return {
          ...res,
          payment: res.payment || undefined
        };
      });
      
      setReservations(processedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredReservations = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const filtered = reservations.filter(reservation => {
      // Use reservation date if available, otherwise fallback to class date
      const dateStr = reservation.date || reservation.class?.date;
      
      if (!dateStr) {
        console.warn('[Reservations] Reservation missing date:', reservation);
        return false;
      }

      const resDate = new Date(dateStr);
      resDate.setHours(0, 0, 0, 0);

      if (filter === 'upcoming') {
        return reservation.status !== 'CANCELED' && (resDate >= now || reservation.status === 'PENDING' || reservation.status === 'CONFIRMED');
      } else if (filter === 'past') {
        return (resDate < now && reservation.status !== 'PENDING' && reservation.status !== 'CONFIRMED') || reservation.status === 'CANCELED';
      }
      return true;
    });

    console.log('[Reservations] Filter:', filter, 'Total:', reservations.length, 'Filtered:', filtered.length);
    return filtered;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELED: 'bg-red-100 text-red-800',
      PAID: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-blue-100 text-blue-800'
    };

    const labels = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmada',
      CANCELED: 'Cancelada',
      PAID: 'Pagado',
      COMPLETED: 'Completada'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReservationTime = (reservation: Reservation) => {
    if (reservation.time) return reservation.time.substring(0, 5);
    
    // Fallback to class time if reservation time is not set
    if (reservation.class?.date) {
        const classDate = new Date(reservation.class.date);
        return classDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    
    return '00:00';
  };

  const getReservationEndTime = (reservation: Reservation) => {
      const startTime = getReservationTime(reservation);
      const [hours, minutes] = startTime.split(':').map(Number);
      
      const duration = reservation.class?.duration || 120;
      const endDate = new Date();
      endDate.setHours(hours, minutes + duration);
      
      return endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getClassTimes = (classData: Class) => {
    // Calculate start and end times from date and duration
    // If date is missing, return fallback
    if (!classData.date) return { startTime: '00:00', endTime: '00:00' };

    const classDate = new Date(classData.date);
    const startTime = classDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });

    // Get duration from class data (assume 120 min if missing)
    const duration = (classData as any).duration || 120; 
    const endDate = new Date(classDate.getTime() + duration * 60000);
    const endTime = endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });

    return { startTime, endTime };
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reservas...</p>
        </div>
      </div>
    );
  }

  const filteredReservations = getFilteredReservations();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Mis Reservas</h1>
          <p className="mt-2 text-gray-600">
            Gestiona tus clases de surf reservadas
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Refresh Button */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => fetchReservations()}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Actualizar reservas"
          >
            <svg
              className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${filter === 'upcoming'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            Próximas
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${filter === 'past'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            Pasadas
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            Todas
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Reservations List */}
        {filteredReservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No hay reservas
            </h3>
            <p className="mt-2 text-gray-500">
              {filter === 'upcoming' && 'No tienes clases próximas reservadas.'}
              {filter === 'past' && 'No tienes clases pasadas.'}
              {filter === 'all' && 'Aún no has reservado ninguna clase.'}
            </p>
            <button
              onClick={() => router.push('/classes')}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Explorar Clases
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden group"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-gray-100">
                    <ImageWithFallback
                      src={reservation.class.images?.[0] || '/images/placeholder-class.jpg'}
                      alt={reservation.class.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {reservation.class?.title || 'Clase'}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {reservation.class?.school?.name || 'Escuela'}
                            </p>
                          </div>
                          {getStatusBadge(reservation.status)}
                        </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center text-gray-600">
                          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="capitalize">{formatDate(reservation.date || reservation.class?.date)}</span>
                        </div>

                        <div className="flex items-center text-gray-600">
                          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>
                            {getReservationTime(reservation)} - {getReservationEndTime(reservation)}
                          </span>
                        </div>


                        <div className="flex items-center text-gray-600">
                          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Nivel: {reservation.class.level}</span>
                        </div>

                        <div className="flex items-center text-gray-600">
                          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            {(() => {
                              const amount = reservation.payment?.amount !== undefined 
                                ? Number(reservation.payment.amount) 
                                : (Number(reservation.class?.price) || 0);
                              
                              const prices = formatDualCurrency(amount);
                              const isPaid = reservation.payment?.status === 'PAID';
                              
                                return (
                                  <div className="flex flex-col">
                                    <div className="flex items-baseline gap-1">
                                      <span className="font-semibold text-lg">{prices.pen}</span>
                                      <span className="text-xs text-gray-500">({prices.usd})</span>
                                    </div>
                                    <span className={`text-[10px] uppercase font-bold ${isPaid ? 'text-green-600' : 'text-gray-500'}`}>
                                      {isPaid ? 'Total Pagado' : 'Por Pagar'}
                                    </span>
                                  </div>
                                );
                            })()}
                          </div>
                        </div>
                      </div>

                      {reservation.specialRequest && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Solicitud especial:</span> {reservation.specialRequest}
                          </p>
                        </div>
                      )}

                      <p className="mt-4 text-sm text-gray-500">
                        Reservado el {new Date(reservation.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 border-t border-gray-200 pt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        setSelectedReservation(reservation);
                        setShowDetailsModal(true);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver Reserva
                    </button>

                    {reservation.status !== 'CANCELED' && (
                      <button
                        onClick={() => {
                          setSelectedReservation(reservation);
                          setShowPaymentModal(true);
                        }}
                        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${reservation.payment?.status === 'PAID'
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {reservation.payment?.status === 'PAID' ? 'Ver Pago' : 'Pagar'}
                      </button>
                    )}

                    <button
                      onClick={() => router.push(`/classes/${reservation.classId}`)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Ver Clase
                    </button>

                    {reservation.status !== 'CANCELED' && reservation.status !== 'COMPLETED' && (
                      (() => {
                        const dateStr = reservation.date || reservation.class.date; // Use specific date or fallback
                        const resDate = new Date(dateStr);
                        resDate.setHours(0,0,0,0);
                        const now = new Date();
                        now.setHours(0,0,0,0);
                        
                        if (resDate < now) return null; // Don't show for past events

                        const isPaid = reservation.payment?.status === 'PAID';

                        return (
                          <button
                            onClick={() => handleCancelReservation(reservation)}
                            disabled={loading}
                            className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              isPaid 
                                ? 'border-orange-300 text-orange-700 bg-white hover:bg-orange-50' 
                                : 'border-red-300 text-red-700 bg-white hover:bg-red-50'
                            }`}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {isPaid ? 'Suspender Clase' : 'Cancelar Reserva'}
                          </button>
                        );
                      })()
                    )}
                  </div>
                </div>
               </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalles de Reserva */}
      {showDetailsModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-linear-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg sticky top-0 z-10">
              <h2 className="text-2xl font-bold">Detalles de la Reserva #{selectedReservation.id}</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedReservation(null);
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Status Badge */}
              <div className="mb-6">
                {getStatusBadge(selectedReservation.status)}
              </div>

              {/* Class Information */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Información de la Clase</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tí­tulo</p>
                    <p className="text-lg font-medium text-gray-900">{selectedReservation.class.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Escuela</p>
                    <p className="text-lg font-medium text-gray-900">{selectedReservation.class.school.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha</p>
                    <p className="text-lg font-medium text-gray-900">{formatDate(selectedReservation.class.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Hora</p>
                    <p className="text-lg font-medium text-gray-900">
                      {(() => {
                        const times = getClassTimes(selectedReservation.class);
                        return `${times.startTime} - ${times.endTime}`;
                      })()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nivel</p>
                    <p className="text-lg font-medium text-gray-900">{selectedReservation.class.level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Precio</p>
                    {(() => {
                      const price = Number(selectedReservation.class?.price) || 0;
                      const prices = formatDualCurrency(price);
                      return (
                        <div>
                          <p className="text-lg font-bold text-gray-900">{prices.pen}</p>
                          <p className="text-xs text-gray-500">{prices.usd}</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                {selectedReservation.class.description && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Descripción</p>
                    <p className="text-gray-900">{selectedReservation.class.description}</p>
                  </div>
                )}
              </div>

              {/* Reservation Details */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Detalles de la Reserva</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Reserva</p>
                    <p className="text-lg font-medium text-gray-900">
                      {new Date(selectedReservation.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <div className="mt-1">{getStatusBadge(selectedReservation.status)}</div>
                  </div>
                  {selectedReservation.specialRequest && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-2">Solicitud Especial</p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-gray-900">{selectedReservation.specialRequest}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              {selectedReservation.payment && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Información de Pago</h3>
                  <div className="space-y-4">
                    {selectedReservation.payment.originalAmount && selectedReservation.payment.originalAmount !== selectedReservation.payment.amount && (
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center text-sm mb-2">
                          <span className="text-gray-600">Precio Original:</span>
                          <span className="font-medium text-gray-900 line-through">{formatDualCurrency(Number(selectedReservation.payment.originalAmount) || 0).pen}</span>
                        </div>
                        {selectedReservation.payment.discountAmount && selectedReservation.payment.discountAmount > 0 && (
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-green-600 font-medium flex items-center gap-1">
                              <span>Descuento</span>
                              {selectedReservation.payment.discountCode?.code && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                  {selectedReservation.payment.discountCode.code}
                                </span>
                              )}
                              :
                            </span>
                            <span className="font-semibold text-green-600">-{formatDualCurrency(Number(selectedReservation.payment.discountAmount) || 0).pen}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                          <span className="font-medium text-gray-700">Total Pagado:</span>
                          <span className="text-gray-900 text-lg font-bold">{formatDualCurrency(Number(selectedReservation.payment.amount) || 0).pen}</span>
                        </div>
                      </div>
                    )}
                    {(!selectedReservation.payment.originalAmount || selectedReservation.payment.originalAmount === selectedReservation.payment.amount) && (
                      <div>
                        <p className="text-sm text-gray-600">Monto</p>
                        {(() => {
                          const amount = Number(selectedReservation.payment.amount) || 0;
                          const prices = formatDualCurrency(amount);
                          return (
                            <div>
                              <p className="text-lg font-bold text-gray-900">{prices.pen}</p>
                              <p className="text-xs text-gray-500">{prices.usd}</p>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Estado del Pago</p>
                        <p className={`text-lg font-medium ${selectedReservation.payment.status === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                          {selectedReservation.payment.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                        </p>
                      </div>
                      {selectedReservation.payment.paymentMethod && (
                        <div>
                          <p className="text-sm text-gray-600">Método de Pago</p>
                          <p className="text-lg font-medium text-gray-900">{selectedReservation.payment.paymentMethod}</p>
                        </div>
                      )}
                      {selectedReservation.payment.paidAt && (
                        <div>
                          <p className="text-sm text-gray-600">Fecha de Pago</p>
                          <p className="text-lg font-medium text-gray-900">
                            {new Date(selectedReservation.payment.paidAt).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedReservation(selectedReservation);
                    setShowPaymentModal(true);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {selectedReservation.payment?.status === 'PAID' ? 'Ver Pago' : 'Pagar Reserva'}
                </button>
                <button
                  onClick={() => router.push(`/classes/${selectedReservation.classId}`)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Ver Clase Completa
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedReservation(null);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pago - Se muestra automáticamente después de hacer click en Pagar */}
      {showPaymentModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-100 p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-lg shadow-xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto flex flex-col safe-area-bottom">
            {/* Header - Sticky en móvil */}
            <div className="bg-linear-to-r from-green-600 to-green-700 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-lg sticky top-0 z-10">
              <h2 className="text-xl sm:text-2xl font-bold">
                {selectedReservation.payment?.status === 'PAID' ? 'Ver Pago' : 'Métodos de Pago'}
              </h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedReservation(null);
                }}
                className="text-white hover:text-gray-200 active:text-gray-300 transition-colors p-2 -mr-2 sm:mr-0 touch-target-lg"
                aria-label="Cerrar"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <p className="text-sm font-medium text-blue-900">Reserva #{selectedReservation.id}</p>
                <p className="text-lg font-semibold text-blue-900">{selectedReservation.class.title}</p>
                <div className="space-y-2 mt-2">
                  {selectedReservation.payment?.originalAmount && selectedReservation.payment.originalAmount !== selectedReservation.payment.amount ? (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-blue-700">Precio Original:</span>
                        <span className="font-medium text-blue-900 line-through">{formatDualCurrency(selectedReservation.payment.originalAmount).pen}</span>
                      </div>
                      {selectedReservation.payment.discountAmount && selectedReservation.payment.discountAmount > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-green-700 font-medium flex items-center gap-1">
                            <span>Descuento</span>
                            {selectedReservation.payment.discountCode && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                {selectedReservation.payment.discountCode.code}
                              </span>
                            )}
                            :
                          </span>
                          <span className="font-semibold text-green-700">-{formatDualCurrency(selectedReservation.payment.discountAmount).pen}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-blue-300">
                        <span className="font-medium text-blue-900">Total a Pagar:</span>
                        <span className="text-blue-900 text-lg font-bold">{formatDualCurrency(selectedReservation.payment.amount).pen}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-blue-700">
                      <span className="font-medium">Monto: </span>
                      {(() => {
                        const prices = formatDualCurrency(selectedReservation.class.price);
                        return (
                          <>
                            <span className="font-bold">{prices.pen}</span>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              <PaymentUpload
                reservationId={selectedReservation.id}
                amount={selectedReservation.payment?.amount || selectedReservation.class.price}
                onPaymentSubmitted={() => {
                  fetchReservations();
                  setShowPaymentModal(false);
                  setSelectedReservation(null);
                }}
                existingPayment={selectedReservation.payment ? {
                  id: selectedReservation.payment.id,
                  paymentMethod: selectedReservation.payment.paymentMethod,
                  status: selectedReservation.payment.status,
                  voucherImage: selectedReservation.payment.voucherImage,
                  voucherNotes: selectedReservation.payment.voucherNotes
                } : undefined}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

