'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ToastProvider } from '@/contexts/ToastContext';
import ToastWrapper from '@/components/notifications/ToastWrapper';

interface Props {
  children: ReactNode;
}

export default function Providers({ children }: Props) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
        <ToastWrapper />
      </ToastProvider>
    </SessionProvider>
  );
}
