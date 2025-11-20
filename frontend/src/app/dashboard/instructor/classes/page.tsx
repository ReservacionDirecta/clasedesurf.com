'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Calendar, Clock, Users, MapPin, Plus, Eye, Edit, Trash2, Filter, User, CheckCircle, XCircle, AlertCircle, Phone, Mail } from 'lucide-react';

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
  reservations?: Reservation[];
}

interface Reservation {
  id: number;
  userId: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED';
  specialRequest?: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
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
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchClasses = useCallback(async () => {
    try {
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch real classes data from backend
      const classesRes = await fetch('/api/instructor/classes', { headers });

      if (!classesRes.ok) {
        throw new Error('Failed to fetch classes');
      }

      const classesData = await classesRes.json();

      // Process classes to match the expected format
      const processedClasses: Class[] = (classesData.classes || []).map((cls: any) => {
        const now = new Date();
        const classDate = new Date(cls.date);
        let status: 'upcoming' | 'completed' | 'cancelled' = 'upcoming';

        if (classDate < now) {
          status = 'completed';
        }
        if (cls.status === 'CANCELED') {
          status = 'cancelled';
        }

        return {
          id: cls.id,
          title: cls.title,
          description: cls.description || 'Clase de surf',
          date: cls.date,
          duration: cls.duration || 120,
          capacity: cls.capacity,
          enrolled: cls.reservations?.filter((r: any) => r.status !== 'CANCELED').length || 0,
          price: Number(cls.price),
          level: cls.level || 'INTERMEDIATE',
          location: cls.location || 'Por definir',
          status: status,
          reservations: cls.reservations?.map((r: any) => ({
            id: r.id,
            userId: r.userId,
            status: r.status,
            specialRequest: r.specialRequest,
            createdAt: r.createdAt,
            user: {
              id: r.user.id,
              name: r.user.name,
              email: r.user.email,
              phone: r.user.phone
            }
          })) || []
        };
      });

      setClasses(processedClasses);
      setLoading(false);

      // Fallback to mock data if no real data
      if (processedClasses.length === 0) {
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
            status: 'upcoming',
            reservations: [
              {
                id: 1,
                userId: 1,
                status: 'CONFIRMED',
                specialRequest: 'Primera vez surfeando, necesito ayuda extra',
                createdAt: '2024-12-10T10:00:00',
                user: { id: 1, name: 'Ana García', email: 'ana@email.com', phone: '+51 987 654 321' }
              },
              {
                id: 2,
                userId: 2,
                status: 'CONFIRMED',
                createdAt: '2024-12-11T14:30:00',
                user: { id: 2, name: 'Carlos López', email: 'carlos@email.com', phone: '+51 987 654 322' }
              },
              {
                id: 3,
                userId: 3,
                status: 'PENDING',
                specialRequest: 'Tengo miedo al agua, necesito paciencia',
                createdAt: '2024-12-12T09:15:00',
                user: { id: 3, name: 'María Rodríguez', email: 'maria@email.com' }
              },
              {
                id: 4,
                userId: 4,
                status: 'CONFIRMED',
                createdAt: '2024-12-12T16:45:00',
                user: { id: 4, name: 'José Martínez', email: 'jose@email.com', phone: '+51 987 654 324' }
              },
              {
                id: 5,
                userId: 5,
                status: 'CONFIRMED',
                specialRequest: 'Soy zurdo, ¿hay tablas especiales?',
                createdAt: '2024-12-13T11:20:00',
                user: { id: 5, name: 'Laura Fernández', email: 'laura@email.com' }
              },
              {
                id: 6,
                userId: 6,
                status: 'CONFIRMED',
                createdAt: '2024-12-13T18:30:00',
                user: { id: 6, name: 'Diego Vargas', email: 'diego@email.com', phone: '+51 987 654 326' }
              }
            ]
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
            status: 'upcoming',
            reservations: [
              {
                id: 7,
                userId: 7,
                status: 'CONFIRMED',
                specialRequest: 'Quiero mejorar mis cutbacks',
                createdAt: '2024-12-11T08:00:00',
                user: { id: 7, name: 'Roberto Silva', email: 'roberto@email.com', phone: '+51 987 654 327' }
              },
              {
                id: 8,
                userId: 8,
                status: 'CONFIRMED',
                createdAt: '2024-12-12T13:15:00',
                user: { id: 8, name: 'Patricia Morales', email: 'patricia@email.com' }
              },
              {
                id: 9,
                userId: 9,
                status: 'PENDING',
                specialRequest: 'Necesito trabajar en mi bottom turn',
                createdAt: '2024-12-13T10:30:00',
                user: { id: 9, name: 'Fernando Castro', email: 'fernando@email.com', phone: '+51 987 654 329' }
              },
              {
                id: 10,
                userId: 10,
                status: 'CONFIRMED',
                createdAt: '2024-12-13T15:45:00',
                user: { id: 10, name: 'Sofía Herrera', email: 'sofia@email.com' }
              }
            ]
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
            status: 'upcoming',
            reservations: [
              {
                id: 11,
                userId: 11,
                status: 'CONFIRMED',
                specialRequest: 'Quiero aprender nose riding',
                createdAt: '2024-12-10T12:00:00',
                user: { id: 11, name: 'Andrés Jiménez', email: 'andres@email.com', phone: '+51 987 654 330' }
              },
              {
                id: 12,
                userId: 12,
                status: 'CONFIRMED',
                createdAt: '2024-12-11T16:30:00',
                user: { id: 12, name: 'Valentina Cruz', email: 'valentina@email.com' }
              },
              {
                id: 13,
                userId: 13,
                status: 'CONFIRMED',
                createdAt: '2024-12-12T09:45:00',
                user: { id: 13, name: 'Mateo Ruiz', email: 'mateo@email.com', phone: '+51 987 654 332' }
              },
              {
                id: 14,
                userId: 14,
                status: 'PENDING',
                specialRequest: 'Primera vez con longboard',
                createdAt: '2024-12-12T14:20:00',
                user: { id: 14, name: 'Camila Torres', email: 'camila@email.com' }
              },
              {
                id: 15,
                userId: 15,
                status: 'CONFIRMED',
                createdAt: '2024-12-13T11:10:00',
                user: { id: 15, name: 'Sebastián Mendoza', email: 'sebastian@email.com', phone: '+51 987 654 334' }
              },
              {
                id: 16,
                userId: 16,
                status: 'CONFIRMED',
                createdAt: '2024-12-13T17:25:00',
                user: { id: 16, name: 'Isabella Paredes', email: 'isabella@email.com' }
              },
              {
                id: 17,
                userId: 17,
                status: 'CONFIRMED',
                specialRequest: 'Tengo mi propia tabla longboard',
                createdAt: '2024-12-14T08:40:00',
                user: { id: 17, name: 'Nicolás Vega', email: 'nicolas@email.com', phone: '+51 987 654 336' }
              },
              {
                id: 18,
                userId: 18,
                status: 'CONFIRMED',
                createdAt: '2024-12-14T13:55:00',
                user: { id: 18, name: 'Gabriela Ramos', email: 'gabriela@email.com' }
              }
            ]
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
            status: 'completed',
            reservations: [
              {
                id: 19,
                userId: 19,
                status: 'CONFIRMED',
                createdAt: '2024-12-08T10:00:00',
                user: { id: 19, name: 'Ricardo Flores', email: 'ricardo@email.com', phone: '+51 987 654 337' }
              },
              {
                id: 20,
                userId: 20,
                status: 'CONFIRMED',
                createdAt: '2024-12-08T14:30:00',
                user: { id: 20, name: 'Alejandra Soto', email: 'alejandra@email.com' }
              }
            ]
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
            status: 'cancelled',
            reservations: []
          }
        ];

        setClasses(mockClasses);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.role !== 'INSTRUCTOR') {
      router.push('/dashboard/student/profile');
      return;
    }

    fetchClasses();
  }, [fetchClasses, router, session, status]);

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

  const getReservationStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { icon: CheckCircle, text: 'Confirmada', class: 'bg-green-100 text-green-800 border-green-200' };
      case 'PENDING':
        return { icon: AlertCircle, text: 'Pendiente', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'CANCELED':
        return { icon: XCircle, text: 'Cancelada', class: 'bg-red-100 text-red-800 border-red-200' };
      default:
        return { icon: AlertCircle, text: 'Desconocido', class: 'bg-gray-100 text-gray-800 border-gray-200' };
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

  const handleCreateClass = async (newClassData: Omit<Class, 'id' | 'enrolled' | 'status'>) => {
    // Aquí iría la llamada a la API para crear la clase
    const newClass: Class = {
      ...newClassData,
      id: classes.length + 1,
      enrolled: 0,
      status: 'upcoming'
    };

    setClasses([...classes, newClass]);
    setShowCreateModal(false);
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
            <button
              onClick={() => setShowCreateModal(true)}
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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Todas ({classes.length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'upcoming'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Próximas ({classes.filter(c => c.status === 'upcoming').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Completadas ({classes.filter(c => c.status === 'completed').length})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'cancelled'
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
                        onClick={() => router.push(`/classes/${cls.id}`)}
                        className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Detalles
                      </button>
                      <button
                        onClick={() => handleViewClass(cls)}
                        className="flex items-center px-3 py-1 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Reservas
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
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear Primera Clase
            </button>
          </div>
        )}

        {/* Modal Ver Reservas */}
        {showViewModal && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedClass.title}</h3>
                  <p className="text-gray-600 mt-1">Reservas de la clase</p>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Resumen de la clase */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">Fecha</span>
                    <span className="font-medium">{formatDate(selectedClass.date)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Capacidad</span>
                    <span className="font-medium">{selectedClass.enrolled}/{selectedClass.capacity}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Precio</span>
                    <span className="font-medium">S/. {selectedClass.price}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Estado</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedClass.status)}`}>
                      {selectedClass.status === 'upcoming' ? 'Próxima' :
                        selectedClass.status === 'completed' ? 'Completada' : 'Cancelada'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lista de reservas */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Reservas ({selectedClass.reservations?.length || 0})
                  </h4>
                  <div className="flex gap-2 text-sm">
                    <span className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                      {selectedClass.reservations?.filter(r => r.status === 'CONFIRMED').length || 0} Confirmadas
                    </span>
                    <span className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mr-1" />
                      {selectedClass.reservations?.filter(r => r.status === 'PENDING').length || 0} Pendientes
                    </span>
                  </div>
                </div>

                {selectedClass.reservations && selectedClass.reservations.length > 0 ? (
                  <div className="space-y-3">
                    {selectedClass.reservations.map((reservation) => {
                      const badge = getReservationStatusBadge(reservation.status);
                      const IconComponent = badge.icon;

                      return (
                        <div key={reservation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h5 className="font-semibold text-gray-900">{reservation.user.name}</h5>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badge.class}`}>
                                    <IconComponent className="w-3 h-3 mr-1 inline" />
                                    {badge.text}
                                  </span>
                                </div>

                                <div className="space-y-1 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <Mail className="w-4 h-4 mr-2" />
                                    <span>{reservation.user.email}</span>
                                  </div>
                                  {reservation.user.phone && (
                                    <div className="flex items-center">
                                      <Phone className="w-4 h-4 mr-2" />
                                      <span>{reservation.user.phone}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span>Reservado: {new Date(reservation.createdAt).toLocaleDateString('es-ES')}</span>
                                  </div>
                                </div>

                                {reservation.specialRequest && (
                                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                      <span className="font-medium">Solicitud especial:</span> &quot;{reservation.specialRequest}&quot;
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {reservation.status === 'PENDING' && (
                              <div className="flex gap-2 ml-4">
                                <button className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors">
                                  Confirmar
                                </button>
                                <button className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors">
                                  Rechazar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Sin reservas</h4>
                    <p className="text-gray-600">Aún no hay estudiantes inscritos en esta clase</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Total de ingresos estimados: <span className="font-semibold text-green-600">S/. {(selectedClass.reservations?.filter(r => r.status !== 'CANCELED').length || 0) * selectedClass.price}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push(`/classes/${selectedClass.id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ver Página Pública
                  </button>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar Clase */}
        {showEditModal && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
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
                ¿Estás seguro de que quieres cancelar la clase &quot;{selectedClass.title}&quot;?
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

        {/* Modal Crear Clase */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Crear Nueva Clase</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);

                // Combinar fecha y hora
                let classDate = formData.get('classDate') as string;

                // Si no hay fecha seleccionada en radio buttons, usar el input de fecha fallback
                if (!classDate) {
                  classDate = formData.get('classDateFallback') as string;
                }

                const startTime = formData.get('startTime') as string;
                const dateTime = `${classDate}T${startTime}`;

                const newClass = {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  date: dateTime,
                  duration: parseInt(formData.get('duration') as string),
                  capacity: parseInt(formData.get('capacity') as string),
                  price: parseFloat(formData.get('price') as string),
                  level: formData.get('level') as string,
                  location: formData.get('location') as string,
                };

                handleCreateClass(newClass);
              }}>
                <div className="space-y-6">
                  {/* Información Básica */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Información Básica</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Título de la Clase *
                        </label>
                        <input
                          name="title"
                          type="text"
                          required
                          placeholder="Ej: Surf para Principiantes"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción *
                        </label>
                        <textarea
                          name="description"
                          required
                          rows={3}
                          placeholder="Describe qué aprenderán los estudiantes en esta clase..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fecha y Horario */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Fecha y Horario</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Fecha de la Clase *
                        </label>

                        {/* Selector de Fecha Visual */}
                        <div className="space-y-3">
                          {/* Accesos Rápidos */}
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                const today = new Date();
                                const dateInput = document.querySelector('input[name="classDate"]') as HTMLInputElement;
                                if (dateInput) dateInput.value = today.toISOString().split('T')[0];
                              }}
                              className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                            >
                              Hoy
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                const dateInput = document.querySelector('input[name="classDate"]') as HTMLInputElement;
                                if (dateInput) dateInput.value = tomorrow.toISOString().split('T')[0];
                              }}
                              className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                            >
                              Mañana
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                const nextWeek = new Date();
                                nextWeek.setDate(nextWeek.getDate() + 7);
                                const dateInput = document.querySelector('input[name="classDate"]') as HTMLInputElement;
                                if (dateInput) dateInput.value = nextWeek.toISOString().split('T')[0];
                              }}
                              className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                            >
                              Próxima Semana
                            </button>
                          </div>

                          {/* Próximos 7 Días */}
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Próximos 7 días:</p>
                            <div className="grid grid-cols-7 gap-2">
                              {Array.from({ length: 7 }, (_, i) => {
                                const date = new Date();
                                date.setDate(date.getDate() + i);
                                const dateStr = date.toISOString().split('T')[0];
                                const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
                                const dayNum = date.getDate();
                                const isToday = i === 0;
                                const isTomorrow = i === 1;

                                return (
                                  <label
                                    key={i}
                                    className="relative flex flex-col items-center p-2 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                                  >
                                    <input
                                      type="radio"
                                      name="classDate"
                                      value={dateStr}
                                      required
                                      className="sr-only peer"
                                    />
                                    <div className="flex flex-col items-center w-full peer-checked:text-blue-600">
                                      <span className={`text-xs font-medium capitalize ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                                        {isToday ? 'Hoy' : isTomorrow ? 'Mañ' : dayName}
                                      </span>
                                      <span className={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                                        {dayNum}
                                      </span>
                                      {isToday && (
                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1"></div>
                                      )}
                                    </div>
                                    <div className="absolute inset-0 border-2 border-blue-600 bg-blue-50 rounded-lg opacity-0 peer-checked:opacity-100 pointer-events-none"></div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          {/* Selector de Fecha Tradicional (Fallback) */}
                          <div className="border-t pt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-600">O selecciona otra fecha:</span>
                            </div>
                            <input
                              name="classDateFallback"
                              type="date"
                              min={new Date().toISOString().split('T')[0]}
                              onChange={(e) => {
                                if (e.target.value) {
                                  // Deseleccionar radio buttons
                                  const radios = document.querySelectorAll('input[name="classDate"]') as NodeListOf<HTMLInputElement>;
                                  radios.forEach(radio => radio.checked = false);

                                  // Crear un radio button temporal para el valor seleccionado
                                  const tempRadio = document.createElement('input');
                                  tempRadio.type = 'radio';
                                  tempRadio.name = 'classDate';
                                  tempRadio.value = e.target.value;
                                  tempRadio.checked = true;
                                  tempRadio.style.display = 'none';
                                  e.target.parentNode?.appendChild(tempRadio);
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                        </div>

                        <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start">
                            <Calendar className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-medium text-blue-900 mb-1">💡 Consejos para elegir la fecha</p>
                              <ul className="text-blue-800 space-y-1">
                                <li>• Los fines de semana suelen tener más demanda</li>
                                <li>• Las mañanas son ideales para principiantes</li>
                                <li>• Verifica el pronóstico del tiempo</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="col-span-2 md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Horario de Inicio *
                          </label>
                        </div>

                        <label className="relative flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                          <input
                            type="radio"
                            name="startTime"
                            value="06:00:00"
                            required
                            className="sr-only peer"
                          />
                          <div className="flex flex-col items-center w-full peer-checked:text-blue-600">
                            <Clock className="w-5 h-5 mb-1" />
                            <span className="text-sm font-medium">6:00 AM</span>
                            <span className="text-xs text-gray-500">Mañana</span>
                          </div>
                          <div className="absolute inset-0 border-2 border-blue-600 rounded-lg opacity-0 peer-checked:opacity-100 pointer-events-none"></div>
                        </label>

                        <label className="relative flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                          <input
                            type="radio"
                            name="startTime"
                            value="08:00:00"
                            className="sr-only peer"
                          />
                          <div className="flex flex-col items-center w-full peer-checked:text-blue-600">
                            <Clock className="w-5 h-5 mb-1" />
                            <span className="text-sm font-medium">8:00 AM</span>
                            <span className="text-xs text-gray-500">Mañana</span>
                          </div>
                          <div className="absolute inset-0 border-2 border-blue-600 rounded-lg opacity-0 peer-checked:opacity-100 pointer-events-none"></div>
                        </label>

                        <label className="relative flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                          <input
                            type="radio"
                            name="startTime"
                            value="10:00:00"
                            className="sr-only peer"
                          />
                          <div className="flex flex-col items-center w-full peer-checked:text-blue-600">
                            <Clock className="w-5 h-5 mb-1" />
                            <span className="text-sm font-medium">10:00 AM</span>
                            <span className="text-xs text-gray-500">Mañana</span>
                          </div>
                          <div className="absolute inset-0 border-2 border-blue-600 rounded-lg opacity-0 peer-checked:opacity-100 pointer-events-none"></div>
                        </label>

                        <label className="relative flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                          <input
                            type="radio"
                            name="startTime"
                            value="14:00:00"
                            className="sr-only peer"
                          />
                          <div className="flex flex-col items-center w-full peer-checked:text-blue-600">
                            <Clock className="w-5 h-5 mb-1" />
                            <span className="text-sm font-medium">2:00 PM</span>
                            <span className="text-xs text-gray-500">Tarde</span>
                          </div>
                          <div className="absolute inset-0 border-2 border-blue-600 rounded-lg opacity-0 peer-checked:opacity-100 pointer-events-none"></div>
                        </label>

                        <label className="relative flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                          <input
                            type="radio"
                            name="startTime"
                            value="16:00:00"
                            className="sr-only peer"
                          />
                          <div className="flex flex-col items-center w-full peer-checked:text-blue-600">
                            <Clock className="w-5 h-5 mb-1" />
                            <span className="text-sm font-medium">4:00 PM</span>
                            <span className="text-xs text-gray-500">Tarde</span>
                          </div>
                          <div className="absolute inset-0 border-2 border-blue-600 rounded-lg opacity-0 peer-checked:opacity-100 pointer-events-none"></div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duración de la Clase *
                        </label>
                        <select
                          name="duration"
                          required
                          defaultValue="90"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="60">60 minutos (1 hora)</option>
                          <option value="90">90 minutos (1.5 horas) - Recomendado</option>
                        </select>
                        <p className="mt-1 text-sm text-gray-500">
                          Duración máxima: 90 minutos para mantener espacio entre turnos
                        </p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex">
                          <Clock className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
                          <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Horarios Disponibles</p>
                            <p>Las clases se programan en turnos fijos para optimizar el uso de las instalaciones y garantizar la mejor experiencia.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detalles de la Clase */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Detalles de la Clase</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nivel *
                        </label>
                        <select
                          name="level"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Seleccionar nivel</option>
                          <option value="BEGINNER">Principiante</option>
                          <option value="INTERMEDIATE">Intermedio</option>
                          <option value="ADVANCED">Avanzado</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Capacidad *
                        </label>
                        <input
                          name="capacity"
                          type="number"
                          required
                          min="1"
                          max="20"
                          placeholder="Ej: 8"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio (S/.) *
                        </label>
                        <input
                          name="price"
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          placeholder="Ej: 80.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Ubicación</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lugar de la Clase *
                      </label>
                      <input
                        name="location"
                        type="text"
                        required
                        placeholder="Ej: Playa Miraflores, Lima"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Especifica la playa o lugar exacto donde se realizará la clase
                      </p>
                    </div>
                  </div>

                  {/* Información Adicional */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Consejos para crear una clase exitosa
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <ul className="list-disc list-inside space-y-1">
                            <li>Usa un título claro y descriptivo</li>
                            <li>Especifica claramente el nivel requerido</li>
                            <li>Incluye detalles sobre qué se aprenderá</li>
                            <li>Asegúrate de que la ubicación sea fácil de encontrar</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Crear Clase
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}