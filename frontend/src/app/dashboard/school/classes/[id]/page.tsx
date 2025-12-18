'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Users, MapPin, DollarSign, Edit, Eye, ArrowLeft, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { ClassAvailabilityCalendar } from '@/components/classes/ClassAvailabilityCalendar';

interface ClassData {
  id: number;
  title: string;
  description?: string;
  date: string;
  duration: number;
  capacity: number;
  price: number;
  level: string;
  instructor?: string;
  images?: string[];
  schoolId: number;
  createdAt: string;
  updatedAt: string;
  reservations?: Array<{
    id: number;
    userId: number;
    status: string;
    createdAt: string;
  }>;
}

export default function ClassDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const classId = params?.id as string;
  
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClass = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`/api/classes/${classId}`, { headers });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Clase no encontrada');
        }
        throw new Error('Error al cargar la clase');
      }
      
      const data = await response.json();
      setClassData(data);
    } catch (err) {
      console.error('Error fetching class:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar la clase');
    } finally {
      setLoading(false);
    }
  }, [classId, session]);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.role !== 'SCHOOL_ADMIN') {
      router.push('/denied');
      return;
    }

    if (classId) {
      fetchClass();
    }
  }, [classId, fetchClass, router, session, status]);

  const handleDelete = async () => {
    if (!classData) return;
    
    const hasReservations = classData.reservations && classData.reservations.length > 0;
    if (hasReservations) {
      alert('No puedes eliminar una clase que tiene reservas. Debes cancelarlas primero.');
      return;
    }
    
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar la clase "${classData.title}"? Esta acción no se puede deshacer.`
    );
    
    if (!confirmDelete) return;

    try {
      setDeleting(true);
      setError(null);
      
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const res = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE',
        headers
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al eliminar la clase');
      }
      
      // Redirect to classes list on success
      router.push('/dashboard/school/classes');
    } catch (err) {
      console.error('Error deleting class:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar la clase');
    } finally {
      setDeleting(false);
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'Principiante';
      case 'INTERMEDIATE':
        return 'Intermedio';
      case 'ADVANCED':
        return 'Avanzado';
      default:
        return level;
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

  const hasReservations = classData?.reservations && classData.reservations.length > 0;
  const canEdit = !hasReservations && new Date(classData?.date || '') > new Date();

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles de la clase...</p>
        </div>
      </div>
    );
  }

  if (error && !classData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={fetchClass}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Intentar de nuevo
            </button>
            <Link
              href="/dashboard/school/classes"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors inline-block"
            >
              Volver a Clases
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!classData) return null;

  const endTime = new Date(new Date(classData.date).getTime() + classData.duration * 60000);
  const availableSpots = classData.capacity - (classData.reservations?.length || 0);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/dashboard/school/classes"
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver a Clases
            </Link>
            <div className="flex gap-3">
              {canEdit && (
                <Link
                  href={`/dashboard/school/classes/${classId}/edit`}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-5 h-5 mr-2" />
                  Editar Clase
                </Link>
              )}
              <Link
                href={`/classes/${classId}`}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Eye className="w-5 h-5 mr-2" />
                Vista Pública
              </Link>
              {canEdit && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              )}
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{classData.title}</h1>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(classData.level)}`}>
                {getLevelLabel(classData.level)}
              </span>
              {hasReservations && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {classData.reservations?.length} reserva{classData.reservations?.length !== 1 ? 's' : ''}
                </span>
              )}
              {!canEdit && hasReservations && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  No se puede editar (tiene reservas)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images Gallery */}
            {classData.images && classData.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Imágenes</h2>
                <div className={`grid gap-4 ${classData.images.length === 1 ? 'grid-cols-1' : classData.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'}`}>
                  {classData.images.map((imageUrl, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={imageUrl}
                        alt={`${classData.title} - Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Descripción</h2>
              <p className="text-gray-700 leading-relaxed">
                {classData.description || 'No hay descripción disponible para esta clase.'}
              </p>
            </div>

            {/* Class Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalles de la Clase</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Fecha</h3>
                    <p className="text-gray-900 font-medium capitalize">{formatDate(classData.date)}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Horario</h3>
                    <p className="text-gray-900 font-medium">
                      {formatTime(classData.date)} - {formatTime(endTime.toISOString())}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Duración</h3>
                    <p className="text-gray-900 font-medium">{classData.duration} minutos</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Users className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Capacidad</h3>
                    <p className="text-gray-900 font-medium">
                      {classData.reservations?.length || 0} / {classData.capacity} estudiantes
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {availableSpots} {availableSpots === 1 ? 'plaza disponible' : 'plazas disponibles'}
                    </p>
                  </div>
                </div>

                {classData.instructor && (
                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Instructor</h3>
                      <p className="text-gray-900 font-medium">{classData.instructor}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <DollarSign className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Precio</h3>
                    <p className="text-gray-900 font-medium">{formatCurrency(classData.price, 'PEN')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reservations */}
            {hasReservations && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Reservas</h2>
                  <Link
                    href={`/dashboard/school/classes/${classId}/reservations`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Ver todas las reservas →
                  </Link>
                </div>
                <p className="text-gray-600">
                  Esta clase tiene {classData.reservations?.length} reserva{classData.reservations?.length !== 1 ? 's' : ''} activa{classData.reservations?.length !== 1 ? 's' : ''}.
                  {' '}No se puede editar ni eliminar hasta que todas las reservas sean canceladas.
                </p>
              </div>
            )}

            {/* Inventory / Availability Calendar */}
            <ClassAvailabilityCalendar classId={classId} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <Link
                  href={`/dashboard/school/classes/${classId}/reservations`}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Ver Reservas
                </Link>
                {canEdit && (
                  <Link
                    href={`/dashboard/school/classes/${classId}/edit`}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Edit className="w-5 h-5 mr-2" />
                    Editar Clase
                  </Link>
                )}
                <Link
                  href={`/classes/${classId}`}
                  className="w-full flex items-center justify-center px-4 py-2 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Vista Pública
                </Link>
              </div>
            </div>

            {/* Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Creada:</span>
                  <p className="text-gray-900 font-medium">
                    {new Date(classData.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Última actualización:</span>
                  <p className="text-gray-900 font-medium">
                    {new Date(classData.updatedAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

