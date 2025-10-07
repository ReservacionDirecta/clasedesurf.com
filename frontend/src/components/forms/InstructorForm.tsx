'use client';

import { useState, useEffect } from 'react';
import { Instructor, User } from '@/types';
import { useApiCall } from '@/hooks/useApiCall';

interface InstructorFormProps {
  instructor?: Instructor;
  onSubmit: (data: Partial<Instructor>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  userRole?: string;
  mode?: 'simple' | 'complete'; // Nuevo prop para controlar el modo
}

export default function InstructorForm({ instructor, onSubmit, onCancel, isLoading, userRole, mode = 'complete' }: InstructorFormProps) {
  const [formData, setFormData] = useState({
    userId: instructor?.userId || '',
    bio: instructor?.bio || '',
    yearsExperience: instructor?.yearsExperience || 0,
    specialties: instructor?.specialties?.join(', ') || '',
    certifications: instructor?.certifications?.join(', ') || '',
    isActive: instructor?.isActive ?? true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const { makeRequest } = useApiCall();

  useEffect(() => {
    fetchAvailableUsers();
  }, []);

  const fetchAvailableUsers = async () => {
    try {
      const result = await makeRequest('/api/users', { method: 'GET' });
      if (result.data) {
        // Filtrar usuarios que pueden ser instructores (INSTRUCTOR role o sin instructor asignado)
        const users = result.data.filter((user: User) => 
          user.role === 'INSTRUCTOR' || user.role === 'SCHOOL_ADMIN'
        );
        setAvailableUsers(users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.userId) newErrors.userId = 'El usuario es requerido';
    if (formData.yearsExperience < 0) newErrors.yearsExperience = 'Los años de experiencia no pueden ser negativos';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const submitData = {
      userId: Number(formData.userId),
      bio: formData.bio || undefined,
      yearsExperience: Number(formData.yearsExperience),
      specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()).filter(s => s) : [],
      certifications: formData.certifications ? formData.certifications.split(',').map(s => s.trim()).filter(s => s) : [],
      isActive: formData.isActive
    };

    await onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const specialtyOptions = [
    'Surf para principiantes',
    'Surf avanzado',
    'Longboard',
    'Shortboard',
    'SUP (Stand Up Paddle)',
    'Surf terapéutico',
    'Competición',
    'Surf nocturno',
    'Surf en olas grandes',
    'Técnicas de rescate'
  ];

  const certificationOptions = [
    'ISA Level 1',
    'ISA Level 2',
    'ISA Level 3',
    'Primeros Auxilios',
    'RCP',
    'Salvavidas',
    'Instructor de Natación',
    'Guía de Turismo',
    'Instructor de SUP',
    'Surf Coach Certificado'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Usuario */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Usuario *
        </label>
        <select
          name="userId"
          value={formData.userId}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.userId ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading || !!instructor}
        >
          <option value="">Seleccionar usuario</option>
          {availableUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email}) - {user.role}
            </option>
          ))}
        </select>
        {errors.userId && <p className="text-red-500 text-sm mt-1">{errors.userId}</p>}
        {instructor && (
          <p className="text-gray-500 text-sm mt-1">
            El usuario no se puede cambiar después de crear el instructor
          </p>
        )}
        {userRole === 'SCHOOL_ADMIN' && !instructor && (
          <p className="text-blue-500 text-sm mt-1">
            El instructor será asignado automáticamente a tu escuela
          </p>
        )}
      </div>

      {/* Biografía */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Biografía
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={4}
          placeholder="Cuéntanos sobre la experiencia y pasión del instructor por el surf..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      {/* Años de Experiencia */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Años de Experiencia *
        </label>
        <input
          type="number"
          name="yearsExperience"
          value={formData.yearsExperience}
          onChange={handleChange}
          min="0"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.yearsExperience ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {errors.yearsExperience && <p className="text-red-500 text-sm mt-1">{errors.yearsExperience}</p>}
      </div>

      {/* Especialidades */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Especialidades
        </label>
        <textarea
          name="specialties"
          value={formData.specialties}
          onChange={handleChange}
          rows={2}
          placeholder="Separar con comas: Surf para principiantes, Longboard, SUP..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <div className="mt-2">
          <p className="text-sm text-gray-600 mb-2">Especialidades sugeridas:</p>
          <div className="flex flex-wrap gap-1">
            {specialtyOptions.map((specialty) => (
              <button
                key={specialty}
                type="button"
                onClick={() => {
                  const current = formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : [];
                  if (!current.includes(specialty)) {
                    const newSpecialties = [...current, specialty].filter(s => s);
                    setFormData(prev => ({ ...prev, specialties: newSpecialties.join(', ') }));
                  }
                }}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                disabled={isLoading}
              >
                + {specialty}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Certificaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Certificaciones
        </label>
        <textarea
          name="certifications"
          value={formData.certifications}
          onChange={handleChange}
          rows={2}
          placeholder="Separar con comas: ISA Level 1, Primeros Auxilios, RCP..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <div className="mt-2">
          <p className="text-sm text-gray-600 mb-2">Certificaciones sugeridas:</p>
          <div className="flex flex-wrap gap-1">
            {certificationOptions.map((cert) => (
              <button
                key={cert}
                type="button"
                onClick={() => {
                  const current = formData.certifications ? formData.certifications.split(',').map(s => s.trim()) : [];
                  if (!current.includes(cert)) {
                    const newCerts = [...current, cert].filter(s => s);
                    setFormData(prev => ({ ...prev, certifications: newCerts.join(', ') }));
                  }
                }}
                className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                disabled={isLoading}
              >
                + {cert}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Estado Activo */}
      <div className="flex items-center">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          disabled={isLoading}
        />
        <label className="ml-2 text-sm font-medium text-gray-700">
          Instructor activo (puede dar clases)
        </label>
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
          {isLoading ? 'Guardando...' : instructor ? 'Actualizar Instructor' : 'Crear Instructor'}
        </button>
      </div>
    </form>
  );
}