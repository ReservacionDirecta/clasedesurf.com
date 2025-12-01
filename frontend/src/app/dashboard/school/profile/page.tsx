'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Globe, Instagram, Facebook, MessageCircle, Camera, Edit, Save, X } from 'lucide-react';

interface School {
  id: number;
  name: string;
  location: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  address?: string;
  logo?: string;
  coverImage?: string;
  foundedYear?: number;
  rating?: number;
  totalReviews?: number;
}

export default function SchoolProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchSchool = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Using API proxy routes instead of direct backend calls
      // Add cache: 'no-store' to prevent Next.js from caching the response
      const res = await fetch('/api/schools/my-school', { 
        headers,
        cache: 'no-store' // Force fresh data from server
      });
      if (!res.ok) throw new Error('Failed to fetch school');
      
      const selectedSchool = await res.json();
      console.log('[Frontend] Fetched school data:', JSON.stringify(selectedSchool, null, 2));
      
      if (selectedSchool) {
        setSchool(selectedSchool);
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

    // Only fetch if we don't have school data yet
    if (!school) {
      fetchSchool();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router]); // Removed fetchSchool from dependencies to prevent unnecessary refetches

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!school) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Only send editable fields, exclude id, rating, totalReviews, createdAt, updatedAt
      const updateData: any = {
        name: school.name,
        location: school.location,
        description: school.description || null,
        phone: school.phone || null,
        email: school.email || null,
        website: school.website || null,
        instagram: school.instagram || null,
        facebook: school.facebook || null,
        whatsapp: school.whatsapp || null,
        address: school.address || null,
        logo: school.logo || null,
        coverImage: school.coverImage || null
      };
      
      // Handle foundedYear: send null if undefined or null, otherwise send the number
      if (school.foundedYear !== undefined) {
        updateData.foundedYear = school.foundedYear ?? null;
      }
      
      console.log('[Frontend] Updating school:', school.id, 'with data:', JSON.stringify(updateData, null, 2));
      
      const res = await fetch(`/api/schools/${school.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData)
      });
      
      console.log('[Frontend] Response status:', res.status, res.statusText);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to update school' }));
        console.error('Backend error response:', errorData);
        const errorMessage = errorData.errors 
          ? `Error de validación: ${errorData.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ')}`
          : errorData.message || errorData.error || 'Failed to update school';
        throw new Error(errorMessage);
      }
      
      const updatedSchool = await res.json();
      console.log('[Frontend] Updated school received:', JSON.stringify(updatedSchool, null, 2));
      
      // Update the school state with the response from backend
      setSchool(updatedSchool);
      setSuccess(true);
      
      // Force a refetch from the server to ensure we have the latest data
      // This ensures we get the data exactly as stored in the database
      setTimeout(async () => {
        console.log('[Frontend] Refetching school data from server...');
        try {
          const token = (session as any)?.backendToken;
          const headers: any = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          
          const res = await fetch('/api/schools/my-school', { 
            headers,
            cache: 'no-store' // Prevent caching
          });
          if (res.ok) {
            const freshSchool = await res.json();
            console.log('[Frontend] Fresh school data from server:', JSON.stringify(freshSchool, null, 2));
            setSchool(freshSchool);
          }
        } catch (err) {
          console.error('[Frontend] Error refetching school:', err);
        }
      }, 100);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating school:', err);
      setError(err instanceof Error ? err.message : 'Error updating school');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof School, value: string | number | undefined) => {
    if (!school) return;
    console.log('[Frontend] handleInputChange:', field, '=', value, 'type:', typeof value);
    setSchool((prevSchool) => {
      if (!prevSchool) return prevSchool;
      const updated = { ...prevSchool, [field]: value };
      console.log('[Frontend] Updated school state:', JSON.stringify(updated, null, 2));
      return updated;
    });
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

  if (!school) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">No hay escuela asignada</h2>
            <p className="text-yellow-600">No se encontró una escuela asociada a tu cuenta.</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Perfil de la Escuela</h1>
              <p className="text-gray-600 mt-1">Gestiona la información de tu escuela</p>
            </div>
            <Link
              href="/dashboard/school"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
            >
              ← Volver al Dashboard
            </Link>
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
              <p className="text-green-800 font-medium">Información actualizada correctamente</p>
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

        {/* School Stats Card */}
        {school && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {school.foundedYear && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Años de Antigüedad</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {new Date().getFullYear() - school.foundedYear} años
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Fundada en {school.foundedYear}</p>
                </div>
              )}
              {school.rating !== undefined && school.rating > 0 && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Calificación</p>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-2xl font-bold text-yellow-600">{school.rating.toFixed(1)}</span>
                    <svg className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500">{school.totalReviews || 0} reseñas</p>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Básica</h2>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Escuela *
              </label>
              <input
                type="text"
                id="name"
                value={school.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación *
              </label>
              <input
                type="text"
                id="location"
                value={school.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                value={school.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe tu escuela de surf..."
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Dirección Completa
              </label>
              <input
                type="text"
                id="address"
                value={school.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Dirección completa de la escuela"
              />
            </div>

            <div>
              <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700 mb-2">
                Año de Fundación
              </label>
              <input
                type="number"
                id="foundedYear"
                min="1900"
                max={new Date().getFullYear()}
                value={school.foundedYear || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange('foundedYear', value ? parseInt(value) : undefined);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: 2015"
              />
              <p className="text-xs text-gray-500 mt-1">
                {school.foundedYear ? `${new Date().getFullYear() - school.foundedYear} años de antigüedad` : 'Año en que se fundó la escuela'}
              </p>
            </div>

            {/* Contact Information */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de Contacto</h2>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                value={school.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+51 123 456 789"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={school.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="contacto@escuela.com"
              />
            </div>

            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp
              </label>
              <input
                type="tel"
                id="whatsapp"
                value={school.whatsapp || ''}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+51 123 456 789"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Sitio Web
              </label>
              <input
                type="url"
                id="website"
                value={school.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://www.escuela.com"
              />
            </div>

            {/* Social Media */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Redes Sociales</h2>
            </div>

            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  @
                </span>
                <input
                  type="text"
                  id="instagram"
                  value={school.instagram || ''}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="usuario_instagram"
                />
              </div>
            </div>

            <div>
              <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-2">
                Facebook
              </label>
              <input
                type="text"
                id="facebook"
                value={school.facebook || ''}
                onChange={(e) => handleInputChange('facebook', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="NombrePagina"
              />
            </div>

            {/* Images */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Imágenes</h2>
            </div>

            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
                Logo (URL)
              </label>
              <input
                type="url"
                id="logo"
                value={school.logo || ''}
                onChange={(e) => handleInputChange('logo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://ejemplo.com/logo.jpg"
              />
            </div>

            <div>
              <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-2">
                Imagen de Portada (URL)
              </label>
              <input
                type="url"
                id="coverImage"
                value={school.coverImage || ''}
                onChange={(e) => handleInputChange('coverImage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://ejemplo.com/portada.jpg"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end space-x-4">
            <Link
              href="/dashboard/school"
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
        </form>
      </div>
    </div>
  );
}
