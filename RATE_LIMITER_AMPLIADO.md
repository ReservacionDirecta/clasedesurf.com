# ✅ Rate Limiter Ampliado

## 🎯 Cambios Realizados

Se aumentaron los límites del rate limiter para mejorar la experiencia del usuario.

## 📊 Límites Actualizados

### Antes vs Ahora

| Endpoint | Antes | Ahora | Aumento |
|----------|-------|-------|---------|
| **Auth (login/register)** | 5 → 20 | **100** | 5x |
| **API General** | 100 | **500** | 5x |

### Detalles

#### Endpoints de Autenticación
```typescript
// /api/auth/register
// /api/auth/login
authLimiter: {
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 100,                   // 100 peticiones por IP
  message: 'Demasiados intentos desde esta IP, por favor intente nuevamente después de 15 minutos'
}
```

#### Endpoints Generales de API
```typescript
// Todos los demás endpoints
apiLimiter: {
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 500,                   // 500 peticiones por IP
  message: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente más tarde'
}
```

## 🚀 Desplegar los Cambios

### Opción 1: Despliegue Automático (GitHub → Railway)

```bash
# 1. Commit
git add backend/src/middleware/rateLimiter.ts
git add backend/dist/middleware/rateLimiter.js
git commit -m "feat: aumentar rate limiter a 100 auth y 500 API"

# 2. Push
git push origin main

# 3. Railway desplegará automáticamente
```

### Opción 2: Rebuild Docker Images

```powershell
# Reconstruir y subir imágenes
.\docker-build-push.ps1 -DockerUsername "chambadigital"

# Railway detectará la nueva imagen
```

### Opción 3: Reiniciar Servicio en Railway

Si Railway no detecta los cambios:
1. Ir a tu proyecto en Railway
2. Click en el servicio backend
3. Settings → Restart

## 🧪 Verificar los Cambios

### Después del Despliegue

```bash
# Probar el endpoint
node scripts/test-register-endpoint.js
```

Deberías ver en los headers:
```
ratelimit-limit: 100
ratelimit-remaining: 99
```

### Verificar Manualmente

```bash
curl -i https://clasedesurfcom-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'
```

Buscar en los headers:
- `ratelimit-limit: 100`
- `ratelimit-remaining: XX`

## 📊 Impacto

### Antes (20 peticiones)
- ❌ Usuarios alcanzaban el límite rápidamente
- ❌ Frustración durante pruebas
- ❌ Problemas en desarrollo

### Ahora (100 peticiones)
- ✅ Suficiente para uso normal
- ✅ Mejor experiencia de usuario
- ✅ Más flexible para pruebas
- ✅ Mantiene seguridad

## 🔐 Seguridad

Los nuevos límites siguen siendo seguros:

### Protección contra Ataques
- ✅ **Fuerza bruta:** 100 intentos en 15 min es insuficiente
- ✅ **Spam:** Limita registros masivos
- ✅ **DDoS:** Reduce carga del servidor

### Uso Legítimo
- ✅ Usuario normal: ~5-10 peticiones
- ✅ Desarrollo/pruebas: ~20-50 peticiones
- ✅ Límite de 100: Cubre ambos casos

## 📝 Archivos Modificados

- ✅ `backend/src/middleware/rateLimiter.ts` (código fuente)
- ✅ `backend/dist/middleware/rateLimiter.js` (compilado)

## 🎯 Próximos Pasos

1. **Hacer commit y push:**
   ```bash
   git add backend/src/middleware/rateLimiter.ts backend/dist/middleware/rateLimiter.js RATE_LIMITER_AMPLIADO.md
   git commit -m "feat: aumentar rate limiter a 100 auth y 500 API"
   git push origin main
   ```

2. **Esperar despliegue de Railway** (2-5 minutos)

3. **Probar el registro:**
   - Ir a la página de registro
   - Intentar registrar un instructor
   - Debería funcionar sin error 429

4. **Verificar logs en Railway:**
   - Ver que no hay errores
   - Confirmar que el rate limiter está activo

## 💡 Recomendaciones

### Para Desarrollo Local
Deshabilitar rate limiter completamente:

```env
# .env
NODE_ENV=development
SKIP_RATE_LIMIT=true
```

### Para Producción
Los límites actuales son buenos, pero si necesitas más:

```typescript
// backend/src/middleware/rateLimiter.ts

// Para sitios con mucho tráfico
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // Aumentar a 200
  // ...
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Aumentar a 1000
  // ...
});
```

### Monitoreo
Agregar logs para ver cuántas peticiones recibe cada IP:

```typescript
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiados intentos desde esta IP, por favor intente nuevamente después de 15 minutos',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true',
  // Agregar handler para logging
  handler: (req, res) => {
    console.log(`[RATE LIMIT] IP ${req.ip} alcanzó el límite en ${req.path}`);
    res.status(429).json({
      message: 'Demasiados intentos desde esta IP, por favor intente nuevamente después de 15 minutos'
    });
  }
});
```

## 🔄 Rollback

Si necesitas volver a los límites anteriores:

```typescript
// backend/src/middleware/rateLimiter.ts

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Volver a 20
  // ...
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Volver a 100
  // ...
});
```

Luego:
```bash
npm run build
git add .
git commit -m "revert: volver a límites anteriores"
git push
```

## 📊 Comparación de Límites

| Escenario | Peticiones Necesarias | Límite Anterior | Límite Actual | ¿Suficiente? |
|-----------|----------------------|-----------------|---------------|--------------|
| Login normal | 1-2 | 20 | 100 | ✅ |
| Registro + error | 2-5 | 20 | 100 | ✅ |
| Desarrollo/pruebas | 20-50 | 20 ❌ | 100 ✅ | ✅ |
| Ataque fuerza bruta | 1000+ | 20 ✅ | 100 ✅ | ✅ |

## ✅ Checklist

- [x] Código modificado
- [x] Código compilado
- [x] Documentación creada
- [ ] Commit y push
- [ ] Despliegue en Railway
- [ ] Pruebas en producción
- [ ] Verificar logs

---

**Fecha:** 2025-10-16  
**Cambio:** Rate limiter aumentado  
**Auth:** 20 → 100 peticiones  
**API:** 100 → 500 peticiones  
**Estado:** ✅ Compilado, pendiente despliegue
