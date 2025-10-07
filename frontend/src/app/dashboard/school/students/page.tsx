'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Users, Search, Filter, Eye, Mail, Phone, Calendar, Star, TrendingUp, Award } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  totalClasses: number;
  completedClasses: number;
  joinDate: string;
  lastClass: string;
  canSwim: boolean;
  status: 'active' | 'inactive';
  totalPaid: number;
  averageRating: number;
}

export default function SchoolStudents() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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

    fetchStudents();
  }, [session, status, router]);

  const fetchStudents = async () => {
    try {
      // Datos mock de estudiantes de la escuela
      const mockStudents: Student[] = [
        {
          id: 1,
          name: 'María González',
          email: 'maria.gonzalez@email.com',
          phone: '+51 999 111 222',
          age: 25,
          level: 'BEGINNER',
          totalClasses: 8,
          completedClasses: 6,
          joinDate: '2024-10-15',
          lastClass: '2024-12-10',
          canSwim: true,
          status: 'active',
          totalPaid: 640,
          averageRating: 4.8
        },
        {
          id: 2,
          name: 'Carlos Mendoza',
          email: 'carlos.mendoza@email.com',
          phone: '+51 999 333 444',
          age: 32,
          level: 'INTERMEDIATE',
          totalClasses: 15,
          completedClasses: 12,
          joinDate: '2024-08-20',
          lastClass: '2024-12-12',
          canSwim: true,
          status: 'active',
          totalPaid: 1800,
          averageRating: 4.9
        },
        {
          id: 3,
          name: 'Ana Rodríguez',
          email: 'ana.rodriguez@email.com',
          phone: '+51 999 555 666',
          age: 28,
          level: 'BEGINNER',
          totalClasses: 4,
          completedClasses: 3,
          joinDate: '2024-11-01',
          lastClass: '2024-12-08',
          canSwim: true,
          status: 'active',
          totalPaid: 320,
          averageRating: 4.2
        },
        {
          id: 4,
          name: 'Diego Fernández',
          email: 'diego.fernandez@email.com',
          phone: '+51 999 777 888',
          age: 35,
          level: 'ADVANCED',
          totalClasses: 25,
          completedClasses: 22,
          joinDate: '2024-06-10',
          lastClass: '2024-12-11',
          canSwim: true,
          status: 'active',
          totalPaid: 3750,
          averageRating: 4.7
        },
        {
          id: 5,
          name: 'Sofía López',
          email: 'sofia.lopez@email.com',
          phone: '+51 999 999 000',
          age: 22,
          level: 'BEGINNER',
          totalClasses: 2,
          completedClasses: 1,
          joinDate: '2024-12-01',
          lastClass: '2024-12-05',
          canSwim: false,
          status: 'active',
          totalPaid: 160,
          averageRating: 4.0
        },
        {
          id: 6,
          name: 'Roberto Silva',
          email: 'roberto.silva@email.com',
          phone: '+51 999 222 333',
          age: 29,
          level: 'INTERMEDIATE',
          totalClasses: 18,
          completedClasses: 16,
          joinDate: '2024-07-15',
          lastClass: '2024-11-20',
          canSwim: true,
          status: 'inactive',
          totalPaid: 2160,
          averageRating: 4.6
        }
      ];

      setStudents(mockStudents);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || student.level === levelFilter;
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesLevel && matchesStatus;
  });

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

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
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

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estudiantes...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Estudiantes</h1>
              <p className="text-gray-600 mt-2">Gestiona la base de estudiantes de tu escuela</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total</h3>
                <p className="text-3xl font-bold text-blue-600">{students.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Activos</h3>
                <p className="text-3xl font-bold text-green-600">
                  {students.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Avanzados</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {students.filter(s => s.level === 'ADVANCED').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Rating Promedio</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {(students.reduce((sum, s) => sum + s.averageRating, 0) / students.length).toFixed(1)}
                </p>
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
                  placeholder="Buscar estudiantes por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los niveles</option>
                <option value="BEGINNER">Principiantes</option>
                <option value="INTERMEDIATE">Intermedios</option>
                <option value="ADVANCED">Avanzados</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clases
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Pagado
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
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.age} años</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.email}</div>
                      <div className="text-sm text-gray-500">{student.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(student.level)}`}>
                        {student.level === 'BEGINNER' ? 'Principiante' :
                         student.level === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.completedClasses}/{student.totalClasses}</div>
                      <div className="text-sm text-gray-500">completadas</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(student.totalPaid)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>
                        {student.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewStudent(student)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
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

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron estudiantes</h3>
            <p className="text-gray-600">
              {searchTerm || levelFilter !== 'all' || statusFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no tienes estudiantes registrados'
              }
            </p>
          </div>
        )}

        {/* Modal Detalles del Estudiante */}
        {showDetailModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Detalles de {selectedStudent.name}
                </h3>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Información Personal */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Información Personal</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Nombre:</span>
                      <p className="text-gray-900">{selectedStudent.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Edad:</span>
                      <p className="text-gray-900">{selectedStudent.age} años</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <p className="text-gray-900">{selectedStudent.email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Teléfono:</span>
                      <p className="text-gray-900">{selectedStudent.phone}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Sabe nadar:</span>
                      <p className="text-gray-900">{selectedStudent.canSwim ? 'Sí' : 'No'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Estado:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedStudent.status)}`}>
                        {selectedStudent.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información Académica */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Información Académica</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Nivel:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(selectedStudent.level)}`}>
                        {selectedStudent.level === 'BEGINNER' ? 'Principiante' :
                         selectedStudent.level === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Rating promedio:</span>
                      <p className="text-gray-900">{selectedStudent.averageRating}/5.0</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Fecha de ingreso:</span>
                      <p className="text-gray-900">{formatDate(selectedStudent.joinDate)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Última clase:</span>
                      <p className="text-gray-900">{formatDate(selectedStudent.lastClass)}</p>
                    </div>
                  </div>
                </div>

                {/* Información Financiera */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Información Financiera</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Total clases:</span>
                      <p className="text-gray-900">{selectedStudent.totalClasses}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Clases completadas:</span>
                      <p className="text-gray-900">{selectedStudent.completedClasses}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Total pagado:</span>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedStudent.totalPaid)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Promedio por clase:</span>
                      <p className="text-gray-900">
                        {formatCurrency(selectedStudent.totalPaid / selectedStudent.totalClasses)}
                      </p>
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