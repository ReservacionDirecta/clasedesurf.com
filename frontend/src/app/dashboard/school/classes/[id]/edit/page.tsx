"use client";

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';

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
  images: string[];
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
  images?: string[];
  schoolId: number;
}

export default function EditClassPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const classId = params?.id as string;
  const { showSuccess, showError, showWarning } = useToast();

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
    instructor: '',
    images: ['']
  });
  // Estado local para el precio mientras se escribe (permite string vacío)
  const [priceInput, setPriceInput] = useState<string>('25');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para manejo de imágenes
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');

  const fetchClassAndSchool = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Using API proxy routes instead of direct backend calls

      // Fetch schools
      const schoolRes = await fetch('/api/schools', { headers });
      if (!schoolRes.ok) throw new Error('Failed to fetch schools');

      const schools = await schoolRes.json();
      if (schools.length > 0) {
        setSchool(schools[0]);
      }

      // Fetch class by ID
      const classRes = await fetch(`/api/classes/${classId}`, { headers });
      if (!classRes.ok) {
        if (classRes.status === 404) {
          throw new Error('Clase no encontrada');
        }
        throw new Error('Error al cargar la clase');
      }

      const currentClass = await classRes.json();

      // Check if this class belongs to the school admin's school
      if (schools.length > 0 && currentClass.schoolId !== schools[0].id) {
        throw new Error('No tienes permiso para editar esta clase');
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
        instructor: currentClass.instructor || '',
        images: currentClass.images && currentClass.images.length > 0 ? currentClass.images : ['']
      });
      // Actualizar el estado local del precio
      setPriceInput(String(currentClass.price || '25'));
    } catch (err) {
      console.error('Error fetching data:', err);
      showError('Error al cargar', err instanceof Error ? err.message : 'Error al cargar los datos de la clase');
      setError(err instanceof Error ? err.message : 'Error loading class data');
    } finally {
      setLoading(false);
    }
  }, [classId, session, showError]);

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
      fetchClassAndSchool();
    }
  }, [classId, fetchClassAndSchool, router, session, status]);

  const handleInputChange = (field: keyof ClassFormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (index: number, value: string) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages[index] = value;
      return { ...prev, images: newImages };
    });
  };

  const addImageField = () => {
    if (formData.images.length < 5) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
    }
  };

  const removeImageField = (index: number) => {
    if (formData.images.length > 1) {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  // Función para agregar imagen por URL
  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) {
      setImageError('Por favor ingresa una URL válida');
      return;
    }

    if (formData.images.length >= 5) {
      setImageError('Máximo 5 imágenes permitidas');
      return;
    }

    // Validar que sea una URL válida
    try {
      new URL(imageUrl);
    } catch {
      setImageError('URL inválida');
      return;
    }

    setFormData(prev => {
      const newImages = [...prev.images];
      // Si hay campos vacíos, reemplazar el primero, sino agregar al final
      const emptyIndex = newImages.findIndex(img => !img.trim());
      if (emptyIndex >= 0) {
        newImages[emptyIndex] = imageUrl.trim();
      } else {
        newImages.push(imageUrl.trim());
      }
      return { ...prev, images: newImages };
    });
    setImageUrl('');
    setImageError('');
  };

  // Función para subir archivo de imagen
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      setImageError('Solo se permiten archivos JPG, PNG o WebP');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('El archivo no debe superar 5MB');
      return;
    }

    if (formData.images.length >= 5) {
      setImageError('Máximo 5 imágenes permitidas');
      return;
    }

    setUploadingImage(true);
    setImageError('');

    try {
      // Subir imagen al servidor para obtener URL persistente
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('quality', '85');
      formDataUpload.append('width', '1200');

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formDataUpload
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al subir la imagen');
      }

      const result = await response.json();

      if (!result.success || !result.url) {
        throw new Error('No se recibió una URL válida del servidor');
      }

      // Usar la URL persistente del servidor
      const persistentUrl = result.url;

      // Agregar la imagen al formulario
      setFormData(prev => {
        const newImages = [...prev.images];
        // Si hay campos vacíos, reemplazar el primero, sino agregar al final
        const emptyIndex = newImages.findIndex(img => !img.trim());
        if (emptyIndex >= 0) {
          newImages[emptyIndex] = persistentUrl;
        } else {
          newImages.push(persistentUrl);
        }
        return { ...prev, images: newImages };
      });

      // Limpiar el input
      e.target.value = '';
    } catch (error) {
      console.error('Error uploading image:', error);
      setImageError(error instanceof Error ? error.message : 'Error al subir la imagen. Intenta de nuevo.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school || !originalClass) return;

    try {
      setSaving(true);
      setError(null);

      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);

      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Using API proxy routes instead of direct backend calls

      // Filter out empty image URLs
      const validImages = formData.images.filter(img => img.trim() !== '');
      if (validImages.length === 0) {
        showWarning('Imagen requerida', 'Se requiere al menos una imagen para la clase');
        setSaving(false);
        return;
      }

      const classData = {
        title: formData.title,
        description: formData.description,
        date: dateTime.toISOString(),
        duration: Number(formData.duration),
        capacity: Number(formData.capacity),
        price: Number(formData.price),
        level: formData.level,
        instructor: formData.instructor,
        images: validImages
      };

      const res = await fetch(`/api/classes/${classId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(classData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update class');
      }

      showSuccess('¡Clase actualizada!', 'Los cambios se han guardado correctamente');

      // Refresh class data
      await fetchClassAndSchool();
    } catch (err) {
      console.error('Error updating class:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la clase';
      showError('Error al guardar', errorMessage);
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!originalClass || !classId) return;

    if (deleting) return; // Prevenir múltiples clicks

    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar la clase "${originalClass.title}"? Esta acción no se puede deshacer.`
    );

    if (!confirmDelete) return;

    try {
      setDeleting(true);
      setError(null);

      const token = (session as any)?.backendToken;
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      }

      const headers: any = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      console.log('[handleDelete] Deleting class:', classId);

      // Using API proxy routes instead of direct backend calls
      const res = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE',
        headers
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
        console.error('[handleDelete] Error response:', errorData);

        // Mostrar mensaje de error más específico
        let errorMessage = errorData.message || 'Error al eliminar la clase';
        
        // Si hay reservas activas, mostrar mensaje específico
        if (errorData.reservationsCount) {
          errorMessage = `No se puede eliminar la clase porque tiene ${errorData.reservationsCount} reserva(s) activa(s). Debes cancelar las reservas primero.`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await res.json();
      console.log('[handleDelete] Success:', data);

      showSuccess('Clase eliminada', 'La clase ha sido eliminada correctamente');

      // Redirect to classes list on success after a short delay
      setTimeout(() => {
        router.push('/dashboard/school/classes');
      }, 1000);
    } catch (err) {
      console.error('[handleDelete] Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la clase';
      showError('Error al eliminar', errorMessage);
      setError(errorMessage);
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
      {/* Header - Mobile Optimized */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Editar Clase</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                {originalClass ? `Editando: ${originalClass.title}` : 'Cargando...'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Link
                href="/dashboard/school/classes"
                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5 rounded-lg transition-colors text-center text-sm font-medium touch-manipulation"
              >
                ← Volver a Clases
              </Link>
              {originalClass && (
                <Link
                  href={`/dashboard/school/classes/${classId}/reservations`}
                  className="w-full sm:w-auto bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2.5 rounded-lg transition-colors text-center text-sm font-medium touch-manipulation"
                >
                  Ver Reservas
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                className="w-full px-4 py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
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
                className="w-full px-4 py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
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
                className="w-full px-4 py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
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
                className="w-full px-4 py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
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
                className="w-full px-4 py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
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
                className="w-full px-4 py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
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
                className="w-full px-4 py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
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
                className="w-full px-4 py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Número máximo de estudiantes</p>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Precio (PEN) *
              </label>
              <input
                type="number"
                id="price"
                value={priceInput}
                onChange={(e) => {
                  const value = e.target.value;
                  // Permitir cualquier valor mientras se escribe
                  setPriceInput(value);
                  // Actualizar formData solo si es un número válido
                  if (value !== '' && value !== '.') {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                      handleInputChange('price', numValue);
                    }
                  }
                }}
                onBlur={(e) => {
                  // Asegurar que el valor sea un número válido al perder el foco
                  const value = e.target.value;
                  if (value === '' || value === '.' || isNaN(parseFloat(value))) {
                    setPriceInput('0');
                    handleInputChange('price', 0);
                  } else {
                    const numValue = parseFloat(value);
                    setPriceInput(String(numValue));
                    handleInputChange('price', numValue);
                  }
                }}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Precio por persona</p>
            </div>
          </div>

          {/* Images Section - Mejorado para móvil */}
          <div className="md:col-span-2 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Imágenes de la Clase</h2>
            <p className="text-sm text-gray-600 mb-4">
              Agrega entre 1 y 5 imágenes para tu clase. Puedes subir archivos o ingresar URLs.
            </p>

            {/* Opciones de carga - Mobile First */}
            <div className="space-y-4 mb-6">
              {/* Botón de subir archivo - Optimizado para móvil */}
              <div>
                <label className="block">
                  <div className="flex flex-col sm:flex-row items-center justify-center px-4 py-4 sm:py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50 active:bg-blue-100 touch-manipulation">
                    <svg className="w-6 h-6 sm:w-5 sm:h-5 text-gray-400 mb-2 sm:mb-0 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm sm:text-sm text-gray-600 text-center font-medium">
                      {uploadingImage ? 'Optimizando imagen...' : 'Toca para subir foto desde tu dispositivo'}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageUpload}
                      disabled={saving || uploadingImage || formData.images.length >= 5}
                      className="hidden"
                    />
                  </div>
                </label>
                <p className="text-xs text-gray-500 mt-2 text-center sm:text-left">
                  Formatos: JPG, PNG, WebP (máx. 5MB)
                </p>
              </div>

              {/* Input de URL - Optimizado para móvil */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImageError('');
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                    placeholder="Pegar URL de imagen..."
                    className="flex-1 text-sm border-0 focus:ring-0 focus:outline-none"
                    disabled={saving || formData.images.length >= 5}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  disabled={saving || !imageUrl.trim() || formData.images.length >= 5}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation shadow-sm"
                >
                  Agregar URL
                </button>
              </div>

              {/* Mensaje de error */}
              {imageError && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg border border-red-200">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{imageError}</span>
                </div>
              )}

              {/* Contador de imágenes */}
              {formData.images.some(img => img.trim()) && (
                <div className="text-sm text-gray-600 text-center sm:text-left">
                  <span className="font-medium">{formData.images.filter(img => img.trim()).length}</span> / 5 imágenes agregadas
                </div>
              )}
            </div>

            {/* Galería de imágenes - Grid responsive */}
            {formData.images.some(img => img.trim()) && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Vista Previa de Imágenes</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {formData.images.map((image, index) => {
                    if (!image.trim()) return null;
                    return (
                      <div key={index} className="relative group aspect-square">
                        <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                        <img
                          src={image}
                          alt={`Vista previa ${index + 1}`}
                            className="w-full h-full object-cover"
                          onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="flex items-center justify-center h-full text-gray-400">
                                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                `;
                              }
                          }}
                        />
                          {/* Botón eliminar - Más grande en móvil */}
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = [...formData.images];
                              newImages[index] = '';
                              setFormData(prev => ({ ...prev, images: newImages }));
                            }}
                            className="absolute top-1 right-1 p-1.5 sm:p-1 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 active:scale-95 transition-all touch-manipulation"
                            aria-label="Eliminar imagen"
                            disabled={saving}
                          >
                            <svg className="w-4 h-4 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          {/* Badge de número */}
                          <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 rounded">
                            {index + 1}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Campos de URL individuales (opcional, para edición manual) */}
            <div className="mt-6 space-y-3">
              <details className="group">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer list-none flex items-center gap-2">
                  <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Editar URLs manualmente (opcional)
                </summary>
                <div className="mt-3 space-y-3 pl-6">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <label htmlFor={`image-url-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                          Imagen {index + 1} {index === 0 && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="url"
                          id={`image-url-${index}`}
                          value={image}
                          onChange={(e) => handleImageChange(index, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://ejemplo.com/imagen.jpg"
                          required={index === 0}
                          disabled={saving}
                        />
                  </div>
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                          className="mt-6 px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                          aria-label="Eliminar campo"
                          disabled={saving}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              {formData.images.length < 5 && (
                <button
                  type="button"
                  onClick={addImageField}
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center text-sm touch-manipulation"
                      disabled={saving}
                >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                      Agregar otro campo (máximo 5)
                </button>
              )}
                </div>
              </details>
            </div>
          </div>

          {/* Submit Buttons - Mobile Optimized */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center justify-center font-medium shadow-sm touch-manipulation"
            >
              {deleting && (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {deleting ? 'Eliminando...' : 'Eliminar Clase'}
            </button>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Link
                href="/dashboard/school/classes"
                className="w-full sm:w-auto px-6 py-3 text-center border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium touch-manipulation"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center justify-center font-medium shadow-sm touch-manipulation"
              >
                {saving && (
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
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