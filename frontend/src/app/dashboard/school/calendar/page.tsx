'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, Filter, Download, Plus } from 'lucide-react';
import { useApiCall } from '@/hooks/useApiCall';
import ReservationCalendar from '@/components/calendar/ReservationCalendar';
import Modal from '@/components/ui/Modal';
import { Reservation } from '@/types';

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { makeRequest } = useApiCall();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.role !== 'SCHOOL_ADMIN' && session.user?.role !== 'ADMIN') {
      router.push('/dashboard/student/profile');
      return;
    }

    fetchSchoolInfo();
  }, [session, status, router]);

  const fetchSchoolInfo = async () => {
    try {
      if (session?.user?.role === 'SCHOOL_ADMIN') {
        const result = await makeRequest('/api/schools/my-school', { method: 'GET' });
        if (result.data) {
          setSchoolId(result.data.id);
        }
      }
    } catch (error) {
      console.error('Error fetching school info:', error);
    }
  };

  const handleViewReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsViewModalOpen(true);
  };

  const handleEditReservation = (reservation: Reservation) => {
    router.push(`/dashboard/school/reservations?edit=${reservation.id}`);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedReservation(null);
  };

  const exportCalendar = () => {
    // TODO: Implement calendar export functionality
    alert('Función de exportar calendario próximamente disponible');
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                Calendario de Reservas
              </h1>
              <p className="text-gray-600 mt-1">
                Visualiza y gestiona todas las reservas de {session?.user?.role === 'SCHOOL_ADMIN' ? 'tu escuela' : 'todas las escuelas'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">Todos los estados</option>
                  <option value="PENDING">Pendientes</option>
                  <option value="CONFIRMED">Confirmadas</option>
                  <option value="PAID">Pagadas</option>
                  <option value="COMPLETED">Completadas</option>
                  <option value="CANCELED">Canceladas</option>
                </select>
              </div>

              {/* Export */}
              <button
                onClick={exportCalendar}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>

              {/* New Reservation */}
              <button
                onClick={() => router.push('/dashboard/school/reservations?new=true')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nueva Reserva
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Leyenda de Estados</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-600">Pendiente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Confirmada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Pagada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-sm text-gray-600">Completada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Cancelada</span>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <ReservationCalendar
          onViewReservation={handleViewReservation}
          onEditReservation={handleEditReservation}
          schoolId={schoolId || undefined}
        />

        {/* View Reservation Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
          title="Detalles de la Reserva"
          size="lg"
        >
          {selectedReservation && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedReservation.class?.title || 'Clase de Surf'}
                </h3>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeColor(selectedReservation.status)}`}>
                  {selectedReservation.status.replace('_', ' ')}
                </span>
              </div>

              {/* Student Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Información del Estudiante</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Nombre</label>
                    <p className="font-medium">{selectedReservation.user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p className="font-medium">{selectedReservation.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Teléfono</label>
                    <p className="font-medium">{selectedReservation.user?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">¿Sabe nadar?</label>
                    <p className="font-medium">
                      {selectedReservation.user?.canSwim ? 'Sí' : 'No'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Class Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Información de la Clase</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Fecha y Hora</label>
                    <p className="font-medium">
                      {selectedReservation.class?.date ? 
                        new Date(selectedReservation.class.date).toLocaleString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Duración</label>
                    <p className="font-medium">
                      {selectedReservation.class?.duration ? `${selectedReservation.class.duration} minutos` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Nivel</label>
                    <p className="font-medium">
                      {selectedReservation.class?.level || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Instructor</label>
                    <p className="font-medium">
                      {selectedReservation.class?.instructor || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Precio</label>
                    <p className="font-medium text-green-600">
                      {selectedReservation.class?.price ? formatCurrency(selectedReservation.class.price) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Capacidad</label>
                    <p className="font-medium">
                      {selectedReservation.class?.capacity ? `${selectedReservation.class.capacity} personas` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Special Request */}
              {selectedReservation.specialRequest && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Solicitud Especial</h4>
                  <p className="text-gray-700">{selectedReservation.specialRequest}</p>
                </div>
              )}

              {/* Payment Info */}
              {selectedReservation.payment && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Información de Pago</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Estado</label>
                      <p className="font-medium">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          selectedReservation.payment.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          selectedReservation.payment.status === 'UNPAID' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedReservation.payment.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Monto</label>
                      <p className="font-medium text-green-600">
                        {formatCurrency(selectedReservation.payment.amount)}
                      </p>
                    </div>
                    {selectedReservation.payment.paymentMethod && (
                      <div>
                        <label className="text-sm text-gray-600">Método</label>
                        <p className="font-medium">{selectedReservation.payment.paymentMethod}</p>
                      </div>
                    )}
                    {selectedReservation.payment.paidAt && (
                      <div>
                        <label className="text-sm text-gray-600">Fecha de Pago</label>
                        <p className="font-medium">
                          {new Date(selectedReservation.payment.paidAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  onClick={closeViewModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    closeViewModal();
                    handleEditReservation(selectedReservation);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Editar Reserva
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}