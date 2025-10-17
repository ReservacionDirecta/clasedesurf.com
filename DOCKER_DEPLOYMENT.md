# 🐳 Despliegue con Docker - Clase de Surf

Guía completa para dockerizar y desplegar la aplicación Clase de Surf.

---

## 📋 Requisitos Previos

- Docker Desktop instalado y corriendo
- Cuenta en Docker Hub (https://hub.docker.com)
- Git instalado
- 4GB de RAM disponible mínimo

---

## 🚀 Inicio Rápido

### 1. Clonar el Repositorio
```bash
git clone <tu-repo>
cd clasedesurf.com
```

### 2. Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp .env.docker.example .env

# Editar el archivo .env con tus valores
# IMPORTANTE: Cambiar los secretos en producción
```

### 3. Construir y Subir a Docker Hub

**Windows (PowerShell):**
```powershell
# Construir y subir con tu usuario de Docker Hub
.\docker-build-push-all.ps1 -Username "tu-usuario" -Version "1.0.0"

# Solo construir (sin subir)
.\docker-build-push-all.ps1 -Username "tu-usuario" -BuildOnly
```

**Linux/Mac:**
```bash
# Dar permisos de ejecución
chmod +x docker-build-push-all.sh

# Construir y subir
./docker-build-push-all.sh tu-usuario 1.0.0

# Solo construir (sin subir)
BUILD_ONLY=true ./docker-build-push-all.sh tu-usuario 1.0.0
```

### 4. Iniciar la Aplicación
```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver estado
docker-compose ps
```

---

## 📦 Imágenes Docker

### Backend
```
yerct/clasedesurf-backend:latest
yerct/clasedesurf-backend:1.0.0
```

### Frontend
```
yerct/clasedesurf-frontend:latest
yerct/clasedesurf-frontend:1.0.0
```

---

## 🔧 Comandos Útiles

### Construcción

```bash
# Construir solo backend
docker build -t yerct/clasedesurf-backend:latest ./backend

# Construir solo frontend
docker build -t yerct/clasedesurf-frontend:latest ./frontend

# Construir todo con docker-compose
docker-compose build
```

### Gestión de Contenedores

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Reiniciar un servicio
docker-compose restart backend

# Ver logs de un servicio
docker-compose logs -f backend

# Ver logs de todos los servicios
docker-compose logs -f

# Ejecutar comando en contenedor
docker-compose exec backend sh
docker-compose exec frontend sh

# Ver estado de servicios
docker-compose ps
```

### Base de Datos

```bash
# Ejecutar migraciones
docker-compose exec backend npx prisma migrate deploy

# Generar cliente Prisma
docker-compose exec backend npx prisma generate

# Seed de datos
docker-compose exec backend npx prisma db seed

# Acceder a PostgreSQL
docker-compose exec postgres psql -U postgres -d clasedesurf.com

# Backup de base de datos
docker-compose exec postgres pg_dump -U postgres clasedesurf.com > backup.sql

# Restaurar base de datos
docker-compose exec -T postgres psql -U postgres clasedesurf.com < backup.sql
```

### Limpieza

```bash
# Detener y eliminar contenedores
docker-compose down

# Eliminar también volúmenes (¡CUIDADO! Borra la base de datos)
docker-compose down -v

# Limpiar imágenes no usadas
docker image prune -a

# Limpiar todo (contenedores, imágenes, volúmenes, redes)
docker system prune -a --volumes
```

---

## 🌐 Acceso a la Aplicación

Una vez iniciados los servicios:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **PostgreSQL:** localhost:5432

### Credenciales de Prueba

**Estudiante:**
- Email: student1.trujillo@test.com
- Password: password123

**Instructor:**
- Email: instructor1.trujillo@test.com
- Password: password123

**Admin de Escuela:**
- Email: admin.trujillo@test.com
- Password: password123

---

## 🔐 Configuración de Seguridad

### Variables de Entorno Importantes

```env
# JWT Secrets (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=tu-secreto-jwt-muy-seguro-min-32-caracteres
JWT_REFRESH_SECRET=tu-secreto-refresh-muy-seguro-min-32-caracteres

# NextAuth Secret (CAMBIAR EN PRODUCCIÓN)
NEXTAUTH_SECRET=tu-secreto-nextauth-muy-seguro-min-32-caracteres

# PostgreSQL Password (CAMBIAR EN PRODUCCIÓN)
POSTGRES_PASSWORD=tu-password-seguro-de-postgres
```

### Generar Secretos Seguros

**PowerShell:**
```powershell
# Generar secreto aleatorio
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

**Linux/Mac:**
```bash
# Generar secreto aleatorio
openssl rand -base64 32
```

---

## 📊 Monitoreo

### Health Checks

```bash
# Backend health
curl http://localhost:4000/health

# Frontend health
curl http://localhost:3000/api/health

# PostgreSQL health
docker-compose exec postgres pg_isready -U postgres
```

### Logs

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver últimas 100 líneas
docker-compose logs --tail=100

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Recursos

```bash
# Ver uso de recursos
docker stats

# Ver uso de disco
docker system df

# Ver detalles de un contenedor
docker inspect clasedesurf-backend
```

---

## 🚢 Despliegue en Producción

### 1. Preparar Variables de Entorno

Crear archivo `.env.production`:

```env
# Docker
DOCKER_USERNAME=tu-usuario
VERSION=1.0.0

# Database
POSTGRES_PASSWORD=password-super-seguro-cambiar
POSTGRES_PORT=5432

# Backend
BACKEND_PORT=4000
JWT_SECRET=secreto-jwt-super-seguro-min-32-chars
JWT_REFRESH_SECRET=secreto-refresh-super-seguro-min-32-chars

# Frontend
FRONTEND_PORT=3000
FRONTEND_URL=https://tu-dominio.com
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
NEXT_PUBLIC_BACKEND_URL=https://api.tu-dominio.com
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=secreto-nextauth-super-seguro-min-32-chars

# WhatsApp (Opcional)
WHATSAPP_ENABLED=false
```

### 2. Construir Imágenes de Producción

```bash
# Construir con versión específica
./docker-build-push-all.sh tu-usuario 1.0.0
```

### 3. Desplegar

```bash
# Usar archivo de producción
docker-compose --env-file .env.production up -d

# Verificar que todo esté corriendo
docker-compose ps
docker-compose logs -f
```

### 4. Configurar Reverse Proxy (Nginx/Traefik)

Ejemplo con Nginx:

```nginx
# Frontend
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Configurar SSL con Let's Encrypt

```bash
# Instalar certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtener certificados
sudo certbot --nginx -d tu-dominio.com -d api.tu-dominio.com

# Renovación automática
sudo certbot renew --dry-run
```

---

## 🔄 Actualización

### Actualizar a Nueva Versión

```bash
# 1. Construir nueva versión
./docker-build-push-all.sh tu-usuario 1.1.0

# 2. Actualizar docker-compose.yml con nueva versión
# VERSION=1.1.0

# 3. Pull de nuevas imágenes
docker-compose pull

# 4. Reiniciar servicios
docker-compose up -d

# 5. Verificar
docker-compose ps
docker-compose logs -f
```

### Rollback a Versión Anterior

```bash
# 1. Cambiar versión en docker-compose.yml
# VERSION=1.0.0

# 2. Pull de versión anterior
docker-compose pull

# 3. Reiniciar servicios
docker-compose up -d
```

---

## 🐛 Troubleshooting

### Problema: Contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs backend

# Ver eventos del contenedor
docker events

# Inspeccionar contenedor
docker inspect clasedesurf-backend
```

### Problema: Error de conexión a base de datos

```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps postgres

# Ver logs de PostgreSQL
docker-compose logs postgres

# Verificar conectividad
docker-compose exec backend ping postgres
```

### Problema: Puerto ya en uso

```bash
# Ver qué proceso usa el puerto
# Windows
netstat -ano | findstr :4000

# Linux/Mac
lsof -i :4000

# Cambiar puerto en .env
BACKEND_PORT=4001
```

### Problema: Falta de espacio en disco

```bash
# Ver uso de disco
docker system df

# Limpiar imágenes no usadas
docker image prune -a

# Limpiar todo
docker system prune -a --volumes
```

---

## 📚 Recursos Adicionales

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Hub](https://hub.docker.com/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Prisma Docker Documentation](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)

---

## 📝 Notas

- Las imágenes se construyen con multi-stage builds para optimizar el tamaño
- Los datos de PostgreSQL se persisten en un volumen Docker
- Los health checks aseguran que los servicios estén listos antes de aceptar tráfico
- Se usa un usuario no-root en los contenedores por seguridad
- Las imágenes están optimizadas para producción

---

## ✅ Checklist de Despliegue

- [ ] Variables de entorno configuradas
- [ ] Secretos cambiados de los valores por defecto
- [ ] Imágenes construidas y subidas a Docker Hub
- [ ] Base de datos con backup configurado
- [ ] SSL/TLS configurado
- [ ] Reverse proxy configurado
- [ ] Monitoreo configurado
- [ ] Logs centralizados
- [ ] Health checks funcionando
- [ ] Pruebas de carga realizadas

---

¡Listo para desplegar! 🚀
