'use client';

import React from 'react';
import ToastComponent, { Toast } from './Toast';

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div 
      className="
        fixed top-4 right-4 z-[9999] 
        space-y-3 pointer-events-none
        max-w-sm w-full sm:w-auto
        px-4 sm:px-0
        safe-area-top
      "
      style={{
        top: 'max(1rem, env(safe-area-inset-top, 0px))',
        right: 'max(1rem, env(safe-area-inset-right, 0px))',
      }}
      aria-live="polite"
      aria-label="Notificaciones"
    >
      <div className="pointer-events-auto space-y-3">
        {toasts.map((toast) => (
          <ToastComponent key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;

