# 🏄 Surf School Booking Platform - Docker Images

[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://hub.docker.com/)
[![Next.js](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)

Marketplace de surf en Lima - Conecta surfistas con las mejores escuelas de surf en Perú.

## 📦 Imágenes Disponibles

### Frontend (Next.js)
```bash
docker pull [TU_USERNAME]/surfschool-frontend:latest
```

### Backend (Node.js)
```bash
docker pull [TU_USERNAME]/surfschool-backend:latest
```

## 🚀 Inicio Rápido

### Usando Docker Compose

1. **Descargar configuración:**
```bash
curl -O https://raw.githubusercontent.com/[TU_REPO]/main/docker-compose.prod.yml
```

2. **Configurar variables de entorno:**
```bash
export POSTGRES_PASSWORD=tu-password-seguro
export JWT_SECRET=tu-jwt-secret-muy-seguro
export NEXTAUTH_SECRET=tu-nextauth-secret-seguro
```

3. **Iniciar aplicación:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

4. **Acceder a la aplicación:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

### Usando Docker Run

#### Base de datos (PostgreSQL)
```bash
docker run -d \
  --name surfschool-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=clasedesurf.com \
  -p 5432:5432 \
  postgres:15-alpine
```

#### Backend
```bash
docker run -d \
  --name surfschool-backend \
  --link surfschool-postgres:postgres \
  -e DATABASE_URL="postgresql://postgres:postgres@postgres:5432/clasedesurf.com" \
  -e JWT_SECRET="tu-jwt-secret" \
  -e NODE_ENV="production" \
  -p 4000:4000 \
  [TU_USERNAME]/surfschool-backend:latest
```

#### Frontend
```bash
docker run -d \
  --name surfschool-frontend \
  --link surfschool-backend:backend \
  -e NEXT_PUBLIC_API_URL="http://localhost:4000" \
  -e NEXTAUTH_SECRET="tu-nextauth-secret" \
  -p 3000:3000 \
  [TU_USERNAME]/surfschool-frontend:latest
```

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │    Backend      │    │   PostgreSQL    │
│   (Next.js)     │────│   (Node.js)     │────│   (Database)    │
│   Port 3000     │    │   Port 4000     │    │   Port 5432     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Tecnologías

### Frontend
- **Next.js 14** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **NextAuth.js** - Authentication

### Backend
- **Node.js** - Runtime
- **Express** - Web Framework
- **TypeScript** - Type Safety
- **Prisma** - Database ORM
- **JWT** - Authentication

### Base de Datos
- **PostgreSQL** - Primary Database
- **Redis** - Cache & Sessions

## 📋 Variables de Entorno

### Frontend
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL del backend | `http://localhost:4000` |
| `NEXTAUTH_URL` | URL del frontend | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret para NextAuth | `tu-secret-seguro` |
| `DATABASE_URL` | URL de PostgreSQL | `postgresql://user:pass@host:5432/db` |

### Backend
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret para JWT | `tu-jwt-secret` |
| `PORT` | Puerto del servidor | `4000` |
| `NODE_ENV` | Entorno | `production` |
| `FRONTEND_URL` | URL del frontend | `http://localhost:3000` |

## 🔒 Configuración de Producción

### 1. Secrets Seguros
```bash
# Generar secrets seguros
openssl rand -base64 32  # Para JWT_SECRET
openssl rand -base64 32  # Para NEXTAUTH_SECRET
```

### 2. Base de Datos Externa
```bash
# Usar base de datos externa (recomendado)
export DATABASE_URL="postgresql://user:password@your-db-host:5432/dbname"
```

### 3. HTTPS y Dominio
```bash
# Configurar para dominio real
export NEXTAUTH_URL="https://tu-dominio.com"
export NEXT_PUBLIC_API_URL="https://api.tu-dominio.com"
```

## 🚀 Despliegue en Cloud

### AWS ECS
```bash
# Usar con AWS ECS
aws ecs create-service --service-name surfschool --task-definition surfschool:1
```

### Google Cloud Run
```bash
# Desplegar en Cloud Run
gcloud run deploy surfschool-frontend --image [TU_USERNAME]/surfschool-frontend:latest
gcloud run deploy surfschool-backend --image [TU_USERNAME]/surfschool-backend:latest
```

### Azure Container Instances
```bash
# Desplegar en Azure
az container create --resource-group myResourceGroup --name surfschool-frontend --image [TU_USERNAME]/surfschool-frontend:latest
```

## 📊 Health Checks

### Backend Health Check
```bash
curl http://localhost:4000/health
```

### Frontend Health Check
```bash
curl http://localhost:3000
```

## 🔍 Troubleshooting

### Ver Logs
```bash
# Logs del frontend
docker logs surfschool-frontend

# Logs del backend
docker logs surfschool-backend

# Logs de la base de datos
docker logs surfschool-postgres
```

### Problemas Comunes

#### Puerto ya en uso
```bash
# Cambiar puerto
docker run -p 3001:3000 [TU_USERNAME]/surfschool-frontend:latest
```

#### Base de datos no conecta
```bash
# Verificar conexión
docker exec -it surfschool-postgres psql -U postgres -d clasedesurf.com
```

#### Variables de entorno
```bash
# Verificar variables
docker exec -it surfschool-backend env | grep DATABASE_URL
```

## 📚 Documentación

- [Repositorio GitHub](https://github.com/[TU_REPO])
- [Documentación Completa](https://github.com/[TU_REPO]/blob/main/DOCKER_SETUP.md)
- [API Documentation](https://github.com/[TU_REPO]/blob/main/API.md)

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 🏷️ Tags

- `latest` - Última versión estable
- `v1.0.0` - Versión específica
- `main` - Rama principal (desarrollo)

---

**Desarrollado con ❤️ para la comunidad de surf en Lima, Perú** 🏄‍♂️