'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { formatDualCurrency } from '@/lib/currency';
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
  Award,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { BookingModal } from '@/components/booking/BookingModal';

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
  images?: string[];
  beach?: {
    id: number;
    name: string;
    location?: string;
  };
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
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const classId = params.id as string;

  // Image navigation functions
  const nextImage = () => {
    if (classDetails?.images && classDetails.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % (classDetails.images?.length || 1));
    }
  };

  const prevImage = () => {
    if (classDetails?.images && classDetails.images.length > 0) {
      const imagesLength = classDetails.images.length;
      setCurrentImageIndex((prev) => (prev - 1 + imagesLength) % imagesLength);
    }
  };

  // Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextImage();
    }
    if (isRightSwipe) {
      prevImage();
    }
  };

  const fetchClassDetails = useCallback(async () => {
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

      // Calculate start and end times from date and duration
      // The date from backend is a DateTime, so we extract the time from it
      const classDate = new Date(classData.date);

      // Check if date is valid
      if (isNaN(classDate.getTime())) {
        console.error('Invalid date received:', classData.date);
      }

      const startTime = classDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const duration = classData.duration || 120; // Default 120 minutes if not provided
      const endDate = new Date(classDate.getTime() + duration * 60000);
      const endTime = endDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      console.log('Class times calculated:', {
        date: classData.date,
        startTime,
        endTime,
        duration
      });

      // Process class data to match expected format
      const processedClass: ClassDetails = {
        id: classData.id,
        title: classData.title,
        description: classData.description || 'Clase de surf',
        date: classData.date,
        startTime: startTime,
        endTime: endTime,
        duration: classData.duration || 120,
        capacity: classData.capacity,
        enrolled: classData.reservations?.filter((r: any) => r.status !== 'CANCELED').length || 0,
        price: Number(classData.price),
        level: classData.level || 'BEGINNER',
        location: classData.location || 'Por definir',
        status: classData.status || 'ACTIVE',
        images: classData.images || [],
        beach: classData.beach || undefined,
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
  }, [classId, session]);

  useEffect(() => {
    if (classId) {
      fetchClassDetails();
    }
  }, [classId, fetchClassDetails]);

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

  // Tips según el nivel de la clase
  const getTipsForLevel = (level: string) => {
    const tips = {
      BEGINNER: [
        {
          title: 'Llega 15 minutos antes',
          description: 'Llegar temprano te permitirá conocer al instructor, familiarizarte con el equipo y calentar adecuadamente antes de entrar al agua.',
          icon: '⏰'
        },
        {
          title: 'Usa protector solar resistente al agua',
          description: 'Aplica protector solar SPF 50+ al menos 30 minutos antes de la clase. El reflejo del sol en el agua intensifica los rayos UV.',
          icon: '☀️'
        },
        {
          title: 'Hidrátate bien',
          description: 'Bebe suficiente agua antes, durante y después de la clase. El surf es un deporte exigente y la hidratación es clave.',
          icon: '💧'
        },
        {
          title: 'Confía en tu instructor',
          description: 'Sigue las indicaciones de tu instructor. Ellos están capacitados para enseñarte de forma segura y progresiva.',
          icon: '👨‍🏫'
        },
        {
          title: 'No tengas miedo de caer',
          description: 'Caerse es parte del aprendizaje. El agua es tu amiga y el instructor te enseñará cómo caer de forma segura.',
          icon: '🌊'
        },
        {
          title: 'Disfruta el proceso',
          description: 'No te presiones por pararte en la tabla el primer día. Disfruta cada momento y celebra los pequeños avances.',
          icon: '😊'
        }
      ],
      INTERMEDIATE: [
        {
          title: 'Revisa las condiciones del mar',
          description: 'Antes de la clase, verifica las condiciones del mar. Esto te ayudará a entender mejor lo que encontrarás y a prepararte mentalmente.',
          icon: '🌊'
        },
        {
          title: 'Calienta antes de entrar',
          description: 'Realiza estiramientos dinámicos y calentamiento específico para surf. Esto previene lesiones y mejora tu rendimiento.',
          icon: '🤸'
        },
        {
          title: 'Practica la técnica en seco',
          description: 'Repasa mentalmente los movimientos antes de entrar al agua. Visualizar la técnica mejora tu ejecución.',
          icon: '🧠'
        },
        {
          title: 'Mantén la posición correcta',
          description: 'Presta atención a tu postura en la tabla. Una buena posición es fundamental para el equilibrio y la propulsión.',
          icon: '🏄'
        },
        {
          title: 'Observa a otros surfistas',
          description: 'Aprende observando a surfistas más experimentados. Nota su técnica, timing y cómo leen las olas.',
          icon: '👀'
        },
        {
          title: 'Respeta las reglas de prioridad',
          description: 'Conoce y respeta las reglas de prioridad en el agua. Esto mantiene a todos seguros y evita conflictos.',
          icon: '🤝'
        }
      ],
      ADVANCED: [
        {
          title: 'Analiza las condiciones',
          description: 'Evalúa el tamaño de las olas, dirección del viento, marea y corrientes. Esta información es crucial para tu seguridad.',
          icon: '📊'
        },
        {
          title: 'Mantén tu condición física',
          description: 'El surf avanzado requiere resistencia y fuerza. Mantén una rutina de entrenamiento fuera del agua.',
          icon: '💪'
        },
        {
          title: 'Perfecciona tu lectura de olas',
          description: 'Desarrolla tu capacidad para identificar las mejores olas. La lectura correcta mejora significativamente tu sesión.',
          icon: '👁️'
        },
        {
          title: 'Trabaja en maniobras específicas',
          description: 'Enfócate en perfeccionar maniobras técnicas como bottom turns, cutbacks y aerials según tu nivel.',
          icon: '🎯'
        },
        {
          title: 'Grabate y analiza',
          description: 'Si es posible, graba tus sesiones para analizar tu técnica. El feedback visual es invaluable para mejorar.',
          icon: '📹'
        },
        {
          title: 'Respeta el océano',
          description: 'Nunca subestimes el poder del océano. Mantén el respeto y la humildad, sin importar tu nivel de experiencia.',
          icon: '🌊'
        }
      ]
    };

    return tips[level as keyof typeof tips] || tips.BEGINNER;
  };

  const tips = classDetails ? getTipsForLevel(classDetails.level) : [];

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + tips.length) % tips.length);
  };

  // Auto-rotate tips every 5 seconds
  useEffect(() => {
    if (tips.length > 1) {
      const interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % tips.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [tips.length]);

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

  const handleBookingSubmit = async (bookingData: any) => {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    if (!classDetails) return;

    setReservationLoading(true);
    try {
      // Preparar datos de reserva para la página de confirmación
      const reservationData = {
        classId: classDetails.id.toString(),
        classData: {
          id: classDetails.id,
          title: classDetails.title,
          description: classDetails.description,
          price: classDetails.price,
          date: classDetails.date,
          startTime: classDetails.startTime,
          endTime: classDetails.endTime,
          level: classDetails.level,
          location: classDetails.location,
          school: classDetails.school
        },
        bookingData: {
          ...bookingData,
          email: session.user.email || bookingData.email,
          name: session.user.name || bookingData.name
        },
        status: 'pending' as const
      };

      // Guardar datos en sessionStorage para la página de confirmación
      sessionStorage.setItem('pendingReservation', JSON.stringify(reservationData));

      // Cerrar modal
      setShowReservationModal(false);

      // Redirigir a la página de confirmación
      router.push('/reservations/confirmation');
    } catch (error) {
      console.error('Error al procesar reserva:', error);
      alert('Error al procesar la reserva. Por favor, inténtalo de nuevo.');
    } finally {
      setReservationLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!userReservation || !session?.user) return;

    // Confirmar cancelación
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    setReservationLoading(true);
    try {
      const token = (session as any)?.backendToken;
      if (!token) {
        alert('Debes estar autenticado para cancelar la reserva');
        return;
      }

      // Llamar a la API para cancelar la reserva
      const response = await fetch(`/api/reservations/${userReservation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'CANCELED'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cancelar la reserva');
      }

      // Actualizar estado local
      setUserReservation(null);
      if (classDetails) {
        setClassDetails({
          ...classDetails,
          enrolled: Math.max(0, classDetails.enrolled - 1),
          reservations: classDetails.reservations.filter(r => r.id !== userReservation.id)
        });
      }

      // Recargar los detalles de la clase para obtener datos actualizados
      await fetchClassDetails();

      alert('Reserva cancelada exitosamente');
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      alert(error instanceof Error ? error.message : 'Error al cancelar la reserva. Por favor, inténtalo de nuevo.');
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
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: 'max(5rem, env(safe-area-inset-bottom))' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4 sm:mb-6 touch-manipulation active:scale-95 transition-transform"
          style={{ touchAction: 'manipulation' }}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-sm sm:text-base">Volver</span>
        </button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Class Information */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Image Gallery */}
            {classDetails.images && classDetails.images.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="relative aspect-video sm:aspect-[16/10] bg-gray-100">
                  {/* Main Image */}
                  <div
                    className="relative w-full h-full"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{ touchAction: 'pan-y pinch-zoom' }}
                  >
                    <Image
                      src={classDetails.images[currentImageIndex]}
                      alt={`${classDetails.title} - Imagen ${currentImageIndex + 1}`}
                      fill
                      className="object-cover"
                      priority
                      unoptimized
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />

                    {/* Image Counter */}
                    {classDetails.images.length > 1 && (
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                        {currentImageIndex + 1} / {classDetails.images.length}
                      </div>
                    )}

                    {/* Navigation Arrows */}
                    {classDetails.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full transition-all touch-manipulation active:scale-90"
                          aria-label="Imagen anterior"
                          style={{ touchAction: 'manipulation' }}
                        >
                          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full transition-all touch-manipulation active:scale-90"
                          aria-label="Siguiente imagen"
                          style={{ touchAction: 'manipulation' }}
                        >
                          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                      </>
                    )}

                    {/* Click to view fullscreen */}
                    <button
                      onClick={() => setShowImageModal(true)}
                      className="absolute inset-0 w-full h-full bg-transparent hover:bg-black/5 transition-colors"
                      aria-label="Ver imagen en pantalla completa"
                    />
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                {classDetails.images.length > 1 && (
                  <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
                    <div
                      className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar"
                      style={{ WebkitOverflowScrolling: 'touch' }}
                    >
                      {classDetails.images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex
                              ? 'border-blue-600 ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <Image
                            src={img}
                            alt={`Miniatura ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Hero Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 sm:p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 leading-tight">{classDetails.title}</h1>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-blue-100 text-sm sm:text-base">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="capitalize">{formatDate(classDetails.date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{formatTime(classDetails.startTime)} - {formatTime(classDetails.endTime)}</span>
                      </div>
                      {classDetails.beach && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{classDetails.beach.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    {(() => {
                      const prices = formatDualCurrency(classDetails.price);
                      return (
                        <>
                          <div className="text-2xl sm:text-3xl font-bold text-white">{prices.pen}</div>
                          <div className="text-blue-200 text-xs sm:text-sm">{prices.usd}</div>
                          <div className="text-blue-200 text-xs mt-1">por persona</div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <span className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${levelInfo?.color}`}>
                    {levelInfo?.text}
                  </span>
                  <span className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border ${availableSpots > 0
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                    {availableSpots > 0 ? `${availableSpots} cupos disponibles` : 'Clase llena'}
                  </span>
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium">
                    {classDetails.duration} min
                  </span>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{classDetails.description}</p>
                </div>

                <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center text-gray-600 text-sm sm:text-base">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                    <span className="break-words">{classDetails.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm sm:text-base">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-green-600 flex-shrink-0" />
                    <span>{classDetails.enrolled}/{classDetails.capacity} estudiantes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructor Information */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Tu Instructor</h2>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {classDetails.instructor.profileImage ? (
                    <Image
                      src={classDetails.instructor.profileImage}
                      alt={classDetails.instructor.name}
                      width={64}
                      height={64}
                      className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{classDetails.instructor.name}</h3>
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full w-fit">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-xs sm:text-sm font-semibold text-yellow-700">{classDetails.instructor.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed">{classDetails.instructor.bio}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <span>{classDetails.instructor.yearsExperience} años de experiencia</span>
                    <span className="hidden sm:inline">•</span>
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
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">¿Qué incluye?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <Waves className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">Tabla de surf</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">Traje de neopreno</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">Instructor certificado</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">Seguro de accidentes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 sticky top-4 sm:top-6 z-10" style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Reservar Clase</h3>

              {userReservation ? (
                <div className="space-y-3 sm:space-y-4">
                  <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {(() => {
                        const badge = getStatusBadge(userReservation.status);
                        const IconComponent = badge.icon;
                        return (
                          <>
                            <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                            <span className="font-semibold text-sm sm:text-base">Tu Reserva: {badge.text}</span>
                          </>
                        );
                      })()}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Reservado el {new Date(userReservation.createdAt).toLocaleDateString('es-ES')}
                    </p>
                    {userReservation.specialRequest && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-2">
                        <span className="font-medium">Solicitud:</span> {userReservation.specialRequest}
                      </p>
                    )}
                  </div>

                  {/* School Information */}
                  {classDetails.school && (
                    <div className="p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 sm:mb-3 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
                        Información de la Escuela
                      </h4>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{classDetails.school.name}</p>
                        </div>
                        {classDetails.school.location && (
                          <div className="flex items-start text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{classDetails.school.location}</span>
                          </div>
                        )}
                        {classDetails.school.phone && (
                          <div className="flex items-center text-gray-600">
                            <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                            <a href={`tel:${classDetails.school.phone}`} className="hover:text-blue-600">
                              {classDetails.school.phone}
                            </a>
                          </div>
                        )}
                        {classDetails.school.email && (
                          <div className="flex items-center text-gray-600">
                            <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                            <a href={`mailto:${classDetails.school.email}`} className="hover:text-blue-600 break-all">
                              {classDetails.school.email}
                            </a>
                          </div>
                        )}
                        {classDetails.school.rating > 0 && (
                          <div className="flex items-center text-gray-600 pt-1">
                            <Star className="w-4 h-4 mr-2 text-yellow-400 fill-current" />
                            <span className="font-medium">{classDetails.school.rating}</span>
                            {classDetails.school.totalReviews > 0 && (
                              <span className="ml-1 text-gray-500">
                                ({classDetails.school.totalReviews} {classDetails.school.totalReviews === 1 ? 'reseña' : 'reseñas'})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {userReservation.status !== 'CANCELED' && userReservation.status !== 'COMPLETED' && new Date(classDetails.date) >= new Date() && (
                    <button
                      onClick={handleCancelReservation}
                      disabled={reservationLoading}
                      className="w-full bg-red-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors font-medium text-sm sm:text-base disabled:opacity-50 touch-manipulation"
                      style={{ touchAction: 'manipulation' }}
                    >
                      {reservationLoading ? 'Cancelando...' : 'Cancelar Reserva'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="text-center">
                    {(() => {
                      const prices = formatDualCurrency(classDetails.price);
                      return (
                        <>
                          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{prices.pen}</div>
                          <div className="text-base sm:text-lg text-gray-600 mb-1">{prices.usd}</div>
                          <div className="text-gray-600 text-xs sm:text-sm">por persona</div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm">
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
                        className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium text-sm sm:text-base touch-manipulation disabled:opacity-50"
                        style={{ touchAction: 'manipulation' }}
                      >
                        {reservationLoading ? 'Procesando...' : 'Reservar Ahora'}
                      </button>
                    ) : (
                      <button disabled className="w-full bg-gray-400 text-white py-2.5 sm:py-3 rounded-lg cursor-not-allowed font-medium text-sm sm:text-base">
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

        {/* Tips Section - Al final de la página */}
        {classDetails && tips.length > 0 && (
          <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-900">Tips para Prepararte</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Consejos útiles para aprovechar al máximo tu clase de nivel {levelInfo?.text.toLowerCase() || 'principiante'}
            </p>

            <div className="bg-white rounded-lg shadow-md p-6 relative">
              {/* Tip Content */}
              <div className="min-h-[120px]">
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">{tips[currentTipIndex]?.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {tips[currentTipIndex]?.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {tips[currentTipIndex]?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              {tips.length > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={prevTip}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Tip anterior"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>

                  <div className="flex gap-2">
                    {tips.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTipIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${index === currentTipIndex
                            ? 'bg-blue-600 w-6'
                            : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        aria-label={`Ir al tip ${index + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextTip}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Siguiente tip"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              )}

              {/* Tip counter */}
              <div className="text-center mt-4 text-sm text-gray-500">
                Tip {currentTipIndex + 1} de {tips.length}
              </div>
            </div>
          </div>
        )}

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

        {/* Modal de Reserva Mejorado */}
        {showReservationModal && classDetails && (
          <BookingModal
            isOpen={showReservationModal}
            onClose={() => setShowReservationModal(false)}
            classData={{
              id: classDetails.id.toString(),
              title: classDetails.title,
              description: classDetails.description,
              date: new Date(classDetails.date),
              startTime: new Date(`${classDetails.date.split('T')[0]}T${classDetails.startTime}`),
              endTime: new Date(`${classDetails.date.split('T')[0]}T${classDetails.endTime}`),
              price: classDetails.price,
              currency: 'PEN',
              level: classDetails.level,
              type: 'GROUP',
              location: classDetails.location,
              capacity: classDetails.capacity,
              availableSpots: classDetails.capacity - classDetails.enrolled,
              images: classDetails.images,
              school: classDetails.school
            }}
            onSubmit={handleBookingSubmit}
          />
        )}

        {/* Modal de Imagen en Pantalla Completa */}
        {showImageModal && classDetails.images && classDetails.images.length > 0 && (
          <div
            className="fixed inset-0 z-[90] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white hover:text-gray-300 z-10 p-2 bg-black/50 rounded-full backdrop-blur-sm touch-manipulation"
              aria-label="Cerrar"
              style={{ touchAction: 'manipulation' }}
            >
              <X className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            {classDetails.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10 p-3 bg-black/50 rounded-full backdrop-blur-sm touch-manipulation active:scale-90"
                  aria-label="Imagen anterior"
                  style={{ touchAction: 'manipulation' }}
                >
                  <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10 p-3 bg-black/50 rounded-full backdrop-blur-sm touch-manipulation active:scale-90"
                  aria-label="Siguiente imagen"
                  style={{ touchAction: 'manipulation' }}
                >
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>

                <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                  {currentImageIndex + 1} / {classDetails.images.length}
                </div>
              </>
            )}

            <div
              className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={classDetails.images[currentImageIndex]}
                alt={`${classDetails.title} - Imagen ${currentImageIndex + 1}`}
                fill
                className="object-contain"
                unoptimized
                priority
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Modal de Perfil del Estudiante */}
        {showStudentProfileModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-[70] p-0 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-t-3xl sm:rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto flex flex-col safe-area-bottom">
              <div className="flex justify-between items-center mb-4 sm:mb-6 sticky top-0 bg-white pb-2 border-b border-gray-200 sm:border-none sm:relative">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900">Perfil del Estudiante</h3>
                <button
                  onClick={() => setShowStudentProfileModal(false)}
                  className="text-gray-400 hover:text-gray-600 active:text-gray-800 text-2xl sm:text-3xl p-2 -mr-2 sm:mr-0 touch-target-lg"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Información básica */}
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {selectedStudent.profileImage ? (
                      <Image
                        src={selectedStudent.profileImage}
                        alt={selectedStudent.name}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-full object-cover"
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

              <div
                className="flex justify-end mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 sticky bottom-0 bg-white sm:bg-transparent -mx-4 sm:mx-0 px-4 sm:px-0 safe-area-bottom"
                style={{
                  bottom: 'env(safe-area-inset-bottom, 0px)'
                }}
              >
                <button
                  onClick={() => setShowStudentProfileModal(false)}
                  className="px-4 sm:px-6 py-3 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 active:bg-gray-800 transition-colors font-medium text-base sm:text-sm touch-target-lg w-full sm:w-auto"
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