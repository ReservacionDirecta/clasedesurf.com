# 🐳 Docker Setup - Surf School Booking Platform

## Arquitectura de la Aplicación

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │    Frontend     │    │    Backend      │
│  (Port 80/443)  │────│   (Next.js)     │────│   (Node.js)     │
│  Reverse Proxy  │    │   Port 3000     │    │   Port 4000     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐    ┌─────────────────┐
                    │   PostgreSQL    │    │     Redis       │
                    │   Port 5432     │    │   Port 6379     │
                    │   (Database)    │    │   (Cache)       │
                    └─────────────────┘    └─────────────────┘
```

## 🚀 Inicio Rápido

### Opción 1: Aplicación Completa (Producción)

```bash
# Doble clic en el archivo o ejecutar:
docker-start.bat
```

Esto iniciará:
- ✅ Frontend (Next.js) - http://localhost:3000
- ✅ Backend (Node.js) - http://localhost:4000  
- ✅ PostgreSQL - localhost:5432
- ✅ Redis - localhost:6379
- ✅ Nginx - http://localhost:80

### Opción 2: Solo Servicios (Desarrollo)

```bash
# Para desarrollo local:
docker-dev.bat
```

Esto iniciará solo PostgreSQL y Redis, permitiendo ejecutar frontend y backend localmente.

### Opción 3: Comandos Manuales

```bash
# Iniciar todo
docker-compose -f docker-compose.full.yml up --build -d

# Ver logs
docker-compose -f docker-compose.full.yml logs -f

# Detener todo
docker-compose -f docker-compose.full.yml down

# Detener y eliminar volúmenes (CUIDADO: borra datos)
docker-compose -f docker-compose.full.yml down -v
```

## 📦 Servicios Incluidos

### 1. Frontend (Next.js)
- **Puerto**: 3000
- **Tecnología**: Next.js 14, TypeScript, Tailwind CSS
- **Features**: SSR, Image Optimization, Standalone Build
- **Health Check**: Automático

### 2. Backend (Node.js)
- **Puerto**: 4000
- **Tecnología**: Express, TypeScript, Prisma
- **Features**: JWT Auth, Rate Limiting, Health Checks
- **Database**: PostgreSQL con Prisma ORM

### 3. PostgreSQL
- **Puerto**: 5432
- **Usuario**: postgres
- **Contraseña**: postgres
- **Base de datos**: clasedesurf.com
- **Persistencia**: Volumen Docker

### 4. Redis
- **Puerto**: 6379
- **Uso**: Cache, Sesiones, Rate Limiting
- **Persistencia**: Volumen Docker

### 5. Nginx
- **Puerto**: 80 (HTTP), 443 (HTTPS)
- **Función**: Reverse Proxy, Load Balancer
- **Features**: Gzip, Rate Limiting, Security Headers

## 🔧 Configuración

### Variables de Entorno

#### Backend
```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/clasedesurf.com
JWT_SECRET=dev-secret-key-for-development-only
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
WHATSAPP_ENABLED=true
WHATSAPP_SESSION=surfschool
```

#### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-nextauth-secret-key
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/clasedesurf.com
```

### Personalización

#### Cambiar Puertos
Edita `docker-compose.full.yml`:
```yaml
services:
  frontend:
    ports:
      - "3001:3000"  # Cambiar puerto externo
```

#### Configurar HTTPS
1. Genera certificados SSL:
```bash
mkdir nginx/ssl
# Coloca cert.pem y key.pem en nginx/ssl/
```

2. Descomenta la sección HTTPS en `nginx/nginx.conf`

#### Base de Datos Externa
Cambia la configuración en `docker-compose.full.yml`:
```yaml
environment:
  DATABASE_URL: "postgresql://user:pass@external-db:5432/dbname"
```

## 🛠️ Desarrollo

### Desarrollo Local con Docker
```bash
# 1. Iniciar solo servicios auxiliares
docker-dev.bat

# 2. En terminal separada - Backend
cd backend
npm install
npm run dev

# 3. En otra terminal - Frontend  
cd frontend
npm install
npm run dev
```

### Hot Reload en Docker
Para desarrollo con hot reload en Docker, usa volúmenes:
```yaml
volumes:
  - ./frontend:/app
  - /app/node_modules
```

### Debugging
```bash
# Ver logs de un servicio específico
docker-compose -f docker-compose.full.yml logs -f frontend

# Acceder a un contenedor
docker exec -it surfschool-backend bash

# Ver estado de servicios
docker-compose -f docker-compose.full.yml ps
```

## 📊 Monitoreo

### Health Checks
Todos los servicios tienen health checks configurados:

```bash
# Ver estado de salud
docker-compose -f docker-compose.full.yml ps

# Endpoint de salud del backend
curl http://localhost:4000/health
```

### Logs
```bash
# Todos los logs
docker-compose -f docker-compose.full.yml logs -f

# Solo errores
docker-compose -f docker-compose.full.yml logs -f | grep ERROR

# Logs de un servicio
docker-compose -f docker-compose.full.yml logs -f backend
```

## 🔒 Seguridad

### Configuración de Producción

1. **Cambiar secretos**:
```env
JWT_SECRET=tu-secreto-super-seguro-aqui
NEXTAUTH_SECRET=otro-secreto-muy-seguro
```

2. **Configurar HTTPS**:
- Certificados SSL válidos
- Redirect HTTP → HTTPS
- HSTS headers

3. **Base de datos**:
- Usuario y contraseña seguros
- Conexión SSL
- Backup automático

4. **Rate Limiting**:
- Configurado en Nginx
- Límites por IP
- Protección DDoS

### Variables de Entorno Seguras
```bash
# Crear archivo .env.production
cp .env.example .env.production

# Editar con valores seguros
nano .env.production
```

## 🚀 Despliegue

### Producción Local
```bash
# Build optimizado
docker-compose -f docker-compose.full.yml build --no-cache

# Iniciar en modo producción
NODE_ENV=production docker-compose -f docker-compose.full.yml up -d
```

### Cloud Deployment
Para desplegar en cloud (AWS, GCP, Azure):

1. **Registry de imágenes**:
```bash
# Tag y push a registry
docker tag surfschool-frontend your-registry/surfschool-frontend
docker push your-registry/surfschool-frontend
```

2. **Orquestación**:
- Kubernetes (k8s)
- Docker Swarm
- AWS ECS
- Google Cloud Run

## 🐛 Troubleshooting

### Problemas Comunes

#### Puerto ya en uso
```bash
# Ver qué usa el puerto
netstat -ano | findstr :3000

# Cambiar puerto en docker-compose.full.yml
```

#### Contenedor no inicia
```bash
# Ver logs detallados
docker-compose -f docker-compose.full.yml logs backend

# Reconstruir imagen
docker-compose -f docker-compose.full.yml build --no-cache backend
```

#### Base de datos no conecta
```bash
# Verificar PostgreSQL
docker exec -it surfschool-postgres psql -U postgres -d clasedesurf.com

# Reset de base de datos
docker-compose -f docker-compose.full.yml down -v
docker-compose -f docker-compose.full.yml up postgres -d
```

#### Problemas de permisos
```bash
# En Windows, ejecutar como administrador
# En Linux/Mac:
sudo docker-compose -f docker-compose.full.yml up -d
```

### Comandos Útiles

```bash
# Limpiar todo Docker
docker system prune -a

# Ver uso de espacio
docker system df

# Logs en tiempo real
docker-compose -f docker-compose.full.yml logs -f --tail=100

# Reiniciar un servicio
docker-compose -f docker-compose.full.yml restart backend

# Actualizar imágenes
docker-compose -f docker-compose.full.yml pull
```

## 📚 Recursos

- **Docker**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **Nginx**: https://nginx.org/en/docs/

---

## ✅ Checklist de Instalación

- [ ] Docker Desktop instalado y corriendo
- [ ] Puertos 80, 3000, 4000, 5432, 6379 disponibles
- [ ] Ejecutar `docker-start.bat`
- [ ] Verificar http://localhost:3000 (Frontend)
- [ ] Verificar http://localhost:4000/health (Backend)
- [ ] Verificar http://localhost:80 (Nginx)

**¡Tu aplicación Surf School está lista!** 🏄‍♂️