# Implementación de Sistema HEAD_COACH

## Resumen

Se ha implementado un sistema de roles para instructores que diferencia entre **INSTRUCTOR** regular y **HEAD_COACH** (coordinador), con portales dedicados y funcionalidades específicas.

## Cambios Realizados

### 1. Backend

#### Prisma Schema (`backend/prisma/schema.prisma`)
- ✅ Agregado campo `instructorRole` al modelo `Instructor`
- ✅ Creado enum `InstructorRole` con valores: `INSTRUCTOR`, `HEAD_COACH`
- ✅ Valor por defecto: `INSTRUCTOR`

```prisma
model Instructor {
  // ... otros campos
  instructorRole  InstructorRole @default(INSTRUCTOR)
}

enum InstructorRole {
  INSTRUCTOR
  HEAD_COACH
}
```

#### Routes (`backend/src/routes/instructors.ts`)
- ✅ Actualizado endpoint `POST /instructors/create-with-user` para recibir `instructorRole`
- ✅ El campo se guarda en la base de datos al crear instructor

### 2. Frontend

#### Formulario de Creación (`frontend/src/components/forms/SimpleInstructorForm.tsx`)
- ✅ Agregado selector de rol con opciones:
  - **Instructor**: Rol regular con acceso a calendario personal
  - **Head Coach (Coordinador)**: Acceso a dashboard especial con gestión completa
- ✅ El rol seleccionado se envía al backend en la creación
- ✅ Descripción dinámica según rol seleccionado

#### Dashboard HEAD_COACH (`frontend/src/app/dashboard/head-coach/page.tsx`)
- ✅ Dashboard dedicado con vista ejecutiva
- ✅ **Stats Cards**:
  - Clases del día
  - Instructores activos
  - Próxima clase
  - Porcentaje de ocupación
- ✅ **Resumen de Clases del Día**:
  - Lista de clases programadas
  - Estado (próxima, en curso, completada)
  - Instructor asignado
  - Capacidad y estudiantes inscritos
- ✅ **Instructores Programados**:
  - Lista de instructores del día
  - Cantidad de clases asignadas
  - Próxima clase
  - Estado (disponible, ocupado, no disponible)
- ✅ **Acciones Rápidas**:
  - Ver Calendario
  - Gestionar Instructores
  - Programar Clases
  - Ver Reportes

#### Calendario HEAD_COACH (`frontend/src/app/dashboard/head-coach/calendar/page.tsx`)
- ✅ Vista de calendario mensual
- ✅ Navegación entre meses
- ✅ Indicadores visuales de días con clases
- ✅ Lista detallada de clases por fecha
- ✅ Información completa: instructor, ubicación, nivel, capacidad

## Pendientes (Requieren acción manual)

### Backend
1. **Ejecutar migración de Prisma**:
   ```bash
   cd backend
   npx prisma migrate dev --name add_instructor_role
   npx prisma generate
   ```

2. **Crear endpoints para dashboard HEAD_COACH**:
   - `GET /api/head-coach/dashboard` - Stats y resumen del día
   - `GET /api/head-coach/classes/today` - Clases del día
   - `GET /api/head-coach/instructors/schedule` - Horarios de instructores
   - `GET /api/head-coach/calendar` - Clases del mes

3. **Actualizar middleware de autenticación**:
   - Agregar verificación de `instructorRole` en rutas protegidas
   - Permitir acceso a rutas `/dashboard/head-coach/*` solo a usuarios con rol HEAD_COACH

### Frontend
1. **Conectar datos reales**:
   - Reemplazar datos mock en dashboards con llamadas a API
   - Implementar fetch de clases y instructores desde backend

2. **Rutas adicionales** (opcional):
   - `/dashboard/head-coach/instructors` - Gestión de instructores
   - `/dashboard/head-coach/classes` - Programación de clases
   - `/dashboard/head-coach/reports` - Reportes y estadísticas

3. **Redirección basada en rol**:
   - Actualizar lógica de login para redirigir HEAD_COACH a su dashboard
   - Actualizar middleware de NextAuth para validar acceso

## Flujo de Uso

### Crear un HEAD_COACH
1. Ir a `http://localhost:3000/dashboard/school/instructors`
2. Click en "Nuevo Instructor"
3. Llenar formulario:
   - Nombre, Email, Teléfono, Contraseña
   - **Seleccionar "Head Coach (Coordinador)"** en el selector de rol
4. Crear instructor

### Acceder al Dashboard HEAD_COACH
1. Login con credenciales del HEAD_COACH
2. Navegar a `http://localhost:3000/dashboard/head-coach`
3. Ver resumen ejecutivo con:
   - Clases del día
   - Instructores programados
   - Estadísticas generales

### Ver Calendario
1. Desde dashboard HEAD_COACH, click en "Ver Calendario"
2. O navegar a `http://localhost:3000/dashboard/head-coach/calendar`
3. Ver calendario mensual con todas las clases
4. Click en un día para filtrar clases

## Diferencias entre Roles

| Característica | INSTRUCTOR | HEAD_COACH |
|---------------|-----------|------------|
| Dashboard | Personal con sus clases | Ejecutivo con todas las clases |
| Calendario | Solo sus clases asignadas | Todas las clases de la escuela |
| Gestión de Instructores | No | Sí (ver horarios y disponibilidad) |
| Estadísticas | Personales | Generales de la escuela |
| Programación | Ver sus clases | Asignar clases a instructores |

## Próximos Pasos Recomendados

1. **Ejecutar migración de Prisma** (crítico)
2. **Implementar endpoints de backend** para datos reales
3. **Agregar validación de rol** en middleware de autenticación
4. **Implementar gestión de instructores** desde dashboard HEAD_COACH
5. **Agregar sistema de notificaciones** para cambios en horarios
6. **Crear reportes y analytics** para HEAD_COACH

## Notas Técnicas

- El campo `instructorRole` es independiente del `UserRole`
- Un usuario con `UserRole.INSTRUCTOR` puede tener `instructorRole: HEAD_COACH`
- Los datos actuales en dashboards son mock/ejemplo
- Se requiere regenerar Prisma Client para que TypeScript reconozca el nuevo campo
- Las rutas HEAD_COACH están creadas pero requieren protección con middleware

## Testing

Para probar la funcionalidad:

1. Crear un instructor con rol HEAD_COACH desde el dashboard de escuela
2. Hacer login con ese usuario
3. Navegar manualmente a `/dashboard/head-coach`
4. Verificar que se muestra el dashboard con datos de ejemplo
5. Navegar a `/dashboard/head-coach/calendar` para ver el calendario

**Nota**: Actualmente no hay redirección automática. Se debe navegar manualmente a las rutas.
