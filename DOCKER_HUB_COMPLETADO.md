# ✅ Docker Hub - Despliegue Completado

## 🎉 Resumen

Las imágenes Docker del backend y frontend se construyeron y subieron exitosamente a Docker Hub.

## 📦 Imágenes Disponibles

### Backend
```bash
docker pull chambadigital/clasedesurf-backend:latest
```

**URL:** https://hub.docker.com/r/chambadigital/clasedesurf-backend

**Características:**
- Node.js 18 Alpine
- TypeScript compilado
- Prisma Client generado
- Multi-stage build optimizado
- Usuario no-root (backend:nodejs)
- Health check incluido
- Puerto: 4000

### Frontend
```bash
docker pull chambadigital/clasedesurf-frontend:latest
```

**URL:** https://hub.docker.com/r/chambadigital/clasedesurf-frontend

**Características:**
- Node.js 18 Alpine
- Next.js 14 standalone
- Optimizado para producción
- Usuario no-root (nextjs:nodejs)
- Puerto: 3000

## 🚀 Cómo Usar las Imágenes

### Opción 1: Docker Run

#### Backend
```bash
docker run -d \
  --name clasedesurf-backend \
  -p 4000:4000 \
  -e DATABASE_URL="postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway" \
  -e JWT_SECRET="tu-jwt-secret" \
  -e NEXTAUTH_SECRET="tu-nextauth-secret" \
  -e NODE_ENV="production" \
  chambadigital/clasedesurf-backend:latest
```

#### Frontend
```bash
docker run -d \
  --name clasedesurf-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="https://api.tu-dominio.com" \
  -e NEXTAUTH_URL="https://tu-dominio.com" \
  -e NEXTAUTH_SECRET="tu-nextauth-secret" \
  -e NODE_ENV="production" \
  chambadigital/clasedesurf-frontend:latest
```

### Opción 2: Docker Compose

Crea un archivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    image: chambadigital/clasedesurf-backend:latest
    container_name: clasedesurf-backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway
      - JWT_SECRET=${JWT_SECRET}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 30s
      timeout: 3s
      retries: 3

  frontend:
    image: chambadigital/clasedesurf-frontend:latest
    container_name: clasedesurf-frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000
      - NEXT_PUBLIC_BACKEND_URL=http://backend:4000
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NODE_ENV=production
    depends_on:
      - backend
    restart: unless-stopped

networks:
  default:
    name: clasedesurf-network
```

Luego ejecuta:

```bash
docker-compose up -d
```

### Opción 3: Railway

En Railway, puedes usar estas imágenes directamente:

1. **Crear nuevo servicio**
2. **Seleccionar "Deploy from Docker Image"**
3. **Ingresar la imagen:**
   - Backend: `chambadigital/clasedesurf-backend:latest`
   - Frontend: `chambadigital/clasedesurf-frontend:latest`
4. **Configurar variables de entorno**
5. **Desplegar**

## ⚙️ Variables de Entorno Requeridas

### Backend
```env
DATABASE_URL=postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway
JWT_SECRET=<genera-un-secret-seguro>
NEXTAUTH_SECRET=<genera-un-secret-seguro>
NODE_ENV=production
PORT=4000
```

### Frontend
```env
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
NEXT_PUBLIC_BACKEND_URL=https://api.tu-dominio.com
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=<mismo-que-backend>
NODE_ENV=production
PORT=3000
```

## 📊 Información de las Imágenes

### Tamaños
- **Backend:** ~280 MB
- **Frontend:** ~180 MB

### Arquitectura
- **Plataforma:** linux/amd64
- **Base:** node:18-alpine

### Capas
Ambas imágenes usan multi-stage builds para optimizar el tamaño:
- Stage 1: Builder (instala dependencias y compila)
- Stage 2: Production (solo runtime necesario)

## 🔄 Actualizar las Imágenes

### Construir Nueva Versión

```powershell
# Con versión específica
.\docker-build-push.ps1 -DockerUsername "chambadigital" -Version "v1.1.0"

# Solo latest
.\docker-build-push.ps1 -DockerUsername "chambadigital"
```

### Pull Nueva Versión

```bash
# Backend
docker pull chambadigital/clasedesurf-backend:latest

# Frontend
docker pull chambadigital/clasedesurf-frontend:latest

# Reiniciar contenedores
docker-compose down
docker-compose up -d
```

## 🧪 Probar las Imágenes Localmente

```bash
# Pull las imágenes
docker pull chambadigital/clasedesurf-backend:latest
docker pull chambadigital/clasedesurf-frontend:latest

# Crear red
docker network create clasedesurf-network

# Run backend
docker run -d \
  --name backend \
  --network clasedesurf-network \
  -p 4000:4000 \
  -e DATABASE_URL="postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway" \
  -e JWT_SECRET="test-secret" \
  -e NEXTAUTH_SECRET="test-secret" \
  chambadigital/clasedesurf-backend:latest

# Run frontend
docker run -d \
  --name frontend \
  --network clasedesurf-network \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="http://localhost:4000" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e NEXTAUTH_SECRET="test-secret" \
  chambadigital/clasedesurf-frontend:latest

# Ver logs
docker logs -f backend
docker logs -f frontend

# Probar
curl http://localhost:4000/health
curl http://localhost:3000
```

## 📝 Comandos Útiles

```bash
# Ver imágenes locales
docker images | grep clasedesurf

# Ver contenedores corriendo
docker ps | grep clasedesurf

# Ver logs
docker logs -f clasedesurf-backend
docker logs -f clasedesurf-frontend

# Entrar al contenedor
docker exec -it clasedesurf-backend sh
docker exec -it clasedesurf-frontend sh

# Detener contenedores
docker stop clasedesurf-backend clasedesurf-frontend

# Eliminar contenedores
docker rm clasedesurf-backend clasedesurf-frontend

# Eliminar imágenes
docker rmi chambadigital/clasedesurf-backend:latest
docker rmi chambadigital/clasedesurf-frontend:latest
```

## 🔐 Seguridad

Las imágenes incluyen:
- ✅ Usuario no-root
- ✅ Dependencias de producción solamente
- ✅ Multi-stage build (reduce superficie de ataque)
- ✅ Health checks
- ✅ Variables de entorno para secrets

## 📚 Documentación Adicional

- `DOCKER_HUB_DEPLOYMENT.md` - Guía completa de despliegue
- `docker-build-push.ps1` - Script de construcción y push
- `backend/Dockerfile` - Dockerfile del backend
- `frontend/Dockerfile` - Dockerfile del frontend

## 🎯 Próximos Pasos

1. **Desplegar en Railway:**
   - Usar las imágenes de Docker Hub
   - Configurar variables de entorno
   - Desplegar y probar

2. **Configurar CI/CD:**
   - GitHub Actions para build automático
   - Push automático a Docker Hub
   - Despliegue automático a Railway

3. **Monitoreo:**
   - Configurar logs
   - Configurar alertas
   - Monitorear uso de recursos

## ✅ Checklist de Despliegue

- [x] Imágenes construidas
- [x] Imágenes subidas a Docker Hub
- [x] Documentación creada
- [ ] Desplegar en Railway
- [ ] Configurar variables de entorno
- [ ] Probar en producción
- [ ] Configurar dominio personalizado
- [ ] Configurar CI/CD

---

**Fecha:** 2025-10-16  
**Usuario Docker Hub:** chambadigital  
**Imágenes:**
- `chambadigital/clasedesurf-backend:latest`
- `chambadigital/clasedesurf-frontend:latest`

**Estado:** ✅ COMPLETADO
