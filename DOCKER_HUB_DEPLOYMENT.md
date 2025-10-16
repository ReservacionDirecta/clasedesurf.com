# 🐳 Despliegue a Docker Hub

## 📋 Resumen

Este documento describe cómo construir y subir las imágenes Docker del backend y frontend a Docker Hub.

## 🔧 Requisitos Previos

- ✅ Docker Desktop instalado y corriendo
- ✅ Cuenta en Docker Hub
- ✅ Login en Docker Hub desde la terminal

## 🚀 Proceso Rápido

### Opción 1: Script Automatizado (Recomendado)

```powershell
# Construir y subir ambas imágenes
.\docker-build-push.ps1

# Con versión específica
.\docker-build-push.ps1 -Version "v1.0.0"

# Con usuario diferente
.\docker-build-push.ps1 -DockerUsername "tu-usuario"
```

### Opción 2: Manual

```powershell
# 1. Login en Docker Hub
docker login

# 2. Construir Backend
cd backend
docker build -t reservaciondirecta/clasedesurf-backend:latest .
cd ..

# 3. Construir Frontend
cd frontend
docker build -t reservaciondirecta/clasedesurf-frontend:latest .
cd ..

# 4. Subir Backend
docker push reservaciondirecta/clasedesurf-backend:latest

# 5. Subir Frontend
docker push reservaciondirecta/clasedesurf-frontend:latest
```

## 📦 Imágenes Creadas

### Backend
```
reservaciondirecta/clasedesurf-backend:latest
reservaciondirecta/clasedesurf-backend:v1.0.0
```

**Características:**
- Node.js 18 Alpine
- TypeScript compilado
- Prisma Client generado
- Multi-stage build (optimizado)
- Usuario no-root
- Health check incluido

**Puerto:** 4000

### Frontend
```
reservaciondirecta/clasedesurf-frontend:latest
reservaciondirecta/clasedesurf-frontend:v1.0.0
```

**Características:**
- Node.js 18 Alpine
- Next.js 14
- Standalone output
- Usuario no-root
- Optimizado para producción

**Puerto:** 3000

## 🔐 Login en Docker Hub

Si no estás logueado:

```powershell
docker login
```

Te pedirá:
- **Username:** tu-usuario-dockerhub
- **Password:** tu-password o token

## 📊 Verificar Imágenes Locales

```powershell
# Ver todas las imágenes
docker images | Select-String "clasedesurf"

# Ver tamaño de las imágenes
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | Select-String "clasedesurf"
```

## 🌐 Usar las Imágenes

### Desde Docker Hub

```bash
# Pull Backend
docker pull reservaciondirecta/clasedesurf-backend:latest

# Pull Frontend
docker pull reservaciondirecta/clasedesurf-frontend:latest

# Run Backend
docker run -d \
  -p 4000:4000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  --name backend \
  reservaciondirecta/clasedesurf-backend:latest

# Run Frontend
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="http://backend:4000" \
  --name frontend \
  reservaciondirecta/clasedesurf-frontend:latest
```

### Con Docker Compose

```yaml
version: '3.8'

services:
  backend:
    image: reservaciondirecta/clasedesurf-backend:latest
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://...
      - JWT_SECRET=...
      - NEXTAUTH_SECRET=...
    restart: unless-stopped

  frontend:
    image: reservaciondirecta/clasedesurf-frontend:latest
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - backend
    restart: unless-stopped
```

## 🔄 Actualizar Imágenes

### Construir Nueva Versión

```powershell
# Con nueva versión
.\docker-build-push.ps1 -Version "v1.1.0"
```

### Actualizar en Producción

```bash
# Pull nueva versión
docker pull reservaciondirecta/clasedesurf-backend:latest
docker pull reservaciondirecta/clasedesurf-frontend:latest

# Reiniciar contenedores
docker-compose down
docker-compose up -d
```

## 📝 Variables de Entorno Necesarias

### Backend
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=tu-jwt-secret-seguro
NEXTAUTH_SECRET=tu-nextauth-secret-seguro
NODE_ENV=production
PORT=4000
```

### Frontend
```env
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
NEXT_PUBLIC_BACKEND_URL=https://api.tu-dominio.com
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=tu-nextauth-secret-seguro
NODE_ENV=production
```

## 🐛 Solución de Problemas

### Error: "Cannot connect to Docker daemon"
```powershell
# Inicia Docker Desktop
# Espera a que esté completamente iniciado
docker version
```

### Error: "denied: requested access to the resource is denied"
```powershell
# Verifica que estés logueado
docker login

# Verifica el nombre de usuario
docker info | Select-String "Username"
```

### Error: "no space left on device"
```powershell
# Limpiar imágenes no usadas
docker system prune -a

# Ver espacio usado
docker system df
```

### Imagen muy grande
```powershell
# Ver capas de la imagen
docker history reservaciondirecta/clasedesurf-backend:latest

# Optimizar Dockerfile
# - Usar .dockerignore
# - Multi-stage builds
# - Limpiar cache de npm
```

## 📊 Tamaños Esperados

| Imagen | Tamaño Aproximado |
|--------|-------------------|
| Backend | ~200-300 MB |
| Frontend | ~150-250 MB |

## 🔍 Inspeccionar Imágenes

```powershell
# Ver detalles de la imagen
docker inspect reservaciondirecta/clasedesurf-backend:latest

# Ver variables de entorno
docker inspect reservaciondirecta/clasedesurf-backend:latest | Select-String "Env"

# Ver puertos expuestos
docker inspect reservaciondirecta/clasedesurf-backend:latest | Select-String "ExposedPorts"
```

## 🌐 URLs de Docker Hub

- **Backend:** https://hub.docker.com/r/reservaciondirecta/clasedesurf-backend
- **Frontend:** https://hub.docker.com/r/reservaciondirecta/clasedesurf-frontend

## 📋 Checklist de Despliegue

Antes de construir:
- [ ] Código actualizado y testeado
- [ ] Variables de entorno configuradas
- [ ] Dockerfiles optimizados
- [ ] .dockerignore actualizado

Durante la construcción:
- [ ] Docker Desktop corriendo
- [ ] Login en Docker Hub
- [ ] Suficiente espacio en disco
- [ ] Conexión a internet estable

Después de subir:
- [ ] Verificar en Docker Hub
- [ ] Probar pull de las imágenes
- [ ] Actualizar documentación
- [ ] Notificar al equipo

## 🎯 Próximos Pasos

1. **Construir y subir imágenes:**
   ```powershell
   .\docker-build-push.ps1
   ```

2. **Verificar en Docker Hub:**
   - Ir a https://hub.docker.com
   - Buscar tus repositorios
   - Verificar que las imágenes estén ahí

3. **Desplegar en Railway:**
   - Usar las imágenes de Docker Hub
   - Configurar variables de entorno
   - Desplegar

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs: `docker logs <container-id>`
2. Verifica las variables de entorno
3. Asegúrate de que Docker Desktop esté actualizado
4. Consulta la documentación de Docker

---

**Última actualización:** 2025-10-16  
**Versión:** 1.0.0
