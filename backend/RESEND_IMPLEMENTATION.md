# Implementación de Resend para Envío de Emails

## ✅ Completado

Se ha implementado exitosamente el servicio de email usando Resend para la plataforma Clase de Surf.

### Archivos Creados/Modificados

1. **`backend/src/services/email.service.ts`** - Servicio principal de email
2. **`backend/src/routes/auth.ts`** - Integración de emails de bienvenida
3. **`backend/src/routes/reservations.ts`** - Integración de emails de reserva y cancelación
4. **`backend/src/routes/payments.ts`** - Integración de emails de confirmación de pago
5. **`backend/package.json`** - Agregada dependencia de Resend
6. **`backend/.env.example`** - Agregadas variables de entorno necesarias

### Tipos de Emails Implementados

✅ **Email de Bienvenida**
- Se envía al registrarse
- Se envía al registrarse con Google
- Se envía al registrar una escuela

✅ **Email de Confirmación de Reserva**
- Se envía al crear una nueva reserva
- Incluye todos los detalles de la clase

✅ **Email de Cancelación de Reserva**
- Se envía al cancelar una reserva
- Incluye información de reembolso si aplica

✅ **Email de Confirmación de Pago**
- Se envía cuando un pago es marcado como PAID
- Incluye detalles del pago y transacción

✅ **Email de Restablecimiento de Contraseña**
- Método implementado (endpoint pendiente)

✅ **Email de Recordatorio de Clase**
- Método implementado (cron job pendiente)

## 📋 Configuración Necesaria

### 1. Variables de Entorno

Agrega a tu archivo `.env`:

```env
RESEND_API_KEY=re_JGWUMeCy_6eWnxXREMkZBdifWYnDxsH7U
EMAIL_FROM=info@clasedesurf.com
FRONTEND_URL=http://localhost:3000
```

### 2. Instalar Dependencias

```bash
cd backend
npm install
```

### 3. Verificar Dominio en Resend

Para usar `info@clasedesurf.com`:
1. Ve a https://resend.com/domains
2. Agrega el dominio `clasedesurf.com`
3. Configura los registros DNS (SPF, DKIM, DMARC)
4. Verifica el dominio

**Mientras tanto**, puedes usar el dominio de prueba: `onboarding@resend.dev`

## 🎨 Características de los Emails

- ✨ Diseño moderno y responsive
- 🎨 Gradientes de colores atractivos
- 📱 Optimizados para móvil y escritorio
- 🔗 Botones de llamada a la acción
- 📊 Información organizada en tablas
- 🏷️ Branding consistente de Clase de Surf

## 🔄 Flujo de Emails

### Registro de Usuario
```
Usuario se registra → Email de bienvenida enviado
```

### Reserva de Clase
```
Usuario crea reserva → Email de confirmación de reserva enviado
```

### Pago
```
Pago marcado como PAID → Email de confirmación de pago enviado
```

### Cancelación
```
Reserva cancelada → Email de cancelación enviado
```

## 📝 Próximos Pasos

### Funcionalidades Pendientes

1. **Sistema de Recordatorios Automáticos**
   - Implementar cron job para enviar recordatorios 24h antes de cada clase
   - Ejemplo usando node-cron:
   ```typescript
   import cron from 'node-cron';
   
   // Ejecutar todos los días a las 10:00 AM
   cron.schedule('0 10 * * *', async () => {
     // Buscar clases que son mañana
     const tomorrow = new Date();
     tomorrow.setDate(tomorrow.getDate() + 1);
     
     const upcomingClasses = await prisma.reservation.findMany({
       where: {
         class: {
           date: {
             gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
             lt: new Date(tomorrow.setHours(23, 59, 59, 999))
           }
         },
         status: { in: ['CONFIRMED', 'PAID'] }
       },
       include: { user: true, class: true }
     });
     
     // Enviar recordatorios
     for (const reservation of upcomingClasses) {
       await EmailService.sendClassReminder(...);
     }
   });
   ```

2. **Endpoints de Restablecimiento de Contraseña**
   ```typescript
   // POST /auth/forgot-password
   router.post('/forgot-password', async (req, res) => {
     const { email } = req.body;
     const user = await prisma.user.findUnique({ where: { email } });
     
     if (user) {
       const resetToken = crypto.randomBytes(32).toString('hex');
       // Guardar token en DB con expiración
       await EmailService.sendPasswordResetEmail(email, user.name, resetToken);
     }
     
     res.json({ message: 'Si el email existe, recibirás instrucciones' });
   });
   
   // POST /auth/reset-password
   router.post('/reset-password', async (req, res) => {
     const { token, newPassword } = req.body;
     // Validar token y actualizar contraseña
   });
   ```

3. **Plantillas Personalizables por Escuela**
   - Permitir a cada escuela personalizar colores y logos
   - Guardar preferencias en la tabla School

4. **Analytics de Emails**
   - Integrar webhooks de Resend para rastrear aperturas y clics
   - Crear dashboard de métricas

## 🧪 Testing

Para probar el envío de emails:

```typescript
// En cualquier ruta o script de prueba
import { EmailService } from './services/email.service';

// Probar email de bienvenida
await EmailService.sendWelcomeEmail('tu@email.com', 'Tu Nombre');

// Probar email de confirmación de reserva
await EmailService.sendBookingConfirmation('tu@email.com', 'Tu Nombre', {
  className: 'Clase de Prueba',
  date: 'Lunes, 11 de diciembre de 2025',
  time: '10:00',
  location: 'Playa Waikiki',
  price: 80.00,
  bookingId: '123'
});
```

## 📚 Documentación

Ver documentación completa en: `backend/docs/EMAIL_SERVICE.md`

## 🐛 Troubleshooting

### Los emails no se envían

1. Verifica que `RESEND_API_KEY` esté configurada correctamente
2. Revisa los logs de la consola para ver errores
3. Verifica que el dominio esté verificado en Resend
4. Revisa las cuotas de tu plan de Resend

### Los emails van a spam

1. Verifica que los registros DNS estén configurados correctamente
2. Usa un dominio verificado (no `onboarding@resend.dev`)
3. Evita palabras spam en el asunto y contenido
4. Mantén una buena reputación de envío

## 📞 Soporte

- Documentación de Resend: https://resend.com/docs
- Dashboard de Resend: https://resend.com/overview
- Soporte: https://resend.com/support
