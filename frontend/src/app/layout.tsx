import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Providers from './providers'
import { NavigationWrapper } from '@/components/layout/NavigationWrapper'
import CookieBanner from '@/components/cookies/CookieBanner'
import CookiePreferences from '@/components/cookies/CookiePreferences'
import { ExchangeRateInitializer } from '@/components/currency/ExchangeRateInitializer'

const inter = Inter({ subsets: ['latin'] })

// Viewport configuration - separate export for Next.js 14+
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true, // Allow user to zoom if needed
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Clase de Surf - Aprende Surf en Lima, Perú',
  description: 'Clases de surf para todos los niveles en las mejores playas de Lima, Perú. Instructores certificados y equipamiento incluido.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Clase de Surf',
  },
  formatDetection: {
    telephone: false,
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
                'use strict';
                
                // Interceptar errores ANTES de que se ejecuten los scripts
                const originalAddEventListener = EventTarget.prototype.addEventListener;
                
                // Sobrescribir addEventListener para prevenir errores con null
                EventTarget.prototype.addEventListener = function(type, listener, options) {
                  try {
                    // Verificar si this es null o undefined
                    if (this === null || this === undefined) {
                      return; // Silenciosamente ignorar
                    }
                    // Verificar si this es un objeto válido
                    if (typeof this !== 'object' && typeof this !== 'function') {
                      return; // Silenciosamente ignorar
                    }
                    // Intentar llamar al método original
                    return originalAddEventListener.call(this, type, listener, options);
                  } catch (e) {
                    // Silenciar todos los errores relacionados con addEventListener
                      return;
                    }
                };
                
                // Interceptar querySelector y querySelectorAll para prevenir errores
                const originalQuerySelector = Document.prototype.querySelector;
                const originalQuerySelectorAll = Document.prototype.querySelectorAll;
                
                // Proteger querySelector
                Document.prototype.querySelector = function(selector) {
                  try {
                    return originalQuerySelector.call(this, selector);
                  } catch (e) {
                    return null;
                  }
                };
                
                // Proteger querySelectorAll
                Document.prototype.querySelectorAll = function(selector) {
                  try {
                    return originalQuerySelectorAll.call(this, selector);
                  } catch (e) {
                    return [];
                  }
                };
                
                // También proteger en Element
                if (Element.prototype.querySelector) {
                  const originalElementQuerySelector = Element.prototype.querySelector;
                  Element.prototype.querySelector = function(selector) {
                    try {
                      return originalElementQuerySelector.call(this, selector);
                    } catch (e) {
                      return null;
                    }
                  };
                }
                
                if (Element.prototype.querySelectorAll) {
                  const originalElementQuerySelectorAll = Element.prototype.querySelectorAll;
                  Element.prototype.querySelectorAll = function(selector) {
                    try {
                      return originalElementQuerySelectorAll.call(this, selector);
                    } catch (e) {
                      return [];
                    }
                  };
                }
                
                // Manejar errores globales de forma más agresiva
                const errorHandler = function(e) {
                  const errorMessage = e.message || '';
                  const errorSource = e.filename || e.source || e.target?.src || '';
                  const errorStack = e.error?.stack || '';
                  
                  // Verificar si el error está relacionado con share-modal o addEventListener null
                  const isShareModalError = 
                    errorMessage.includes('share-modal') || 
                      errorSource.includes('share-modal') ||
                    errorStack.includes('share-modal');
                  
                  const isAddEventListenerError = 
                    (errorMessage.includes('addEventListener') && 
                     (errorMessage.includes('null') || 
                      errorMessage.includes('Cannot read properties') ||
                      errorMessage.includes('undefined'))) ||
                    (errorMessage.includes('Cannot read properties') && 
                     errorMessage.includes('addEventListener'));
                  
                  if (isShareModalError || isAddEventListenerError) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return true; // Prevenir que el error se propague
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
                    return true;
                  }
                });
                
                // Interceptar console.error para filtrar estos errores específicos
                const originalConsoleError = console.error;
                console.error = function(...args) {
                  const message = args.join(' ');
                  if (message.includes('share-modal') && 
                      (message.includes('addEventListener') || 
                       message.includes('Cannot read properties'))) {
                    return; // No mostrar este error en consola
                  }
                  return originalConsoleError.apply(console, args);
                };
              })();
            `,
          }}
        />
        <Providers>
          <ExchangeRateInitializer />
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