'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Users, Star, Calendar, Phone, Mail, MessageCircle, Award, TrendingUp } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  age: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  totalClasses: number;
  completedClasses: number;
  rating: number; // Rating que el estudiante le dio al instructor
  joinDate: string;
  lastClass: string;
  canSwim: boolean;
  injuries?: string;
  progress: number;
  notes?: string; // Notas del instructor sobre el estudiante
}

export default function InstructorStudents() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

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

    fetchStudents();
  }, [session, status, router]);

  const fetchStudents = async () => {
    try {
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch real students data from backend
      const studentsRes = await fetch('/api/instructor/students', { headers });

      if (!studentsRes.ok) {
        throw new Error('Failed to fetch students');
      }

      const studentsData = await studentsRes.json();

      // Process students to match the expected format
      const processedStudents: Student[] = studentsData.map((student: any) => {
        // Determine level based on classes taken
        let level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' = 'BEGINNER';
        const classLevels = student.classes?.map((c: any) => c.level) || [];
        if (classLevels.includes('ADVANCED')) {
          level = 'ADVANCED';
        } else if (classLevels.includes('INTERMEDIATE')) {
          level = 'INTERMEDIATE';
        }

        // Calculate progress based on completed classes
        const completedClasses = student.classes?.filter((c: any) => 
          c.reservationStatus === 'CONFIRMED' && new Date(c.date) < new Date()
        ).length || 0;
        const progress = Math.min(Math.round((completedClasses / 10) * 100), 100);

        // Get last class date
        const sortedClasses = (student.classes || []).sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const lastClass = sortedClasses[0]?.date || new Date().toISOString();
        const joinDate = sortedClasses[sortedClasses.length - 1]?.date || new Date().toISOString();

        return {
          id: student.id,
          name: student.name,
          age: student.age || 25,
          level: level,
          totalClasses: student.totalReservations || 0,
          completedClasses: completedClasses,
          rating: 4.5, // TODO: Calculate from reviews
          joinDate: joinDate,
          lastClass: lastClass,
          canSwim: student.canSwim !== false,
          injuries: student.injuries || undefined,
          progress: progress,
          notes: '' // TODO: Add notes field to backend
        };
      });

      setStudents(processedStudents);
      setLoading(false);

      // Fallback to mock data if no real data
      if (processedStudents.length === 0) {
        const mockStudents: Student[] = [
        {
          id: 1,
          name: 'María González',
          age: 25,
          level: 'BEGINNER',
          totalClasses: 8,
          completedClasses: 6,
          rating: 4.8,
          joinDate: '2024-10-15',
          lastClass: '2024-12-10',
          canSwim: true,
          progress: 75,
          notes: 'Muy dedicada, progresa rápidamente en el equilibrio'
        },
        {
          id: 2,
          name: 'Carlos Mendoza',
          age: 32,
          level: 'INTERMEDIATE',
          totalClasses: 15,
          completedClasses: 12,
          rating: 4.9,
          joinDate: '2024-08-20',
          lastClass: '2024-12-12',
          canSwim: true,
          progress: 80,
          notes: 'Excelente técnica, listo para maniobras avanzadas'
        },
        {
          id: 3,
          name: 'Ana Rodríguez',
          age: 28,
          level: 'BEGINNER',
          totalClasses: 4,
          completedClasses: 3,
          rating: 4.2,
          joinDate: '2024-11-01',
          lastClass: '2024-12-08',
          canSwim: true,
          injuries: 'Lesión menor en rodilla izquierda',
          progress: 45,
          notes: 'Cuidar la rodilla, enfocar en técnica de remada'
        },
        {
          id: 4,
          name: 'Diego Fernández',
          age: 35,
          level: 'ADVANCED',
          totalClasses: 25,
          completedClasses: 22,
          rating: 4.7,
          joinDate: '2024-06-10',
          lastClass: '2024-12-11',
          canSwim: true,
          progress: 90,
          notes: 'Surfista experimentado, trabajando en competición'
        },
        {
          id: 5,
          name: 'Sofía López',
          age: 22,
          level: 'BEGINNER',
          totalClasses: 2,
          completedClasses: 1,
          rating: 4.0,
          joinDate: '2024-12-01',
          lastClass: '2024-12-05',
          canSwim: false,
          progress: 20,
          notes: 'Priorizar natación antes de surf avanzado'
        },
        {
          id: 6,
          name: 'Roberto Silva',
          age: 29,
          level: 'INTERMEDIATE',
          totalClasses: 18,
          completedClasses: 16,
          rating: 4.6,
          joinDate: '2024-07-15',
          lastClass: '2024-12-09',
          canSwim: true,
          progress: 85,
          notes: 'Buen progreso, trabajar en lectura de olas'
        }
      ];

        setStudents(mockStudents);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.notes && student.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = levelFilter === 'all' || student.level === levelFilter;
    return matchesSearch && matchesLevel;
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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShowNotes = (student: Student) => {
    setSelectedStudent(student);
    setShowNotesModal(true);
  };

  const handleShowHistory = (student: Student) => {
    setSelectedStudent(student);
    setShowHistoryModal(true);
  };

  const handleSaveNotes = (newNotes: string) => {
    if (selectedStudent) {
      const updatedStudents = students.map(s => 
        s.id === selectedStudent.id ? { ...s, notes: newNotes } : s
      );
      setStudents(updatedStudents);
      setShowNotesModal(false);
      setSelectedStudent(null);
    }
  };

  // Datos mock del historial de clases
  const getStudentHistory = (studentId: number) => {
    return [
      {
        id: 1,
        date: '2024-12-10',
        className: 'Surf para Principiantes',
        duration: 120,
        performance: 'Excelente progreso en equilibrio',
        attendance: 'Presente'
      },
      {
        id: 2,
        date: '2024-12-05',
        className: 'Técnicas Básicas',
        duration: 90,
        performance: 'Mejoró la técnica de remada',
        attendance: 'Presente'
      },
      {
        id: 3,
        date: '2024-11-28',
        className: 'Surf para Principiantes',
        duration: 120,
        performance: 'Primera clase, muy entusiasta',
        attendance: 'Presente'
      }
    ];
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
            onClick={() => router.push('/dashboard/instructor')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Volver al Dashboard
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Estudiantes</h1>
              <p className="text-gray-600 mt-2">Gestiona y da seguimiento a tus estudiantes</p>
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
              <Award className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Principiantes</h3>
                <p className="text-3xl font-bold text-green-600">
                  {students.filter(s => s.level === 'BEGINNER').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-600" />
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
                  {(students.reduce((sum, s) => sum + s.rating, 0) / students.length).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar estudiantes por nombre o notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLevelFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  levelFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setLevelFilter('BEGINNER')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  levelFilter === 'BEGINNER'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Principiantes
              </button>
              <button
                onClick={() => setLevelFilter('INTERMEDIATE')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  levelFilter === 'INTERMEDIATE'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Intermedios
              </button>
              <button
                onClick={() => setLevelFilter('ADVANCED')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  levelFilter === 'ADVANCED'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Avanzados
              </button>
            </div>
          </div>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-600">{student.age} años</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(student.level)}`}>
                  {student.level === 'BEGINNER' ? 'Principiante' :
                   student.level === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Estudiante desde {formatDate(student.joinDate)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="w-4 h-4 mr-2" />
                  Rating del instructor: {student.rating}/5.0
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Última clase: {formatDate(student.lastClass)}
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progreso</span>
                  <span>{student.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(student.progress)}`}
                    style={{ width: `${student.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Classes Info */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-blue-600">{student.completedClasses}</p>
                  <p className="text-xs text-blue-800">Completadas</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-green-600">{student.totalClasses}</p>
                  <p className="text-xs text-green-800">Total</p>
                </div>
              </div>

              {/* Warnings */}
              {!student.canSwim && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-4">
                  <p className="text-xs text-red-800 font-medium">⚠️ No sabe nadar</p>
                </div>
              )}

              {student.injuries && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-4">
                  <p className="text-xs text-yellow-800 font-medium">🩹 {student.injuries}</p>
                </div>
              )}

              {student.notes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4">
                  <p className="text-xs text-blue-800 font-medium">📝 {student.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button 
                  onClick={() => handleShowNotes(student)}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Notas
                </button>
                <button 
                  onClick={() => handleShowHistory(student)}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm"
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Historial
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron estudiantes</h3>
            <p className="text-gray-600">
              {searchTerm || levelFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no tienes estudiantes asignados'
              }
            </p>
          </div>
        )}

        {/* Modal Notas del Estudiante */}
        {showNotesModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Notas de {selectedStudent.name}
                </h3>
                <button 
                  onClick={() => setShowNotesModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Nivel:</span> {
                      selectedStudent.level === 'BEGINNER' ? 'Principiante' :
                      selectedStudent.level === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'
                    }
                  </div>
                  <div>
                    <span className="font-medium">Progreso:</span> {selectedStudent.progress}%
                  </div>
                  <div>
                    <span className="font-medium">Clases completadas:</span> {selectedStudent.completedClasses}
                  </div>
                  <div>
                    <span className="font-medium">Última clase:</span> {formatDate(selectedStudent.lastClass)}
                  </div>
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newNotes = formData.get('notes') as string;
                handleSaveNotes(newNotes);
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas del Instructor
                  </label>
                  <textarea 
                    name="notes"
                    defaultValue={selectedStudent.notes || ''}
                    rows={6}
                    placeholder="Escribe aquí tus observaciones sobre el progreso, técnica, áreas de mejora, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowNotesModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Guardar Notas
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Historial del Estudiante */}
        {showHistoryModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Historial de {selectedStudent.name}
                </h3>
                <button 
                  onClick={() => setShowHistoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900">Total de Clases</h4>
                  <p className="text-2xl font-bold text-blue-600">{selectedStudent.totalClasses}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900">Completadas</h4>
                  <p className="text-2xl font-bold text-green-600">{selectedStudent.completedClasses}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900">Progreso</h4>
                  <p className="text-2xl font-bold text-purple-600">{selectedStudent.progress}%</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Historial de Clases</h4>
                {getStudentHistory(selectedStudent.id).map((classHistory) => (
                  <div key={classHistory.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-medium text-gray-900">{classHistory.className}</h5>
                        <p className="text-sm text-gray-600">{formatDate(classHistory.date)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">{classHistory.duration} min</span>
                        <div className="text-sm">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {classHistory.attendance}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Observaciones:</span> {classHistory.performance}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mt-6">
                <button 
                  onClick={() => setShowHistoryModal(false)}
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