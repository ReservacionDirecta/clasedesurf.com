'use client';

import { useState } from 'react';
import { User, Mail, Phone, UserPlus, AlertCircle, CheckCircle, Calendar } from 'lucide-react';

interface SimpleStudentFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function SimpleStudentForm({ onSubmit, onCancel, isLoading }: SimpleStudentFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    notes: '',
    password: '',
    sendWelcomeEmail: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'form' | 'success'>('form');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    else if (formData.password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      // Crear el usuario primero y luego el estudiante
      const studentData = {
        // Datos del usuario
        userData: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          password: formData.password,
          role: 'STUDENT'
        },
        // Datos básicos del estudiante
        birthdate: formData.birthdate || null,
        notes: formData.notes.trim() || null,
        level: 'BEGINNER', // Valor por defecto
        canSwim: false, // Valor por defecto
        sendWelcomeEmail: formData.sendWelcomeEmail
      };

      await onSubmit(studentData);
      setStep('success');
    } catch (error) {
      console.error('Error creating student:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  if (step === 'success') {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          ¡Estudiante creado exitosamente!
        </h3>
        <p className="text-gray-600 mb-6">
          El estudiante <strong>{formData.name}</strong> ha sido creado y asignado a tu escuela.
        </p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-green-900 mb-2">Credenciales creadas:</h4>
          <div className="text-sm text-green-800 space-y-1">
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Contraseña temporal:</strong> {formData.password}</p>
            <p className="text-xs text-green-600 mt-2">
              * Comparte estas credenciales con el estudiante de forma segura
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-2">Próximos pasos:</h4>
          <ul className="text-sm text-blue-800 space-y-1 text-left">
            <li>• Comparte las credenciales con el estudiante</li>
            <li>• El estudiante debe iniciar sesión en el sistema</li>
            <li>• Podrá ver y reservar clases disponibles</li>
            <li>• Actualizar su perfil y preferencias</li>
            <li>• Comenzar a tomar clases de surf</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-left">
              <p className="font-medium text-yellow-800 mb-1">Recordatorio importante:</p>
              <p className="text-yellow-700">
                El estudiante debe cambiar su contraseña temporal en el primer inicio de sesión 
                y completar su perfil para una mejor experiencia.
              </p>
            </div>
          </div>
        </div>

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
          Crear Nuevo Estudiante
        </h3>
        <p className="text-gray-600 text-sm">
          Crea un perfil básico para el estudiante. Él podrá completar sus datos cuando inicie sesión.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre completo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <User className="w-4 h-4 inline mr-1" />
            Nombre completo *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: María González"
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
            placeholder="estudiante@email.com"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Teléfono y Fecha de nacimiento en grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Fecha de nacimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Fecha de nacimiento (opcional)
            </label>
            <input
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas (opcional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Información adicional sobre el estudiante..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
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
          <p className="text-gray-500 text-xs mt-1">
            El estudiante podrá cambiar esta contraseña cuando inicie sesión
          </p>
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

        {/* Información adicional */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 mb-1">Información importante:</p>
              <ul className="text-yellow-700 space-y-1">
                <li>• Se creará un perfil básico con datos mínimos</li>
                <li>• El estudiante podrá completar su perfil y preferencias</li>
                <li>• Será asignado automáticamente a tu escuela</li>
                <li>• Recibirá un email con instrucciones para acceder al sistema</li>
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
                Creando...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Crear Estudiante
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
