'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { 
  CheckCircle, 
  Check,
  ChevronRight, 
  User, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { formatDualCurrency } from '@/lib/currency';
import PaymentUpload from '@/components/payments/PaymentUpload';

interface ReservationData {
  classId: string;
  classData: any;
  bookingData: {
    name: string;
    email: string;
    age: string;
    height: string;
    weight: string;
    canSwim: boolean;
    swimmingLevel: string;
    hasSurfedBefore: boolean;
    injuries: string;
    emergencyContact: string;
    emergencyPhone: string;
    participants: number;
    specialRequest: string;
    totalAmount: number;
    products?: { id: number; quantity: number }[];
    selectedProducts?: any[];
  };
  reservationId?: string;
  status?: 'pending' | 'created' | 'confirmed';
}

interface ParticipantDetails {
  name: string;
  email?: string; // Added for guest checkout
  age: string;
  height: string;
  weight: string;
  canSwim: boolean;
  swimmingLevel: string;
  hasSurfedBefore: boolean;
  injuries: string;
  comments: string;
}

function ReservationConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const [reservationData, setReservationData] = useState<ReservationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registerData, setRegisterData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  // Estado para detalles de participantes
  const [participants, setParticipants] = useState<ParticipantDetails[]>([]);
  const [showParticipantsForm, setShowParticipantsForm] = useState(true); // Mostrar por defecto
  const [participantsError, setParticipantsError] = useState<string | null>(null);

  // Estado para el flujo de pasos
  const [currentStep, setCurrentStep] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  useEffect(() => {
    // Get reservation data from URL params or sessionStorage
    const reservationId = searchParams.get('id');
    const dataFromStorage = sessionStorage.getItem('pendingReservation');

    if (reservationId) {
      // If we have a reservation ID, fetch it from the backend
      fetchReservation(reservationId);
    } else if (dataFromStorage) {
      // Otherwise, use data from sessionStorage
      try {
        const data = JSON.parse(dataFromStorage);
        setReservationData(data);

        // Inicializar array de participantes
        const numParticipants = data.bookingData?.participants || 1;
        const initialParticipants: ParticipantDetails[] = [];

        for (let i = 0; i < numParticipants; i++) {
          initialParticipants.push({
            // If a user is logged in, prefill the first participant's name from the session,
            // falling back to the guest booking data if session data isn't available.
            name: i === 0 ? (session?.user?.name || data.bookingData?.name || '') : '',
            // Include email for guest checkout (mandatory for first participant)
            email: i === 0 ? (session?.user?.email || data.bookingData?.email || '') : '',
            age: i === 0 && data.bookingData?.age ? data.bookingData.age : '',
            height: i === 0 && data.bookingData?.height ? data.bookingData.height : '',
            weight: i === 0 && data.bookingData?.weight ? data.bookingData.weight : '',
            canSwim: i === 0 && data.bookingData?.canSwim ? data.bookingData.canSwim : false,
            swimmingLevel: i === 0 && data.bookingData?.swimmingLevel ? data.bookingData.swimmingLevel : 'BEGINNER',
            hasSurfedBefore: i === 0 && data.bookingData?.hasSurfedBefore ? data.bookingData.hasSurfedBefore : false,
            injuries: i === 0 && data.bookingData?.injuries ? data.bookingData.injuries : '',
            comments: ''
          });
        }

        setParticipants(initialParticipants);

        // Determinar el paso inicial
        if (sessionStatus === 'authenticated') {
          setCurrentStep(2);
        } else {
          setCurrentStep(1);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error parsing reservation data:', err);
        setError('Error al cargar los datos de la reserva');
        setLoading(false);
      }
    } else {
      setError('No se encontraron datos de reserva');
      setLoading(false);
    }
  }, [searchParams, sessionStatus]);

// Auto-create reservation when user becomes authenticated and has pending reservation
  useEffect(() => {
    if (
      session && // Use session object itself for more direct check
      reservationData &&
      reservationData.status === 'pending' &&
      !reservationData.reservationId &&
      !creating &&
      !registering
    ) {
      // Check if reservation was just created via registration
      const shouldAutoCreate = sessionStorage.getItem('shouldAutoCreateReservation');
      if (shouldAutoCreate === 'true') {
        sessionStorage.removeItem('shouldAutoCreateReservation');
        handleCreateReservation();
      }
    }
  }, [session, reservationData, creating, registering]); // Removed sessionStatus, added session object

  // Mostrar automáticamente el formulario de participantes cuando el usuario se autentica
  useEffect(() => {
    if (session && reservationData && participants.length > 0) { // Changed sessionStatus to session
      setShowParticipantsForm(true);
    }
  }, [session, reservationData, participants.length]); // Changed sessionStatus to session

  const fetchReservation = async (id: string) => {
    try {
      const token = (session as any)?.backendToken;
      const headers: any = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/reservations/${id}`, { headers });
      if (!response.ok) throw new Error('Error al cargar la reserva');

      const reservation = await response.json();

      // We need to fetch class data separately
      const classResponse = await fetch(`/api/classes/${reservation.classId}`, { headers });
      const classData = classResponse.ok ? await classResponse.json() : null;

      setReservationData({
        classId: reservation.classId.toString(),
        classData,
        bookingData: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
          age: '',
          height: '',
          weight: '',
          canSwim: false,
          swimmingLevel: 'BEGINNER',
          hasSurfedBefore: false,
          injuries: '',
          emergencyContact: '',
          emergencyPhone: '',
          participants: 1,
          specialRequest: reservation.specialRequest || '',
          totalAmount: classData?.price || 0
        },
        reservationId: reservation.id.toString(),
        status: reservation.status === 'CONFIRMED' ? 'confirmed' : 'pending'
      });
    } catch (err) {
      setError('Error al cargar la reserva');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Funciones para manejar participantes
  const updateParticipant = (index: number, field: keyof ParticipantDetails, value: any) => {
    setParticipants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const validateParticipants = (): boolean => {
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      if (!p.name.trim()) {
        setParticipantsError(`El nombre del participante ${i + 1} es requerido`);
        return false;
      }
      if (!p.age || parseInt(p.age) < 8) {
        setParticipantsError(`La edad del participante ${i + 1} debe ser mínimo 8 años`);
        return false;
      }
      // Height and weight are now optional
      if (p.height && parseInt(p.height) < 100) {
        setParticipantsError(`La altura del participante ${i + 1} debe ser mínimo 100cm`);
        return false;
      }
      if (p.weight && parseInt(p.weight) < 20) {
        setParticipantsError(`El peso del participante ${i + 1} debe ser mínimo 20kg`);
        return false;
      }
    }
    setParticipantsError(null);
    return true;
  };

  const handleCreateReservation = async () => {
    if (!reservationData) return;

    // Check if user is authenticated OR if we are doing guest checkout (we allow it now)
    // if (!session) { ... } // REMOVED check

    // Validar datos de participantes
    if (!validateParticipants()) {
      setShowParticipantsForm(true);
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const token = (session as any)?.backendToken;
      // if (!token) ... REMOVED: optionalAuth in backend

      const headers: any = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          classId: parseInt(reservationData.classId),
          sessionId: (reservationData.bookingData as any).sessionId,
          date: (reservationData.bookingData as any).date,
          time: (reservationData.bookingData as any).time,
          specialRequest: reservationData.bookingData.specialRequest,
          participants: participants,  // Enviar datos completos de participantes (incluye email/nombre para guest)
          products: reservationData.bookingData.products // Enviar productos seleccionados
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle "Account Exists" specifically
        if (errorData.code === 'ACCOUNT_EXISTS') {
           setError(errorData.message);
           setShowRegisterForm(false); // Hide register, maybe show login prompt explicitly
           // Ideally we scroll to login section
           return;
        }
        throw new Error(errorData.message || 'Error al crear la reserva');
      }

      const createdReservation = await response.json();

      // Clear sessionStorage
      sessionStorage.removeItem('pendingReservation');

      // Update reservation data with the created reservation
      setReservationData({
        ...reservationData,
        reservationId: createdReservation.id.toString(),
        status: 'created'
      });

// Handle Auto-Login if token returned
      if (createdReservation.token) {
        // We have a new user! Sign them in.
        if (createdReservation.generatedPassword) {
          const result = await signIn('credentials', {
            redirect: false,
            email: reservationData.bookingData.email,
            password: createdReservation.generatedPassword
          });
          if (!result?.error) {
            // Success! The session is now established via NextAuth internal mechanism.
            // Force a re-render that will be picked up by useSession/update if needed,
            // but immediately advance to the next step.
            setCurrentStep(3); 
            return; // Stop here, page reload is avoided
          }
        }
      } 

      // Avanzar al paso de pago
      setCurrentStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la reserva');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    if (!registerData.password || registerData.password.length < 6) {
      setRegisterError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('Las contraseñas no coinciden');
      return;
    }

    if (!reservationData) {
      setRegisterError('No hay datos de reserva disponibles');
      return;
    }

    try {
      setRegistering(true);

      // Register user
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: reservationData.bookingData.name,
          email: reservationData.bookingData.email,
          password: registerData.password,
          role: 'STUDENT'
        })
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.message || 'Error al registrar usuario');
      }

      // Login automatically after registration
      const loginResult = await signIn('credentials', {
        redirect: false,
        email: reservationData.bookingData.email,
        password: registerData.password
      });

      if (loginResult?.error) {
        throw new Error('Error al iniciar sesión después del registro');
      }

      // Registration and login successful
      // Mark that we should auto-create reservation when session is ready
      sessionStorage.setItem('shouldAutoCreateReservation', 'true');

      // Trigger session refresh
      window.location.reload();

    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : 'Error al registrarse');
      console.error(err);
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date | string | undefined) => {
    if (!date) return '00:00';

    // Si es un string en formato "HH:MM", devolverlo directamente
    if (typeof date === 'string' && /^\d{2}:\d{2}$/.test(date)) {
      return date;
    }

    // Si es un string que parece una hora, intentar parsearlo
    if (typeof date === 'string' && date.includes(':')) {
      const timeMatch = date.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        const hours = timeMatch[1].padStart(2, '0');
        const minutes = timeMatch[2];
        return `${hours}:${minutes}`;
      }
    }

    // Intentar parsear como fecha
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) {
        return '00:00';
      }
      return d.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return '00:00';
    }
  };

  // Función para obtener los horarios de la clase
  const getClassTimes = () => {
    const classData = reservationData?.classData;
    if (!classData) return { startTime: '00:00', endTime: '00:00' };

    // Si startTime y endTime están disponibles y son válidos, usarlos
    if (classData.startTime && classData.endTime) {
      const start = formatTime(classData.startTime);
      const end = formatTime(classData.endTime);
      if (start !== '00:00' && end !== '00:00') {
        return { startTime: start, endTime: end };
      }
    }

    // Si no, calcular desde la fecha y duración
    if (classData.date) {
      try {
        const classDate = new Date(classData.date);
        if (!isNaN(classDate.getTime())) {
          const startTime = classDate.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });

          // Calcular hora de fin (duración por defecto: 90 minutos)
          const duration = (classData as any).duration || 90;
          const endDate = new Date(classDate.getTime() + duration * 60000);
          const endTime = endDate.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });

          return { startTime, endTime };
        }
      } catch (e) {
        console.error('Error calculating class times:', e);
      }
    }

    return { startTime: '00:00', endTime: '00:00' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles de reserva...</p>
        </div>
      </div>
    );
  }

  if (error && !reservationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/')} variant="primary">
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  if (!reservationData) return null;

  const isAuthenticated = sessionStatus === 'authenticated' && session;
  const totalPrices = formatDualCurrency(reservationData.bookingData.totalAmount);
  const times = getClassTimes();

  // Componente de Indicador de Pasos
  const StepIndicator = () => (
    <div className="mb-10">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep >= 1 ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-gray-200 text-gray-500'}`}>
            <span className="font-bold">1</span>
          </div>
          <span className={`text-xs mt-2 font-semibold ${currentStep >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>Revisión</span>
        </div>
        <div className={`h-1 flex-1 mx-4 transition-all duration-500 ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep >= 2 ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-gray-200 text-gray-500'}`}>
            <span className="font-bold">2</span>
          </div>
          <span className={`text-xs mt-2 font-semibold ${currentStep >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>Participantes</span>
        </div>
        <div className={`h-1 flex-1 mx-4 transition-all duration-500 ${currentStep >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
        <div className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep >= 3 ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-gray-200 text-gray-500'}`}>
            <span className="font-bold">3</span>
          </div>
          <span className={`text-xs mt-2 font-semibold ${currentStep >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>Pago</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#011627] tracking-tight mb-3">
            Completa tu Reserva
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Estás a solo unos pasos de vivir una experiencia increíble en el mar.
          </p>
        </div>

        <StepIndicator />

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Areas */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* STEP 1: REVIEW & ACCOUNT */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                    <Zap className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-xl font-bold text-slate-900">Resumen del Servicio</h2>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="w-full sm:w-48 h-36 rounded-2xl overflow-hidden shrink-0 border-4 border-indigo-50/50 shadow-inner">
                        <ImageWithFallback 
                          src={reservationData.classData?.images?.[0] || '/images/placeholder-class.jpg'} 
                          alt={reservationData.classData?.title || 'Clase'}
                          fill
                          className="object-cover transition-transform hover:scale-105 duration-500"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{reservationData.classData?.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                           <div className="flex items-center gap-2">
                             <Calendar className="w-4 h-4 text-indigo-500" />
                             <span>{formatDate(reservationData.classData?.date || reservationData.classData?.startTime)}</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <Clock className="w-4 h-4 text-indigo-500" />
                             <span>{times.startTime} - {times.endTime}</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <MapPin className="w-4 h-4 text-indigo-500" />
                             <span>{reservationData.classData?.location}</span>
                           </div>
                        </div>
                        <div className="mt-4 p-3 bg-indigo-50 rounded-lg inline-flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Nivel: {reservationData.classData?.level}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="bg-white rounded-2xl shadow-xl border-2 border-indigo-600 p-8 relative overflow-hidden">
                    <div className="relative z-10">
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">Finalizar Reserva</h2>
                      <p className="text-slate-600 mb-8">
                        Puedes continuar como invitado o iniciar sesión para guardar esta reserva en tu historial.
                      </p>
                      
                      {registerError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
                          <Info className="w-5 h-5 shrink-0" />
                          <p className="text-sm">{registerError}</p>
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-8">
                        {/* Guest Option */}
                        <div className="space-y-4">
                           <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                             <User className="w-5 h-5 text-gray-500" /> Como Invitado
                           </h3>
                           <p className="text-sm text-gray-500">Crearemos una cuenta automática para ti con los datos de la reserva.</p>
                           <Button 
                             onClick={() => setCurrentStep(2)} 
                             className="w-full h-12 text-base bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                           >
                             Continuar como Invitado
                           </Button>
                        </div>

                        {/* Login Option */}
                        <div className="space-y-4 border-l border-gray-100 pl-8">
                           <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                             <Zap className="w-5 h-5 text-indigo-500" /> Con tu Cuenta
                           </h3>
                           <p className="text-sm text-gray-500">Si ya tienes cuenta, inicia sesión para acumular puntos.</p>
                           <Button 
                             onClick={() => signIn('credentials', { callbackUrl: window.location.href })}
                             className="w-full h-12 text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                           >
                             Iniciar Sesión
                           </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isAuthenticated && (
                  <div className="flex justify-end">
                    <Button onClick={() => setCurrentStep(2)} className="h-14 px-10 text-lg group bg-[#011627] text-white">
                      Siguiente Paso
                      <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: PARTICIPANTS */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Datos de los Alumnos</h2>
                      <p className="text-slate-500">Esta información es vital para que los coaches preparen el equipo adecuado.</p>
                    </div>
                  </div>

                  {participantsError && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-2">
                       <Info className="w-5 h-5" />
                       <span className="text-sm font-medium">{participantsError}</span>
                    </div>
                  )}

                  <div className="space-y-8">
                    {participants.map((p, idx) => (
                      <div key={idx} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30">
                        <div className="flex items-center gap-3 mb-6">
                          <span className="w-8 h-8 rounded-full bg-[#011627] text-white flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                          <h3 className="text-lg font-bold text-slate-900">{idx === 0 ? 'Titular' : `Acompañante ${idx + 1}`}</h3>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                           <div className="sm:col-span-2 lg:col-span-1">
                             <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nombre completo</label>
                             <Input 
                                placeholder="Ej: Juan Pérez"
                                value={p.name}
                                onChange={e => updateParticipant(idx, 'name', e.target.value)}
                                className="bg-white border-slate-200 h-12"
                             />
                           </div>
                           <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Edad</label>
                             <Input 
                                type="number"
                                placeholder="8+"
                                value={p.age}
                                onChange={e => updateParticipant(idx, 'age', e.target.value)}
                                className="bg-white border-slate-200 h-12"
                             />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                             <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Altura (cm)</label>
                               <Input 
                                  type="number"
                                  placeholder="cm"
                                  value={p.height}
                                  onChange={e => updateParticipant(idx, 'height', e.target.value)}
                                  className="bg-white border-slate-200 h-12"
                               />
                             </div>
                             <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Peso (kg)</label>
                               <Input 
                                  type="number"
                                  placeholder="kg"
                                  value={p.weight}
                                  onChange={e => updateParticipant(idx, 'weight', e.target.value)}
                                  className="bg-white border-slate-200 h-12"
                               />
                             </div>
                           </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-6 border-t border-slate-100 pt-6">
                          <label className="flex items-center gap-3 cursor-pointer group">
                             <div className={`w-6 h-6 rounded-md border-2 transition-colors flex items-center justify-center ${p.canSwim ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                               <input type="checkbox" className="hidden" checked={p.canSwim} onChange={e => updateParticipant(idx, 'canSwim', e.target.checked)} />
                               {p.canSwim && <Check className="w-4 h-4" />}
                             </div>
                             <span className="text-sm font-semibold text-slate-700">Sabe Nadar</span>
                          </label>

                          <label className="flex items-center gap-3 cursor-pointer group">
                             <div className={`w-6 h-6 rounded-md border-2 transition-colors flex items-center justify-center ${p.hasSurfedBefore ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300'}`}>
                               <input type="checkbox" className="hidden" checked={p.hasSurfedBefore} onChange={e => updateParticipant(idx, 'hasSurfedBefore', e.target.checked)} />
                               {p.hasSurfedBefore && <Check className="w-4 h-4" />}
                             </div>
                             <span className="text-sm font-semibold text-slate-700">Experiencia previa</span>
                          </label>
                        </div>
                        
                        {(p.injuries || true) && (
                           <div className="mt-6">
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Observaciones Médicas / Comentarios</label>
                              <textarea 
                                value={p.injuries}
                                onChange={e => updateParticipant(idx, 'injuries', e.target.value)}
                                placeholder="Lesiones, condiciones especiales o comentarios para el coach..."
                                className="w-full rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 text-sm p-4 min-h-[100px]"
                              />
                           </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 flex flex-col sm:flex-row gap-4 border-t border-slate-100 pt-8">
                     <Button variant="outline" onClick={() => setCurrentStep(1)} className="h-14 px-8 border-slate-200 text-slate-600">
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        Atrás
                     </Button>
                     <Button 
                       onClick={handleCreateReservation} 
                       className="flex-1 h-14 text-lg bg-[#011627] shadow-xl"
                       disabled={creating}
                     >
                        {creating ? 'Procesando...' : 'Confirmar Datos y Reservar'}
                     </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT & SUCCESS */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in zoom-in-95 duration-500">
                 <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-12 text-center overflow-hidden relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-1 bg-linear-to-r from-green-400 via-blue-500 to-indigo-600"></div>
                    
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-8">
                       <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>

                     <h2 className="text-3xl font-black text-[#011627] mb-4">¡Tu lugar está casi listo!</h2>
                    <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto">
                       Hemos creado tu reserva. Para garantizar tu cupo, por favor completa el pago a continuación.
                    </p>

                    {/* Resumen Visible de la Reserva */}
                    <div className="bg-slate-50 rounded-2xl p-6 mb-10 max-w-xl mx-auto border border-slate-100">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Resumen de Reserva</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-1">Fecha</p>
                          <div className="flex items-center gap-2 text-slate-900 font-bold">
                            <Calendar className="w-4 h-4 text-indigo-500" />
                            <span>{formatDate(reservationData.classData?.date || reservationData.classData?.startTime)}</span>
                          </div>
                        </div>
                        <div>
                           <p className="text-xs font-semibold text-slate-500 mb-1">Horario</p>
                           <div className="flex items-center gap-2 text-slate-900 font-bold">
                             <Clock className="w-4 h-4 text-indigo-500" />
                             <span>{times.startTime} - {times.endTime}</span>
                           </div>
                        </div>
                        <div>
                           <p className="text-xs font-semibold text-slate-500 mb-1">Total a Pagar</p>
                           <div className="flex items-center gap-2 text-slate-900 font-black text-lg">
                             <span className="text-indigo-600">{totalPrices.pen}</span>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                       <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100 text-left">
                          <CreditCard className="w-8 h-8 text-indigo-600 mb-4" />
                          <h4 className="font-bold text-indigo-900 mb-2">Métodos de Pago</h4>
                          <p className="text-sm text-indigo-700/80 leading-relaxed mb-4">
                             Aceptamos Transferencia, Yape, Plin o pago en efectivo en la oficina de la escuela.
                          </p>
                          <Button 
                            variant="primary" 
                            className="w-full bg-indigo-600 shadow-md"
                            onClick={() => setShowPaymentModal(true)}
                          >
                             Información de Pago
                          </Button>
                       </div>
                       
                       <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left">
                          <User className="w-8 h-8 text-slate-400 mb-4" />
                          <h4 className="font-bold text-slate-900 mb-2">Siguiente Paso</h4>
                          <p className="text-sm text-slate-600 leading-relaxed mb-4">
                             Sube tu comprobante si ya pagaste, o ven a visitarnos en la playa antes de tu clase.
                          </p>
                          <Link href="/reservations" className="block w-full">
                            <Button variant="outline" className="w-full border-slate-300">
                               Ver Mis Reservas
                            </Button>
                          </Link>
                       </div>
                    </div>
                 </div>

                 {paymentSubmitted && (
                   <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 flex items-center gap-4 text-green-800">
                      <Zap className="w-8 h-8 text-green-600 animate-pulse" />
                      <div>
                        <p className="font-bold text-lg">Comprobante recibido</p>
                        <p className="text-sm opacity-90">Nuestro equipo verificará el pago en las próximas horas. Recibirás un correo de confirmación.</p>
                      </div>
                   </div>
                 )}
              </div>
            )}

          </div>

          {/* Sidebar Area: Sticky Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
               <div className="p-6 bg-[#011627] text-white">
                  <h3 className="text-lg font-bold opacity-80 uppercase tracking-widest mb-1">Costo Estimado</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black">{totalPrices.pen}</span>
                  </div>
               </div>
               
               <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-sm font-medium">
                     <span className="text-slate-500">Subtotal por persona</span>
                     <span className="text-slate-900">{formatDualCurrency(reservationData.classData?.price || 0).pen}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium">
                     <span className="text-slate-500">Cantidad alumnos</span>
                     <span className="text-slate-900">x {reservationData.bookingData.participants}</span>
                  </div>
                  
                  {reservationData.bookingData.selectedProducts && reservationData.bookingData.selectedProducts.length > 0 && (
                    <div className="pt-2 space-y-2">
                       {reservationData.bookingData.selectedProducts.map((p: any) => (
                         <div key={p.id} className="flex justify-between items-center text-xs font-medium">
                            <span className="text-slate-500 truncate mr-2">{p.name}</span>
                            <span className="text-slate-900 font-bold whitespace-nowrap">+{formatDualCurrency(p.price).pen}</span>
                         </div>
                       ))}
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-slate-100">
                    <div className="bg-slate-50 rounded-xl p-4">
                       <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Tu Selección</h4>
                       <div className="space-y-3">
                          <div className="flex gap-3">
                             <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                             <span className="text-sm font-bold text-slate-700">{formatDate(reservationData.classData?.date || reservationData.classData?.startTime)}</span>
                          </div>
                          <div className="flex gap-3">
                             <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                             <span className="text-sm font-bold text-slate-700">{times.startTime} - {times.endTime}</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="pt-4 px-2 space-y-3">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                       <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                       <span>Confirmación inmediata</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                       <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                       <span>Cancelación flexible (24h)</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal Refined */}
      {showPaymentModal && reservationData.reservationId && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300"
          onClick={e => e.target === e.currentTarget && setShowPaymentModal(false)}
        >
          <div className="bg-white rounded-4xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">Canales de Pago</h2>
                  <p className="text-sm text-slate-500 font-medium tracking-wide uppercase">Reserva ID: #{reservationData.reservationId}</p>
                </div>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">✕</button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <PaymentUpload
                reservationId={parseInt(reservationData.reservationId)}
                amount={reservationData.bookingData.totalAmount}
                onPaymentSubmitted={() => {
                  setPaymentSubmitted(true);
                  setShowPaymentModal(false);
                  setReservationData({...reservationData, status: 'confirmed'});
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReservationConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <ReservationConfirmationContent />
    </Suspense>
  );
}

