# Documentación: Página de Administración de Reservas

## URL

`https://clasedesurf.com/dashboard/admin/reservations?classId=1`

## Funcionalidad General

Esta página permite a los administradores gestionar todas las reservas del sistema, con la opción de filtrar por clase específica.

## Componentes Principales

### 1. **Filtros**

- **Por Estado**: ALL, PENDING, CONFIRMED, PAID, CANCELED, COMPLETED
- **Por Clase**: Cuando se proporciona `?classId=X` en la URL, filtra solo las reservas de esa clase

### 2. **Estadísticas**

Muestra contadores para:

- Total de reservas
- Pendientes
- Confirmadas
- Pagadas
- Canceladas
- Completadas
- Ingresos totales (solo si hay reservas con pagos)

### 3. **Lista de Reservas**

Cada reserva muestra:

- **ID de reserva**
- **Estado** (con badge de color)
- **Información del estudiante**: nombre, email, teléfono
- **Información de la clase**: título, escuela, fecha, hora, duración
- **Información de pago**: monto, estado, método

### 4. **Acciones Disponibles**

#### a) Ver Reserva del Estudiante

- Botón azul "Ver Reserva del Estudiante"
- Abre `/reservations/{id}` en nueva pestaña
- Muestra la vista del estudiante con todos los detalles

#### b) Cambiar Estado

- Dropdown con opciones:
  - PENDING (Pendiente)
  - CONFIRMED (Confirmada)
  - PAID (Pagada)
  - CANCELED (Cancelada)
  - COMPLETED (Completada)
- **Endpoint**: `PUT /api/reservations/:id`
- **Payload**: `{ status: "NUEVO_ESTADO" }`

#### c) Eliminar Reserva

- Botón rojo "Eliminar Reserva"
- Abre modal de confirmación
- **Endpoint**: `DELETE /api/reservations/:id`
- **Restricción**: Solo ADMIN puede eliminar

## Flujo de Eliminación de Reserva

### Frontend (`/dashboard/admin/reservations/page.tsx`)

```typescript
// 1. Usuario hace clic en "Eliminar Reserva"
onClick={() => {
  setSelectedReservation(reservation);
  setShowDeleteModal(true);
}}

// 2. Modal de confirmación se muestra
{showDeleteModal && selectedReservation && (
  <DeleteConfirmationModal
    onConfirm={handleDeleteReservation}
    onCancel={() => {
      setShowDeleteModal(false);
      setSelectedReservation(null);
    }}
    reservation={selectedReservation}
  />
)}

// 3. Usuario confirma eliminación
const handleDeleteReservation = async () => {
  const res = await fetch(`/api/reservations/${selectedReservation.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (res.ok) {
    // Actualizar lista local
    setReservations(reservations.filter(r => r.id !== selectedReservation.id));
    setShowDeleteModal(false);
    alert('Reserva eliminada exitosamente');
  }
}
```

### Backend (`backend/src/routes/reservations.ts`)

```typescript
router.delete(
  "/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  validateParams(reservationIdSchema),
  async (req, res) => {
    // 1. Buscar la reserva
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { payment: true },
    });

    // 2. Eliminar pago relacionado (si existe)
    if (reservation.payment) {
      await prisma.payment.delete({
        where: { id: reservation.payment.id },
      });
    }

    // 3. Eliminar la reserva
    await prisma.reservation.delete({
      where: { id: reservationId },
    });

    res.json({ message: "Reserva eliminada exitosamente" });
  }
);
```

## Errores Comunes

### 1. DELETE /api/reservations/4 → 404

**Causa**: El endpoint DELETE no está desplegado en producción
**Solución**:

- ✅ Endpoint agregado en `backend/src/routes/reservations.ts`
- ✅ Backend desplegado con `docker-build.ps1 backend -Push`
- ⏳ Esperar a que Railway actualice el servicio

### 2. DELETE /api/classes/1 → 400

**Causa**: Intentando eliminar una clase que tiene reservas activas
**Mensaje**: "No se puede eliminar la clase porque tiene X reserva(s) activa(s)"
**Solución**:

1. Primero cancelar o eliminar todas las reservas activas de la clase
2. Luego eliminar la clase

## Relación con Eliminación de Clases

### Flujo de Eliminación de Clase

```typescript
// Backend: backend/src/routes/classes.ts
router.delete('/:id', async (req, res) => {
  // 1. Verificar reservas activas
  const activeReservations = class.reservations.filter(
    r => r.status !== 'CANCELED'
  );

  // 2. Si hay reservas activas, rechazar
  if (activeReservations.length > 0) {
    return res.status(400).json({
      message: `No se puede eliminar la clase porque tiene ${activeReservations.length} reserva(s) activa(s)`
    });
  }

  // 3. Eliminar reservas canceladas
  const canceledReservations = class.reservations.filter(
    r => r.status === 'CANCELED'
  );

  for (const reservation of canceledReservations) {
    if (reservation.payment) {
      await prisma.payment.delete({ where: { id: reservation.payment.id } });
    }
    await prisma.reservation.delete({ where: { id: reservation.id } });
  }

  // 4. Eliminar la clase
  await prisma.class.delete({ where: { id: classId } });
});
```

## Proceso Recomendado para Eliminar una Clase

1. **Ir a la página de reservas de la clase**:

   ```
   /dashboard/admin/reservations?classId=1
   ```

2. **Cancelar o eliminar todas las reservas activas**:

   - Opción A: Cambiar estado a "CANCELED"
   - Opción B: Eliminar cada reserva

3. **Ir a la página de clases**:

   ```
   /dashboard/admin/classes
   ```

4. **Eliminar la clase**:
   - Ahora debería permitir la eliminación

## Estado Actual del Sistema

### ✅ Implementado

- Endpoint DELETE para reservas
- Modal de confirmación de eliminación
- Validación de roles (solo ADMIN)
- Eliminación en cascada de pagos
- Prevención de eliminación de clases con reservas activas

### 🔄 En Deployment

- Backend desplegado con nuevos endpoints
- Frontend desplegado con nueva UI

### ⏳ Pendiente

- Esperar a que Railway actualice el servicio backend
- Verificar que el endpoint DELETE funcione en producción

## Testing

### Probar Eliminación de Reserva

1. Ir a `/dashboard/admin/reservations`
2. Hacer clic en "Eliminar Reserva" en cualquier reserva
3. Confirmar en el modal
4. Verificar que la reserva desaparece de la lista
5. Verificar en la base de datos que se eliminó

### Probar Eliminación de Clase con Reservas

1. Intentar eliminar una clase con reservas activas
2. Debe mostrar error 400
3. Cancelar/eliminar todas las reservas
4. Intentar eliminar la clase nuevamente
5. Debe eliminar exitosamente

## Logs para Debugging

### Frontend

```javascript
console.log("[DELETE] Deleting reservation:", reservationId);
console.log("[DELETE] Response:", await res.json());
```

### Backend

```typescript
console.log("[DELETE /reservations/:id] Attempting to delete:", reservationId);
console.log("[DELETE /reservations/:id] Found reservation:", reservation);
console.log("[DELETE /reservations/:id] Deleted successfully");
```

## Próximos Pasos

1. ✅ Verificar que Railway haya actualizado el backend
2. ✅ Probar eliminación de reserva en producción
3. ✅ Documentar cualquier error adicional
4. ⏳ Considerar agregar confirmación adicional para eliminaciones masivas
