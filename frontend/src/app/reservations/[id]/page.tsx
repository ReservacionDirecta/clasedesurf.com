'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { formatDualCurrency } from '@/lib/currency';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Globe,
  Star,
  Award,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Building2,
  Users,
  Waves
} from 'lucide-react';
import Link from 'next/link';

interface ReservationDetails {
  id: number;
  status: string;
  specialRequest?: string;
  participants?: any;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  class: {
    id: number;
    title: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    capacity: number;
    price: number;
    level: string;
    location?: string;
    school: {
      id: number;
      name: string;
      location: string;
      description?: string;
      phone?: string;
      email?: string;
      website?: string;
      instagram?: string;
      facebook?: string;
      whatsapp?: string;
      address?: string;
      logo?: string;
      coverImage?: string;
      rating: number;
      totalReviews: number;
      foundedYear?: number;
    };
    instructor?: string; // Instructor name as string
  };
  payment?: {
    id: number;
    amount: number;
    originalAmount?: number;
    discountAmount?: number;
    status: string;
    paymentMethod?: string;
    transactionId?: string;
    voucherImage?: string;
    voucherNotes?: string;
    paidAt?: string;
    createdAt: string;
    updatedAt: string;
    discountCode?: {
      id: number;
      code: string;
    };
  };
}

const tips = [
  {
    icon: Waves,
    title: 'Preparación',
    content: 'Llega 15 minutos antes de la clase para tener tiempo de prepararte y conocer al instructor.'
  },
  {
    icon: Award,
    title: 'Seguridad',
    content: 'Asegúrate de usar protector solar y traje de neopreno si el agua está fría. El instructor te guiará sobre el equipo necesario.'
  },
  {
    icon: Award,
    title: 'Equipamiento',
    content: 'La escuela proporciona tablas y trajes de neopreno. Solo necesitas traer toalla y cambio de ropa.'
  },
  {
    icon: Lightbulb,
    title: 'Consejos',
    content: 'Escucha atentamente las instrucciones del instructor. La seguridad es lo más importante en el surf.'
  }
];

function ReservationDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [reservation, setReservation] = useState<ReservationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchReservation(params.id as string);
    }
  }, [params.id, session]);

  useEffect(() => {
    if (tips.length > 0) {
      const interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % tips.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [tips.length]);

  const fetchReservation = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = (session as any)?.backendToken;
      const headers: any = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/reservations/${id}`, { headers });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Reserva no encontrada');
        }
        if (response.status === 403) {
          throw new Error('No tienes permiso para ver esta reserva');
        }
        throw new Error('Error al cargar la reserva');
      }

      const data = await response.json();
      setReservation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la reserva');
      console.error(err);
    } finally {
      setLoading(false);
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

  const formatTime = (time: string | null | undefined) => {
    if (!time) return '00:00';
    return time.substring(0, 5);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      PENDING: {
        label: 'Pendiente de Confirmación',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: AlertCircle
      },
      CONFIRMED: {
        label: 'Confirmada',
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle
      },
      PAID: {
        label: 'Pagada',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle
      },
      CANCELED: {
        label: 'Cancelada',
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle
      },
      COMPLETED: {
        label: 'Completada',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: CheckCircle
      }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.className}`}>
        <Icon className="w-4 h-4 mr-1" />
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      UNPAID: {
        label: 'No Pagado',
        className: 'bg-red-100 text-red-800'
      },
      PENDING: {
        label: 'Pendiente de Verificación',
        className: 'bg-yellow-100 text-yellow-800'
      },
      PAID: {
        label: 'Pagado',
        className: 'bg-green-100 text-green-800'
      },
      REFUNDED: {
        label: 'Reembolsado',
        className: 'bg-gray-100 text-gray-800'
      }
    };

    const config = statusConfig[status] || statusConfig.UNPAID;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentMethodLabel = (method?: string) => {
    const methods: Record<string, string> = {
      transfer: 'Transferencia Bancaria',
      deposit: 'Depósito Bancario',
      yape: 'Yape',
      payment_link: 'Link de Pago',
      cash: 'Efectivo'
    };
    return methods[method || ''] || method || 'No especificado';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error || 'Reserva no encontrada'}</p>
            <Link
              href="/reservations"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Mis Reservas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return null;
  }

  let participantsData = [];
  try {
    if (reservation.participants) {
      participantsData = Array.isArray(reservation.participants)
        ? reservation.participants
        : JSON.parse(reservation.participants);
    }
  } catch (e) {
    console.error('Error parsing participants:', e);
    participantsData = [];
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reserva #{reservation.id}</h1>
              <p className="text-gray-600 mt-1">Detalles completos de tu reserva</p>
            </div>
            {getStatusBadge(reservation.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Reservation Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Detalles de la Reserva</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Fecha de Reserva</p>
                  <p className="text-lg font-medium text-gray-900">
                    {new Date(reservation.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <div className="mt-1">{getStatusBadge(reservation.status)}</div>
                </div>
                {reservation.specialRequest && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Solicitud Especial</p>
                    <p className="text-gray-900">{reservation.specialRequest}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Class Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Información de la Clase</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{reservation.class.title}</h3>
                  {reservation.class.description && (
                    <p className="text-gray-600 mb-4">{reservation.class.description}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>{formatDate(reservation.class.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>
                      {formatTime(reservation.class.startTime)} - {formatTime(reservation.class.endTime)}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{reservation.class.location || reservation.class.school.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Award className="w-5 h-5 mr-2" />
                    <span className="capitalize">{reservation.class.level.toLowerCase()}</span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">Precio</span>
                    <div className="text-right">
                      {(() => {
                        const prices = formatDualCurrency(reservation.class.price);
                        return (
                          <>
                            <p className="text-2xl font-bold text-blue-600">{prices.pen}</p>
                            <p className="text-sm text-gray-500">{prices.usd}</p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants */}
            {participantsData.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Participantes</h2>
                <div className="space-y-4">
                  {participantsData.map((participant: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Participante {index + 1}: {participant.name || 'Sin nombre'}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        {participant.age && (
                          <div>
                            <span className="text-gray-600">Edad:</span>
                            <p className="font-medium text-gray-900">{participant.age} años</p>
                          </div>
                        )}
                        {participant.height && (
                          <div>
                            <span className="text-gray-600">Altura:</span>
                            <p className="font-medium text-gray-900">{participant.height} cm</p>
                          </div>
                        )}
                        {participant.weight && (
                          <div>
                            <span className="text-gray-600">Peso:</span>
                            <p className="font-medium text-gray-900">{participant.weight} kg</p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">Sabe nadar:</span>
                          <p className="font-medium text-gray-900">{participant.canSwim ? 'Sí' : 'No'}</p>
                        </div>
                        {participant.swimmingLevel && (
                          <div>
                            <span className="text-gray-600">Nivel de natación:</span>
                            <p className="font-medium text-gray-900 capitalize">{participant.swimmingLevel.toLowerCase()}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">Ha surfeado antes:</span>
                          <p className="font-medium text-gray-900">{participant.hasSurfedBefore ? 'Sí' : 'No'}</p>
                        </div>
                        {participant.injuries && (
                          <div className="md:col-span-3">
                            <span className="text-gray-600">Lesiones/Condiciones:</span>
                            <p className="font-medium text-gray-900">{participant.injuries}</p>
                          </div>
                        )}
                        {participant.comments && (
                          <div className="md:col-span-3">
                            <span className="text-gray-600">Comentarios:</span>
                            <p className="font-medium text-gray-900">{participant.comments}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Payment History */}
            {reservation.payment && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-6 h-6 mr-2" />
                  Historial de Pago
                </h2>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">Pago #{reservation.payment.id}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(reservation.payment.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {getPaymentStatusBadge(reservation.payment.status)}
                    </div>
                    <div className="space-y-4 mt-4">
                      {reservation.payment.originalAmount && reservation.payment.originalAmount !== reservation.payment.amount && (
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-600">Precio Original:</span>
                            <span className="font-medium text-gray-900 line-through">{formatDualCurrency(reservation.payment.originalAmount).pen}</span>
                          </div>
                          {reservation.payment.discountAmount && reservation.payment.discountAmount > 0 && (
                            <div className="flex justify-between items-center text-sm mb-2">
                              <span className="text-green-600 font-medium flex items-center gap-1">
                                <span>Descuento</span>
                                {reservation.payment.discountCode?.code && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                    {reservation.payment.discountCode.code}
                                  </span>
                                )}
                                :
                              </span>
                              <span className="font-semibold text-green-600">-{formatDualCurrency(reservation.payment.discountAmount).pen}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="font-medium text-gray-700">Total Pagado:</span>
                            <span className="text-gray-900 text-lg font-bold">{formatDualCurrency(reservation.payment.amount).pen}</span>
                          </div>
                        </div>
                      )}
                      {(!reservation.payment.originalAmount || reservation.payment.originalAmount === reservation.payment.amount) && (
                        <div>
                          <p className="text-sm text-gray-600">Monto</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatDualCurrency(reservation.payment.amount).pen}
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Método de Pago</p>
                          <p className="font-medium text-gray-900">
                            {getPaymentMethodLabel(reservation.payment.paymentMethod)}
                          </p>
                        </div>
                        {reservation.payment.transactionId && (
                          <div>
                            <p className="text-sm text-gray-600">Número de Operación</p>
                            <p className="font-medium text-gray-900 font-mono">
                              {reservation.payment.transactionId}
                            </p>
                          </div>
                        )}
                        {reservation.payment.paidAt && (
                          <div>
                            <p className="text-sm text-gray-600">Fecha de Pago</p>
                            <p className="font-medium text-gray-900">
                              {new Date(reservation.payment.paidAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        )}
                        {reservation.payment.voucherNotes && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-600">Notas</p>
                            <p className="font-medium text-gray-900">{reservation.payment.voucherNotes}</p>
                          </div>
                        )}
                        {reservation.payment.voucherImage && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-600 mb-2">Comprobante de Pago</p>
                            <div className="relative w-full h-64 border border-gray-200 rounded-lg overflow-hidden">
                              <ImageWithFallback
                                src={reservation.payment.voucherImage}
                                alt="Comprobante de pago"
                                fill
                                className="object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* School Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Building2 className="w-6 h-6 mr-2" />
                Información de la Escuela
              </h2>
              <div className="space-y-4">
                {reservation.class.school.logo && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src={reservation.class.school.logo}
                      alt={reservation.class.school.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{reservation.class.school.name}</h3>
                  {reservation.class.school.description && (
                    <p className="text-gray-600 mb-4">{reservation.class.school.description}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{reservation.class.school.location}</span>
                  </div>
                  {reservation.class.school.address && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span>{reservation.class.school.address}</span>
                    </div>
                  )}
                  {reservation.class.school.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-5 h-5 mr-2" />
                      <a href={`tel:${reservation.class.school.phone}`} className="hover:text-blue-600">
                        {reservation.class.school.phone}
                      </a>
                    </div>
                  )}
                  {reservation.class.school.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-5 h-5 mr-2" />
                      <a href={`mailto:${reservation.class.school.email}`} className="hover:text-blue-600">
                        {reservation.class.school.email}
                      </a>
                    </div>
                  )}
                  {reservation.class.school.website && (
                    <div className="flex items-center text-gray-600">
                      <Globe className="w-5 h-5 mr-2" />
                      <a
                        href={reservation.class.school.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600"
                      >
                        Sitio web
                      </a>
                    </div>
                  )}
                  {reservation.class.school.foundedYear && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-5 h-5 mr-2" />
                      <span>Fundada en {reservation.class.school.foundedYear}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    <span>
                      {reservation.class.school.rating.toFixed(1)} ({reservation.class.school.totalReviews} reseñas)
                    </span>
                  </div>
                </div>
                {(reservation.class.school.instagram || reservation.class.school.facebook || reservation.class.school.whatsapp) && (
                  <div className="flex gap-4 pt-2">
                    {reservation.class.school.instagram && (
                      <a
                        href={reservation.class.school.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-700"
                      >
                        Instagram
                      </a>
                    )}
                    {reservation.class.school.facebook && (
                      <a
                        href={reservation.class.school.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Facebook
                      </a>
                    )}
                    {reservation.class.school.whatsapp && (
                      <a
                        href={`https://wa.me/${reservation.class.school.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Instructor Information */}
            {reservation.class.instructor && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <User className="w-6 h-6 mr-2" />
                  Instructor
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reservation.class.instructor}
                    </h3>
                    <p className="text-sm text-gray-600">Instructor de la clase</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tips Card */}
            {tips.length > 0 && (
              <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-lg shadow-lg p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                    Tips
                  </h3>
                  <div className="flex gap-1">
                    {tips.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTipIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${index === currentTipIndex ? 'bg-blue-600 w-6' : 'bg-blue-300'
                          }`}
                        aria-label={`Tip ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="relative min-h-[120px]">
                  {tips.map((tip, index) => {
                    const TipIcon = tip.icon;
                    return (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-500 ${index === currentTipIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <TipIcon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">{tip.title}</h4>
                            <p className="text-sm text-gray-700">{tip.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t border-blue-200">
                  <button
                    onClick={() => setCurrentTipIndex((prev) => (prev - 1 + tips.length) % tips.length)}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                    aria-label="Tip anterior"
                  >
                    <ChevronLeft className="w-5 h-5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => setCurrentTipIndex((prev) => (prev + 1) % tips.length)}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                    aria-label="Siguiente tip"
                  >
                    <ChevronRight className="w-5 h-5 text-blue-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReservationDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
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
      <ReservationDetailsContent />
    </Suspense>
  );
}

