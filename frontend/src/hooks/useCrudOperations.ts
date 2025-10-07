'use client';

import { useState, useCallback } from 'react';
import { useApiCall } from './useApiCall';

interface CrudOperationsOptions {
  endpoint: string;
  onSuccess?: (action: 'create' | 'update' | 'delete', data?: any) => void;
  onError?: (error: string) => void;
}

export function useCrudOperations<T = any>({ endpoint, onSuccess, onError }: CrudOperationsOptions) {
  const { makeRequest } = useApiCall<T>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Create
  const handleCreate = useCallback(async (data: Partial<T>) => {
    setIsLoading(true);
    try {
      const result = await makeRequest(endpoint, {
        method: 'POST',
        body: data,
        showLoading: false
      });

      if (result.error) {
        onError?.(result.error);
        return false;
      }

      onSuccess?.('create', result.data);
      setIsModalOpen(false);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear';
      onError?.(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, makeRequest, onSuccess, onError]);

  // Update
  const handleUpdate = useCallback(async (id: number, data: Partial<T>) => {
    setIsLoading(true);
    try {
      const result = await makeRequest(`${endpoint}/${id}`, {
        method: 'PUT',
        body: data,
        showLoading: false
      });

      if (result.error) {
        onError?.(result.error);
        return false;
      }

      onSuccess?.('update', result.data);
      setIsModalOpen(false);
      setSelectedItem(null);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar';
      onError?.(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, makeRequest, onSuccess, onError]);

  // Delete
  const handleDelete = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      const result = await makeRequest(`${endpoint}/${id}`, {
        method: 'DELETE',
        showLoading: false
      });

      if (result.error) {
        onError?.(result.error);
        return false;
      }

      onSuccess?.('delete', { id });
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar';
      onError?.(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, makeRequest, onSuccess, onError]);

  // Modal handlers
  const openCreateModal = useCallback(() => {
    setSelectedItem(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((item: T) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    if (!isLoading) {
      setIsModalOpen(false);
      setSelectedItem(null);
    }
  }, [isLoading]);

  // Delete dialog handlers
  const openDeleteDialog = useCallback((id: number, name: string) => {
    setItemToDelete({ id, name });
    setIsDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (!isLoading) {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  }, [isLoading]);

  const confirmDelete = useCallback(async () => {
    if (itemToDelete) {
      await handleDelete(itemToDelete.id);
    }
  }, [itemToDelete, handleDelete]);

  // Submit handler (create or update)
  const handleSubmit = useCallback(async (data: Partial<T>) => {
    if (selectedItem && 'id' in selectedItem) {
      return await handleUpdate((selectedItem as any).id, data);
    } else {
      return await handleCreate(data);
    }
  }, [selectedItem, handleCreate, handleUpdate]);

  return {
    // State
    isModalOpen,
    isDeleteDialogOpen,
    selectedItem,
    itemToDelete,
    isLoading,
    
    // Handlers
    handleSubmit,
    handleDelete,
    openCreateModal,
    openEditModal,
    closeModal,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete
  };
}
