'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Plus, DollarSign, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';
import { useCrudOperations } from '@/hooks/useCrudOperations';
import { useApiCall } from '@/hooks/useApiCall';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import PaymentForm from '@/components/forms/PaymentForm';
import DataTable, { Column } from '@/components/tables/DataTable';
import { Payment } from '@/types';

export default function PaymentsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
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
  } = useCrudOperations<Payment>({
    endpoint: '/api/payments',
    onSuccess: (action) => {
      fetchPayments();
      if (action === 'create') {
        alert('Pago creado exitosamente');
      } else if (action === 'update') {
        alert('Pago actualizado exitosamente');
      } else if (action === 'delete') {
        alert('Pago eliminado exitosamente');
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

    fetchPayments();
  }, [session, status, router]);

  const fetchPayments = async () => {
    try {
      const result = await makeRequest('/api/payments', { method: 'GET' });
      if (result.data) {
        setPayments(result.data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return '💳';
      case 'YAPE':
        return '📱';
      case 'PLIN':
        return '📲';
      case 'BANK_TRANSFER':
        return '🏦';
      case 'PAYPAL':
        return '🅿️';
      case 'CASH':
        return '💵';
      default:
        return '💰';
    }
  };

  const getProviderBadgeColor = (provider: string) => {
    switch (provider) {
      case 'STRIPE':
        return 'bg-purple-100 text-purple-800';
      case 'PAYPAL':
        return 'bg-blue-100 text-blue-800';
      case 'CULQI':
        return 'bg-green-100 text-green-800';
      case 'YAPE':
        return 'bg-purple-100 text-purple-800';
      case 'PLIN':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: Column<Payment>[] = [
    {
      key: 'reservation',
      label: 'Reservación',
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">
            {item.reservation?.user?.name || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">
            {item.reservation?.class?.title || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Monto',
      render: (item) => (
        <div className="font-semibold text-green-600">
          ${item.amount.toFixed(2)}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item) => {
        const statusMap: Record<string, { label: string; color: string }> = {
          UNPAID: { label: 'Sin Pagar', color: 'bg-red-100 text-red-800' },
          PAID: { label: 'Pagado', color: 'bg-green-100 text-green-800' },
          REFUNDED: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-800' }
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
      key: 'paymentMethod',
      label: 'Método',
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="text-lg">{getPaymentMethodIcon(item.paymentMethod || '')}</span>
          <span className="text-sm">{item.paymentMethod?.replace('_', ' ') || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'paymentProvider',
      label: 'Proveedor',
      render: (item) => item.paymentProvider ? (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getProviderBadgeColor(item.paymentProvider)}`}>
          {item.paymentProvider}
        </span>
      ) : '-'
    },
    {
      key: 'transactionId',
      label: 'ID Transacción',
      render: (item) => (
        <div className="text-sm font-mono">
          {item.transactionId ? (
            <span title={item.transactionId}>
              {item.transactionId.substring(0, 8)}...
            </span>
          ) : '-'}
        </div>
      )
    },
    {
      key: 'paidAt',
      label: 'Fecha de Pago',
      render: (item) => item.paidAt ? (
        <div className="text-sm">
          {new Date(item.paidAt).toLocaleDateString('es-ES')}
        </div>
      ) : '-'
    },
    {
      key: 'createdAt',
      label: 'Creado',
      render: (item) => (
        <div className="text-sm text-gray-500">
          {new Date(item.createdAt || '').toLocaleDateString('es-ES')}
        </div>
      )
    }
  ];

  // Calcular estadísticas
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const paidAmount = payments.filter(p => p.status === 'PAID').reduce((sum, payment) => sum + payment.amount, 0);
  const unpaidAmount = payments.filter(p => p.status === 'UNPAID').reduce((sum, payment) => sum + payment.amount, 0);
  const paidCount = payments.filter(p => p.status === 'PAID').length;

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
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Pagos</h1>
              <p className="text-gray-600 mt-1">
                Administra todos los pagos y transacciones de {session?.user?.role === 'SCHOOL_ADMIN' ? 'tu escuela' : 'todas las escuelas'}
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Pago
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Ingresos</h3>
                <p className="text-3xl font-bold text-green-600">${totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Pagos Recibidos</h3>
                <p className="text-3xl font-bold text-blue-600">${paidAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Pendientes</h3>
                <p className="text-3xl font-bold text-red-600">${unpaidAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Tasa de Pago</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {payments.length > 0 ? Math.round((paidCount / payments.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <DataTable
          data={payments}
          columns={columns}
          onEdit={(item) => openEditModal(item)}
          onDelete={(item) => openDeleteDialog(item.id, `Pago de $${item.amount}`)}
          emptyMessage="No hay pagos registrados. Crea el primer pago para comenzar."
        />

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={selectedItem ? 'Editar Pago' : 'Nuevo Pago'}
          size="lg"
        >
          <PaymentForm
            payment={selectedItem || undefined}
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
          title="Eliminar Pago"
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