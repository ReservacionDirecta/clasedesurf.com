// ... (imports remain similar, add ClassForm)
"use client";

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { formatCurrency } from '@/lib/currency';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  DollarSign,
  MapPin,
  Edit,
  Trash2,
  Eye,
  School as SchoolIcon,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ListChecks,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import ClassForm from '@/components/forms/ClassForm';
import { Class, School, Beach } from '@/types';


export default function AdminClassesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [beaches, setBeaches] = useState<Beach[]>([]);

  // UI States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSchool, setFilterSchool] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'completed' | 'past'>('all');

  // Form loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !(session as any).user || (session as any).user.role !== 'ADMIN') {
      router.push('/denied');
      return;
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes, searchQuery, filterSchool, filterLevel, filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [classesRes, schoolsRes, beachesRes] = await Promise.all([
        fetch('/api/classes', { headers }),
        fetch('/api/schools', { headers }),
        fetch('/api/beaches', { headers }).catch(() => ({ ok: false, json: () => [] }))
      ]);

      if (!classesRes.ok || !schoolsRes.ok) throw new Error('Failed to fetch data');

      const [classesData, schoolsData, beachesData] = await Promise.all([
        classesRes.json(),
        schoolsRes.json(),
        beachesRes.ok ? beachesRes.json() : Promise.resolve([])
      ]);

      setClasses(classesData || []);
      setSchools(schoolsData || []);
      setBeaches(beachesData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...classes];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(cls =>
        cls.title.toLowerCase().includes(query) ||
        cls.description?.toLowerCase().includes(query) ||
        cls.school?.name.toLowerCase().includes(query) ||
        cls.instructor?.toLowerCase().includes(query)
      );
    }

    // School filter
    if (filterSchool !== 'all') {
      filtered = filtered.filter(cls => cls.school?.id === parseInt(filterSchool));
    }

    // Level filter
    if (filterLevel !== 'all') {
      filtered = filtered.filter(cls => cls.level === filterLevel);
    }

    // Status filter
    if (filterStatus !== 'all') {
      const now = new Date();
      filtered = filtered.filter(cls => {
        const classDate = new Date(cls.date);
        if (filterStatus === 'upcoming') return classDate > now;
        if (filterStatus === 'completed' || filterStatus === 'past') return classDate < now;
        return true;
      });
    }

    // Sort by date (upcoming first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    setFilteredClasses(filtered);
  };

  const handleCreateSubmit = async (data: Partial<Class>) => {
    setIsSubmitting(true);
    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/classes', {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || 'Failed to create class');
      }

      await fetchData();
      setShowCreateModal(false);
      showSuccess('¡Clase creada!', 'La clase se creó correctamente');
    } catch (err: any) {
      console.error('Error al crear clase:', err);
      showError('Error al crear', err.message || 'No se pudo crear la clase');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (data: Partial<Class>) => {
    if (!selectedClass) return;
    setIsSubmitting(true);
    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/classes/${selectedClass.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || 'Failed to update class');
      }

      await fetchData();
      setShowEditModal(false);
      setSelectedClass(null);
      showSuccess('¡Clase actualizada!', 'Los cambios se guardaron correctamente');
    } catch (err: any) {
      console.error('Error al actualizar clase:', err);
      showError('Error al actualizar', err.message || 'No se pudo actualizar la clase');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClass = async (forceDelete = false): Promise<void> => {
    if (!selectedClass) return;

    try {
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const url = forceDelete 
        ? `/api/classes/${selectedClass.id}?force=true`
        : `/api/classes/${selectedClass.id}`;

      const res = await fetch(url, {
        method: 'DELETE',
        headers
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
        
        // Si hay reservas activas y se puede forzar eliminación
        if (errorData.canForceDelete && errorData.reservationsCount) {
          const confirmForce = confirm(
            `Esta clase tiene ${errorData.reservationsCount} reserva(s) activa(s).\n\n` +
            `¿Deseas FORZAR la eliminación? Esto:\n` +
            `• Eliminará todas las reservaciones\n` +
            `• Eliminará todos los pagos asociados\n\n` +
            `Esta acción NO SE PUEDE DESHACER.`
          );
          
          if (confirmForce) {
            await handleDeleteClass(true);
            return;
          }
        }
        
        const errorMessage = errorData.message || 'No se pudo eliminar la clase';
        showError('Error al eliminar', errorMessage);
        return;
      }

      await fetchData();
      setShowDeleteModal(false);
      setSelectedClass(null);
      showSuccess('¡Clase eliminada!', 'La clase fue eliminada correctamente');
    } catch (err) {
      console.error('Error deleting class:', err);
      const errorMessage = err instanceof Error ? err.message : 'No se pudo eliminar la clase';
      showError('Error al eliminar', errorMessage);
    }
  };

  const openViewModal = (cls: Class) => {
    setSelectedClass(cls);
    setShowViewModal(true);
  };

  const openEditModal = (cls: Class) => {
    setSelectedClass(cls);
    setShowEditModal(true);
  };

  const openDeleteModal = (cls: Class) => {
    setSelectedClass(cls);
    setShowDeleteModal(true);
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  // Statistics
  const stats = {
    total: classes.length,
    upcoming: classes.filter(c => new Date(c.date) > new Date()).length,
    completed: classes.filter(c => new Date(c.date) < new Date()).length,
    totalRevenue: classes.reduce((sum, c) => sum + (c.paymentInfo?.totalRevenue || 0), 0),
    totalReservations: classes.reduce((sum, c) => sum + (c.paymentInfo?.totalReservations || 0), 0),
    averageOccupancy: classes.length > 0
      ? classes.reduce((sum, c) => sum + (c.paymentInfo?.occupancyRate || 0), 0) / classes.length
      : 0
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'bg-yellow-100 text-yellow-800';
      case 'INTERMEDIATE': return 'bg-orange-100 text-orange-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando clases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Clases</h1>
              <p className="text-gray-600 mt-2">Administra todas las clases del sistema</p>
            </div>
            <button
              onClick={openCreateModal}
              className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nueva Clase
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Total Clases</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Próximas</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Ingresos Totales</h3>
                <p className="text-2xl font-bold text-gray-900">S/. {stats.totalRevenue.toFixed(0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Ocupación Promedio</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.averageOccupancy.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por título, escuela, instructor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* School Filter */}
            <div>
              <select
                value={filterSchool}
                onChange={(e) => setFilterSchool(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las escuelas</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id.toString()}>{school.name}</option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los niveles</option>
                <option value="BEGINNER">Principiante</option>
                <option value="INTERMEDIATE">Intermedio</option>
                <option value="ADVANCED">Avanzado</option>
              </select>
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterStatus('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'upcoming'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Próximas
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'completed'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Completadas
            </button>
          </div>
        </div>

        {/* Classes List */}
        <div className="space-y-4">
          {filteredClasses.length > 0 ? (
            filteredClasses.map((cls) => {
              const occupancy = cls.paymentInfo?.occupancyRate || 0;

              return (
                <div key={cls.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900">{cls.title}</h3>
                          {cls.description && (
                            <p className="text-gray-600 mt-1 line-clamp-2">{cls.description}</p>
                          )}
                        </div>
                        <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(cls.level)}`}>
                          {cls.level}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <SchoolIcon className="w-4 h-4 mr-2" />
                          <span>{cls.school?.name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatShortDate(cls.date)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{cls.duration} min</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <span>{cls.paymentInfo?.totalReservations || 0}/{cls.capacity}</span>
                        </div>
                      </div>

                      {/* Payment Info */}
                      {cls.paymentInfo && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Reservas:</span>
                              <span className="ml-2 font-semibold">{cls.paymentInfo.totalReservations}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Pagadas:</span>
                              <span className="ml-2 font-semibold text-green-600">{cls.paymentInfo.paidReservations}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Ingresos:</span>
                              <span className="ml-2 font-semibold text-blue-600">S/. {cls.paymentInfo.totalRevenue.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Ocupación:</span>
                              <span className={`ml-2 font-semibold ${occupancy > 80 ? 'text-green-600' : occupancy > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {occupancy.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 lg:ml-4">
                      <button
                        onClick={() => router.push(`/dashboard/admin/reservations?classId=${cls.id}`)}
                        className="flex items-center justify-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                        title="Ver reservas de esta clase"
                      >
                        <ListChecks className="w-4 h-4 mr-2" />
                        Reservas
                      </button>
                      <button
                        onClick={() => openViewModal(cls)}
                        className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </button>
                      <button
                        onClick={() => openEditModal(cls)}
                        className="flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </button>
                      <button
                        onClick={() => openDeleteModal(cls)}
                        className="flex items-center justify-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No se encontraron clases</p>
              <p className="text-gray-500 mt-2">Intenta ajustar los filtros o crea una nueva clase</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Crear Nueva Clase</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
               <ClassForm
                  onSubmit={handleCreateSubmit}
                  onCancel={() => setShowCreateModal(false)}
                  isLoading={isSubmitting}
                  schools={schools}
               />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Editar Clase</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
                <ClassForm
                    classData={selectedClass}
                    onSubmit={handleEditSubmit}
                    onCancel={() => setShowEditModal(false)}
                    isLoading={isSubmitting}
                    schools={schools}
                />
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Detalles de la Clase</h2>
                <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">{selectedClass.title}</h3>
                  {selectedClass.description && (
                    <p className="text-gray-600 mt-2">{selectedClass.description}</p>
                  )}
                </div>
                {/* Image rendering logic for the class card in the view modal */}
                <div className="h-48 w-full bg-gray-200 relative rounded-lg overflow-hidden">
                  {selectedClass.images && selectedClass.images.length > 0 ? (
                    <img 
                      src={selectedClass.images[0]} 
                      alt={selectedClass.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-12 w-12" />
                    </div>
                  )}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${getLevelColor(selectedClass.level)}`}>
                    {selectedClass.level}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Escuela:</span>
                    <p className="text-gray-900">{selectedClass.school?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Fecha:</span>
                    <p className="text-gray-900">{formatDate(selectedClass.date)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Duración:</span>
                    <p className="text-gray-900">{selectedClass.duration} minutos</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Capacidad:</span>
                    <p className="text-gray-900">{selectedClass.capacity} estudiantes</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Precio:</span>
                    <p className="text-gray-900">{formatCurrency(selectedClass.price, 'PEN')}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Nivel:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${getLevelColor(selectedClass.level)}`}>
                      {selectedClass.level}
                    </span>
                  </div>
                  {selectedClass.instructor && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Instructor:</span>
                      <p className="text-gray-900">{selectedClass.instructor}</p>
                    </div>
                  )}
                  {selectedClass.beach && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Playa:</span>
                      <p className="text-gray-900">{selectedClass.beach.name} {selectedClass.beach.location ? `- ${selectedClass.beach.location}` : ''}</p>
                    </div>
                  )}
                </div>
                {selectedClass.images && selectedClass.images.length > 0 && (
                  <div className="mt-4">
                    <span className="text-sm font-medium text-gray-600 block mb-2">Imágenes:</span>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedClass.images.map((img: string, index: number) => (
                        <img
                          key={index}
                          src={img}
                          alt={`${selectedClass.title} - Imagen ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {selectedClass.paymentInfo && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-3">Información de Reservas</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Total Reservas:</span>
                        <p className="font-semibold">{selectedClass.paymentInfo.totalReservations}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Reservas Pagadas:</span>
                        <p className="font-semibold text-green-600">{selectedClass.paymentInfo.paidReservations}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Ingresos Totales:</span>
                        <p className="font-semibold text-blue-600">S/. {selectedClass.paymentInfo.totalRevenue.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Tasa de Ocupación:</span>
                        <p className="font-semibold">{selectedClass.paymentInfo.occupancyRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar la clase <strong>&quot;{selectedClass.title}&quot;</strong>?
                Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteClass()}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
