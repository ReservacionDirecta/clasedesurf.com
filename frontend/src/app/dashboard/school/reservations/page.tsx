'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Plus, Calendar, Users, DollarSign, Clock, Filter, Search, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useCrudOperations } from '@/hooks/useCrudOperations';
import { useApiCall } from '@/hooks/useApiCall';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ReservationForm from '@/components/forms/ReservationForm';
import DataTable, { Column } from '@/components/tables/DataTable';
import { Reservation } from '@/types';

export default function ReservationsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const { makeRequest } = useApiCall();

  const {
    isModalOpen,
    isDeleteDialogOpen,
    selectedItem,
    itemToDelete,
    isLoading,
    handleSubmit,
    openCreateModal,
    openEditModal,
    closeModal,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete
  } = useCrudOperations<Reservation>({
    endpoint: '/api/reservations',
    onSuccess: (action) => {
      fetchReservations();
      if (action === 'create') {
        alert('Reservación creada exitosamente');
      } else if (action === 'update') {
        alert('Reservación actualizada exitosamente');
      } else if (action === 'delete') {
        alert('Reservación eliminada exitosamente');
      }
    },
    onError: (error) => {
      alert(`Error: ${error}`);
    }
  });

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

    fetchReservations();
  }, [session, status, router]);

  const fetchReservations = async () => {
    try {
      // Datos mock más completos para reservaciones
      const mockReservations: Reservation[] = [
        {
          id: 1,
          user: {
            id: 1,
            name: 'María González',
            email: 'maria.gonzalez@email.com',
            phone: '+51 999 111 222',
            canSwim: true
          },
          class: {
            id: 1,
            title: 'Surf para Principiantes',
            date: '2024-12-20T09:00:00Z',
            duration: 120,
            level: 'BEGINNER',
            price: 80,
            capacity: 8,
            instructor: 'Carlos Mendoza'
          },
          status: 'CONFIRMED',
          specialRequest: 'Primera vez surfeando, necesito equipo completo',
          payment: {
            id: 1,
            amount: 80,
            status: 'PAID',
            paymentMethod: 'CREDIT_CARD',
            paidAt: '2024-12-15T10:30:00Z'
          },
          createdAt: '2024-12-15T08:00:00Z'
        },
        {
          id: 2,
          user: {
            id: 2,
            name: 'Diego Fernández',
            email: 'diego.fernandez@email.com',
            phone: '+51 999 333 444',
            canSwim: true
          },
          class: {
            id: 2,
            title: 'Técnicas Avanzadas',
            date: '2024-12-21T14:00:00Z',
            duration: 90,
            level: 'ADVANCED',
            price: 120,
            capacity: 6,
            instructor: 'Ana Rodríguez'
          },
          status: 'PAID',
          specialRequest: null,
          payment: {
            id: 2,
            amount: 120,
            status: 'PAID',
            paymentMethod: 'YAPE',
            paidAt: '2024-12-16T15:45:00Z'
          },
          createdAt: '2024-12-16T12:00:00Z'
        },
        {
          id: 3,
          user: {
            id: 3,
            name: 'Sofía López',
            email: 'sofia.lopez@email.com',
            phone: '+51 999 555 666',
            canSwim: false
          },
          class: {
            id: 3,
            title: 'Surf Intermedio',
            date: '2024-12-22T11:00:00Z',
            duration: 105,
            level: 'INTERMEDIATE',
            price: 100,
            capacity: 8,
            instructor: 'Roberto Silva'
          },
          status: 'PENDING',
          specialRequest: 'No sé nadar, necesito chaleco salvavidas',
          payment: {
            id: 3,
            amount: 100,
            status: 'UNPAID',
            paymentMethod: null,
            paidAt: null
          },
          createdAt: '2024-12-17T09:30:00Z'
        },
        {
          id: 4,
          user: {
            id: 4,
            name: 'Carlos Mendoza',
            email: 'carlos.mendoza@email.com',
            phone: '+51 999 777 888',
            canSwim: true
          },
          class: {
            id: 4,
            title: 'Longboard Clásico',
            date: '2024-12-23T16:00:00Z',
            duration: 120,
            level: 'INTERMEDIATE',
            price: 110,
            capacity: 6,
            instructor: 'María Gonzales'
          },
          status: 'COMPLETED',
          specialRequest: 'Prefiero tabla longboard',
          payment: {
            id: 4,
            amount: 110,
            status: 'PAID',
            paymentMethod: 'BANK_TRANSFER',
            paidAt: '2024-12-18T11:20:00Z'
          },
          createdAt: '2024-12-18T08:15:00Z'
        },
        {
          id: 5,
          user: {
            id: 5,
            name: 'Ana Rodríguez',
            email: 'ana.rodriguez@email.com',
            phone: '+51 999 999 000',
            canSwim: true
          },
          class: {
            id: 5,
            title: 'Surf Nocturno',
            date: '2024-12-19T18:00:00Z',
            duration: 90,
            level: 'ADVANCED',
            price: 150,
            capacity: 4,
            instructor: 'Diego Fernández'
          },
          status: 'CANCELED',
          specialRequest: null,
          payment: {
            id: 5,
            amount: 150,
            status: 'REFUNDED',
            paymentMethod: 'PAYPAL',
            paidAt: null
          },
          createdAt: '2024-12-14T16:45:00Z'
        }
      ];

      setReservations(mockReservations);
      setFilteredReservations(mockReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  // Filtrar reservaciones
  useEffect(() => {
    let filtered = reservations;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(reservation =>
        reservation.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.class?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === statusFilter);
    }

    // Filtro por fecha
    if (dateFilter !== 'all') {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      filtered = filtered.filter(reservation => {
        if (!reservation.class?.date) return false;
        const classDate = new Date(reservation.class.date);
        
        switch (dateFilter) {
          case 'today':
            return classDate.toDateString() === today.toDateString();
          case 'tomorrow':
            return classDate.toDateString() === tomorrow.toDateString();
          case 'week':
            return classDate >= today && classDate <= nextWeek;
          default:
            return true;
        }
      });
    }

    setFilteredReservations(filtered);
  }, [reservations, searchTerm, statusFilter, dateFilter]);

  const handleViewReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowViewModal(true);
  };

  const handleUpdateStatus = async (reservationId: number, newStatus: string) => {
    try {
      // Aquí iría la llamada a la API para actualizar el estado
      const updatedReservations = reservations.map(reservation =>
        reservation.id === reservationId
          ? { ...reservation, status: newStatus as any }
          : reservation
      );
      setReservations(updatedReservations);
      alert(`Estado actualizado a ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado');
    }
  };

  const columns: Column<Reservation>[] = [
    {
      key: 'user',
      label: 'Usuario',
      render: (item) => item.user?.name || 'N/A'
    },
    {
      key: 'class',
      label: 'Clase',
      render: (item) => item.class?.title || 'N/A'
    },
    {
      key: 'date',
      label: 'Fecha de Clase',
      render: (item) => item.class?.date ? new Date(item.class.date).toLocaleDateString('es-ES') : 'N/A'
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item) => {
        const statusMap: Record<string, { label: string; color: string }> = {
          PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
          CONFIRMED: { label: 'Confirmada', color: 'bg-blue-100 text-blue-800' },
          PAID: { label: 'Pagada', color: 'bg-green-100 text-green-800' },
          CANCELED: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
          COMPLETED: { label: 'Completada', color: 'bg-purple-100 text-purple-800' }
        };
        const statusInfo = statusMap[item.status] || { label: item.status, color: 'bg-gray-100 text-gray-800' };
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        );
      }
    },
    {
      key: 'price',
      label: 'Precio',
      render: (item) => item.class?.price ? `$${item.class.price.toFixed(2)}` : 'N/A'
    },
    {
      key: 'payment',
      label: 'Pago',
      render: (item) => {
        if (!item.payment) return '-';
        const statusMap: Record<string, { label: string; color: string }> = {
          UNPAID: { label: 'Sin pagar', color: 'bg-red-100 text-red-800' },
          PAID: { label: 'Pagado', color: 'bg-green-100 text-green-800' },
          REFUNDED: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-800' }
        };
        const paymentInfo = statusMap[item.payment.status] || { label: item.payment.status, color: 'bg-gray-100 text-gray-800' };
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentInfo.color}`}>
            {paymentInfo.label}
          </span>
        );
      }
    },
    {
      key: 'createdAt',
      label: 'Fecha de Reserva',
      render: (item) => new Date(item.createdAt || '').toLocaleDateString('es-ES')
    }
  ];

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
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Reservaciones</h1>
              <p className="text-gray-600 mt-1">Administra todas las reservaciones de clases</p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nueva Reservación
            </button>
          </div>
        </div>

        {/* Reservations Table */}
        <DataTable
          data={reservations}
          columns={columns}
          onEdit={(item) => openEditModal(item)}
          onDelete={(item) => openDeleteDialog(item.id, `Reservación de ${item.user?.name}`)}
          emptyMessage="No hay reservaciones registradas. Crea la primera reservación para comenzar."
        />

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={selectedItem ? 'Editar Reservación' : 'Nueva Reservación'}
          size="lg"
        >
          <ReservationForm
            reservation={selectedItem || undefined}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            isLoading={isLoading}
          />
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={closeDeleteDialog}
          onConfirm={confirmDelete}
          title="Eliminar Reservación"
          message={`¿Estás seguro de que deseas eliminar "${itemToDelete?.name}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="danger"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}