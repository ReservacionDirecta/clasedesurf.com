# 🚀 Docker Quick Start - Clase de Surf

Guía rápida para dockerizar y subir a Docker Hub en 5 minutos.

---

## ⚡ Inicio Rápido (5 minutos)

### 1. Preparar Entorno

```powershell
# Copiar archivo de configuración
cp .env.docker.example .env

# Editar .env y cambiar:
# - DOCKER_USERNAME=tu-usuario-dockerhub
# - JWT_SECRET=tu-secreto-seguro
# - NEXTAUTH_SECRET=tu-secreto-seguro
```

### 2. Construir y Subir a Docker Hub

**Opción A: Script Automático (Recomendado)**
```powershell
# Windows PowerShell
.\quick-deploy.ps1 -DockerUsername "tu-usuario" -Version "1.0.0"
```

**Opción B: Manual**
```powershell
# Windows PowerShell
.\docker-build-push-all.ps1 -Username "tu-usuario" -Version "1.0.0"

# Linux/Mac
chmod +x docker-build-push-all.sh
./docker-build-push-all.sh tu-usuario 1.0.0
```

### 3. Verificar en Docker Hub

Visita: https://hub.docker.com/u/tu-usuario

Deberías ver:
- `tu-usuario/clasedesurf-backend:1.0.0`
- `tu-usuario/clasedesurf-frontend:1.0.0`

### 4. Desplegar Localmente

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
```

---

## 📦 Archivos Creados

```
clasedesurf.com/
├── docker-compose.yml              # Orquestación de servicios
├── .env.docker.example             # Variables de entorno ejemplo
├── docker-build-push-all.ps1       # Script Windows para build/push
├── docker-build-push-all.sh        # Script Linux/Mac para build/push
├── quick-deploy.ps1                # Deploy automático
├── DOCKER_DEPLOYMENT.md            # Documentación completa
└── DOCKER_QUICK_START.md           # Esta guía
```

---

## 🐳 Imágenes Docker

### Backend
```
yerct/clasedesurf-backend:latest
yerct/clasedesurf-backend:1.0.0
```

**Características:**
- Node.js 18 Alpine
- Multi-stage build optimizado
- Prisma Client incluido
- Health checks configurados
- Usuario no-root por seguridad

### Frontend
```
yerct/clasedesurf-frontend:latest
yerct/clasedesurf-frontend:1.0.0
```

**Características:**
- Next.js 14 optimizado
- Standalone output
- Variables de entorno configurables
- Health checks configurados
- Usuario no-root por seguridad

---

## 🔧 Comandos Esenciales

### Construcción

```bash
# Solo construir (sin subir)
.\docker-build-push-all.ps1 -Username "tu-usuario" -BuildOnly

# Construir versión específica
.\docker-build-push-all.ps1 -Username "tu-usuario" -Version "1.0.0"
```

### Gestión

```bash
# Iniciar
docker-compose up -d

# Detener
docker-compose down

# Ver logs
docker-compose logs -f

# Ver estado
docker-compose ps

# Reiniciar un servicio
docker-compose restart backend
```

### Base de Datos

```bash
# Migraciones
docker-compose exec backend npx prisma migrate deploy

# Seed de datos
docker-compose exec backend npx prisma db seed

# Backup
docker-compose exec postgres pg_dump -U postgres clasedesurf.com > backup.sql
```

---

## 🌐 URLs de Acceso

| Servicio | URL Local | Puerto |
|----------|-----------|--------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:4000 | 4000 |
| PostgreSQL | localhost:5432 | 5432 |

---

## 👤 Credenciales de Prueba

### Estudiante
```
Email: student1.trujillo@test.com
Password: password123
```

### Instructor
```
Email: instructor1.trujillo@test.com
Password: password123
```

### Admin de Escuela
```
Email: admin.trujillo@test.com
Password: password123
```

---

## 🔐 Seguridad

### ⚠️ IMPORTANTE: Cambiar en Producción

```env
# Generar secretos seguros (32+ caracteres)
JWT_SECRET=cambiar-por-secreto-seguro-min-32-chars
JWT_REFRESH_SECRET=cambiar-por-secreto-seguro-min-32-chars
NEXTAUTH_SECRET=cambiar-por-secreto-seguro-min-32-chars
POSTGRES_PASSWORD=cambiar-por-password-seguro
```

### Generar Secretos

**PowerShell:**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

**Linux/Mac:**
```bash
openssl rand -base64 32
```

---

## 📊 Verificación

### Health Checks

```bash
# Backend
curl http://localhost:4000/health

# Frontend
curl http://localhost:3000/api/health

# PostgreSQL
docker-compose exec postgres pg_isready -U postgres
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
docker-compose logs --tail=100
```

---

## 🚢 Desplegar en Servidor

### 1. En tu máquina local

```bash
# Construir y subir imágenes
.\docker-build-push-all.ps1 -Username "tu-usuario" -Version "1.0.0"
```

### 2. En el servidor

```bash
# Clonar repositorio o copiar docker-compose.yml
git clone <tu-repo>
cd clasedesurf.com

# Crear .env con variables de producción
nano .env

# Pull de imágenes desde Docker Hub
docker-compose pull

# Iniciar servicios
docker-compose up -d

# Ejecutar migraciones
docker-compose exec backend npx prisma migrate deploy

# Verificar
docker-compose ps
docker-compose logs -f
```

---

## 🐛 Troubleshooting

### Problema: Error al construir

```bash
# Limpiar caché de Docker
docker builder prune -a

# Reconstruir sin caché
docker-compose build --no-cache
```

### Problema: Puerto en uso

```bash
# Cambiar puertos en .env
BACKEND_PORT=4001
FRONTEND_PORT=3001
```

### Problema: Error de base de datos

```bash
# Reiniciar PostgreSQL
docker-compose restart postgres

# Ver logs
docker-compose logs postgres

# Recrear volumen (¡CUIDADO! Borra datos)
docker-compose down -v
docker-compose up -d
```

---

## 📚 Documentación Completa

Para más detalles, ver:
- [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) - Guía completa
- [docker-compose.yml](./docker-compose.yml) - Configuración de servicios
- [.env.docker.example](./.env.docker.example) - Variables de entorno

---

## ✅ Checklist

- [ ] Docker Desktop instalado y corriendo
- [ ] Cuenta en Docker Hub creada
- [ ] Archivo .env configurado
- [ ] Secretos cambiados de valores por defecto
- [ ] Imágenes construidas exitosamente
- [ ] Imágenes subidas a Docker Hub
- [ ] Servicios iniciados con docker-compose
- [ ] Health checks pasando
- [ ] Aplicación accesible en navegador

---

## 🎯 Próximos Pasos

1. **Configurar dominio** - Apuntar DNS a tu servidor
2. **Configurar SSL** - Usar Let's Encrypt con Certbot
3. **Configurar Nginx** - Reverse proxy para frontend/backend
4. **Configurar backups** - Automatizar backups de PostgreSQL
5. **Configurar monitoreo** - Usar Prometheus/Grafana

---

¡Listo para producción! 🚀

**Soporte:**
- Documentación: [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
- Issues: GitHub Issues
- Docker Hub: https://hub.docker.com/u/tu-usuario
