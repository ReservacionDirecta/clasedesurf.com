# 🔧 Solución de Errores - Configuración Faltante

## ❌ Error Actual

```
Error: Missing API key. Pass it to the constructor `new Resend("re_123")`
```

## ✅ Solución

### Paso 1: Agregar Variables de Entorno

Abre tu archivo `.env` y agrega estas líneas:

```env
# Resend Email Service
RESEND_API_KEY=re_JGWUMeCy_6eWnxXREMkZBdifWYnDxsH7U
EMAIL_FROM=info@clasedesurf.com
```

Si no tienes un archivo `.env`, créalo copiando `.env.example`:

```bash
copy .env.example .env
```

### Paso 2: Verificar Configuración

Ejecuta el script de verificación:

```bash
.\check-resend-config.bat
```

### Paso 3: Iniciar el Servidor

```bash
npm run dev
```

## 📝 Archivo .env Completo

Tu archivo `.env` debería verse así:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/clasedesurf.com"
JWT_SECRET="tu-secreto-jwt-super-seguro"
PORT=4000
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Resend Email Service
RESEND_API_KEY=re_JGWUMeCy_6eWnxXREMkZBdifWYnDxsH7U
EMAIL_FROM=info@clasedesurf.com

# WhatsApp (opcional)
WHATSAPP_ENABLED=false
```

## ⚠️ Nota sobre el Scheduler

El archivo `scheduler.service.ts` ha sido eliminado temporalmente porque:
1. Requiere instalar `node-cron` (dependencia adicional)
2. El modelo `Class` no tiene campo `status` en el schema actual
3. Es una funcionalidad **opcional** para recordatorios automáticos

Si quieres activar los recordatorios automáticos en el futuro:
1. Lee la documentación en `docs/SCHEDULER_SETUP.md`
2. Instala las dependencias necesarias
3. Ajusta el código según tu schema de Prisma

## 🧪 Probar que Funciona

Una vez que agregues la API key y reinicies el servidor, los emails se enviarán automáticamente en:

- ✅ Registro de usuarios
- ✅ Creación de reservas
- ✅ Confirmación de pagos
- ✅ Cancelación de reservas

## 🐛 Si Sigues Teniendo Problemas

1. **Verifica que la API key esté correcta** en el archivo `.env`
2. **Reinicia el servidor** completamente (Ctrl+C y vuelve a ejecutar `npm run dev`)
3. **Revisa los logs** de la consola para ver si hay otros errores
4. **Verifica la conexión a internet** (Resend necesita conexión para enviar emails)

## 📧 Verificar Dominio (Opcional pero Recomendado)

Para usar `info@clasedesurf.com` en lugar de `onboarding@resend.dev`:

1. Ve a https://resend.com/domains
2. Agrega el dominio `clasedesurf.com`
3. Configura los registros DNS (SPF, DKIM, DMARC)
4. Verifica el dominio

Mientras tanto, los emails se enviarán desde `onboarding@resend.dev` (dominio de prueba de Resend).

## ✅ Checklist

- [ ] Agregar `RESEND_API_KEY` al archivo `.env`
- [ ] Agregar `EMAIL_FROM` al archivo `.env`
- [ ] Ejecutar `.\check-resend-config.bat` para verificar
- [ ] Reiniciar el servidor con `npm run dev`
- [ ] Probar registrando un nuevo usuario
- [ ] Verificar que llegue el email de bienvenida
