'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PaymentUpload from '@/components/payments/PaymentUpload';
import { formatDualCurrency } from '@/lib/currency';

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
}

interface Reservation {
  id: number;
  classId: number;
  userId: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'PAID';
  specialRequest: string | null;
  createdAt: string;
  class: Class;
  payment?: {
    id: number;
    amount: number;
    status: string;
    paymentMethod: string;
    voucherImage?: string;
    voucherNotes?: string;
    paidAt?: string;
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

  // Removed auto-refresh on visibility/focus change to preserve user state

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
      // Asegurar que los datos de payment estén incluidos
      const processedData = data.map((res: any) => {
        if (!res.class) {
          console.warn('[Reservations] Reservation without class data:', res);
        }
        const processed = {
        ...res,
        payment: res.payment || undefined
        };
        console.log('[Reservations] Reservation processed:', {
          id: processed.id,
          status: processed.status,
          classTitle: processed.class?.title
        });
        return processed;
      });
      console.log('[Reservations] Total processed reservations:', processedData.length);
      setReservations(processedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredReservations = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of day for comparison
    
    const filtered = reservations.filter(reservation => {
      if (!reservation.class || !reservation.class.date) {
        console.warn('[Reservations] Reservation missing class or date:', reservation);
        return false;
      }
      
      const classDate = new Date(reservation.class.date);
      classDate.setHours(0, 0, 0, 0); // Reset to start of day for comparison
      
      if (filter === 'upcoming') {
        // Show all non-canceled reservations that are either:
        // 1. Future dates, OR
        // 2. PENDING/CONFIRMED status (regardless of date - user might have just created it)
        return reservation.status !== 'CANCELED' && (classDate >= now || reservation.status === 'PENDING' || reservation.status === 'CONFIRMED');
      } else if (filter === 'past') {
        // Show only truly past reservations (date passed AND not pending/confirmed)
        return (classDate < now && reservation.status !== 'PENDING' && reservation.status !== 'CONFIRMED') || reservation.status === 'CANCELED';
      }
      return true;
    });
    
    console.log('[Reservations] Filter:', filter, 'Total reservations:', reservations.length, 'Filtered:', filtered.length);
    return filtered;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELED: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmada',
      CANCELED: 'Cancelada'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string | Date) => {
    if (!time) return '00:00';
    if (time instanceof Date) {
      return time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return time.substring(0, 5);
  };

  const getClassTimes = (classData: Class) => {
    // Calculate start and end times from date and duration
    const classDate = new Date(classData.date);
    const startTime = classDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Get duration from class data or calculate from startTime/endTime if available
    const duration = (classData as any).duration || 120; // Default 120 minutes
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
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Próximas
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === 'past'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pasadas
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === 'all'
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
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {reservation.class.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {reservation.class.school.name}
                          </p>
                        </div>
                        {getStatusBadge(reservation.status)}
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center text-gray-600">
                          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="capitalize">{formatDate(reservation.class.date)}</span>
                        </div>

                        <div className="flex items-center text-gray-600">
                          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>
                            {(() => {
                              const times = getClassTimes(reservation.class);
                              return `${times.startTime} - ${times.endTime}`;
                            })()}
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
                              const prices = formatDualCurrency(reservation.class.price);
                              return (
                                <>
                                  <span className="font-semibold text-lg">{prices.pen}</span>
                                  <span className="text-xs text-gray-500 ml-1">({prices.usd})</span>
                                </>
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
                        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          reservation.payment?.status === 'PAID'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {reservation.payment?.status === 'PAID' ? 'Ver Pago' : 'Reservar'}
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
                    
                    {reservation.status === 'PENDING' && new Date(reservation.class.date) >= new Date() && (
                      <button
                        className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancelar Reserva
                      </button>
                    )}
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalles de Reserva */}
      {showDetailsModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg sticky top-0 z-10">
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
                    <p className="text-sm text-gray-600">Título</p>
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
                        const prices = formatDualCurrency(selectedReservation.class.price);
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Estado del Pago</p>
                      <p className={`text-lg font-medium ${
                        selectedReservation.payment.status === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {selectedReservation.payment.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Monto</p>
                      {(() => {
                        const prices = formatDualCurrency(selectedReservation.payment.amount);
                        return (
                          <div>
                            <p className="text-lg font-bold text-gray-900">{prices.pen}</p>
                            <p className="text-xs text-gray-500">{prices.usd}</p>
                          </div>
                        );
                      })()}
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

      {/* Modal de Pago - Se muestra automáticamente después de hacer click en Reservar */}
      {showPaymentModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 flex items-center justify-between rounded-t-lg sticky top-0 z-10">
              <h2 className="text-2xl font-bold">
                {selectedReservation.payment?.status === 'PAID' ? 'Ver Pago' : 'Métodos de Pago'}
              </h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
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
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900">Reserva #{selectedReservation.id}</p>
                <p className="text-lg font-semibold text-blue-900">{selectedReservation.class.title}</p>
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
              </div>
              
              <PaymentUpload
                reservationId={selectedReservation.id}
                amount={selectedReservation.class.price}
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
