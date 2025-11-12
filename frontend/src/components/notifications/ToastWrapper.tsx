'use client';

import { useToast } from '@/contexts/ToastContext';
import ToastContainer from './ToastContainer';

export default function ToastWrapper() {
  const { toasts, removeToast } = useToast();
  return <ToastContainer toasts={toasts} onClose={removeToast} />;
}

