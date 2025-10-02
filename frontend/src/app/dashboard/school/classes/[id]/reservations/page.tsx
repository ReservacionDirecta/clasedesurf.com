"use client";

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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

  useEffect(() => {
    if (status === 'loading') return;
    
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
  }, [session, status, router, classId]);

  const fetchClassAndReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      
      // Fetch class details
      const classRes = await fetch(`${BACKEND}/classes`, { headers });
      if (!classRes.ok) throw new Error('Failed to fetch class');
      
      const allClasses = await classRes.json();
      const currentClass = allClasses.find((cls: any) => cls.id === parseInt(classId));
      
      if (!currentClass) {
        throw new Error('Class not found');
      }
      
      setClassData(currentClass);
      
      // Fetch reservations
      const reservationsRes = await fetch(`${BACKEND}/reservations`, { headers });
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
  };

  const updateReservationStatus = async (reservationId: number, newStatus: string) => {
    try {
      setUpdating(reservationId);
      
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      
      const res = await fetch(`${BACKEND}/reservations/${reservationId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update reservation');
      
      // Refresh reservations
      await fetchClassAndReservations();
    } catch (err) {
      console.error('Error updating reservation:', err);
      setError(err instanceof Error ? err.message : 'Error updating reservation');
    } finally {
      setUpdating(null);
    }
  };

  const updatePaymentStatus = async (reservationId: number, paymentStatus: string) => {
    try {
      setUpdating(reservationId);
      
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation?.payment) {
        throw new Error('No payment found for this reservation');
      }
      
      const res = await fetch(`${BACKEND}/payments/${reservation.payment.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ 
          status: paymentStatus,
          paidAt: paymentStatus === 'PAID' ? new Date().toISOString() : null
        })
      });

      if (!res.ok) throw new Error('Failed to update payment');
      
      // Refresh reservations
      await fetchClassAndReservations();
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
                  ${reservations.filter(r => r.payment?.status === 'PAID').length * classData.price}
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

        {/* Reservations Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Lista de Reservas</h2>
          </div>

          {reservations.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay reservas</h3>
              <p className="text-gray-600">Esta clase aún no tiene reservas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado Reserva
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado Pago
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Reserva
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Solicitud Especial
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{reservation.user.name}</div>
                          <div className="text-sm text-gray-500">{reservation.user.email}</div>
                          {reservation.user.phone && (
                            <div className="text-sm text-gray-500">{reservation.user.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                          {getStatusLabel(reservation.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {reservation.payment ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.payment.status)}`}>
                            {getStatusLabel(reservation.payment.status)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">Sin pago</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(reservation.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {reservation.specialRequest || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setShowDetailsModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Ver Detalles
                          </button>
                          
                          <div className="flex space-x-2">
                            {/* Reservation Status Actions */}
                            {reservation.status === 'PENDING' && (
                              <button
                                onClick={() => updateReservationStatus(reservation.id, 'CONFIRMED')}
                                disabled={updating === reservation.id}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50 text-xs"
                              >
                                Confirmar
                              </button>
                            )}
                            
                            {reservation.status !== 'CANCELED' && reservation.status !== 'COMPLETED' && (
                              <button
                                onClick={() => updateReservationStatus(reservation.id, 'CANCELED')}
                                disabled={updating === reservation.id}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50 text-xs"
                              >
                                Cancelar
                              </button>
                            )}

                            {/* Payment Status Actions */}
                            {reservation.payment && reservation.payment.status === 'UNPAID' && (
                              <button
                                onClick={() => updatePaymentStatus(reservation.id, 'PAID')}
                                disabled={updating === reservation.id}
                                className="text-blue-600 hover:text-blue-900 disabled:opacity-50 text-xs"
                              >
                                Marcar Pagado
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
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

              {/* Payment Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Información de Pago</h3>
                {selectedReservation.payment ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Estado del Pago</p>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedReservation.payment.status)}`}>
                          {getStatusLabel(selectedReservation.payment.status)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Monto</p>
                        <p className="text-lg font-bold text-gray-900">${selectedReservation.payment.amount}</p>
                      </div>
                      {selectedReservation.payment.paymentMethod && (
                        <div>
                          <p className="text-sm text-gray-500">Método de Pago</p>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {selectedReservation.payment.paymentMethod.replace('_', ' ')}
                          </p>
                        </div>
                      )}
                      {selectedReservation.payment.transactionId && (
                        <div>
                          <p className="text-sm text-gray-500">ID de Transacción</p>
                          <p className="text-sm font-mono text-gray-900">{selectedReservation.payment.transactionId}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">Fecha de Creación</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(selectedReservation.payment.createdAt)}</p>
                      </div>
                      {selectedReservation.payment.paidAt && (
                        <div>
                          <p className="text-sm text-gray-500">Fecha de Pago</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(selectedReservation.payment.paidAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-yellow-800">No hay información de pago disponible</p>
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
    </div>
  );
}