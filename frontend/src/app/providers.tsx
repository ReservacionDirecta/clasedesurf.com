'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ToastProvider } from '@/contexts/ToastContext';
import { CookieProvider } from '@/contexts/CookieContext';
import ToastWrapper from '@/components/notifications/ToastWrapper';

interface Props {
  children: ReactNode;
}

export default function Providers({ children }: Props) {
  return (
    <SessionProvider>
      <CookieProvider>
        <ToastProvider>
          {children}
          <ToastWrapper />
        </ToastProvider>
      </CookieProvider>
    </SessionProvider>
  );
}
