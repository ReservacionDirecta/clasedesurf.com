# Implementación de Multi-Tenancy (Aislamiento por Escuela)

## Resumen
Se ha implementado un sistema de multi-tenancy completo que garantiza que cada escuela solo pueda ver y gestionar sus propios datos (instructores, clases, reservas, pagos, estudiantes).

## Cambios en Backend

### 1. Middleware de Autenticación Extendido
**Archivo**: `backend/src/middleware/auth.ts`
- Se agregó `schoolId?: number` a la interfaz `AuthRequest`
- Permite transportar el contexto de la escuela en cada request

### 2. Nuevo Middleware: Resolución de Escuela
**Archivo**: `backend/src/middleware/resolve-school.ts`
- Resuelve automáticamente el `schoolId` para usuarios con rol `SCHOOL_ADMIN`
- Busca la escuela donde `ownerId` coincide con el `userId` del token
- Adjunta `req.schoolId` para uso en los controladores
- Retorna 404 si un `SCHOOL_ADMIN` no tiene escuela asociada

### 3. Rutas Protegidas y Scoped

#### Classes (`backend/src/routes/classes.ts`)
- **POST /classes**: 
  - Requiere autenticación y rol `ADMIN` o `SCHOOL_ADMIN`
  - Si es `SCHOOL_ADMIN`, fuerza `schoolId` a su propia escuela
  - Usa middleware `resolveSchool`
- **PUT /classes/:id**:
  - Verifica que la clase pertenezca a la escuela del `SCHOOL_ADMIN`
  - `ADMIN` puede editar cualquier clase
- **DELETE /classes/:id**:
  - Verifica ownership antes de eliminar
  - Solo `ADMIN` o `SCHOOL_ADMIN` (de su propia escuela)

#### Reservations (`backend/src/routes/reservations.ts`)
- **GET /reservations**:
  - `ADMIN`: ve todas las reservas
  - `SCHOOL_ADMIN`: solo reservas de clases de su escuela (`class.schoolId == req.schoolId`)
  - `STUDENT`: solo sus propias reservas

#### Payments (`backend/src/routes/payments.ts`)
- **GET /payments**:
  - `ADMIN`: todos los pagos
  - `SCHOOL_ADMIN`: solo pagos de reservas de su escuela
  - `STUDENT`: solo sus propios pagos
- **GET /payments/:id**:
  - Verifica que el pago pertenezca a la escuela del `SCHOOL_ADMIN`
- **PUT /payments/:id**:
  - `SCHOOL_ADMIN` solo puede actualizar pagos de su escuela

#### Schools (`backend/src/routes/schools.ts`)
- **PUT /schools/:id**:
  - `SCHOOL_ADMIN` solo puede actualizar su propia escuela
  - Verifica que `id` del parámetro coincida con `req.schoolId`

#### Instructors (`backend/src/routes/instructors.ts`)
- **GET /instructors**:
  - Ya implementado: filtra por `schoolId` para `SCHOOL_ADMIN`
- **POST /instructors** y **POST /instructors/create-with-user**:
  - Ya implementado: fuerza `schoolId` del `SCHOOL_ADMIN`
- **PUT /instructors/:id** y **DELETE /instructors/:id**:
  - Ya implementado: verifica ownership de la escuela

## Cambios en Frontend

### Rutas API (Proxies)
Los proxies en `frontend/src/app/api/*` ya están configurados para:
- Pasar el header `Authorization` al backend
- El backend usa el token para identificar el usuario y su escuela
- No es necesario pasar `schoolId` manualmente desde el frontend

### Componentes de Dashboard

#### Dashboard de Escuela (`/dashboard/school/*`)
- Todos los componentes ya usan el token de autenticación
- El backend automáticamente filtra los datos por `schoolId`
- No requieren cambios adicionales

#### Dashboard de Admin (`/dashboard/admin/*`)
- Los admins pueden ver datos de todas las escuelas
- Pueden filtrar por `schoolId` si lo desean (opcional)

#### Dashboard de Instructor (`/dashboard/instructor/*`)
- Los instructores ven solo las clases de su escuela
- Filtrado automático por el backend

#### Dashboard de Estudiante (`/dashboard/student/*`)
- Los estudiantes ven solo sus propias reservas y pagos
- Filtrado automático por `userId`

## Flujo de Autenticación y Scoping

```
1. Usuario se autentica → Recibe JWT con { userId, role }
2. Frontend envía requests con header Authorization: Bearer <token>
3. Backend middleware `requireAuth` decodifica token → req.userId, req.role
4. Backend middleware `resolveSchool` (si es SCHOOL_ADMIN) → req.schoolId
5. Controladores usan req.schoolId para filtrar queries
6. Respuesta solo contiene datos de la escuela del usuario
```

## Seguridad

### Protecciones Implementadas
1. **Token-based**: Solo usuarios autenticados pueden acceder
2. **Role-based**: Cada endpoint verifica roles permitidos
3. **Tenant-scoped**: Queries filtradas por `schoolId` automáticamente
4. **Ownership checks**: Verificación explícita antes de mutaciones
5. **No bypass**: Frontend no puede pasar `schoolId` arbitrario

### Casos Cubiertos
- ✅ SCHOOL_ADMIN no puede ver clases de otra escuela
- ✅ SCHOOL_ADMIN no puede editar instructores de otra escuela
- ✅ SCHOOL_ADMIN no puede ver reservas de otra escuela
- ✅ SCHOOL_ADMIN no puede ver/editar pagos de otra escuela
- ✅ SCHOOL_ADMIN no puede editar otra escuela
- ✅ Estudiantes solo ven sus propias reservas
- ✅ ADMIN tiene acceso completo (sin restricciones)

## Testing Recomendado

### Tests Unitarios
```typescript
// Ejemplo: Verificar que SCHOOL_ADMIN no puede ver clases de otra escuela
describe('GET /classes', () => {
  it('should return only classes from school admin\'s school', async () => {
    const token = generateToken({ userId: 1, role: 'SCHOOL_ADMIN' });
    const response = await request(app)
      .get('/classes')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.body.every(c => c.schoolId === 1)).toBe(true);
  });
});
```

### Tests E2E
1. Crear dos escuelas con datos diferentes
2. Autenticarse como SCHOOL_ADMIN de escuela 1
3. Intentar acceder a datos de escuela 2
4. Verificar que retorna 403 o datos vacíos

## Próximos Pasos Opcionales

### 1. Prisma Middleware (Recomendado)
Implementar middleware de Prisma para auto-scope todas las queries:
```typescript
prisma.$use(async (params, next) => {
  if (params.model && hasSchoolId(params.model)) {
    if (params.action === 'findMany' || params.action === 'findFirst') {
      params.args.where = { ...params.args.where, schoolId: currentSchoolId };
    }
  }
  return next(params);
});
```

### 2. Migraciones de Base de Datos
- Agregar constraints únicos por escuela: `UNIQUE(schoolId, email)` en instructores
- Agregar índices: `CREATE INDEX idx_classes_schoolId ON classes(schoolId)`
- Backfill de datos legacy si existen

### 3. Frontend Enhancements
- Agregar indicador visual de escuela actual en navbar
- Mostrar nombre de escuela en dashboard
- Agregar filtros por escuela en dashboard de ADMIN

### 4. Auditoría y Logs
- Registrar accesos cross-tenant bloqueados
- Dashboard de seguridad para ADMIN
- Alertas de intentos de acceso no autorizados

## Notas Importantes

1. **No eliminar middleware**: El orden de middlewares es crítico:
   ```typescript
   router.post('/', requireAuth, requireRole(['ADMIN', 'SCHOOL_ADMIN']), resolveSchool, handler);
   ```

2. **Siempre usar req.schoolId**: En controladores de SCHOOL_ADMIN, siempre usar `req.schoolId` en lugar de confiar en parámetros del body o query.

3. **Testing exhaustivo**: Probar cada endpoint con diferentes roles antes de deployment.

4. **Documentación**: Mantener este documento actualizado con cualquier cambio en la lógica de multi-tenancy.

## Contacto y Soporte
Para dudas sobre la implementación de multi-tenancy, revisar:
- Este documento
- Código en `backend/src/middleware/resolve-school.ts`
- Ejemplos en `backend/src/routes/classes.ts`
