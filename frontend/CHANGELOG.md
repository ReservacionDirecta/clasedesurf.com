# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [1.2.0] - 2024-01-20

### 🖼️ Sistema de Imágenes Mejorado
- **Agregado**: Biblioteca completa de imágenes de surf específicas de Lima
- **Agregado**: Función `getBeachImage()` para mapeo inteligente de ubicaciones
- **Agregado**: Función `getSurfImageByLevel()` para imágenes por nivel
- **Agregado**: Función `getHeroImage()` para imagen principal
- **Mejorado**: Todas las imágenes ahora muestran surf real (eliminadas imágenes de yoga/otros deportes)
- **Mejorado**: Optimización de URLs con parámetros de Unsplash para mejor rendimiento

### 🏖️ Playas de Lima
- **Agregado**: Mapeo completo de playas de surf en Lima
- **Agregado**: Soporte para Miraflores, San Bartolo, Chorrillos, Callao, Punta Negra, Punta Hermosa
- **Agregado**: Mapeo de ubicaciones alternativas (Costa Verde, Barranco, La Pampilla, etc.)

### 🎨 Mejoras Visuales
- **Mejorado**: Imagen de fondo del Hero con surf al atardecer en Lima
- **Mejorado**: Consistencia visual en todas las tarjetas de clases
- **Mejorado**: Imágenes específicas por tipo de clase y nivel de experiencia

## [1.1.0] - 2024-01-15

### 🏪 Transformación a Marketplace
- **Agregado**: Soporte para múltiples escuelas de surf
- **Agregado**: Sistema de ratings y reseñas por escuela
- **Agregado**: Información expandible de escuelas e instructores
- **Agregado**: Badges de verificación para escuelas

### 💰 Sistema Dual de Monedas
- **Agregado**: Soporte nativo para USD y PEN
- **Agregado**: Conversión automática de monedas
- **Agregado**: Componente `PriceDisplay` con formato localizado
- **Agregado**: Configuración de tipos de cambio

### 🔍 Filtros Avanzados
- **Agregado**: `FilterPanel` con múltiples criterios
- **Agregado**: Filtros por ubicación, nivel, tipo, precio y rating
- **Agregado**: Interfaz responsive para filtros

### 📱 Diseño Responsive
- **Mejorado**: Optimización para iPhone y dispositivos móviles
- **Mejorado**: Diseño de alto contraste para mejor legibilidad
- **Mejorado**: Componentes touch-friendly

## [1.0.0] - 2024-01-10

### 🚀 Lanzamiento Inicial
- **Agregado**: Configuración inicial de Next.js 14 con TypeScript
- **Agregado**: Esquema de base de datos con Prisma
- **Agregado**: Sistema de autenticación con NextAuth.js
- **Agregado**: Componentes UI base (Button, Input, etc.)
- **Agregado**: Configuración de Tailwind CSS
- **Agregado**: Validaciones con Zod

### 🏄‍♂️ Funcionalidades de Surf
- **Agregado**: Modelo de datos para clases de surf
- **Agregado**: Componente `ClassCard` básico
- **Agregado**: Tipos TypeScript para surf
- **Agregado**: Layout básico con Header y Footer

### 🛠️ Infraestructura
- **Agregado**: Configuración de ESLint y Prettier
- **Agregado**: Scripts de desarrollo y build
- **Agregado**: Configuración de deployment
- **Agregado**: Variables de entorno

## Tipos de Cambios

- **Agregado**: para nuevas funcionalidades
- **Mejorado**: para cambios en funcionalidades existentes
- **Corregido**: para corrección de bugs
- **Eliminado**: para funcionalidades removidas
- **Seguridad**: para vulnerabilidades corregidas

## Próximas Versiones

### [1.3.0] - Planificado
- Sistema de reservas en tiempo real
- Integración de pagos
- Notificaciones push
- Panel administrativo completo

### [1.4.0] - Planificado
- App móvil nativa
- Sistema de reseñas completo
- Gamificación y logros
- Comunidad de surfistas

### [2.0.0] - Futuro
- Expansión a otras ciudades costeras de Perú
- Marketplace de equipamiento
- Integración con redes sociales
- Sistema de certificaciones