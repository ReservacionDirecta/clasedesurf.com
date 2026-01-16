'use client';

import Image from 'next/image';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { useCallback, useEffect, useState } from 'react';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Shield,
  Award,
  ArrowLeft,
  Share2,
  Heart,
  X,
  Check,
  Waves,
  Lightbulb,
  Image as ImageIcon,
  Package
} from 'lucide-react';
import { BookingModal } from '@/components/booking/BookingModal';
import { BookingWidget } from '@/components/classes/BookingWidget';
import { ClassOptionsCard, generateClassOptions, type ClassOption } from '@/components/classes/ClassOptionsCard';

// Product interface matching backend
interface ProductAddOn {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  stock: number;
}

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
  type: string;
  level: string;
  location: string;
  status: 'ACTIVE' | 'CANCELED' | 'COMPLETED';
  images?: string[];
  isRecurring?: boolean;
  recurrencePattern?: {
    days: number[];
    times: string[];
  };
  startDate?: string;
  endDate?: string;
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
  const searchParams = useSearchParams();
  const initialParticipants = searchParams.get('participants') ? parseInt(searchParams.get('participants')!, 10) : 1;
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
  
  // New State for GYG Layout
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeSegment, setActiveSegment] = useState<'details' | 'reviews' | 'location'>('details');
  const [bookingParticipants, setBookingParticipants] = useState(initialParticipants);
  const [availableDates, setAvailableDates] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<any>(null); // For recurring classes
  
  // New State for Add-ons and School Classes
  const [schoolProducts, setSchoolProducts] = useState<ProductAddOn[]>([]);
  const [schoolClasses, setSchoolClasses] = useState<ClassOption[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [fetchingExtras, setFetchingExtras] = useState(false);

  // Update bookingParticipants if URL changes
  useEffect(() => {
    setBookingParticipants(initialParticipants);
  }, [initialParticipants]);

  const toggleProduct = (productId: number) => {
    setSelectedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleWidgetReserve = (participants: number, dateData?: any) => {
    setBookingParticipants(participants);
    if (dateData) {
       setSelectedDate(dateData);
    }
    // TODO: Pass selectedProductIds to modal
    setShowReservationModal(true);
  };

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
    if (!classId) return;

    try {
      setLoading(true);
      setError('');

      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch real class details from backend
      const response = await fetch(`/api/classes/${classId}`, { headers });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const classData = await response.json();
      
      if (!classData || !classData.id) {
        throw new Error('Datos de clase inválidos recibidos del servidor');
      }

      // Find first upcoming session for representative times/prices
      const nextSession = classData.sessions?.[0];
      const classDateStr = nextSession?.date || new Date().toISOString();
      const nextSessionDate = new Date(classDateStr);
      
      const startTime = nextSession?.startTime || '09:00';
      const duration = classData.duration || 120;
      
      // Calculate endTime from startTime and duration
      const [sh, sm] = startTime.split(':').map(Number);
      const endD = new Date(nextSessionDate);
      endD.setHours(sh, sm + duration);
      const endTime = endD.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });

      // Process class data to match expected format
      const processedClass: ClassDetails = {
        ...classData,
        description: classData.description || 'Clase de surf',
        date: classDateStr, // For backward compatibility
        startTime,
        endTime,
        duration,
        enrolled: nextSession?.enrolled || 0,
        price: Number(nextSession?.price || classData.defaultPrice),
        capacity: nextSession?.capacity || classData.defaultCapacity,
        level: classData.level || 'BEGINNER',
        location: classData.location || 'Por definir',
        status: classData.status || 'ACTIVE',
        type: classData.type || 'SURF_LESSON', 
        images: classData.images || [],
        school: {
          id: classData.school?.id || 0,
          name: classData.school?.name || 'Escuela de Surf',
          location: classData.school?.location || 'Lima, Perú',
          phone: classData.school?.phone || '',
          email: classData.school?.email || '',
          rating: 4.8,
          totalReviews: 0
        },
        instructor: {
          id: classData.instructor?.id || 1,
          name: classData.instructor?.name || 'Instructor',
          bio: classData.instructor?.bio || 'Instructor profesional de surf',
          rating: 4.9,
          totalReviews: 0,
          yearsExperience: 5,
          specialties: [],
          profileImage: classData.instructor?.profileImage
        },
        reservations: classData.reservations || [] 
      };

      setClassDetails(processedClass);

      // Check for user reservation (best effort)
      if (session?.user?.id && classData.reservations) {
        const userRes = classData.reservations.find(
          (r: any) => r.userId === parseInt(session.user.id as string) && r.status !== 'CANCELED'
        );
        setUserReservation(userRes);
      }

    } catch (err) {
      console.error('[Class Details] Error:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar la clase');
    } finally {
      setLoading(false);
    }
  }, [classId, session]);

  useEffect(() => {
    fetchClassDetails();
  }, [fetchClassDetails]);

  // No leftover closing brace here


  // Handle Dates logic (Recurring vs Single)
  useEffect(() => {
    const fetchAvailabilityCalendar = async () => {
       if (!classDetails) return;
       
       try {
         const start = new Date();
         const end = new Date();
         end.setDate(end.getDate() + 90); // Fetch next 3 months

         const res = await fetch(`/api/classes/${classId}/calendar?start=${start.toISOString()}&end=${end.toISOString()}`);
         if (res.ok) {
            const data = await res.json();
            const slots = Array.isArray(data) ? data : (data.availableDates || []);
            
            // Map slots to availableDates format
            const dates = slots
              .filter((s: any) => !s.isClosed && s.availableSpots > 0)
              .map((s: any) => {
                  const [hours, mins] = s.time.split(':').map(Number);
                  const slotDate = new Date(s.date);
                  const startTime = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
                  
                  const slotEndTimeStr = new Date(slotDate.getTime() + (classDetails.duration || 120) * 60000)
                    .toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });

                  return {
                      id: s.id,
                      date: new Date(s.date).toISOString(),
                      startTime: startTime,
                      endTime: slotEndTimeStr,
                      price: s.price,
                      availableSpots: s.availableSpots
                  };
              })
              .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            setAvailableDates(dates);
            
            if (dates.length > 0 && !selectedDate) {
                setSelectedDate(dates[0]);
            }
         }
       } catch (err) {
         console.error("Error fetching availability:", err);
       }
    };

    if (classDetails) {
        fetchAvailabilityCalendar();
    }
  }, [classDetails, classId]); 
  // removed dependency on selectedDate to prevent infinite loop if setSelectedDate triggers re-render, 
  // but useEffect depends on classDetails which changes rarely. 


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
      // Use selectedDate if available (it represents the classSession)
      const reservationDate = selectedDate ? selectedDate.date : classDetails.date;
      const reservationStartTime = selectedDate ? selectedDate.startTime : classDetails.startTime;
      const reservationEndTime = selectedDate ? selectedDate.endTime : classDetails.endTime;

      // Preparar datos de reserva para la página de confirmación
      const reservationData = {
        classId: classDetails.id.toString(),
        classData: {
          id: classDetails.id,
          title: classDetails.title,
          description: classDetails.description,
          price: (selectedDate && selectedDate.price) ? selectedDate.price : classDetails.price,
          date: reservationDate,
          startTime: reservationStartTime,
          endTime: reservationEndTime,
          level: classDetails.level,
          location: classDetails.location,
          school: classDetails.school,
          images: classDetails.images
        },
        bookingData: {
          ...bookingData,
          sessionId: selectedDate?.id,
          email: session.user.email || bookingData.email,
          name: session.user.name || bookingData.name,
          date: reservationDate, 
          time: reservationStartTime,
          totalAmount: bookingData.totalAmount,
          selectedProducts: schoolProducts.filter(p => selectedProductIds.includes(p.id))
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPast = classDetails ? new Date(classDetails.date) < today : false;

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
    <div className="min-h-screen bg-white pb-20 font-sans text-gray-900">
      {/* 1. Header Section (Full Width) */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm/50">
         <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
             <button onClick={() => router.back()} className="text-blue-600 font-medium hover:text-blue-800 flex items-center gap-2 transition-colors">
                 <ArrowLeft className="w-5 h-5" /> <span className="hidden sm:inline">Volver</span>
             </button>
             <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-gray-50 rounded-full transition-colors" aria-label="Compartir">
                    <Share2 className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                </button>
                <button 
                    className="p-2 hover:bg-gray-50 rounded-full transition-colors" 
                    onClick={() => setIsFavorite(!isFavorite)}
                    aria-label="Guardar en favoritos"
                >
                    <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-500 hover:text-gray-700'}`} />
                </button>
             </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {/* Title & Ratings */}
            <div className="mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">Clase de Surf</span>
                <h1 className="text-3xl md:text-5xl font-extrabold text-[#011627] mb-4 leading-tight">{classDetails.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                        <div className="flex text-yellow-400">
                           <Star className="w-4 h-4 fill-current" />
                           <Star className="w-4 h-4 fill-current" />
                           <Star className="w-4 h-4 fill-current" />
                           <Star className="w-4 h-4 fill-current" />
                           <Star className="w-4 h-4 fill-current" />
                        </div>
                        <span className="font-bold text-[#011627]">{classDetails.school.rating}</span>
                        <span className="text-gray-500 underline ml-1 cursor-pointer hover:text-blue-600">({classDetails.school.totalReviews} reseñas)</span>
                    </div>
                    <span className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block"></span>
                    <div className="flex items-center gap-1 text-gray-600">
                        <span>Actividad de</span>
                        <span className="font-bold text-blue-600 cursor-pointer hover:underline">{classDetails.school.name}</span>
                    </div>
                </div>
            </div>

            {/* Gallery Grid (GYG Style) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[300px] md:h-[480px] mb-12 rounded-2xl overflow-hidden relative shadow-sm">
                 {/* Main Image */}
                 <div className="md:col-span-2 md:row-span-2 relative h-full bg-gray-100 cursor-pointer group" onClick={() => setShowImageModal(true)}>
                     <ImageWithFallback src={(classDetails.images || [])[0]} alt="Principal" fill className="object-cover group-hover:scale-105 transition-transform duration-700" priority />
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                 </div>
                 {/* Secondary Images */}
                 <div className="md:col-span-1 md:row-span-1 relative h-full bg-gray-100 hidden md:block cursor-pointer group">
                      <ImageWithFallback src={(classDetails.images || [])[1] || (classDetails.images || [])[0]} alt="Galería 2" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                 </div>
                 <div className="md:col-span-1 md:row-span-1 relative h-full bg-gray-100 hidden md:block cursor-pointer group">
                      <ImageWithFallback src={(classDetails.images || [])[2] || (classDetails.images || [])[0]} alt="Galería 3" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                 </div>
                 <div className="md:col-span-1 md:row-span-1 relative h-full bg-gray-100 hidden md:block cursor-pointer group">
                      <ImageWithFallback src={(classDetails.images || [])[3] || (classDetails.images || [])[0]} alt="Galería 4" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                 </div>
                 <div className="md:col-span-1 md:row-span-1 relative h-full bg-gray-100 hidden md:block cursor-pointer group" onClick={() => setShowImageModal(true)}>
                      <ImageWithFallback src={(classDetails.images || [])[4] || (classDetails.images || [])[0]} alt="Galería 5" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                          <span className="text-white font-bold text-sm flex items-center gap-2 backdrop-blur-sm bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                             <ImageIcon className="w-4 h-4" /> Ver todas las fotos
                          </span>
                      </div>
                 </div>
                 
                 {/* Mobile View All Button */}
                 <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-bold shadow-lg md:hidden flex items-center gap-2 z-10" onClick={() => setShowImageModal(true)}>
                     <ImageIcon className="w-4 h-4" /> Fotos
                 </button>
            </div>

            {/* Content & Sidebar Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative">
                 {/* Left Column */}
                 <div className="lg:col-span-2 space-y-16">
                      {/* Key Details Bar (Icons) */}
                      <div>
                          <p className="text-gray-700 max-w-3xl text-lg leading-relaxed mb-6 font-light">{classDetails.description.split('.')[0]}.</p>
                          
                          <div className="flex flex-wrap gap-x-12 gap-y-6 text-sm text-[#011627] py-6 border-y border-gray-100">
                               <div className="flex items-start gap-4 max-w-[280px]">
                                   <div className="p-2 bg-green-50 rounded-lg shrink-0"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                                   <div>
                                       <span className="font-bold text-base block mb-1">Cancelación gratuita</span>
                                       <span className="text-gray-500 leading-snug">Cancela con hasta 24 horas de antelación y recibe un reembolso completo</span>
                                   </div>
                               </div>
                               <div className="flex items-start gap-4 max-w-[280px]">
                                   <div className="p-2 bg-blue-50 rounded-lg shrink-0"><CreditCard className="w-5 h-5 text-blue-600" /></div>
                                   <div>
                                       <span className="font-bold text-base block mb-1">Reserva ahora y paga después</span>
                                       <span className="text-gray-500 leading-snug">Mantén tu plan flexible reservando ahora sin coste</span>
                                   </div>
                               </div>
                               <div className="flex items-start gap-4 max-w-[280px]">
                                   <div className="p-2 bg-purple-50 rounded-lg shrink-0"><Clock className="w-5 h-5 text-purple-600" /></div>
                                   <div>
                                       <span className="font-bold text-base block mb-1">Duración {classDetails.duration} min</span>
                                       <span className="text-gray-500 leading-snug">Consulta la disponibilidad para ver los horarios de inicio</span>
                                   </div>
                               </div>
                               <div className="flex items-start gap-4 max-w-[280px]">
                                   <div className="p-2 bg-orange-50 rounded-lg shrink-0"><Award className="w-5 h-5 text-orange-600" /></div>
                                   <div>
                                       <span className="font-bold text-base block mb-1">Instructor certificado</span>
                                       <span className="text-gray-500 leading-snug">Español, Inglés</span>
                                   </div>
                               </div>
                          </div>
                      </div>
                      
                      {/* Experience Section */}
                      <section>
                           <h2 className="text-2xl font-bold text-[#011627] mb-8">La experiencia</h2>
                           
                           {/* Highlights */}
                           <div className="mb-10">
                               <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-4">Destacados</h3>
                               <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   <li className="flex items-start gap-3">
                                       <div className="w-1.5 h-1.5 rounded-full bg-[#0071EB] mt-2.5 shrink-0" />
                                       <span className="text-gray-700 leading-relaxed">Aprende a surfear en una de las mejores escuelas de Lima con atención personalizada.</span>
                                   </li>
                                   <li className="flex items-start gap-3">
                                       <div className="w-1.5 h-1.5 rounded-full bg-[#0071EB] mt-2.5 shrink-0" />
                                       <span className="text-gray-700 leading-relaxed">Instructores certificados con años de experiencia local e internacional.</span>
                                   </li>
                                   <li className="flex items-start gap-3">
                                       <div className="w-1.5 h-1.5 rounded-full bg-[#0071EB] mt-2.5 shrink-0" />
                                       <span className="text-gray-700 leading-relaxed">Todo el equipamiento incluido (tabla soft-top premium y wetsuit higienizado).</span>
                                   </li>
                                   <li className="flex items-start gap-3">
                                       <div className="w-1.5 h-1.5 rounded-full bg-[#0071EB] mt-2.5 shrink-0" />
                                       <span className="text-gray-700 leading-relaxed">Clase nivel {getLevelInfo(classDetails.level).text} adaptada a tu ritmo y habilidades.</span>
                                   </li>
                               </ul>
                           </div>
                           
                           <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-4">Descripción completa</h3>
                           <div className="prose prose-lg text-gray-700 max-w-none">
                               <p className="mb-4 text-justify leading-relaxed">{classDetails.description}</p>
                               <p className="text-justify leading-relaxed">Nos enfocamos en la seguridad y la diversión. Tu clase comenzará con una introducción en arena de 15 minutos donde aprenderás técnicas de remo, postura y seguridad en el mar. Luego, entrarás al agua acompañado de tu instructor quien te asistirá en todo momento para que logres pararte en tus primeras olas.</p>
                               <p className="mt-4 text-justify leading-relaxed font-medium text-[#011627]">Perfecto para: {classDetails.level === 'BEGINNER' ? 'Principiantes absolutos y personas con algo de experiencia que quieren corregir técnica.' : 'Surfistas que ya se paran en la espuma y quieren llegar al line-up y tomar paredes.'}</p>
                           </div>
                      </section>
                      
                      {/* Includes Section */}
                      <section>
                           <h2 className="text-2xl font-bold text-[#011627] mb-6">Qué incluye</h2>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                               {['Instrucción experta personalizada', 'Tabla de surf adecuada a tu nivel', 'Wetsuit / Traje de neopreno limpio', 'Acceso a duchas y vestuarios', 'Fotos de la sesión (sujeto a disponibilidad)'].map((item, idx) => (
                                   <div key={idx} className="flex items-center gap-3">
                                       <div className="bg-white p-1 rounded-full border border-gray-200 shadow-sm"><Check className="w-4 h-4 text-green-600 shrink-0" /></div>
                                       <span className="text-gray-700 font-medium">{item}</span>
                                   </div>
                               ))}
                           </div>
                      </section>
                       
                       {/* Class Options Section - GYG Style */}
                       <section className="bg-gradient-to-br from-gray-50 to-blue-50/30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-10 rounded-3xl border border-gray-100 mb-8">
                            <ClassOptionsCard
                              options={schoolClasses.length > 0 
                                ? [
                                    // Always include current class as option 1 (or mix them appropriately)
                                    // For now, let's mix the generated current one with fetched ones
                                    ...generateClassOptions({
                                        title: classDetails.title,
                                        price: classDetails.price,
                                        duration: classDetails.duration,
                                        location: classDetails.beach?.name 
                                          ? `Playa ${classDetails.beach.name}, ${classDetails.beach.location || classDetails.location}`
                                          : classDetails.location
                                      }).filter(o => o.type === 'GROUP'), // Keep only main var
                                    ...schoolClasses
                                  ]
                                : generateClassOptions({
                                title: classDetails.title,
                                price: classDetails.price,
                                duration: classDetails.duration,
                                location: classDetails.beach?.name 
                                  ? `Playa ${classDetails.beach.name}, ${classDetails.beach.location || classDetails.location}`
                                  : classDetails.location
                              })}
                              onSelect={(option: ClassOption) => {
                                // Update price based on selected option and open booking modal
                                handleWidgetReserve(bookingParticipants, {
                                  ...selectedDate,
                                  price: option.price,
                                  optionType: option.type,
                                  optionTitle: option.title
                                });
                              }}
                            />
                       </section>

                       {/* Products Add-ons Section */}
                       {schoolProducts.length > 0 && (
                          <section className="mb-10">
                              <h2 className="text-2xl font-bold text-[#011627] mb-6">Mejora tu experiencia</h2>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {schoolProducts.map(product => {
                                    const isSelected = selectedProductIds.includes(product.id);
                                    return (
                                      <div 
                                        key={product.id} 
                                        className={`
                                          relative border rounded-xl overflow-hidden transition-all duration-200 cursor-pointer
                                          ${isSelected ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/30' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}
                                        `}
                                        onClick={() => toggleProduct(product.id)}
                                      >
                                        <div className="flex h-full">
                                          <div className="w-24 bg-gray-100 relative shrink-0">
                                            {product.image ? (
                                              <ImageWithFallback src={product.image} alt={product.name} fill className="object-cover" />
                                            ) : (
                                              <div className="flex items-center justify-center h-full text-gray-300">
                                                <Package className="w-12 h-12" />
                                              </div>
                                            )}
                                          </div>
                                          <div className="p-3 flex-1 flex flex-col justify-between">
                                            <div>
                                              <div className="flex justify-between items-start">
                                                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h3>
                                                {isSelected && <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 ml-2" />}
                                              </div>
                                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                                            </div>
                                            <div className="flex justify-between items-end mt-2">
                                              <span className="font-bold text-gray-900">S/ {product.price}</span>
                                              <button className={`text-xs font-bold px-2 py-1 rounded transition-colors ${isSelected ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'}`}>
                                                 {isSelected ? 'Quitar' : 'Agregar'}
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                          </section>
                       )}
                       
                       {/* Meeting Point */}
                      <section>
                           <h2 className="text-2xl font-bold text-[#011627] mb-6">Punto de encuentro</h2>
                           <div className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                <div className="h-64 bg-gray-200 relative overflow-hidden group-hover:shadow-inner transition-shadow">
                                    <iframe 
                                      width="100%" 
                                      height="100%" 
                                      style={{ border: 0 }}
                                      loading="lazy"
                                      allowFullScreen
                                      referrerPolicy="no-referrer-when-downgrade"
                                      src={`https://maps.google.com/maps?q=${encodeURIComponent(
                                        (classDetails.beach?.name ? `Playa ${classDetails.beach.name}, ` : '') + 
                                        (classDetails.beach?.location || classDetails.location || classDetails.school.location)
                                      )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                      className="w-full h-full grayscale-10 group-hover:grayscale-0 transition-all duration-700"
                                      title="Ubicación de la clase"
                                      aria-label={`Mapa mostrando la ubicación en ${classDetails.beach?.name || classDetails.location}`}
                                    ></iframe>
                                </div>
                                <div className="p-8">
                                     <div className="flex items-start justify-between gap-4">
                                         <div>
                                            <h3 className="font-bold text-xl mb-1 text-[#011627]">
                                                {classDetails.beach?.name ? `Playa ${classDetails.beach.name}` : classDetails.school.name}
                                            </h3>
                                            <p className="text-gray-600 text-lg mb-4">
                                                {classDetails.beach?.location || classDetails.location || classDetails.school.location}
                                            </p>
                                            <p className="text-sm text-gray-500 mb-6">Busca nuestras banderas y el instructor con uniforme de {classDetails.school.name}.</p>
                                         </div>
                                         <div className="hidden sm:block">
                                              <a 
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                                    (classDetails.beach?.name ? `Playa ${classDetails.beach.name} ` : '') + 
                                                    (classDetails.beach?.location || classDetails.location || classDetails.school.location)
                                                )}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                                              >
                                                 <Share2 className="w-4 h-4" /> Cómo llegar
                                              </a>
                                         </div>
                                     </div>
                                     <a 
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                            (classDetails.beach?.name ? `Playa ${classDetails.beach.name} ` : '') + 
                                            (classDetails.beach?.location || classDetails.location || classDetails.school.location)
                                        )}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="block w-full text-center bg-[#0071EB] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                                     >
                                         Abrir en Google Maps
                                     </a>
                                </div>
                           </div>
                      </section>
                      
                      {/* Important Information */}
                      <section>
                           <h2 className="text-2xl font-bold text-[#011627] mb-6">Información importante</h2>
                           <div className="space-y-8">
                                <div>
                                    <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900 mb-3">Qué llevar</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {['Ropa de baño', 'Toalla', 'Sandalias', 'Protector solar', 'Ropa seca de cambio', 'Agua'].map((item, i) => (
                                           <span key={i} className="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium text-gray-700 border border-gray-200">{item}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                                    <h3 className="font-bold text-sm uppercase tracking-wider text-amber-900 mb-4 flex items-center gap-2"><Lightbulb className="w-4 h-4" /> Antes de viajar</h3>
                                    <ul className="space-y-3 text-sm text-amber-900/80">
                                        <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0"></span>Llega 15 minutos antes de la hora de inicio para equiparte con calma.</li>
                                        <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0"></span>No comas pesado al menos 1 hora antes de la clase.</li>
                                        <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0"></span>Si usas lentes de contacto, avísale a tu instructor.</li>
                                    </ul>
                                </div>
                           </div>
                      </section>
                 </div>
                 
                 {/* Right Column: Booking Widget */}
                 <div className="lg:col-span-1 relative mt-8 lg:mt-0">
                      <div className="lg:sticky lg:top-28 space-y-4">
                          <BookingWidget 
                               classData={{
                                 ...classDetails,
                                 currency: 'PEN',
                                 availableSpots: (selectedDate?.availableSpots ?? (classDetails!.capacity - classDetails!.enrolled)),
                                 price: selectedDate?.price ?? classDetails!.price
                               }}
                               initialParticipants={bookingParticipants}
                               onReserve={(p) => handleWidgetReserve(p, selectedDate)}
                               availableDates={availableDates}
                               selectedDateId={selectedDate ? selectedDate.id : undefined}
                               onDateChange={(val) => {
                                  const selected = availableDates.find(d => d.id.toString() === val.toString());
                                  if (selected) {
                                      setSelectedDate(selected);
                                  }
                               }}
                          />
                          <div className="text-center pt-2">
                               <button className="text-gray-500 font-medium text-sm hover:text-blue-600 transition-colors flex items-center justify-center gap-2 w-full">
                                   <Mail className="w-4 h-4" /> Contactar al proveedor
                               </button>
                          </div>
                      </div>
                 </div>
            </div>
      </div>
      
      {/* Mobile Sticky Action Bar - Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-50 safe-area-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.15)]">
           <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
               <div className="flex flex-col">
                   <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Precio total desde</span>
                   <div className="flex items-baseline gap-1">
                       <span className="text-xl font-bold text-[#011627]">{formatDualCurrency(classDetails.price).pen}</span>
                       <span className="text-xs text-gray-500 font-medium">/ persona</span>
                   </div>
               </div>
               <button 
                  onClick={() => handleWidgetReserve(bookingParticipants)}
                  className="bg-[#0071EB] text-white px-8 py-3.5 rounded-xl font-bold text-base hover:bg-blue-700 transition-colors shadow-blue-600/30 shadow-lg active:scale-95 transform"
               >
                  Reservar ahora
               </button>
           </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">  {showReservationModal && classDetails && (
          <BookingModal
            isOpen={showReservationModal}
            onClose={() => setShowReservationModal(false)}
            addons={schoolProducts.filter(p => selectedProductIds.includes(p.id))}
            classData={{
              id: classDetails.id.toString(),
              title: classDetails.title,
              description: classDetails.description,
              date: selectedDate ? new Date(selectedDate.date) : new Date(classDetails.date),
              startTime: selectedDate ? selectedDate.startTime : classDetails.startTime,
              endTime: selectedDate ? selectedDate.endTime : classDetails.endTime,
              price: selectedDate?.price ?? classDetails.price,
              currency: 'PEN',
              level: classDetails.level,
              type: 'GROUP',
              location: classDetails.location,
              capacity: selectedDate?.capacity ?? classDetails.capacity,
              availableSpots: selectedDate?.availableSpots ?? (classDetails.capacity - classDetails.enrolled),
              images: classDetails.images,
              school: classDetails.school
            }}
            onSubmit={handleBookingSubmit}
            initialParticipants={bookingParticipants}
          />
        )}

        {/* Modal de Imagen en Pantalla Completa */}
        {showImageModal && classDetails.images && classDetails.images.length > 0 && (
          <div
            className="fixed inset-0 z-90 bg-black/95 flex items-center justify-center p-4"
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
              <ImageWithFallback
                src={classDetails.images[currentImageIndex]}
                alt={`${classDetails.title} - Imagen ${currentImageIndex + 1}`}
                fill
                className="object-contain"
                unoptimized
                priority
              />
            </div>
          </div>
        )}

        {/* Modal de Perfil del Estudiante */}
        {showStudentProfileModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-70 p-0 sm:p-4 overflow-y-auto">
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
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    {selectedStudent.profilePhoto ? (
                      <ImageWithFallback
                        src={selectedStudent.profilePhoto}
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
