# SurfSchool Booking Platform - Database Schema

Este documento describe el esquema de base de datos completo para la plataforma de reservas de clases de surf.

## 📋 Resumen del Esquema

El esquema está diseñado para soportar:
- ✅ Gestión completa de usuarios con perfiles específicos para surf
- ✅ Sistema multi-escuela escalable
- ✅ Gestión avanzada de clases con detalles específicos
- ✅ Sistema de reservas robusto con estados múltiples
- ✅ Gestión completa de pagos con múltiples métodos
- ✅ Sistema de reseñas y calificaciones
- ✅ Gestión de equipamiento
- ✅ Integración con NextAuth.js
- ✅ Preparado para marketplace multi-escuela

## 🏗️ Arquitectura de Datos

### Entidades Principales

#### 👤 **User** - Gestión de Usuarios
```prisma
model User {
  id: String (CUID)
  name: String
  email: String (único)
  password: String
  
  # Perfil específico para surf
  age: Int?
  weight: Float? (kg)
  height: Float? (cm)
  canSwim: Boolean
  swimmingLevel: SwimmingLevel
  injuries: String?
  emergencyContact: String?
  emergencyPhone: String?
  
  # Sistema
  role: Role (STUDENT, ADMIN, SCHOOL_OWNER, SUPER_ADMIN)
  isActive: Boolean
  lastLoginAt: DateTime?
}
```

**Características especiales:**
- Información específica para actividades acuáticas
- Contacto de emergencia para seguridad
- Niveles de natación para evaluación de riesgo
- Soporte para NextAuth.js (Account, Session)

#### 🏫 **School** - Gestión de Escuelas
```prisma
model School {
  id: String (CUID)
  name: String
  slug: String (único, URL-friendly)
  
  # Información de contacto
  email: String (único)
  phone: String?
  website: String?
  
  # Ubicación detallada
  address: String
  city: String
  state: String?
  country: String (default: "ES")
  latitude: Float?
  longitude: Float?
  
  # Información comercial
  taxId: String? (CIF/NIF)
  bankAccount: String?
  commission: Float (default: 0.10)
  
  # Branding
  logo: String?
  coverImage: String?
  colors: Json?
}
```

**Características especiales:**
- Slug para URLs amigables
- Geolocalización para mapas
- Sistema de comisiones para marketplace
- Branding personalizable
- Información fiscal española

#### 📚 **Class** - Gestión de Clases
```prisma
model Class {
  id: String (CUID)
  title: String
  description: String?
  
  # Programación detallada
  date: DateTime
  startTime: DateTime
  endTime: DateTime
  duration: Int (minutos)
  
  # Capacidad y precios
  capacity: Int
  price: Float
  currency: String (default: "EUR")
  
  # Detalles específicos
  level: Level (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
  type: ClassType (GROUP, PRIVATE, SEMI_PRIVATE, INTENSIVE, KIDS)
  location: String? (nombre de la playa/spot)
  
  # Condiciones meteorológicas
  minWaveHeight: Float?
  maxWaveHeight: Float?
  weatherConditions: String?
  
  # Equipamiento incluido
  includesBoard: Boolean
  includesWetsuit: Boolean
  includesInsurance: Boolean
}
```

**Características especiales:**
- Tipos de clase específicos para surf
- Condiciones meteorológicas y de oleaje
- Equipamiento incluido detallado
- Duración flexible en minutos

#### 📝 **Reservation** - Sistema de Reservas
```prisma
model Reservation {
  id: String (CUID)
  userId: String
  classId: String
  
  # Detalles de la reserva
  status: ReservationStatus (PENDING, CONFIRMED, PAID, COMPLETED, CANCELED, NO_SHOW)
  specialRequest: String?
  participants: Int (default: 1)
  
  # Información financiera
  totalAmount: Float
  currency: String (default: "EUR")
  
  # Cancelación
  canceledAt: DateTime?
  cancelReason: String?
  refundAmount: Float?
}
```

**Características especiales:**
- Estados múltiples para seguimiento completo
- Soporte para múltiples participantes
- Información de cancelación y reembolsos
- Precios históricos para auditoría

#### 💳 **Payment** - Gestión de Pagos
```prisma
model Payment {
  id: String (CUID)
  reservationId: String
  userId: String
  
  # Información financiera
  amount: Float
  currency: String (default: "EUR")
  status: PaymentStatus (PENDING, PROCESSING, PAID, FAILED, REFUNDED, PARTIALLY_REFUNDED)
  
  # Método y procesamiento
  paymentMethod: PaymentMethod (CASH, CARD, BANK_TRANSFER, PAYPAL, STRIPE, BIZUM, OTHER)
  paymentProvider: String?
  transactionId: String?
  providerFee: Float?
  platformFee: Float?
  
  # Reembolsos
  refundedAt: DateTime?
  refundAmount: Float?
  refundReason: String?
}
```

**Características especiales:**
- Múltiples métodos de pago (incluye Bizum para España)
- Tracking de comisiones de plataforma y procesador
- Sistema completo de reembolsos
- Metadatos JSON para flexibilidad

#### ⭐ **Review** - Sistema de Reseñas
```prisma
model Review {
  id: String (CUID)
  userId: String
  schoolId: String
  reservationId: String (único)
  
  # Contenido de la reseña
  rating: Int (1-5)
  title: String?
  comment: String?
  
  # Calificaciones detalladas
  instructorRating: Int?
  equipmentRating: Int?
  locationRating: Int?
  valueRating: Int?
  
  # Moderación
  isPublished: Boolean (default: true)
  isVerified: Boolean (default: false)
}
```

**Características especiales:**
- Calificaciones granulares por aspecto
- Sistema de moderación
- Vinculado a reservas específicas
- Verificación de reseñas

#### 🏄‍♂️ **Equipment** - Gestión de Equipamiento
```prisma
model Equipment {
  id: String (CUID)
  schoolId: String
  
  name: String
  type: EquipmentType (SURFBOARD, WETSUIT, LEASH, WAX, FINS, HELMET, BOOTS, GLOVES, OTHER)
  brand: String?
  model: String?
  size: String?
  condition: EquipmentCondition (EXCELLENT, GOOD, FAIR, POOR, NEEDS_REPAIR)
  
  isAvailable: Boolean
  notes: String?
}
```

**Características especiales:**
- Tipos específicos de equipamiento de surf
- Estados de condición para mantenimiento
- Notas para detalles adicionales

## 🔗 Relaciones Principales

### Relaciones Uno a Muchos
- `School` → `Class` (Una escuela tiene muchas clases)
- `School` → `Equipment` (Una escuela tiene mucho equipamiento)
- `User` → `Reservation` (Un usuario tiene muchas reservas)
- `Class` → `Reservation` (Una clase tiene muchas reservas)
- `Reservation` → `Payment` (Una reserva puede tener múltiples pagos)

### Relaciones Uno a Uno
- `Reservation` → `Review` (Una reserva puede tener una reseña)
- `Reservation` → `Payment` (principal, aunque soporta múltiples)

### Relaciones Muchos a Muchos
- `User` ↔ `School` (a través de `SchoolMember`)
- `Class` ↔ `Equipment` (a través de `ClassEquipment`)

## 📊 Índices de Rendimiento

### Índices Principales
```sql
-- Usuarios
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Escuelas
CREATE INDEX idx_schools_slug ON schools(slug);
CREATE INDEX idx_schools_active ON schools(is_active);
CREATE INDEX idx_schools_city ON schools(city);

-- Clases
CREATE INDEX idx_classes_school ON classes(school_id);
CREATE INDEX idx_classes_date ON classes(date);
CREATE INDEX idx_classes_level ON classes(level);
CREATE INDEX idx_classes_active ON classes(is_active);
CREATE INDEX idx_classes_start_time ON classes(start_time);

-- Reservas
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_class ON reservations(class_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_created ON reservations(created_at);

-- Pagos
CREATE INDEX idx_payments_reservation ON payments(reservation_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);

-- Reseñas
CREATE INDEX idx_reviews_school ON reviews(school_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_published ON reviews(is_published);
```

## 🔒 Seguridad y Validaciones

### Restricciones de Integridad
- **Emails únicos**: Usuarios y escuelas
- **Slugs únicos**: Escuelas (para URLs)
- **Reservas únicas**: Un usuario no puede reservar la misma clase dos veces
- **Reseñas únicas**: Una reserva solo puede tener una reseña

### Validaciones de Negocio
- **Capacidad de clases**: No se pueden hacer más reservas que la capacidad
- **Fechas coherentes**: Hora de inicio < hora de fin
- **Rangos de edad**: 5-100 años
- **Rangos de peso/altura**: Valores realistas
- **Calificaciones**: 1-5 estrellas

## 🚀 Escalabilidad

### Preparado para Marketplace
- **Multi-tenant**: Cada escuela tiene sus datos aislados
- **Comisiones**: Sistema de comisiones configurable por escuela
- **Branding**: Cada escuela puede personalizar su apariencia
- **Geolocalización**: Búsqueda por ubicación

### Optimizaciones de Rendimiento
- **CUIDs**: Identificadores únicos distribuidos
- **Índices estratégicos**: En campos de búsqueda frecuente
- **Soft deletes**: Campos `isActive` en lugar de eliminación
- **Paginación**: Soporte nativo para paginación eficiente

## 🔄 Migraciones y Mantenimiento

### Comandos Útiles
```bash
# Generar cliente Prisma
npx prisma generate

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Resetear base de datos (desarrollo)
npx prisma migrate reset

# Abrir Prisma Studio
npx prisma studio

# Validar esquema
npx prisma validate
```

### Variables de Entorno Requeridas
```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/surfschool_db"
NEXTAUTH_SECRET="clave-secreta-para-nextauth"
NEXTAUTH_URL="http://localhost:3000"
```

## 📈 Métricas y Analytics

El esquema soporta análisis avanzados:
- **Ocupación por clase**: `capacity` vs reservas activas
- **Ingresos por período**: Suma de pagos por rango de fechas
- **Calificaciones promedio**: Por escuela, instructor, ubicación
- **Retención de usuarios**: Frecuencia de reservas por usuario
- **Equipamiento más usado**: Análisis de `ClassEquipment`

Este esquema proporciona una base sólida y escalable para la plataforma de reservas de surf, con todas las características necesarias para el funcionamiento actual y la expansión futura hacia un marketplace multi-escuela.