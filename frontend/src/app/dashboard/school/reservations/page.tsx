'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, Users, CheckCircle, XCircle, AlertCircle, Eye, Search, Filter, Clock } from 'lucide-react';

interface Reservation {
  id: number;
  userId: number;
  classId: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'PAID';
  specialRequest?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  class: {
    id: number;
    title: string;
    date: string;
    price: number;
    level: string;
    instructor: string;
  };
  payment?: {
    id: number;
    amount: number;
    status: string;
    paymentMethod: string;
  };
}

export default function SchoolReservations() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'PAID'>('all');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.role !== 'SCHOOL_ADMIN') {
      router.push('/dashboard/student/profile');
      return;
    }

    fetchReservations();
  }, [session, status, router]);

  const fetchReservations = async () => {
    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/reservations', { headers });

      if (response.ok) {
        const data = await response.json();
        setReservations(data);
      } else {
        console.error('Error fetching reservations:', response.statusText);
        setReservations([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setReservations([]);
      setLoading(false);
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.class.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELED':
        return 'bg-red-100 text-red-800';
      case 'PAID':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING':
        return <AlertCircle className="w-4 h-4" />;
      case 'CANCELED':
        return <XCircle className="w-4 h-4" />;
      case 'PAID':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-yellow-100 text-yellow-800';
      case 'INTERMEDIATE':
        return 'bg-orange-100 text-orange-800';
      case 'ADVANCED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const formatCurrency = (amount: number) => {
    return `S/. ${amount.toFixed(2)}`;
  };

  const handleViewReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
  };

  const handleStatusChange = async (reservationId: number, newStatus: string) => {
    try {
      // Aquí iría la llamada a la API para actualizar el estado
      setReservations(prev =>
        prev.map(r =>
          r.id === reservationId
            ? { ...r, status: newStatus as any, updatedAt: new Date().toISOString() }
            : r
        )
      );
      alert(`Reserva ${newStatus.toLowerCase()} exitosamente`);
    } catch (error) {
      console.error('Error updating reservation:', error);
      alert('Error al actualizar la reserva');
    }
  };

  // Cálculos de estadísticas
  const totalReservations = reservations.length;
  const confirmedReservations = reservations.filter(r => r.status === 'CONFIRMED' || r.status === 'PAID').length;
  const pendingReservations = reservations.filter(r => r.status === 'PENDING').length;
  const canceledReservations = reservations.filter(r => r.status === 'CANCELED').length;

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/school')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Volver al Dashboard
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Reservas</h1>
              <p className="text-gray-600 mt-2">Administra las reservas de estudiantes de tu escuela</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total</h3>
                <p className="text-3xl font-bold text-blue-600">{totalReservations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Confirmadas</h3>
                <p className="text-3xl font-bold text-green-600">{confirmedReservations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Pendientes</h3>
                <p className="text-3xl font-bold text-yellow-600">{pendingReservations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Canceladas</h3>
                <p className="text-3xl font-bold text-red-600">{canceledReservations}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por estudiante, email o clase..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="PENDING">Pendientes</option>
                <option value="CONFIRMED">Confirmadas</option>
                <option value="PAID">Pagadas</option>
                <option value="CANCELED">Canceladas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reservations List */}
        <div className="space-y-6">
          {filteredReservations.map((reservation) => (
            <div key={reservation.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{reservation.user.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{reservation.user.email}</p>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                            {getStatusIcon(reservation.status)}
                            <span className="ml-1">
                              {reservation.status === 'CONFIRMED' ? 'Confirmada' :
                                reservation.status === 'PENDING' ? 'Pendiente' :
                                  reservation.status === 'CANCELED' ? 'Cancelada' : 'Pagada'}
                            </span>
                          </span>
                          {reservation.payment && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${reservation.payment.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                              {reservation.payment.status === 'PAID' ? 'Pagado' : 'Sin pagar'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{reservation.class.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(reservation.class.level)}`}>
                        {reservation.class.level === 'BEGINNER' ? 'Principiante' :
                          reservation.class.level === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(reservation.class.date)}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Instructor: {reservation.class.instructor}
                      </div>
                      <div className="flex items-center font-medium text-green-600">
                        {formatCurrency(reservation.class.price)}
                      </div>
                    </div>
                  </div>

                  {reservation.specialRequest && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Solicitud especial:</span> &quot;{reservation.specialRequest}&quot;
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Reservado: {formatDate(reservation.createdAt)}
                      {reservation.updatedAt !== reservation.createdAt && (
                        <span> • Actualizado: {formatDate(reservation.updatedAt)}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewReservation(reservation)}
                        className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Detalles
                      </button>
                      {reservation.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(reservation.id, 'CONFIRMED')}
                            className="flex items-center px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirmar
                          </button>
                          <button
                            onClick={() => handleStatusChange(reservation.id, 'CANCELED')}
                            className="flex items-center px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredReservations.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron reservas</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no hay reservas registradas'
              }
            </p>
          </div>
        )}

        {/* Modal Detalles de la Reserva */}
        {showDetailModal && selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Reserva #{selectedReservation.id}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Información del Estudiante */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Información del Estudiante</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Nombre:</span>
                      <p className="text-gray-900">{selectedReservation.user.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <p className="text-gray-900">{selectedReservation.user.email}</p>
                    </div>
                    {selectedReservation.user.phone && (
                      <div>
                        <span className="font-medium text-gray-700">Teléfono:</span>
                        <p className="text-gray-900">{selectedReservation.user.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información de la Clase */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Información de la Clase</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Título:</span>
                      <p className="text-gray-900">{selectedReservation.class.title}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Instructor:</span>
                      <p className="text-gray-900">{selectedReservation.class.instructor}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Fecha:</span>
                      <p className="text-gray-900">{formatDate(selectedReservation.class.date)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Nivel:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(selectedReservation.class.level)}`}>
                        {selectedReservation.class.level === 'BEGINNER' ? 'Principiante' :
                          selectedReservation.class.level === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Precio:</span>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedReservation.class.price)}</p>
                    </div>
                  </div>
                </div>

                {/* Estado de la Reserva */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Estado de la Reserva</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Estado:</span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedReservation.status)}`}>
                        {getStatusIcon(selectedReservation.status)}
                        <span className="ml-1">
                          {selectedReservation.status === 'CONFIRMED' ? 'Confirmada' :
                            selectedReservation.status === 'PENDING' ? 'Pendiente' :
                              selectedReservation.status === 'CANCELED' ? 'Cancelada' : 'Pagada'}
                        </span>
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Fecha de reserva:</span>
                      <p className="text-gray-900">{formatDate(selectedReservation.createdAt)}</p>
                    </div>
                    {selectedReservation.updatedAt !== selectedReservation.createdAt && (
                      <div>
                        <span className="font-medium text-gray-700">Última actualización:</span>
                        <p className="text-gray-900">{formatDate(selectedReservation.updatedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Solicitud Especial */}
                {selectedReservation.specialRequest && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Solicitud Especial</h4>
                    <p className="text-gray-800 italic">&quot;{selectedReservation.specialRequest}&quot;</p>
                  </div>
                )}

                {/* Información de Pago */}
                {selectedReservation.payment && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Información de Pago</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Monto:</span>
                        <p className="text-gray-900">{formatCurrency(selectedReservation.payment.amount)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Estado:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedReservation.payment.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {selectedReservation.payment.status === 'PAID' ? 'Pagado' : 'Sin pagar'}
                        </span>
                      </div>
                      {selectedReservation.payment.paymentMethod && (
                        <div>
                          <span className="font-medium text-gray-700">Método:</span>
                          <p className="text-gray-900">
                            {selectedReservation.payment.paymentMethod === 'credit_card' ? 'Tarjeta de Crédito' :
                              selectedReservation.payment.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                {selectedReservation.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedReservation.id, 'CONFIRMED');
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedReservation.id, 'CANCELED');
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Cancelar
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}