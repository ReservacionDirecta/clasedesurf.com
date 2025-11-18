"use client";

import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { PaymentVoucherModal } from '@/components/payments/PaymentVoucherModal';

interface Reservation {
  id: number;
  status: string;
  specialRequest?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    age?: number;
    weight?: number;
    height?: number;
    canSwim: boolean;
    injuries?: string;
  };
  payment?: {
    id: number;
    amount: number;
    status: string;
    paymentMethod?: string;
    transactionId?: string;
    voucherImage?: string;
    voucherNotes?: string;
    paidAt?: string;
    createdAt: string;
  };
}

interface ClassData {
  id: number;
  title: string;
  date: string;
  capacity: number;
  price: number;
  level: string;
  instructor?: string;
  school: {
    name: string;
  };
}

export default function ClassReservationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const classId = params?.id as string;
  
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const fetchClassAndReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Using API proxy routes instead of direct backend calls
      
      // Fetch class details
      const classRes = await fetch('/api/classes', { headers });
      if (!classRes.ok) throw new Error('Failed to fetch class');
      
      const allClasses = await classRes.json();
      const currentClass = allClasses.find((cls: any) => cls.id === parseInt(classId));
      
      if (!currentClass) {
        throw new Error('Class not found');
      }
      
      setClassData(currentClass);
      
      // Fetch reservations
      const reservationsRes = await fetch('/api/reservations', { headers });
      if (reservationsRes.ok) {
        const allReservations = await reservationsRes.json();
        const classReservations = allReservations.filter((res: any) => res.classId === parseInt(classId));
        setReservations(classReservations);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  }, [classId, session]);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.role !== 'SCHOOL_ADMIN') {
      router.push('/denied');
      return;
    }

    if (classId) {
      fetchClassAndReservations();
    }
  }, [classId, fetchClassAndReservations, router, session, status]);

  const updateReservationStatus = async (reservationId: number, newStatus: string) => {
    try {
      setUpdating(reservationId);
      setError(null);
      
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      console.log('[School] Updating reservation status:', { reservationId, newStatus });
      
      const res = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to update reservation' }));
        console.error('[School] Update reservation error:', errorData);
        throw new Error(errorData.message || 'Failed to update reservation');
      }
      
      const updatedReservation = await res.json();
      console.log('[School] Reservation updated successfully:', updatedReservation);
      
      // Refresh reservations to get latest data
      await fetchClassAndReservations();
      
      // Show success message
      alert(`Reserva ${newStatus === 'CONFIRMED' ? 'confirmada' : newStatus === 'CANCELED' ? 'cancelada' : 'actualizada'} exitosamente`);
    } catch (err) {
      console.error('[School] Error updating reservation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la reserva';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setUpdating(null);
    }
  };

  const updatePaymentStatus = async (paymentId: number, paymentStatus: string) => {
    try {
      setUpdating(paymentId);
      
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/payments/${paymentId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ 
          status: paymentStatus,
          paidAt: paymentStatus === 'PAID' ? new Date().toISOString() : null
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update payment');
      }
      
      // Refresh reservations
      await fetchClassAndReservations();
      setError(null);
    } catch (err) {
      console.error('Error updating payment:', err);
      setError(err instanceof Error ? err.message : 'Error updating payment');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PAID':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmada';
      case 'PAID':
        return 'Pagada';
      case 'PENDING':
        return 'Pendiente';
      case 'CANCELED':
        return 'Cancelada';
      case 'COMPLETED':
        return 'Completada';
      case 'UNPAID':
        return 'Sin Pagar';
      case 'REFUNDED':
        return 'Reembolsado';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !classData) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchClassAndReservations}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reservas de la Clase</h1>
              {classData && (
                <p className="text-gray-600 mt-1">
                  {classData.title} - {formatDate(classData.date)}
                </p>
              )}
            </div>
            <Link
              href="/dashboard/school/classes"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
            >
              ← Volver a Clases
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        {/* Class Info Card */}
        {classData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Capacidad</h3>
                <p className="text-2xl font-bold text-gray-900">{classData.capacity}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Reservas</h3>
                <p className="text-2xl font-bold text-gray-900">{reservations.length}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Disponibles</h3>
                <p className="text-2xl font-bold text-gray-900">{classData.capacity - reservations.length}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Ingresos</h3>
                <p className="text-2xl font-bold text-gray-900">
                  ${reservations
                    .filter(r => r.payment?.status === 'PAID')
                    .reduce((sum, r) => sum + (r.payment?.amount || 0), 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Reservations List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <h2 className="text-xl font-bold text-gray-900">Lista de Reservas</h2>
            <p className="text-sm text-gray-600 mt-1">Gestiona las reservas de esta clase</p>
          </div>

          {reservations.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay reservas</h3>
              <p className="text-gray-600">Esta clase aún no tiene reservas registradas</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="p-6 hover:bg-gray-50 transition-colors">
                  {/* Main Info Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{reservation.user.name}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {reservation.user.email}
                            </div>
                            {reservation.user.phone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {reservation.user.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Student Details */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {reservation.user.age && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                            {reservation.user.age} años
                          </span>
                        )}
                        {reservation.user.weight && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-50 text-gray-700">
                            {reservation.user.weight} kg
                          </span>
                        )}
                        {reservation.user.height && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-50 text-gray-700">
                            {reservation.user.height} cm
                          </span>
                        )}
                        {!reservation.user.canSwim && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            No sabe nadar
                          </span>
                        )}
                        {reservation.user.injuries && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Tiene lesiones
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                        {getStatusLabel(reservation.status)}
                      </span>
                      {reservation.payment ? (
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.payment.status)}`}>
                          💳 {getStatusLabel(reservation.payment.status)}
                        </span>
                      ) : (
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                          Sin pago
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">Reservado:</span>
                      <span className="ml-1">{formatDate(reservation.createdAt)}</span>
                    </div>
                    {reservation.payment ? (
                      <>
                        {reservation.payment.amount && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">Monto:</span>
                            <span className="ml-1 font-semibold text-green-600">${reservation.payment.amount}</span>
                          </div>
                        )}
                        {reservation.payment.paymentMethod && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span className="font-medium">Método:</span>
                            <span className="ml-1 capitalize">
                              {(() => {
                                const method = reservation.payment.paymentMethod;
                                const methodMap: { [key: string]: string } = {
                                  'transfer': 'Transferencia',
                                  'deposit': 'Depósito',
                                  'yape': 'Yape',
                                  'payment_link': 'Link de Pago',
                                  'cash': 'Efectivo'
                                };
                                return methodMap[method] || method.replace('_', ' ');
                              })()}
                            </span>
                          </div>
                        )}
                        {reservation.payment.transactionId && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                            <span className="font-medium">ID:</span>
                            <span className="ml-1 font-mono text-xs">{reservation.payment.transactionId}</span>
                          </div>
                        )}
                        {reservation.payment.voucherImage && (
                          <div className="flex items-center text-sm text-green-600">
                            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium">Comprobante disponible</span>
                          </div>
                        )}
                        {reservation.payment.paidAt && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">Pagado:</span>
                            <span className="ml-1">{formatDate(reservation.payment.paidAt)}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Sin información de pago</span>
                      </div>
                    )}
                  </div>

                  {/* Special Request */}
                  {reservation.specialRequest && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-yellow-900">Solicitud Especial:</p>
                          <p className="text-sm text-yellow-800 mt-1">{reservation.specialRequest}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedReservation(reservation);
                        setShowDetailsModal(true);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver Detalles
                    </button>

                    {reservation.status === 'PENDING' && (
                      <button
                        onClick={() => updateReservationStatus(reservation.id, 'CONFIRMED')}
                        disabled={updating === reservation.id}
                        className="inline-flex items-center px-4 py-2 border border-green-300 rounded-lg text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Confirmar
                      </button>
                    )}

                    {reservation.payment && (
                      <button
                        onClick={() => {
                          setSelectedPayment(reservation.payment);
                          setShowPaymentModal(true);
                        }}
                        disabled={updating === reservation.id}
                        className="inline-flex items-center px-4 py-2 border border-purple-300 rounded-lg text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 disabled:opacity-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Registrar Pago
                      </button>
                    )}

                    {reservation.status !== 'CANCELED' && reservation.status !== 'COMPLETED' && (
                      <button
                        onClick={() => updateReservationStatus(reservation.id, 'CANCELED')}
                        disabled={updating === reservation.id}
                        className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg sticky top-0 z-10">
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

            <div className="p-6">
              {/* Reservation Status */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Estado de la Reserva</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Estado Actual</p>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedReservation.status)}`}>
                        {getStatusLabel(selectedReservation.status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fecha de Reserva</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(selectedReservation.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Última Actualización</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(selectedReservation.updatedAt)}</p>
                    </div>
                    {selectedReservation.specialRequest && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500 mb-1">Solicitud Especial</p>
                        <p className="text-sm text-gray-900 bg-yellow-50 p-3 rounded border border-yellow-200">
                          {selectedReservation.specialRequest}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Student Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Estudiante</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Nombre Completo</p>
                      <p className="text-sm font-medium text-gray-900">{selectedReservation.user.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{selectedReservation.user.email}</p>
                    </div>
                    {selectedReservation.user.phone && (
                      <div>
                        <p className="text-sm text-gray-500">Teléfono</p>
                        <p className="text-sm font-medium text-gray-900">{selectedReservation.user.phone}</p>
                      </div>
                    )}
                    {selectedReservation.user.age && (
                      <div>
                        <p className="text-sm text-gray-500">Edad</p>
                        <p className="text-sm font-medium text-gray-900">{selectedReservation.user.age} años</p>
                      </div>
                    )}
                    {selectedReservation.user.weight && (
                      <div>
                        <p className="text-sm text-gray-500">Peso</p>
                        <p className="text-sm font-medium text-gray-900">{selectedReservation.user.weight} kg</p>
                      </div>
                    )}
                    {selectedReservation.user.height && (
                      <div>
                        <p className="text-sm text-gray-500">Altura</p>
                        <p className="text-sm font-medium text-gray-900">{selectedReservation.user.height} cm</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">¿Sabe Nadar?</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedReservation.user.canSwim ? (
                          <span className="text-green-600">✓ Sí</span>
                        ) : (
                          <span className="text-red-600">✗ No</span>
                        )}
                      </p>
                    </div>
                    {selectedReservation.user.injuries && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500 mb-1">Lesiones o Condiciones Médicas</p>
                        <p className="text-sm text-gray-900 bg-red-50 p-3 rounded border border-red-200">
                          ⚠️ {selectedReservation.user.injuries}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Information - Always show this section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Información de Pago</h3>
                  {selectedReservation.payment && selectedReservation.payment.status === 'PENDING' && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Requiere Verificación
                    </span>
                  )}
                </div>
                {selectedReservation.payment ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Estado del Pago</p>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedReservation.payment?.status || 'UNPAID')}`}>
                          {getStatusLabel(selectedReservation.payment?.status || 'UNPAID')}
                        </span>
                      </div>
                      {selectedReservation.payment?.amount && (
                        <div>
                          <p className="text-sm text-gray-500">Monto</p>
                          <p className="text-lg font-bold text-gray-900">${selectedReservation.payment.amount}</p>
                        </div>
                      )}
                      {selectedReservation.payment?.paymentMethod && (
                        <div>
                          <p className="text-sm text-gray-500">Método de Pago</p>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {(() => {
                              const method = selectedReservation.payment?.paymentMethod;
                              const methodMap: { [key: string]: string } = {
                                'transfer': 'Transferencia Bancaria',
                                'deposit': 'Depósito Bancario',
                                'yape': 'Yape',
                                'payment_link': 'Link de Pago',
                                'cash': 'Efectivo'
                              };
                              return methodMap[method] || method.replace('_', ' ');
                            })()}
                          </p>
                        </div>
                      )}
                      {selectedReservation.payment?.transactionId && (
                        <div>
                          <p className="text-sm text-gray-500">ID de Transacción</p>
                          <p className="text-sm font-mono text-gray-900">{selectedReservation.payment.transactionId}</p>
                        </div>
                      )}
                      {selectedReservation.payment?.createdAt && (
                        <div>
                          <p className="text-sm text-gray-500">Fecha de Creación</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(selectedReservation.payment.createdAt)}</p>
                        </div>
                      )}
                      {selectedReservation.payment?.paidAt && (
                        <div>
                          <p className="text-sm text-gray-500">Fecha de Pago</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(selectedReservation.payment.paidAt)}</p>
                        </div>
                      )}
                      {selectedReservation.payment?.voucherImage && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500 mb-2 font-medium">Comprobante de Pago</p>
                          <div className="bg-white p-4 rounded-lg border border-gray-300">
                            <img 
                              src={selectedReservation.payment?.voucherImage || ''} 
                              alt="Comprobante de pago" 
                              className="max-w-full h-auto rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => {
                                const voucherUrl = selectedReservation.payment?.voucherImage;
                                if (voucherUrl) {
                                  window.open(voucherUrl, '_blank');
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {selectedReservation.payment?.voucherNotes && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500 mb-1 font-medium">Notas del Pago</p>
                          <p className="text-sm text-gray-900 bg-blue-50 p-3 rounded border border-blue-200">
                            {selectedReservation.payment?.voucherNotes}
                          </p>
                        </div>
                      )}
                      {/* Payment Actions for School Admin */}
                      <div className="md:col-span-2 mt-6 pt-4 border-t border-gray-200">
                        {selectedReservation.payment?.status === 'PENDING' && (
                          <div className="space-y-3">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <p className="text-sm text-yellow-800 font-medium mb-1">
                                {selectedReservation.payment?.paymentMethod === 'cash' 
                                  ? '💰 Pago en Efectivo Pendiente'
                                  : '📄 Comprobante Pendiente de Verificación'}
                              </p>
                              <p className="text-xs text-yellow-700">
                                {selectedReservation.payment?.paymentMethod === 'cash'
                                  ? 'Confirma el pago cuando el estudiante haya pagado al inicio de la clase.'
                                  : 'Revisa el comprobante de pago y verifica que sea válido antes de confirmar.'}
                              </p>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => {
                                  if (selectedReservation.payment?.id) {
                                    updatePaymentStatus(selectedReservation.payment.id, 'PAID');
                                  }
                                }}
                                disabled={!selectedReservation.payment?.id || updating === selectedReservation.payment.id}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {updating === selectedReservation.payment?.id ? (
                                  <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Procesando...
                                  </span>
                                ) : (
                                  selectedReservation.payment?.paymentMethod === 'cash'
                                    ? '✓ Confirmar Pago Recibido'
                                    : '✓ Verificar y Confirmar Pago'
                                )}
                              </button>
                              {selectedReservation.payment?.paymentMethod !== 'cash' && (
                                <button
                                  onClick={() => {
                                    if (selectedReservation.payment?.id) {
                                      updatePaymentStatus(selectedReservation.payment.id, 'UNPAID');
                                    }
                                  }}
                                  disabled={!selectedReservation.payment?.id || updating === selectedReservation.payment.id}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  Rechazar
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        {selectedReservation.payment?.status === 'PAID' && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center">
                              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-sm text-green-800 font-medium">
                                Pago confirmado y procesado
                              </p>
                            </div>
                            {selectedReservation.payment?.paidAt && (
                              <p className="text-xs text-green-700 mt-1">
                                Confirmado el {formatDate(selectedReservation.payment.paidAt)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-gray-800 font-medium mb-1">No hay información de pago disponible</p>
                      <p className="text-sm text-gray-600">El estudiante aún no ha registrado un método de pago para esta reserva.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Class Information */}
              {classData && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Información de la Clase</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Título</p>
                        <p className="text-sm font-medium text-gray-900">{classData.title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Fecha y Hora</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(classData.date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Nivel</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(classData.level)}`}>
                          {classData.level}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Precio</p>
                        <p className="text-sm font-medium text-gray-900">${classData.price}</p>
                      </div>
                      {classData.instructor && (
                        <div>
                          <p className="text-sm text-gray-500">Instructor</p>
                          <p className="text-sm font-medium text-gray-900">{classData.instructor}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">Escuela</p>
                        <p className="text-sm font-medium text-gray-900">{classData.school.name}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  {selectedReservation.status === 'PENDING' && (
                    <button
                      onClick={() => {
                        updateReservationStatus(selectedReservation.id, 'CONFIRMED');
                        setShowDetailsModal(false);
                      }}
                      disabled={updating === selectedReservation.id}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Confirmar Reserva
                    </button>
                  )}
                  
                  {selectedReservation.payment && selectedReservation.payment.status === 'UNPAID' && (
                    <button
                      onClick={() => {
                        updatePaymentStatus(selectedReservation.id, 'PAID');
                        setShowDetailsModal(false);
                      }}
                      disabled={updating === selectedReservation.id}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Marcar como Pagado
                    </button>
                  )}
                  
                  {selectedReservation.status !== 'CANCELED' && selectedReservation.status !== 'COMPLETED' && (
                    <button
                      onClick={() => {
                        if (window.confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
                          updateReservationStatus(selectedReservation.id, 'CANCELED');
                          setShowDetailsModal(false);
                        }
                      }}
                      disabled={updating === selectedReservation.id}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Cancelar Reserva
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedReservation(null);
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Voucher Modal */}
      {showPaymentModal && selectedPayment && (
        <PaymentVoucherModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPayment(null);
          }}
          payment={selectedPayment}
          onSuccess={() => {
            fetchClassAndReservations();
          }}
        />
      )}
    </div>
  );
}
