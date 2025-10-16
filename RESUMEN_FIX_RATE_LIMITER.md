# 📋 Resumen: Fix Rate Limiter Error 429

## 🐛 Problema

Al intentar registrar un instructor en la aplicación desplegada en Railway, aparece el error:

```
POST https://clasedesurfcom-production.up.railway.app/api/auth/register 429 (Too Many Requests)
```

## 🔍 Causa

El **rate limiter** estaba configurado de manera muy restrictiva:
- Solo permitía **5 peticiones cada 15 minutos** por IP
- Esto es demasiado bajo para uso normal, especialmente durante pruebas

## ✅ Solución Aplicada

### Cambio Realizado
Aumenté el límite de peticiones de **5 a 20** cada 15 minutos.

### Archivo Modificado
```
backend/src/middleware/rateLimiter.ts
backend/dist/middleware/rateLimiter.js (compilado)
```

### Código Actualizado
```typescript
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Aumentado de 5 a 20
  message: 'Demasiados intentos desde esta IP, por favor intente nuevamente después de 15 minutos',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true'
});
```

## 🚀 Pasos para Desplegar

### 1. Commit y Push
```bash
git add backend/src/middleware/rateLimiter.ts
git add backend/dist/middleware/rateLimiter.js
git commit -m "fix: aumentar límite de rate limiter a 20 peticiones"
git push origin main
```

### 2. Railway Desplegará Automáticamente
Si tienes GitHub conectado, Railway detectará los cambios y desplegará automáticamente.

### 3. Esperar 15 Minutos (Importante)
El rate limiter guarda el estado en memoria. Para que el cambio tenga efecto completo:
- **Opción A:** Esperar 15 minutos para que expire el límite anterior
- **Opción B:** Reiniciar el servicio en Railway (Settings → Restart)

## 🧪 Verificar el Fix

### Opción 1: Probar el Registro
1. Espera 15 minutos o reinicia el servicio
2. Intenta registrar un instructor
3. Deberías poder hacer hasta 20 intentos

### Opción 2: Usar el Script de Prueba
```bash
node scripts/test-rate-limiter.js
```

Este script te mostrará:
- Estado actual del rate limiter
- Cuántas peticiones quedan disponibles
- Cuándo se resetea el contador

## 📊 Configuración Actual

| Endpoint | Límite | Ventana | Descripción |
|----------|--------|---------|-------------|
| `/api/auth/register` | 20 | 15 min | Registro de usuarios |
| `/api/auth/login` | 20 | 15 min | Login de usuarios |
| Otros endpoints API | 100 | 15 min | Endpoints generales |

## 🔄 Si el Problema Persiste

### 1. Verificar que se Desplegó
Revisa los logs de Railway para confirmar que el despliegue fue exitoso.

### 2. Limpiar el Rate Limit
- Reiniciar el servicio en Railway
- O esperar 15 minutos

### 3. Usar IP Diferente (Temporal)
Si necesitas probar inmediatamente:
- Usar VPN
- Usar datos móviles
- Usar otra red

### 4. Deshabilitar Temporalmente (Solo Desarrollo)
Agregar en Railway:
```env
SKIP_RATE_LIMIT=true
```
⚠️ **NO hacer esto en producción**

## 💡 Recomendaciones Futuras

### Para Desarrollo Local
Agregar en `.env`:
```env
NODE_ENV=development
SKIP_RATE_LIMIT=true
```

### Para Producción
- Mantener el límite en 20 (buen balance)
- Monitorear logs para detectar abusos
- Considerar usar Redis para rate limiting distribuido

### Para Mejor UX
- Mostrar mensaje claro al usuario cuando alcance el límite
- Mostrar cuánto tiempo debe esperar
- Implementar retry automático con backoff

## 📝 Archivos Creados

- ✅ `FIX_RATE_LIMITER.md` - Documentación detallada
- ✅ `RESUMEN_FIX_RATE_LIMITER.md` - Este resumen
- ✅ `scripts/test-rate-limiter.js` - Script de prueba

## 🎯 Estado Actual

- ✅ Código modificado
- ✅ Código compilado
- ⏳ Pendiente: Desplegar a Railway
- ⏳ Pendiente: Probar en producción

## 📞 Siguiente Paso

**Ejecuta estos comandos ahora:**

```bash
# 1. Commit
git add .
git commit -m "fix: aumentar límite de rate limiter y agregar documentación"

# 2. Push
git push origin main

# 3. Esperar despliegue de Railway (2-5 minutos)

# 4. Probar
# Espera 15 minutos o reinicia el servicio en Railway
# Luego intenta registrar un instructor
```

---

**Fecha:** 2025-10-16  
**Problema:** Error 429 en registro  
**Solución:** Rate limit aumentado de 5 a 20  
**Estado:** ✅ Fix aplicado, pendiente despliegue
