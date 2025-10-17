'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useCrudOperations } from '@/hooks/useCrudOperations';
import { useApiCall } from '@/hooks/useApiCall';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import UserForm from '@/components/forms/UserForm';
import DataTable, { Column } from '@/components/tables/DataTable';
import { User } from '@/types';

export default function UsersManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
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
  } = useCrudOperations<User>({
    endpoint: '/api/users',
    onSuccess: (action) => {
      fetchUsers();
      if (action === 'create') {
        alert('Usuario creado exitosamente');
      } else if (action === 'update') {
        alert('Usuario actualizado exitosamente');
      } else if (action === 'delete') {
        alert('Usuario eliminado exitosamente');
      }
    },
    onError: (error) => {
      alert(`Error: ${error}`);
    }
  });

  // Wrapper function to match UserForm interface
  const handleUserSubmit = async (data: Partial<User>): Promise<void> => {
    await handleSubmit(data);
  };

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.role !== 'ADMIN') {
      router.push('/dashboard/student/profile');
      return;
    }

    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const result = await makeRequest('/api/users', { method: 'GET' });
      if (result.data) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'Nombre'
    },
    {
      key: 'email',
      label: 'Email'
    },
    {
      key: 'role',
      label: 'Rol',
      render: (item) => {
        const roleMap: Record<string, { label: string; color: string }> = {
          STUDENT: { label: 'Estudiante', color: 'bg-blue-100 text-blue-800' },
          INSTRUCTOR: { label: 'Instructor', color: 'bg-green-100 text-green-800' },
          SCHOOL_ADMIN: { label: 'Admin Escuela', color: 'bg-purple-100 text-purple-800' },
          ADMIN: { label: 'Administrador', color: 'bg-red-100 text-red-800' }
        };
        const roleInfo = roleMap[item.role] || { label: item.role, color: 'bg-gray-100 text-gray-800' };
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleInfo.color}`}>
            {roleInfo.label}
          </span>
        );
      }
    },
    {
      key: 'phone',
      label: 'Teléfono',
      render: (item) => item.phone || '-'
    },
    {
      key: 'age',
      label: 'Edad',
      render: (item) => item.age ? `${item.age} años` : '-'
    },
    {
      key: 'canSwim',
      label: '¿Sabe nadar?',
      render: (item) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          item.canSwim ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {item.canSwim ? 'Sí' : 'No'}
        </span>
      )
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
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <p className="text-gray-600 mt-1">Administra todos los usuarios del sistema</p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Usuario
            </button>
          </div>
        </div>

        {/* Users Table */}
        <DataTable
          data={users}
          columns={columns}
          onEdit={(item) => openEditModal(item)}
          onDelete={(item) => openDeleteDialog(item.id, item.name)}
          emptyMessage="No hay usuarios registrados. Crea el primer usuario para comenzar."
        />

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={selectedItem ? 'Editar Usuario' : 'Nuevo Usuario'}
          size="lg"
        >
          <UserForm
            user={selectedItem || undefined}
            onSubmit={handleUserSubmit}
            onCancel={closeModal}
            isLoading={isLoading}
          />
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={closeDeleteDialog}
          onConfirm={confirmDelete}
          title="Eliminar Usuario"
          message={`¿Estás seguro de que deseas eliminar al usuario "${itemToDelete?.name}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="danger"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}