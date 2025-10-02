# 🏄 SurfSchool Booking Platform

Plataforma completa de gestión de reservas para escuelas de surf, construida con Next.js, Express y PostgreSQL.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Estado del Proyecto](#estado-del-proyecto)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Usuarios de Prueba](#usuarios-de-prueba)
- [Desarrollo](#desarrollo)
- [Documentación](#documentación)

## ✨ Características

### Para Estudiantes
- 🔐 Registro y autenticación segura
- 📅 Explorar clases disponibles con calendario
- 🏄 Reservar clases de surf
- 👤 Gestión de perfil personal (edad, peso, altura, lesiones, habilidades de natación)
- 📝 Agregar requerimientos especiales a las reservas
- 📊 Ver historial de reservas

### Para Administradores de Escuela
- 🏫 Dashboard de gestión de escuela
- 📚 Crear y gestionar clases
- 💰 Gestión de pagos y reservas
- 📈 Reportes y estadísticas de su escuela
- 👥 Ver estudiantes registrados

### Para Administradores del Sistema
- 🎯 Dashboard administrativo completo
- 🏢 Gestión de múltiples escuelas
- 👨‍💼 Gestión de usuarios
- 💸 Sistema de payouts para escuelas
- 📊 Reportes globales y estadísticas

## 🏗 Arquitectura del Sistema

### Diagrama de Arquitectura

```mermaid
graph TB
    subgraph "Cliente"
        Browser[🌐 Navegador Web]
    end
    
    subgraph "Frontend - Next.js 14"
        Pages[📄 Pages/Routes]
        Components[🧩 React Components]
        NextAuth[🔐 NextAuth.js]
        API_Proxy[🔄 API Proxy]
    end
    
    subgraph "Backend - Express"
        Auth[🔑 Auth Routes]
        Users[👤 Users Routes]
        Classes[📚 Classes Routes]
        Reservations[📝 Reservations Routes]
        Payments[💳 Payments Routes]
        Schools[🏫 Schools Routes]
        Middleware[🛡️ Auth Middleware]
    end
    
    subgraph "Base de Datos"
        Prisma[⚡ Prisma ORM]
        PostgreSQL[(🗄️ PostgreSQL)]
    end
    
    Browser --> Pages
    Pages --> Components
    Pages --> NextAuth
    Components --> API_Proxy
    API_Proxy --> Auth
    API_Proxy --> Users
    API_Proxy --> Classes
    API_Proxy --> Reservations
    API_Proxy --> Payments
    API_Proxy --> Schools
    
    Auth --> Middleware
    Users --> Middleware
    Classes --> Middleware
    Reservations --> Middleware
    Payments --> Middleware
    Schools --> Middleware
    
    Middleware --> Prisma
    Prisma --> PostgreSQL
    
    style Browser fill:#e1f5ff
    style Pages fill:#fff4e1
    style Components fill:#fff4e1
    style Auth fill:#e8f5e9
    style PostgreSQL fill:#f3e5f5
```

### Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant NA as NextAuth
    participant B as Backend
    participant DB as Database
    
    U->>F: Login (email, password)
    F->>NA: signIn()
    NA->>B: POST /auth/login
    B->>DB: Verificar credenciales
    DB-->>B: Usuario encontrado
    B->>B: Generar JWT + Refresh Token
    B-->>NA: {user, token}
    NA->>NA: Guardar en sesión
    NA-->>F: Sesión creada
    F-->>U: Redirigir a dashboard
    
    Note over U,DB: Refresh Token Flow
    F->>NA: Solicitar recurso protegido
    NA->>NA: Token expirado?
    NA->>B: POST /auth/refresh
    B->>DB: Validar refresh token
    DB-->>B: Token válido
    B-->>NA: Nuevo access token
    NA->>B: Solicitud con nuevo token
    B-->>F: Recurso protegido
```

### Flujo de Reserva

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    
    U->>F: Ver clases disponibles
    F->>B: GET /classes
    B->>DB: Query clases
    DB-->>B: Lista de clases
    B-->>F: Clases con disponibilidad
    F-->>U: Mostrar calendario
    
    U->>F: Seleccionar clase y reservar
    F->>F: Validar formulario (Zod)
    F->>B: POST /reservations
    B->>B: Verificar autenticación
    B->>DB: BEGIN TRANSACTION
    DB->>DB: Verificar capacidad
    DB->>DB: Crear reserva
    DB->>DB: COMMIT
    DB-->>B: Reserva creada
    B-->>F: {reservation}
    F-->>U: Confirmación + Pago pendiente
    
    U->>F: Proceder al pago
    F->>B: POST /payments
    B->>DB: Crear registro de pago
    B->>DB: Actualizar reserva a PAID
    DB-->>B: Pago confirmado
    B-->>F: {payment}
    F-->>U: Reserva confirmada
```

## 🛠 Stack Tecnológico

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI:** React 18, Tailwind CSS
- **Autenticación:** NextAuth.js
- **Lenguaje:** TypeScript

### Backend
- **Framework:** Express.js
- **Base de Datos:** PostgreSQL
- **ORM:** Prisma
- **Autenticación:** JWT + bcrypt
- **Lenguaje:** TypeScript

### Infraestructura
- **Despliegue:** Railway
- **Base de Datos:** PostgreSQL en Railway

## 📁 Estructura del Proyecto

```
clasedesurf.com/
├── frontend/                 # Aplicación Next.js
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── (auth)/      # Login, Register
│   │   │   ├── dashboard/   # Dashboards por rol
│   │   │   ├── classes/     # Listado de clases
│   │   │   ├── reservations/# Mis reservas
│   │   │   └── api/         # API Routes (proxy)
│   │   ├── components/      # Componentes React
│   │   │   ├── ui/          # Componentes base
│   │   │   ├── booking/     # Componentes de reserva
│   │   │   ├── classes/     # Componentes de clases
│   │   │   └── dashboard/   # Componentes de dashboard
│   │   ├── lib/             # Utilidades
│   │   │   ├── auth.ts      # NextAuth config
│   │   │   ├── validations.ts # Esquemas Zod
│   │   │   └── utils.ts     # Helpers
│   │   └── types/           # TypeScript types
│   └── public/              # Archivos estáticos
│
├── backend/                 # API Express
│   ├── src/
│   │   ├── routes/          # Rutas de la API
│   │   │   ├── auth.ts      # Autenticación
│   │   │   ├── users.ts     # Usuarios
│   │   │   ├── classes.ts   # Clases
│   │   │   ├── reservations.ts # Reservas
│   │   │   ├── payments.ts  # Pagos
│   │   │   ├── schools.ts   # Escuelas
│   │   │   └── payouts.ts   # Payouts
│   │   ├── middleware/      # Middleware personalizado
│   │   │   └── auth.ts      # JWT validation
│   │   └── server.ts        # Servidor principal
│   ├── prisma/
│   │   ├── schema.prisma    # Esquema de base de datos
│   │   ├── seed.ts          # Datos de prueba
│   │   └── migrations/      # Migraciones
│   └── TESTING.md           # Guía de testing
│
└── .kiro/
    └── specs/               # Especificaciones del proyecto
        └── surfschool-booking-platform/
            ├── requirements.md  # Requerimientos detallados
            ├── design.md        # Diseño técnico
            └── tasks.md         # Plan de implementación
```

## 📊 Estado del Proyecto

### Kanban de Desarrollo

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'#10b981','primaryTextColor':'#fff','primaryBorderColor':'#059669','lineColor':'#6b7280','secondaryColor':'#3b82f6','tertiaryColor':'#f59e0b'}}}%%
graph LR
    subgraph "✅ Completado"
        A1[Backend Setup]
        A2[Autenticación JWT]
        A3[CRUD Usuarios]
        A4[CRUD Clases]
        A5[CRUD Escuelas]
        A6[Sistema Reservas]
        A7[Pagos Básicos]
        A8[Admin Dashboard]
        A9[Perfil Usuario]
    end
    
    subgraph "🚧 En Progreso"
        B1[Listado Clases UI]
        B2[Calendario Clases]
        B3[Flujo Reserva]
    end
    
    subgraph "📋 Por Hacer"
        C1[Integración Stripe]
        C2[Reportes Admin]
        C3[Tests E2E]
        C4[Notificaciones]
        C5[Optimizaciones]
    end
    
    style A1 fill:#10b981
    style A2 fill:#10b981
    style A3 fill:#10b981
    style A4 fill:#10b981
    style A5 fill:#10b981
    style A6 fill:#10b981
    style A7 fill:#10b981
    style A8 fill:#10b981
    style A9 fill:#10b981
    
    style B1 fill:#3b82f6
    style B2 fill:#3b82f6
    style B3 fill:#3b82f6
    
    style C1 fill:#f59e0b
    style C2 fill:#f59e0b
    style C3 fill:#f59e0b
    style C4 fill:#f59e0b
    style C5 fill:#f59e0b
```

### Progreso por Fase

| Fase | Descripción | Estado | Progreso |
|------|-------------|--------|----------|
| **Fase 1** | Completar Visualización de Clases | 🚧 En Progreso | ████░░░░░░ 40% |
| **Fase 2** | Completar Sistema de Reservas | 📋 Pendiente | ██░░░░░░░░ 20% |
| **Fase 3** | Sistema de Pagos | 📋 Pendiente | █░░░░░░░░░ 10% |
| **Fase 4** | Dashboard Administrativo | 🚧 En Progreso | ████░░░░░░ 40% |
| **Fase 5** | Reportes y Estadísticas | 📋 Pendiente | ░░░░░░░░░░ 0% |
| **Fase 6** | Validaciones y Seguridad | 🚧 En Progreso | ████░░░░░░ 40% |
| **Fase 7** | Testing | 📋 Pendiente | ░░░░░░░░░░ 0% |
| **Fase 8** | Mejoras de UX | 📋 Pendiente | ░░░░░░░░░░ 0% |

### Modelo de Datos

```mermaid
erDiagram
    User ||--o{ Reservation : creates
    User {
        int id PK
        string email UK
        string name
        string password
        enum role
        int age
        float weight
        float height
        boolean canSwim
        string injuries
        string phone
    }
    
    School ||--o{ Class : offers
    School {
        int id PK
        string name
        string location
        string description
        string phone
        string email
    }
    
    Class ||--o{ Reservation : has
    Class {
        int id PK
        string title
        string description
        datetime date
        int duration
        int capacity
        float price
        enum level
        int schoolId FK
    }
    
    Reservation ||--|| Payment : has
    Reservation {
        int id PK
        int userId FK
        int classId FK
        enum status
        string specialRequest
    }
    
    Payment {
        int id PK
        int reservationId FK
        float amount
        enum status
        string paymentMethod
        string transactionId
        datetime paidAt
        float platformFee
        float netAmount
    }
    
    School ||--o{ Payout : receives
    Payout {
        int id PK
        int schoolId FK
        float amount
        enum status
        datetime periodStart
        datetime periodEnd
    }
```

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd clasedesurf.com
```

### 2. Instalar Dependencias

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Configurar Base de Datos

**Crear base de datos PostgreSQL:**
```sql
CREATE DATABASE "clasedesurf.com";
```

**Configurar variables de entorno del backend:**
```bash
cd backend
cp .env.example .env
```

Editar `.env`:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/clasedesurf.com"
JWT_SECRET="tu-secreto-jwt-super-seguro"
PORT=4000
```

**Ejecutar migraciones:**
```bash
npx prisma migrate dev
```

**Poblar base de datos con datos de prueba:**
```bash
npx prisma db seed
```

### 4. Configurar Frontend

```bash
cd frontend
cp .env.local.example .env.local
```

Editar `.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXTAUTH_SECRET=tu-secreto-nextauth
NEXTAUTH_URL=http://localhost:3000
```

## 👥 Usuarios de Prueba

Después de ejecutar el seed, tendrás acceso a estos usuarios:

### Administrador del Sistema
```
Email: admin@surfschool.com
Password: password123
```

### Administrador de Escuela
```
Email: schooladmin@surfschool.com
Password: password123
```

### Estudiantes
```
Email: test@test.com
Password: password123
```

Ver más detalles en [backend/TESTING.md](backend/TESTING.md)

## 💻 Desarrollo

### Iniciar Backend

```bash
cd backend
npm run dev
```

El servidor estará disponible en `http://localhost:4000`

### Iniciar Frontend

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Prisma Studio (Explorar Base de Datos)

```bash
cd backend
npx prisma studio
```

Abre una interfaz visual en `http://localhost:5555`

## 📚 Documentación

### Documentación del Proyecto

- **[Requirements](/.kiro/specs/surfschool-booking-platform/requirements.md)** - Requerimientos detallados del sistema
- **[Design](/.kiro/specs/surfschool-booking-platform/design.md)** - Arquitectura y diseño técnico
- **[Tasks](/.kiro/specs/surfschool-booking-platform/tasks.md)** - Plan de implementación
- **[Testing Guide](/backend/TESTING.md)** - Guía completa de testing

### API Endpoints

#### Autenticación
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesión
- `POST /auth/logout` - Cierre de sesión
- `POST /auth/refresh` - Renovar token

#### Usuarios
- `GET /users/profile` - Obtener perfil
- `PUT /users/profile` - Actualizar perfil

#### Clases
- `GET /classes` - Listar clases disponibles
- `GET /classes/:id` - Obtener detalles de clase
- `POST /classes` - Crear clase (admin/school_admin)
- `PUT /classes/:id` - Actualizar clase
- `DELETE /classes/:id` - Eliminar clase

#### Reservas
- `GET /reservations` - Listar reservas del usuario
- `POST /reservations` - Crear reserva
- `GET /reservations/:id` - Obtener detalles de reserva
- `PUT /reservations/:id` - Actualizar reserva
- `DELETE /reservations/:id` - Cancelar reserva

#### Escuelas
- `GET /schools` - Listar escuelas
- `GET /schools/:id` - Obtener detalles de escuela
- `POST /schools` - Crear escuela (admin)
- `PUT /schools/:id` - Actualizar escuela

#### Pagos
- `GET /payments/:reservationId` - Obtener estado de pago
- `POST /payments/confirm` - Confirmar pago (admin)

#### Payouts (Admin)
- `GET /payouts` - Listar payouts
- `POST /payouts/generate` - Generar payouts
- `PUT /payouts/:id` - Actualizar estado de payout

## 🧪 Testing

### Ejecutar Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Flujos de Testing Recomendados

1. **Autenticación**
   - Registro de nuevo usuario
   - Login con diferentes roles
   - Verificación de permisos

2. **Reservas**
   - Crear nueva reserva
   - Ver reservas existentes
   - Cancelar reserva

3. **Dashboard Administrativo**
   - Gestión de escuelas
   - Gestión de clases
   - Gestión de pagos

Ver guía completa en [backend/TESTING.md](backend/TESTING.md)

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- Autenticación JWT con tokens de refresh
- Validación de datos con Zod
- Protección CORS configurada
- Variables de entorno para secretos
- Middleware de autenticación en rutas protegidas

## 📦 Despliegue

### Railway

1. Crear proyecto en Railway
2. Añadir servicio PostgreSQL
3. Configurar variables de entorno
4. Conectar repositorio de GitHub
5. Railway desplegará automáticamente

### Variables de Entorno en Producción

**Backend:**
```env
DATABASE_URL=<railway-postgres-url>
JWT_SECRET=<secreto-seguro>
PORT=4000
NODE_ENV=production
```

**Frontend:**
```env
NEXT_PUBLIC_BACKEND_URL=<url-backend-railway>
NEXTAUTH_SECRET=<secreto-seguro>
NEXTAUTH_URL=<url-frontend-railway>
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y confidencial.

## 👨‍💻 Equipo

Desarrollado para la gestión de escuelas de surf en Perú.

## 🔮 Roadmap

### Timeline de Desarrollo

```mermaid
gantt
    title Roadmap de Desarrollo SurfSchool Platform
    dateFormat YYYY-MM-DD
    section Fase 1 - MVP
    Backend Setup           :done, 2024-09-01, 2024-09-15
    Autenticación          :done, 2024-09-15, 2024-09-25
    CRUD Básico            :done, 2024-09-25, 2024-10-05
    
    section Fase 2 - Core Features
    UI Clases              :active, 2024-10-05, 2024-10-15
    Sistema Reservas       :active, 2024-10-10, 2024-10-20
    Dashboard Admin        :active, 2024-10-15, 2024-10-25
    
    section Fase 3 - Pagos
    Integración Stripe     :2024-10-20, 2024-11-05
    Webhooks              :2024-10-25, 2024-11-10
    Sistema Payouts       :2024-11-05, 2024-11-15
    
    section Fase 4 - Testing & QA
    Tests Backend         :2024-11-10, 2024-11-20
    Tests Frontend        :2024-11-15, 2024-11-25
    Tests E2E             :2024-11-20, 2024-11-30
    
    section Fase 5 - Producción
    Optimizaciones        :2024-11-25, 2024-12-05
    Deploy Railway        :2024-12-01, 2024-12-10
    Monitoreo             :2024-12-05, 2024-12-15
```

### Funcionalidades por Versión

#### v1.0 - MVP (Actual) ✅
- ✅ Sistema de autenticación con JWT
- ✅ Gestión de usuarios y perfiles
- ✅ CRUD de clases y escuelas
- ✅ Sistema básico de reservas
- ✅ Dashboard administrativo
- ✅ Pagos básicos (sin gateway)

#### v1.1 - Core Features (En Progreso) 🚧
- 🚧 Listado y filtrado de clases
- 🚧 Calendario de clases
- 🚧 Flujo completo de reserva
- 📋 Cancelación de reservas
- 📋 Mejoras en dashboard admin

#### v1.2 - Pagos (Próximamente) 📋
- 📋 Integración con Stripe
- 📋 Webhooks de confirmación
- 📋 Sistema de payouts automático
- 📋 Reportes financieros

#### v1.3 - Testing & QA 📋
- 📋 Tests de integración backend
- 📋 Tests unitarios frontend
- 📋 Tests E2E con Playwright
- 📋 CI/CD con GitHub Actions

#### v2.0 - Producción 🎯
- 🎯 Optimizaciones de rendimiento
- 🎯 Deploy en Railway
- 🎯 Monitoreo y logging
- 🎯 Documentación completa

#### v3.0 - Futuro 🔮
- 🔮 Notificaciones por email/SMS
- 🔮 Sistema de reseñas
- 🔮 Integración con Google Calendar
- 🔮 App móvil con React Native
- 🔮 Marketplace multi-escuela
- 🔮 Analytics avanzados

## 📞 Soporte

Para soporte o preguntas, contactar al equipo de desarrollo.

---

**Última actualización:** Octubre 2024
