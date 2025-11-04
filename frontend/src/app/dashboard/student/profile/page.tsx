"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User } from "@/types";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  type ClassAttendance = {
    classId: number;
    title: string;
    count: number;
    lastAttended?: string;
  };

  const [userProfile, setUserProfile] = useState<Partial<User>>({
    name: "",
    email: "",
    age: undefined,
    weight: undefined,
    height: undefined,
    canSwim: false,
    injuries: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // additional student stats
  const [attendances, setAttendances] = useState<ClassAttendance[]>([]);
  const [totalClasses, setTotalClasses] = useState(0);
  const [bestDay, setBestDay] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null); // data url preview

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = (session as any)?.backendToken;
      const res = await fetch(`/api/users/profile`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await res.json();
      setUserProfile({
        name: data.name || "",
        email: data.email || "",
        age: data.age || undefined,
        weight: data.weight || undefined,
        height: data.height || undefined,
        canSwim: data.canSwim || false,
        injuries: data.injuries || "",
        phone: data.phone || "",
      });

      try {
        const res2 = await fetch(`/api/reservations`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (res2.ok) {
          const reservations = await res2.json();
          const byClass: Record<string, ClassAttendance> = {};
          const dayCount: Record<string, number> = {};
          reservations.forEach((r: any) => {
            const cls = r.class;
            const title = cls?.title || "Clase";
            const id = cls?.id || 0;
            const date = cls?.date ? new Date(cls.date) : null;
            const weekday = date ? date.toLocaleDateString(undefined, { weekday: "long" }) : "Desconocido";
            dayCount[weekday] = (dayCount[weekday] || 0) + 1;
            const key = String(id);
            if (!byClass[key]) {
              byClass[key] = { classId: id, title, count: 0, lastAttended: date ? date.toISOString() : undefined };
            }
            byClass[key].count += 1;
            if (date && (!byClass[key].lastAttended || new Date(byClass[key].lastAttended!) < date)) {
              byClass[key].lastAttended = date.toISOString();
            }
          });
          const attendanceList = Object.values(byClass).sort((a, b) => b.count - a.count);
          setAttendances(attendanceList);
          const total = reservations.length;
          setTotalClasses(total);
          let best: string | null = null;
          let bestNum = 0;
          for (const d in dayCount) {
            if (dayCount[d] > bestNum) {
              bestNum = dayCount[d];
              best = d;
            }
          }
          setBestDay(best);
        }
      } catch (_e) {
        // ignore stats errors
      }
    } catch (err: any) {
      setError(err.message || "Error loading profile");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!session) {
      router.push("/login");
      return;
    }

    fetchProfile();
  }, [fetchProfile, router, session, status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type, checked } = e.target as HTMLInputElement;
    setUserProfile((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfilePhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const token = (session as any)?.backendToken;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      // Convert string values to appropriate types
      const profileData = {
        ...userProfile,
        age: userProfile.age ? Number(userProfile.age) : null,
        weight: userProfile.weight ? Number(userProfile.weight) : null,
        height: userProfile.height ? Number(userProfile.height) : null,
      };
      
      const res = await fetch(`/api/users/profile`, {
        method: "PUT",
        headers,
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setSuccess("Profile updated successfully!");
      // Optionally update the session if the name changed
      await update({ name: userProfile.name });
    } catch (err: any) {
      setError(err.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  // compute level (1-5) based on totalClasses
  function computeLevel(total: number) {
    // thresholds: 0-2 -> 1, 3-5 ->2, 6-9 ->3, 10-14 ->4, 15+ ->5
    if (total >= 15) return { level: 5, percent: 100 };
    if (total >= 10) return { level: 4, percent: Math.round(((total - 10) / 5) * 100) };
    if (total >= 6) return { level: 3, percent: Math.round(((total - 6) / 4) * 100) };
    if (total >= 3) return { level: 2, percent: Math.round(((total - 3) / 3) * 100) };
    return { level: 1, percent: Math.round((total / 3) * 100) };
  }

  // Generate simple teacher recommendations heuristically
  function teacherRecommendations() {
    const recs: string[] = [];
    if (!userProfile.canSwim) recs.push('Recomiendo tomar una clase de natación básica antes de próximas sesiones en el mar.');
    if (userProfile.injuries) recs.push('Tener cuidado con ejercicios que involucren:' + userProfile.injuries);
    if (totalClasses < 3) recs.push('Practicar pop-up en la arena 10 minutos por día.');
    if (totalClasses >= 3) recs.push('Excelente avance — trabajar en la postura trasera para mantener la dirección.');
    if (recs.length === 0) recs.push('Buen trabajo — mantener consistencia y asistir a clases regularmente.');
    return recs;
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation is now handled by layout */}
      
      {/* Header con wave */}
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
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-8 text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-white rounded-full overflow-hidden flex items-center justify-center shadow-lg mx-auto">
                    {profilePhoto ? (
                      <Image
                        src={profilePhoto}
                        alt="Profile preview"
                        width={128}
                        height={128}
                        className="h-32 w-32 object-cover"
                        unoptimized
                      />
                    ) : userProfile.name ? (
                      <span className="text-4xl font-bold text-blue-600">
                        {(userProfile.name || '').split(' ').map(n=>n[0]).join('').toUpperCase()}
                      </span>
                    ) : (
                      <svg className="w-16 h-16 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <label htmlFor="photo" className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                  <input id="photo" type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                </div>
                <h2 className="text-2xl font-bold text-white mt-4">{userProfile.name || 'Surfista'}</h2>
                <p className="text-blue-100 text-sm">{userProfile.email}</p>
              </div>
              
              <div className="p-6">
                {/* Level Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Nivel de Surf</span>
                    <span className="text-sm text-gray-500">Nivel {computeLevel(totalClasses).level}</span>
                  </div>
                  <LevelProgress total={totalClasses} />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{totalClasses}</div>
                    <div className="text-sm text-gray-600">Clases Totales</div>
                  </div>
                  <div className="text-center p-4 bg-cyan-50 rounded-xl">
                    <div className="text-2xl font-bold text-cyan-600">{bestDay || '—'}</div>
                    <div className="text-sm text-gray-600">Mejor Día</div>
                  </div>
                </div>

                {/* Swimming Badge */}
                <div className="mt-4 flex items-center justify-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    userProfile.canSwim 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {userProfile.canSwim ? 'Sabe Nadar' : 'Aprendiendo a Nadar'}
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
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {isEditing ? 'Cancelar' : 'Editar'}
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                    <input
                      type="text"
                      id="name"
                      value={userProfile.name || ''}
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
                      value={userProfile.email || ''}
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
                      value={userProfile.phone || ''}
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
                      checked={userProfile.canSwim || false}
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
                    value={userProfile.injuries || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Describe cualquier lesión previa o condición médica relevante..."
                  />
                </div>
                
                {/* Error/Success Messages */}
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
                
                {success && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex">
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="ml-3 text-sm text-green-700">{success}</p>
                    </div>
                  </div>
                )}
                
                {isEditing && (
                  <div className="mt-6 flex items-center justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Guardando...
                        </div>
                      ) : (
                        'Guardar Cambios'
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Class Attendance */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Historial de Clases</h3>
              </div>
              <div className="p-6">
                {attendances.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h2m0-13h10a2 2 0 012 2v11a2 2 0 01-2 2H9m0-13v13" />
                    </svg>
                    <p className="text-gray-500">Aún no has asistido a ninguna clase</p>
                    <p className="text-sm text-gray-400 mt-1">¡Reserva tu primera clase de surf!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {attendances.map((attendance) => (
                      <div key={attendance.classId} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{attendance.title}</h4>
                            <p className="text-sm text-gray-600">
                              Última clase: {attendance.lastAttended ? new Date(attendance.lastAttended).toLocaleDateString('es-ES', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              }) : '—'}
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
                )}
              </div>
            </div>

            {/* Teacher Recommendations */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Recomendaciones del Instructor</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {teacherRecommendations().map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// LevelProgress component
function LevelProgress({ total }: { total: number }) {
  const { level, percent } = (function computeLevel(total: number) {
    if (total >= 15) return { level: 5, percent: 100 };
    if (total >= 10) return { level: 4, percent: Math.round(((total - 10) / 5) * 100) };
    if (total >= 6) return { level: 3, percent: Math.round(((total - 6) / 4) * 100) };
    if (total >= 3) return { level: 2, percent: Math.round(((total - 3) / 3) * 100) };
    return { level: 1, percent: Math.round((total / 3) * 100) };
  })(total);

  const getLevelName = (level: number) => {
    const levels = ['', 'Principiante', 'Intermedio', 'Avanzado', 'Experto', 'Pro'];
    return levels[level] || 'Principiante';
  };

  const getLevelColor = (level: number) => {
    const colors = ['', 'from-green-400 to-green-600', 'from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-orange-400 to-orange-600', 'from-red-400 to-red-600'];
    return colors[level] || 'from-gray-400 to-gray-600';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{getLevelName(level)}</span>
        <span className="text-sm text-gray-500">{percent}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${getLevelColor(level)} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Nivel {level}</span>
        <span>Siguiente: {level < 5 ? `Nivel ${level + 1}` : 'Máximo'}</span>
      </div>
    </div>
  );
}
