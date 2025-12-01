'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Class } from '@/types';
import { Upload, Link as LinkIcon, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface Instructor {
  id: number;
  name: string;
  userId: number;
}

interface ClassFormProps {
  classData?: Class;
  onSubmit: (data: Partial<Class>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ClassForm({ classData, onSubmit, onCancel, isLoading }: ClassFormProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    title: classData?.title || '',
    description: classData?.description || '',
    date: classData?.date ? new Date(classData.date).toISOString().slice(0, 16) : '',
    duration: classData?.duration || 60,
    capacity: classData?.capacity || 10,
    price: classData?.price || 0,
    level: classData?.level || 'BEGINNER',
    instructor: classData?.instructor || '',
    studentDetails: '',
    images: classData?.images || []
  });

  // Estado local para el precio mientras se escribe (permite string vacío)
  const [priceInput, setPriceInput] = useState<string>(String(formData.price || ''));

  // Estados para manejo de imágenes
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loadingInstructors, setLoadingInstructors] = useState(true);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const token = (session as any)?.backendToken;
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch('/api/instructors', { headers });
        if (response.ok) {
          const data = await response.json();
          const instructorList = Array.isArray(data)
            ? data.map((it: any) => ({
              id: it.id,
              name: it.user?.name ?? it.name ?? 'Instructor',
              userId: it.userId ?? it.user?.id
            }))
            : [];
          setInstructors(instructorList);
        }
      } catch (error) {
        console.error('Error fetching instructors:', error);
      } finally {
        setLoadingInstructors(false);
      }
    };

    if (session) {
      fetchInstructors();
    }
  }, [session]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'El título es requerido';
    if (!formData.date) newErrors.date = 'La fecha es requerida';
    if (formData.duration < 30) newErrors.duration = 'La duración mínima es 30 minutos';
    if (formData.capacity < 1) newErrors.capacity = 'La capacidad debe ser al menos 1';
    if (formData.price < 0) newErrors.price = 'El precio no puede ser negativo';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData: any = {
      title: formData.title,
      description: formData.description || null,
      date: new Date(formData.date).toISOString(),
      duration: Number(formData.duration),
      capacity: Number(formData.capacity),
      price: Number(formData.price),
      level: formData.level,
      instructor: formData.instructor || null,
      studentDetails: formData.studentDetails || null,
      images: formData.images.length > 0 ? formData.images : []
    };

    await onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, imageUrl.trim()]
    }));
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

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, persistentUrl]
      }));

      // Limpiar el input
      e.target.value = '';
    } catch (error) {
      console.error('Error uploading image:', error);
      setImageError(error instanceof Error ? error.message : 'Error al subir la imagen. Intenta de nuevo.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Función para eliminar imagen
  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Título de la Clase *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ej: Clase de Surf para Principiantes"
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            disabled={isLoading}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Describe la clase..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Fecha y Hora *
          </label>
          <input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            disabled={isLoading}
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Duración (minutos) *
          </label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="30"
            step="15"
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.duration ? 'border-red-500' : 'border-gray-300'
              }`}
            disabled={isLoading}
          />
          {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
        </div>

        {/* Level */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Nivel *
          </label>
          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="BEGINNER">Principiante</option>
            <option value="INTERMEDIATE">Intermedio</option>
            <option value="ADVANCED">Avanzado</option>
          </select>
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Capacidad *
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            min="1"
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.capacity ? 'border-red-500' : 'border-gray-300'
              }`}
            disabled={isLoading}
          />
          {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
        </div>

        {/* Price */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Precio ($) *
          </label>
          <input
            type="number"
            name="price"
            value={priceInput}
            onChange={(e) => {
              const value = e.target.value;
              setPriceInput(value);
              if (value !== '' && value !== '.') {
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                  setFormData(prev => ({ ...prev, price: numValue }));
                }
              }
            }}
            onBlur={(e) => {
              const value = e.target.value;
              if (value === '' || value === '.' || isNaN(parseFloat(value))) {
                setPriceInput('0');
                setFormData(prev => ({ ...prev, price: 0 }));
              } else {
                const numValue = parseFloat(value);
                setPriceInput(String(numValue));
                setFormData(prev => ({ ...prev, price: numValue }));
              }
            }}
            min="0"
            step="0.01"
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
            disabled={isLoading}
          />
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
        </div>

        {/* Instructor */}
        <div className="md:col-span-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Instructor *
          </label>
          <select
            name="instructor"
            value={formData.instructor}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || loadingInstructors}
          >
            <option value="">Selecciona un instructor</option>
            {instructors.map((instructor) => (
              <option key={instructor.id} value={instructor.name}>
                {instructor.name}
              </option>
            ))}
          </select>
          {loadingInstructors && (
            <p className="text-xs text-gray-500 mt-1">Cargando instructores...</p>
          )}
          {!loadingInstructors && instructors.length === 0 && (
            <p className="text-xs text-yellow-600 mt-1">
              No hay instructores disponibles.
            </p>
          )}
        </div>

        {/* Student Details */}
        <div className="md:col-span-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Detalles de Estudiantes
          </label>
          <textarea
            name="studentDetails"
            value={formData.studentDetails}
            onChange={handleChange}
            rows={3}
            placeholder="Nombres y detalles de estudiantes..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>

        {/* Images Section */}
        <div className="md:col-span-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Imágenes de la Clase
          </label>

          {/* Image Upload Options */}
          <div className="space-y-3">
            {/* File Upload - Mobile Optimized */}
            <div className="flex items-center gap-3">
              <label className="flex-1">
                <div className="flex flex-col sm:flex-row items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50 active:bg-blue-100">
                  <Upload className="w-5 h-5 text-gray-400 mb-1 sm:mb-0 sm:mr-2" />
                  <span className="text-xs sm:text-sm text-gray-600 text-center">
                    {uploadingImage ? 'Optimizando...' : 'Toca para subir foto'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                    disabled={isLoading || uploadingImage || formData.images.length >= 5}
                    className="hidden"
                  />
                </div>
              </label>
            </div>

            {/* URL Input - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
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
                  placeholder="Pegar URL..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading || formData.images.length >= 5}
                />
              </div>
              <button
                type="button"
                onClick={handleAddImageUrl}
                disabled={isLoading || !imageUrl.trim() || formData.images.length >= 5}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Agregar
              </button>
            </div>

            {/* Error Message */}
            {imageError && (
              <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg">
                <X className="w-3 h-3" />
                <span>{imageError}</span>
              </div>
            )}

            {/* Image Preview Gallery - Mobile Optimized */}
            {formData.images.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">
                  Imágenes ({formData.images.length}/5):
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group aspect-square">
                      <div className="relative w-full h-full rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={img}
                          alt={`Img ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="33vw"
                        />
                        {/* Remove Button - Always visible on mobile or larger touch target */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full shadow-sm hover:bg-red-700 active:scale-95 transition-all"
                          disabled={isLoading}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions - Mobile Optimized */}
      <div className="flex gap-3 justify-end pt-4 border-t mt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 shadow-sm"
        >
          {isLoading ? 'Guardando...' : classData ? 'Actualizar' : 'Crear Clase'}
        </button>
      </div>
    </form>
  );
}
