# Activar Sistema de Recordatorios Automáticos (Opcional)

El sistema de recordatorios automáticos está implementado pero **desactivado por defecto** para evitar envíos no deseados durante el desarrollo.

## Cómo Activar

### 1. Instalar Dependencias

```bash
cd backend
npm install node-cron
npm install --save-dev @types/node-cron
```

### 2. Modificar server.ts

Agrega las siguientes líneas en `backend/src/server.ts`:

```typescript
// Después de las importaciones existentes (línea ~22)
import { SchedulerService } from './services/scheduler.service';

// Dentro de la función startServer(), después de inicializar WhatsApp (línea ~160)
// Inicializar tareas programadas
if (process.env.SCHEDULER_ENABLED === 'true') {
  SchedulerService.init();
  console.log('✅ Scheduler Service Initialized');
} else {
  console.log('⚠️ Scheduler Service Disabled');
}
```

### 3. Configurar Variables de Entorno

Agrega a tu archivo `.env`:

```env
# Activar/desactivar sistema de recordatorios
SCHEDULER_ENABLED=false  # Cambiar a 'true' para activar
```

### 4. Activar en Producción

Cuando estés listo para activar los recordatorios en producción:

1. Cambia `SCHEDULER_ENABLED=true` en tu `.env` de producción
2. Reinicia el servidor
3. Los recordatorios se enviarán automáticamente todos los días a las 10:00 AM

## Tareas Programadas Disponibles

### 1. Recordatorios de Clase (10:00 AM diario)
- Busca clases programadas para mañana
- Envía email de recordatorio a cada usuario
- Solo para reservas con estado CONFIRMED o PAID

### 2. Limpieza de Tokens (3:00 AM diario)
- Elimina tokens de refresh expirados
- Mantiene la base de datos limpia

### 3. Tareas Futuras (Comentadas)
- Resumen semanal para administradores
- Marcar clases pasadas como completadas

## Personalizar Horarios

Los horarios se configuran usando sintaxis de cron:

```typescript
// Formato: 'minuto hora día mes día-semana'
cron.schedule('0 10 * * *', ...);  // 10:00 AM todos los días
cron.schedule('0 3 * * *', ...);   // 3:00 AM todos los días
cron.schedule('0 9 * * 1', ...);   // 9:00 AM todos los lunes
```

Ejemplos:
- `'0 10 * * *'` - 10:00 AM todos los días
- `'0 */6 * * *'` - Cada 6 horas
- `'0 9 * * 1'` - 9:00 AM todos los lunes
- `'30 8 * * 1-5'` - 8:30 AM de lunes a viernes

## Testing

Para probar el envío de recordatorios sin esperar al cron:

```typescript
// En cualquier ruta o script
import { SchedulerService } from './services/scheduler.service';

// Ejecutar manualmente
await SchedulerService.sendClassReminders();
```

## Monitoreo

Los logs del scheduler aparecerán en la consola:

```
[Scheduler] Initializing scheduled tasks...
[Scheduler] Scheduled tasks initialized successfully
[Scheduler] Running class reminder task...
[Scheduler] Found 5 reservations for tomorrow
[Scheduler] Reminder sent to user@example.com for class Surf Básico
[Scheduler] Class reminders completed: 5 sent, 0 failed
```

## Consideraciones

### Desarrollo
- Mantén `SCHEDULER_ENABLED=false` durante desarrollo
- Usa el método manual para testing
- Evita enviar emails no deseados a usuarios reales

### Producción
- Activa solo cuando estés listo para enviar recordatorios reales
- Monitorea los logs para detectar errores
- Verifica que el servidor esté en la zona horaria correcta

### Zona Horaria
El servidor usa la zona horaria del sistema. Para Perú (UTC-5):

```bash
# En Linux/Mac
export TZ=America/Lima

# En Docker
ENV TZ=America/Lima
```

## Desactivar Temporalmente

Para desactivar sin modificar código:

```env
SCHEDULER_ENABLED=false
```

Reinicia el servidor y las tareas programadas no se ejecutarán.
