# 🐳 Guía de Construcción Docker

## 📋 Scripts Disponibles

### 🔨 Construcción de Imágenes

#### `docker-build-local.ps1`
Construye imágenes Docker localmente usando `docker build`.

```bash
# Construir todas las imágenes
./docker-build-local.ps1

# Construir solo backend
./docker-build-local.ps1 -Backend

# Construir solo frontend
./docker-build-local.ps1 -Frontend

# Construir con tag específico
./docker-build-local.ps1 -Tag "v1.0.0"

# Construir y subir al registry
./docker-build-local.ps1 -Push
```

**Parámetros:**
- `-Tag`: Tag para las imágenes (default: "latest")
- `-Registry`: Nombre del registry (default: "clasedesurf")
- `-Push`: Subir imágenes al registry después de construir
- `-Backend`: Construir solo backend
- `-Frontend`: Construir solo frontend
- `-All`: Construir ambos (default si no se especifica)

### 🧪 Pruebas Locales

#### `docker-test-local.ps1`
Prueba las imágenes construidas localmente.

```bash
# Probar imágenes (inicia contenedores)
./docker-test-local.ps1

# Probar con puertos específicos
./docker-test-local.ps1 -BackendPort 4001 -FrontendPort 3001

# Ver logs de contenedores
./docker-test-local.ps1 -Logs

# Detener contenedores de prueba
./docker-test-local.ps1 -Stop
```

**Parámetros:**
- `-Tag`: Tag de las imágenes a probar
- `-Registry`: Registry de las imágenes
- `-BackendPort`: Puerto para backend (default: 4000)
- `-FrontendPort`: Puerto para frontend (default: 3000)
- `-DatabaseUrl`: URL de base de datos para pruebas
- `-Stop`: Detener y eliminar contenedores
- `-Logs`: Mostrar logs de contenedores

### 🚀 Construcción y Prueba Completa

#### `docker-build-and-test.ps1`
Script completo que construye y prueba todo automáticamente.

```bash
# Proceso completo: construir + probar
./docker-build-and-test.ps1

# Solo construir (saltar pruebas)
./docker-build-and-test.ps1 -SkipTest

# Solo probar (saltar construcción)
./docker-build-and-test.ps1 -SkipBuild

# Usar Docker Compose para pruebas
./docker-build-and-test.ps1 -UseCompose

# Limpiar todo
./docker-build-and-test.ps1 -Clean
```

**Parámetros:**
- `-Tag`: Tag para imágenes
- `-Registry`: Registry para imágenes
- `-SkipBuild`: Saltar construcción
- `-SkipTest`: Saltar pruebas
- `-UseCompose`: Usar docker-compose.test.yml
- `-Clean`: Limpiar contenedores y volúmenes

### 🌐 Despliegue en Railway

#### `deploy-railway.ps1`
Despliega en Railway con opciones de construcción y prueba.

```bash
# Despliegue directo
./deploy-railway.ps1

# Construir antes de desplegar
./deploy-railway.ps1 -BuildFirst

# Construir y probar antes de desplegar
./deploy-railway.ps1 -BuildFirst -TestFirst

# Con tag específico
./deploy-railway.ps1 -BuildFirst -Tag "v1.0.0"
```

## 🏗️ Arquitectura de Imágenes

### Backend (`Dockerfile.railway`)
```dockerfile
FROM node:18-alpine
# Instalar dependencias del sistema
# Copiar y instalar dependencias npm
# Generar Prisma client
# Construir TypeScript
# Configurar usuario no-root
# Exponer puerto dinámico
```

**Características:**
- Multi-stage build optimizado
- Usuario no-root para seguridad
- Health check integrado
- Puerto dinámico para Railway
- Prisma client generado

### Frontend (`Dockerfile.railway`)
```dockerfile
FROM node:18-alpine AS base
# Instalar dependencias
FROM base AS builder
# Construir aplicación Next.js
FROM node:18-alpine AS runner
# Configurar producción standalone
```

**Características:**
- Build multi-etapa
- Standalone Next.js
- Usuario no-root
- Optimizado para Railway
- Variables de entorno dinámicas

## 📊 Flujo de Trabajo Recomendado

### 1. Desarrollo Local
```bash
# Construir imágenes
./docker-build-local.ps1

# Probar localmente
./docker-test-local.ps1

# Verificar que todo funciona
# Abrir http://localhost:3000
```

### 2. Pruebas Completas
```bash
# Proceso completo automatizado
./docker-build-and-test.ps1

# O con Docker Compose
./docker-build-and-test.ps1 -UseCompose
```

### 3. Despliegue
```bash
# Despliegue con validación previa
./deploy-railway.ps1 -BuildFirst -TestFirst

# O despliegue directo si ya probaste
./deploy-railway.ps1
```

### 4. Verificación
```bash
# Verificar despliegue en Railway
./verify-railway-deployment.ps1 -BackendUrl "https://backend.railway.app" -FrontendUrl "https://frontend.railway.app"
```

## 🔧 Configuración de Imágenes

### Variables de Entorno

#### Backend
```env
DATABASE_URL=postgresql://...
PORT=4000
NODE_ENV=production
JWT_SECRET=...
JWT_REFRESH_SECRET=...
FRONTEND_URL=...
```

#### Frontend
```env
NEXT_PUBLIC_API_URL=...
NEXT_PUBLIC_BACKEND_URL=...
NEXTAUTH_URL=...
NEXTAUTH_SECRET=...
NODE_ENV=production
PORT=3000
```

### Puertos
- **Backend**: 4000 (configurable)
- **Frontend**: 3000 (configurable)
- **PostgreSQL**: 5432

## 🐙 Docker Compose

### `docker-compose.test.yml`
Configuración para pruebas locales completas:

```yaml
services:
  postgres-test:    # PostgreSQL para pruebas
  backend-test:     # Backend con imagen local
  frontend-test:    # Frontend con imagen local
```

**Uso:**
```bash
# Iniciar todos los servicios
docker-compose -f docker-compose.test.yml up -d

# Ver logs
docker-compose -f docker-compose.test.yml logs -f

# Detener servicios
docker-compose -f docker-compose.test.yml down
```

## 🔍 Debugging

### Ver Logs
```bash
# Logs de construcción
docker build --progress=plain --no-cache -f backend/Dockerfile.railway backend/

# Logs de contenedor
docker logs clasedesurf-backend-test -f

# Logs con Docker Compose
docker-compose -f docker-compose.test.yml logs -f backend-test
```

### Inspeccionar Imágenes
```bash
# Listar imágenes
docker images clasedesurf/*

# Inspeccionar imagen
docker inspect clasedesurf/clasedesurf-backend:latest

# Ejecutar shell en contenedor
docker run -it clasedesurf/clasedesurf-backend:latest sh
```

### Problemas Comunes

#### 1. Error de construcción
```bash
# Limpiar caché de Docker
docker builder prune

# Construir sin caché
docker build --no-cache -f backend/Dockerfile.railway backend/
```

#### 2. Contenedor no inicia
```bash
# Ver logs detallados
docker logs clasedesurf-backend-test

# Verificar variables de entorno
docker exec clasedesurf-backend-test env
```

#### 3. No se puede conectar a la base de datos
```bash
# Verificar que PostgreSQL esté corriendo
docker ps | grep postgres

# Probar conexión
docker exec clasedesurf-backend-test npx prisma db pull
```

## 📈 Optimizaciones

### Tamaño de Imagen
- Usar `node:18-alpine` (imagen base pequeña)
- Multi-stage builds
- `.dockerignore` optimizado
- Limpiar caché npm

### Rendimiento
- Standalone Next.js
- Prisma client optimizado
- Health checks eficientes
- Variables de entorno cacheadas

### Seguridad
- Usuario no-root
- Secretos en variables de entorno
- Puertos no privilegiados
- Imágenes actualizadas

## 🎯 Próximos Pasos

1. **Construir imágenes**: `./docker-build-local.ps1`
2. **Probar localmente**: `./docker-test-local.ps1`
3. **Validar completo**: `./docker-build-and-test.ps1`
4. **Desplegar**: `./deploy-railway.ps1 -BuildFirst -TestFirst`
5. **Verificar**: `./verify-railway-deployment.ps1`

¡Tus imágenes Docker están listas para Railway! 🚀