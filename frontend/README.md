# SurfSchool Booking Platform - Marketplace de Surf en Lima

Una plataforma web integral tipo marketplace para conectar surfistas con las mejores escuelas de surf en Lima, Perú. Construida con Next.js 14, TypeScript, Prisma y PostgreSQL.

## Características Principales

### 🏄‍♂️ Marketplace de Surf
- **Múltiples escuelas**: Plataforma que conecta diversas escuelas de surf en Lima
- **Comparación de precios**: Sistema dual de monedas (USD/PEN) con conversión automática
- **Ratings y reseñas**: Sistema de calificaciones y comentarios de estudiantes
- **Filtros avanzados**: Por ubicación, nivel, tipo de clase, precio y rating

### 🌊 Experiencia Visual Auténtica
- **Imágenes específicas de Lima**: Fotos reales de surf en playas de Lima (Miraflores, San Bartolo, Chorrillos, etc.)
- **Categorización por nivel**: Imágenes adaptadas según nivel de experiencia (principiante, intermedio, avanzado, experto)
- **Tipos de clase**: Visualización específica para clases grupales, privadas, intensivas y para niños

### 📱 Funcionalidades del Usuario
- Sistema de autenticación y autorización con NextAuth.js
- Gestión de perfiles de usuario con información específica para surf
- Sistema de reservas de clases con disponibilidad en tiempo real
- Seguimiento de progreso personal
- Historial de clases y certificaciones

### 🏫 Panel para Escuelas
- Panel administrativo para gestión de reservas y pagos
- Sistema de reportes y análisis
- Gestión de instructores y equipamiento
- Calendario de disponibilidad

### 🌍 Localización Peruana
- Enfoque específico en playas de Lima y alrededores
- Moneda local (PEN) con soporte internacional (USD)
- Contenido en español adaptado al mercado peruano

## Tecnologías

- **Frontend**: Next.js 14 con App Router, React 18, TypeScript
- **Backend**: Next.js API Routes, NextAuth.js
- **Base de datos**: PostgreSQL con Prisma ORM
- **Estilos**: Tailwind CSS
- **Validación**: Zod
- **Despliegue**: Railway

## Instalación

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   ```bash
   cp .env.example .env.local
   ```

4. Configura la base de datos:
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Scripts disponibles

- `npm run dev` - Ejecuta el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Ejecuta la aplicación en modo producción
- `npm run lint` - Ejecuta el linter
- `npm run db:generate` - Genera el cliente de Prisma
- `npm run db:push` - Sincroniza el esquema con la base de datos
- `npm run db:migrate` - Ejecuta las migraciones
- `npm run db:studio` - Abre Prisma Studio

## Estructura del proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── (auth)/            # Rutas de autenticación
│   ├── dashboard/         # Dashboards de usuario y admin
│   ├── classes/           # Gestión de clases
│   ├── reservations/      # Gestión de reservas
│   └── api/              # API Routes
├── components/            # Componentes reutilizables
│   ├── classes/          # Componentes de clases (ClassCard, etc.)
│   ├── marketplace/      # Componentes del marketplace (FilterPanel, etc.)
│   ├── layout/           # Componentes de layout (Header, Hero, Footer)
│   └── ui/              # Componentes UI base (Button, Input, etc.)
├── lib/                  # Utilidades y configuraciones
│   ├── lima-beach-images.ts  # Gestión de imágenes de surf en Lima
│   ├── currency.ts       # Sistema dual de monedas USD/PEN
│   └── validations.ts    # Validaciones con Zod
├── types/               # Definiciones de tipos TypeScript
└── prisma/             # Esquema de base de datos
    └── schema.prisma   # Modelos para marketplace multi-escuela
```

## Características Técnicas

### 🖼️ Sistema de Imágenes
- **Biblioteca de imágenes de Lima**: Colección curada de fotos de surf en playas específicas
- **Mapeo inteligente**: Asignación automática de imágenes según ubicación y tipo de clase
- **Optimización**: Imágenes optimizadas con Unsplash para carga rápida
- **Responsive**: Adaptación automática a diferentes tamaños de pantalla

### 💰 Sistema de Monedas
- **Dual currency**: Soporte nativo para USD y PEN
- **Conversión automática**: Tipos de cambio actualizados
- **Localización**: Formato de precios según región

### 🎨 Diseño UI/UX
- **Alto contraste**: Diseño optimizado para legibilidad
- **Responsive**: Adaptado para desktop, tablet y móvil
- **Accesibilidad**: Cumple estándares de accesibilidad web

## Playas de Surf en Lima

El marketplace incluye las principales playas de surf de Lima y alrededores:

### 🏖️ Playas Principales
- **Miraflores (Costa Verde)**: Ideal para principiantes, olas consistentes
- **San Bartolo**: Playa clásica, perfecta para nivel intermedio
- **Chorrillos (La Herradura)**: Olas técnicas, nivel intermedio-avanzado
- **Callao**: Ambiente familiar, excelente para niños y principiantes
- **Punta Negra**: Olas más grandes, nivel avanzado
- **Punta Hermosa**: Surf profesional, olas desafiantes

### 📸 Sistema de Imágenes por Contexto
- **Principiantes**: Imágenes de aprendizaje y olas pequeñas
- **Intermedio**: Surfistas en acción con buena técnica
- **Avanzado**: Maniobras técnicas y surf en tubo
- **Experto**: Olas grandes y surf profesional
- **Niños**: Ambiente familiar y seguro
- **Clases privadas**: Instrucción personalizada

## Variables de Entorno

```bash
# Base de datos
DATABASE_URL="postgresql://..."

# Autenticación
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Monedas
EXCHANGE_RATE_API_KEY="your-api-key"
```

## Contribución

Este proyecto sigue las mejores prácticas de desarrollo con TypeScript, ESLint y Prettier configurados.

### Estándares de Código
- **TypeScript**: Tipado estricto para mayor seguridad
- **ESLint + Prettier**: Formateo y linting automático
- **Componentes modulares**: Arquitectura escalable y mantenible
- **Responsive design**: Mobile-first approach