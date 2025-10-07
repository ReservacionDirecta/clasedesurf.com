'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useCrudOperations } from '@/hooks/useCrudOperations';
import { useApiCall } from '@/hooks/useApiCall';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ClassForm from '@/components/forms/ClassForm';
import DataTable, { Column } from '@/components/tables/DataTable';
import { Class } from '@/types';

export default function ClassesManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [schoolId, setSchoolId] = useState<number | null>(null);
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
  } = useCrudOperations<Class>({
    endpoint: '/api/classes',
    onSuccess: (action) => {
      fetchClasses();
      if (action === 'create') {
        alert('Clase creada exitosamente');
      } else if (action === 'update') {
        alert('Clase actualizada exitosamente');
      } else if (action === 'delete') {
        alert('Clase eliminada exitosamente');
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

    if (session.user?.role !== 'SCHOOL_ADMIN') {
      router.push('/dashboard/student/profile');
      return;
    }

    fetchSchoolAndClasses();
  }, [session, status, router]);

  const fetchSchoolAndClasses = async () => {
    try {
      const schoolResult = await makeRequest('/api/schools/my-school', { method: 'GET' });
      
      if (schoolResult.error || !schoolResult.data) {
        router.push('/dashboard/school');
        return;
      }

      setSchoolId(schoolResult.data.id);
      await fetchClasses();
    } catch (error) {
      console.error('Error fetching school:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const result = await makeRequest('/api/classes', { method: 'GET' });
      if (result.data) {
        setClasses(result.data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const columns: Column<Class>[] = [
    {
      key: 'title',
      label: 'Título'
    },
    {
      key: 'date',
      label: 'Fecha',
      render: (item) => new Date(item.date).toLocaleString('es-ES', {
        dateStyle: 'short',
        timeStyle: 'short'
      })
    },
    {
      key: 'level',
      label: 'Nivel',
      render: (item) => {
        const levelMap: Record<string, string> = {
          BEGINNER: 'Principiante',
          INTERMEDIATE: 'Intermedio',
          ADVANCED: 'Avanzado'
        };
        return (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            {levelMap[item.level] || item.level}
          </span>
        );
      }
    },
    {
      key: 'duration',
      label: 'Duración',
      render: (item) => `${item.duration} min`
    },
    {
      key: 'capacity',
      label: 'Capacidad'
    },
    {
      key: 'price',
      label: 'Precio',
      render: (item) => `$${item.price.toFixed(2)}`
    },
    {
      key: 'instructor',
      label: 'Instructor',
      render: (item) => item.instructor || '-'
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
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Clases</h1>
              <p className="text-gray-600 mt-1">Administra las clases de tu escuela</p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nueva Clase
            </button>
          </div>
        </div>

        {/* Classes Table */}
        <DataTable
          data={classes}
          columns={columns}
          onEdit={(item) => openEditModal(item)}
          onDelete={(item) => openDeleteDialog(item.id, item.title)}
          emptyMessage="No hay clases creadas. Crea tu primera clase para comenzar."
        />

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={selectedItem ? 'Editar Clase' : 'Nueva Clase'}
          size="lg"
        >
          <ClassForm
            classData={selectedItem || undefined}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            isLoading={isLoading}
          />
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={closeDeleteDialog}
          onConfirm={confirmDelete}
          title="Eliminar Clase"
          message={`¿Estás seguro de que deseas eliminar la clase "${itemToDelete?.name}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="danger"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
