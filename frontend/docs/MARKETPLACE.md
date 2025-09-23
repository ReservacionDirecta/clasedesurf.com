# Marketplace de Surf en Lima - Documentación

Este documento describe la arquitectura y funcionalidades del marketplace de surf enfocado en Lima, Perú.

## Visión General

El marketplace conecta surfistas con escuelas de surf verificadas en Lima y alrededores, ofreciendo una plataforma centralizada para comparar precios, leer reseñas y reservar clases.

## Características del Marketplace

### 🏄‍♂️ Multi-Escuela
- **Escuelas verificadas**: Sistema de verificación para garantizar calidad
- **Perfiles completos**: Información detallada de cada escuela
- **Ratings y reseñas**: Sistema de calificaciones de estudiantes reales
- **Años de experiencia**: Indicador de trayectoria de cada escuela

### 💰 Sistema Dual de Monedas
- **USD/PEN**: Soporte nativo para dólares americanos y soles peruanos
- **Conversión automática**: Tipos de cambio actualizados
- **Localización**: Formato de precios según preferencia del usuario
- **Transparencia**: Precios claros sin comisiones ocultas

### 🔍 Filtros Avanzados
- **Por ubicación**: Filtrar por playa específica
- **Por nivel**: Principiante, intermedio, avanzado, experto
- **Por tipo**: Grupal, privada, semi-privada, intensiva, niños
- **Por precio**: Rangos de precio personalizables
- **Por rating**: Filtrar por calificación mínima
- **Por disponibilidad**: Solo clases con cupos disponibles

## Modelo de Datos

### Escuela de Surf
```typescript
interface SurfSchool {
  id: string
  name: string
  city: string
  rating: number
  totalReviews: number
  verified: boolean
  yearsExperience: number
  logo?: string
  description?: string
  shortReview?: string
}
```

### Clase de Surf
```typescript
interface SurfClass {
  id: string
  title: string
  description: string
  date: Date
  startTime: Date
  endTime: Date
  duration: number
  capacity: number
  price: number
  currency: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  type: 'GROUP' | 'PRIVATE' | 'SEMI_PRIVATE' | 'INTENSIVE' | 'KIDS'
  location?: string
  school: SurfSchool
  instructor?: Instructor
  includesBoard: boolean
  includesWetsuit: boolean
  includesInsurance: boolean
  availableSpots?: number
}
```

### Instructor
```typescript
interface Instructor {
  name: string
  photo?: string
  rating: number
  experience: string
  specialties: string[]
}
```

## Componentes Principales

### 🏠 Landing Page (Hero)
- **Imagen de fondo**: Surf al atardecer en Lima
- **Propuesta de valor**: Marketplace líder en Perú
- **Estadísticas**: Escuelas, instructores, estudiantes, rating promedio
- **Call-to-action**: Acceso directo a clases disponibles

### 🃏 ClassCard
- **Información completa**: Escuela, instructor, detalles de clase
- **Precios duales**: USD y PEN simultáneamente
- **Equipamiento incluido**: Tabla, neopreno, seguro
- **Disponibilidad**: Cupos disponibles en tiempo real
- **Expandible**: Información adicional de escuela e instructor

### 🔧 FilterPanel
- **Filtros múltiples**: Combinación de criterios
- **Interfaz intuitiva**: Fácil de usar en móvil y desktop
- **Resultados en tiempo real**: Filtrado instantáneo
- **Persistencia**: Mantiene filtros durante la sesión

## Playas de Lima Incluidas

### 🌊 Zona Norte
- **Callao**: Ideal para principiantes y familias
- **La Pampilla**: Olas consistentes, ambiente relajado

### 🏙️ Zona Central
- **Miraflores (Costa Verde)**: Surf urbano, fácil acceso
- **Barranco**: Ambiente bohemio, olas para intermedios

### 🏖️ Zona Sur
- **Chorrillos (La Herradura)**: Olas técnicas, nivel intermedio-avanzado
- **San Bartolo**: Playa clásica del surf limeño
- **Punta Negra**: Olas grandes, surf avanzado
- **Punta Hermosa**: Competencias profesionales

## Experiencia del Usuario

### 🔍 Búsqueda y Descubrimiento
1. **Landing**: Introducción al marketplace
2. **Filtros**: Selección de criterios
3. **Resultados**: Lista de clases disponibles
4. **Detalles**: Información expandida de clase y escuela
5. **Reserva**: Proceso de booking simplificado

### 📱 Responsive Design
- **Mobile-first**: Optimizado para smartphones
- **Tablet**: Experiencia adaptada para tablets
- **Desktop**: Aprovecha pantallas grandes para más información

### ♿ Accesibilidad
- **Alto contraste**: Textos legibles en todas las condiciones
- **Navegación por teclado**: Accesible sin mouse
- **Screen readers**: Compatible con lectores de pantalla
- **Tamaños de fuente**: Escalables según necesidades

## Integración con Escuelas

### 📊 Panel de Escuela
- **Gestión de clases**: Crear, editar, cancelar clases
- **Calendario**: Vista de disponibilidad
- **Reservas**: Gestión de bookings
- **Estadísticas**: Métricas de rendimiento
- **Reseñas**: Gestión de feedback de estudiantes

### 💳 Pagos y Comisiones
- **Modelo de comisión**: Porcentaje por reserva exitosa
- **Pagos seguros**: Integración con pasarelas de pago
- **Facturación**: Sistema automático de facturación
- **Reportes**: Informes financieros detallados

## Tecnologías Utilizadas

### Frontend
- **Next.js 14**: Framework React con App Router
- **TypeScript**: Tipado estático para mayor seguridad
- **Tailwind CSS**: Estilos utilitarios y responsive
- **Zod**: Validación de datos en tiempo real

### Backend
- **Next.js API Routes**: API serverless
- **Prisma ORM**: Gestión de base de datos
- **PostgreSQL**: Base de datos relacional
- **NextAuth.js**: Autenticación y autorización

### Servicios Externos
- **Unsplash**: Imágenes de surf optimizadas
- **Exchange Rate API**: Conversión de monedas
- **Vercel/Railway**: Hosting y deployment

## Métricas y Analytics

### 📈 KPIs del Marketplace
- **Conversión**: % de visitantes que reservan
- **Retención**: Usuarios que regresan
- **Satisfacción**: Rating promedio de clases
- **Crecimiento**: Nuevas escuelas y usuarios

### 🎯 Métricas por Escuela
- **Reservas**: Número de bookings
- **Rating**: Calificación promedio
- **Ocupación**: % de capacidad utilizada
- **Ingresos**: Revenue generado

## Roadmap

### Fase 1 (Actual) ✅
- [x] Marketplace básico multi-escuela
- [x] Sistema dual de monedas
- [x] Filtros avanzados
- [x] Imágenes específicas de Lima
- [x] Responsive design

### Fase 2 (Próxima) 🚧
- [ ] Sistema de reservas en tiempo real
- [ ] Pagos integrados
- [ ] Notificaciones push
- [ ] App móvil nativa
- [ ] Sistema de reseñas completo

### Fase 3 (Futuro) 📋
- [ ] Expansión a otras ciudades costeras
- [ ] Marketplace de equipamiento
- [ ] Comunidad de surfistas
- [ ] Competencias y eventos
- [ ] Certificaciones oficiales

## Consideraciones de Negocio

### 💼 Modelo de Revenue
- **Comisión por reserva**: 8-12% por booking exitoso
- **Membresías premium**: Escuelas con beneficios adicionales
- **Publicidad**: Promoción destacada de escuelas
- **Servicios adicionales**: Seguros, equipamiento, transporte

### 🎯 Mercado Objetivo
- **Turistas**: Visitantes que quieren aprender surf en Lima
- **Locales**: Limeños interesados en el surf
- **Expatriados**: Extranjeros viviendo en Lima
- **Familias**: Padres buscando actividades para niños

### 🏆 Ventaja Competitiva
- **Especialización**: Enfoque exclusivo en surf
- **Localización**: Conocimiento profundo de Lima
- **Calidad**: Escuelas verificadas y ratings reales
- **Tecnología**: Plataforma moderna y fácil de usar