"use client";

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface School {
  id: number;
  name: string;
}

interface ClassFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  capacity: number;
  price: number;
  level: string;
  instructor: string;
}

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
  schoolId: number;
}

export default function EditClassPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const classId = params?.id as string;
  
  const [school, setSchool] = useState<School | null>(null);
  const [originalClass, setOriginalClass] = useState<ClassData | null>(null);
  const [formData, setFormData] = useState<ClassFormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 120,
    capacity: 8,
    price: 25,
    level: 'BEGINNER',
    instructor: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

    if (classId) {
      fetchClassAndSchool();
    }
  }, [session, status, router, classId]);

  const fetchClassAndSchool = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      
      // Fetch schools
      const schoolRes = await fetch(`${BACKEND}/schools`, { headers });
      if (!schoolRes.ok) throw new Error('Failed to fetch schools');
      
      const schools = await schoolRes.json();
      if (schools.length > 0) {
        setSchool(schools[0]);
      }

      // Fetch classes
      const classRes = await fetch(`${BACKEND}/classes`, { headers });
      if (!classRes.ok) throw new Error('Failed to fetch classes');
      
      const allClasses = await classRes.json();
      const currentClass = allClasses.find((cls: any) => cls.id === parseInt(classId));
      
      if (!currentClass) {
        throw new Error('Class not found');
      }

      // Check if this class belongs to the school admin's school
      if (schools.length > 0 && currentClass.schoolId !== schools[0].id) {
        throw new Error('You do not have permission to edit this class');
      }
      
      setOriginalClass(currentClass);
      
      // Convert class data to form format
      const classDate = new Date(currentClass.date);
      const dateStr = classDate.toISOString().split('T')[0];
      const timeStr = classDate.toTimeString().slice(0, 5);
      
      setFormData({
        title: currentClass.title,
        description: currentClass.description || '',
        date: dateStr,
        time: timeStr,
        duration: currentClass.duration,
        capacity: currentClass.capacity,
        price: currentClass.price,
        level: currentClass.level,
        instructor: currentClass.instructor || ''
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Error loading class data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ClassFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school || !originalClass) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      
      const classData = {
        title: formData.title,
        description: formData.description,
        date: dateTime.toISOString(),
        duration: Number(formData.duration),
        capacity: Number(formData.capacity),
        price: Number(formData.price),
        level: formData.level,
        instructor: formData.instructor
      };

      const res = await fetch(`${BACKEND}/classes/${classId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(classData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update class');
      }
      
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
      // Refresh class data
      await fetchClassAndSchool();
    } catch (err) {
      console.error('Error updating class:', err);
      setError(err instanceof Error ? err.message : 'Error updating class');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!originalClass) return;
    
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar la clase "${originalClass.title}"? Esta acción no se puede deshacer.`
    );
    
    if (!confirmDelete) return;

    try {
      setDeleting(true);
      setError(null);
      
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      
      const res = await fetch(`${BACKEND}/classes/${classId}`, {
        method: 'DELETE',
        headers
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete class');
      }
      
      // Redirect to classes list on success
      router.push('/dashboard/school/classes');
    } catch (err) {
      console.error('Error deleting class:', err);
      setError(err instanceof Error ? err.message : 'Error deleting class');
    } finally {
      setDeleting(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !originalClass) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-x-4">
              <button
                onClick={fetchClassAndSchool}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Intentar de nuevo
              </button>
              <Link
                href="/dashboard/school/classes"
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Volver a Clases
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Clase</h1>
              <p className="text-gray-600 mt-1">
                {originalClass ? `Editando: ${originalClass.title}` : 'Cargando...'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/school/classes"
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                ← Volver a Clases
              </Link>
              {originalClass && (
                <Link
                  href={`/dashboard/school/classes/${classId}/reservations`}
                  className="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded-lg transition-colors"
                >
                  Ver Reservas
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800 font-medium">Clase actualizada correctamente</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de la Clase</h2>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título de la Clase *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Clase de Surf para Principiantes"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe la clase, qué incluye, requisitos, etc."
              />
            </div>

            {/* Date and Time */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Fecha y Horario</h2>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={getMinDate()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Inicio *
              </label>
              <input
                type="time"
                id="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duración (minutos) *
              </label>
              <select
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value={60}>1 hora (60 min)</option>
                <option value={90}>1.5 horas (90 min)</option>
                <option value={120}>2 horas (120 min)</option>
                <option value={150}>2.5 horas (150 min)</option>
                <option value={180}>3 horas (180 min)</option>
              </select>
            </div>

            {/* Class Details */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalles de la Clase</h2>
            </div>

            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                Nivel *
              </label>
              <select
                id="level"
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="BEGINNER">Principiante</option>
                <option value="INTERMEDIATE">Intermedio</option>
                <option value="ADVANCED">Avanzado</option>
              </select>
            </div>

            <div>
              <label htmlFor="instructor" className="block text-sm font-medium text-gray-700 mb-2">
                Instructor
              </label>
              <input
                type="text"
                id="instructor"
                value={formData.instructor}
                onChange={(e) => handleInputChange('instructor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre del instructor"
              />
            </div>

            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                Capacidad Máxima *
              </label>
              <input
                type="number"
                id="capacity"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', Number(e.target.value))}
                min="1"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Número máximo de estudiantes</p>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Precio (USD) *
              </label>
              <input
                type="number"
                id="price"
                value={formData.price}
                onChange={(e) => handleInputChange('price', Number(e.target.value))}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Precio por persona</p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center"
            >
              {deleting && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {deleting ? 'Eliminando...' : 'Eliminar Clase'}
            </button>

            <div className="flex space-x-4">
              <Link
                href="/dashboard/school/classes"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center"
              >
                {saving && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}