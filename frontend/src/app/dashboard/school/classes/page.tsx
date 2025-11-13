'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Plus, Calendar, Clock, Users, MapPin, Eye, Edit, Trash2, DollarSign } from 'lucide-react';
import { SchoolContextBanner } from '@/components/school/SchoolContextBanner';

interface Class {
  id: number;
  title: string;
  description: string;
  date: string;
  duration: number;
  capacity: number;
  enrolled?: number;
  price: number;
  level: string;
  location?: string;
  instructor: string;
  status?: 'upcoming' | 'completed' | 'cancelled';
  availableSpots?: number;
  reservations?: any[];
  paymentInfo?: {
    totalReservations: number;
    paidReservations: number;
    totalRevenue: number;
    occupancyRate: number;
  };
}

interface School {
  id: number;
  name: string;
  location: string;
  description?: string;
}

export default function ClassesManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const fetchClasses = useCallback(async () => {
    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/classes', { headers });
      if (response.ok) {
        const data = await response.json();
        setClasses(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  }, [session]);

  const fetchSchoolAndClasses = useCallback(async () => {
    try {
      setLoading(true);
      
      // Obtener información de la escuela
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const schoolResponse = await fetch('/api/schools/my-school', { headers });
      if (schoolResponse.ok) {
        const schoolData = await schoolResponse.json();
        setSchool(schoolData);
      }

      // Obtener clases
      await fetchClasses();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchClasses, session]);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.role !== 'SCHOOL_ADMIN') {
      router.push('/dashboard/student/profile');
      return;
    }

    fetchSchoolAndClasses();
  }, [fetchSchoolAndClasses, router, session, status]);

  const handleCreateClass = async (classData: Partial<Class>) => {
    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/classes', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...classData,
          schoolId: school?.id
        })
      });

      if (response.ok) {
        await fetchClasses();
        setShowCreateModal(false);
        alert('Clase creada exitosamente');
      } else {
        throw new Error('Error al crear la clase');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Error al crear la clase');
    }
  };

  const handleEditClass = async (classData: Partial<Class>) => {
    if (!selectedClass) return;

    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/classes/${selectedClass.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(classData)
      });

      if (response.ok) {
        await fetchClasses();
        setShowEditModal(false);
        setSelectedClass(null);
        alert('Clase actualizada exitosamente');
      } else {
        throw new Error('Error al actualizar la clase');
      }
    } catch (error) {
      console.error('Error updating class:', error);
      alert('Error al actualizar la clase');
    }
  };

  const handleDeleteClass = async () => {
    if (!selectedClass) return;

    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/classes/${selectedClass.id}`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        await fetchClasses();
        setShowDeleteModal(false);
        setSelectedClass(null);
        alert('Clase eliminada exitosamente');
      } else {
        throw new Error('Error al eliminar la clase');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Error al eliminar la clase');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const filteredClasses: Class[] = Array.isArray(classes) 
    ? classes.filter((cls: Class) => {
        if (filter === 'all') return true;
        // Calculate status based on date if status is not set
        if (!cls.status) {
          const classDate = new Date(cls.date);
          const now = new Date();
          if (classDate < now) {
            return filter === 'completed';
          } else {
            return filter === 'upcoming';
          }
        }
        return cls.status === filter;
      })
    : [];

  const totalRevenue = (classes || []).reduce((sum, cls) => sum + (cls.paymentInfo?.totalRevenue || 0), 0);
  const totalStudents = (classes || []).reduce((sum, cls) => sum + (cls.enrolled || 0), 0);
  const averageOccupancy = (classes || []).length > 0 
    ? (classes || []).reduce((sum, cls) => sum + (cls.paymentInfo?.occupancyRate || 0), 0) / (classes || []).length 
    : 0;

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando clases...</p>
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
          
          {/* School Context Banner */}
          <SchoolContextBanner school={school} loading={loading} />
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Clases</h1>
              <p className="text-gray-600 mt-2">Administra las clases de {school?.name || 'tu escuela'}</p>
            </div>
            <button 
              onClick={() => router.push('/dashboard/school/classes/new')}
              className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nueva Clase
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Clases</h3>
                <p className="text-3xl font-bold text-blue-600">{classes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Estudiantes</h3>
                <p className="text-3xl font-bold text-green-600">{totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Ingresos</h3>
                <p className="text-3xl font-bold text-yellow-600">S/. {totalRevenue.toFixed(0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <MapPin className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Ocupación</h3>
                <p className="text-3xl font-bold text-purple-600">{averageOccupancy.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({(classes || []).length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Próximas ({(classes || []).filter(c => c.status === 'upcoming').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completadas ({(classes || []).filter(c => c.status === 'completed').length})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'cancelled'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Canceladas ({(classes || []).filter(c => c.status === 'cancelled').length})
            </button>
          </div>
        </div>

        {/* Classes List */}
        <div className="space-y-6">
          {filteredClasses.map((cls) => (
            <div key={cls.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{cls.title}</h3>
                      <p className="text-gray-600 mb-3">{cls.description}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cls.status || 'upcoming')}`}>
                        {cls.status === 'upcoming' ? 'Próxima' : 
                         cls.status === 'completed' ? 'Completada' : 'Cancelada'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(cls.level)}`}>
                        {cls.level === 'BEGINNER' ? 'Principiante' :
                         cls.level === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(cls.date)}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {cls.duration} minutos
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {cls.enrolled || 0}/{cls.capacity} estudiantes
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {cls.location || 'Por definir'}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-lg font-semibold text-green-600">
                      S/. {cls.price}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => router.push(`/dashboard/school/classes/${cls.id}`)}
                        className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Detalles
                      </button>
                      <button 
                        onClick={() => router.push(`/classes/${cls.id}`)}
                        className="flex items-center px-3 py-1 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Vista Pública
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedClass(cls);
                          setShowEditModal(true);
                        }}
                        className="flex items-center px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title={(cls.reservations?.length ?? 0) > 0 ? 'Editar detalles limitados (hay reservas activas)' : 'Editar clase'}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </button>
                      {cls.status === 'upcoming' && (
                        <button 
                          onClick={() => {
                            setSelectedClass(cls);
                            setShowDeleteModal(true);
                          }}
                          className="flex items-center px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredClasses.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clases</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? 'Aún no tienes clases programadas'
                : `No tienes clases ${filter === 'upcoming' ? 'próximas' : filter === 'completed' ? 'completadas' : 'canceladas'}`}
            </p>
            <button 
              onClick={() => router.push('/dashboard/school/classes/new')}
              className="flex items-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear Primera Clase
            </button>
          </div>
        )}

        {/* Modales - Simplificados por ahora */}
        {showCreateModal && null}

        {showEditModal && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Editar Clase</h3>
              <p className="text-gray-600 mb-4">Editando: {selectedClass.title}</p>
              {(selectedClass.reservations?.length ?? 0) > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Esta clase tiene {selectedClass.reservations?.length ?? 0} reserva(s) activa(s).</strong>
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Solo podrás editar: nombre, descripción, foto y otros detalles que no afecten la fecha, precio u horario.
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedClass(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    router.push(`/dashboard/school/classes/${selectedClass.id}/edit`);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Cancelar Clase</h3>
              <p className="text-gray-600 mb-4">
                ¿Estás seguro de que quieres cancelar la clase &quot;{selectedClass.title}&quot;?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedClass(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  No, mantener
                </button>
                <button 
                  onClick={handleDeleteClass}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Sí, cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}