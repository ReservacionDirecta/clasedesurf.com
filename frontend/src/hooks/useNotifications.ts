'use client';

import { useCallback } from 'react';
import { useToast } from '@/contexts/ToastContext';

/**
 * Hook helper para facilitar el uso de notificaciones
 * Proporciona métodos convenientes para mostrar diferentes tipos de notificaciones
 */
export function useNotifications() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const notifySuccess = useCallback((message: string, details?: string) => {
    showSuccess('Éxito', message, details ? undefined : 5000);
    if (details) {
      // Si hay detalles, mostrar un segundo toast con más información
      setTimeout(() => {
        showInfo('Detalles', details, 3000);
      }, 100);
    }
  }, [showSuccess, showInfo]);

  const notifyError = useCallback((message: string, details?: string) => {
    showError('Error', message, details ? undefined : 6000);
    if (details) {
      setTimeout(() => {
        showError('Detalles del error', details, 4000);
      }, 100);
    }
  }, [showError]);

  const notifyWarning = useCallback((message: string, details?: string) => {
    showWarning('Advertencia', message, details ? undefined : 5000);
    if (details) {
      setTimeout(() => {
        showInfo('Información adicional', details, 3000);
      }, 100);
    }
  }, [showWarning, showInfo]);

  const notifyInfo = useCallback((message: string, details?: string) => {
    showInfo('Información', message, details ? undefined : 4000);
    if (details) {
      setTimeout(() => {
        showInfo('Detalles', details, 3000);
      }, 100);
    }
  }, [showInfo]);

  /**
   * Muestra un mensaje de éxito para operaciones completadas
   */
  const success = useCallback((message: string) => {
    showSuccess('Operación exitosa', message);
  }, [showSuccess]);

  /**
   * Muestra un mensaje de error para operaciones fallidas
   */
  const error = useCallback((message: string, errorDetails?: string) => {
    showError('Error', message, errorDetails ? undefined : 6000);
    if (errorDetails) {
      console.error('Error details:', errorDetails);
    }
  }, [showError]);

  /**
   * Muestra un mensaje de advertencia
   */
  const warning = useCallback((message: string) => {
    showWarning('Advertencia', message);
  }, [showWarning]);

  /**
   * Muestra un mensaje informativo
   */
  const info = useCallback((message: string) => {
    showInfo('Información', message);
  }, [showInfo]);

  /**
   * Maneja errores de forma consistente
   */
  const handleError = useCallback((err: unknown, defaultMessage = 'Ocurrió un error inesperado') => {
    const message = err instanceof Error ? err.message : String(err);
    error(message || defaultMessage);
    console.error('Error handled:', err);
  }, [error]);

  /**
   * Muestra un mensaje de carga (info con duración extendida)
   */
  const loading = useCallback((message: string) => {
    showInfo('Cargando...', message, 0); // 0 = no se cierra automáticamente
  }, [showInfo]);

  return {
    // Métodos con nombres descriptivos
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    // Métodos cortos
    success,
    error,
    warning,
    info,
    // Utilidades
    handleError,
    loading,
  };
}

