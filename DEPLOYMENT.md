# 🏄‍♂️ Surf School Booking Platform - Deployment Guide

## 🐳 Docker Images Available

Las siguientes imágenes están disponibles en Docker Hub:

- **Frontend**: `chambadigital/surfschool-frontend:latest`
- **Backend**: `chambadigital/surfschool-backend:latest`

## 🚀 Quick Start with Docker Compose

### 1. Descargar los archivos necesarios

```bash
# Descargar docker-compose.yml
curl -O https://raw.githubusercontent.com/your-repo/surfschool/main/docker-compose.yml

# Descargar script de prueba (opcional)
curl -O https://raw.githubusercontent.com/your-repo/surfschool/main/test-deployment.sh
chmod +x test-deployment.sh
```

### 2. Ejecutar el stack completo

```bash
# Opción 1: Inicio simple
docker-compose up -d

# Opción 2: Con script de prueba
./test-deployment.sh

# Opción 3: Windows
test-deployment.bat
```

### 3. Verificar el despliegue

```bash
# Ver estado de servicios
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Probar endpoints
curl http://localhost:4000/health
curl http://localhost:3000
```

### 4. Acceder a la aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Database**: localhost:5432

## 🔧 Manual Deployment

### Ejecutar solo el Backend

```bash
docker run -d \
  --name surfschool-backend \
  -p 4000:4000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/surfschool" \
  -e JWT_SECRET="your-jwt-secret" \
  -e NEXTAUTH_SECRET="your-nextauth-secret" \
  chambadigital/surfschool-backend:latest
```

### Ejecutar solo el Frontend

```bash
docker run -d \
  --name surfschool-frontend \
  -p 3000:3000 \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e NEXTAUTH_SECRET="your-nextauth-secret" \
  -e BACKEND_URL="http://backend:4000" \
  chambadigital/surfschool-frontend:latest
```

## 🗄️ Database Setup

### Inicializar la base de datos

Una vez que el backend esté ejecutándose, la base de datos se inicializará automáticamente con:

- Esquema de tablas (Prisma migrations)
- Datos de prueba (seeders)

### Usuarios de prueba disponibles:

1. **Administrador**
   - Email: admin@surfschool.com
   - Password: admin123

2. **Escuela**
   - Email: school@surfschool.com
   - Password: school123

3. **Instructor**
   - Email: instructor@surfschool.com
   - Password: instructor123

4. **Estudiante**
   - Email: student@surfschool.com
   - Password: student123

## 🌐 Production Deployment

### Variables de entorno importantes:

```env
# Backend
DATABASE_URL=postgresql://user:password@host:5432/surfschool
JWT_SECRET=your-super-secure-jwt-secret-here
NEXTAUTH_SECRET=your-super-secure-nextauth-secret-here
NODE_ENV=production

# Frontend
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secure-nextauth-secret-here
BACKEND_URL=https://api.your-domain.com
NODE_ENV=production
```

### Recomendaciones de seguridad:

1. **Cambiar todas las contraseñas por defecto**
2. **Usar secretos seguros para JWT y NextAuth**
3. **Configurar HTTPS en producción**
4. **Usar una base de datos externa segura**
5. **Configurar backups automáticos**

## 📊 Monitoring y Logs

### Ver logs del contenedor:

```bash
# Backend logs
docker logs -f surfschool-backend

# Frontend logs
docker logs -f surfschool-frontend

# Database logs
docker logs -f surfschool-postgres
```

### Health checks:

- Backend: `GET http://localhost:4000/health`
- Frontend: `GET http://localhost:3000` (debe devolver la página principal)

## 🔄 Updates

### Actualizar a la última versión:

```bash
docker-compose pull
docker-compose up -d
```

## 🆘 Troubleshooting

### Problemas comunes:

1. **Puerto ya en uso**: Cambiar los puertos en docker-compose.yml
2. **Base de datos no conecta**: Verificar DATABASE_URL
3. **Frontend no carga**: Verificar que BACKEND_URL apunte al backend correcto

### Reiniciar servicios:

```bash
docker-compose restart
```

### Limpiar y reiniciar:

```bash
docker-compose down -v
docker-compose up -d
```

## 📞 Support

Para soporte técnico o reportar issues, contactar a: support@chambadigital.com