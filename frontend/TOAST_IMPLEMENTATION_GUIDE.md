# Guía de Implementación de Toast Notifications

## Sistema Centralizado de Notificaciones

Este documento describe cómo usar el sistema de toast notifications estandarizado en toda la aplicación.

## Componentes del Sistema

### 1. ToastContext (`/src/contexts/ToastContext.tsx`)
Proporciona el contexto global para manejar toasts.

### 2. Toast Component (`/src/components/notifications/Toast.tsx`)
Componente visual individual de toast con animaciones y estilos.

### 3. ToastContainer (`/src/components/notifications/ToastContainer.tsx`)
Contenedor que muestra todos los toasts activos en la esquina superior derecha.

## Cómo Usar

### 1. Importar el Hook

```tsx
import { useToast } from '@/contexts/ToastContext';
```

### 2. Inicializar en el Componente

```tsx
const { showSuccess, showError, showWarning, showInfo } = useToast();
```

### 3. Mostrar Notificaciones

#### Éxito
```tsx
showSuccess('¡Operación exitosa!', 'Los cambios se guardaron correctamente');
```

#### Error
```tsx
showError('Error al guardar', 'No se pudo completar la operación');
```

#### Advertencia
```tsx
showWarning('Atención', 'Esta acción requiere confirmación');
```

#### Información
```tsx
showInfo('Información', 'Proceso iniciado correctamente');
```

### 4. Duración Personalizada (opcional)

```tsx
showSuccess('Título', 'Mensaje', 3000); // 3 segundos
```

## Reemplazar Código Antiguo

### ❌ ANTES (No usar)

```tsx
// Alerts nativos
alert('Operación exitosa');
alert('Error: ' + errorMessage);

// Mensajes estáticos
const [success, setSuccess] = useState(false);
const [error, setError] = useState<string | null>(null);

{success && (
  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
    <p className="text-green-800">Operación exitosa</p>
  </div>
)}

{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <p className="text-red-800">{error}</p>
  </div>
)}
```

### ✅ DESPUÉS (Usar)

```tsx
import { useToast } from '@/contexts/ToastContext';

const { showSuccess, showError } = useToast();

// En lugar de alert
showSuccess('¡Éxito!', 'Operación completada');
showError('Error', errorMessage);

// No necesitas estados ni divs de mensajes
```

## Beneficios

- ✅ **Consistencia**: Mismo diseño en toda la aplicación
- ✅ **Responsive**: Funciona en móvil y desktop
- ✅ **Accesibilidad**: Soporte para lectores de pantalla
- ✅ **Animaciones**: Transiciones suaves
- ✅ **Auto-dismiss**: Se cierran automáticamente
- ✅ **Múltiples toasts**: Soporta varias notificaciones simultáneas
- ✅ **Barra de progreso**: Indica tiempo restante
- ✅ **Tema oscuro**: Soporte para dark mode

## Archivos a Actualizar

Los siguientes archivos necesitan migración de `alert()` a toasts:

### Dashboard School
- ✅ `/dashboard/school/classes/[id]/edit/page.tsx` (Ya actualizado)
- `/dashboard/school/classes/page.tsx`
- `/dashboard/school/classes/[id]/page.tsx`
- `/dashboard/school/classes/[id]/reservations/page.tsx`
- `/dashboard/school/reservations/page.tsx`
- `/dashboard/school/calendar/page.tsx`
- `/dashboard/school/page.tsx`

### Dashboard Instructor
- `/dashboard/instructor/profile/page.tsx`

### Dashboard Admin
- `/dashboard/admin/users/page.tsx`
- `/dashboard/admin/users/[id]/page.tsx`
- `/dashboard/admin/schools/page.tsx`
- `/dashboard/admin/classes/page.tsx`
- `/dashboard/admin/reservations/page.tsx`

## Ejemplos de Casos de Uso

### 1. Guardar Formulario

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await saveData();
    showSuccess('¡Guardado!', 'Los cambios se guardaron correctamente');
  } catch (error) {
    showError('Error al guardar', error.message);
  }
};
```

### 2. Eliminar Item

```tsx
const handleDelete = async () => {
  if (!confirm('¿Estás seguro?')) return;
  
  try {
    await deleteItem();
    showSuccess('Eliminado', 'El elemento fue eliminado correctamente');
    setTimeout(() => router.push('/list'), 1000);
  } catch (error) {
    showError('Error al eliminar', error.message);
  }
};
```

### 3. Validación

```tsx
if (!formData.email) {
  showWarning('Campo requerido', 'El email es obligatorio');
  return;
}
```

### 4. Información de Proceso

```tsx
showInfo('Procesando', 'Estamos procesando tu solicitud...');
```

## Notas Importantes

1. **No usar `alert()`**: Reemplazar todos los alerts nativos con toasts
2. **No usar estados de success/error**: El sistema de toasts maneja esto automáticamente
3. **Mensajes claros**: Usar títulos descriptivos y mensajes informativos
4. **Duración apropiada**: Éxitos 3-5s, Errores 5-7s, Info 3-4s
5. **Evitar spam**: No mostrar múltiples toasts del mismo tipo simultáneamente

## Estilos Disponibles

### Success (Verde)
- Operaciones exitosas
- Guardado completado
- Creación exitosa

### Error (Rojo)
- Errores de validación
- Fallos de API
- Operaciones fallidas

### Warning (Amarillo)
- Advertencias
- Confirmaciones necesarias
- Datos incompletos

### Info (Azul)
- Información general
- Procesos en curso
- Mensajes informativos
