# 🐳 Docker Setup - clasesde.pe

Guía completa para dockerizar y desplegar la plataforma clasesde.pe.

## 📦 Imágenes Docker

### 🏷️ Repositorios en Docker Hub

- **Backend**: `chambadigital/clasesde-pe-backend`
- **Frontend**: `chambadigital/clasesde-pe-frontend`

## 🚀 Desarrollo Local

### Prerrequisitos

- Docker Desktop instalado y corriendo
- PowerShell (Windows) o Bash (Linux/Mac)

### Inicio Rápido

```powershell
# Iniciar todos los servicios
.\docker-dev.ps1 up

# Ver logs en tiempo real
.\docker-dev.ps1 logs

# Detener servicios
.\docker-dev.ps1 down
```

### URLs de Desarrollo

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000
- **Database**: localhost:5432

## 🏗️ Build y Deploy

### Build Local

```powershell
# Backend
cd backend
docker build -t clasesde-pe-backend .

# Frontend
cd frontend
docker build -t clasesde-pe-frontend .
```

### Push a Docker Hub

```powershell
# Build y push automático
.\docker-build-push.ps1

# Con versión específica
.\docker-build-push.ps1 -Version "v2.0.0"

# Con usuario diferente
.\docker-build-push.ps1 -DockerUsername "tu-usuario"
```

## 🐳 Docker Compose

### Servicios Incluidos

- **postgres**: Base de datos PostgreSQL 15
- **backend**: API Node.js con Prisma
- **frontend**: Aplicación Next.js

### Comandos Útiles

```bash
# Iniciar en background
docker-compose up -d

# Ver logs de un servicio específico
docker-compose logs -f backend

# Reconstruir un servicio
docker-compose up --build backend

# Ejecutar comandos en contenedor
docker-compose exec backend npm run prisma:migrate
docker-compose exec postgres psql -U postgres -d clasesde_pe
```

## 🔧 Configuración

### Variables de Entorno

#### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/clasesde_pe"
JWT_SECRET="dev-secret-change-in-production"
PORT=4000
NODE_ENV=development
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:4000"
NEXTAUTH_SECRET="dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV=development
```

## 📋 Comandos de Mantenimiento

### Limpieza

```powershell
# Limpiar todo (contenedores, volúmenes, imágenes)
.\docker-dev.ps1 clean

# Limpiar solo contenedores parados
docker container prune

# Limpiar imágenes no utilizadas
docker image prune
```

### Base de Datos

```bash
# Backup
docker-compose exec postgres pg_dump -U postgres clasesde_pe > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres clasesde_pe < backup.sql

# Reset completo
docker-compose down -v
docker-compose up -d postgres
docker-compose exec backend npm run prisma:migrate:reset
```

## 🚀 Producción

### Railway Deployment

Las imágenes están optimizadas para Railway:

```bash
# Pull desde Docker Hub
docker pull chambadigital/clasesde-pe-backend:latest
docker pull chambadigital/clasesde-pe-frontend:latest
```

### Variables de Producción

#### Backend
```env
DATABASE_URL="postgresql://user:pass@host:port/db"
JWT_SECRET="secure-production-secret"
PORT=4000
NODE_ENV=production
```

#### Frontend
```env
NEXTAUTH_URL="https://clasesde-pe-production.up.railway.app"
NEXT_PUBLIC_BACKEND_URL="https://clasesde-pe-backend-production.up.railway.app"
NEXTAUTH_SECRET="secure-production-secret"
NODE_ENV=production
```

## 🔍 Troubleshooting

### Problemas Comunes

#### Puerto ocupado
```bash
# Verificar qué usa el puerto
netstat -ano | findstr :3000
netstat -ano | findstr :4000

# Matar proceso
taskkill /PID <PID> /F
```

#### Problemas de permisos
```bash
# Reconstruir sin caché
docker-compose build --no-cache

# Limpiar volúmenes
docker-compose down -v
```

#### Base de datos no conecta
```bash
# Verificar estado de PostgreSQL
docker-compose exec postgres pg_isready -U postgres

# Ver logs de la base de datos
docker-compose logs postgres
```

## 📊 Monitoreo

### Health Checks

```bash
# Backend health
curl http://localhost:4000/health

# Frontend health
curl http://localhost:3000/api/health
```

### Logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend

# Últimas 100 líneas
docker-compose logs --tail=100 backend
```

## 🎯 Mejores Prácticas

### Desarrollo

1. **Usar volúmenes** para hot reload
2. **Separar environments** (dev/prod)
3. **Health checks** en todos los servicios
4. **Multi-stage builds** para optimización

### Producción

1. **Imágenes mínimas** (Alpine Linux)
2. **Usuarios no-root** para seguridad
3. **Secrets management** adecuado
4. **Monitoring y logging** configurado

## 🔗 Enlaces Útiles

- [Docker Hub - Backend](https://hub.docker.com/r/chambadigital/clasesde-pe-backend)
- [Docker Hub - Frontend](https://hub.docker.com/r/chambadigital/clasesde-pe-frontend)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Railway Docker Guide](https://docs.railway.app/deploy/dockerfiles)