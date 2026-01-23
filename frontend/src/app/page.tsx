
import { Metadata } from 'next'
import HomeClient from './HomeClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Clase de Surf | Encuentra y reserva tu próxima ola',
  description: 'La plataforma líder en Perú para reservar clases de surf. Conecta con instructores certificados, descubre los mejores spots y mejora tu surfing hoy mismo.',
  openGraph: {
    title: 'Clase de Surf | Reserva clases con expertos',
    description: 'Encuentra las mejores escuelas y coachs de surf en Lima y todo el Perú. Reserva fácil y seguro.',
    images: ['/hero.png'],
    type: 'website',
    locale: 'es_PE',
  },
}

export default function Home() {
  // Client component wrapper for metadata support
  return <HomeClient />
}