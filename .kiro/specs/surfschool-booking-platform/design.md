# Documento de Diseño - Plataforma de Reservas SurfSchool

## Visión General

La plataforma SurfSchool Booking es una aplicación web full-stack construida con Next.js 14 que utiliza el App Router para una experiencia moderna y optimizada. El sistema implementa una arquitectura de tres capas: presentación (React/Next.js), lógica de negocio (API Routes), y persistencia (PostgreSQL con Prisma ORM). La aplicación se desplegará en Railway con base de datos PostgreSQL gestionada.

## Arquitectura

### Arquitectura General del Sistema

```mermaid
graph TB
    subgraph "Cliente (Browser)"
        UI[React Components]
        Pages[Next.js Pages]
        Auth[Client Auth State]
    end
    
    subgraph "Servidor Next.js"
        API[API Routes]
        Middleware[Auth Middleware]
        Server[Server Components]
    end
    
    subgraph "Base de Datos"
        DB[(PostgreSQL)]
        Prisma[Prisma ORM]
    end
    
    subgraph "Infraestructura"
        Railway[Railway Platform]
        Env[Variables de Entorno]
    end
    
    UI --> Pages
    Pages --> Server
    Pages --> API
    API --> Middleware
    API --> Prisma
    Prisma --> DB
    Server --> Prisma
    
    Railway --> API
    Railway --> DB
    Env --> API
```

### Stack Tecnológico

- **Frontend**: Next.js 14 con App Router, React 18, TypeScript
- **Backend**: Next.js API Routes con TypeScript
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js o implementación JWT personalizada
- **Estilos**: Tailwind CSS para diseño responsive
- **Despliegue**: Railway (aplicación y base de datos)
- **Validación**: Zod para validación de esquemas
- **Testing**: Jest y React Testing Library

## Componentes e Interfaces

### Estructura de Directorios

```
frontend/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── (auth)/            # Grupo de rutas de autenticación
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/         # Panel de usuario
│   │   ├── admin/             # Panel administrativo
│   │   ├── classes/           # Listado y detalles de clases
│   │   ├── reservations/      # Gestión de reservas
│   │   └── api/               # API Routes
│   │       ├── auth/
│   │       ├── classes/
│   │       ├── reservations/
│   │       ├── payments/
│   │       └── users/
│   ├── components/            # Componentes reutilizables
│   │   ├── ui/               # Componentes base (botones, inputs)
│   │   ├── forms/            # Formularios específicos
│   │   ├── calendar/         # Componentes de calendario
│   │   └── dashboard/        # Componentes del dashboard
│   ├── lib/                  # Utilidades y configuraciones
│   │   ├── prisma.ts         # Cliente Prisma
│   │   ├── auth.ts           # Configuración de autenticación
│   │   ├── validations.ts    # Esquemas de validación Zod
│   │   └── utils.ts          # Funciones utilitarias
│   └── types/                # Definiciones de tipos TypeScript
├── prisma/
│   ├── schema.prisma         # Esquema de base de datos
│   └── migrations/           # Migraciones de base de datos
└── public/                   # Archivos estáticos
```

### Componentes Principales del Frontend

#### 1. Componentes de Autenticación
- `LoginForm`: Formulario de inicio de sesión
- `RegisterForm`: Formulario de registro
- `AuthProvider`: Context provider para estado de autenticación

#### 2. Componentes de Clases
- `ClassList`: Lista de clases disponibles
- `ClassCard`: Tarjeta individual de clase
- `ClassCalendar`: Vista de calendario de clases
- `ClassFilter`: Filtros de búsqueda y fecha

#### 3. Componentes de Reservas
- `ReservationForm`: Formulario de nueva reserva
- `ReservationList`: Lista de reservas del usuario
- `ReservationCard`: Tarjeta individual de reserva
- `ReservationStatus`: Indicador de estado de reserva

#### 4. Componentes del Dashboard
- `UserDashboard`: Panel principal del usuario
- `AdminDashboard`: Panel administrativo
- `StatsCards`: Tarjetas de estadísticas
- `ReservationCalendar`: Calendario administrativo

#### 5. Componentes de Perfil
- `ProfileForm`: Formulario de perfil de usuario
- `ProfileDisplay`: Visualización de datos de perfil

### API Routes y Endpoints

#### Autenticación (`/api/auth/`)
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cierre de sesión
- `GET /api/auth/me` - Obtener usuario actual

#### Usuarios (`/api/users/`)
- `GET /api/users/profile` - Obtener perfil del usuario
- `PUT /api/users/profile` - Actualizar perfil del usuario

#### Clases (`/api/classes/`)
- `GET /api/classes` - Listar clases disponibles
- `GET /api/classes/[id]` - Obtener detalles de clase
- `POST /api/classes` - Crear nueva clase (admin)
- `PUT /api/classes/[id]` - Actualizar clase (admin)
- `DELETE /api/classes/[id]` - Eliminar clase (admin)

#### Reservas (`/api/reservations/`)
- `GET /api/reservations` - Listar reservas del usuario
- `POST /api/reservations` - Crear nueva reserva
- `GET /api/reservations/[id]` - Obtener detalles de reserva
- `PUT /api/reservations/[id]` - Actualizar reserva
- `DELETE /api/reservations/[id]` - Cancelar reserva

#### Pagos (`/api/payments/`)
- `GET /api/payments/[reservationId]` - Obtener estado de pago
- `POST /api/payments/confirm` - Confirmar pago (admin)
- `GET /api/payments/reports` - Reportes de pagos (admin)

#### Administración (`/api/admin/`)
- `GET /api/admin/reservations` - Todas las reservas (admin)
- `GET /api/admin/stats` - Estadísticas generales (admin)
- `GET /api/admin/reports` - Generar reportes (admin)

## Modelos de Datos

### Esquema Prisma Mejorado

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           Int           @id @default(autoincrement())
  email        String        @unique
  name         String
  password     String
  role         UserRole      @default(STUDENT)
  age          Int?
  weight       Float?
  height       Float?
  canSwim      Boolean       @default(false)
  injuries     String?
  phone        String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  reservations Reservation[]
  
  @@map("users")
}

model School {
  id          Int      @id @default(autoincrement())
  name        String
  location    String
  description String?
  phone       String?
  email       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  classes     Class[]
  
  @@map("schools")
}

model Class {
  id           Int           @id @default(autoincrement())
  title        String
  description  String?
  date         DateTime
  duration     Int           // duración en minutos
  capacity     Int
  price        Float
  level        ClassLevel    @default(BEGINNER)
  school       School        @relation(fields: [schoolId], references: [id])
  schoolId     Int
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  reservations Reservation[]
  
  @@map("classes")
}

model Reservation {
  id             Int                @id @default(autoincrement())
  user           User               @relation(fields: [userId], references: [id])
  userId         Int
  class          Class              @relation(fields: [classId], references: [id])
  classId        Int
  status         ReservationStatus  @default(PENDING)
  specialRequest String?
  createdAt      DateTime           @default(now())
  updatedAt      DateTime           @updatedAt
  payment        Payment?
  
  @@map("reservations")
}

model Payment {
  id            Int           @id @default(autoincrement())
  reservation   Reservation   @relation(fields: [reservationId], references: [id])
  reservationId Int           @unique
  amount        Float
  status        PaymentStatus @default(UNPAID)
  paymentMethod String?
  transactionId String?
  paidAt        DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  @@map("payments")
}

enum UserRole {
  STUDENT
  ADMIN
  SCHOOL_ADMIN
}

enum ClassLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum ReservationStatus {
  PENDING
  CONFIRMED
  PAID
  CANCELED
  COMPLETED
}

enum PaymentStatus {
  UNPAID
  PAID
  REFUNDED
}
```

### Tipos TypeScript

```typescript
// types/index.ts
export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  age?: number;
  weight?: number;
  height?: number;
  canSwim: boolean;
  injuries?: string;
  phone?: string;
}

export interface Class {
  id: number;
  title: string;
  description?: string;
  date: Date;
  duration: number;
  capacity: number;
  price: number;
  level: ClassLevel;
  school: School;
  availableSpots: number;
}

export interface Reservation {
  id: number;
  user: User;
  class: Class;
  status: ReservationStatus;
  specialRequest?: string;
  payment?: Payment;
  createdAt: Date;
}

export interface CreateReservationData {
  classId: number;
  specialRequest?: string;
}

export interface UpdateProfileData {
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  canSwim?: boolean;
  injuries?: string;
  phone?: string;
}
```

## Manejo de Errores

### Estrategia de Manejo de Errores

#### 1. Errores del Cliente
- Validación de formularios con Zod
- Mensajes de error específicos y traducidos
- Estados de carga y error en componentes
- Retry automático para errores de red

#### 2. Errores del Servidor
- Middleware de manejo de errores centralizado
- Logging estructurado de errores
- Códigos de estado HTTP apropiados
- Respuestas de error consistentes

#### 3. Errores de Base de Datos
- Manejo de errores de Prisma
- Validación de constraints de base de datos
- Rollback de transacciones fallidas

```typescript
// lib/error-handler.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (error: unknown) => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code
    };
  }
  
  // Log error for debugging
  console.error('Unexpected error:', error);
  
  return {
    message: 'Error interno del servidor',
    statusCode: 500
  };
};
```

## Estrategia de Testing

### Tipos de Testing

#### 1. Unit Testing
- Funciones utilitarias con Jest
- Componentes React con React Testing Library
- Validaciones de Zod
- Lógica de negocio aislada

#### 2. Integration Testing
- API Routes con supertest
- Flujos completos de usuario
- Integración con base de datos de prueba

#### 3. E2E Testing (Futuro)
- Cypress o Playwright para flujos críticos
- Testing de reservas completas
- Testing del dashboard administrativo

```typescript
// __tests__/api/reservations.test.ts
describe('/api/reservations', () => {
  it('should create a new reservation', async () => {
    const response = await request(app)
      .post('/api/reservations')
      .send({
        classId: 1,
        specialRequest: 'Necesito tabla más grande'
      })
      .expect(201);
      
    expect(response.body).toHaveProperty('id');
    expect(response.body.status).toBe('PENDING');
  });
});
```

### Configuración de Testing

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
};
```

## Seguridad

### Medidas de Seguridad Implementadas

#### 1. Autenticación y Autorización
- JWT tokens con expiración
- Middleware de autenticación en rutas protegidas
- Roles de usuario (STUDENT, ADMIN, SCHOOL_ADMIN)
- Validación de permisos por endpoint

#### 2. Validación de Datos
- Validación del lado cliente y servidor
- Sanitización de inputs
- Esquemas Zod para validación consistente
- Rate limiting en APIs críticas

#### 3. Protección de Datos
- Hash de contraseñas con bcrypt
- Variables de entorno para secretos
- HTTPS en producción
- Validación de CORS

```typescript
// lib/auth.ts
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (
  password: string, 
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateJWT = (userId: number): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
};
```

## Configuración de Despliegue

### Variables de Entorno

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"
JWT_SECRET="your-jwt-secret"

# App Configuration
NODE_ENV="production"
PORT=3000

# Email (futuro)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""
```

### Configuración de Railway

1. **Base de Datos PostgreSQL**
   - Provisión automática de PostgreSQL
   - Backups automáticos
   - Conexión segura con SSL

2. **Aplicación Next.js**
   - Build automático desde GitHub
   - Variables de entorno configuradas
   - Dominio personalizado disponible

3. **Monitoreo**
   - Logs de aplicación
   - Métricas de rendimiento
   - Alertas de disponibilidad

### Scripts de Despliegue

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "dev": "next dev",
    "db:migrate": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "db:seed": "tsx prisma/seed.ts",
    "postinstall": "prisma generate"
  }
}
```

## Consideraciones de Rendimiento

### Optimizaciones del Frontend
- Server Components para reducir JavaScript del cliente
- Lazy loading de componentes no críticos
- Optimización de imágenes con Next.js Image
- Caching de datos con SWR o React Query

### Optimizaciones del Backend
- Índices de base de datos en campos frecuentemente consultados
- Paginación en listados grandes
- Caching de consultas frecuentes
- Optimización de queries Prisma

### Optimizaciones de Base de Datos
```sql
-- Índices recomendados
CREATE INDEX idx_classes_date ON classes(date);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_class_id ON reservations(class_id);
CREATE INDEX idx_reservations_status ON reservations(status);
```

## Escalabilidad Futura

### Marketplace Multi-Escuela
- Modelo de datos extendido para múltiples escuelas
- Sistema de comisiones por reserva
- Dashboard específico por escuela
- Onboarding de nuevas escuelas

### Integraciones Futuras
- Pasarelas de pago (Stripe, PayPal)
- Notificaciones por email/SMS
- Integración con Google Calendar
- API pública para terceros
- App móvil con React Native