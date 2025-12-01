"use client";

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useConfirm } from '@/hooks/useConfirm';
import { MoreVertical, Edit, XCircle, RotateCcw, Ban, Trash2 } from 'lucide-react';

export default function AdminPaymentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { success, error, handleError } = useNotifications();
  const { confirm, ConfirmDialog } = useConfirm();

  const [payments, setPayments] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    reservationId: '',
    amount: '',
    paymentMethod: 'manual',
    transactionId: '',
    status: 'PAID'
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !(session as any).user || (session as any).user.role !== 'ADMIN') {
      router.push('/denied');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = (session as any)?.backendToken;
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Using API proxy routes instead of direct backend calls
        const [paymentsRes, reservationsRes] = await Promise.all([
          fetch('/api/payments', { headers }),
          fetch('/api/reservations/all', { headers })
        ]);

        if (!paymentsRes.ok || !reservationsRes.ok) throw new Error('Failed to fetch data');
        
        const [paymentsData, reservationsData] = await Promise.all([
          paymentsRes.json(),
          reservationsRes.json()
        ]);
        
      setPayments(paymentsData);
      setReservations(reservationsData);
    } catch (err) {
      handleError(err, 'Error al cargar los pagos');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
  }, [session, status, router, handleError]);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Using API proxy routes instead of direct backend calls
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...formData,
          reservationId: parseInt(formData.reservationId),
          amount: parseFloat(formData.amount)
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create payment');
      }
      
      // Refresh payments list
      const paymentsRes = await fetch('/api/payments', { headers: { Authorization: `Bearer ${token}` } });
      const paymentsData = await paymentsRes.json();
      setPayments(paymentsData);
      
      // Reset form
      setFormData({
        reservationId: '',
        amount: '',
        paymentMethod: 'manual',
        transactionId: '',
        status: 'PAID'
      });
      setShowCreateForm(false);
      success('Pago registrado exitosamente');
    } catch (err: any) {
      handleError(err, 'Error al registrar el pago');
    }
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;

    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Using API proxy routes instead of direct backend calls
      const res = await fetch(`/api/payments/${editingPayment.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          status: formData.status,
          paymentMethod: formData.paymentMethod,
          transactionId: formData.transactionId || null
        })
      });

      if (!res.ok) throw new Error('Failed to update payment');
      
      // Refresh payments list
      const paymentsRes = await fetch('/api/payments', { headers: { Authorization: `Bearer ${token}` } });
      const paymentsData = await paymentsRes.json();
      setPayments(paymentsData);
      
      setEditingPayment(null);
      success('Pago actualizado exitosamente');
    } catch (err) {
      handleError(err, 'Error al actualizar el pago');
    }
  };

  // Suspender pago - cambiar a UNPAID
  const handleSuspendPayment = async (paymentId: number) => {
    const confirmed = await confirm({
      title: 'Suspender Pago',
      message: '¿Estás seguro de que deseas suspender este pago? El estado cambiará a "Sin Pagar".',
      confirmText: 'Suspender',
      cancelText: 'Cancelar',
      variant: 'warning',
    });

    if (!confirmed) return;

    await updatePaymentStatus(paymentId, 'UNPAID', 'Pago suspendido exitosamente');
  };

  // Anular pago - cambiar a REFUNDED sin cancelar reserva
  const handleVoidPayment = async (paymentId: number) => {
    const confirmed = await confirm({
      title: 'Anular Pago',
      message: '¿Estás seguro de que deseas anular este pago? El estado cambiará a "Reembolsado" pero la reserva NO se cancelará automáticamente.',
      confirmText: 'Anular',
      cancelText: 'Cancelar',
      variant: 'warning',
    });

    if (!confirmed) return;

    try {
      setActionLoading(paymentId);
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payment = payments.find(p => p.id === paymentId);
      const originalReservationStatus = payment?.reservation?.status;

      // Cambiar estado del pago a REFUNDED
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          status: 'REFUNDED',
          paidAt: null
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || 'Error al anular el pago');
      }

      // Si la reserva se canceló automáticamente, restaurarla al estado original si no era CANCELED
      if (payment?.reservationId && originalReservationStatus && originalReservationStatus !== 'CANCELED') {
        // Verificar el estado actual de la reserva
        const reservationRes = await fetch(`/api/reservations/${payment.reservationId}`, { headers });
        if (reservationRes.ok) {
          const reservation = await reservationRes.json();
          // Si se canceló, restaurar al estado original
          if (reservation.status === 'CANCELED' && originalReservationStatus !== 'CANCELED') {
            await fetch(`/api/reservations/${payment.reservationId}`, {
              method: 'PUT',
              headers,
              body: JSON.stringify({ status: originalReservationStatus })
            });
          }
        }
      }
      
      // Refresh payments list
      const paymentsRes = await fetch('/api/payments', { headers: { Authorization: `Bearer ${token}` } });
      const paymentsData = await paymentsRes.json();
      setPayments(paymentsData);
      success('Pago anulado exitosamente. La reserva se mantiene activa.');
    } catch (err) {
      handleError(err, 'Error al anular el pago');
    } finally {
      setActionLoading(null);
      setShowActionMenu(null);
    }
  };

  // Devolver pago - cambiar a REFUNDED y cancelar reserva
  const handleRefundPayment = async (paymentId: number) => {
    const confirmed = await confirm({
      title: 'Devolver Pago',
      message: '¿Estás seguro de que deseas devolver este pago? El pago se marcará como reembolsado y la reserva se cancelará.',
      confirmText: 'Devolver',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      setActionLoading(paymentId);
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Usar DELETE para devolver (marca como REFUNDED y cancela reserva)
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: 'DELETE',
        headers
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || 'Error al devolver el pago');
      }
      
      // Refresh payments list
      const paymentsRes = await fetch('/api/payments', { headers: { Authorization: `Bearer ${token}` } });
      const paymentsData = await paymentsRes.json();
      setPayments(paymentsData);
      success('Pago devuelto exitosamente. La reserva ha sido cancelada.');
    } catch (err) {
      handleError(err, 'Error al devolver el pago');
    } finally {
      setActionLoading(null);
      setShowActionMenu(null);
    }
  };

  // Cancelar pago - similar a devolver
  const handleCancelPayment = async (paymentId: number) => {
    const confirmed = await confirm({
      title: 'Cancelar Pago',
      message: '¿Estás seguro de que deseas cancelar este pago? El pago se marcará como reembolsado y la reserva se cancelará.',
      confirmText: 'Cancelar Pago',
      cancelText: 'No Cancelar',
      variant: 'danger',
    });

    if (!confirmed) return;

    // Cancelar es igual a devolver
    await handleRefundPayment(paymentId);
  };

  // Función helper para actualizar estado de pago
  const updatePaymentStatus = async (
    paymentId: number, 
    newStatus: string, 
    successMessage: string
  ) => {
    try {
      setActionLoading(paymentId);
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/payments/${paymentId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          status: newStatus,
          paidAt: newStatus === 'PAID' ? new Date().toISOString() : null
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || 'Error al actualizar el pago');
      }
      
      // Refresh payments list
      const paymentsRes = await fetch('/api/payments', { headers: { Authorization: `Bearer ${token}` } });
      const paymentsData = await paymentsRes.json();
      setPayments(paymentsData);
      success(successMessage);
    } catch (err) {
      handleError(err, 'Error al actualizar el pago');
    } finally {
      setActionLoading(null);
      setShowActionMenu(null);
    }
  };

  const startEdit = (payment: any) => {
    setEditingPayment(payment);
    setFormData({
      reservationId: payment.reservationId.toString(),
      amount: payment.amount.toString(),
      paymentMethod: payment.paymentMethod || 'manual',
      transactionId: payment.transactionId || '',
      status: payment.status
    });
  };

  const filteredPayments = filter === 'ALL' 
    ? payments 
    : payments.filter(p => p.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UNPAID': return 'bg-red-100 text-red-800 border-red-300';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'PAID': return 'bg-green-100 text-green-800 border-green-300';
      case 'REFUNDED': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'UNPAID': return 'Sin Pagar';
      case 'PENDING': return 'Pendiente';
      case 'PAID': return 'Pagado';
      case 'REFUNDED': return 'Reembolsado';
      default: return status;
    }
  };

  // Get unpaid reservations for the create form
  const unpaidReservations = reservations.filter(r => 
    r.status !== 'CANCELED' && !payments.some(p => p.reservationId === r.id)
  );

  if (status === 'loading' || loading) return <div className="p-8">Loading payments...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Pagos</h1>
            <p className="text-gray-600 mt-1">Administra y gestiona todos los pagos del sistema</p>
          </div>
          <div className="flex space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="UNPAID">Sin Pagar</option>
              <option value="PENDING">Pendiente</option>
              <option value="PAID">Pagado</option>
              <option value="REFUNDED">Reembolsado</option>
            </select>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {showCreateForm ? 'Cancelar' : 'Registrar Pago'}
            </button>
          </div>
        </div>

        {/* Create Payment Form */}
        {showCreateForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Registrar Nuevo Pago</h2>
            <form onSubmit={handleCreatePayment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Reserva *</label>
                <select
                  required
                  value={formData.reservationId}
                  onChange={(e) => {
                    const reservationId = e.target.value;
                    const reservation = reservations.find(r => r.id === parseInt(reservationId));
                    setFormData({
                      ...formData, 
                      reservationId,
                      amount: reservation?.class?.price?.toString() || ''
                    });
                  }}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Selecciona una reserva</option>
                  {unpaidReservations.map(reservation => (
                    <option key={reservation.id} value={reservation.id}>
                      #{reservation.id} - {reservation.user?.name} - {reservation.class?.title} (${reservation.class?.price})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="manual">Manual</option>
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="transfer">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Transaction ID</label>
                <input
                  type="text"
                  value={formData.transactionId}
                  onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="Referencia de transacción (opcional)"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Registrar Pago
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Payment Form */}
        {editingPayment && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Editar Pago #{editingPayment.id}</h2>
            <form onSubmit={handleUpdatePayment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="UNPAID">Sin Pagar</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="PAID">Pagado</option>
                  <option value="REFUNDED">Reembolsado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="manual">Manual</option>
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="transfer">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Transaction ID</label>
                <input
                  type="text"
                  value={formData.transactionId}
                  onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="md:col-span-2 flex space-x-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Actualizar Pago
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPayment(null)}
                  className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reserva
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clase
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments && filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{payment.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{payment.reservationId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{payment.reservation?.user?.name || 'N/A'}</div>
                          <div className="text-gray-500">{payment.reservation?.user?.email || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{payment.reservation?.class?.title || 'N/A'}</div>
                          <div className="text-gray-500">{payment.reservation?.class?.school?.name || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        S/ {payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.paymentMethod || 'N/A'}
                        {payment.transactionId && (
                          <div className="text-xs text-gray-500">ID: {payment.transactionId}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(payment.status)}`}>
                          {getStatusLabel(payment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('es-PE') : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Creado: {new Date(payment.createdAt).toLocaleDateString('es-PE')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="relative">
                          <button
                            onClick={() => setShowActionMenu(showActionMenu === payment.id ? null : payment.id)}
                            disabled={actionLoading === payment.id}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            aria-label="Más acciones"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          
                          {showActionMenu === payment.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setShowActionMenu(null)}
                              />
                              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                                <button
                                  onClick={() => {
                                    startEdit(payment);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  Editar Pago
                                </button>
                                
                                {payment.status === 'PAID' && (
                                  <>
                                    <button
                                      onClick={() => handleSuspendPayment(payment.id)}
                                      disabled={actionLoading === payment.id}
                                      className="w-full px-4 py-2 text-left text-sm text-yellow-700 hover:bg-yellow-50 flex items-center gap-2 disabled:opacity-50"
                                    >
                                      <Ban className="w-4 h-4" />
                                      {actionLoading === payment.id ? 'Suspender...' : 'Suspender'}
                                    </button>
                                    <button
                                      onClick={() => handleVoidPayment(payment.id)}
                                      disabled={actionLoading === payment.id}
                                      className="w-full px-4 py-2 text-left text-sm text-orange-700 hover:bg-orange-50 flex items-center gap-2 disabled:opacity-50"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      {actionLoading === payment.id ? 'Anular...' : 'Anular'}
                                    </button>
                                    <button
                                      onClick={() => handleRefundPayment(payment.id)}
                                      disabled={actionLoading === payment.id}
                                      className="w-full px-4 py-2 text-left text-sm text-blue-700 hover:bg-blue-50 flex items-center gap-2 disabled:opacity-50"
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                      {actionLoading === payment.id ? 'Devolver...' : 'Devolver'}
                                    </button>
                                    <button
                                      onClick={() => handleCancelPayment(payment.id)}
                                      disabled={actionLoading === payment.id}
                                      className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      {actionLoading === payment.id ? 'Cancelar...' : 'Cancelar'}
                                    </button>
                                  </>
                                )}
                                
                                {(payment.status === 'PENDING' || payment.status === 'UNPAID') && (
                                  <button
                                    onClick={() => updatePaymentStatus(payment.id, 'PAID', 'Pago marcado como pagado')}
                                    disabled={actionLoading === payment.id}
                                    className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 flex items-center gap-2 disabled:opacity-50"
                                  >
                                    <Edit className="w-4 h-4" />
                                    {actionLoading === payment.id ? 'Marcar como pagado...' : 'Marcar como Pagado'}
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                      No se encontraron pagos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Statistics */}
        {payments && payments.length > 0 && (
          <div className="mt-6 bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Resumen de Pagos</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  S/ {payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </div>
                <div className="text-gray-600">Total Pagado</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {payments.filter(p => p.status === 'UNPAID').length}
                </div>
                <div className="text-gray-600">Sin Pagar</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  S/ {payments.filter(p => p.status === 'REFUNDED').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </div>
                <div className="text-gray-600">Reembolsado</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {payments.length}
                </div>
                <div className="text-gray-600">Total Pagos</div>
              </div>
            </div>
          </div>
        )}
      </div>
      {ConfirmDialog}
    </div>
  );
}
