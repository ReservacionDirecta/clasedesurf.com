'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastType } from '@/components/notifications/Toast';

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  showSuccess: (title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string, duration?: number) => void;
  showWarning: (title: string, message?: string, duration?: number) => void;
  showInfo: (title: string, message?: string, duration?: number) => void;
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, title: string, message?: string, duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, type, title, message, duration };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    showToast('success', title, message, duration);
  }, [showToast]);

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    showToast('error', title, message, duration);
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    showToast('warning', title, message, duration);
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    showToast('info', title, message, duration);
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        toasts,
        removeToast,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

