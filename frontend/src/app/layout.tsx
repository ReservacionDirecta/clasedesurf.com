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
  other: {
    'mobile-web-app-capable': 'yes',
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
              // Protección ultra-agresiva contra errores de scripts externos
              (function() {
                'use strict';
                
                // Sobrescribir addEventListener en EventTarget y Element
                const originalAddEventListener = EventTarget.prototype.addEventListener;
                const safeAddEventListener = function(type, listener, options) {
                  try {
                    if (!this || (typeof this !== 'object' && typeof this !== 'function')) return;
                    return originalAddEventListener.call(this, type, listener, options);
                  } catch (e) {
                    return;
                  }
                };
                
                EventTarget.prototype.addEventListener = safeAddEventListener;
                if (window.Element) Element.prototype.addEventListener = safeAddEventListener;
                
                // Proteger selectores comunes
                const protect = (proto, method, fallback) => {
                  if (!proto || !proto[method]) return;
                  const original = proto[method];
                  proto[method] = function() {
                    try {
                      return original.apply(this, arguments);
                    } catch (e) {
                      return fallback;
                    }
                  };
                };
                
                protect(Document.prototype, 'querySelector', null);
                protect(Document.prototype, 'querySelectorAll', []);
                if (window.Element) {
                  protect(Element.prototype, 'querySelector', null);
                  protect(Element.prototype, 'querySelectorAll', []);
                  protect(Element.prototype, 'getElementById', null);
                }

                // Handler de errores global
                const isIgnorableError = (msg, src, stack) => {
                  const m = String(msg || '').toLowerCase();
                  const s = String(src || '').toLowerCase();
                  const t = String(stack || '').toLowerCase();
                  return m.includes('share-modal') || s.includes('share-modal') || t.includes('share-modal') ||
                         (m.includes('addeventlistener') && (m.includes('null') || m.includes('undefined')));
                };

                window.addEventListener('error', function(e) {
                  if (isIgnorableError(e.message, e.filename, e.error?.stack)) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }, true);

                window.addEventListener('unhandledrejection', function(e) {
                  if (isIgnorableError(e.reason?.message || e.reason)) {
                    e.preventDefault();
                  }
                }, true);

                // Silenciar en consola
                const orgError = console.error;
                console.error = function(...args) {
                  if (isIgnorableError(args.join(' '))) return;
                  return orgError.apply(console, args);
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