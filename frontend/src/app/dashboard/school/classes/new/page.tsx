"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { MultiDatePicker } from '@/components/ui/MultiDatePicker';

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
    price: 25,
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
  const [priceInput, setPriceInput] = useState<string>('25');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [beaches, setBeaches] = useState<Beach[]>([]);
  const [showAddBeachModal, setShowAddBeachModal] = useState(false);
  const [newBeachName, setNewBeachName] = useState('');
  const [newBeachLocation, setNewBeachLocation] = useState('');
  const [newBeachDescription, setNewBeachDescription] = useState('');
  const [addingBeach, setAddingBeach] = useState(false);

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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crear Nueva Clase</h1>
              <p className="text-gray-600 mt-1">Programa una nueva clase de surf</p>
            </div>
            <Link
              href="/dashboard/school/classes"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
            >
              ← Volver a Clases
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
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

            {/* Tipo de horario */}
            <div className="md:col-span-2">
              <label htmlFor="scheduleType" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Horario *
              </label>
              <select
                id="scheduleType"
                value={formData.scheduleType}
                onChange={(e) => handleInputChange('scheduleType', e.target.value as 'single' | 'recurring' | 'dateRange' | 'specificDates')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="single">Clase Única</option>
                <option value="dateRange">Clases en Bloque (Rango de Fechas)</option>
                <option value="specificDates">Fechas Específicas (Seleccionar del Calendario)</option>
                <option value="recurring">Clases Recurrentes (Días de la Semana)</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                {formData.scheduleType === 'single' && 'Crea una sola clase para una fecha y hora específica'}
                {formData.scheduleType === 'dateRange' && 'Crea múltiples clases, una por cada día en el rango de fechas seleccionado'}
                {formData.scheduleType === 'specificDates' && 'Selecciona fechas específicas del calendario para crear clases'}
                {formData.scheduleType === 'recurring' && 'Crea clases recurrentes según días de la semana seleccionados'}
              </p>
            </div>

            {/* Campos para clase única */}
            {formData.scheduleType === 'single' && (
              <>
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
              </>
            )}

            {/* Campos para rango de fechas */}
            {formData.scheduleType === 'dateRange' && (
              <>
                <div>
                  <label htmlFor="dateRangeStart" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    id="dateRangeStart"
                    value={formData.dateRangeStart}
                    onChange={(e) => handleInputChange('dateRangeStart', e.target.value)}
                    min={getMinDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={formData.scheduleType === 'dateRange'}
                  />
                </div>

                <div>
                  <label htmlFor="dateRangeEnd" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Fin *
                  </label>
                  <input
                    type="date"
                    id="dateRangeEnd"
                    value={formData.dateRangeEnd}
                    onChange={(e) => handleInputChange('dateRangeEnd', e.target.value)}
                    min={formData.dateRangeStart || getMinDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={formData.scheduleType === 'dateRange'}
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
                    required={formData.scheduleType === 'dateRange'}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Esta hora se aplicará a todas las clases del rango
                  </p>
                </div>

                {formData.dateRangeStart && formData.dateRangeEnd && formData.time && (
                  <div className="md:col-span-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Vista previa:</strong> Se crearán{' '}
                        {(() => {
                          const occurrences = generateDateRangeOccurrences();
                          return occurrences.length;
                        })()}{' '}
                        clases desde el {new Date(formData.dateRangeStart).toLocaleDateString('es-ES')} hasta el{' '}
                        {new Date(formData.dateRangeEnd).toLocaleDateString('es-ES')} a las {formData.time}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Campos para fechas específicas */}
            {formData.scheduleType === 'specificDates' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Fechas del Calendario *
                  </label>
                  <MultiDatePicker
                    selectedDates={formData.specificDates}
                    onChange={(dates) => handleInputChange('specificDates', dates)}
                    minDate={getMinDate()}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Haz clic en las fechas del calendario para seleccionarlas. Puedes seleccionar múltiples fechas.
                  </p>
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
                    required={formData.scheduleType === 'specificDates'}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Esta hora se aplicará a todas las clases seleccionadas
                  </p>
                </div>

                {formData.specificDates.length > 0 && formData.time && (
                  <div className="md:col-span-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Vista previa:</strong> Se crearán {formData.specificDates.length} clase(s) en las fechas seleccionadas a las {formData.time}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Campos para clases recurrentes (mantener existente) */}
            {formData.scheduleType === 'recurring' && (
              <>
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    min={getMinDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={formData.scheduleType === 'recurring'}
                  />
                </div>

                <div>
                  <label htmlFor="weeksCount" className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Semanas *
                  </label>
                  <input
                    type="number"
                    id="weeksCount"
                    value={formData.weeksCount}
                    onChange={(e) => handleInputChange('weeksCount', Number(e.target.value))}
                    min="1"
                    max="52"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={formData.scheduleType === 'recurring'}
                  />
                </div>
              </>
            )}

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

            <div className="md:col-span-2">
              <label htmlFor="beach" className="block text-sm font-medium text-gray-700 mb-2">
                Playa
              </label>
              <div className="flex gap-2">
                <select
                  id="beach"
                  value={formData.beachId || ''}
                  onChange={(e) => handleInputChange('beachId', e.target.value ? Number(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar playa (opcional)</option>
                  {beaches.map((beach) => (
                    <option key={beach.id} value={beach.id}>
                      {beach.name}{beach.location ? ` - ${beach.location}` : ''}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowAddBeachModal(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center whitespace-nowrap"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar Playa
                </button>
              </div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Precio por persona</p>
            </div>

            {/* Images Section */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Imágenes de la Clase</h2>
              <p className="text-sm text-gray-600 mb-4">
                Agrega entre 1 y 5 imágenes para tu clase. Ingresa la URL de cada imagen.
              </p>

              <div className="space-y-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <label htmlFor={`image-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                        Imagen {index + 1} {index === 0 && '*'}
                      </label>
                      <input
                        type="url"
                        id={`image-${index}`}
                        value={image}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://ejemplo.com/imagen.jpg"
                        required={index === 0}
                      />
                      {image && (
                        <div className="mt-2">
                          <img
                            src={image}
                            alt={`Vista previa ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="mt-8 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Eliminar imagen"
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
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar otra imagen (máximo 5)
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="mt-8 flex justify-end space-x-4">
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
              {saving ? 'Creando...' : 'Crear Clase'}
            </button>
          </div>
        </form>

        {/* Modal para agregar nueva playa */}
        {showAddBeachModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
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