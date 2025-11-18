'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Class } from '@/types';

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
    studentDetails: ''
  });
  
  // Estado local para el precio mientras se escribe (permite string vacío)
  const [priceInput, setPriceInput] = useState<string>(String(formData.price || ''));

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
      studentDetails: formData.studentDetails || null
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título de la Clase *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ej: Clase de Surf para Principiantes"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Describe la clase..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha y Hora *
          </label>
          <input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.date ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duración (minutos) *
          </label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="30"
            step="15"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.duration ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
        </div>

        {/* Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nivel *
          </label>
          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="BEGINNER">Principiante</option>
            <option value="INTERMEDIATE">Intermedio</option>
            <option value="ADVANCED">Avanzado</option>
          </select>
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Capacidad *
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            min="1"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.capacity ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio ($) *
          </label>
          <input
            type="number"
            name="price"
            value={priceInput}
            onChange={(e) => {
              const value = e.target.value;
              // Permitir cualquier valor mientras se escribe
              setPriceInput(value);
              // Actualizar formData solo si es un número válido
              if (value !== '' && value !== '.') {
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                  setFormData(prev => ({ ...prev, price: numValue }));
                }
              }
            }}
            onBlur={(e) => {
              // Asegurar que el valor sea un número válido al perder el foco
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
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
        </div>

        {/* Instructor */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instructor *
          </label>
          <select
            name="instructor"
            value={formData.instructor}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              No hay instructores disponibles. Crea instructores primero en la sección de Gestión de Instructores.
            </p>
          )}
        </div>

        {/* Student Details */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Detalles de Estudiantes
          </label>
          <textarea
            name="studentDetails"
            value={formData.studentDetails}
            onChange={handleChange}
            rows={4}
            placeholder="Ingresa nombres y detalles de los estudiantes que asistirán a esta clase&#10;Ejemplo:&#10;- Juan Pérez (Principiante, primera clase)&#10;- María García (Intermedio, clase de repaso)&#10;- Carlos López (Avanzado)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Opcional: Registra los nombres y cualquier detalle relevante de los estudiantes que participarán en esta clase.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Guardando...' : classData ? 'Actualizar' : 'Crear Clase'}
        </button>
      </div>
    </form>
  );
}
