# 🔧 Fix Prisma Client Runtime Error - Railway

## 🐛 Error Detectado (10/08/2025)

```
❌ Error: the URL must start with the protocol `prisma://`
InvalidDatasourceError: Error validating datasource `db`: 
the URL must start with the protocol `prisma://`
```

## 🔍 Causa Raíz

**Prisma Client se generaba en build time sin DATABASE_URL**, causando que esperara formato `prisma://` en lugar de `postgresql://`.

## ✅ Solución Implementada

### 1. Modificado `backend/start-production.sh`

Agregado paso de regeneración de Prisma Client:

```bash
# Regenerate Prisma Client with runtime DATABASE_URL
echo "🔄 Regenerating Prisma Client with runtime DATABASE_URL..."
npx prisma generate

# Start the server
echo "🌟 Starting Node.js server..."
exec node dist/server.js
```

### 2. Nueva Imagen Docker

```bash
# Build
docker build -t chambadigital/surfschool-backend:latest backend

# Push
docker push chambadigital/surfschool-backend:latest
```

**Imagen actualizada:** `chambadigital/surfschool-backend:latest`
**Digest:** `sha256:45d6b80b8bf52ffcbe647cb573e8e89f03970e6a035cc9253b3246909612d264`

## 🚀 Acción Requerida en Railway

### Redeploy del Backend

1. Ve al servicio **Backend** en Railway
2. Click en **"Deploy"** o **"Redeploy"**
3. Railway descargará la nueva imagen automáticamente
4. Verifica los logs para confirmar:
   - ✅ `🔄 Regenerating Prisma Client with runtime DATABASE_URL...`
   - ✅ `✅ Migrations deployed successfully`
   - ✅ `🌟 Starting Node.js server...`
   - ✅ `🚀 Server running on port 8080`

## 📋 Variables Requeridas (Sin Cambios)

Las variables en Railway siguen siendo las mismas:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=zvPwjXx4gKQ5GiJFgXzoLpaWHhPBSRujPbnxDn+YxRQ=
FRONTEND_URL=https://clasedesurfcom-production.up.railway.app
NODE_ENV=production
PORT=${{PORT}}
WHATSAPP_ENABLED=false
WHATSAPP_SESSION=surfschool
```

## ✅ Resultado Esperado

Después del redeploy, el backend debería:
- ✅ Conectarse correctamente a PostgreSQL
- ✅ Regenerar Prisma Client con la URL correcta
- ✅ Ejecutar migraciones exitosamente
- ✅ Iniciar el servidor sin errores

## 🔗 Verificación

Una vez deployado, verifica:

```bash
# Health check
curl https://surfschool-backend-production.up.railway.app/health

# Debería responder:
{"status":"ok","timestamp":"..."}
```

---

## 🔄 Fix Adicional: Frontend Standalone (10/08/2025)

### 🐛 Warning Detectado
```
⚠ "next start" does not work with "output: standalone" configuration. 
Use "node .next/standalone/server.js" instead.
```

### ✅ Solución Frontend

Modificado `frontend/Dockerfile` para usar el servidor standalone de Next.js:

```dockerfile
# Copy standalone output
RUN cp -r .next/standalone ./standalone
RUN cp -r .next/static ./standalone/.next/static
RUN cp -r public ./standalone/public

# Start the standalone server
CMD ["node", "standalone/server.js"]
```

**Nueva imagen:** `chambadigital/surfschool-frontend:latest`
**Digest:** `sha256:3947ad7b45482915a49ad44985f8db62c6334a175152677da75d71eea01c938d`

### 🚀 Redeploy Frontend en Railway

Railway descargará automáticamente la nueva imagen y usará el servidor standalone optimizado.

---

**Status:** ✅ Backend y Frontend fixes implementados
**Fecha:** 10/08/2025
**Imágenes:**
- Backend: `chambadigital/surfschool-backend:latest`
- Frontend: `chambadigital/surfschool-frontend:latest`
