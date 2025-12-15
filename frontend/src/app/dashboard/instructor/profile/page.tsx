'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { User, Mail, Phone, Star, Award, BookOpen, Calendar, Camera, Upload, Edit, Save, X } from 'lucide-react';
import AvatarSelector, { AvatarDisplay } from '@/components/avatar/AvatarSelector';
import { useToast } from '@/contexts/ToastContext';
import { useUnsavedChangesWarning } from '@/hooks/useFormPersistence';

export default function InstructorProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [instructorData, setInstructorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  
  // Warn user before leaving if there are unsaved changes
  useUnsavedChangesWarning(isDirty && isEditing);

  const fetchInstructorProfile = useCallback(async () => {
    try {
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch real profile data from backend
      const profileRes = await fetch('/api/instructor/profile', { headers });

      if (!profileRes.ok) {
        throw new Error('Failed to fetch instructor profile');
      }

      const profileData = await profileRes.json();

      // Map backend data to frontend format
      setInstructorData({
        name: profileData.user?.name || session?.user?.name || 'Instructor',
        email: profileData.user?.email || session?.user?.email || '',
        phone: profileData.user?.phone || 'No registrado',
        age: 29, // TODO: Add age field to backend
        bio: profileData.bio || 'Instructor profesional de surf.',
        yearsExperience: profileData.yearsExperience || 0,
        rating: profileData.rating || 0,
        totalReviews: profileData.totalReviews || profileData.reviews?.length || 0,
        specialties: profileData.specialties || [],
        certifications: profileData.certifications || [],
        school: profileData.school?.name || 'Sin escuela asignada',
        avatar: profileData.avatar || profileData.profileImage || null,
        socialMedia: {
          instagram: profileData.instagram || '',
          facebook: profileData.facebook || '',
          youtube: profileData.youtube || ''
        },
        languages: profileData.languages || ['Español'],
        achievements: profileData.achievements || []
      });
      setSelectedAvatar(profileData.avatar || profileData.profileImage || null);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching instructor profile:', error);
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

    if (session.user?.role !== 'INSTRUCTOR') {
      router.push('/dashboard/student/profile');
      return;
    }

    fetchInstructorProfile();
  }, [fetchInstructorProfile, router, session, status]);

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    if (!isEditing) {
      setIsEditing(true);
    }
    setIsDirty(true);
  };

  const handleSaveProfile = async () => {
    try {
      const token = (session as any)?.backendToken;
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Update instructor profile with avatar
      const updateRes = await fetch('/api/instructor/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          avatar: selectedAvatar || null,
        }),
      });

      if (!updateRes.ok) {
        throw new Error('Failed to update profile');
      }

      // Also update user profile if needed
      if (selectedAvatar) {
        await fetch('/api/users/profile', {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            avatar: selectedAvatar,
          }),
        });
      }

      setIsEditing(false);
      setIsDirty(false);
      fetchInstructorProfile(); // Reload to get updated data
      showSuccess('¡Perfil actualizado!', 'Los cambios se guardaron correctamente');
    } catch (error) {
      console.error('Error saving profile:', error);
      showError('Error al guardar', 'No se pudo actualizar el perfil');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/instructor')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Volver al Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil de Instructor</h1>
          <p className="text-gray-600 mt-2">Gestiona tu información profesional</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="text-center">
                {/* Avatar Section */}
                <div className="relative inline-block mb-6">
                  <AvatarDisplay
                    avatarId={selectedAvatar || instructorData?.avatar}
                    role="INSTRUCTOR"
                    size="xl"
                    className="mx-auto shadow-lg"
                  />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-1">{instructorData?.name}</h2>
                <p className="text-gray-600 mb-4">{instructorData?.school}</p>

                {/* Rating */}
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center bg-yellow-50 px-3 py-2 rounded-full">
                    <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                    <span className="text-lg font-bold text-yellow-700">{instructorData?.rating}</span>
                    <span className="ml-1 text-sm text-yellow-600">({instructorData?.totalReviews} reseñas)</span>
                  </div>
                </div>

                {/* Experience Badge */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-blue-900 font-semibold">
                      {instructorData?.yearsExperience} años de experiencia
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                    className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${isEditing
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    {isEditing ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Cambios
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Perfil
                      </>
                    )}
                  </button>

                  {isEditing && (
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        fetchInstructorProfile(); // Reset changes
                      }}
                      className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Avatar Selector */}
            {isEditing && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecciona tu Avatar</h3>
                <AvatarSelector
                  selectedAvatar={selectedAvatar || instructorData?.avatar}
                  onSelectAvatar={handleAvatarSelect}
                  role="INSTRUCTOR"
                  size="md"
                />
              </div>
            )}

            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{instructorData?.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium">{instructorData?.phone}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Edad</p>
                    <p className="font-medium">{instructorData?.age} años</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Biografía</h3>
              <p className="text-gray-700 leading-relaxed">{instructorData?.bio}</p>
            </div>

            {/* Specialties */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Especialidades
              </h3>
              <div className="flex flex-wrap gap-2">
                {instructorData?.specialties?.map((specialty: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Certificaciones
              </h3>
              <div className="space-y-2">
                {instructorData?.certifications?.map((cert: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <Award className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-gray-700">{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Idiomas
              </h3>
              <div className="flex flex-wrap gap-2">
                {instructorData?.languages?.map((language: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Redes Sociales</h3>
              <div className="space-y-3">
                {instructorData?.socialMedia?.instagram && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-pink-600 font-bold text-sm">IG</span>
                    </div>
                    <span className="text-gray-700">{instructorData.socialMedia.instagram}</span>
                  </div>
                )}
                {instructorData?.socialMedia?.facebook && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-bold text-sm">FB</span>
                    </div>
                    <span className="text-gray-700">{instructorData.socialMedia.facebook}</span>
                  </div>
                )}
                {instructorData?.socialMedia?.youtube && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-red-600 font-bold text-sm">YT</span>
                    </div>
                    <span className="text-gray-700">{instructorData.socialMedia.youtube}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Logros y Reconocimientos
              </h3>
              <div className="space-y-2">
                {instructorData?.achievements?.map((achievement: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    <span className="text-gray-700">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Navegación Rápida</h3>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => router.push('/dashboard/instructor')}
                  className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors border border-blue-200"
                >
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-blue-900 font-medium">Ver Dashboard</span>
                  </div>
                  <span className="text-blue-600">→</span>
                </button>

                <button
                  onClick={() => router.push('/dashboard/instructor/classes')}
                  className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-green-50 transition-colors border border-green-200"
                >
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-green-900 font-medium">Mis Clases</span>
                  </div>
                  <span className="text-green-600">→</span>
                </button>

                <button
                  onClick={() => router.push('/dashboard/instructor/students')}
                  className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-purple-50 transition-colors border border-purple-200"
                >
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="text-purple-900 font-medium">Mis Estudiantes</span>
                  </div>
                  <span className="text-purple-600">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
