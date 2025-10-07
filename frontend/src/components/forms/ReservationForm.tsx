'use client';

import { useState, useEffect } from 'react';
import { Reservation, Class, User } from '@/types';
import { useApiCall } from '@/hooks/useApiCall';

interface ReservationFormProps {
  reservation?: Reservation;
  onSubmit: (data: Partial<Reservation>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ReservationForm({ reservation, onSubmit, onCancel, isLoading }: ReservationFormProps) {
  const [formData, setFormData] = useState({
    userId: reservation?.user?.id || '',
    classId: reservation?.class?.id || '',
    status: reservation?.status || 'PENDING',
    specialRequest: reservation?.specialRequest || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [classes, setClasses] = useState<Class[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const { makeRequest } = useApiCall();

  useEffect(() => {
    fetchClasses();
    fetchUsers();
  }, []);

  const fetchClasses = async () => {
    try {
      const result = await makeRequest('/api/classes', { method: 'GET' });
      if (result.data) {
        setClasses(result.data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const result = await makeRequest('/api/users', { method: 'GET' });
      if (result.data) {
        setUsers(result.data.filter((user: User) => user.role === 'STUDENT'));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.userId) newErrors.userId = 'El usuario es requerido';
    if (!formData.classId) newErrors.classId = 'La clase es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    await onSubmit({
      userId: Number(formData.userId),
      classId: Number(formData.classId),
      status: formData.status as any,
      specialRequest: formData.specialRequest || undefined
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Usuario (Estudiante) *
          </label>
          <select
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.userId ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          >
            <option value="">Seleccionar usuario</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          {errors.userId && <p className="text-red-500 text-sm mt-1">{errors.userId}</p>}
        </div>

        {/* Class */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Clase *
          </label>
          <select
            name="classId"
            value={formData.classId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.classId ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          >
            <option value="">Seleccionar clase</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.title} - {new Date(cls.date).toLocaleDateString('es-ES')} - ${cls.price}
              </option>
            ))}
          </select>
          {errors.classId && <p className="text-red-500 text-sm mt-1">{errors.classId}</p>}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado *
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="PENDING">Pendiente</option>
            <option value="CONFIRMED">Confirmada</option>
            <option value="PAID">Pagada</option>
            <option value="CANCELED">Cancelada</option>
            <option value="COMPLETED">Completada</option>
          </select>
        </div>

        {/* Special Request */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Solicitud Especial
          </label>
          <textarea
            name="specialRequest"
            value={formData.specialRequest}
            onChange={handleChange}
            rows={3}
            placeholder="Cualquier solicitud especial del estudiante..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
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
          {isLoading ? 'Guardando...' : reservation ? 'Actualizar' : 'Crear Reservación'}
        </button>
      </div>
    </form>
  );
}