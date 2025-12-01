'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Search,
  Filter,
  Clock,
  Edit,
  CreditCard,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  School,
  User,
  Save,
  X,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface Reservation {
  id: number;
  userId: number;
  classId: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'PAID' | 'COMPLETED';
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
    duration?: number;
    school?: {
      id: number;
      name: string;
    };
  };
  payment?: {
    id: number;
    amount: number;
    originalAmount?: number;
    discountAmount?: number;
    status: string;
    paymentMethod?: string;
    discountCode?: {
      id: number;
      code: string;
    };
  };
}

export default function SchoolReservations() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'PAID' | 'COMPLETED'>('all');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    specialRequest: '',
    status: 'PENDING' as string
  });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    status: 'PENDING' as string,
    paymentMethod: 'cash' as string
  });

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

  const handleStatusChange = async (reservationId: number, newStatus: string) => {
    if (!confirm(`¿Estás seguro de cambiar el estado a "${getStatusLabel(newStatus)}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchReservations();
        showSuccess('¡Actualizada!', `Reserva ${getStatusLabel(newStatus).toLowerCase()} exitosamente`);
        if (showDetailModal) {
          setShowDetailModal(false);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la reserva');
      }
    } catch (error) {
      console.error('Error updating reservation:', error);
      showError('Error al actualizar', error instanceof Error ? error.message : 'Error al actualizar la reserva');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setEditForm({
      specialRequest: reservation.specialRequest || '',
      status: reservation.status
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedReservation) return;

    setActionLoading(true);
    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/reservations/${selectedReservation.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          specialRequest: editForm.specialRequest,
          status: editForm.status
        })
      });

      if (response.ok) {
        await fetchReservations();
        showSuccess('¡Reserva actualizada!', 'Los cambios se guardaron correctamente');
        setShowEditModal(false);
        setShowDetailModal(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la reserva');
      }
    } catch (error) {
      console.error('Error updating reservation:', error);
      showError('Error al actualizar', error instanceof Error ? error.message : 'Error al actualizar la reserva');
    } finally {
      setActionLoading(false);
    }
  };

  const handleManagePayment = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setPaymentForm({
      amount: reservation.payment?.amount || reservation.class.price,
      status: reservation.payment?.status || 'PENDING',
      paymentMethod: reservation.payment?.paymentMethod || 'cash'
    });
    setShowPaymentModal(true);
  };

  const handleSavePayment = async () => {
    if (!selectedReservation) return;

    setActionLoading(true);
    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Update payment via reservation API
      const response = await fetch(`/api/reservations/${selectedReservation.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          payment: {
            amount: paymentForm.amount,
            status: paymentForm.status,
            paymentMethod: paymentForm.paymentMethod
          }
        })
      });

      if (response.ok) {
        await fetchReservations();
        showSuccess('¡Pago actualizado!', 'La información de pago se guardó correctamente');
        setShowPaymentModal(false);
        setShowDetailModal(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el pago');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      showError('Error al actualizar pago', error instanceof Error ? error.message : 'Error al actualizar el pago');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: number) => {
    if (!confirm('¿Estás seguro de cancelar esta reserva? Esta acción no se puede deshacer.')) {
      return;
    }

    await handleStatusChange(reservationId, 'CANCELED');
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
        return 'bg-green-100 text-green-800 border-green-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CANCELED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'PAID':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'CONFIRMED': 'Confirmada',
      'PENDING': 'Pendiente',
      'CANCELED': 'Cancelada',
      'PAID': 'Pagada',
      'COMPLETED': 'Completada'
    };
    return labels[status] || status;
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
        return <CheckCircle2 className="w-4 h-4" />;
      case 'COMPLETED':
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
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleViewReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
  };

  // Cálculos de estadísticas
  const totalReservations = reservations.length;
  const confirmedReservations = reservations.filter(r => r.status === 'CONFIRMED' || r.status === 'PAID').length;
  const pendingReservations = reservations.filter(r => r.status === 'PENDING').length;
  const canceledReservations = reservations.filter(r => r.status === 'CANCELED').length;
  const totalRevenue = reservations
    .filter(r => r.payment?.status === 'PAID')
    .reduce((sum, r) => sum + (r.payment?.amount || 0), 0);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8" style={{ paddingBottom: 'max(5rem, env(safe-area-inset-bottom))' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.push('/dashboard/school')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center text-sm sm:text-base"
          >
            ← Volver al Dashboard
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Reservas</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Administra las reservas de estudiantes de tu escuela</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              <div className="ml-3 sm:ml-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600">Total</h3>
                <p className="text-xl sm:text-3xl font-bold text-blue-600">{totalReservations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
              <div className="ml-3 sm:ml-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600">Confirmadas</h3>
                <p className="text-xl sm:text-3xl font-bold text-green-600">{confirmedReservations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 flex-shrink-0" />
              <div className="ml-3 sm:ml-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600">Pendientes</h3>
                <p className="text-xl sm:text-3xl font-bold text-yellow-600">{pendingReservations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0" />
              <div className="ml-3 sm:ml-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600">Canceladas</h3>
                <p className="text-xl sm:text-3xl font-bold text-red-600">{canceledReservations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6 border-l-4 border-purple-500 col-span-2 md:col-span-1">
            <div className="flex items-center">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
              <div className="ml-3 sm:ml-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600">Ingresos</h3>
                <p className="text-lg sm:text-2xl font-bold text-purple-600">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por estudiante, email o clase..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value="all">Todos los estados</option>
                <option value="PENDING">Pendientes</option>
                <option value="CONFIRMED">Confirmadas</option>
                <option value="PAID">Pagadas</option>
                <option value="COMPLETED">Completadas</option>
                <option value="CANCELED">Canceladas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reservations List */}
        <div className="space-y-4 sm:space-y-6">
          {filteredReservations.map((reservation) => (
            <div key={reservation.id} className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{reservation.user.name}</h3>
                        <p className="text-gray-600 text-xs sm:text-sm mb-2 truncate">{reservation.user.email}</p>
                        {reservation.user.phone && (
                          <p className="text-gray-600 text-xs sm:text-sm mb-2 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {reservation.user.phone}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(reservation.status)}`}>
                            {getStatusIcon(reservation.status)}
                            <span className="ml-1">{getStatusLabel(reservation.status)}</span>
                          </span>
                          {reservation.payment && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${reservation.payment.status === 'PAID'
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                              }`}>
                              {reservation.payment.status === 'PAID' ? 'Pagado' : 'Sin pagar'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">{reservation.class.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(reservation.class.level)}`}>
                        {reservation.class.level === 'BEGINNER' ? 'Principiante' :
                          reservation.class.level === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{formatDate(reservation.class.date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">Instructor: {reservation.class.instructor}</span>
                      </div>
                      {reservation.class.duration && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{reservation.class.duration} min</span>
                        </div>
                      )}
                      <div className="flex items-center font-medium text-green-600">
                        <DollarSign className="w-4 h-4 mr-1 flex-shrink-0" />
                        {formatCurrency(reservation.class.price)}
                      </div>
                    </div>
                  </div>

                  {reservation.specialRequest && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-xs sm:text-sm text-blue-800">
                        <span className="font-medium">Solicitud especial:</span> &quot;{reservation.specialRequest}&quot;
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                    <span>Reservado: {formatDate(reservation.createdAt)}</span>
                    {reservation.updatedAt !== reservation.createdAt && (
                      <span>Actualizado: {formatDate(reservation.updatedAt)}</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:min-w-[200px]">
                  <button
                    onClick={() => handleViewReservation(reservation)}
                    className="flex items-center justify-center px-3 sm:px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium border border-blue-200"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalles
                  </button>
                  <button
                    onClick={() => handleEditReservation(reservation)}
                    className="flex items-center justify-center px-3 sm:px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-sm font-medium border border-indigo-200"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleManagePayment(reservation)}
                    className="flex items-center justify-center px-3 sm:px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium border border-purple-200"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pagos
                  </button>
                  {reservation.status !== 'CANCELED' && reservation.status !== 'COMPLETED' && (
                    <>
                      {reservation.status === 'PENDING' && (
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'CONFIRMED')}
                          disabled={actionLoading}
                          className="flex items-center justify-center px-3 sm:px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm font-medium border border-green-200 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirmar
                        </button>
                      )}
                      <button
                        onClick={() => handleCancelReservation(reservation.id)}
                        disabled={actionLoading}
                        className="flex items-center justify-center px-3 sm:px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium border border-red-200 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredReservations.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron reservas</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              {searchTerm || statusFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no hay reservas registradas'
              }
            </p>
          </div>
        )}

        {/* Modal Detalles de la Reserva */}
        {showDetailModal && selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4" onClick={() => setShowDetailModal(false)}>
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()} style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Reserva #{selectedReservation.id}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Información del Estudiante */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Información del Estudiante
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Nombre:</span>
                      <p className="text-gray-900">{selectedReservation.user.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <p className="text-gray-900 break-all">{selectedReservation.user.email}</p>
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
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <School className="w-4 h-4 mr-2" />
                    Información de la Clase
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
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
                    <div className="sm:col-span-2">
                      <span className="font-medium text-gray-700">Precio:</span>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedReservation.class.price)}</p>
                    </div>
                  </div>
                </div>

                {/* Estado de la Reserva */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Estado de la Reserva</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Estado:</span>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedReservation.status)}`}>
                          {getStatusIcon(selectedReservation.status)}
                          <span className="ml-1">{getStatusLabel(selectedReservation.status)}</span>
                        </span>
                      </div>
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
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-gray-900 mb-2">Solicitud Especial</h4>
                    <p className="text-gray-800 italic text-sm">&quot;{selectedReservation.specialRequest}&quot;</p>
                  </div>
                )}

                {/* Información de Pago */}
                {selectedReservation.payment && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Información de Pago
                    </h4>
                    <div className="space-y-3">
                      {selectedReservation.payment.originalAmount && selectedReservation.payment.originalAmount !== selectedReservation.payment.amount && (
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-600">Precio Original:</span>
                            <span className="font-medium text-gray-900 line-through">{formatCurrency(selectedReservation.payment.originalAmount)}</span>
                          </div>
                          {selectedReservation.payment.discountAmount && selectedReservation.payment.discountAmount > 0 && (
                            <div className="flex justify-between items-center text-sm mb-2">
                              <span className="text-green-600 font-medium flex items-center gap-1">
                                <span>Descuento</span>
                                {selectedReservation.payment.discountCode && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                    {selectedReservation.payment.discountCode.code}
                                  </span>
                                )}
                                :
                              </span>
                              <span className="font-semibold text-green-600">-{formatCurrency(selectedReservation.payment.discountAmount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="font-medium text-gray-700">Total a Pagar:</span>
                            <span className="text-gray-900 text-lg font-bold">{formatCurrency(selectedReservation.payment.amount)}</span>
                          </div>
                        </div>
                      )}
                      {(!selectedReservation.payment.originalAmount || selectedReservation.payment.originalAmount === selectedReservation.payment.amount) && (
                        <div>
                          <span className="font-medium text-gray-700">Monto:</span>
                          <p className="text-gray-900 text-lg font-semibold">{formatCurrency(selectedReservation.payment.amount)}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Estado:</span>
                          <div className="mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${selectedReservation.payment.status === 'PAID'
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                              }`}>
                              {selectedReservation.payment.status === 'PAID' ? 'Pagado' : 'Sin pagar'}
                            </span>
                          </div>
                        </div>
                        {selectedReservation.payment.paymentMethod && (
                          <div>
                            <span className="font-medium text-gray-700">Método:</span>
                            <p className="text-gray-900">
                              {selectedReservation.payment.paymentMethod === 'credit_card' ? 'Tarjeta de Crédito' :
                                selectedReservation.payment.paymentMethod === 'cash' ? 'Efectivo' :
                                  selectedReservation.payment.paymentMethod === 'transfer' ? 'Transferencia' :
                                    selectedReservation.payment.paymentMethod}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEditReservation(selectedReservation);
                  }}
                  className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Reserva
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleManagePayment(selectedReservation);
                  }}
                  className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Gestionar Pago
                </button>
                {selectedReservation.status !== 'CANCELED' && selectedReservation.status !== 'COMPLETED' && (
                  <>
                    {selectedReservation.status === 'PENDING' && (
                      <button
                        onClick={() => {
                          handleStatusChange(selectedReservation.id, 'CONFIRMED');
                        }}
                        disabled={actionLoading}
                        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirmar
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleCancelReservation(selectedReservation.id);
                      }}
                      disabled={actionLoading}
                      className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancelar
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar Reserva */}
        {showEditModal && selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4" onClick={() => setShowEditModal(false)}>
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()} style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Editar Reserva #{selectedReservation.id}</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="PENDING">Pendiente</option>
                    <option value="CONFIRMED">Confirmada</option>
                    <option value="PAID">Pagada</option>
                    <option value="COMPLETED">Completada</option>
                    <option value="CANCELED">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Solicitud Especial</label>
                  <textarea
                    value={editForm.specialRequest}
                    onChange={(e) => setEditForm({ ...editForm, specialRequest: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ingresa cualquier solicitud especial del estudiante..."
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={actionLoading}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Gestionar Pago */}
        {showPaymentModal && selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4" onClick={() => setShowPaymentModal(false)}>
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()} style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Gestionar Pago - Reserva #{selectedReservation.id}</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monto</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado del Pago</label>
                  <select
                    value={paymentForm.status}
                    onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="PENDING">Pendiente</option>
                    <option value="PAID">Pagado</option>
                    <option value="REFUNDED">Reembolsado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="cash">Efectivo</option>
                    <option value="credit_card">Tarjeta de Crédito</option>
                    <option value="debit_card">Tarjeta de Débito</option>
                    <option value="transfer">Transferencia</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2">
                  {selectedReservation.payment?.originalAmount && selectedReservation.payment.originalAmount !== selectedReservation.payment.amount ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-800">Precio Original:</span>
                        <span className="font-medium text-blue-900 line-through">{formatCurrency(selectedReservation.payment.originalAmount)}</span>
                      </div>
                      {selectedReservation.payment.discountAmount && selectedReservation.payment.discountAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700 font-medium">
                            Descuento {selectedReservation.payment.discountCode && `(${selectedReservation.payment.discountCode.code})`}:
                          </span>
                          <span className="font-semibold text-green-700">-{formatCurrency(selectedReservation.payment.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm pt-2 border-t border-blue-300">
                        <span className="text-blue-900 font-bold">Total a Pagar:</span>
                        <span className="font-bold text-blue-900">{formatCurrency(selectedReservation.payment.amount)}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-blue-800">
                      <strong>Precio de la clase:</strong> {formatCurrency(selectedReservation.class.price)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePayment}
                  disabled={actionLoading}
                  className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Pago
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

