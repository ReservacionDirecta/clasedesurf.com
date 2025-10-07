'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Plus, Star, Users, Award } from 'lucide-react';
import { useCrudOperations } from '@/hooks/useCrudOperations';
import { useApiCall } from '@/hooks/useApiCall';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import InstructorForm from '@/components/forms/InstructorForm';
import SimpleInstructorForm from '@/components/forms/SimpleInstructorForm';
import DataTable, { Column } from '@/components/tables/DataTable';
import InstructorPermissions from '@/components/instructors/InstructorPermissions';
import { Instructor } from '@/types';

export default function InstructorsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [schoolName, setSchoolName] = useState<string>('');
  const [createMode, setCreateMode] = useState<'simple' | 'complete'>('simple');
  const { makeRequest } = useApiCall();

  const {
    isModalOpen,
    isDeleteDialogOpen,
    selectedItem,
    itemToDelete,
    isLoading,
    handleSubmit,
    openCreateModal,
    openEditModal,
    closeModal,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete
  } = useCrudOperations<Instructor>({
    endpoint: '/api/instructors',
    onSuccess: (action) => {
      fetchInstructors();
      if (action === 'create') {
        alert('Instructor creado exitosamente');
      } else if (action === 'update') {
        alert('Instructor actualizado exitosamente');
      } else if (action === 'delete') {
        alert('Instructor eliminado exitosamente');
      }
    },
    onError: (error) => {
      alert(`Error: ${error}`);
    }
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.role !== 'SCHOOL_ADMIN' && session.user?.role !== 'ADMIN') {
      router.push('/dashboard/student/profile');
      return;
    }

    fetchSchoolAndInstructors();
  }, [session, status, router]);

  const fetchSchoolAndInstructors = async () => {
    try {
      // Si es SCHOOL_ADMIN, obtener su escuela
      if (session?.user?.role === 'SCHOOL_ADMIN') {
        const schoolResult = await makeRequest('/api/schools/my-school', { method: 'GET' });
        if (schoolResult.data) {
          setSchoolId(schoolResult.data.id);
          setSchoolName(schoolResult.data.name);
        }
      }
      
      await fetchInstructors();
    } catch (error) {
      console.error('Error fetching school:', error);
    }
  };

  const fetchInstructors = async () => {
    try {
      // Para SCHOOL_ADMIN, el backend automáticamente filtra por su escuela
      // Para ADMIN, puede ver todos los instructores
      const result = await makeRequest('/api/instructors', { method: 'GET' });
      if (result.data) {
        setInstructors(result.data);
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
      // Si hay error de permisos, mostrar mensaje apropiado
      if (error instanceof Error && error.message.includes('403')) {
        alert('No tienes permisos para ver instructores de otras escuelas');
      }
    }
  };

  const handleSimpleCreate = async (data: any) => {
    try {
      const result = await makeRequest('/api/instructors/create-simple', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      if (result.data) {
        await fetchInstructors();
        alert('Instructor creado exitosamente. Se ha enviado un email de bienvenida.');
      }
    } catch (error) {
      console.error('Error creating instructor:', error);
      throw error;
    }
  };

  const openCreateModalSimple = () => {
    setCreateMode('simple');
    openCreateModal();
  };

  const openCreateModalComplete = () => {
    setCreateMode('complete');
    openCreateModal();
  };

  const columns: Column<Instructor>[] = [
    {
      key: 'user',
      label: 'Instructor',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{item.user?.name || 'N/A'}</div>
            <div className="text-sm text-gray-500">{item.user?.email || 'N/A'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'yearsExperience',
      label: 'Experiencia',
      render: (item) => `${item.yearsExperience} años`
    },
    {
      key: 'specialties',
      label: 'Especialidades',
      render: (item) => (
        <div className="max-w-xs">
          {item.specialties && item.specialties.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {item.specialties.slice(0, 2).map((specialty, index) => (
                <span
                  key={index}
                  className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                >
                  {specialty}
                </span>
              ))}
              {item.specialties.length > 2 && (
                <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  +{item.specialties.length - 2}
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-400">Sin especialidades</span>
          )}
        </div>
      )
    },
    {
      key: 'certifications',
      label: 'Certificaciones',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-green-600" />
          <span className="text-sm">
            {item.certifications?.length || 0} certificaciones
          </span>
        </div>
      )
    },
    {
      key: 'rating',
      label: 'Calificación',
      render: (item) => (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="font-medium">
            {item.rating > 0 ? item.rating.toFixed(1) : 'N/A'}
          </span>
          <span className="text-sm text-gray-500">
            ({item.totalReviews} reseñas)
          </span>
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'Estado',
      render: (item) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          item.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {item.isActive ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      key: 'school',
      label: 'Escuela',
      render: (item) => item.school?.name || 'N/A'
    }
  ];

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Instructores</h1>
              <p className="text-gray-600 mt-1">
                Administra el equipo de instructores de {session?.user?.role === 'SCHOOL_ADMIN' ? 'tu escuela' : 'todas las escuelas'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={openCreateModalSimple}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Crear Instructor
              </button>
              <button
                onClick={openCreateModalComplete}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Crear Completo
              </button>
            </div>
          </div>
        </div>

        {/* Permissions Info */}
        <InstructorPermissions 
          schoolName={schoolName}
          totalInstructors={instructors.length}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total</h3>
                <p className="text-3xl font-bold text-blue-600">{instructors.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Activos</h3>
                <p className="text-3xl font-bold text-green-600">
                  {instructors.filter(i => i.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Calificación Promedio</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {instructors.length > 0 
                    ? (instructors.reduce((sum, i) => sum + i.rating, 0) / instructors.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Experiencia Promedio</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {instructors.length > 0 
                    ? Math.round(instructors.reduce((sum, i) => sum + i.yearsExperience, 0) / instructors.length)
                    : 0
                  } años
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructors Table */}
        <DataTable
          data={instructors}
          columns={columns}
          onEdit={(item) => openEditModal(item)}
          onDelete={(item) => openDeleteDialog(item.id, item.user?.name || 'Instructor')}
          emptyMessage="No hay instructores registrados. Crea el primer instructor para comenzar."
        />

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={
            selectedItem 
              ? 'Editar Instructor' 
              : createMode === 'simple' 
                ? 'Crear Instructor Rápido' 
                : 'Crear Instructor Completo'
          }
          size="lg"
        >
          {selectedItem || createMode === 'complete' ? (
            <InstructorForm
              instructor={selectedItem || undefined}
              onSubmit={handleSubmit}
              onCancel={closeModal}
              isLoading={isLoading}
              userRole={session?.user?.role}
            />
          ) : (
            <SimpleInstructorForm
              onSubmit={handleSimpleCreate}
              onCancel={closeModal}
              isLoading={isLoading}
            />
          )}
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={closeDeleteDialog}
          onConfirm={confirmDelete}
          title="Eliminar Instructor"
          message={`¿Estás seguro de que deseas eliminar al instructor "${itemToDelete?.name}"? Esta acción no se puede deshacer y afectará las clases asignadas.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="danger"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}