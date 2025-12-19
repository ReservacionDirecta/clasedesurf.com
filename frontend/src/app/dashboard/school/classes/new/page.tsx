"use client";

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { MultiDatePicker } from '@/components/ui/MultiDatePicker';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  Award, 
  User, 
  Image as ImageIcon, 
  Plus, 
  X, 
  Upload, 
  Link as LinkIcon,
  CheckCircle2,
  CalendarDays,
  List,
  Grid,
  Info
} from 'lucide-react';

interface School {
  id: number;
  name: string;
}

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface Beach {
  id: number;
  name: string;
  location?: string;
  description?: string;
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
  beachId?: number;
  // Schedule options
  scheduleType: 'single' | 'recurring' | 'dateRange' | 'specificDates'; // 'single' para una sola clase, 'recurring' para recurrente, 'dateRange' para bloque de fechas, 'specificDates' para fechas específicas
  selectedDays: DayOfWeek[];
  times: string[]; // Array de horarios
  startDate: string; // Fecha de inicio para clases recurrentes
  weeksCount: number; // Número de semanas
  // Date range options
  dateRangeStart: string; // Fecha inicio para bloque
  dateRangeEnd: string; // Fecha fin para bloque
  // Specific dates options
  specificDates: string[]; // Array de fechas específicas seleccionadas
}

export default function NewClassPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [school, setSchool] = useState<School | null>(null);
  const [formData, setFormData] = useState<ClassFormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 120,
    capacity: 8,
    price: 90, // Precio en PEN (soles peruanos) - moneda base
    level: 'BEGINNER',
    instructor: '',
    images: [''],
    scheduleType: 'single',
    selectedDays: [],
    times: [''],
    startDate: '',
    weeksCount: 4,
    dateRangeStart: '',
    dateRangeEnd: '',
    specificDates: []
  });
  // Estado local para el precio mientras se escribe (permite string vacío)
  const [priceInput, setPriceInput] = useState<string>('90');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [beaches, setBeaches] = useState<Beach[]>([]);
  const [showAddBeachModal, setShowAddBeachModal] = useState(false);
  const [newBeachName, setNewBeachName] = useState('');
  const [newBeachLocation, setNewBeachLocation] = useState('');
  const [newBeachDescription, setNewBeachDescription] = useState('');
  const [addingBeach, setAddingBeach] = useState(false);

  // Estados para manejo de imágenes
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');

  const fetchBeaches = useCallback(async () => {
    try {
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/beaches', { headers });
      if (res.ok) {
        const beachesData = await res.json();
        console.log('🏖️ Playas cargadas:', beachesData);
        setBeaches(beachesData);
      } else {
        console.error('Error fetching beaches - status:', res.status);
      }
    } catch (err) {
      console.error('Error fetching beaches:', err);
    }
  }, [session]);

  const fetchSchool = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = (session as any)?.backendToken;

      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Using API proxy routes instead of direct backend calls

      const res = await fetch('/api/schools', { headers });
      if (!res.ok) throw new Error('Failed to fetch schools');

      const schools = await res.json();
      if (schools.length > 0) {
        setSchool(schools[0]); // For now, take the first school
      }
    } catch (err) {
      console.error('Error fetching school:', err);
      setError(err instanceof Error ? err.message : 'Error loading school data');
    } finally {
      setLoading(false);
    }
  }, [session]);

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

    fetchSchool();
    fetchBeaches();
  }, [fetchSchool, fetchBeaches, router, session, status]);

  const handleInputChange = (field: keyof ClassFormData, value: string | number | string[] | undefined) => {
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

  const handleDayToggle = (day: DayOfWeek) => {
    setFormData(prev => {
      const isSelected = prev.selectedDays.includes(day);
      return {
        ...prev,
        selectedDays: isSelected
          ? prev.selectedDays.filter(d => d !== day)
          : [...prev.selectedDays, day]
      };
    });
  };

  const handleTimeChange = (index: number, value: string) => {
    setFormData(prev => {
      const newTimes = [...prev.times];
      newTimes[index] = value;
      return { ...prev, times: newTimes };
    });
  };

  const addTimeField = () => {
    if (formData.times.length < 5) {
      setFormData(prev => ({ ...prev, times: [...prev.times, ''] }));
    }
  };

  const removeTimeField = (index: number) => {
    if (formData.times.length > 1) {
      setFormData(prev => ({
        ...prev,
        times: prev.times.filter((_, i) => i !== index)
      }));
    }
  };

  // Función para generar ocurrencias basadas en días y horarios
  const generateOccurrences = (): Array<{ date: string; time: string }> => {
    const occurrences: Array<{ date: string; time: string }> = [];
    const validTimes = formData.times.filter(t => t.trim() !== '');

    if (validTimes.length === 0 || formData.selectedDays.length === 0 || !formData.startDate) {
      return occurrences;
    }

    const startDate = new Date(formData.startDate);
    const dayMap: Record<DayOfWeek, number> = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };

    // Generar ocurrencias para cada semana
    for (let week = 0; week < formData.weeksCount; week++) {
      formData.selectedDays.forEach(day => {
        const dayOfWeek = dayMap[day];
        const currentDate = new Date(startDate);

        // Encontrar el próximo día de la semana
        const daysToAdd = (dayOfWeek - currentDate.getDay() + 7) % 7;
        currentDate.setDate(currentDate.getDate() + daysToAdd + (week * 7));

        validTimes.forEach(time => {
          occurrences.push({
            date: currentDate.toISOString().split('T')[0],
            time: time
          });
        });
      });
    }

    return occurrences;
  };

  // Función para generar ocurrencias por rango de fechas
  const generateDateRangeOccurrences = (): Array<{ date: string; time: string }> => {
    const occurrences: Array<{ date: string; time: string }> = [];

    if (!formData.dateRangeStart || !formData.dateRangeEnd || !formData.time) {
      return occurrences;
    }

    const startDate = new Date(formData.dateRangeStart);
    const endDate = new Date(formData.dateRangeEnd);
    const time = formData.time;

    // Validar que la fecha fin sea mayor o igual a la fecha inicio
    if (endDate < startDate) {
      return occurrences;
    }

    // Generar una ocurrencia para cada día en el rango
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      occurrences.push({
        date: currentDate.toISOString().split('T')[0],
        time: time
      });
      // Avanzar al siguiente día
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return occurrences;
  };

  // Función para generar ocurrencias por fechas específicas
  const generateSpecificDatesOccurrences = (): Array<{ date: string; time: string }> => {
    const occurrences: Array<{ date: string; time: string }> = [];

    if (formData.specificDates.length === 0 || !formData.time) {
      return occurrences;
    }

    // Generar una ocurrencia para cada fecha seleccionada
    formData.specificDates.forEach(dateStr => {
      occurrences.push({
        date: dateStr,
        time: formData.time
      });
    });

    return occurrences;
  };

  const handleAddBeach = async () => {
    if (!newBeachName.trim()) {
      setError('El nombre de la playa es requerido');
      return;
    }

    try {
      setAddingBeach(true);
      setError(null);

      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/beaches', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: newBeachName.trim(),
          location: newBeachLocation.trim() || undefined,
          description: newBeachDescription.trim() || undefined
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al crear la playa');
      }

      const newBeach = await res.json();
      setBeaches(prev => [...prev, newBeach].sort((a, b) => a.name.localeCompare(b.name)));
      setFormData(prev => ({ ...prev, beachId: newBeach.id }));
      setShowAddBeachModal(false);
      setNewBeachName('');
      setNewBeachLocation('');
      setNewBeachDescription('');
    } catch (err) {
      console.error('Error creating beach:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la playa');
    } finally {
      setAddingBeach(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;

    try {
      setSaving(true);
      setError(null);

      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Filtrar imágenes vacías y validar que haya al menos 1
      const validImages = formData.images.filter(img => img.trim() !== '');
      if (validImages.length === 0) {
        setError('Debes agregar al menos una imagen');
        setSaving(false);
        return;
      }

      // Preparar datos base de la clase
      const baseData = {
        title: formData.title,
        description: formData.description || null,
        duration: Number(formData.duration),
        capacity: Number(formData.capacity),
        price: Number(formData.price),
        level: formData.level,
        instructor: formData.instructor || null,
        images: validImages,
        studentDetails: null
      };

      // Manejar diferentes tipos de creación
      if (formData.scheduleType === 'dateRange') {
        // Crear clases en bloque por rango de fechas
        const occurrences = generateDateRangeOccurrences();
        
        if (occurrences.length === 0) {
          setError('Debes seleccionar un rango de fechas válido y una hora');
          setSaving(false);
          return;
        }

        if (occurrences.length > 100) {
          setError(`El rango de fechas generaría ${occurrences.length} clases. El máximo permitido es 100. Por favor, reduce el rango.`);
          setSaving(false);
          return;
        }

        const bulkData: any = {
          baseData,
          schoolId: school.id,
          occurrences
        };

        if (formData.beachId) {
          bulkData.beachId = formData.beachId;
        }

        const res = await fetch('/api/classes/bulk', {
          method: 'POST',
          headers,
          body: JSON.stringify(bulkData)
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to create classes');
        }

        const result = await res.json();
        // Redirect to classes list on success
        router.push(`/dashboard/school/classes?created=${result.createdCount || occurrences.length}`);
      } else if (formData.scheduleType === 'specificDates') {
        // Crear clases para fechas específicas seleccionadas
        const occurrences = generateSpecificDatesOccurrences();
        
        if (occurrences.length === 0) {
          setError('Debes seleccionar al menos una fecha del calendario y una hora');
          setSaving(false);
          return;
        }

        if (occurrences.length > 100) {
          setError(`Has seleccionado ${occurrences.length} fechas. El máximo permitido es 100. Por favor, reduce el número de fechas.`);
          setSaving(false);
          return;
        }

        const bulkData: any = {
          baseData,
          schoolId: school.id,
          occurrences
        };

        if (formData.beachId) {
          bulkData.beachId = formData.beachId;
        }

        const res = await fetch('/api/classes/bulk', {
          method: 'POST',
          headers,
          body: JSON.stringify(bulkData)
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to create classes');
        }

        const result = await res.json();
        // Redirect to classes list on success
        router.push(`/dashboard/school/classes?created=${result.createdCount || occurrences.length}`);
      } else if (formData.scheduleType === 'recurring') {
        // Crear clases recurrentes
        const occurrences = generateOccurrences();
        
        if (occurrences.length === 0) {
          setError('Debes seleccionar al menos un día, un horario y una fecha de inicio');
          setSaving(false);
          return;
        }

        if (occurrences.length > 100) {
          setError(`La configuración generaría ${occurrences.length} clases. El máximo permitido es 100. Por favor, reduce el número de semanas o días.`);
          setSaving(false);
          return;
        }

        const bulkData: any = {
          baseData,
          schoolId: school.id,
          occurrences
        };

        if (formData.beachId) {
          bulkData.beachId = formData.beachId;
        }

        const res = await fetch('/api/classes/bulk', {
          method: 'POST',
          headers,
          body: JSON.stringify(bulkData)
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to create classes');
        }

        const result = await res.json();
        // Redirect to classes list on success
        router.push(`/dashboard/school/classes?created=${result.createdCount || occurrences.length}`);
      } else {
        // Crear una sola clase
        const dateTime = new Date(`${formData.date}T${formData.time}`);
        
        const classData = {
          ...baseData,
          date: dateTime.toISOString(),
          schoolId: school.id,
          ...(formData.beachId && { beachId: formData.beachId })
        };

        const res = await fetch('/api/classes', {
          method: 'POST',
          headers,
          body: JSON.stringify(classData)
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to create class');
        }

        // Redirect to classes list on success
        router.push('/dashboard/school/classes');
      }
    } catch (err) {
      console.error('Error creating class:', err);
      setError(err instanceof Error ? err.message : 'Error creating class');
    } finally {
      setSaving(false);
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

  if (error && !school) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchSchool}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header - Mobile Optimized */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg hidden sm:block">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">Crear Nueva Clase</h1>
                <p className="text-gray-500 text-sm">Configura los detalles y horarios</p>
              </div>
            </div>
            <Link
              href="/dashboard/school/classes"
              className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-center text-sm font-medium shadow-sm flex items-center justify-center gap-2 group"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Cancelar
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 shadow-sm animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-full">
                <X className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-900">Ha ocurrido un error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Información Básica */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <List className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Información Básica</h2>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
                  Título de la Clase <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  placeholder="Ej: Clase de Surf para Principiantes"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                  Descripción
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  placeholder="Describe qué aprenderán, requisitos, qué llevar..."
                />
              </div>
            </div>
          </div>

          {/* 2. Fecha y Horario */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Programación</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Tipo de Horario Selector */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Tipo de Frecuencia</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { id: 'single', icon: Calendar, label: 'Clase Única', desc: 'Una fecha específica' },
                    { id: 'recurring', icon: CalendarDays, label: 'Recurrente', desc: 'Semanalmente (ej: L/M/V)' },
                    { id: 'dateRange', icon: List, label: 'Rango', desc: 'Bloque de fechas continuas' },
                    { id: 'specificDates', icon: Grid, label: 'Múltiple', desc: 'Fechas sueltas' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleInputChange('scheduleType', type.id)}
                      className={`relative flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left group ${
                        formData.scheduleType === type.id
                          ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600'
                          : 'border-gray-100 bg-white hover:border-purple-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg mb-3 ${
                        formData.scheduleType === type.id ? 'bg-purple-200 text-purple-700' : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600'
                      }`}>
                        <type.icon className="w-5 h-5" />
                      </div>
                      <span className={`block font-bold text-sm mb-1 ${formData.scheduleType === type.id ? 'text-purple-900' : 'text-gray-900'}`}>{type.label}</span>
                      <span className="text-xs text-gray-500 leading-tight">{type.desc}</span>
                      
                      {formData.scheduleType === type.id && (
                        <div className="absolute top-3 right-3 text-purple-600">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Content based on Schedule Type */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                {/* SINGLE CLASS */}
                {formData.scheduleType === 'single' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                       <label className="block text-sm font-semibold text-gray-700">Fecha <span className="text-red-500">*</span></label>
                       <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        min={getMinDate()}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="block text-sm font-semibold text-gray-700">Hora <span className="text-red-500">*</span></label>
                       <div className="relative">
                         <input
                          type="time"
                          value={formData.time}
                          onChange={(e) => handleInputChange('time', e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer"
                          required
                        />
                        <Clock className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                       </div>
                    </div>
                  </div>
                )}

                {/* DATE RANGE */}
                {formData.scheduleType === 'dateRange' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                         <label className="block text-sm font-semibold text-gray-700">Desde <span className="text-red-500">*</span></label>
                         <input
                          type="date"
                          value={formData.dateRangeStart}
                          onChange={(e) => handleInputChange('dateRangeStart', e.target.value)}
                          min={getMinDate()}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                         <label className="block text-sm font-semibold text-gray-700">Hasta <span className="text-red-500">*</span></label>
                         <input
                          type="date"
                          value={formData.dateRangeEnd}
                          onChange={(e) => handleInputChange('dateRangeEnd', e.target.value)}
                          min={formData.dateRangeStart || getMinDate()}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                       <label className="block text-sm font-semibold text-gray-700">Hora de la sesión <span className="text-red-500">*</span></label>
                       <div className="relative max-w-xs">
                         <input
                          type="time"
                          value={formData.time}
                          onChange={(e) => handleInputChange('time', e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                          required
                        />
                        <Clock className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                       </div>
                       <p className="text-xs text-gray-500">Se aplicará a todos los días del rango seleccionado.</p>
                    </div>

                    {(formData.dateRangeStart && formData.dateRangeEnd && formData.time) && (
                      <div className="flex items-start gap-3 p-4 bg-blue-50 text-blue-800 rounded-xl border border-blue-100 text-sm">
                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                           <strong>Resumen:</strong> Se generarán clases diarias desde el {new Date(formData.dateRangeStart).toLocaleDateString()} hasta el {new Date(formData.dateRangeEnd).toLocaleDateString()} a las {formData.time}.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SPECIFIC DATES */}
                {formData.scheduleType === 'specificDates' && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Selecciona Fechas <span className="text-red-500">*</span></label>
                      <div className="bg-white p-1 rounded-xl border border-gray-200">
                        <MultiDatePicker
                          selectedDates={formData.specificDates}
                          onChange={(dates) => handleInputChange('specificDates', dates)}
                          minDate={getMinDate()}
                          className="w-full border-none shadow-none"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Haz clic para seleccionar/deseleccionar múltiples fechas.</p>
                    </div>

                    <div className="space-y-2">
                       <label className="block text-sm font-semibold text-gray-700">Hora de inicio <span className="text-red-500">*</span></label>
                       <div className="relative max-w-xs">
                         <input
                          type="time"
                          value={formData.time}
                          onChange={(e) => handleInputChange('time', e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                          required
                        />
                        <Clock className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                       </div>
                    </div>
                  </div>
                )}

                {/* RECURRING */}
                {formData.scheduleType === 'recurring' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                         <label className="block text-sm font-semibold text-gray-700">Fecha de Inicio del Ciclo <span className="text-red-500">*</span></label>
                         <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          min={getMinDate()}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                         <label className="block text-sm font-semibold text-gray-700">Duración (Semanas) <span className="text-red-500">*</span></label>
                         <input
                          type="number"
                          value={formData.weeksCount}
                          onChange={(e) => handleInputChange('weeksCount', Number(e.target.value))}
                          min="1"
                          max="52"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">Días de la semana <span className="text-red-500">*</span></label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'monday', label: 'Lun' },
                          { key: 'tuesday', label: 'Mar' },
                          { key: 'wednesday', label: 'Mié' },
                          { key: 'thursday', label: 'Jue' },
                          { key: 'friday', label: 'Vie' },
                          { key: 'saturday', label: 'Sáb' },
                          { key: 'sunday', label: 'Dom' },
                        ].map((day) => (
                          <button
                            key={day.key}
                            type="button"
                            onClick={() => handleDayToggle(day.key as DayOfWeek)}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                              formData.selectedDays.includes(day.key as DayOfWeek)
                                ? 'bg-purple-600 text-white shadow-purple-200 scale-105'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                         <label className="block text-sm font-semibold text-gray-700">Horarios <span className="text-red-500">*</span></label>
                         <div className="flex flex-wrap gap-3">
                           {formData.times.map((time, index) => (
                             <div key={index} className="relative group">
                               <input
                                  type="time"
                                  value={time}
                                  onChange={(e) => handleTimeChange(index, e.target.value)}
                                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-32 font-medium"
                                  required
                               />
                               {formData.times.length > 1 && (
                                   <button 
                                     type="button"
                                     onClick={() => removeTimeField(index)}
                                     className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 hover:scale-100"
                                   >
                                     <X className="w-3 h-3" />
                                   </button>
                               )}
                             </div>
                           ))}
                           {formData.times.length < 5 && (
                             <button
                               type="button"
                               onClick={addTimeField}
                               className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-purple-600 hover:border-purple-300 text-sm font-bold transition-all flex items-center gap-1"
                             >
                               <Plus className="w-4 h-4" /> Agregar hora
                             </button>
                           )}
                         </div>
                    </div>
                  </div>
                )}
              </div>
              
               <div className="pt-2">
                <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-2">
                  Duración de la sesión
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[60, 90, 120, 150, 180].map(mins => (
                     <button
                       key={mins}
                       type="button"
                       onClick={() => handleInputChange('duration', mins)}
                       className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                         formData.duration === mins 
                         ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                         : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                       }`}
                     >
                       {mins / 60} {mins % 60 !== 0 ? '.5' : ''} horas
                     </button>
                  ))}
                </div>
               </div>

            </div>
          </div>
          {/* 3. Detalles de la Clase */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <Award className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Detalles y Capacidad</h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="level" className="block text-sm font-semibold text-gray-700">
                  Nivel de Experiencia <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="level"
                    value={formData.level}
                    onChange={(e) => handleInputChange('level', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all appearance-none font-medium"
                    required
                  >
                    <option value="BEGINNER">Principiante (Primera vez)</option>
                    <option value="INTERMEDIATE">Intermedio (Mejorar técnica)</option>
                    <option value="ADVANCED">Avanzado (Alto rendimiento)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="instructor" className="block text-sm font-semibold text-gray-700">
                  Instructor Asignado
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="instructor"
                    value={formData.instructor}
                    onChange={(e) => handleInputChange('instructor', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                    placeholder="Ej: Juan Pérez"
                  />
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label htmlFor="beach" className="block text-sm font-semibold text-gray-700">
                  Ubicación / Playa
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <select
                      id="beach"
                      value={formData.beachId || ''}
                      onChange={(e) => handleInputChange('beachId', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all appearance-none"
                    >
                      <option value="">Seleccionar ubicación (reunión)</option>
                      {beaches.map((beach) => (
                        <option key={beach.id} value={beach.id}>
                          {beach.name}{beach.location ? ` - ${beach.location}` : ''}
                        </option>
                      ))}
                    </select>
                     <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                     <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                     </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddBeachModal(true)}
                    className="px-4 py-3 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 rounded-xl transition-all flex items-center justify-center shadow-sm font-medium whitespace-nowrap"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Nueva
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="capacity" className="block text-sm font-semibold text-gray-700">
                  Capacidad Máxima <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="capacity"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', Number(e.target.value))}
                    min="1"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium"
                    required
                  />
                  <Users className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500">Cupos disponibles para estudiantes.</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="price" className="block text-sm font-semibold text-gray-700">
                  Precio por Persona (PEN) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="price"
                    value={priceInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPriceInput(value);
                      if (value !== '' && value !== '.') {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) handleInputChange('price', numValue);
                      }
                    }}
                    onBlur={(e) => {
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
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium"
                    required
                  />
                  <DollarSign className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          
          {/* 4. Multimedia */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Fotografía y Promoción</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                 <Info className="w-5 h-5 text-blue-600 shrink-0" />
                 <p className="text-sm text-blue-800">
                   Agrega hasta 5 imágenes atractivas. Estas fotos aparecerán en el perfil de la clase para que los alumnos las vean.
                 </p>
              </div>

              {/* Upload Area */}
              <div className="space-y-4">
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                   {formData.images.map((img, idx) => (
                     img.trim() ? (
                       <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                         <img src={img} alt={`Class ${idx}`} className="w-full h-full object-cover" />
                         <button
                           type="button"
                           onClick={() => {
                             const newImages = [...formData.images];
                             newImages.splice(idx, 1);
                             setFormData({...formData, images: newImages});
                           }}
                           className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                         >
                           <X className="w-3 h-3" />
                         </button>
                         <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-md">
                           {idx + 1}
                         </div>
                       </div>
                     ) : null
                   ))}
                   
                   {formData.images.length < 5 && (
                     <label className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all aspect-square group">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full group-hover:scale-110 transition-transform mb-2">
                           <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-gray-600 text-center">Subir Foto</span>
                        <input 
                           type="file" 
                           accept="image/*" 
                           className="hidden" 
                           onChange={handleImageUpload}
                           disabled={uploadingImage}
                        />
                     </label>
                   )}
                 </div>

                 {/* URL Input Alternative */}
                 <div className="pt-4 border-t border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">O agregar desde URL</label>
                    <div className="flex gap-2">
                       <div className="relative flex-1">
                          <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                          />
                          <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                       </div>
                       <button
                         type="button"
                         onClick={handleAddImageUrl}
                         disabled={!imageUrl.trim()}
                         className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                       >
                         Agregar
                       </button>
                    </div>
                    {imageError && <p className="text-xs text-red-500 mt-1">{imageError}</p>}
                 </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-gray-200">
             <Link
               href="/dashboard/school/classes"
               className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-center shadow-sm"
             >
               Cancelar
             </Link>
             <button
               type="submit"
               disabled={saving}
               className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-wait"
             >
               {saving ? (
                 <>
                   <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Guardando...
                 </>
               ) : (
                 <>
                   <CheckCircle2 className="w-5 h-5" />
                   Crear Clase
                 </>
               )}
             </button>
          </div>

        </form>

        {/* Modal para agregar nueva playa */}
        {showAddBeachModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-100 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Agregar Nueva Playa</h3>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="newBeachName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Playa *
                  </label>
                  <input
                    type="text"
                    id="newBeachName"
                    value={newBeachName}
                    onChange={(e) => setNewBeachName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Playa Makaha"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="newBeachLocation" className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    id="newBeachLocation"
                    value={newBeachLocation}
                    onChange={(e) => setNewBeachLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Miraflores, Lima"
                  />
                </div>

                <div>
                  <label htmlFor="newBeachDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    id="newBeachDescription"
                    value={newBeachDescription}
                    onChange={(e) => setNewBeachDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descripción opcional de la playa"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBeachModal(false);
                    setNewBeachName('');
                    setNewBeachLocation('');
                    setNewBeachDescription('');
                    setError(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddBeach}
                  disabled={addingBeach || !newBeachName.trim()}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors flex items-center"
                >
                  {addingBeach && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {addingBeach ? 'Agregando...' : 'Agregar Playa'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
