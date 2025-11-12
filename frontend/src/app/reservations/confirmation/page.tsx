'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDualCurrency } from '@/lib/currency';

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
  };
  reservationId?: string;
  status?: 'pending' | 'created' | 'confirmed';
}

interface ParticipantDetails {
  name: string;
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
            name: i === 0 && data.bookingData?.name ? data.bookingData.name : '',
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
        
        // Mostrar automáticamente el formulario de participantes si el usuario está autenticado
        // y hay participantes pendientes de completar
        if (sessionStatus === 'authenticated' && initialParticipants.length > 0) {
          setShowParticipantsForm(true);
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
      sessionStatus === 'authenticated' &&
      session &&
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
  }, [sessionStatus, session, reservationData, creating, registering]);

  // Mostrar automáticamente el formulario de participantes cuando el usuario se autentica
  useEffect(() => {
    if (sessionStatus === 'authenticated' && reservationData && participants.length > 0) {
      setShowParticipantsForm(true);
    }
  }, [sessionStatus, reservationData, participants.length]);

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
      if (!p.height || parseInt(p.height) < 100) {
        setParticipantsError(`La altura del participante ${i + 1} es requerida (mínimo 100cm)`);
        return false;
      }
      if (!p.weight || parseInt(p.weight) < 20) {
        setParticipantsError(`El peso del participante ${i + 1} es requerido (mínimo 20kg)`);
        return false;
      }
    }
    setParticipantsError(null);
    return true;
  };

  const handleCreateReservation = async () => {
    if (!reservationData) return;

    // Check if user is authenticated
    if (!session) {
      setError('Para completar la reserva, necesitas registrarte o iniciar sesión. Usa el botón "Registrarse y Confirmar Reserva" para crear una cuenta con tus datos.');
      setShowRegisterForm(true);
      return;
    }

    // Validar datos de participantes
    if (!validateParticipants()) {
      setShowParticipantsForm(true);
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const token = (session as any)?.backendToken;
      if (!token) {
        setError('Debes estar autenticado para crear la reserva');
        setCreating(false);
        return;
      }

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          classId: parseInt(reservationData.classId),
          specialRequest: reservationData.bookingData.specialRequest,
          participants: participants  // Enviar datos completos de participantes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
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

      // Show success message
      alert('¡Reserva creada con éxito!');
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

  const formatTime = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Confirmación de Reserva</h1>
              <p className="text-gray-600 mt-1">
                {reservationData.status === 'created' || reservationData.status === 'confirmed'
                  ? 'Tu reserva ha sido confirmada'
                  : 'Revisa los detalles y completa tu reserva'}
              </p>
            </div>
            {reservationData.status === 'created' || reservationData.status === 'confirmed' ? (
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                ✓ Confirmada
              </div>
            ) : (
              <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold">
                Pendiente
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Class Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Información de la Clase</h2>
              
              {reservationData.classData && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {reservationData.classData.title || 'Clase de Surf'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {reservationData.classData.description || 'Sin descripción'}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Fecha:</span>
                      <p className="text-gray-900 capitalize">
                        {formatDate(reservationData.classData.date || reservationData.classData.startTime)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Horario:</span>
                      <p className="text-gray-900">
                        {formatTime(reservationData.classData.startTime)} - {formatTime(reservationData.classData.endTime)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Nivel:</span>
                      <p className="text-gray-900 capitalize">
                        {reservationData.classData.level || 'Principiante'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Participantes:</span>
                      <p className="text-gray-900">
                        {reservationData.bookingData.participants}
                      </p>
                    </div>
                  </div>

                  {reservationData.classData.location && (
                    <div className="mt-4">
                      <span className="text-sm font-medium text-gray-700">Ubicación:</span>
                      <p className="text-gray-900">{reservationData.classData.location}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Booking Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Información de Reserva</h2>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Nombre:</span>
                  <p className="text-gray-900">{reservationData.bookingData.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Email:</span>
                  <p className="text-gray-900">{reservationData.bookingData.email}</p>
                </div>
                
                {reservationData.bookingData.age && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Edad:</span>
                      <p className="text-gray-900">{reservationData.bookingData.age} años</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Altura:</span>
                      <p className="text-gray-900">{reservationData.bookingData.height} cm</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Peso:</span>
                      <p className="text-gray-900">{reservationData.bookingData.weight} kg</p>
                    </div>
                  </div>
                )}

                {reservationData.bookingData.specialRequest && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Solicitud especial:</span>
                    <p className="text-gray-900">{reservationData.bookingData.specialRequest}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}

            {/* Registration Form - Moved from sidebar */}
            {showRegisterForm && !isAuthenticated && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Crear Cuenta</h2>
                  <button
                    onClick={() => setShowRegisterForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-6">
                  Crea una cuenta para confirmar tu reserva. Usaremos el email y nombre que proporcionaste.
                </p>

                {registerError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-red-800">{registerError}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre
                    </label>
                    <Input
                      type="text"
                      value={reservationData?.bookingData.name || ''}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Este nombre se usará para tu cuenta</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={reservationData?.bookingData.email || ''}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Este email se usará para iniciar sesión</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña *
                    </label>
                    <Input
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Contraseña *
                    </label>
                    <Input
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Repite tu contraseña"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1"
                      disabled={registering}
                    >
                      {registering ? 'Creando cuenta...' : 'Crear Cuenta y Reservar'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowRegisterForm(false)}
                      disabled={registering}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Formulario de Participantes */}
            {isAuthenticated && reservationData.status === 'pending' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Datos de Participantes</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Completa la información de cada participante para continuar con tu reserva
                    </p>
                  </div>
                  <button
                    onClick={() => setShowParticipantsForm(!showParticipantsForm)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {showParticipantsForm ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                
                {!showParticipantsForm && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Importante:</strong> Debes completar los datos de todos los participantes antes de confirmar la reserva.
                    </p>
                  </div>
                )}

                {participantsError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-red-800">{participantsError}</span>
                    </div>
                  </div>
                )}

                {showParticipantsForm && (
                  <div className="space-y-6">
                    {participants.map((participant, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          {index === 0 ? 'Titular de la Reserva' : `Participante ${index + 1}`}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nombre completo *
                            </label>
                            <input
                              type="text"
                              value={participant.name}
                              onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Nombre del participante"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Edad *
                            </label>
                            <input
                              type="number"
                              value={participant.age}
                              onChange={(e) => updateParticipant(index, 'age', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Edad"
                              min="8"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Altura (cm) *
                            </label>
                            <input
                              type="number"
                              value={participant.height}
                              onChange={(e) => updateParticipant(index, 'height', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Altura en cm"
                              min="100"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Peso (kg) *
                            </label>
                            <input
                              type="number"
                              value={participant.weight}
                              onChange={(e) => updateParticipant(index, 'weight', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Peso en kg"
                              min="20"
                            />
                          </div>

                          <div>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={participant.canSwim}
                                onChange={(e) => updateParticipant(index, 'canSwim', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-700">¿Sabe nadar?</span>
                            </label>
                          </div>

                          {participant.canSwim && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nivel de natación
                              </label>
                              <select
                                value={participant.swimmingLevel}
                                onChange={(e) => updateParticipant(index, 'swimmingLevel', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="BEGINNER">Principiante</option>
                                <option value="INTERMEDIATE">Intermedio</option>
                                <option value="ADVANCED">Avanzado</option>
                              </select>
                            </div>
                          )}

                          <div className="md:col-span-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={participant.hasSurfedBefore}
                                onChange={(e) => updateParticipant(index, 'hasSurfedBefore', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-700">¿Ha practicado surf antes?</span>
                            </label>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Lesiones o condiciones médicas
                            </label>
                            <textarea
                              value={participant.injuries}
                              onChange={(e) => updateParticipant(index, 'injuries', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Describe cualquier lesión o condición médica relevante"
                              rows={2}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Comentarios adicionales
                            </label>
                            <textarea
                              value={participant.comments}
                              onChange={(e) => updateParticipant(index, 'comments', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Cualquier información adicional que el coach deba saber"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Summary */}
            <div className={`bg-white rounded-lg shadow-lg p-6 ${!showRegisterForm && !showParticipantsForm ? 'sticky top-6' : ''}`}>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen de Precio</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio unitario:</span>
                  <span className="text-gray-900 font-medium">
                    ${reservationData.classData?.price || 0} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Participantes:</span>
                  <span className="text-gray-900 font-medium">
                    {reservationData.bookingData.participants}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-600">
                      {totalPrices.pen}
                    </div>
                    <div className="text-sm text-gray-600">
                      {totalPrices.usd}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {reservationData.status !== 'created' && reservationData.status !== 'confirmed' && (
                <div className="space-y-3">
                  {!isAuthenticated ? (
                    <>
                      <Button
                        onClick={() => setShowRegisterForm(true)}
                        variant="primary"
                        className="w-full"
                        disabled={creating || registering}
                      >
                        Registrarse y Confirmar Reserva
                      </Button>
                      <Button
                        onClick={handleCreateReservation}
                        variant="outline"
                        className="w-full"
                        disabled={creating || registering}
                      >
                        {creating ? 'Creando...' : 'Completar Reserva'}
                      </Button>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Nota: Debes estar registrado para completar la reserva. Si haces clic aquí, te guiaremos para registrarte.
                      </p>
                      <Link href="/login" className="block">
                        <Button variant="outline" className="w-full">
                          Ya tengo cuenta - Iniciar Sesión
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Button
                      onClick={handleCreateReservation}
                      variant="primary"
                      className="w-full"
                      disabled={creating}
                    >
                      {creating ? 'Creando Reserva...' : 'Confirmar Reserva'}
                    </Button>
                  )}
                </div>
              )}

              {reservationData.status === 'created' || reservationData.status === 'confirmed' ? (
                <div className="mt-4">
                  <Link href="/reservations">
                    <Button variant="primary" className="w-full">
                      Ver Mis Reservas
                    </Button>
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
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

