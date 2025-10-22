# Guía Completa de Despliegue en Railway

## 📋 Prerrequisitos

1. **Cuenta en Railway**: [railway.app](https://railway.app)
2. **Railway CLI**: 
   ```bash
   npm install -g @railway/cli
   ```
3. **Git**: Proyecto debe estar en un repositorio Git

## 🚀 Pasos de Despliegue

### 1. Preparación Inicial

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd clasedesurf.com

# Instalar Railway CLI
npm install -g @railway/cli

# Iniciar sesión en Railway
railway login
```

### 2. Crear Proyecto en Railway

```bash
# Crear nuevo proyecto
railway init

# O conectar a proyecto existente
railway link [project-id]
```

### 3. Configurar Base de Datos

1. Ve a Railway Dashboard
2. Agrega PostgreSQL addon
3. Copia la `DATABASE_URL` generada

### 4. Desplegar Backend

```bash
cd backend

# Desplegar
railway up

# Configurar variables de entorno
railway variables set NODE_ENV=production
railway variables set PORT=4000
railway variables set DATABASE_URL="postgresql://..."
railway variables set JWT_SECRET="tu-jwt-secret-seguro"
railway variables set JWT_REFRESH_SECRET="tu-refresh-secret-seguro"
```

### 5. Desplegar Frontend

```bash
cd ../frontend

# Desplegar
railway up

# Configurar variables de entorno
railway variables set NODE_ENV=production
railway variables set NEXT_PUBLIC_API_URL="https://tu-backend.railway.app"
railway variables set NEXTAUTH_URL="https://tu-frontend.railway.app"
railway variables set NEXTAUTH_SECRET="tu-nextauth-secret"
```

### 6. Ejecutar Migraciones

```bash
cd backend
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

## 🔧 Configuración Automática

### Usar Scripts Automatizados

```bash
# Desplegar todo automáticamente
./deploy-railway.ps1

# Configurar variables de entorno
./setup-railway-env.ps1 -BackendDomain "tu-backend.railway.app" -FrontendDomain "tu-frontend.railway.app" -DatabaseUrl "postgresql://..."
```

## 📁 Estructura de Archivos

```
clasedesurf.com/
├── backend/
│   ├── Dockerfile.railway          # Dockerfile optimizado para Railway
│   ├── railway.json               # Configuración de Railway
│   └── ...
├── frontend/
│   ├── Dockerfile.railway          # Dockerfile optimizado para Railway
│   ├── railway.json               # Configuración de Railway
│   └── ...
├── deploy-railway.ps1             # Script de despliegue
├── setup-railway-env.ps1          # Script de configuración
└── RAILWAY_ENV_VARIABLES.md       # Variables de entorno
```

## 🌐 Variables de Entorno

### Backend
- `DATABASE_URL`: URL de PostgreSQL
- `JWT_SECRET`: Secreto para JWT (mín. 32 caracteres)
- `JWT_REFRESH_SECRET`: Secreto para refresh tokens
- `FRONTEND_URL`: URL del frontend
- `NODE_ENV`: production
- `PORT`: 4000

### Frontend
- `NEXT_PUBLIC_API_URL`: URL del backend
- `NEXTAUTH_URL`: URL del frontend
- `NEXTAUTH_SECRET`: Secreto para NextAuth
- `NODE_ENV`: production

## 🔍 Verificación

### 1. Verificar Servicios
```bash
# Ver logs del backend
cd backend && railway logs

# Ver logs del frontend
cd frontend && railway logs
```

### 2. Probar Endpoints
```bash
# Health check del backend
curl https://tu-backend.railway.app/health

# Verificar frontend
curl https://tu-frontend.railway.app
```

### 3. Verificar Base de Datos
```bash
cd backend
railway run npx prisma studio
```

## 🛠️ Comandos Útiles

### Gestión de Servicios
```bash
# Ver estado de servicios
railway status

# Reiniciar servicio
railway restart

# Ver variables de entorno
railway variables

# Conectar a base de datos
railway connect
```

### Debugging
```bash
# Ver logs en tiempo real
railway logs --follow

# Ejecutar comandos en producción
railway run [comando]

# Abrir shell en el contenedor
railway shell
```

## 🔄 Actualizaciones

### Desplegar Cambios
```bash
# Backend
cd backend
git add .
git commit -m "Update backend"
railway up

# Frontend
cd frontend
git add .
git commit -m "Update frontend"
railway up
```

### Migraciones de Base de Datos
```bash
cd backend
railway run npx prisma migrate deploy
```

## 🚨 Troubleshooting

### Problemas Comunes

1. **Error de conexión a base de datos**
   - Verificar `DATABASE_URL`
   - Comprobar que PostgreSQL esté activo

2. **Error 500 en frontend**
   - Verificar `NEXT_PUBLIC_API_URL`
   - Comprobar que backend esté funcionando

3. **Error de autenticación**
   - Verificar `NEXTAUTH_SECRET`
   - Comprobar `NEXTAUTH_URL`

### Logs y Debugging
```bash
# Ver logs detallados
railway logs --tail 100

# Verificar variables de entorno
railway variables list

# Probar conexión a base de datos
railway run npx prisma db pull
```

## 📊 Monitoreo

### Métricas en Railway Dashboard
- CPU y memoria
- Requests por minuto
- Tiempo de respuesta
- Logs de errores

### Health Checks
- Backend: `/health`
- Frontend: `/api/health`

## 🔐 Seguridad

### Mejores Prácticas
1. Usar secretos seguros (mín. 32 caracteres)
2. Configurar CORS correctamente
3. Usar HTTPS en producción
4. Rotar secretos regularmente
5. Monitorear logs de seguridad

### Variables Sensibles
- Nunca commitear secretos en Git
- Usar Railway variables para secretos
- Rotar JWT secrets periódicamente

## 📈 Escalabilidad

### Configuración de Recursos
- Railway ajusta recursos automáticamente
- Monitorear uso en Dashboard
- Configurar alertas si es necesario

### Optimizaciones
- Usar CDN para assets estáticos
- Optimizar imágenes
- Implementar caché cuando sea necesario

## 🎯 Próximos Pasos

1. Configurar dominio personalizado
2. Implementar CI/CD con GitHub Actions
3. Configurar monitoreo avanzado
4. Implementar backups automáticos
5. Configurar alertas de rendimiento