# 🚀 Despliegue en Railway

## ✅ Estado Actual

- ✅ Base de datos PostgreSQL creada en Railway
- ✅ Migraciones aplicadas (9 migraciones)
- ✅ Datos de prueba cargados
- ⏳ Pendiente: Desplegar Backend y Frontend

## 📋 Pasos para Desplegar

### 1. Crear Proyecto en Railway

1. Ve a [Railway Dashboard](https://railway.app/dashboard)
2. Click en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Conecta tu repositorio de GitHub
5. Selecciona el repositorio `clasedesurf.com`

### 2. Configurar Backend

1. En Railway Dashboard, click en "New Service"
2. Selecciona "GitHub Repo"
3. Configura:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm start`

4. Agrega las variables de entorno:

```env
DATABASE_URL=postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway
NODE_ENV=production
PORT=4000
JWT_SECRET=tu-jwt-secret-super-seguro-de-32-caracteres-minimo
JWT_REFRESH_SECRET=tu-jwt-refresh-secret-super-seguro-de-32-caracteres
FRONTEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

5. Click en "Deploy"

### 3. Configurar Frontend

1. En Railway Dashboard, click en "New Service"
2. Selecciona "GitHub Repo"
3. Configura:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. Agrega las variables de entorno:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://[tu-backend-url].railway.app
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NEXTAUTH_SECRET=tu-nextauth-secret-super-seguro-de-32-caracteres-minimo
```

5. Click en "Deploy"

### 4. Generar Secrets

Para generar secrets seguros, ejecuta en tu terminal:

```powershell
# Generar JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generar JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generar NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Conectar Servicios

1. En el Backend, agrega la variable:
   ```
   FRONTEND_URL=https://[tu-frontend-url].railway.app
   ```

2. En el Frontend, agrega la variable:
   ```
   NEXT_PUBLIC_API_URL=https://[tu-backend-url].railway.app
   ```

### 6. Verificar Despliegue

Una vez desplegado, verifica:

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

3. **Login**:
   - Email: `admin@test.com`
   - Password: `password123`

## 🔧 Comandos Útiles (Railway CLI)

Si instalaste Railway CLI, puedes usar estos comandos:

```powershell
# Ver logs del backend
railway logs --service backend

# Ver logs del frontend
railway logs --service frontend

# Ver variables de entorno
railway variables

# Ejecutar comando en Railway
railway run npx prisma studio

# Conectar a la base de datos
railway connect postgres
```

## 📊 Usuarios de Prueba

Después del despliegue, puedes probar con estos usuarios:

### Admin Global
- Email: `admin@test.com`
- Password: `password123`
- Puede ver: TODO

### Escuela 1: Surf School Lima
- Admin: `admin.lima@test.com`
- Password: `password123`
- Instructores:
  - `instructor1.lima@test.com`
  - `instructor2.lima@test.com`
- Estudiantes:
  - `student1.lima@test.com`
  - `student2.lima@test.com`

### Escuela 2: Surf School Trujillo
- Admin: `admin.trujillo@test.com`
- Password: `password123`
- Instructores:
  - `instructor1.trujillo@test.com`
- Estudiantes:
  - `student1.trujillo@test.com`
  - `student2.trujillo@test.com`

### Estudiante Independiente
- Email: `student.independent@test.com`
- Password: `password123`
- Puede reservar en cualquier escuela

## 🔍 Verificar Aislamiento Multi-Tenant

Para verificar que el aislamiento funciona correctamente:

1. Login como `admin.lima@test.com`
   - Debe ver solo 4 clases (Lima)
   - Debe ver solo 2 instructores (Lima)
   - NO debe ver clases de Trujillo

2. Login como `admin.trujillo@test.com`
   - Debe ver solo 4 clases (Trujillo)
   - Debe ver solo 1 instructor (Trujillo)
   - NO debe ver clases de Lima

3. Login como `student1.lima@test.com`
   - Debe ver todas las clases (8 total)
   - Debe ver solo sus propias reservas
   - NO debe ver reservas de otros estudiantes

## ⚠️ Solución de Problemas

### Error: "Cannot connect to database"

Verifica que:
- La variable `DATABASE_URL` esté correctamente configurada
- La base de datos PostgreSQL esté corriendo en Railway

### Error: "Prisma Client not generated"

Ejecuta en Railway:
```powershell
railway run npx prisma generate
```

### Error: "Port already in use"

Railway asigna automáticamente el puerto. Asegúrate de usar:
```javascript
const PORT = process.env.PORT || 4000;
```

### Error de CORS

Verifica que:
- `FRONTEND_URL` en el backend apunte al frontend correcto
- `NEXT_PUBLIC_API_URL` en el frontend apunte al backend correcto

## 🎉 Siguiente Paso

Una vez desplegado:

1. ✅ Prueba el login con los usuarios de prueba
2. ✅ Verifica el aislamiento multi-tenant
3. ✅ Configura tu dominio personalizado (opcional)
4. ✅ Configura SSL/HTTPS (Railway lo hace automáticamente)
5. ✅ Monitorea los logs para detectar errores

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Railway Dashboard
2. Verifica las variables de entorno
3. Asegúrate de que las migraciones se aplicaron correctamente

---

**¡Listo para producción!** 🚀
