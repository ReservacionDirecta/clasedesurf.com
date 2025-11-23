# Sistema de Notificaciones

Sistema mejorado de notificaciones emergentes para la aplicación.

## Características

- ✅ Notificaciones toast modernas con animaciones suaves
- ✅ Soporte para diferentes tipos: success, error, warning, info
- ✅ Auto-cierre configurable
- ✅ Barra de progreso visual
- ✅ Responsive y mobile-friendly
- ✅ Soporte para dark mode
- ✅ Accesibilidad (ARIA labels)
- ✅ Hook para confirmaciones que reemplaza `confirm()`
- ✅ Hook helper para facilitar el uso

## Uso Básico

### Notificaciones Toast

```tsx
import { useToast } from '@/contexts/ToastContext';

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const handleAction = () => {
    showSuccess('Operación exitosa', 'Los cambios se guardaron correctamente');
  };

  return <button onClick={handleAction}>Guardar</button>;
}
```

### Hook Helper (Recomendado)

```tsx
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const { success, error, warning, info, handleError } = useNotifications();

  const handleSave = async () => {
    try {
      await saveData();
      success('Datos guardados exitosamente');
    } catch (err) {
      handleError(err, 'Error al guardar los datos');
    }
  };

  return <button onClick={handleSave}>Guardar</button>;
}
```

### Confirmaciones

```tsx
import { useConfirm } from '@/hooks/useConfirm';
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const { confirm, ConfirmDialog } = useConfirm();
  const { success, error } = useNotifications();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Eliminar elemento',
      message: '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (confirmed) {
      try {
        await deleteItem();
        success('Elemento eliminado exitosamente');
      } catch (err) {
        error('Error al eliminar el elemento');
      }
    }
  };

  return (
    <>
      <button onClick={handleDelete}>Eliminar</button>
      {ConfirmDialog}
    </>
  );
}
```

## Tipos de Notificaciones

### Success (Éxito)
```tsx
showSuccess('Operación completada', 'Los cambios se guardaron correctamente');
```

### Error (Error)
```tsx
showError('Error al procesar', 'No se pudo conectar con el servidor');
```

### Warning (Advertencia)
```tsx
showWarning('Atención', 'Esta acción puede tener consecuencias');
```

### Info (Información)
```tsx
showInfo('Información', 'Tu sesión expirará en 5 minutos');
```

## Duración

Por defecto, las notificaciones se cierran automáticamente después de:
- Success: 5000ms (5 segundos)
- Error: 6000ms (6 segundos)
- Warning: 5000ms (5 segundos)
- Info: 4000ms (4 segundos)

Puedes personalizar la duración:

```tsx
showSuccess('Mensaje', 'Detalles', 10000); // 10 segundos
showInfo('Mensaje persistente', 'Detalles', 0); // No se cierra automáticamente
```

## Reemplazar alert() y confirm()

### Antes (usando alert)
```tsx
alert('Error: ' + errorMessage);
```

### Después (usando toast)
```tsx
const { error } = useNotifications();
error(errorMessage);
```

### Antes (usando confirm)
```tsx
if (confirm('¿Estás seguro?')) {
  // acción
}
```

### Después (usando useConfirm)
```tsx
const { confirm, ConfirmDialog } = useConfirm();

const handleAction = async () => {
  const confirmed = await confirm({
    title: 'Confirmar acción',
    message: '¿Estás seguro?',
  });
  
  if (confirmed) {
    // acción
  }
};

return (
  <>
    <button onClick={handleAction}>Acción</button>
    {ConfirmDialog}
  </>
);
```

## Mejores Prácticas

1. **Usa el hook helper** `useNotifications` en lugar de `useToast` directamente para una API más simple
2. **Maneja errores** con `handleError` para consistencia
3. **Usa confirmaciones** para acciones destructivas
4. **Mensajes claros**: Títulos cortos, detalles en el mensaje
5. **Duración apropiada**: Errores más tiempo, info menos tiempo

## Accesibilidad

- Todas las notificaciones tienen `role="alert"` y `aria-live="polite"`
- Los botones de cerrar tienen `aria-label`
- Soporte para lectores de pantalla
- Contraste adecuado para todos los tipos

