# 🐳 Surf School - Docker Deployment

## 📦 Imágenes Docker

Este proyecto está completamente dockerizado y disponible en Docker Hub:

- **Backend**: `chambadigital/surfschool-backend:latest`
- **Frontend**: `chambadigital/surfschool-frontend:latest`

## 🚀 Inicio Rápido

### Desplegar el Sistema Completo

```bash
# Clonar el repositorio (o solo descargar docker-compose.yml)
git clone https://github.com/tu-usuario/clasedesurf.com.git
cd clasedesurf.com

# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

El sistema estará disponible en:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **PostgreSQL**: localhost:5432

### Detener el Sistema

```bash
docker-compose down
```

## 🏗️ Construcción de Imágenes

### Para Desarrolladores

Si necesitas construir las imágenes localmente:

#### Windows
```powershell
.\docker-build.ps1
```

#### Linux/Mac
```bash
chmod +x docker-build-and-push.sh
./docker-build-and-push.sh
```

### Construcción Manual

```bash
# Backend
cd backend
docker build -t chambadigital/surfschool-backend:latest .
cd ..

# Frontend
cd frontend
docker build -t chambadigital/surfschool-frontend:latest .
cd ..
```

## 📋 Servicios Incluidos

### 1. PostgreSQL Database
- **Imagen**: `postgres:15-alpine`
- **Puerto**: 5432
- **Usuario**: postgres
- **Password**: postgres123
- **Base de datos**: surfschool

### 2. Backend API
- **Imagen**: `chambadigital/surfschool-backend:latest`
- **Puerto**: 4000
- **Tecnologías**: Node.js, Express, Prisma
- **Health Check**: http://localhost:4000/health

### 3. Frontend
- **Imagen**: `chambadigital/surfschool-frontend:latest`
- **Puerto**: 3000
- **Tecnología**: Next.js 14
- **SSR**: Habilitado

## ⚙️ Configuración

### Variables de Entorno

El archivo `docker-compose.yml` incluye las variables de entorno necesarias:

```yaml
# Backend
DATABASE_URL: postgresql://postgres:postgres123@postgres:5432/surfschool
JWT_SECRET: your-super-secret-jwt-key-here-change-in-production
NEXTAUTH_SECRET: your-nextauth-secret-here-change-in-production

# Frontend
NEXTAUTH_URL: http://localhost:3000
BACKEND_URL: http://backend:4000
```

**⚠️ IMPORTANTE**: Cambia los secretos en producción.

### Personalizar Configuración

Crea un archivo `.env` en la raíz del proyecto:

```env
# Database
POSTGRES_PASSWORD=tu-password-seguro

# Secrets
JWT_SECRET=tu-jwt-secret-minimo-32-caracteres
NEXTAUTH_SECRET=tu-nextauth-secret-minimo-32-caracteres

# URLs
NEXTAUTH_URL=https://tu-dominio.com
```

Luego modifica `docker-compose.yml` para usar el archivo `.env`.

## 🗄️ Base de Datos

### Inicializar con Datos de Prueba

El backend incluye un seed script con 2 escuelas completas para probar multi-tenancy:

```bash
# Ejecutar seed dentro del contenedor
docker-compose exec backend npx tsx prisma/seed-multitenancy.ts
```

Esto creará:
- 1 Admin Global
- 2 Escuelas (Lima Surf Academy y Barranco Surf School)
- 6 Instructores (3 por escuela)
- 8 Clases (4 por escuela)
- 6 Estudiantes
- 7 Reservas con pagos

### Credenciales de Prueba

Todas las contraseñas son: `password123`

**Admin Global:**
- Email: admin@surfschool.com

**Lima Surf Academy:**
- Admin: admin@limasurf.com
- Instructor: juan.perez@limasurf.com
- Head Coach: roberto.silva@limasurf.com

**Barranco Surf School:**
- Admin: admin@barrancosurf.com
- Instructor: diego.castro@barrancosurf.com
- Head Coach: fernando.paz@barrancosurf.com

### Backup y Restore

```bash
# Crear backup
docker-compose exec postgres pg_dump -U postgres surfschool > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U postgres surfschool < backup.sql
```

## 🔍 Monitoreo

### Ver Logs

```bash
# Todos los servicios
docker-compose logs -f

# Un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Últimas 100 líneas
docker-compose logs --tail=100
```

### Estado de Servicios

```bash
# Ver estado
docker-compose ps

# Ver recursos
docker stats
```

### Health Checks

```bash
# Backend
curl http://localhost:4000/health

# Verificar base de datos
docker-compose exec postgres pg_isready -U postgres
```

## 🛠️ Comandos Útiles

### Gestión de Contenedores

```bash
# Reiniciar un servicio
docker-compose restart backend

# Reconstruir un servicio
docker-compose up -d --build backend

# Ver logs en tiempo real
docker-compose logs -f --tail=50

# Ejecutar comando en contenedor
docker-compose exec backend sh
docker-compose exec frontend sh
```

### Actualizar Imágenes

```bash
# Descargar últimas imágenes
docker-compose pull

# Recrear contenedores
docker-compose up -d --force-recreate
```

### Limpieza

```bash
# Detener y eliminar contenedores
docker-compose down

# Eliminar también volúmenes (⚠️ elimina datos)
docker-compose down -v

# Limpiar imágenes no usadas
docker image prune -a

# Limpieza completa del sistema
docker system prune -a --volumes
```

## 🌐 Despliegue en Producción

### Requisitos

- Docker y Docker Compose instalados
- Dominio configurado
- Certificado SSL (recomendado)

### Pasos

1. **Clonar repositorio**
   ```bash
   git clone https://github.com/tu-usuario/clasedesurf.com.git
   cd clasedesurf.com
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   nano .env  # Editar con valores de producción
   ```

3. **Iniciar servicios**
   ```bash
   docker-compose up -d
   ```

4. **Configurar Nginx (opcional)**
   ```nginx
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
   ```

5. **Configurar SSL con Let's Encrypt**
   ```bash
   sudo certbot --nginx -d tu-dominio.com
   ```

## 📚 Documentación Adicional

- **Multi-Tenancy**: Ver `RESUMEN_FINAL_MULTI_TENANCY.md`
- **Datos de Prueba**: Ver `DATOS_PRUEBA_CREADOS.md`
- **Guía de Pruebas**: Ver `PRUEBAS_MULTI_TENANCY.md`
- **Deployment Completo**: Ver `DOCKER_HUB_DEPLOYMENT.md`

## 🐛 Troubleshooting

### Puerto ya en uso

```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :4000

# Linux/Mac
lsof -i :3000
lsof -i :4000

# Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"  # Usar puerto 3001 en host
```

### Backend no conecta a base de datos

```bash
# Verificar que postgres esté corriendo
docker-compose ps postgres

# Ver logs de postgres
docker-compose logs postgres

# Verificar conectividad
docker-compose exec backend ping postgres
```

### Frontend no conecta al backend

```bash
# Verificar variables de entorno
docker-compose exec frontend env | grep BACKEND

# Verificar conectividad
docker-compose exec frontend wget -O- http://backend:4000/health
```

## 📞 Soporte

Para problemas o preguntas:
- Crear un issue en GitHub
- Revisar la documentación en `/docs`
- Contactar al equipo de desarrollo

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

---

**Desarrollado por**: Chamba Digital  
**Última actualización**: Octubre 2025
