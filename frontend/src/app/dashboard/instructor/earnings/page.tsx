'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Calendar, Download, Eye, Filter } from 'lucide-react';

interface Earning {
  id: number;
  date: string;
  className: string;
  students: number;
  instructorPayment: number; // Solo lo que gana el instructor
  status: 'paid' | 'pending' | 'processing';
  paymentDate?: string;
  duration: number; // Duración de la clase en minutos
}

interface EarningsStats {
  totalEarnings: number;
  monthlyEarnings: number;
  pendingPayments: number;
  averagePerClass: number;
  totalClasses: number;
  totalStudents: number;
  averagePerHour: number;
}

export default function InstructorEarnings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [stats, setStats] = useState<EarningsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('2024-12');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'processing'>('all');
  const [selectedEarning, setSelectedEarning] = useState<Earning | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.role !== 'INSTRUCTOR') {
      router.push('/dashboard/student/profile');
      return;
    }

    fetchEarnings();
  }, [session, status, router, selectedMonth]);

  const fetchEarnings = async () => {
    try {
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch real earnings data from backend
      const [earningsRes, classesRes] = await Promise.all([
        fetch('/api/instructor/earnings', { headers }),
        fetch('/api/instructor/classes', { headers })
      ]);

      if (!earningsRes.ok || !classesRes.ok) {
        throw new Error('Failed to fetch earnings data');
      }

      const earningsData = await earningsRes.json();
      const classesData = await classesRes.json();

      // Process earnings data
      const processedEarnings: Earning[] = (earningsData.recentPayments || []).map((payment: any) => {
        // Find the corresponding class
        const classInfo = classesData.classes?.find((c: any) => c.title === payment.className);
        const duration = classInfo?.duration || 120;
        const students = classInfo?.reservations?.filter((r: any) => r.status !== 'CANCELED').length || 0;
        
        return {
          id: payment.id,
          date: payment.classDate,
          className: payment.className,
          students: students,
          instructorPayment: Number(payment.amount),
          duration: duration,
          status: 'paid' as const,
          paymentDate: payment.date
        };
      });

      // Calculate stats
      const totalHours = processedEarnings.reduce((sum, e) => sum + (e.duration / 60), 0);
      const monthlyEarnings = processedEarnings
        .filter(e => e.date.startsWith(selectedMonth))
        .reduce((sum, e) => sum + e.instructorPayment, 0);

      const calculatedStats: EarningsStats = {
        totalEarnings: earningsData.totalEarnings || 0,
        monthlyEarnings: monthlyEarnings,
        pendingPayments: 0, // TODO: Calculate from pending payments
        averagePerClass: processedEarnings.length > 0 
          ? (earningsData.totalEarnings || 0) / processedEarnings.length 
          : 0,
        totalClasses: earningsData.totalClasses || 0,
        totalStudents: processedEarnings.reduce((sum, e) => sum + e.students, 0),
        averagePerHour: totalHours > 0 ? (earningsData.totalEarnings || 0) / totalHours : 0
      };

      // Fallback to mock data if no real data
      if (processedEarnings.length === 0) {
        const mockEarnings: Earning[] = [
        {
          id: 1,
          date: '2024-12-15',
          className: 'Surf para Principiantes',
          students: 6,
          instructorPayment: 408,
          duration: 120,
          status: 'pending',
        },
        {
          id: 2,
          date: '2024-12-12',
          className: 'Técnicas Avanzadas',
          students: 4,
          instructorPayment: 408,
          duration: 150,
          status: 'processing',
        },
        {
          id: 3,
          date: '2024-12-10',
          className: 'Surf Matutino',
          students: 8,
          instructorPayment: 612,
          duration: 120,
          status: 'paid',
          paymentDate: '2024-12-11'
        },
        {
          id: 4,
          date: '2024-12-08',
          className: 'Longboard Session',
          students: 7,
          instructorPayment: 595,
          duration: 180,
          status: 'paid',
          paymentDate: '2024-12-09'
        },
        {
          id: 5,
          date: '2024-12-05',
          className: 'Surf para Principiantes',
          students: 5,
          instructorPayment: 340,
          duration: 120,
          status: 'paid',
          paymentDate: '2024-12-06'
        },
        {
          id: 6,
          date: '2024-12-03',
          className: 'Técnicas Avanzadas',
          students: 6,
          instructorPayment: 612,
          duration: 150,
          status: 'paid',
          paymentDate: '2024-12-04'
        },
        {
          id: 7,
          date: '2024-12-01',
          className: 'Surf Matutino',
          students: 8,
          instructorPayment: 612,
          duration: 120,
          status: 'paid',
          paymentDate: '2024-12-02'
        }
      ];

      const totalHours = mockEarnings.reduce((sum, e) => sum + (e.duration / 60), 0);
      
      const mockStats: EarningsStats = {
        totalEarnings: mockEarnings.reduce((sum, e) => sum + e.instructorPayment, 0),
        monthlyEarnings: mockEarnings
          .filter(e => e.date.startsWith(selectedMonth))
          .reduce((sum, e) => sum + e.instructorPayment, 0),
        pendingPayments: mockEarnings
          .filter(e => e.status === 'pending' || e.status === 'processing')
          .reduce((sum, e) => sum + e.instructorPayment, 0),
        averagePerClass: mockEarnings.reduce((sum, e) => sum + e.instructorPayment, 0) / mockEarnings.length,
        totalClasses: mockEarnings.length,
        totalStudents: mockEarnings.reduce((sum, e) => sum + e.students, 0),
        averagePerHour: mockEarnings.reduce((sum, e) => sum + e.instructorPayment, 0) / totalHours
      };

        setEarnings(mockEarnings);
        setStats(mockStats);
      } else {
        setEarnings(processedEarnings);
        setStats(calculatedStats);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      setLoading(false);
    }
  };

  const filteredEarnings = earnings.filter(earning => {
    const matchesMonth = earning.date.startsWith(selectedMonth);
    const matchesStatus = statusFilter === 'all' || earning.status === statusFilter;
    return matchesMonth && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pagado';
      case 'pending':
        return 'Pendiente';
      case 'processing':
        return 'Procesando';
      default:
        return 'Desconocido';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `S/. ${amount.toFixed(2)}`;
  };

  const handleViewEarning = (earning: Earning) => {
    setSelectedEarning(earning);
    setShowDetailModal(true);
  };

  const handleDownloadReceipt = (earning: Earning) => {
    // Simular descarga de comprobante
    const receiptData = {
      id: earning.id,
      date: earning.date,
      className: earning.className,
      students: earning.students,
      payment: earning.instructorPayment,
      status: earning.status
    };
    
    const dataStr = JSON.stringify(receiptData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comprobante-${earning.id}-${earning.date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportReport = () => {
    const reportData = {
      period: selectedMonth,
      instructor: 'Gabriel Barrera',
      totalEarnings: stats?.monthlyEarnings || 0,
      totalClasses: filteredEarnings.length,
      earnings: filteredEarnings
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-ganancias-${selectedMonth}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando ganancias...</p>
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
            onClick={() => router.push('/dashboard/instructor')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Volver al Dashboard
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Ganancias</h1>
              <p className="text-gray-600 mt-2">Gestiona y revisa tus ingresos por clases</p>
            </div>
            <button 
              onClick={handleExportReport}
              className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Exportar Reporte
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Ganado</h3>
                <p className="text-3xl font-bold text-green-600">
                  {stats ? formatCurrency(stats.totalEarnings) : 'S/. 0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Este Mes</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {stats ? formatCurrency(stats.monthlyEarnings) : 'S/. 0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Pendiente</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats ? formatCurrency(stats.pendingPayments) : 'S/. 0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Por Hora</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {stats ? formatCurrency(stats.averagePerHour) : 'S/. 0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mes
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="2024-12">Diciembre 2024</option>
                <option value="2024-11">Noviembre 2024</option>
                <option value="2024-10">Octubre 2024</option>
                <option value="2024-09">Septiembre 2024</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('paid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'paid'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pagados
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setStatusFilter('processing')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'processing'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Procesando
              </button>
            </div>
          </div>
        </div>

        {/* Earnings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Detalle de Ganancias</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clase
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiantes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mi Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEarnings.map((earning) => (
                  <tr key={earning.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(earning.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{earning.className}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.floor(earning.duration / 60)}h {earning.duration % 60}min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {earning.students} estudiantes
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(earning.instructorPayment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(earning.status)}`}>
                        {getStatusText(earning.status)}
                      </span>
                      {earning.paymentDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          Pagado: {formatDate(earning.paymentDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleViewEarning(earning)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDownloadReceipt(earning)}
                        className="text-green-600 hover:text-green-900"
                        title="Descargar comprobante"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredEarnings.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ganancias</h3>
            <p className="text-gray-600">
              No se encontraron ganancias para el período seleccionado
            </p>
          </div>
        )}

        {/* Summary */}
        <div className="mt-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <h2 className="text-2xl font-bold mb-4">Resumen de Ganancias</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Total del Mes</h3>
              <p className="text-3xl font-bold">
                {stats ? formatCurrency(stats.monthlyEarnings) : 'S/. 0.00'}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Clases Impartidas</h3>
              <p className="text-3xl font-bold">{filteredEarnings.length}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Horas Trabajadas</h3>
              <p className="text-3xl font-bold">
                {Math.round(filteredEarnings.reduce((sum, e) => sum + (e.duration / 60), 0))}h
              </p>
            </div>
          </div>
        </div>

        {/* Modal Detalles de Ganancia */}
        {showDetailModal && selectedEarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Detalles del Pago</h3>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Información de la Clase */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Información de la Clase</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Clase:</span>
                      <p className="text-gray-900">{selectedEarning.className}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Fecha:</span>
                      <p className="text-gray-900">{formatDate(selectedEarning.date)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Duración:</span>
                      <p className="text-gray-900">
                        {Math.floor(selectedEarning.duration / 60)}h {selectedEarning.duration % 60}min
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Estudiantes:</span>
                      <p className="text-gray-900">{selectedEarning.students} estudiantes</p>
                    </div>
                  </div>
                </div>

                {/* Información del Pago */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Información del Pago</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Mi Pago:</span>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(selectedEarning.instructorPayment)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Estado:</span>
                      <p className="text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedEarning.status)}`}>
                          {getStatusText(selectedEarning.status)}
                        </span>
                      </p>
                    </div>
                    {selectedEarning.paymentDate && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-700">Fecha de Pago:</span>
                        <p className="text-gray-900">{formatDate(selectedEarning.paymentDate)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cálculos */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Detalles del Cálculo</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Pago por hora:</span>
                      <span className="font-medium">
                        {formatCurrency(selectedEarning.instructorPayment / (selectedEarning.duration / 60))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Pago por estudiante:</span>
                      <span className="font-medium">
                        {formatCurrency(selectedEarning.instructorPayment / selectedEarning.students)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => handleDownloadReceipt(selectedEarning)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Descargar Comprobante
                </button>
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