# 🔧 Fix: Rate Limiter - Error 429

## 🐛 Problema Identificado

El error `429 (Too Many Requests)` en el registro de instructores se debe a que el **rate limiter** estaba configurado de manera muy restrictiva:

- **Antes:** 5 peticiones cada 15 minutos
- **Ahora:** 20 peticiones cada 15 minutos

## ✅ Cambios Realizados

### Archivo Modificado
`backend/src/middleware/rateLimiter.ts`

### Cambio
```typescript
// ANTES
max: 5, // Limit each IP to 5 requests per windowMs

// AHORA
max: 20, // Limit each IP to 20 requests per windowMs
```

## 🚀 Desplegar los Cambios

### Opción 1: Despliegue Automático (Recomendado)

Si tienes Railway conectado a tu repositorio de GitHub:

```bash
# 1. Hacer commit de los cambios
git add backend/src/middleware/rateLimiter.ts
git add backend/dist/middleware/rateLimiter.js
git commit -m "fix: aumentar límite de rate limiter a 20 peticiones"

# 2. Push a GitHub
git push origin main

# 3. Railway desplegará automáticamente
```

### Opción 2: Despliegue Manual

Si no tienes GitHub conectado:

1. **Subir los archivos manualmente a Railway:**
   - Ir a tu proyecto en Railway
   - Usar Railway CLI o subir los archivos directamente

2. **O reconstruir en Railway:**
   - Ir a tu proyecto en Railway
   - Click en "Deploy" → "Redeploy"

## 🔍 Verificar el Fix

Después del despliegue:

1. Espera 15 minutos (para que expire el rate limit anterior)
2. Intenta registrar un instructor nuevamente
3. Deberías poder hacer hasta 20 intentos en 15 minutos

## 📊 Configuración Actual del Rate Limiter

### Endpoints de Autenticación (login, register)
- **Ventana:** 15 minutos
- **Máximo:** 20 peticiones por IP
- **Mensaje:** "Demasiados intentos desde esta IP, por favor intente nuevamente después de 15 minutos"

### Endpoints Generales de API
- **Ventana:** 15 minutos
- **Máximo:** 100 peticiones por IP
- **Mensaje:** "Demasiadas solicitudes desde esta IP, por favor intente nuevamente más tarde"

## 🛠️ Configuración Adicional (Opcional)

Si quieres deshabilitar completamente el rate limiter en desarrollo:

### En tu archivo `.env` local:
```env
NODE_ENV=development
SKIP_RATE_LIMIT=true
```

### En Railway (NO recomendado para producción):
Agregar variable de entorno:
```
SKIP_RATE_LIMIT=true
```

⚠️ **Advertencia:** No deshabilites el rate limiter en producción, es una medida de seguridad importante.

## 🔄 Si el Problema Persiste

### 1. Limpiar el Rate Limit Actual

El rate limiter guarda el estado en memoria. Para limpiarlo:

- **Opción A:** Esperar 15 minutos
- **Opción B:** Reiniciar el servidor en Railway
  - Ir a tu proyecto en Railway
  - Click en "Settings" → "Restart"

### 2. Verificar que los Cambios se Desplegaron

Verifica que el archivo compilado en Railway tenga `max: 20`:

```bash
# Si tienes acceso SSH a Railway
cat backend/dist/middleware/rateLimiter.js | grep "max:"
```

### 3. Usar una IP Diferente (Temporal)

Si necesitas probar inmediatamente:
- Usar una VPN
- Usar datos móviles en lugar de WiFi
- Usar modo incógnito (no siempre funciona)

## 📝 Archivos Modificados

- ✅ `backend/src/middleware/rateLimiter.ts` (código fuente)
- ✅ `backend/dist/middleware/rateLimiter.js` (compilado)

## 🎯 Próximos Pasos

1. **Hacer commit y push de los cambios**
2. **Esperar a que Railway despliegue**
3. **Probar el registro de instructor**
4. **Verificar que funcione correctamente**

## 💡 Recomendaciones

### Para Desarrollo
- Aumentar el límite a 50-100 peticiones
- O deshabilitar con `SKIP_RATE_LIMIT=true`

### Para Producción
- Mantener entre 10-20 peticiones (balance entre seguridad y UX)
- Monitorear logs para detectar abusos
- Considerar usar Redis para rate limiting distribuido si tienes múltiples instancias

## 🔐 Seguridad

El rate limiter es importante para:
- ✅ Prevenir ataques de fuerza bruta
- ✅ Prevenir spam de registros
- ✅ Proteger contra DDoS
- ✅ Reducir carga del servidor

No lo deshabilites en producción sin una buena razón.

---

**Estado:** ✅ Fix aplicado y compilado  
**Fecha:** 2025-10-16  
**Cambio:** Rate limit aumentado de 5 a 20 peticiones
