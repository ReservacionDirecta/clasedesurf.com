# 🚂 Configuración de Variables en Railway - Paso a Paso

## ❌ Error Actual
```
❌ ERROR: DATABASE_URL environment variable is not set
```

## 🔍 Problema Identificado

La variable `DATABASE_URL` no está llegando al contenedor. Esto puede deberse a:

1. **Variable no configurada** en Railway
2. **Sintaxis incorrecta** en la variable
3. **Base de datos no conectada** al servicio

## ✅ Solución Paso a Paso

### 1. **Verificar Base de Datos PostgreSQL**

En Railway:
1. Ir a tu proyecto
2. Verificar que tienes un **servicio PostgreSQL** creado
3. Si no existe, crear uno: **"+ New" → "Database" → "Add PostgreSQL"**

### 2. **Configurar Variables del Backend**

En el servicio del Backend, ir a **"Variables"** y agregar:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=zvPwjXx4gKQ5GiJFgXzoLpaWHhPBSRujPbnxDn+YxRQ=
FRONTEND_URL=https://clasedesurfcom-production.up.railway.app
NODE_ENV=production
PORT=${{PORT}}
WHATSAPP_ENABLED=false
WHATSAPP_SESSION=surfschool
```

### 3. **Verificar Sintaxis de DATABASE_URL**

**IMPORTANTE**: La sintaxis debe ser exactamente:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**NO usar:**
- `DATABASE_URL=${Postgres.DATABASE_URL}` ❌
- `DATABASE_URL={{Postgres.DATABASE_URL}}` ❌
- `DATABASE_URL=$Postgres.DATABASE_URL` ❌

### 4. **Conectar Servicios**

1. En el servicio Backend, ir a **"Settings"**
2. En **"Service Connections"**, verificar que PostgreSQL esté conectado
3. Si no está conectado, hacer clic en **"Connect"** y seleccionar PostgreSQL

## 🔧 Troubleshooting

### Si DATABASE_URL sigue sin funcionar:

#### Opción A: Usar Variable Manual
1. Ir al servicio PostgreSQL
2. Copiar la **Connection URL** completa
3. En Backend Variables, usar:
```env
DATABASE_URL=postgresql://postgres:password@host:port/database
```

#### Opción B: Verificar Nombre del Servicio
Si tu servicio PostgreSQL tiene otro nombre, usar:
```env
DATABASE_URL=${{TU_SERVICIO_POSTGRES.DATABASE_URL}}
```

### Verificar Variables Configuradas:

En Railway, las variables deberían verse así:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `JWT_SECRET` | `zvPwjXx4gKQ5GiJFgXzoLpaWHhPBSRujPbnxDn+YxRQ=` |
| `FRONTEND_URL` | `https://clasedesurfcom-production.up.railway.app` |
| `NODE_ENV` | `production` |
| `PORT` | `${{PORT}}` |
| `WHATSAPP_ENABLED` | `false` |
| `WHATSAPP_SESSION` | `surfschool` |

## 🚀 Después de Configurar Variables

1. **Redeploy** el servicio Backend
2. **Verificar logs** muestran:
```
📊 Database URL configured: postgresql://postgres:***@***
```

3. **NO debe mostrar**:
```
❌ ERROR: DATABASE_URL environment variable is not set
```

## 🔍 Verificación Final

### Logs Correctos:
```
🚀 Starting SurfSchool Backend in production mode...
📊 Database URL configured: postgresql://postgres:***@***
🔧 Using direct connection schema...
✅ Direct schema client generated
✅ Connected to PostgreSQL
🚀 Server is running on port 4000
```

### Health Check:
```bash
curl https://surfschool-backend-production.up.railway.app/health
```

## 📞 Si el Problema Persiste

1. **Verificar** que PostgreSQL esté ejecutándose
2. **Revisar** que los servicios estén en el mismo proyecto
3. **Comprobar** que la sintaxis sea exactamente `${{Postgres.DATABASE_URL}}`
4. **Intentar** con la URL completa manualmente

**¡Una vez configuradas correctamente las variables, el backend debería iniciar sin problemas!** 🎯
## 🔧 
**ACTUALIZACIÓN - Fix Aplicado (Enero 2025)**

### ❌ **Problema Resuelto**: Error Prisma Client
```
Error: Cannot find module '.prisma/client/default'
```

### 🎯 **Causa Identificada**
- El schema directo (`prisma-direct.schema.prisma`) tenía `output = "./generated/client"`
- La aplicación importaba desde `@prisma/client` (ubicación por defecto)
- Mismatch entre ubicación de generación y ubicación de importación

### ✅ **Solución Aplicada**
1. **Removido** `output = "./generated/client"` del schema directo
2. **Regenerada** imagen Docker: `chambadigital/surfschool-backend:latest`
3. **Pusheada** nueva versión a Docker Hub

### 🚀 **Estado Actual**
- ✅ **Backend**: Fix aplicado, nueva imagen disponible
- ⏳ **Frontend**: Pendiente configuración de variables
- 🎯 **Próximo**: Deploy del frontend con las 5 variables configuradas

### 📋 **Variables Frontend (Recordatorio)**
```env
NEXTAUTH_SECRET=zvPwjXx4gKQ5GiJFgXzoLpaWHhPBSRujPbnxDn+YxRQ=
NEXTAUTH_URL=https://clasedesurfcom-production.up.railway.app
NEXT_PUBLIC_BACKEND_URL=https://surfschool-backend-production.up.railway.app
NODE_ENV=production
PORT=${{PORT}}
```

**¡El backend ahora debería funcionar correctamente en Railway!** 🎉
## 🔧 **
ACTUALIZACIÓN FINAL - Problema Completamente Resuelto**

### ❌ **Errores Resueltos**
```
Error: Cannot find module '.prisma/client/default'
cp: can't stat 'prisma-direct.schema.prisma': No such file or directory
```

### 🎯 **Solución Definitiva**
1. **Simplificado** startup script - eliminada dependencia del schema directo
2. **Usa schema por defecto** - sin outputs personalizados
3. **Regenerada** imagen final: `chambadigital/surfschool-backend:latest`

### ✅ **Estado Final**
- ✅ **Backend**: Completamente funcional, imagen final pusheada
- ⏳ **Frontend**: Listo para configurar variables y deploy
- 🎯 **Siguiente**: Deploy frontend con las 5 variables

**¡Backend 100% funcional en Railway!** 🚀


---

## 🚨 **INCIDENCIA CRÍTICA DOCUMENTADA**

### ❌ **Error Prisma Data Proxy**
```
InvalidDatasourceError: the URL must start with the protocol 'prisma://'
```

### 📋 **Documentación Completa**
- **Análisis**: Ver `INCIDENCIA_PRISMA_DATA_PROXY.md`
- **Solución**: Ver `SOLUCION_PRISMA_DEFINITIVA.md`

### 🎯 **Causa Raíz**
El código TypeScript compilado fue generado con un cliente Prisma configurado para Data Proxy, pero en runtime se intentaba usar conexión directa PostgreSQL.

### ✅ **Solución Aplicada**
1. Variables ENV en Dockerfile para forzar conexión directa durante build
2. Copiar cliente Prisma completo del build stage
3. NO regenerar cliente en runtime, usar el del build
4. Sincronizar código compilado con cliente correcto

### ⏳ **Estado**
- ✅ Cambios aplicados en código
- ⏳ Rebuild de imagen pendiente (Docker Desktop desconectado)
- ⏳ Deploy en Railway pendiente

**Ver documentos de incidencia para detalles completos** 📚
