# 🐳 Dockerización para Railway y Docker Hub

Este proyecto está dockerizado y listo para desplegar en Railway usando imágenes de Docker Hub.

## 📋 Archivos Creados

- `backend/Dockerfile.production` - Dockerfile optimizado para producción (Railway)
- `frontend/Dockerfile.production` - Dockerfile optimizado para producción (Railway)
- `docker-build.sh` - Script para construir y subir imágenes (Linux/Mac)
- `docker-build.ps1` - Script para construir y subir imágenes (Windows)
- `docker-compose.yml` - Configuración para desarrollo local
- `RAILWAY_DEPLOY.md` - Guía completa de despliegue en Railway

## 🚀 Uso Rápido

### 1. Configurar Docker Hub Username

**Windows (PowerShell):**
```powershell
$env:DOCKER_USERNAME = "tu-usuario-dockerhub"
```

**Linux/Mac:**
```bash
export DOCKER_USERNAME="tu-usuario-dockerhub"
```

### 2. Iniciar Sesión en Docker Hub

```bash
docker login
```

### 3. Construir y Subir Imágenes

**Windows:**
```powershell
# Construir y subir todo
.\docker-build.ps1 all -Push

# Solo backend
.\docker-build.ps1 backend -Push

# Solo frontend
.\docker-build.ps1 frontend -Push
```

**Linux/Mac:**
```bash
chmod +x docker-build.sh

# Construir y subir todo
./docker-build.sh all push

# Solo backend
./docker-build.sh backend push

# Solo frontend
./docker-build.sh frontend push
```

## 🚂 Desplegar en Railway

1. Crea dos servicios en Railway:
   - **Backend**: `tu-usuario/clasedesurf-backend:latest`
   - **Frontend**: `tu-usuario/clasedesurf-frontend:latest`

2. Configura las variables de entorno (ver `RAILWAY_DEPLOY.md`)

3. Railway detectará automáticamente el puerto desde la variable `PORT`

## 🔧 Variables de Entorno Importantes

### Backend
- `DATABASE_URL` - URL de PostgreSQL
- `JWT_SECRET` - Secreto para JWT
- `FRONTEND_URL` - URL del frontend en Railway
- `PORT` - Puerto (Railway lo configura automáticamente)

### Frontend
- `NEXT_PUBLIC_BACKEND_URL` - URL del backend en Railway
- `NEXTAUTH_URL` - URL del frontend en Railway
- `NEXTAUTH_SECRET` - Secreto para NextAuth
- `PORT` - Puerto (Railway lo configura automáticamente)

## 📖 Documentación Completa

Para más detalles, consulta `RAILWAY_DEPLOY.md`
