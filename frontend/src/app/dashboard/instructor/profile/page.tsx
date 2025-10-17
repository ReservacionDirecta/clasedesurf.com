'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Mail, Phone, Star, Award, BookOpen, Calendar, Camera, Upload, Edit, Save, X } from 'lucide-react';

export default function InstructorProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [instructorData, setInstructorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.role !== 'INSTRUCTOR') {
      router.push('/dashboard/student/profile');
      return;
    }

    fetchInstructorProfile();
  }, [session, status, router]);

  const fetchInstructorProfile = async () => {
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
        rating: 4.9, // TODO: Calculate from reviews
        totalReviews: profileData.reviews?.length || 0,
        specialties: profileData.specialties || [],
        certifications: profileData.certifications || [],
        school: profileData.school?.name || 'Sin escuela asignada',
        profileImage: profileData.profileImage || null,
        socialMedia: {
          instagram: profileData.instagram || '',
          facebook: profileData.facebook || '',
          youtube: profileData.youtube || ''
        },
        languages: profileData.languages || ['Español'],
        achievements: profileData.achievements || []
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching instructor profile:', error);
      setLoading(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
        setShowPhotoUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    // Aquí iría la lógica para guardar el perfil
    setIsEditing(false);
    // Simular guardado exitoso
    alert('Perfil actualizado exitosamente');
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
                {/* Profile Photo Section */}
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto shadow-lg">
                    {profileImage || instructorData?.profileImage ? (
                      <img 
                        src={profileImage || instructorData?.profileImage} 
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-white" />
                    )}
                  </div>
                  
                  {/* Camera Button */}
                  <button
                    onClick={() => setShowPhotoUpload(true)}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Camera className="w-5 h-5 text-gray-600" />
                  </button>
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
                    onClick={() => setIsEditing(!isEditing)}
                    className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                      isEditing 
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
                      onClick={() => setIsEditing(false)}
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
        {/* Photo Upload Modal */}
        {showPhotoUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Cambiar Foto de Perfil</h3>
                <button 
                  onClick={() => setShowPhotoUpload(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Arrastra una imagen aquí o haz click para seleccionar
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Seleccionar Imagen
                  </label>
                </div>
                
                <div className="text-sm text-gray-500">
                  <p>• Formatos soportados: JPG, PNG, GIF</p>
                  <p>• Tamaño máximo: 5MB</p>
                  <p>• Recomendado: 400x400 píxeles</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setShowPhotoUpload(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}