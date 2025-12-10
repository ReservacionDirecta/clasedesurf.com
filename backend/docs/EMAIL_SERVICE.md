# Servicio de Email con Resend

Este documento explica cómo está implementado el servicio de email usando Resend en la aplicación.

## Configuración

### Variables de Entorno

Agrega las siguientes variables a tu archivo `.env`:

```env
RESEND_API_KEY=re_JGWUMeCy_6eWnxXREMkZBdifWYnDxsH7U
EMAIL_FROM=info@clasedesurf.com
FRONTEND_URL=http://localhost:3000
```

### Instalación

El paquete `resend` ya está incluido en las dependencias del proyecto. Si necesitas instalarlo manualmente:

```bash
npm install resend
```

## Tipos de Emails Implementados

### 1. Email de Bienvenida
Se envía automáticamente cuando un usuario se registra en la plataforma.

**Cuándo se envía:**
- Registro normal (`POST /auth/register`)
- Registro con Google (`POST /auth/google`)
- Registro de escuela (`POST /auth/register-school`)

**Contenido:**
- Mensaje de bienvenida
- Información sobre las funcionalidades disponibles
- Enlace para explorar clases

### 2. Email de Confirmación de Reserva
Se envía cuando un usuario crea una nueva reserva.

**Cuándo se envía:**
- Creación de reserva (`POST /reservations`)

**Contenido:**
- Detalles de la clase reservada
- Fecha, hora y ubicación
- Precio y ID de reserva
- Checklist de preparación
- Enlace para ver la reserva

### 3. Email de Cancelación de Reserva
Se envía cuando se cancela una reserva.

**Cuándo se envía:**
- Actualización de reserva a estado CANCELED (`PUT /reservations/:id`)

**Contenido:**
- Detalles de la reserva cancelada
- Información sobre reembolso (si aplica)
- Enlace para explorar otras clases

### 4. Email de Confirmación de Pago
Se envía cuando un pago es confirmado.

**Cuándo se envía:**
- Creación de pago con estado PAID (`POST /payments`)
- Actualización de pago a estado PAID (`PUT /payments/:id`)

**Contenido:**
- Detalles del pago
- Método de pago y ID de transacción
- Monto total
- Enlace para ver la reserva

### 5. Email de Restablecimiento de Contraseña
Se envía cuando un usuario solicita restablecer su contraseña.

**Cuándo se envía:**
- Solicitud de restablecimiento de contraseña (endpoint pendiente de implementar)

**Contenido:**
- Enlace seguro para restablecer contraseña
- Tiempo de expiración del enlace
- Advertencias de seguridad

### 6. Email de Recordatorio de Clase
Se envía 24 horas antes de una clase programada.

**Cuándo se envía:**
- Mediante un cron job o tarea programada (pendiente de implementar)

**Contenido:**
- Recordatorio de la clase del día siguiente
- Detalles de la clase
- Checklist de preparación
- Enlace para ver la reserva

## Uso del Servicio

### Importar el Servicio

```typescript
import { EmailService } from '../services/email.service';
```

### Ejemplos de Uso

#### Email de Bienvenida
```typescript
EmailService.sendWelcomeEmail(
  'usuario@example.com',
  'Juan Pérez'
).catch(err => {
  console.error('Error sending welcome email:', err);
});
```

#### Email de Confirmación de Reserva
```typescript
EmailService.sendBookingConfirmation(
  'usuario@example.com',
  'Juan Pérez',
  {
    className: 'Clase de Surf para Principiantes',
    date: 'Lunes, 11 de diciembre de 2025',
    time: '10:00',
    location: 'Playa Waikiki, Miraflores',
    price: 80.00,
    bookingId: '123'
  }
).catch(err => {
  console.error('Error sending booking confirmation email:', err);
});
```

#### Email de Cancelación
```typescript
EmailService.sendBookingCancellation(
  'usuario@example.com',
  'Juan Pérez',
  {
    className: 'Clase de Surf para Principiantes',
    date: 'Lunes, 11 de diciembre de 2025',
    bookingId: '123',
    refundAmount: 80.00
  }
).catch(err => {
  console.error('Error sending cancellation email:', err);
});
```

#### Email de Confirmación de Pago
```typescript
EmailService.sendPaymentConfirmation(
  'usuario@example.com',
  'Juan Pérez',
  {
    amount: 80.00,
    paymentMethod: 'Tarjeta de Crédito',
    transactionId: 'TXN123456',
    bookingId: '123',
    className: 'Clase de Surf para Principiantes'
  }
).catch(err => {
  console.error('Error sending payment confirmation email:', err);
});
```

#### Email de Restablecimiento de Contraseña
```typescript
EmailService.sendPasswordResetEmail(
  'usuario@example.com',
  'Juan Pérez',
  'token-seguro-123'
).catch(err => {
  console.error('Error sending password reset email:', err);
});
```

#### Email de Recordatorio de Clase
```typescript
EmailService.sendClassReminder(
  'usuario@example.com',
  'Juan Pérez',
  {
    className: 'Clase de Surf para Principiantes',
    date: 'Lunes, 11 de diciembre de 2025',
    time: '10:00',
    location: 'Playa Waikiki, Miraflores'
  }
).catch(err => {
  console.error('Error sending class reminder:', err);
});
```

## Manejo de Errores

Todos los métodos del servicio de email están diseñados para no bloquear las operaciones principales. Si un email falla al enviarse:

1. Se registra el error en la consola
2. La operación principal (registro, reserva, pago, etc.) continúa exitosamente
3. El usuario no ve ningún error relacionado con el email

Esto asegura que problemas con el servicio de email no afecten la funcionalidad principal de la aplicación.

## Diseño de Emails

Todos los emails incluyen:
- **Diseño responsive**: Se ven bien en móviles y escritorio
- **Branding consistente**: Colores y estilo de Clase de Surf
- **Gradientes atractivos**: Diferentes colores según el tipo de email
- **Información clara**: Detalles organizados en tablas
- **Llamadas a la acción**: Botones para acciones relevantes
- **Footer informativo**: Información de contacto

## Próximos Pasos

### Funcionalidades Pendientes

1. **Endpoint de Restablecimiento de Contraseña**
   - Crear endpoint `POST /auth/forgot-password`
   - Crear endpoint `POST /auth/reset-password`
   - Integrar con el servicio de email

2. **Sistema de Recordatorios**
   - Implementar cron job para enviar recordatorios 24h antes
   - Agregar preferencias de notificación por usuario

3. **Emails Adicionales**
   - Email de cambio de contraseña exitoso
   - Email de actualización de perfil
   - Email de nueva clase disponible (para usuarios suscritos)
   - Email de evaluación post-clase

4. **Plantillas Personalizables**
   - Permitir a las escuelas personalizar plantillas
   - Agregar logos de escuelas en los emails
   - Configurar colores por escuela

5. **Analytics**
   - Rastrear tasa de apertura de emails
   - Rastrear clics en enlaces
   - Dashboard de métricas de email

## Verificación de Dominio

Para usar `info@clasedesurf.com` como remitente, necesitas:

1. Ir a [Resend Dashboard](https://resend.com/domains)
2. Agregar el dominio `clasedesurf.com`
3. Configurar los registros DNS requeridos:
   - SPF
   - DKIM
   - DMARC
4. Verificar el dominio

Mientras tanto, puedes usar el dominio de prueba de Resend: `onboarding@resend.dev`

## Límites y Cuotas

Resend tiene diferentes planes:
- **Free**: 100 emails/día, 3,000 emails/mes
- **Pro**: Desde $20/mes, 50,000 emails/mes
- **Enterprise**: Personalizado

Monitorea tu uso en el [Dashboard de Resend](https://resend.com/overview).

## Soporte

Para problemas o preguntas:
- Documentación de Resend: https://resend.com/docs
- Soporte de Resend: https://resend.com/support
