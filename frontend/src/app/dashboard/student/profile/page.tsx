'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/contexts/ToastContext';

interface UserProfile {
  name: string;
  email: string;
  age?: number;
  weight?: number;
  height?: number;
  canSwim: boolean;
  injuries: string;
  phone: string;
}

interface ClassAttendance {
  classId: number;
  title: string;
  count: number;
  lastAttended?: string;
}

export default function StudentProfile() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { showSuccess, showError, showInfo } = useToast();
  
  // Profile data
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    canSwim: false,
    injuries: '',
    phone: '',
  });
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Photo states - simplified
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null); // From server
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null); // Local preview
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Stats
  const [attendances, setAttendances] = useState<ClassAttendance[]>([]);
  const [totalClasses, setTotalClasses] = useState(0);
  const [bestDay, setBestDay] = useState<string | null>(null);
  
  // Load profile data
  const loadProfile = useCallback(async () => {
    if (!session) return;
    
    try {
      setLoading(true);
      const token = (session as any)?.backendToken;
      
      // Load user profile
      const res = await fetch(`/api/users/profile`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      
      if (!res.ok) throw new Error("Failed to load profile");
      
      const data = await res.json();
      console.log('[Profile] Loaded:', data);
      
      setUserProfile({
        name: data.name || '',
        email: data.email || '',
        age: data.age || undefined,
        weight: data.weight || undefined,
        height: data.height || undefined,
        canSwim: data.canSwim || false,
        injuries: data.injuries || '',
        phone: data.phone || '',
      });
      
      // Set current photo from server
      setCurrentPhoto(data.profilePhoto || null);
      
      // Auto-enable editing if profile is incomplete
      if (!data.name || !data.age || !data.phone) {
        setIsEditing(true);
        showInfo('Completa tu perfil', 'Por favor completa la información faltante.');
      }
      
      // Load reservations
      try {
        const res2 = await fetch(`/api/reservations`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        
        if (res2.ok) {
          const reservations = await res2.json();
          processReservations(reservations);
        }
      } catch (e) {
        console.error('[Profile] Error loading reservations:', e);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading profile');
      showError('Error', 'No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  }, [session, showError, showInfo]);
  
  // Process reservations for stats
  const processReservations = (reservations: any[]) => {
    const byClass: Record<string, ClassAttendance> = {};
    const dayCount: Record<string, number> = {};
    
    reservations.forEach((r: any) => {
      const cls = r.class;
      if (!cls) return;
      
      const title = cls.title || 'Clase';
      const id = cls.id || 0;
      const date = cls.date ? new Date(cls.date) : null;
      const weekday = date ? date.toLocaleDateString(undefined, { weekday: 'long' }) : 'Desconocido';
      
      dayCount[weekday] = (dayCount[weekday] || 0) + 1;
      
      const key = String(id);
      if (!byClass[key]) {
        byClass[key] = { classId: id, title, count: 0, lastAttended: date?.toISOString() };
      }
      byClass[key].count += 1;
      if (date && (!byClass[key].lastAttended || new Date(byClass[key].lastAttended!) < date)) {
        byClass[key].lastAttended = date.toISOString();
      }
    });
    
    const attendanceList = Object.values(byClass).sort((a, b) => b.count - a.count);
    setAttendances(attendanceList);
    setTotalClasses(reservations.length);
    
    // Find best day
    let best: string | null = null;
    let bestNum = 0;
    for (const d in dayCount) {
      if (dayCount[d] > bestNum) {
        bestNum = dayCount[d];
        best = d;
      }
    }
    setBestDay(best);
  };
  
  // Handle photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log('[Profile] Photo selected:', file.name, file.size, 'bytes');
    
    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Imagen muy grande', 'El archivo no puede ser mayor a 5MB');
      e.target.value = '';
      return;
    }
    
    // Validate type
    if (!file.type.startsWith('image/')) {
      showError('Tipo inválido', 'Solo se permiten archivos de imagen');
      e.target.value = '';
      return;
    }
    
    setUploadingPhoto(true);
    
    // Read file
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      console.log('[Profile] Photo loaded, size:', result.length, 'chars');
      setPreviewPhoto(result);
      setPhotoFile(file);
      setUploadingPhoto(false);
      
      // Auto-enable editing
      if (!isEditing) {
        setIsEditing(true);
      }
      
      showInfo('Foto seleccionada', 'Haz clic en "Guardar Cambios" para actualizar tu foto');
    };
    
    reader.onerror = () => {
      showError('Error', 'No se pudo leer el archivo');
      setUploadingPhoto(false);
      e.target.value = '';
    };
    
    reader.readAsDataURL(file);
  };
  
  // Remove photo
  const handleRemovePhoto = () => {
    setPreviewPhoto(null);
    setPhotoFile(null);
    const input = document.getElementById('photo-input') as HTMLInputElement;
    if (input) input.value = '';
    
    if (!isEditing) {
      setIsEditing(true);
    }
    
    showInfo('Foto eliminada', 'Haz clic en "Guardar Cambios" para confirmar');
  };
  
  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setUserProfile(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };
  
  // Save profile
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('[Profile] ===== SAVING PROFILE =====');
    console.log('[Profile] Preview photo:', previewPhoto ? `${previewPhoto.length} chars` : 'null');
    console.log('[Profile] Photo file:', photoFile?.name || 'null');
    
    setSaving(true);
    setError(null);
    
    try {
      const token = (session as any)?.backendToken;
      
      // Prepare data
      const data: any = {
        ...userProfile,
        age: userProfile.age ? Number(userProfile.age) : null,
        weight: userProfile.weight ? Number(userProfile.weight) : null,
        height: userProfile.height ? Number(userProfile.height) : null,
        profilePhoto: previewPhoto || null, // Send preview or null to clear
      };
      
      console.log('[Profile] Sending data:', {
        ...data,
        profilePhoto: data.profilePhoto ? `${data.profilePhoto.length} chars` : 'null'
      });
      
      const res = await fetch(`/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to save profile');
      }
      
      const saved = await res.json();
      console.log('[Profile] Saved successfully:', {
        ...saved,
        profilePhoto: saved.profilePhoto ? `${saved.profilePhoto.length} chars` : 'null'
      });
      
      // Update current photo from server response
      setCurrentPhoto(saved.profilePhoto || null);
      setPreviewPhoto(null);
      setPhotoFile(null);
      
      // Update session
      await update({ name: userProfile.name });
      
      setIsEditing(false);
      showSuccess('Perfil actualizado', 'Tu información se ha guardado correctamente');
      
    } catch (err: any) {
      console.error('[Profile] Save error:', err);
      setError(err.message || 'Error al guardar');
      showError('Error', err.message || 'No se pudo guardar el perfil');
    } finally {
      setSaving(false);
    }
  };
  
  // Cancel editing
  const handleCancel = () => {
    // Reset photo preview
    setPreviewPhoto(null);
    setPhotoFile(null);
    const input = document.getElementById('photo-input') as HTMLInputElement;
    if (input) input.value = '';
    
    // Reload profile to reset all changes
    loadProfile();
    setIsEditing(false);
  };
  
  // Get recommendations
  const getRecommendations = () => {
    const recs: { text: string; type: 'warning' | 'tip' | 'info' }[] = [];
    
    // First time warnings
    if (totalClasses === 0) {
      recs.push({
        type: 'info',
        text: '¡Bienvenido! Prepárate para tu primera clase de surf. Es normal sentir nervios, ¡disfruta la experiencia!'
      });
      recs.push({
        type: 'tip',
        text: 'Qué traer: Traje de baño, toalla, bloqueador solar resistente al agua, y mucha energía positiva.'
      });
      if (!userProfile.canSwim) {
        recs.push({
          type: 'info',
          text: 'No sabes nadar: Nuestros instructores están capacitados para enseñarte en aguas poco profundas. ¡No te preocupes!'
        });
      }
    }
    
    // Warnings
    if (!userProfile.canSwim) {
      recs.push({
        type: 'warning',
        text: 'Importante: Informa a tu instructor que estás aprendiendo a nadar. Practicaremos en zonas seguras.'
      });
    }
    
    if (userProfile.injuries) {
      recs.push({
        type: 'warning',
        text: `Lesión reportada: ${userProfile.injuries}. Por favor, coméntalo con tu instructor antes de comenzar.`
      });
    }
    
    // Tips based on experience
    if (totalClasses >= 1 && totalClasses < 3) {
      recs.push({
        type: 'tip',
        text: 'Practica el pop-up en la arena 10 minutos por día. Esto mejorará tu técnica y confianza.'
      });
    } else if (totalClasses >= 3 && totalClasses < 10) {
      recs.push({
        type: 'tip',
        text: 'Trabaja en la postura trasera para mantener mejor la dirección y el control de la tabla.'
      });
    } else if (totalClasses >= 10) {
      recs.push({
        type: 'tip',
        text: 'Buen trabajo. Mantén la consistencia y sigue mejorando tu lectura de olas.'
      });
    }
    
    if (recs.length === 0) {
      recs.push({
        type: 'info',
        text: 'Sigue practicando y disfrutando del surf. Cada sesión es una oportunidad para mejorar.'
      });
    }
    
    return recs;
  };
  
  // Initial load
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    
    loadProfile();
  }, [session, status, router, loadProfile]);
  
  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }
  
  // Get display photo (preview > current > null)
  const displayPhoto = previewPhoto || currentPhoto;
  const recommendations = getRecommendations();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 pb-32">
        <div className="absolute inset-0">
          <svg className="absolute bottom-0 w-full h-20" viewBox="0 0 1440 120" fill="none">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="white"/>
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Mi Perfil de Surfista</h1>
            <p className="text-blue-100">Gestiona tu información y sigue tu progreso</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative -mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Photo Section */}
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-8 text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-white rounded-full overflow-hidden flex items-center justify-center shadow-lg mx-auto relative">
                    {uploadingPhoto ? (
                      <div className="flex items-center justify-center w-full h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : displayPhoto ? (
                      <Image
                        src={displayPhoto}
                        alt="Foto de perfil"
                        width={128}
                        height={128}
                        className="h-32 w-32 object-cover"
                        unoptimized
                      />
                    ) : userProfile.name ? (
                      <span className="text-4xl font-bold text-blue-600">
                        {userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    ) : (
                      <svg className="w-16 h-16 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                    
                    {/* Remove button */}
                    {displayPhoto && !uploadingPhoto && (
                      <button
                        onClick={handleRemovePhoto}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                        type="button"
                        title="Eliminar foto"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Camera button */}
                  <label
                    htmlFor="photo-input"
                    className={`absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg transition-colors ${
                      uploadingPhoto ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-50'
                    }`}
                    title="Cambiar foto"
                  >
                    {uploadingPhoto ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    ) : (
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </label>
                  <input
                    id="photo-input"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                </div>
                <h2 className="text-2xl font-bold text-white mt-4">{userProfile.name || 'Surfista'}</h2>
                <p className="text-blue-100 text-sm">{userProfile.email}</p>
                {photoFile && (
                  <p className="text-blue-100 text-xs mt-2 opacity-90">
                    📷 {photoFile.name}
                  </p>
                )}
              </div>
              
              {/* Stats */}
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Nivel</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {totalClasses === 0 ? 'Principiante' :
                       totalClasses < 5 ? 'Novato' :
                       totalClasses < 15 ? 'Intermedio' :
                       'Avanzado'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((totalClasses / 20) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{totalClasses}</div>
                    <div className="text-xs text-gray-600">Clases totales</div>
                  </div>
                  <div className="text-center p-4 bg-cyan-50 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-600">{bestDay || '—'}</div>
                    <div className="text-xs text-gray-600">Día favorito</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    userProfile.canSwim ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {userProfile.canSwim ? 'Sabe Nadar' : 'Aprendiendo'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Profile Form */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Información Personal</h3>
                <button
                  onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  type="button"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {isEditing ? 'Cancelar' : 'Editar'}
                </button>
              </div>
              
              <form onSubmit={handleSave} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                    <input
                      type="text"
                      id="name"
                      value={userProfile.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                      }`}
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={userProfile.email}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Edad</label>
                    <input
                      type="number"
                      id="age"
                      value={userProfile.age || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                      }`}
                      placeholder="Tu edad"
                      min="10"
                      max="100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                    <input
                      type="tel"
                      id="phone"
                      value={userProfile.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                      }`}
                      placeholder="+51 999 999 999"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Peso (kg)</label>
                    <input
                      type="number"
                      id="weight"
                      value={userProfile.weight || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                      }`}
                      placeholder="70"
                      min="30"
                      max="200"
                      step="0.1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Altura (cm)</label>
                    <input
                      type="number"
                      id="height"
                      value={userProfile.height || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                      }`}
                      placeholder="175"
                      min="100"
                      max="250"
                      step="0.1"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="canSwim"
                      checked={userProfile.canSwim}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="canSwim" className="ml-3 text-sm font-medium text-gray-700">
                      ¿Sabes nadar?
                    </label>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lesiones o Condiciones Médicas
                  </label>
                  <textarea
                    id="injuries"
                    value={userProfile.injuries}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Describe cualquier lesión previa o condición médica relevante..."
                  />
                </div>
                
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex">
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="ml-3 text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}
                
                {isEditing && (
                  <div className="mt-6 flex items-center justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Guardando...
                        </span>
                      ) : 'Guardar Cambios'}
                    </button>
                  </div>
                )}
              </form>
            </div>
            
            {/* Class History */}
            {attendances.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">Historial de Clases</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {attendances.map((attendance) => (
                      <div
                        key={attendance.classId}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{attendance.title}</h4>
                            <p className="text-sm text-gray-600">
                              Última clase: {attendance.lastAttended 
                                ? new Date(attendance.lastAttended).toLocaleDateString('es-ES', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })
                                : '—'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{attendance.count}</div>
                          <div className="text-sm text-gray-500">clases</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Recommendations */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Recomendaciones del Instructor</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recommendations.map((rec, idx) => {
                    const bgColor = rec.type === 'warning' ? 'bg-yellow-50' :
                                   rec.type === 'tip' ? 'bg-blue-50' : 'bg-green-50';
                    const iconColor = rec.type === 'warning' ? 'text-yellow-600' :
                                     rec.type === 'tip' ? 'text-blue-600' : 'text-green-600';
                    const icon = rec.type === 'warning' 
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      : rec.type === 'tip'
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
                    
                    return (
                      <div key={idx} className={`flex items-start space-x-3 p-4 rounded-lg ${bgColor}`}>
                        <svg className={`w-6 h-6 flex-shrink-0 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {icon}
                        </svg>
                        <p className="text-sm text-gray-700 flex-1">{rec.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
