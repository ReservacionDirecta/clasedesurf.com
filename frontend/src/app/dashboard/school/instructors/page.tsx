"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Users, Plus, Edit, Trash2, Mail, Phone, Star, Award } from 'lucide-react';
import SimpleInstructorForm from '@/components/forms/SimpleInstructorForm';
import Image from 'next/image';
import InstructorForm from '@/components/forms/InstructorForm';

interface Instructor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  specialties?: string[];
  rating?: number;
  totalClasses?: number;
  profileImage?: string;
  // Campos para edición
  userId?: number;
  bio?: string;
  yearsExperience?: number;
  certifications?: string[];
  isActive?: boolean;
}

export default function InstructorsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Instructor | null>(null);

  const fetchInstructors = useCallback(async () => {
    try {
      setLoading(true);
      const token = (session as any)?.backendToken;
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch('/api/instructors', { headers });
      if (response.ok) {
        const data = await response.json();
        const normalized = Array.isArray(data)
          ? data.map((it: any) => ({
              id: it.id,
              name: it.user?.name ?? it.name ?? 'Instructor',
              email: it.user?.email ?? it.email ?? '',
              phone: it.user?.phone ?? it.phone,
              specialties: it.specialties ?? [],
              rating: it.rating ?? 0,
              totalClasses: it.totalClasses ?? 0,
              profileImage: it.profileImage ?? undefined,
              userId: it.userId ?? it.user?.id,
              bio: it.bio ?? '',
              yearsExperience: it.yearsExperience ?? 0,
              certifications: it.certifications ?? [],
              isActive: it.isActive ?? true
            }))
          : [];
        setInstructors(normalized);
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    if (session.user?.role !== 'SCHOOL_ADMIN') {
      router.push('/dashboard/student/profile');
      return;
    }
    fetchInstructors();
  }, [session, status, router, fetchInstructors]);

  const handleCreateInstructor = async (payload: any) => {
    try {
      setIsCreating(true);
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/instructors', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'No se pudo crear el instructor');
      }
      await fetchInstructors();
      setShowCreateModal(false);
    } finally {
      setIsCreating(false);
    }
  };

  const openEdit = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setShowEditModal(true);
  };

  const handleUpdateInstructor = async (data: Partial<Instructor>) => {
    if (!selectedInstructor) return;
    try {
      setIsUpdating(true);
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/instructors/${selectedInstructor.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'No se pudo actualizar el instructor');
      }
      await fetchInstructors();
      setShowEditModal(false);
      setSelectedInstructor(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmDelete = (instructor: Instructor) => {
    setDeleteTarget(instructor);
  };

  const handleDeleteInstructor = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const token = (session as any)?.backendToken;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/instructors/${deleteTarget.id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok && res.status !== 204) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'No se pudo eliminar el instructor');
      }
      await fetchInstructors();
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando instructores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20 sm:pb-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.push('/dashboard/school')}
            className="text-blue-600 hover:text-blue-800 mb-3 sm:mb-4 flex items-center text-sm sm:text-base"
          >
            ← Volver al Dashboard
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Gestión de Instructores</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Administra el equipo de instructores de tu escuela</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Nuevo Instructor</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex items-center">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              <div className="ml-2 sm:ml-4 min-w-0">
                <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-gray-900 truncate">Total</h3>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-blue-600">{instructors.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex items-center">
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 flex-shrink-0" />
              <div className="ml-2 sm:ml-4 min-w-0">
                <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-gray-900 truncate">Rating</h3>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-yellow-600">4.8</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex items-center">
              <Award className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
              <div className="ml-2 sm:ml-4 min-w-0">
                <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-gray-900 truncate">Activos</h3>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-green-600">{instructors.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex items-center">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
              <div className="ml-2 sm:ml-4 min-w-0">
                <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-gray-900 truncate">Clases</h3>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-purple-600">156</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructors List */}
        <div className="space-y-4 sm:space-y-6">
          {instructors.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay instructores</h3>
              <p className="text-gray-600 mb-4">Agrega tu primer instructor para comenzar</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Agregar Instructor
              </button>
            </div>
          ) : (
            instructors.map((instructor) => (
              <div key={instructor.id} className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                    {instructor.profileImage ? (
                      <Image
                        src={instructor.profileImage}
                        alt={instructor.name}
                        width={64}
                        height={64}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                      </div>
                    )}
                    
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{instructor.name}</h3>
                      
                      <div className="flex flex-col gap-1 mt-2">
                        <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{instructor.email}</span>
                        </div>
                        
                        {instructor.phone && (
                          <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                            <span>{instructor.phone}</span>
                          </div>
                        )}
                      </div>

                      {instructor.specialties && instructor.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {instructor.specialties.map((specialty, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2 sm:gap-3">
                    <button
                      onClick={() => openEdit(instructor)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs sm:text-sm"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">Editar</span>
                      <span className="sm:hidden">Edit</span>
                    </button>
                    <button
                      onClick={() => confirmDelete(instructor)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs sm:text-sm"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">Eliminar</span>
                      <span className="sm:hidden">Del</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <SimpleInstructorForm
                onSubmit={handleCreateInstructor}
                onCancel={() => setShowCreateModal(false)}
                isLoading={isCreating}
              />
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedInstructor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg sm:text-xl font-bold mb-4">Editar Instructor</h3>
              <InstructorForm
                instructor={{
                  // Adaptar al contrato del formulario
                  id: selectedInstructor.id as any,
                  userId: selectedInstructor.userId as any,
                  bio: selectedInstructor.bio,
                  yearsExperience: selectedInstructor.yearsExperience,
                  specialties: selectedInstructor.specialties,
                  certifications: selectedInstructor.certifications,
                  isActive: selectedInstructor.isActive
                } as any}
                onSubmit={handleUpdateInstructor}
                onCancel={() => setShowEditModal(false)}
                isLoading={isUpdating}
                userRole={(session as any)?.user?.role}
                mode="complete"
              />
            </div>
          </div>
        )}

        {/* Delete Confirm Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar Instructor</h3>
              <p className="text-gray-600 mb-4">
                ¿Seguro que deseas eliminar a <span className="font-semibold">{deleteTarget.name}</span>? Esta acción desactivará su perfil.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteInstructor}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
