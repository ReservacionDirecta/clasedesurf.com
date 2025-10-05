"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminPaymentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [payments, setPayments] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status, router]);

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
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to create payment');
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
      const res = await fetch('/api/payments/${editingPayment.id}', {
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
    } catch (err) {
      console.error(err);
      alert('Failed to update payment');
    }
  };

  const handleRefundPayment = async (paymentId: number) => {
    if (!confirm('Are you sure you want to refund this payment? This will cancel the reservation.')) return;
    
    try {
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Using API proxy routes instead of direct backend calls
      const res = await fetch('/api/payments/${paymentId}', {
        method: 'DELETE',
        headers
      });

      if (!res.ok) throw new Error('Failed to refund payment');
      
      // Refresh payments list
      const paymentsRes = await fetch('/api/payments', { headers: { Authorization: `Bearer ${token}` } });
      const paymentsData = await paymentsRes.json();
      setPayments(paymentsData);
    } catch (err) {
      console.error(err);
      alert('Failed to refund payment');
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
      case 'UNPAID': return 'bg-red-100 text-red-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'REFUNDED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <div className="flex space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="ALL">All Status</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PAID">Paid</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {showCreateForm ? 'Cancel' : 'Register Payment'}
            </button>
          </div>
        </div>

        {/* Create Payment Form */}
        {showCreateForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Register New Payment</h2>
            <form onSubmit={handleCreatePayment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Reservation *</label>
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
                  <option value="">Select a reservation</option>
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
                  placeholder="Optional transaction reference"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Register Payment
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Payment Form */}
        {editingPayment && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Edit Payment #{editingPayment.id}</h2>
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
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="UNPAID">Unpaid</option>
                  <option value="PAID">Paid</option>
                  <option value="REFUNDED">Refunded</option>
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
                  Update Payment
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
                    Payment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reservation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
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
                        ${payment.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.paymentMethod || 'N/A'}
                        {payment.transactionId && (
                          <div className="text-xs text-gray-500">ID: {payment.transactionId}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Created: {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(payment)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          {payment.status === 'PAID' && (
                            <button
                              onClick={() => handleRefundPayment(payment.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                      No payments found
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
            <h2 className="text-lg font-semibold mb-2">Payment Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </div>
                <div className="text-gray-600">Total Paid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {payments.filter(p => p.status === 'UNPAID').length}
                </div>
                <div className="text-gray-600">Unpaid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  ${payments.filter(p => p.status === 'REFUNDED').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </div>
                <div className="text-gray-600">Refunded</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {payments.length}
                </div>
                <div className="text-gray-600">Total Payments</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}