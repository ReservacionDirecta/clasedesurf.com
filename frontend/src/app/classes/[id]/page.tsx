'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  CreditCard,
  Waves,
  Shield,
  Award
} from 'lucide-react';

interface ClassDetails {
  id: number;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  capacity: number;
  enrolled: number;
  price: number;
  level: string;
  location: string;
  status: 'ACTIVE' | 'CANCELED' | 'COMPLETED';
  instructor: {
    id: number;
    name: string;
    bio: string;
    rating: number;
    totalReviews: number;
    yearsExperience: number;
    specialties: string[];
    profileImage?: string;
  };
  school: {
    id: number;
    name: string;
    location: string;
    phone: string;
    email: string;
    rating: number;
    totalReviews: number;
  };
  reservations: {
    id: number;
    userId: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELED';
    specialRequest?: string;
    createdAt: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
  }[];
}

export default function ClassDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userReservation, setUserReservation] = useState<any>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showStudentProfileModal, setShowStudentProfileModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [reservationLoading, setReservationLoading] = useState(false);

  const classId = params.id as string;

  useEffect(() => {
    if (classId) {
      fetchClassDetails();
    }
  }, [classId]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch real class details from backend
      const response = await fetch(`/api/classes/${classId}`, { headers });

      if (!response.ok) {
        throw new Error('Error al cargar detalles de la clase');
      }

      const classData = await response.json();

      // Process class data to match expected format
      const processedClass: ClassDetails = {
        id: classData.id,
        title: classData.title,
        description: classData.description || 'Clase de surf',
        date: classData.date,
        startTime: new Date(classData.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        endTime: new Date(new Date(classData.date).getTime() + (classData.duration || 120) * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        duration: classData.duration || 120,
        capacity: classData.capacity,
        enrolled: classData.reservations?.filter((r: any) => r.status !== 'CANCELED').length || 0,
        price: Number(classData.price),
        level: classData.level || 'BEGINNER',
        location: classData.location || 'Por definir',
        status: classData.status || 'ACTIVE',
        instructor: {
          id: 1,
          name: classData.instructor || 'Instructor',
          bio: 'Instructor profesional de surf',
          rating: 4.9,
          totalReviews: 0,
          yearsExperience: 5,
          specialties: [],
          profileImage: undefined
        },
        school: {
          id: classData.school?.id || 0,
          name: classData.school?.name || 'Escuela de Surf',
          location: classData.school?.location || 'Lima, Perú',
          phone: classData.school?.phone || '',
          email: classData.school?.email || '',
          rating: 4.8,
          totalReviews: 0
        },
        reservations: classData.reservations?.map((r: any) => ({
          id: r.id,
          userId: r.userId,
          status: r.status,
          specialRequest: r.specialRequest,
          createdAt: r.createdAt,
          user: {
            id: r.user?.id || 0,
            name: r.user?.name || 'Usuario',
            email: r.user?.email || ''
          }
        })) || []
      };

      setClassDetails(processedClass);

      // Check if user has a reservation for this class
      if (session?.user?.id) {
        const userRes = processedClass.reservations.find(
          (r: any) => r.userId === parseInt(session.user.id as string)
        );
        setUserReservation(userRes);
      }

      setLoading(false);

      // Fallback to mock data if API fails
      if (!classData) {
        const mockClassDetails: ClassDetails = {
        id: parseInt(classId),
        title: classId === '1' ? 'Surf para Principiantes' : 
               classId === '2' ? 'Técnicas Avanzadas' :
               classId === '3' ? 'Longboard Session' : 'Surf Kids',
        description: classId === '1' ? 
          'Clase perfecta para quienes nunca han surfeado. Aprenderás las técnicas básicas, seguridad en el agua y cómo leer las olas. Incluye teoría en la playa y práctica supervisada en el agua.' :
          classId === '2' ?
          'Perfecciona tu técnica con maniobras avanzadas. Aprende cutbacks, bottom turns y cómo generar velocidad. Para surfistas con experiencia básica.' :
          classId === '3' ?
          'Sesión especializada en longboard con enfoque en el estilo clásico. Aprende cross-stepping, nose riding y la elegancia del longboard tradicional.' :
          'Clases especiales para niños de 8-14 años. Ambiente seguro y divertido con instructores especializados en enseñanza infantil.',
        date: new Date(Date.now() + parseInt(classId) * 86400000).toISOString(),
        startTime: classId === '1' ? '10:00:00' : 
                   classId === '2' ? '14:00:00' :
                   classId === '3' ? '16:00:00' : '11:00:00',
        endTime: classId === '1' ? '12:00:00' : 
                 classId === '2' ? '16:00:00' :
                 classId === '3' ? '18:00:00' : '12:30:00',
        duration: classId === '1' ? 120 : 
                  classId === '2' ? 120 :
                  classId === '3' ? 120 : 90,
        capacity: classId === '1' ? 8 : 
                  classId === '2' ? 6 :
                  classId === '3' ? 10 : 10,
        enrolled: classId === '1' ? 6 : 
                  classId === '2' ? 4 :
                  classId === '3' ? 8 : 7,
        price: classId === '1' ? 80 : 
               classId === '2' ? 120 :
               classId === '3' ? 100 : 60,
        level: classId === '1' ? 'BEGINNER' : 
               classId === '2' ? 'ADVANCED' :
               classId === '3' ? 'INTERMEDIATE' : 'BEGINNER',
        location: classId === '1' ? 'Playa Makaha, Miraflores' : 
                  classId === '2' ? 'Playa Waikiki, San Bartolo' :
                  classId === '3' ? 'La Herradura, Chorrillos' : 'Playa Redondo, Callao',
        status: 'ACTIVE',
        instructor: {
          id: 1,
          name: 'Gabriel Barrera',
          bio: 'Instructor profesional con más de 8 años de experiencia. Especialista en enseñanza para principiantes y técnicas avanzadas.',
          rating: 4.9,
          totalReviews: 47,
          yearsExperience: 8,
          specialties: ['Surf para principiantes', 'Técnicas avanzadas', 'Longboard', 'Seguridad en el agua'],
          profileImage: undefined
        },
        school: {
          id: 1,
          name: 'Escuela de Surf Lima',
          location: 'Lima, Perú',
          phone: '+51 987 654 321',
          email: 'info@escuelasurflima.com',
          rating: 4.8,
          totalReviews: 156
        },
        reservations: [
          {
            id: 1,
            userId: 1,
            status: 'CONFIRMED',
            specialRequest: 'Primera vez surfeando',
            createdAt: new Date().toISOString(),
            user: { id: 1, name: 'Ana García', email: 'ana@email.com' }
          },
          {
            id: 2,
            userId: 2,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            user: { id: 2, name: 'Carlos López', email: 'carlos@email.com' }
          }
        ]
      };

        setClassDetails(mockClassDetails);
        
        // Verificar si el usuario actual tiene una reserva
        if (session?.user) {
          const userRes = mockClassDetails.reservations.find(r => r.user.email === session.user.email);
          setUserReservation(userRes);
        }
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar detalles');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
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

  const getLevelInfo = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return { text: 'Principiante', color: 'bg-green-100 text-green-800', description: 'No se requiere experiencia previa' };
      case 'INTERMEDIATE':
        return { text: 'Intermedio', color: 'bg-yellow-100 text-yellow-800', description: 'Experiencia básica requerida' };
      case 'ADVANCED':
        return { text: 'Avanzado', color: 'bg-red-100 text-red-800', description: 'Para surfistas experimentados' };
      default:
        return { text: 'Todos los niveles', color: 'bg-blue-100 text-blue-800', description: 'Adaptado a tu nivel' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const handleReservation = async (specialRequest?: string) => {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    setReservationLoading(true);
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Crear nueva reserva mock
      const newReservation = {
        id: Date.now(),
        userId: parseInt(session.user.id || '1'),
        status: 'PENDING' as const,
        specialRequest,
        createdAt: new Date().toISOString(),
        user: {
          id: parseInt(session.user.id || '1'),
          name: session.user.name || 'Usuario',
          email: session.user.email || 'usuario@email.com'
        }
      };

      // Actualizar estado local
      setUserReservation(newReservation);
      if (classDetails) {
        setClassDetails({
          ...classDetails,
          enrolled: classDetails.enrolled + 1,
          reservations: [...classDetails.reservations, newReservation]
        });
      }

      setShowReservationModal(false);
    } catch (error) {
      console.error('Error al reservar:', error);
    } finally {
      setReservationLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!userReservation) return;

    setReservationLoading(true);
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar estado local
      setUserReservation(null);
      if (classDetails) {
        setClassDetails({
          ...classDetails,
          enrolled: classDetails.enrolled - 1,
          reservations: classDetails.reservations.filter(r => r.id !== userReservation.id)
        });
      }
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
    } finally {
      setReservationLoading(false);
    }
  };

  const handleViewStudentProfile = (student: any) => {
    // Datos mock del perfil del estudiante
    const studentProfile = {
      ...student,
      profileImage: null,
      joinDate: '2024-01-15',
      totalClasses: Math.floor(Math.random() * 20) + 1,
      level: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'][Math.floor(Math.random() * 3)],
      bio: 'Apasionado por el surf y los deportes acuáticos. Siempre buscando mejorar mi técnica.',
      achievements: ['Primera ola', 'Surf nocturno', '10 clases completadas'],
      emergencyContact: {
        name: 'Contacto de emergencia',
        phone: '+51 987 654 999',
        relationship: 'Familiar'
      }
    };
    
    setSelectedStudent(studentProfile);
    setShowStudentProfileModal(true);
  };

  const availableSpots = classDetails ? classDetails.capacity - classDetails.enrolled : 0;
  const levelInfo = classDetails ? getLevelInfo(classDetails.level) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando detalles de la clase...</p>
        </div>
      </div>
    );
  }

  if (error || !classDetails) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </button>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 mb-2">Error al cargar la clase</h2>
            <p className="text-red-600 mb-6">{error || 'Clase no encontrada'}</p>
            <button
              onClick={() => router.push('/classes')}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Ver Todas las Clases
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 touch-manipulation"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Class Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">{classDetails.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-blue-100">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="capitalize">{formatDate(classDetails.date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{formatTime(classDetails.startTime)} - {formatTime(classDetails.endTime)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">S/. {classDetails.price}</div>
                    <div className="text-blue-200 text-sm">por persona</div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${levelInfo?.color}`}>
                    {levelInfo?.text}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                    availableSpots > 0 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    {availableSpots > 0 ? `${availableSpots} cupos disponibles` : 'Clase llena'}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {classDetails.duration} minutos
                  </span>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{classDetails.description}</p>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3 text-blue-600" />
                    <span>{classDetails.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-3 text-green-600" />
                    <span>{classDetails.enrolled}/{classDetails.capacity} estudiantes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructor Information */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tu Instructor</h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {classDetails.instructor.profileImage ? (
                    <img 
                      src={classDetails.instructor.profileImage} 
                      alt={classDetails.instructor.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{classDetails.instructor.name}</h3>
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm font-semibold text-yellow-700">{classDetails.instructor.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{classDetails.instructor.bio}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{classDetails.instructor.yearsExperience} años de experiencia</span>
                    <span>{classDetails.instructor.totalReviews} reseñas</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {classDetails.instructor.specialties.slice(0, 3).map((specialty, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">¿Qué incluye?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Waves className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700">Tabla de surf</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-gray-700">Traje de neopreno</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-gray-700">Instructor certificado</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <Shield className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="text-gray-700">Seguro de accidentes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Reservar Clase</h3>
              
              {userReservation ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {(() => {
                        const badge = getStatusBadge(userReservation.status);
                        const IconComponent = badge.icon;
                        return (
                          <>
                            <IconComponent className="w-5 h-5" />
                            <span className="font-semibold">Tu Reserva: {badge.text}</span>
                          </>
                        );
                      })()}
                    </div>
                    <p className="text-sm text-gray-600">
                      Reservado el {new Date(userReservation.createdAt).toLocaleDateString('es-ES')}
                    </p>
                    {userReservation.specialRequest && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Solicitud:</span> {userReservation.specialRequest}
                      </p>
                    )}
                  </div>
                  
                  {userReservation.status === 'PENDING' && (
                    <button 
                      onClick={handleCancelReservation}
                      disabled={reservationLoading}
                      className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                    >
                      {reservationLoading ? 'Cancelando...' : 'Cancelar Reserva'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">S/. {classDetails.price}</div>
                    <div className="text-gray-600 text-sm">por persona</div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacidad:</span>
                      <span className="font-medium">{classDetails.capacity} personas</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Disponibles:</span>
                      <span className={`font-medium ${availableSpots > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {availableSpots} cupos
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duración:</span>
                      <span className="font-medium">{classDetails.duration} minutos</span>
                    </div>
                  </div>

                  {session ? (
                    availableSpots > 0 ? (
                      <button 
                        onClick={() => setShowReservationModal(true)}
                        disabled={reservationLoading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium touch-manipulation disabled:opacity-50"
                      >
                        {reservationLoading ? 'Procesando...' : 'Reservar Ahora'}
                      </button>
                    ) : (
                      <button disabled className="w-full bg-gray-400 text-white py-3 rounded-lg cursor-not-allowed font-medium">
                        Clase Llena
                      </button>
                    )
                  ) : (
                    <button 
                      onClick={() => router.push('/login')}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium touch-manipulation"
                    >
                      Iniciar Sesión para Reservar
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* School Information */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Escuela</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{classDetails.school.name}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{classDetails.school.rating}</span>
                    <span className="text-sm text-gray-500">({classDetails.school.totalReviews} reseñas)</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{classDetails.school.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{classDetails.school.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{classDetails.school.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Level Information */}
            {levelInfo && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Nivel de la Clase</h3>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${levelInfo.color}`}>
                    {levelInfo.text}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{levelInfo.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reservations List (Only for instructors) */}
        {session?.user?.role === 'INSTRUCTOR' && (
          <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Reservas de esta Clase</h2>
            
            {classDetails.reservations.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aún no hay reservas para esta clase</p>
              </div>
            ) : (
              <div className="space-y-4">
                {classDetails.reservations.map((reservation) => {
                  const badge = getStatusBadge(reservation.status);
                  const IconComponent = badge.icon;
                  
                  return (
                    <div key={reservation.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{reservation.user.name}</h4>
                          <p className="text-sm text-gray-600">{reservation.user.email}</p>
                          {reservation.specialRequest && (
                            <p className="text-xs text-blue-600 mt-1">&quot;{reservation.specialRequest}&quot;</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewStudentProfile(reservation.user)}
                          className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                        >
                          Ver Perfil
                        </button>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badge.class}`}>
                          <IconComponent className="w-3 h-3 mr-1 inline" />
                          {badge.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Modal de Reserva */}
        {showReservationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Confirmar Reserva</h3>
                <button 
                  onClick={() => setShowReservationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2">{classDetails?.title}</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>📅 {classDetails && formatDate(classDetails.date)}</p>
                    <p>⏰ {classDetails && formatTime(classDetails.startTime)} - {classDetails && formatTime(classDetails.endTime)}</p>
                    <p>📍 {classDetails?.location}</p>
                    <p className="font-semibold">💰 S/. {classDetails?.price}</p>
                  </div>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const specialRequest = formData.get('specialRequest') as string;
                  handleReservation(specialRequest);
                }}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Solicitud especial (opcional)
                    </label>
                    <textarea
                      name="specialRequest"
                      rows={3}
                      placeholder="¿Hay algo específico que quieras que sepamos? (primera vez, miedos, objetivos, etc.)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowReservationModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={reservationLoading}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {reservationLoading ? 'Reservando...' : 'Confirmar Reserva'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Perfil del Estudiante */}
        {showStudentProfileModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Perfil del Estudiante</h3>
                <button 
                  onClick={() => setShowStudentProfileModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Información básica */}
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {selectedStudent.profileImage ? (
                      <img 
                        src={selectedStudent.profileImage} 
                        alt={selectedStudent.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedStudent.name}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>{selectedStudent.email}</span>
                      </div>
                      {selectedStudent.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>{selectedStudent.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Miembro desde: {new Date(selectedStudent.joinDate).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedStudent.totalClasses}</div>
                    <div className="text-sm text-blue-800">Clases Tomadas</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-lg font-bold text-green-600">
                      {selectedStudent.level === 'BEGINNER' ? 'Principiante' :
                       selectedStudent.level === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
                    </div>
                    <div className="text-sm text-green-800">Nivel Actual</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedStudent.achievements?.length || 0}</div>
                    <div className="text-sm text-purple-800">Logros</div>
                  </div>
                </div>

                {/* Biografía */}
                {selectedStudent.bio && (
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">Sobre mí</h5>
                    <p className="text-gray-600 bg-gray-50 rounded-lg p-3">{selectedStudent.bio}</p>
                  </div>
                )}

                {/* Logros */}
                {selectedStudent.achievements && selectedStudent.achievements.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">Logros</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.achievements.map((achievement: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          🏆 {achievement}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contacto de emergencia */}
                {selectedStudent.emergencyContact && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h5 className="font-semibold text-red-900 mb-2">Contacto de Emergencia</h5>
                    <div className="text-sm text-red-800 space-y-1">
                      <p><span className="font-medium">Nombre:</span> {selectedStudent.emergencyContact.name}</p>
                      <p><span className="font-medium">Teléfono:</span> {selectedStudent.emergencyContact.phone}</p>
                      <p><span className="font-medium">Relación:</span> {selectedStudent.emergencyContact.relationship}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                <button 
                  onClick={() => setShowStudentProfileModal(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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