# 🏄 SurfSchool - Docker Deployment Guide

## 📋 Descripción

Este proyecto incluye una configuración completa de Docker para desplegar la aplicación SurfSchool con todos sus servicios.

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │    Frontend     │    │    Backend      │
│  (Reverse Proxy)│◄──►│   (Next.js)     │◄──►│   (Node.js)     │
│     Port 80     │    │    Port 3000    │    │    Port 4000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │      Redis      │    │  Evolution API  │
│   (Database)    │    │     (Cache)     │    │   (WhatsApp)    │
│    Port 5432    │    │    Port 6379    │    │    Port 8080    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker 20.10+
- Docker Compose 2.0+
- Git

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/surfschool.git
cd surfschool
```

### 2. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.docker .env

# Editar las variables según tu entorno
nano .env
```

### 3. Desplegar la Aplicación

#### Opción A: Usando el Script de Despliegue (Recomendado)

**Windows (PowerShell):**
```powershell
# Desarrollo básico
.\docker-deploy.ps1

# Producción completa
.\docker-deploy.ps1 -Mode prod

# Con WhatsApp incluido
.\docker-deploy.ps1 -Mode full -WhatsApp

# Construir imágenes y limpiar
.\docker-deploy.ps1 -Build -Clean
```

**Linux/Mac:**
```bash
# Dar permisos de ejecución
chmod +x docker-deploy.sh

# Desarrollo básico
./docker-deploy.sh

# Producción completa
./docker-deploy.sh --mode prod

# Con WhatsApp incluido
./docker-deploy.sh --mode full --whatsapp

# Construir imágenes y limpiar
./docker-deploy.sh --build --clean
```

#### Opción B: Usando Docker Compose Directamente

```bash
# Desarrollo
docker-compose -f docker-compose.yml up -d

# Producción
docker-compose -f docker-compose.complete.yml up -d

# Con WhatsApp
docker-compose -f docker-compose.complete.yml --profile whatsapp up -d
```

## 🔧 Configuraciones Disponibles

### Modos de Despliegue

| Modo | Servicios | Descripción |
|------|-----------|-------------|
| `dev` | PostgreSQL, Redis, Backend, Frontend | Desarrollo básico |
| `prod` | Todos + Nginx | Producción con proxy reverso |
| `full` | Todos + WhatsApp | Funcionalidad completa |

### Puertos por Defecto

| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend | 4000 | http://localhost:4000 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| Nginx | 80/443 | http://localhost |
| Evolution API | 8080 | http://localhost:8080 |

## 📁 Estructura de Archivos Docker

```
├── docker-compose.yml              # Desarrollo básico
├── docker-compose.prod.yml         # Producción (legacy)
├── docker-compose.complete.yml     # Configuración completa
├── .env.docker                     # Variables de entorno
├── docker-deploy.ps1              # Script Windows
├── docker-deploy.sh               # Script Linux/Mac
├── .dockerignore                  # Archivos ignorados
├── frontend/
│   └── Dockerfile                 # Imagen Frontend
├── backend/
│   └── Dockerfile                 # Imagen Backend
└── nginx/
    └── nginx.conf                 # Configuración Nginx
```

## 🛠️ Comandos Útiles

### Gestión de Servicios

```bash
# Ver estado de servicios
docker-compose ps

# Ver logs
docker-compose logs -f

# Reiniciar un servicio
docker-compose restart backend

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
```

### Desarrollo y Debug

```bash
# Acceder al contenedor del backend
docker exec -it surfschool-backend bash

# Acceder a la base de datos
docker exec -it surfschool-postgres psql -U postgres -d clasedesurf.com

# Ver logs de un servicio específico
docker-compose logs -f backend

# Reconstruir una imagen
docker-compose build --no-cache backend
```

### Mantenimiento

```bash
# Limpiar contenedores parados
docker container prune

# Limpiar imágenes no utilizadas
docker image prune

# Limpiar todo (¡CUIDADO!)
docker system prune -a
```

## 🔒 Configuración de Producción

### 1. Variables de Entorno Seguras

```bash
# Generar secretos seguros
JWT_SECRET=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 16)
```

### 2. SSL/HTTPS (Nginx)

```bash
# Generar certificados SSL
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem
```

### 3. Firewall y Seguridad

```bash
# Permitir solo puertos necesarios
ufw allow 80
ufw allow 443
ufw deny 3000  # Frontend directo
ufw deny 4000  # Backend directo
```

## 📊 Monitoreo y Logs

### Logs Centralizados

```bash
# Ver todos los logs
docker-compose logs -f

# Logs de un servicio específico
docker-compose logs -f backend

# Logs con timestamp
docker-compose logs -f -t
```

### Health Checks

Todos los servicios incluyen health checks:

```bash
# Ver estado de salud
docker-compose ps

# Inspeccionar health check
docker inspect surfschool-backend | grep -A 10 Health
```

## 🔄 Backup y Restauración

### Base de Datos

```bash
# Backup
docker exec surfschool-postgres pg_dump -U postgres clasedesurf.com > backup.sql

# Restauración
docker exec -i surfschool-postgres psql -U postgres clasedesurf.com < backup.sql
```

### Volúmenes

```bash
# Listar volúmenes
docker volume ls

# Backup de volumen
docker run --rm -v surfschool_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **Puerto ya en uso**
   ```bash
   # Cambiar puertos en .env
   FRONTEND_PORT=3001
   BACKEND_PORT=4001
   ```

2. **Base de datos no conecta**
   ```bash
   # Verificar que PostgreSQL esté corriendo
   docker-compose logs postgres
   
   # Reiniciar servicios
   docker-compose restart postgres backend
   ```

3. **Imágenes no se actualizan**
   ```bash
   # Reconstruir sin cache
   docker-compose build --no-cache
   ```

4. **Problemas de permisos**
   ```bash
   # Linux/Mac: Ajustar permisos
   sudo chown -R $USER:$USER .
   ```

### Logs de Debug

```bash
# Habilitar logs detallados
LOG_LEVEL=DEBUG docker-compose up
```

## 📚 Recursos Adicionales

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

---

**¡Feliz surfing! 🏄‍♂️**