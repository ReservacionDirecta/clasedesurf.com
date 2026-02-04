'use client';

import { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Phone, UserPlus, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { User } from '@/types';
import { useApiCall } from '@/hooks/useApiCall';

interface SimpleInstructorFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  instructorRole?: 'INSTRUCTOR' | 'HEAD_COACH';
}

export default function SimpleInstructorForm({ onSubmit, onCancel, isLoading, instructorRole }: SimpleInstructorFormProps) {
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    sendWelcomeEmail: true,
    instructorRole: (instructorRole || 'INSTRUCTOR') as 'INSTRUCTOR' | 'HEAD_COACH',
    type: 'EMPLOYEE' as 'EMPLOYEE' | 'INDEPENDENT',
    selectedUserId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const { makeRequest } = useApiCall();

  useEffect(() => {
    if (mode === 'existing') {
      fetchAvailableUsers();
    }
  }, [mode]);

  const fetchAvailableUsers = async () => {
    try {
      const result = await makeRequest('/api/users', { method: 'GET' });
      if (result.data) {
        setAvailableUsers(result.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (mode === 'new') {
      if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
      if (!formData.email.trim()) newErrors.email = 'El email es requerido';
      else if (!/\S+@\S+\.\S/.test(formData.email)) newErrors.email = 'Email inválido';
      
      if (!formData.password) newErrors.password = 'La contraseña es requerida';
      else if (formData.password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    } else {
      if (!formData.selectedUserId) newErrors.selectedUserId = 'Debes seleccionar un usuario';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      let instructorData;

      if (mode === 'new') {
        // Crear el usuario primero y luego el instructor
        instructorData = {
          // Datos del usuario
          userData: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim() || null,
            password: formData.password,
            role: 'INSTRUCTOR'
          },
          // Datos básicos del instructor
          bio: `Instructor de surf en ${formData.name}. Perfil creado por la escuela.`,
          yearsExperience: 1, // Valor por defecto
          specialties: ['Surf para principiantes'], // Especialidad básica
          certifications: [],
          isActive: true,
          sendWelcomeEmail: formData.sendWelcomeEmail,
          instructorRole: formData.instructorRole,
          type: formData.type
        };
      } else {
        // Usar usuario existente
        const selectedUser = availableUsers.find(u => u.id === Number(formData.selectedUserId));
        instructorData = {
          userId: Number(formData.selectedUserId),
          // Datos básicos del instructor
          bio: `Instructor de surf ${selectedUser?.name || ''}.`,
          yearsExperience: 1,
          specialties: ['Surf para principiantes'],
          certifications: [],
          certifications: [],
          isActive: true,
          instructorRole: formData.instructorRole,
          type: formData.type
        };
      }

      await onSubmit(instructorData);
      setStep('success');
    } catch (error) {
      console.error('Error creating instructor:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const filteredUsers = availableUsers.filter(user => 
    user.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (step === 'success') {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          ¡Instructor {mode === 'new' ? 'creado' : 'asignado'} exitosamente!
        </h3>
        <p className="text-gray-600 mb-6">
          El instructor ha sido vinculado a tu escuela correctamente.
        </p>
        
        {mode === 'new' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-green-900 mb-2">Credenciales creadas:</h4>
            <div className="text-sm text-green-800 space-y-1">
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Contraseña temporal:</strong> {formData.password}</p>
              <p className="text-xs text-green-600 mt-2">
                * Comparte estas credenciales con el instructor de forma segura
              </p>
            </div>
          </div>
        )}

        <button
          onClick={onCancel}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {mode === 'new' ? 'Crear Nuevo Instructor' : 'Vincular Usuario Existente'}
        </h3>
        <p className="text-gray-600 text-sm">
          {mode === 'new' 
            ? 'Crea un perfil básico para el instructor. Él podrá completar sus datos cuando inicie sesión.'
            : 'Selecciona un usuario registrado para asignarlo como instructor.'}
        </p>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
        <button
          type="button"
          onClick={() => setMode('new')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            mode === 'new' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Crear Nuevo Usuario
        </button>
        <button
          type="button"
          onClick={() => setMode('existing')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            mode === 'existing' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Usuario Existente
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'new' ? (
          <>
            {/* Nombre completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <UserIcon className="w-4 h-4 inline mr-1" />
                Nombre completo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Juan Carlos Pérez"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="instructor@email.com"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                Teléfono (opcional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+51 999 999 999"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            {/* Contraseña temporal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña temporal *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Enviar email de bienvenida */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="sendWelcomeEmail"
                checked={formData.sendWelcomeEmail}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isLoading}
              />
              <label className="ml-2 text-sm text-gray-700">
                Enviar email de bienvenida con credenciales de acceso
              </label>
            </div>
          </>
        ) : (
          <div className="space-y-4">
             {/* Search */}
             <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar usuario por nombre o email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
             </div>

             {/* Users List */}
             <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
               {availableUsers.length === 0 ? (
                 <div className="p-4 text-center text-gray-500 text-sm">Cargando usuarios...</div>
               ) : filteredUsers.length === 0 ? (
                 <div className="p-4 text-center text-gray-500 text-sm">No se encontraron usuarios</div>
               ) : (
                 <div className="divide-y divide-gray-100">
                   {filteredUsers.map(user => (
                     <label 
                      key={user.id} 
                      className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        Number(formData.selectedUserId) === user.id ? 'bg-blue-50' : ''
                      }`}
                    >
                       <input
                         type="radio"
                         name="selectedUserId"
                         value={user.id}
                         checked={Number(formData.selectedUserId) === user.id}
                         onChange={handleChange}
                         className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                       />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-900">{user.name}</p>
                         <p className="text-xs text-gray-500">{user.email} • {user.role}</p>
                       </div>
                     </label>
                   ))}
                 </div>
               )}
             </div>
             {errors.selectedUserId && <p className="text-red-500 text-sm">{errors.selectedUserId}</p>}
          </div>
        )}

        {/* Rol del Instructor (Common) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rol del Instructor *
          </label>
          <select
            name="instructorRole"
            value={formData.instructorRole}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="INSTRUCTOR">Instructor</option>
            <option value="HEAD_COACH">Head Coach (Coordinador)</option>
          </select>
          <p className="text-gray-500 text-xs mt-1">
            {formData.instructorRole === 'HEAD_COACH' 
              ? 'El Head Coach tendrá acceso a un dashboard especial con calendario y gestión de instructores'
              : 'Instructor regular con acceso a su calendario de clases'}
          </p>
        </div>

        {/* Tipo de Instructor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Vinculación
          </label>
          <div className="flex gap-4 bg-white p-3 border border-gray-200 rounded-lg">
             <label className="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="type" 
                  value="EMPLOYEE" 
                  checked={formData.type === 'EMPLOYEE'} 
                  onChange={handleChange} 
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                />
                <span className="ml-2 text-sm text-gray-700">Empleado (Plantilla)</span>
             </label>
             <label className="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="type" 
                  value="INDEPENDENT" 
                  checked={formData.type === 'INDEPENDENT'} 
                  onChange={handleChange} 
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                />
                <span className="ml-2 text-sm text-gray-700">Independiente (Externo)</span>
             </label>
          </div>
          {formData.type === 'INDEPENDENT' && (
             <p className="text-xs text-blue-600 mt-1 ml-1">
               * Los instructores independientes deben confirmar su asistencia a cada clase asignada.
             </p>
          )}
        </div>

        {/* Información adicional */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 mb-1">Información importante:</p>
              <ul className="text-yellow-700 space-y-1">
                <li>• Se creará un perfil básico con datos mínimos</li>
                <li>• El instructor podrá completar su biografía, especialidades y certificaciones</li>
                <li>• Será asignado automáticamente a tu escuela</li>
                <li>• Recibirá un email con instrucciones para completar su perfil</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botones */}
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {mode === 'new' ? 'Creando...' : 'Asignando...'}
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                {mode === 'new' ? 'Crear Instructor' : 'Asignar Instructor'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}