import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Providers from './providers'
import { NavigationWrapper } from '@/components/layout/NavigationWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Clase de Surf - Aprende Surf en Lima, Perú',
  description: 'Clases de surf para todos los niveles en las mejores playas de Lima, Perú. Instructores certificados y equipamiento incluido.',
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
              window.addEventListener('error', function(e) {
                if (e.message && e.message.includes('share-modal')) {
                  e.preventDefault();
                  console.warn('Script externo share-modal.js no disponible, ignorando error.');
                  return true;
                }
              }, true);
            `,
          }}
        />
        <Providers>
          <NavigationWrapper>
            {children}
          </NavigationWrapper>
        </Providers>
      </body>
    </html>
  )
}