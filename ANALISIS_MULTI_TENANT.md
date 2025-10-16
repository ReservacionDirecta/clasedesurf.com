# 🏢 Análisis Multi-Tenant: Clase de Surf

## 📋 Estado Actual

### ✅ Implementación Existente

La aplicación **YA tiene** una estructura multi-tenant parcialmente implementada:

#### 1. Esquema de Base de Datos
```prisma
✅ School (Escuela)
  - id, name, location, ownerId
  - Relaciones: classes[], instructors[], students[]

✅ Instructor
  - schoolId (FK a School)
  - Pertenece a UNA escuela

✅ Student
  - schoolId (FK a School, opcional)
  - Puede pertenecer a una escuela

✅ Class
  - schoolId (FK a School)
  - Pertenece a UNA escuela

✅ Reservation
  - userId (FK a User)
  - classId (FK a Class)
  - Indirectamente vinculada a escuela vía Class

✅ Payment
  - reservationId (FK a Reservation)
  - Indirectamente vinculada a escuela vía Reservation → Class
```

#### 2. Roles Implementados
```typescript
enum UserRole {
  STUDENT       // Estudiante
  INSTRUCTOR    // Instructor
  ADMIN         // Administrador de plataforma
  SCHOOL_ADMIN  // Administrador de escuela
}
```

#### 3. Middleware Existente

**`requireAuth`** - Autenticación básica
- ✅ Verifica JWT token
- ✅ Extrae userId y role
- ❌ No extrae schoolId automáticamente

**`resolveSchool`** - Resolución de contexto de escuela
- ✅ Para SCHOOL_ADMIN: busca escuela por ownerId
- ✅ Para INSTRUCTOR: busca escuela por instructor.schoolId
- ✅ Agrega req.schoolId al request
- ⚠️ No se usa en todos los endpoints

**`requireRole`** - Verificación de roles
- ✅ Verifica que el usuario tenga el rol requerido
- ❌ No verifica permisos a nivel de escuela

## 🔍 Análisis por Rol

### 1. ADMIN (Administrador de Plataforma)

**Permisos Actuales:**
- ✅ Ver todas las escuelas
- ✅ Ver todos los usuarios
- ✅ Ver todas las clases
- ✅ Ver todos los pagos
- ✅ Ver todas las reservas

**Estado:** ✅ Correctamente implementado

### 2. SCHOOL_ADMIN (Administrador de Escuela)

**Permisos Requeridos:**
- ✅ Ver/editar SU escuela
- ✅ Ver/crear/editar clases de SU escuela
- ✅ Ver/crear/editar instructores de SU escuela
- ✅ Ver estudiantes de SU escuela
- ✅ Ver reservas de clases de SU escuela
- ✅ Ver pagos de clases de SU escuela
- ❌ NO ver datos de otras escuelas

**Implementación Actual:**
```typescript
// ✅ BIEN: Schools endpoint
router.put('/:id', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), 
  resolveSchool, async (req: AuthRequest, res) => {
    if (req.role === 'SCHOOL_ADMIN') {
      if (Number(id) !== req.schoolId) {
        return res.status(403).json({ message: 'You can only update your own school' });
      }
    }
  });

// ✅ BIEN: Payments endpoint
if (user.role === 'SCHOOL_ADMIN') {
  if (!req.schoolId) return res.status(404).json({ message: 'No school found' });
  whereClause.reservation = { class: { schoolId: Number(req.schoolId) } };
}

// ⚠️ FALTA: Classes endpoint - no verifica schoolId en algunos casos
// ⚠️ FALTA: Instructors endpoint - no verifica schoolId
```

**Estado:** ⚠️ Parcialmente implementado

### 3. INSTRUCTOR

**Permisos Requeridos:**
- ✅ Ver detalles de SU escuela
- ✅ Ver SUS clases asignadas
- ✅ Ver estudiantes de SUS clases
- ✅ Ver reservas de SUS clases
- ✅ Ver pagos de SUS clases
- ❌ NO ver clases de otros instructores
- ❌ NO ver datos de otras escuelas
- ❌ NO editar la escuela

**Implementación Actual:**
```typescript
// ⚠️ FALTA: No hay filtrado por instructor en la mayoría de endpoints
// ⚠️ FALTA: Classes endpoint no filtra por instructor
// ⚠️ FALTA: Students endpoint no filtra por clases del instructor
```

**Estado:** ❌ No implementado correctamente

### 4. STUDENT (Estudiante)

**Permisos Requeridos:**
- ✅ Ver SUS reservas
- ✅ Ver SUS pagos
- ✅ Ver clases disponibles (todas las escuelas)
- ✅ Ver detalles de clases que reservó
- ❌ NO ver reservas de otros estudiantes
- ❌ NO ver pagos de otros estudiantes

**Implementación Actual:**
```typescript
// ✅ BIEN: Payments endpoint
if (user.role !== 'ADMIN') {
  whereClause.reservation = { userId: Number(userId) };
}

// ⚠️ FALTA: Reservations endpoint - verificar implementación
```

**Estado:** ⚠️ Parcialmente implementado

## 🚨 Problemas Identificados

### 1. Classes Endpoint
```typescript
// ❌ PROBLEMA: No filtra por schoolId para SCHOOL_ADMIN
router.get('/', async (req, res) => {
  const classes = await prisma.class.findMany(); // Devuelve TODAS las clases
});

// ❌ PROBLEMA: No filtra por instructor para INSTRUCTOR
// Un instructor puede ver clases de otros instructores de su escuela
```

### 2. Instructors Endpoint
```typescript
// ❌ PROBLEMA: No existe endpoint para instructores
// ❌ FALTA: Filtrado por schoolId
// ❌ FALTA: Permisos para SCHOOL_ADMIN
```

### 3. Students Endpoint
```typescript
// ✅ BIEN: Filtra por schoolId para SCHOOL_ADMIN
if (user.role === 'SCHOOL_ADMIN') {
  where.schoolId = userSchool.id;
}

// ⚠️ FALTA: Filtrado por instructor (solo estudiantes de sus clases)
```

### 4. Reservations Endpoint
```typescript
// ⚠️ FALTA: Verificar que filtre correctamente por rol
// ⚠️ FALTA: INSTRUCTOR solo debe ver reservas de SUS clases
// ⚠️ FALTA: SCHOOL_ADMIN solo debe ver reservas de SU escuela
```

## 🎯 Mejoras Necesarias

### Prioridad Alta 🔴

#### 1. Crear Middleware de Autorización Multi-Tenant
```typescript
// backend/src/middleware/multi-tenant.ts

export const enforceSchoolAccess = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  // Para SCHOOL_ADMIN: verificar que el recurso pertenece a su escuela
  // Para INSTRUCTOR: verificar que el recurso pertenece a su escuela
  // Para STUDENT: verificar que el recurso le pertenece
  // Para ADMIN: permitir todo
};

export const enforceInstructorAccess = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  // Para INSTRUCTOR: verificar que el recurso es de sus clases
};
```

#### 2. Actualizar Classes Endpoint
```typescript
// GET /classes - Filtrar por schoolId y/o instructorId
router.get('/', requireAuth, resolveSchool, async (req: AuthRequest, res) => {
  const where: any = {};
  
  if (req.role === 'SCHOOL_ADMIN') {
    where.schoolId = req.schoolId;
  } else if (req.role === 'INSTRUCTOR') {
    // Filtrar por instructor
    where.schoolId = req.schoolId;
    where.instructor = req.userId; // Necesita ajuste en schema
  }
  
  const classes = await prisma.class.findMany({ where });
});
```

#### 3. Crear Instructors Endpoint
```typescript
// GET /instructors - Solo instructores de la escuela
router.get('/', requireAuth, resolveSchool, async (req: AuthRequest, res) => {
  const where: any = {};
  
  if (req.role === 'SCHOOL_ADMIN') {
    where.schoolId = req.schoolId;
  } else if (req.role === 'INSTRUCTOR') {
    // Solo ver su propio perfil
    where.userId = req.userId;
  }
  
  const instructors = await prisma.instructor.findMany({ where });
});
```

#### 4. Actualizar Reservations Endpoint
```typescript
// GET /reservations - Filtrar por rol
router.get('/', requireAuth, resolveSchool, async (req: AuthRequest, res) => {
  const where: any = {};
  
  if (req.role === 'SCHOOL_ADMIN') {
    where.class = { schoolId: req.schoolId };
  } else if (req.role === 'INSTRUCTOR') {
    where.class = { 
      schoolId: req.schoolId,
      instructor: req.userId // Necesita ajuste
    };
  } else if (req.role === 'STUDENT') {
    where.userId = req.userId;
  }
  
  const reservations = await prisma.reservation.findMany({ where });
});
```

### Prioridad Media 🟡

#### 5. Mejorar Schema de Prisma
```prisma
model Class {
  // Cambiar instructor de String a relación
  instructorId Int?
  instructor   Instructor? @relation(fields: [instructorId], references: [id])
  
  // Mantener nombre del instructor como campo opcional
  instructorName String?
}
```

#### 6. Agregar Índices para Performance
```prisma
model Class {
  @@index([schoolId])
  @@index([instructorId])
}

model Instructor {
  @@index([schoolId])
}

model Student {
  @@index([schoolId])
}
```

### Prioridad Baja 🟢

#### 7. Agregar Logging de Accesos
```typescript
// Registrar quién accede a qué recursos
console.log(`[ACCESS] User ${req.userId} (${req.role}) accessed ${req.path}`);
```

#### 8. Agregar Tests de Autorización
```typescript
// Verificar que cada rol solo puede acceder a sus recursos
describe('Multi-tenant Authorization', () => {
  it('SCHOOL_ADMIN cannot access other schools', async () => {
    // Test
  });
  
  it('INSTRUCTOR cannot access other instructors classes', async () => {
    // Test
  });
});
```

## 📊 Resumen de Estado

| Componente | ADMIN | SCHOOL_ADMIN | INSTRUCTOR | STUDENT | Estado |
|------------|-------|--------------|------------|---------|--------|
| Schools | ✅ | ✅ | ⚠️ | ❌ | Parcial |
| Classes | ✅ | ⚠️ | ❌ | ✅ | Necesita mejoras |
| Instructors | ✅ | ❌ | ❌ | ❌ | No implementado |
| Students | ✅ | ✅ | ❌ | ✅ | Parcial |
| Reservations | ✅ | ⚠️ | ❌ | ✅ | Necesita mejoras |
| Payments | ✅ | ✅ | ❌ | ✅ | Parcial |

**Leyenda:**
- ✅ Correctamente implementado
- ⚠️ Parcialmente implementado
- ❌ No implementado

## 🎯 Plan de Acción

### Fase 1: Correcciones Críticas (1-2 días)
1. ✅ Crear middleware `enforceSchoolAccess`
2. ✅ Actualizar Classes endpoint
3. ✅ Crear Instructors endpoint
4. ✅ Actualizar Reservations endpoint

### Fase 2: Mejoras de Schema (1 día)
1. ✅ Migración para agregar instructorId a Class
2. ✅ Actualizar relaciones en Prisma
3. ✅ Migrar datos existentes

### Fase 3: Testing y Validación (1 día)
1. ✅ Tests de autorización
2. ✅ Verificar todos los endpoints
3. ✅ Documentar permisos

## 📝 Próximos Pasos

¿Quieres que implemente las mejoras? Puedo:

1. **Crear el middleware de multi-tenant** completo
2. **Actualizar todos los endpoints** con filtrado correcto
3. **Crear migración de Prisma** para mejorar el schema
4. **Agregar tests** de autorización
5. **Documentar** todos los permisos por rol

¿Por cuál empezamos?

---

**Fecha:** 2025-10-16  
**Estado:** Análisis completado  
**Prioridad:** Alta - Requiere implementación
