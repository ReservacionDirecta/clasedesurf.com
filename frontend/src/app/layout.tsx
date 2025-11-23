import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Providers from './providers'
import { NavigationWrapper } from '@/components/layout/NavigationWrapper'
import CookieBanner from '@/components/cookies/CookieBanner'
import CookiePreferences from '@/components/cookies/CookiePreferences'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Clase de Surf - Aprende Surf en Lima, Perú',
  description: 'Clases de surf para todos los niveles en las mejores playas de Lima, Perú. Instructores certificados y equipamiento incluido.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    viewportFit: 'cover', // Para iOS safe area
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Script
          id="error-handler"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Protección contra errores de scripts externos (como share-modal.js)
              (function() {
                // Interceptar errores antes de que se propaguen
                const originalAddEventListener = EventTarget.prototype.addEventListener;
                EventTarget.prototype.addEventListener = function(type, listener, options) {
                  try {
                    // Verificar si this es null o undefined antes de llamar
                    if (this === null || this === undefined) {
                      console.warn('Intento de addEventListener en objeto null/undefined ignorado');
                      return;
                    }
                    // Verificar si this es un objeto válido
                    if (typeof this !== 'object') {
                      console.warn('Intento de addEventListener en tipo inválido ignorado');
                      return;
                    }
                    return originalAddEventListener.call(this, type, listener, options);
                  } catch (e) {
                    // Silenciar errores relacionados con addEventListener
                    const errorMsg = e?.message || String(e || '');
                    if (errorMsg.includes('addEventListener') || 
                        errorMsg.includes('null') || 
                        errorMsg.includes('Cannot read properties')) {
                      console.warn('Error en addEventListener capturado y silenciado:', errorMsg);
                      return;
                    }
                    // Re-lanzar otros errores
                    throw e;
                  }
                };
                
                // Manejar errores globales de forma más agresiva
                const errorHandler = function(e) {
                  const errorMessage = e.message || '';
                  const errorSource = e.filename || e.source || '';
                  const errorStack = e.error?.stack || '';
                  
                  // Verificar si el error está relacionado con share-modal o addEventListener null
                  if (errorMessage.includes('share-modal') || 
                      errorSource.includes('share-modal') ||
                      errorStack.includes('share-modal') ||
                      (errorMessage.includes('addEventListener') && (errorMessage.includes('null') || errorMessage.includes('Cannot read properties'))) ||
                      (errorMessage.includes('Cannot read properties') && errorMessage.includes('addEventListener'))) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    console.warn('Error de script externo capturado y silenciado:', errorMessage);
                    return true;
                  }
                };
                
                // Registrar el handler con capture para atrapar errores temprano
                window.addEventListener('error', errorHandler, true);
                
                // También capturar errores no capturados
                window.addEventListener('unhandledrejection', function(e) {
                  const reason = e.reason?.message || String(e.reason || '');
                  if (reason.includes('share-modal') || 
                      reason.includes('addEventListener')) {
                    e.preventDefault();
                    console.warn('Promise rejection de script externo ignorada:', reason);
                    return true;
                  }
                });
              })();
            `,
          }}
        />
        <Providers>
          <NavigationWrapper>
            {children}
          </NavigationWrapper>
          <CookieBanner />
          <CookiePreferences />
        </Providers>
      </body>
    </html>
  )
}