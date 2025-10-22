# 📋 Resumen: Despliegue en Railway

## ✅ Completado

1. ✅ Base de datos PostgreSQL creada en Railway
2. ✅ Migraciones aplicadas (9 migraciones)
3. ✅ Datos de prueba cargados
4. ✅ Secrets generados
5. ✅ Archivos de configuración creados

## 🔐 Secrets Generados

Los secrets se guardaron en `railway-secrets.txt` (no se sube a Git).

Para generar nuevos secrets en cualquier momento:
```bash
node generate-secrets.js
```

## 📦 Próximos Pasos

### 1. Desplegar Backend en Railway

1. Ve a [Railway Dashboard](https://railway.app/dashboard)
2. Selecciona tu proyecto
3. Click en "New Service" → "GitHub Repo"
4. Configura:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm start`

5. Agrega estas variables de entorno:

```env
DATABASE_URL=postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway
NODE_ENV=production
PORT=4000
JWT_SECRET=[copia desde railway-secrets.txt]
JWT_REFRESH_SECRET=[copia desde railway-secrets.txt]
FRONTEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

6. Click en "Deploy"

### 2. Desplegar Frontend en Railway

1. En Railway Dashboard, click en "New Service" → "GitHub Repo"
2. Configura:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

3. Agrega estas variables de entorno:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://[tu-backend-url].railway.app
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NEXTAUTH_SECRET=[copia desde railway-secrets.txt]
```

4. Click en "Deploy"

### 3. Actualizar URLs Cruzadas

Una vez que ambos servicios estén desplegados:

1. **En el Backend**, actualiza:
   ```
   FRONTEND_URL=https://[tu-frontend-url].railway.app
   ```

2. **En el Frontend**, actualiza:
   ```
   NEXT_PUBLIC_API_URL=https://[tu-backend-url].railway.app
   NEXTAUTH_URL=https://[tu-frontend-url].railway.app
   ```

### 4. Verificar Despliegue

1. **Backend Health Check**:
   ```
   https://[tu-backend-url].railway.app/health
   ```
   Debe responder: `{"status":"ok"}`

2. **Frontend**:
   ```
   https://[tu-frontend-url].railway.app
   ```
   Debe cargar la página principal

3. **Login de Prueba**:
   - Email: `admin@test.com`
   - Password: `password123`

## 👥 Usuarios de Prueba

### Admin Global
- Email: `admin@test.com`
- Password: `password123`
- Acceso: TODO

### Escuela 1: Surf School Lima
- Admin: `admin.lima@test.com`
- Instructores:
  - `instructor1.lima@test.com`
  - `instructor2.lima@test.com`
- Estudiantes:
  - `student1.lima@test.com`
  - `student2.lima@test.com`

### Escuela 2: Surf School Trujillo
- Admin: `admin.trujillo@test.com`
- Instructores:
  - `instructor1.trujillo@test.com`
- Estudiantes:
  - `student1.trujillo@test.com`
  - `student2.trujillo@test.com`

### Estudiante Independiente
- Email: `student.independent@test.com`
- Password: `password123`

**Todas las contraseñas son**: `password123`

## 🔍 Verificar Aislamiento Multi-Tenant

1. Login como `admin.lima@test.com`:
   - ✅ Debe ver solo 4 clases (Lima)
   - ✅ Debe ver solo 2 instructores (Lima)
   - ❌ NO debe ver clases de Trujillo

2. Login como `admin.trujillo@test.com`:
   - ✅ Debe ver solo 4 clases (Trujillo)
   - ✅ Debe ver solo 1 instructor (Trujillo)
   - ❌ NO debe ver clases de Lima

3. Login como `student1.lima@test.com`:
   - ✅ Debe ver todas las clases (8 total)
   - ✅ Debe ver solo sus propias reservas
   - ❌ NO debe ver reservas de otros

## 📊 Datos en Railway

- **Usuarios**: 11 (1 admin, 2 school admins, 3 instructores, 5 estudiantes)
- **Escuelas**: 2 (Lima y Trujillo)
- **Clases**: 8 (4 por escuela)
- **Reservas**: 10 (con diferentes estados)
- **Pagos**: 6 completados ($390 total)

## 🔧 Comandos Útiles

### Ver estado de migraciones
```bash
$env:DATABASE_URL="postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway"
npx prisma migrate status
```

### Conectar a la base de datos
```bash
$env:PGPASSWORD="BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb"
psql -h hopper.proxy.rlwy.net -p 14816 -U postgres -d railway
```

### Ver logs en Railway
```bash
railway logs --service backend
railway logs --service frontend
```

## 📁 Archivos Importantes

- `railway.json` - Configuración general de Railway
- `backend/railway.json` - Configuración del backend
- `frontend/railway.json` - Configuración del frontend
- `railway-secrets.txt` - Secrets generados (NO se sube a Git)
- `DEPLOY_RAILWAY.md` - Guía detallada de despliegue
- `CREDENCIALES_SEED.md` - Credenciales de usuarios de prueba

## ⚠️ Importante

- ❌ NO compartas `railway-secrets.txt`
- ❌ NO subas archivos `.sql` a Git
- ✅ Cambia los secrets en producción
- ✅ Configura dominios personalizados
- ✅ Monitorea los logs regularmente

## 🎉 ¡Listo!

Tu aplicación está lista para desplegarse en Railway. Sigue los pasos en orden y verifica cada uno antes de continuar al siguiente.

---

**¿Necesitas ayuda?** Revisa `DEPLOY_RAILWAY.md` para más detalles.
