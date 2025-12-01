# Plan de Migración a Toast Notifications

## Resumen
Este documento detalla el plan para migrar todas las notificaciones de la aplicación al sistema centralizado de toasts.

## Estado Actual
- ✅ Sistema de Toast implementado y funcional
- ✅ ToastContext configurado
- ✅ ToastContainer y Toast components creados
- ✅ Página de edición de clases migrada (ejemplo de referencia)

## Archivos Prioritarios para Migración

### Alta Prioridad (Páginas más usadas)

#### 1. `/dashboard/school/classes/page.tsx`
**Alerts a reemplazar:**
- Línea 136: `alert('Clase creada exitosamente')` → `showSuccess('¡Clase creada!', 'La clase se creó correctamente')`
- Línea 142: `alert('Error al crear la clase')` → `showError('Error al crear', 'No se pudo crear la clase')`
- Línea 166: `alert('Clase actualizada exitosamente')` → `showSuccess('¡Actualizada!', 'La clase se actualizó correctamente')`
- Línea 172: `alert('Error al actualizar la clase')` → `showError('Error al actualizar', error.message)`
- Línea 200: `alert('Clase eliminada exitosamente')` → `showSuccess('Eliminada', 'La clase fue eliminada')`
- Línea 207: `alert(error.message)` → `showError('Error al eliminar', error.message)`

**Cambios necesarios:**
```tsx
// Agregar import
import { useToast } from '@/contexts/ToastContext';

// Agregar hook
const { showSuccess, showError } = useToast();

// Reemplazar todos los alerts con toasts
```

#### 2. `/dashboard/school/reservations/page.tsx`
**Alerts a reemplazar:**
- Línea 156: `alert(\`Reserva ${status} exitosamente\`)` → `showSuccess('Reserva actualizada', \`Estado: ${status}\`)`
- Línea 166: `alert(error.message)` → `showError('Error', error.message)`
- Línea 203: `alert('Reserva actualizada exitosamente')` → `showSuccess('¡Actualizada!', 'La reserva se actualizó')`
- Línea 212: `alert(error.message)` → `showError('Error', error.message)`
- Línea 254: `alert('Información de pago actualizada')` → `showSuccess('Pago actualizado', 'La información se guardó')`
- Línea 263: `alert(error.message)` → `showError('Error', error.message)`

#### 3. `/dashboard/school/classes/[id]/reservations/page.tsx`
**Alerts a reemplazar:**
- Línea 158: `alert(\`Reserva ${status} exitosamente\`)` → `showSuccess('Reserva actualizada', mensaje)`
- Línea 163: `alert(\`Error: ${errorMessage}\`)` → `showError('Error', errorMessage)`

#### 4. `/dashboard/school/calendar/page.tsx`
**Alerts a reemplazar:**
- Múltiples alerts de error (líneas 207, 243, 253, 277, 287, 307, 323, 405, 416)
- Todos deben usar `showError('Error', mensaje)`

### Media Prioridad

#### 5. `/dashboard/instructor/profile/page.tsx`
- Línea 128: `alert('Perfil actualizado')` → `showSuccess('¡Guardado!', 'Perfil actualizado')`
- Línea 131: `alert('Error al guardar')` → `showError('Error', 'No se pudo guardar')`

#### 6. `/dashboard/school/page.tsx`
**Alerts de sesión expirada:**
- Múltiples alerts de "Tu sesión ha expirado" (líneas 175, 200, 222, 240, 265, 482)
- Usar: `showWarning('Sesión expirada', 'Por favor, inicia sesión nuevamente')`

### Baja Prioridad (Admin)

#### 7. `/dashboard/admin/users/page.tsx`
- Línea 43: `alert('Usuario creado')` → `showSuccess('Usuario creado', mensaje)`
- Línea 45: `alert('Usuario actualizado')` → `showSuccess('Usuario actualizado', mensaje)`
- Línea 47: `alert('Usuario eliminado')` → `showSuccess('Usuario eliminado', mensaje)`
- Línea 51: `alert(\`Error: ${error}\`)` → `showError('Error', error)`

#### 8. `/dashboard/admin/schools/page.tsx`
- Línea 86: `alert('Failed to create school')` → `showError('Error', 'No se pudo crear la escuela')`

#### 9. `/dashboard/admin/classes/page.tsx`
- Línea 262: `alert(err.message)` → `showError('Error al crear', err.message)`
- Línea 323: `alert(err.message)` → `showError('Error al actualizar', err.message)`
- Línea 347: `alert('Error al eliminar')` → `showError('Error al eliminar', mensaje)`

#### 10. `/dashboard/admin/reservations/page.tsx`
- Línea 101: `alert('Error al actualizar')` → `showError('Error', mensaje)`

#### 11. `/dashboard/admin/users/[id]/page.tsx`
- Línea 83: `alert('Failed to update user')` → `showError('Error', 'No se pudo actualizar')`

#### 12. `/dashboard/school/classes/[id]/page.tsx`
- Línea 98: `alert('No puedes eliminar...')` → `showWarning('No permitido', mensaje)`

## Patrón de Implementación

### Paso 1: Importar
```tsx
import { useToast } from '@/contexts/ToastContext';
```

### Paso 2: Inicializar Hook
```tsx
const { showSuccess, showError, showWarning, showInfo } = useToast();
```

### Paso 3: Reemplazar Alerts

**Antes:**
```tsx
try {
  await operation();
  alert('Operación exitosa');
} catch (error) {
  alert('Error: ' + error.message);
}
```

**Después:**
```tsx
try {
  await operation();
  showSuccess('¡Éxito!', 'Operación completada correctamente');
} catch (error) {
  showError('Error', error.message);
}
```

### Paso 4: Eliminar Estados de Mensaje (si existen)

**Antes:**
```tsx
const [success, setSuccess] = useState(false);
const [error, setError] = useState<string | null>(null);

{success && <div className="success-message">...</div>}
{error && <div className="error-message">...</div>}
```

**Después:**
```tsx
// Eliminar estados y divs, usar solo toasts
showSuccess('Título', 'Mensaje');
showError('Título', 'Mensaje');
```

## Beneficios de la Migración

1. **Consistencia Visual**: Todas las notificaciones se ven iguales
2. **Mejor UX**: Animaciones suaves y no bloqueantes
3. **Responsive**: Funciona en móvil y desktop
4. **Accesibilidad**: Soporte para lectores de pantalla
5. **Mantenibilidad**: Código más limpio y fácil de mantener
6. **Múltiples notificaciones**: Soporta varias a la vez
7. **Auto-dismiss**: Se cierran automáticamente

## Checklist de Migración

- [x] Sistema de Toast implementado
- [x] Guía de implementación creada
- [x] Ejemplo de referencia (edit page) completado
- [ ] Migrar páginas de alta prioridad
- [ ] Migrar páginas de media prioridad
- [ ] Migrar páginas de baja prioridad
- [ ] Testing de todas las notificaciones
- [ ] Documentación actualizada

## Notas de Implementación

1. **Sesiones expiradas**: Usar `showWarning` con redirección después
2. **Operaciones exitosas**: Usar `showSuccess` con mensaje claro
3. **Errores de validación**: Usar `showWarning` para datos faltantes
4. **Errores de API**: Usar `showError` con mensaje del servidor
5. **Información**: Usar `showInfo` para procesos en curso

## Testing

Después de cada migración, verificar:
- ✅ Toast aparece correctamente
- ✅ Mensaje es claro y descriptivo
- ✅ Color y icono son apropiados
- ✅ Se cierra automáticamente
- ✅ Funciona en móvil
- ✅ No bloquea la interfaz

## Próximos Pasos

1. Migrar archivos de alta prioridad primero
2. Probar cada página después de la migración
3. Documentar cualquier caso especial
4. Actualizar tests si existen
5. Revisar feedback de usuarios
