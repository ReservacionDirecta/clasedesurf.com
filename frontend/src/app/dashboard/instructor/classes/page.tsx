'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, Clock, Users, MapPin, Plus, Eye, Edit, Trash2, Filter } from 'lucide-react';

interface Class {
  id: number;
  title: string;
  description: string;
  date: string;
  duration: number;
  capacity: number;
  enrolled: number;
  price: number;
  level: string;
  location: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export default function InstructorClasses() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

    fetchClasses();
  }, [session, status, router]);

  const fetchClasses = async () => {
    try {
      // Datos mock para Gabriel Barrera
      const mockClasses: Class[] = [
        {
          id: 1,
          title: 'Surf para Principiantes',
          description: 'Clase introductoria al surf con técnicas básicas y seguridad',
          date: '2024-12-15T10:00:00',
          duration: 120,
          capacity: 8,
          enrolled: 6,
          price: 80,
          level: 'BEGINNER',
          location: 'Playa Miraflores',
          status: 'upcoming'
        },
        {
          id: 2,
          title: 'Técnicas Avanzadas',
          description: 'Perfeccionamiento de maniobras y técnicas avanzadas',
          date: '2024-12-16T14:00:00',
          duration: 150,
          capacity: 6,
          enrolled: 4,
          price: 120,
          level: 'ADVANCED',
          location: 'Playa Barranco',
          status: 'upcoming'
        },
        {
          id: 3,
          title: 'Longboard Session',
          description: 'Clase especializada en longboard y estilo clásico',
          date: '2024-12-18T16:00:00',
          duration: 180,
          capacity: 10,
          enrolled: 8,
          price: 100,
          level: 'INTERMEDIATE',
          location: 'Playa Chorrillos',
          status: 'upcoming'
        },
        {
          id: 4,
          title: 'Surf Matutino',
          description: 'Sesión de surf aprovechando las mejores olas de la mañana',
          date: '2024-12-10T07:00:00',
          duration: 120,
          capacity: 8,
          enrolled: 8,
          price: 90,
          level: 'INTERMEDIATE',
          location: 'Playa San Bartolo',
          status: 'completed'
        },
        {
          id: 5,
          title: 'Competición Prep',
          description: 'Preparación para competencias de surf',
          date: '2024-12-12T15:00:00',
          duration: 180,
          capacity: 4,
          enrolled: 0,
          price: 150,
          level: 'ADVANCED',
          location: 'Playa Punta Hermosa',
          status: 'cancelled'
        }
      ];

      setClasses(mockClasses);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(cls => 
    filter === 'all' || cls.status === filter
  );

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

  const handleViewClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setShowViewModal(true);
  };

  const handleEditClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setShowEditModal(true);
  };

  const handleDeleteClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedClass) {
      // Aquí iría la llamada a la API para cancelar/eliminar la clase
      const updatedClasses = classes.map(c => 
        c.id === selectedClass.id ? { ...c, status: 'cancelled' as const } : c
      );
      setClasses(updatedClasses);
      setShowDeleteModal(false);
      setSelectedClass(null);
    }
  };

  const handleSaveEdit = async (updatedClass: Partial<Class>) => {
    if (selectedClass) {
      // Aquí iría la llamada a la API para actualizar la clase
      const updatedClasses = classes.map(c => 
        c.id === selectedClass.id ? { ...c, ...updatedClass } : c
      );
      setClasses(updatedClasses);
      setShowEditModal(false);
      setSelectedClass(null);
    }
  };

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
            onClick={() => router.push('/dashboard/instructor')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Volver al Dashboard
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Clases</h1>
              <p className="text-gray-600 mt-2">Gestiona tus clases de surf</p>
            </div>
            <button className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                <h3 className="text-lg font-semibold text-gray-900">Total</h3>
                <p className="text-3xl font-bold text-blue-600">{classes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Próximas</h3>
                <p className="text-3xl font-bold text-green-600">
                  {classes.filter(c => c.status === 'upcoming').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Estudiantes</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {classes.reduce((sum, c) => sum + c.enrolled, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <MapPin className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Completadas</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {classes.filter(c => c.status === 'completed').length}
                </p>
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
              Todas ({classes.length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Próximas ({classes.filter(c => c.status === 'upcoming').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completadas ({classes.filter(c => c.status === 'completed').length})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'cancelled'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Canceladas ({classes.filter(c => c.status === 'cancelled').length})
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cls.status)}`}>
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
                      {cls.enrolled}/{cls.capacity} estudiantes
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {cls.location}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-lg font-semibold text-green-600">
                      S/. {cls.price}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleViewClass(cls)}
                        className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </button>
                      {cls.status === 'upcoming' && (
                        <button 
                          onClick={() => handleEditClass(cls)}
                          className="flex items-center px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </button>
                      )}
                      {cls.status === 'upcoming' && (
                        <button 
                          onClick={() => handleDeleteClass(cls)}
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
                : `No tienes clases ${filter === 'upcoming' ? 'próximas' : filter === 'completed' ? 'completadas' : 'canceladas'}`
              }
            </p>
            <button className="flex items-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-5 h-5 mr-2" />
              Crear Primera Clase
            </button>
          </div>
        )}

        {/* Modal Ver Clase */}
        {showViewModal && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Detalles de la Clase</h3>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{selectedClass.title}</h4>
                  <p className="text-gray-600">{selectedClass.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Fecha y Hora</span>
                    <p className="text-gray-900">{formatDate(selectedClass.date)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Duración</span>
                    <p className="text-gray-900">{selectedClass.duration} minutos</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Capacidad</span>
                    <p className="text-gray-900">{selectedClass.enrolled}/{selectedClass.capacity} estudiantes</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Ubicación</span>
                    <p className="text-gray-900">{selectedClass.location}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Nivel</span>
                    <p className="text-gray-900">
                      {selectedClass.level === 'BEGINNER' ? 'Principiante' :
                       selectedClass.level === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Estado</span>
                    <p className="text-gray-900">
                      {selectedClass.status === 'upcoming' ? 'Próxima' :
                       selectedClass.status === 'completed' ? 'Completada' : 'Cancelada'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar Clase */}
        {showEditModal && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Editar Clase</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updatedClass = {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  capacity: parseInt(formData.get('capacity') as string),
                  location: formData.get('location') as string,
                };
                handleSaveEdit(updatedClass);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <input 
                      name="title"
                      type="text" 
                      defaultValue={selectedClass.title}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea 
                      name="description"
                      defaultValue={selectedClass.description}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
                      <input 
                        name="capacity"
                        type="number" 
                        defaultValue={selectedClass.capacity}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                      <input 
                        name="location"
                        type="text" 
                        defaultValue={selectedClass.location}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button 
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Confirmar Eliminación */}
        {showDeleteModal && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Cancelar Clase</h3>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que quieres cancelar la clase "{selectedClass.title}"? 
                Esta acción notificará a todos los estudiantes inscritos.
              </p>
              
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  No, mantener
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Sí, cancelar clase
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}