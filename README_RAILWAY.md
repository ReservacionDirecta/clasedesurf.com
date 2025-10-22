# 🚀 Clase de Surf - Despliegue en Railway

## ✅ Estado Actual

**TODO LISTO PARA DESPLEGAR** ✨

- ✅ Base de datos PostgreSQL configurada en Railway
- ✅ 9 migraciones aplicadas
- ✅ Datos de prueba cargados (11 usuarios, 2 escuelas, 8 clases)
- ✅ Secrets generados de forma segura
- ✅ Archivos de configuración creados
- ✅ Multi-tenant isolation implementado

## 🎯 Próximo Paso: Desplegar

### Opción 1: Seguir Guía Completa
📖 **[DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md)** - Guía paso a paso detallada

### Opción 2: Usar Checklist
☑️ **[CHECKLIST_RAILWAY.md](CHECKLIST_RAILWAY.md)** - Lista de verificación

### Opción 3: Resumen Rápido
📋 **[RESUMEN_RAILWAY.md](RESUMEN_RAILWAY.md)** - Resumen ejecutivo

## 🔐 Secrets

Los secrets están en `railway-secrets.txt` (no se sube a Git).

Para generar nuevos:
```bash
node generate-secrets.js
```

## 👥 Usuarios de Prueba

| Rol | Email | Password | Acceso |
|-----|-------|----------|---------|
| **Admin Global** | `admin@test.com` | `password123` | Todo |
| **Admin Lima** | `admin.lima@test.com` | `password123` | Solo Lima |
| **Admin Trujillo** | `admin.trujillo@test.com` | `password123` | Solo Trujillo |
| **Instructor Lima** | `instructor1.lima@test.com` | `password123` | Lima |
| **Estudiante** | `student1.lima@test.com` | `password123` | Todas las clases |

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   PostgreSQL    │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (Railway)     │
│   Railway       │    │   Railway       │    │   Railway       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 Datos en Railway

- **Usuarios**: 11 total
  - 1 Admin global
  - 2 School admins
  - 3 Instructores
  - 5 Estudiantes

- **Escuelas**: 2
  - Surf School Lima (4 clases, 2 instructores)
  - Surf School Trujillo (4 clases, 1 instructor)

- **Transacciones**: 6 pagos completados ($390 total)

## 🔍 Verificar Preparación

```bash
./check-railway-ready.ps1
```

## 🚀 Despliegue Rápido

1. **Ve a [Railway Dashboard](https://railway.app/dashboard)**
2. **Crea proyecto desde GitHub**
3. **Backend Service**:
   - Root: `backend`
   - Build: `npm install && npx prisma generate && npm run build`
   - Start: `npx prisma migrate deploy && npm start`
   - Variables: Copia desde `railway-secrets.txt`

4. **Frontend Service**:
   - Root: `frontend`
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Variables: Copia desde `railway-secrets.txt`

5. **Actualizar URLs cruzadas**
6. **Verificar funcionamiento**

## 🔧 Variables de Entorno

### Backend
```env
DATABASE_URL=postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway
NODE_ENV=production
PORT=4000
JWT_SECRET=[desde railway-secrets.txt]
JWT_REFRESH_SECRET=[desde railway-secrets.txt]
FRONTEND_URL=[URL del frontend en Railway]
```

### Frontend
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=[URL del backend en Railway]
NEXTAUTH_URL=[URL del frontend en Railway]
NEXTAUTH_SECRET=[desde railway-secrets.txt]
```

## 🎯 Verificación Post-Despliegue

1. **Health Check**: `https://[backend-url]/health` → `{"status":"ok"}`
2. **Frontend**: `https://[frontend-url]` → Página carga
3. **Login**: `admin@test.com` / `password123` → Dashboard funciona
4. **Multi-tenant**: Cada admin ve solo sus datos

## 📁 Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `railway-secrets.txt` | Secrets generados (NO subir a Git) |
| `DEPLOY_RAILWAY.md` | Guía completa de despliegue |
| `CHECKLIST_RAILWAY.md` | Lista de verificación |
| `RESUMEN_RAILWAY.md` | Resumen ejecutivo |
| `railway.json` | Configuración de Railway |
| `backend/railway.json` | Config específica del backend |
| `frontend/railway.json` | Config específica del frontend |

## ⚠️ Importante

- ❌ NO compartas `railway-secrets.txt`
- ❌ NO subas archivos `.sql` a Git
- ✅ Verifica cada paso del checklist
- ✅ Prueba el aislamiento multi-tenant
- ✅ Monitorea logs después del despliegue

## 🎉 ¡Listo para Producción!

Tu aplicación multi-tenant de clases de surf está completamente preparada para desplegarse en Railway con:

- ✨ Aislamiento de datos por escuela
- 🔐 Autenticación segura
- 💳 Sistema de pagos
- 📊 Dashboard con estadísticas
- 🏄‍♂️ Gestión completa de clases y reservas

---

**¿Necesitas ayuda?** Consulta los archivos de documentación o revisa los logs en Railway Dashboard.