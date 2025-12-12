"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Trash2, 
  RotateCcw,
  Copy,
  Calendar,
  Users,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface DeletedClass {
  id: number;
  title: string;
  description?: string;
  date: string;
  duration: number;
  capacity: number;
  price: number;
  level: string;
  instructor?: string;
  deletedAt: string;
  school: {
    id: number;
    name: string;
  };
  beach?: {
    id: number;
    name: string;
    location?: string;
  };
  reservations: {
    id: number;
    status: string;
  }[];
}

export default function DeletedClassesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [deletedClasses, setDeletedClasses] = useState<DeletedClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchDeletedClasses = useCallback(async () => {
    try {
      setLoading(true);

      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/classes/deleted', { headers });
      if (!res.ok) throw new Error('Failed to fetch deleted classes');

      const data = await res.json();
      setDeletedClasses(data);
    } catch (err) {
      console.error('Error fetching deleted classes:', err);
      showError('Error', 'No se pudieron cargar las clases eliminadas');
    } finally {
      setLoading(false);
    }
  }, [session, showError]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    if (session.user?.role !== 'SCHOOL_ADMIN') {
      router.push('/denied');
      return;
    }

    fetchDeletedClasses();
  }, [status, session, router, fetchDeletedClasses]);

  const handleRestore = async (classId: number) => {
    if (!confirm('¿Estás seguro de que deseas restaurar esta clase?')) return;

    try {
      setProcessing(classId);

      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/classes/${classId}/restore`, {
        method: 'POST',
        headers
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Error al restaurar' }));
        throw new Error(errorData.message);
      }

      showSuccess('¡Clase restaurada!', 'La clase ha sido restaurada exitosamente');
      await fetchDeletedClasses();
    } catch (err) {
      showError('Error', err instanceof Error ? err.message : 'No se pudo restaurar la clase');
    } finally {
      setProcessing(null);
    }
  };

  const handleDuplicate = async (classId: number) => {
    if (!confirm('¿Deseas crear una copia de esta clase? Se creará con una nueva fecha (7 días después de la original).')) return;

    try {
      setProcessing(classId);

      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/classes/${classId}/duplicate`, {
        method: 'POST',
        headers
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Error al duplicar' }));
        throw new Error(errorData.message);
      }

      const duplicatedClass = await res.json();
      showSuccess('¡Clase duplicada!', 'Se ha creado una copia de la clase');
      router.push(`/dashboard/school/classes/${duplicatedClass.id}`);
    } catch (err) {
      showError('Error', err instanceof Error ? err.message : 'No se pudo duplicar la clase');
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'INTERMEDIATE':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ADVANCED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/school/classes"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Trash2 className="w-7 h-7 text-red-600" />
                Papelera de Clases
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Clases eliminadas que puedes restaurar o duplicar
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Sobre la papelera</p>
            <p>
              Las clases eliminadas se mantienen aquí y puedes restaurarlas en cualquier momento.
              También puedes duplicarlas para crear nuevas clases basadas en estas.
            </p>
          </div>
        </div>

        {/* Deleted Classes Grid */}
        {deletedClasses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay clases eliminadas
            </h3>
            <p className="text-gray-600 mb-6">
              La papelera está vacía. Todas tus clases están activas.
            </p>
            <Link
              href="/dashboard/school/classes"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver a Clases
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deletedClasses.map((cls) => (
              <div
                key={cls.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 border-b border-red-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {cls.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getLevelColor(cls.level)}`}>
                      {getLevelLabel(cls.level)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-red-700">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminada: {formatDate(cls.deletedAt)}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* Date & Time */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{formatDate(cls.date)}</span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{cls.duration} minutos</span>
                  </div>

                  {/* Capacity */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{cls.capacity} estudiantes</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                    <DollarSign className="w-4 h-4" />
                    <span>S/. {cls.price}</span>
                  </div>

                  {/* Reservations Info */}
                  {cls.reservations.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-800">
                      <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
                      {cls.reservations.length} reserva(s) asociada(s)
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2">
                  <button
                    onClick={() => handleRestore(cls.id)}
                    disabled={processing === cls.id}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restaurar
                  </button>
                  <button
                    onClick={() => handleDuplicate(cls.id)}
                    disabled={processing === cls.id}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
