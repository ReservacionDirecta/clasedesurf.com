# Multi-Tenancy para Instructores y Head Coaches

## Resumen

Se ha implementado el aislamiento completo de datos para los roles **INSTRUCTOR** y **HEAD_COACH**. Cada instructor solo puede ver y gestionar datos de su propia escuela.

## 🔐 Implementación Backend

### 1. Middleware Actualizado

**Archivo**: `backend/src/middleware/resolve-school.ts`

El middleware `resolveSchool` ahora soporta el rol `INSTRUCTOR`:

```typescript
// INSTRUCTOR: find school through instructor profile
if (req.role === 'INSTRUCTOR') {
  const instructor = await prisma.instructor.findUnique({ 
    where: { userId: Number(req.userId) },
    select: { schoolId: true }
  });
  
  if (!instructor) {
    return res.status(404).json({ message: 'No instructor profile found' });
  }

  req.schoolId = instructor.schoolId;
  return next();
}
```

### 2. Nuevas Rutas para Instructores

**Archivo**: `backend/src/routes/instructor-classes.ts`

#### GET /instructor/classes
- Retorna todas las clases de la escuela del instructor
- Incluye información de reservas y estudiantes
- Filtrado automático por `schoolId`

**Respuesta**:
```json
{
  "instructor": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "schoolId": 1
  },
  "classes": [
    {
      "id": 1,
      "title": "Surf para Principiantes",
      "date": "2025-10-15T10:00:00Z",
      "duration": 120,
      "capacity": 8,
      "school": { ... },
      "reservations": [ ... ]
    }
  ]
}
```

#### GET /instructor/profile
- Retorna el perfil completo del instructor
- Incluye información de la escuela
- Incluye reviews recientes

**Respuesta**:
```json
{
  "id": 1,
  "userId": 5,
  "schoolId": 1,
  "bio": "Instructor con 10 años de experiencia",
  "yearsExperience": 10,
  "specialties": ["Surf para principiantes", "Longboard"],
  "certifications": ["ISA Level 1"],
  "rating": 4.8,
  "totalReviews": 45,
  "user": {
    "id": 5,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "+51999999999"
  },
  "school": {
    "id": 1,
    "name": "Escuela de Surf Lima",
    "location": "Miraflores, Lima"
  },
  "reviews": [ ... ]
}
```

#### GET /instructor/students
- Retorna todos los estudiantes que han tomado clases en la escuela
- Agrupa reservas por estudiante
- Solo muestra estudiantes con reservas activas

**Respuesta**:
```json
[
  {
    "id": 10,
    "name": "María García",
    "email": "maria@example.com",
    "phone": "+51888888888",
    "age": 25,
    "canSwim": true,
    "classes": [
      {
        "id": 1,
        "title": "Surf para Principiantes",
        "date": "2025-10-15T10:00:00Z",
        "level": "BEGINNER",
        "reservationStatus": "CONFIRMED",
        "paymentStatus": "PAID"
      }
    ],
    "totalReservations": 3
  }
]
```

#### GET /instructor/earnings
- Retorna resumen de ganancias de la escuela
- Agrupa por mes
- Solo muestra pagos confirmados

**Respuesta**:
```json
{
  "totalEarnings": 12500,
  "totalClasses": 45,
  "totalPayments": 127,
  "earningsByMonth": [
    {
      "month": "2025-10",
      "total": 3500,
      "count": 35
    }
  ],
  "recentPayments": [ ... ]
}
```

## 🎨 Frontend - Rutas API

Se crearon proxies en el frontend para los endpoints de instructor:

### Rutas Creadas

1. **`/api/instructor/classes`** → `GET /instructor/classes`
2. **`/api/instructor/profile`** → `GET /instructor/profile`
3. **`/api/instructor/students`** → `GET /instructor/students`
4. **`/api/instructor/earnings`** → `GET /instructor/earnings`

Todas las rutas:
- Requieren autenticación (token JWT)
- Pasan el header `Authorization` al backend
- El backend filtra automáticamente por `schoolId`

## 🛡️ Seguridad Garantizada

### Casos de Uso Cubiertos

| Acción | Instructor | Head Coach | School Admin | Admin |
|--------|-----------|------------|--------------|-------|
| Ver clases de su escuela | ✅ | ✅ | ✅ | ✅ |
| Ver clases de otra escuela | ❌ | ❌ | ❌ | ✅ |
| Ver estudiantes de su escuela | ✅ | ✅ | ✅ | ✅ |
| Ver estudiantes de otra escuela | ❌ | ❌ | ❌ | ✅ |
| Ver ganancias de su escuela | ✅ | ✅ | ✅ | ✅ |
| Ver ganancias de otra escuela | ❌ | ❌ | ❌ | ✅ |

### Validaciones Implementadas

1. **Token JWT**: Todos los endpoints requieren autenticación
2. **Rol verificado**: Solo usuarios con rol `INSTRUCTOR` pueden acceder
3. **SchoolId resuelto**: El middleware `resolveSchool` obtiene automáticamente el `schoolId` del instructor
4. **Queries filtradas**: Todas las consultas incluyen `WHERE schoolId = req.schoolId`
5. **Sin bypass**: No es posible pasar un `schoolId` diferente desde el frontend

## 📋 Flujo de Autenticación

```
1. Instructor se autentica → JWT { userId: 5, role: 'INSTRUCTOR' }
2. Frontend → Authorization: Bearer <token>
3. Backend requireAuth → decodifica token → req.userId = 5, req.role = 'INSTRUCTOR'
4. Backend resolveSchool → busca instructor con userId = 5 → req.schoolId = 1
5. Controlador → filtra queries por schoolId = 1
6. Respuesta → solo datos de la escuela 1
```

## 🎯 Diferencias entre Roles

### INSTRUCTOR
- Ve todas las clases de su escuela
- Ve todos los estudiantes de su escuela
- Ve ganancias totales de su escuela
- **No puede** crear/editar/eliminar clases (solo SCHOOL_ADMIN)
- **No puede** crear/editar instructores (solo SCHOOL_ADMIN)

### HEAD_COACH
- Mismo acceso que INSTRUCTOR
- Campo `instructorRole` en la base de datos distingue entre `INSTRUCTOR` y `HEAD_COACH`
- Puede tener permisos adicionales en el frontend (UI diferenciada)

### SCHOOL_ADMIN
- Puede crear/editar/eliminar clases
- Puede crear/editar/eliminar instructores
- Puede ver y gestionar todos los datos de su escuela
- **No puede** ver/editar datos de otras escuelas

## 📁 Archivos Creados/Modificados

### Backend
- ✅ `backend/src/middleware/resolve-school.ts` (modificado)
- ✅ `backend/src/routes/instructor-classes.ts` (nuevo)
- ✅ `backend/src/server.ts` (modificado - registra ruta `/instructor`)

### Frontend
- ✅ `frontend/src/app/api/instructor/classes/route.ts` (nuevo)
- ✅ `frontend/src/app/api/instructor/profile/route.ts` (nuevo)
- ✅ `frontend/src/app/api/instructor/students/route.ts` (nuevo)
- ✅ `frontend/src/app/api/instructor/earnings/route.ts` (nuevo)

### Documentación
- ✅ `INSTRUCTOR_MULTI_TENANCY.md` (este archivo)

## 🚀 Uso en el Frontend

### Ejemplo: Obtener clases del instructor

```typescript
const fetchInstructorClasses = async () => {
  const token = session?.backendToken;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const response = await fetch('/api/instructor/classes', { headers });
  const data = await response.json();
  
  // data.instructor contiene info del instructor
  // data.classes contiene clases de su escuela
  setClasses(data.classes);
};
```

### Ejemplo: Obtener perfil del instructor

```typescript
const fetchProfile = async () => {
  const token = session?.backendToken;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const response = await fetch('/api/instructor/profile', { headers });
  const profile = await response.json();
  
  // profile contiene toda la info del instructor + escuela
  setProfile(profile);
};
```

## 🧪 Testing

### Pruebas Manuales

1. **Crear dos instructores en escuelas diferentes**
   ```sql
   -- Instructor 1 en Escuela 1
   INSERT INTO instructors (userId, schoolId, ...) VALUES (5, 1, ...);
   
   -- Instructor 2 en Escuela 2
   INSERT INTO instructors (userId, schoolId, ...) VALUES (6, 2, ...);
   ```

2. **Autenticarse como Instructor 1**
   - Obtener clases → Solo clases de Escuela 1
   - Obtener estudiantes → Solo estudiantes de Escuela 1

3. **Autenticarse como Instructor 2**
   - Obtener clases → Solo clases de Escuela 2
   - Obtener estudiantes → Solo estudiantes de Escuela 2

4. **Verificar aislamiento**
   - Instructor 1 no puede ver datos de Escuela 2
   - Instructor 2 no puede ver datos de Escuela 1

### Pruebas Automatizadas (Recomendado)

```typescript
describe('Instructor Multi-tenancy', () => {
  it('should only return classes from instructor school', async () => {
    const token = generateToken({ userId: 5, role: 'INSTRUCTOR' });
    const response = await request(app)
      .get('/instructor/classes')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.body.classes.every(c => c.schoolId === 1)).toBe(true);
  });

  it('should not allow instructor to access another school data', async () => {
    const token = generateToken({ userId: 5, role: 'INSTRUCTOR' });
    const response = await request(app)
      .get('/classes?schoolId=2')
      .set('Authorization', `Bearer ${token}`);
    
    // Should still only return classes from school 1
    expect(response.body.every(c => c.schoolId === 1)).toBe(true);
  });
});
```

## ⚠️ Notas Importantes

1. **HEAD_COACH vs INSTRUCTOR**: Actualmente ambos tienen el mismo acceso a nivel de backend. La diferenciación se puede hacer en el frontend mediante el campo `instructorRole`.

2. **Permisos de escritura**: Los instructores tienen acceso de **solo lectura**. No pueden crear/editar/eliminar clases o instructores.

3. **Ganancias**: Los instructores ven las ganancias totales de la escuela, no solo de sus clases. Si se requiere filtrar por instructor específico, se debe agregar un campo `instructorId` en la tabla `Class`.

4. **Middleware order**: El orden de middlewares es crítico:
   ```typescript
   router.get('/classes', requireAuth, resolveSchool, handler);
   ```

## 🔄 Próximos Pasos Opcionales

### 1. Filtrar clases por instructor específico
Agregar campo `instructorId` en tabla `Class`:
```prisma
model Class {
  // ...
  instructorId Int?
  instructor   Instructor? @relation(fields: [instructorId], references: [id])
}
```

### 2. Permisos diferenciados para HEAD_COACH
Permitir que HEAD_COACH pueda:
- Asignar instructores a clases
- Ver reportes más detallados
- Gestionar horarios de instructores

### 3. Dashboard específico para instructores
Crear componentes visuales que muestren:
- Calendario de clases asignadas
- Lista de estudiantes por clase
- Estadísticas de asistencia
- Feedback de estudiantes

## ✅ Estado Final

- ✅ Backend: Aislamiento completo para INSTRUCTOR
- ✅ Middleware: Resuelve schoolId automáticamente
- ✅ Rutas: 4 endpoints nuevos para instructores
- ✅ Frontend: Proxies API creados
- ✅ Documentación: Completa

**Sistema listo para que instructores accedan solo a datos de su escuela.**
