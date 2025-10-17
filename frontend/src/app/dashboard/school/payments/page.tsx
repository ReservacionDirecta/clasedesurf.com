'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DollarSign, CreditCard, Calendar, TrendingUp, Eye, Download, Filter, Search } from 'lucide-react';

interface Payment {
  id: number;
  reservationId: number;
  amount: number;
  status: 'PAID' | 'UNPAID' | 'REFUNDED' | 'PENDING';
  paymentMethod: 'credit_card' | 'cash' | 'bank_transfer' | '';
  transactionId: string;
  paidAt: string;
  createdAt: string;
  student: {
    id: number;
    name: string;
    email: string;
  };
  class: {
    id: number;
    title: string;
    date: string;
  };
}

export default function SchoolPayments() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PAID' | 'UNPAID' | 'REFUNDED' | 'PENDING'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'credit_card' | 'cash' | 'bank_transfer'>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
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

    fetchPayments();
  }, [session, status, router]);

  const fetchPayments = async () => {
    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/payments', { headers });
      
      if (response.ok) {
        const data = await response.json();
        
        // Transform backend data to match frontend interface
        const transformedPayments: Payment[] = data.map((payment: any) => ({
          id: payment.id,
          reservationId: payment.reservationId,
          amount: payment.amount,
          status: payment.status,
          paymentMethod: payment.paymentMethod || '',
          transactionId: payment.transactionId || '',
          paidAt: payment.paidAt || '',
          createdAt: payment.createdAt,
          student: {
            id: payment.reservation?.user?.id || 0,
            name: payment.reservation?.user?.name || 'Sin nombre',
            email: payment.reservation?.user?.email || ''
          },
          class: {
            id: payment.reservation?.class?.id || 0,
            title: payment.reservation?.class?.title || 'Sin título',
            date: payment.reservation?.class?.date || ''
          }
        }));
        
        setPayments(transformedPayments);
      } else {
        console.error('Error fetching payments:', response.statusText);
        setPayments([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.class.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'UNPAID':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="w-4 h-4" />;
      case 'cash':
        return <DollarSign className="w-4 h-4" />;
      case 'bank_transfer':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getMethodName = (method: string) => {
    switch (method) {
      case 'credit_card':
        return 'Tarjeta de Crédito';
      case 'cash':
        return 'Efectivo';
      case 'bank_transfer':
        return 'Transferencia';
      default:
        return 'No especificado';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
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

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  // Cálculos de estadísticas
  const totalRevenue = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'UNPAID' || p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0);
  const refundedAmount = payments.filter(p => p.status === 'REFUNDED').reduce((sum, p) => sum + p.amount, 0);
  const paidCount = payments.filter(p => p.status === 'PAID').length;

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando pagos...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Pagos</h1>
              <p className="text-gray-600 mt-2">Administra los pagos y transacciones de tu escuela</p>
            </div>
            <button className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-5 h-5 mr-2" />
              Exportar Reporte
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Ingresos Totales</h3>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Pendientes</h3>
                <p className="text-3xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Reembolsos</h3>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(refundedAmount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CreditCard className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Pagos Exitosos</h3>
                <p className="text-3xl font-bold text-purple-600">{paidCount}</p>
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
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="PAID">Pagados</option>
                <option value="UNPAID">Sin pagar</option>
                <option value="PENDING">Pendientes</option>
                <option value="REFUNDED">Reembolsados</option>
              </select>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los métodos</option>
                <option value="credit_card">Tarjeta</option>
                <option value="cash">Efectivo</option>
                <option value="bank_transfer">Transferencia</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiante
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
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{payment.student.name}</div>
                        <div className="text-sm text-gray-500">{payment.student.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.class.title}</div>
                      <div className="text-sm text-gray-500">{formatDate(payment.class.date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getMethodIcon(payment.paymentMethod)}
                        <span className="ml-2 text-sm text-gray-900">{getMethodName(payment.paymentMethod)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status === 'PAID' ? 'Pagado' :
                         payment.status === 'UNPAID' ? 'Sin pagar' :
                         payment.status === 'PENDING' ? 'Pendiente' : 'Reembolsado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(payment.paidAt || payment.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewPayment(payment)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron pagos</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || methodFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no hay pagos registrados'
              }
            </p>
          </div>
        )}

        {/* Modal Detalles del Pago */}
        {showDetailModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Detalles del Pago #{selectedPayment.id}
                </h3>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Información del Pago */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Información del Pago</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">ID de Pago:</span>
                      <p className="text-gray-900">#{selectedPayment.id}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">ID de Reserva:</span>
                      <p className="text-gray-900">#{selectedPayment.reservationId}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Monto:</span>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedPayment.amount)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Estado:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPayment.status)}`}>
                        {selectedPayment.status === 'PAID' ? 'Pagado' :
                         selectedPayment.status === 'UNPAID' ? 'Sin pagar' :
                         selectedPayment.status === 'PENDING' ? 'Pendiente' : 'Reembolsado'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Método de Pago:</span>
                      <div className="flex items-center">
                        {getMethodIcon(selectedPayment.paymentMethod)}
                        <span className="ml-2">{getMethodName(selectedPayment.paymentMethod)}</span>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">ID de Transacción:</span>
                      <p className="text-gray-900 font-mono text-xs">{selectedPayment.transactionId || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Información del Estudiante */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Información del Estudiante</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Nombre:</span>
                      <p className="text-gray-900">{selectedPayment.student.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <p className="text-gray-900">{selectedPayment.student.email}</p>
                    </div>
                  </div>
                </div>

                {/* Información de la Clase */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Información de la Clase</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Título:</span>
                      <p className="text-gray-900">{selectedPayment.class.title}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Fecha de la clase:</span>
                      <p className="text-gray-900">{formatDate(selectedPayment.class.date)}</p>
                    </div>
                  </div>
                </div>

                {/* Fechas */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Fechas</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Fecha de creación:</span>
                      <p className="text-gray-900">{formatDate(selectedPayment.createdAt)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Fecha de pago:</span>
                      <p className="text-gray-900">{formatDate(selectedPayment.paidAt) || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
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