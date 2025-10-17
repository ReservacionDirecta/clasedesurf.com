# 🚨 INCIDENCIA CRÍTICA: Prisma Data Proxy vs Direct Connection

**Fecha**: 8 de Enero 2025  
**Severidad**: CRÍTICA  
**Estado**: EN RESOLUCIÓN  
**Plataforma**: Railway (Docker)

---

## 📋 RESUMEN EJECUTIVO

El backend falla al iniciar en Railway con error `InvalidDatasourceError: the URL must start with the protocol 'prisma://'`, a pesar de que la DATABASE_URL es correcta (`postgresql://`) y el cliente Prisma se regenera en runtime.

---

## ❌ ERROR PRINCIPAL

```
InvalidDatasourceError: Error validating datasource `db`: 
the URL must start with the protocol `prisma://`

at Dr.extractHostAndApiKey (/app/node_modules/@prisma/client/runtime/library.js:111:8441)
at Proxy.$connect (/app/node_modules/@prisma/client/runtime/library.js:130:4283)
at startServer (/app/dist/server.js:83:32)
```

**Código de Error**: P6001  
**Cliente Prisma**: v5.22.0  
**Engine**: none (Data Proxy mode)

---

## 🔍 ANÁLISIS DETALLADO

### Síntomas Observados

1. ✅ **DATABASE_URL correcta**: `postgresql://postgres:***@postgres.railway.internal:5432`
2. ✅ **Prisma client se genera**: Sin errores durante `npx prisma generate`
3. ✅ **Migraciones se aplican**: Base de datos conectada correctamente
4. ❌ **Falla al conectar**: El código compilado espera `prisma://` URL

### Logs de Railway

```
🔍 DATABASE_URL format check:
✅ DATABASE_URL is using direct PostgreSQL format

🔧 Generating Prisma client for direct connection...
✔ Generated Prisma Client (v5.22.0, engine=none) to ./node_modules/@prisma/client

🗄️ Deploying database migrations...
✅ Migrations deployed successfully

🌟 Starting Node.js server...
❌ Error connecting to the database or starting server: InvalidDatasourceError
```

### Causa Raíz Identificada

**PROBLEMA**: El código TypeScript compilado (`dist/server.js`) fue generado con una versión del cliente Prisma configurada para Data Proxy, NO para conexión directa.

**SECUENCIA DEL PROBLEMA**:

1. **Build Time** (Dockerfile):
   ```dockerfile
   RUN npm ci                    # Instala Prisma
   COPY . .                      # Copia código fuente
   RUN npm run build             # Compila TypeScript + genera cliente
   ```
   - El cliente Prisma se genera con configuración por defecto
   - TypeScript se compila importando ese cliente
   - El código compilado queda "atado" a esa versión del cliente

2. **Runtime** (start-production.sh):
   ```bash
   rm -rf node_modules/.prisma   # Elimina cliente
   npx prisma generate           # Regenera cliente
   node dist/server.js           # Ejecuta código compilado
   ```
   - Se regenera el cliente Prisma
   - PERO el código compilado ya tiene referencias al cliente anterior
   - El código compilado espera Data Proxy, el nuevo cliente es directo

### Por Qué Regenerar No Funciona

El problema es que **TypeScript compila las importaciones de Prisma en tiempo de build**:

```typescript
// src/prisma.ts
import { PrismaClient } from '@prisma/client';  // ← Resuelto en build time
```

Cuando se compila a JavaScript:
```javascript
// dist/prisma.js
const client_1 = require("@prisma/client");  // ← Referencia fija al cliente del build
```

Regenerar el cliente en runtime NO actualiza estas referencias en el código compilado.

---

## 🔧 SOLUCIONES INTENTADAS

### ❌ Intento 1: Regenerar en Runtime
**Acción**: Eliminar y regenerar cliente en `start-production.sh`  
**Resultado**: FALLO - El código compilado mantiene referencias antiguas

### ❌ Intento 2: Schema Directo Personalizado
**Acción**: Usar `prisma-direct.schema.prisma` con output personalizado  
**Resultado**: FALLO - Mismatch entre ubicación de generación e importación

### ❌ Intento 3: Variables de Entorno Forzadas
**Acción**: `PRISMA_GENERATE_DATAPROXY=false` en runtime  
**Resultado**: FALLO - Variables no afectan código ya compilado

### ✅ Intento 4: Generar Durante Build (EN PROGRESO)
**Acción**: Forzar generación correcta durante Docker build  
**Cambios**:
```dockerfile
# Dockerfile
ENV PRISMA_GENERATE_DATAPROXY=false
ENV PRISMA_CLIENT_ENGINE_TYPE=library
RUN npm run build

# Copiar cliente generado
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
```

```bash
# start-production.sh
# NO regenerar cliente, usar el del build
if [ -d "node_modules/.prisma/client" ]; then
    echo "✅ Prisma client from build found"
fi
```

---

## 📊 CONFIGURACIÓN ACTUAL

### Schema Prisma (`prisma/schema.prisma`)
```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "linux-musl", "debian-openssl-1.1.x", "debian-openssl-3.0.x"]
  engineType = "library"  // ← Conexión directa
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Variables Railway (Backend)
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=zvPwjXx4gKQ5GiJFgXzoLpaWHhPBSRujPbnxDn+YxRQ=
FRONTEND_URL=https://clasedesurfcom-production.up.railway.app
NODE_ENV=production
PORT=${{PORT}}
WHATSAPP_ENABLED=false
WHATSAPP_SESSION=surfschool
```

### Package.json Build Script
```json
{
  "scripts": {
    "build": "npx prisma generate && tsc -p ."
  }
}
```

---

## 🎯 SOLUCIÓN DEFINITIVA

### Cambios Aplicados

1. **Dockerfile**: Forzar variables de entorno durante build
2. **Startup Script**: NO regenerar cliente, usar el del build
3. **Copiar Cliente Completo**: Incluir tanto `.prisma` como `@prisma/client`

### Archivos Modificados

- ✅ `backend/Dockerfile` - Variables ENV en build stage
- ✅ `backend/start-production.sh` - Eliminada regeneración
- ⏳ **Pendiente**: Rebuild y push de imagen Docker

### Próximos Pasos

1. **Reiniciar Docker Desktop** (error de conexión actual)
2. **Rebuild imagen**: `docker build -t chambadigital/surfschool-backend:latest backend`
3. **Push imagen**: `docker push chambadigital/surfschool-backend:latest`
4. **Redeploy en Railway**: Forzar nuevo deploy
5. **Verificar logs**: Confirmar que usa cliente del build

---

## 📚 LECCIONES APRENDIDAS

### ❌ Errores Cometidos

1. **Regenerar en runtime**: No funciona con código compilado
2. **Outputs personalizados**: Complican la configuración sin beneficio
3. **Múltiples schemas**: Añaden complejidad innecesaria

### ✅ Mejores Prácticas

1. **Generar durante build**: El cliente debe generarse ANTES de compilar TypeScript
2. **Variables de entorno en build**: Configurar Prisma durante la compilación
3. **Copiar cliente completo**: Incluir todos los directorios necesarios
4. **No regenerar en runtime**: Usar el cliente del build
5. **Simplicidad**: Un solo schema, configuración directa

### 🔑 Puntos Clave

- **Prisma Client es estático**: Se resuelve en tiempo de compilación
- **TypeScript compila referencias**: Las importaciones quedan fijas
- **Runtime no puede cambiar build**: El código compilado es inmutable
- **Docker multi-stage**: Copiar TODOS los artefactos necesarios

---

## 🚀 ESTADO ACTUAL

### ✅ Completado
- [x] Identificación de causa raíz
- [x] Análisis de logs y debugging
- [x] Modificación de Dockerfile
- [x] Modificación de startup script
- [x] Documentación de incidencia

### ⏳ Pendiente
- [ ] Reiniciar Docker Desktop
- [ ] Rebuild imagen Docker
- [ ] Push imagen a Docker Hub
- [ ] Redeploy en Railway
- [ ] Verificación de funcionamiento

### 🎯 Criterios de Éxito

**La incidencia se considerará resuelta cuando**:
1. Backend inicie sin errores en Railway
2. Logs muestren: "✅ Prisma client from build found"
3. Servidor responda en `/health` endpoint
4. No aparezca error de Data Proxy

---

## 📞 CONTACTO Y SEGUIMIENTO

**Desarrollador**: Kiro AI  
**Plataforma**: Railway  
**Proyecto**: SurfSchool Booking Platform  
**Repositorio**: chambadigital/surfschool-backend

**Próxima Actualización**: Después de rebuild y redeploy

---

## 🔗 REFERENCIAS

- [Prisma Client Generation](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/generating-prisma-client)
- [Prisma Data Proxy](https://www.prisma.io/docs/data-platform/data-proxy)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)

---

**Última Actualización**: 8 de Enero 2025, 20:45 UTC  
**Versión Documento**: 1.0
