"use client";

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  DollarSign, 
  Mail, 
  Phone, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  CreditCard,
  TrendingUp,
  Users,
  MapPin,
  School,
  Eye,
  ExternalLink
} from 'lucide-react';

function AdminReservationsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const classId = searchParams.get('classId');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !(session as any).user || (session as any).user.role !== 'ADMIN') {
      router.push('/denied');
      return;
    }

    const fetchReservations = async () => {
      setLoading(true);
      try {
        const token = (session as any)?.backendToken;
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/reservations/all', { headers });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
          console.error('Error fetching reservations:', errorData);
          setReservations([]);
          return;
        }
        const data = await res.json();
        // Asegurar que data sea un array
        setReservations(Array.isArray(data) ? data : []);
        
        if (classId) {
          const classRes = await fetch(`/api/classes/${classId}`, { headers });
          if (classRes.ok) {
            const classData = await classRes.json();
            setSelectedClass(classData);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [session, status, router, classId]);

  const updateReservationStatus = async (reservationId: number, newStatus: string) => {
    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update reservation');
      
      setReservations(reservations.map(r => 
        r.id === reservationId ? { ...r, status: newStatus } : r
      ));
    } catch (err) {
      console.error(err);
      alert('Error al actualizar el estado de la reserva');
    }
  };

  const filteredReservations = (() => {
    let filtered = reservations;
    
    if (classId) {
      filtered = filtered.filter(r => r.classId === parseInt(classId));
    }
    
    if (filter !== 'ALL') {
      filtered = filtered.filter(r => r.status === filter);
    }
    
    return filtered;
  })();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'PAID': return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELED': return 'bg-red-100 text-red-800 border-red-300';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <AlertCircle className="w-4 h-4" />;
      case 'CONFIRMED': return <CheckCircle2 className="w-4 h-4" />;
      case 'PAID': return <CheckCircle2 className="w-4 h-4" />;
      case 'CANCELED': return <XCircle className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle2 className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'CONFIRMED': 'Confirmada',
      'PAID': 'Pagada',
      'CANCELED': 'Cancelada',
      'COMPLETED': 'Completada'
    };
    return labels[status] || status;
  };

  // Calcular estadísticas
  const stats = {
    total: filteredReservations.length,
    pending: filteredReservations.filter(r => r.status === 'PENDING').length,
    confirmed: filteredReservations.filter(r => r.status === 'CONFIRMED').length,
    paid: filteredReservations.filter(r => r.status === 'PAID').length,
    canceled: filteredReservations.filter(r => r.status === 'CANCELED').length,
    completed: filteredReservations.filter(r => r.status === 'COMPLETED').length,
    totalRevenue: filteredReservations
      .filter(r => r.payment?.status === 'PAID')
      .reduce((sum, r) => sum + (r.payment?.amount || 0), 0)
  };

  const formatDate = (date: string | Date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date: string | Date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          {classId && (
            <Link 
              href="/dashboard/admin/classes"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Clases
            </Link>
          )}
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {classId && selectedClass ? selectedClass.title : 'Todas las Reservas'}
              </h1>
              {classId && selectedClass && (
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <School className="w-4 h-4 mr-2" />
                    {selectedClass.school?.name}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(selectedClass.date)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {selectedClass.duration} min
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {filteredReservations.length}/{selectedClass.capacity} estudiantes
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">Todos los Estados</option>
                <option value="PENDING">Pendiente</option>
                <option value="CONFIRMED">Confirmada</option>
                <option value="PAID">Pagada</option>
                <option value="CANCELED">Cancelada</option>
                <option value="COMPLETED">Completada</option>
              </select>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        {filteredReservations.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-400">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-400">
              <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
              <div className="text-sm text-gray-600">Confirmadas</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-400">
              <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
              <div className="text-sm text-gray-600">Pagadas</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-400">
              <div className="text-2xl font-bold text-red-600">{stats.canceled}</div>
              <div className="text-sm text-gray-600">Canceladas</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400">
              <div className="text-2xl font-bold text-gray-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completadas</div>
            </div>
            {stats.totalRevenue > 0 && (
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-400">
                <div className="text-2xl font-bold text-purple-600">S/. {stats.totalRevenue.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Ingresos</div>
              </div>
            )}
          </div>
        )}

        {/* Lista de Reservas */}
        {filteredReservations.length > 0 ? (
          <div className="grid gap-4">
            {filteredReservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Información Principal */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg font-semibold text-gray-900">
                              Reserva #{reservation.id}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(reservation.status)}`}>
                              {getStatusIcon(reservation.status)}
                              {getStatusLabel(reservation.status)}
                            </span>
                          </div>
                          
                          {!classId && reservation.class && (
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">{reservation.class.title}</span>
                              {reservation.class.school?.name && (
                                <span className="ml-2">- {reservation.class.school.name}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Información del Usuario */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Estudiante
                          </h3>
                          <div className="text-sm text-gray-900 font-medium">
                            {reservation.user?.name || 'N/A'}
                          </div>
                          {reservation.user?.email && (
                            <div className="text-sm text-gray-600 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {reservation.user.email}
                            </div>
                          )}
                          {reservation.user?.phone && (
                            <div className="text-sm text-gray-600 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {reservation.user.phone}
                            </div>
                          )}
                        </div>

                        {/* Información de la Clase */}
                        {!classId && reservation.class && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              Clase
                            </h3>
                            <div className="text-sm text-gray-900">
                              {formatDate(reservation.class.date)}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTime(reservation.class.date)} - {reservation.class.duration} min
                            </div>
                          </div>
                        )}

                        {/* Información de Pago */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pago
                          </h3>
                          {reservation.payment ? (
                            <>
                              <div className="text-sm text-gray-900 font-medium">
                                S/. {reservation.payment.amount?.toFixed(2) || '0.00'}
                              </div>
                              <div className="text-sm text-gray-600">
                                Estado: <span className={`font-medium ${
                                  reservation.payment.status === 'PAID' ? 'text-green-600' :
                                  reservation.payment.status === 'PENDING' ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {reservation.payment.status === 'PAID' ? 'Pagado' :
                                   reservation.payment.status === 'PENDING' ? 'Pendiente' :
                                   'Rechazado'}
                                </span>
                              </div>
                              {reservation.payment.paymentMethod && (
                                <div className="text-sm text-gray-600">
                                  Método: {reservation.payment.paymentMethod}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-sm text-gray-500">Sin información de pago</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col gap-3 lg:min-w-[200px]">
                      <Link
                        href={`/reservations/${reservation.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Reserva del Estudiante
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Cambiar Estado:
                        </label>
                        <select
                          value={reservation.status}
                          onChange={(e) => updateReservationStatus(reservation.id, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          <option value="PENDING">Pendiente</option>
                          <option value="CONFIRMED">Confirmada</option>
                          <option value="PAID">Pagada</option>
                          <option value="CANCELED">Cancelada</option>
                          <option value="COMPLETED">Completada</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No se encontraron reservas</p>
            <p className="text-gray-500 mt-2">
              {filter !== 'ALL' 
                ? 'Intenta cambiar el filtro de estado' 
                : classId 
                  ? 'Esta clase aún no tiene reservas' 
                  : 'No hay reservas registradas'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminReservationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <AdminReservationsContent />
    </Suspense>
  );
}
