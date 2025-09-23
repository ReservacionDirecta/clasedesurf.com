import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

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
      <body className={inter.className}>{children}</body>
    </html>
  )
}