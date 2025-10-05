# 🐳 Instrucciones Finales - Docker Hub

## ✅ Estado Actual

**Imágenes construidas exitosamente:**
- ✅ chambadigital/surfschool-frontend:latest
- ✅ chambadigital/surfschool-backend:latest

**Problema:** Los repositorios no existen en Docker Hub

## 🔧 Solución: Crear Repositorios en Docker Hub

### Paso 1: Acceder a Docker Hub
1. Ve a https://hub.docker.com
2. Inicia sesión con tu cuenta **chambadigital**

### Paso 2: Crear Repositorio Frontend
1. Haz clic en **"Create Repository"**
2. **Repository Name:** `surfschool-frontend`
3. **Visibility:** Public
4. **Description:** Surf School Booking Platform - Frontend (Next.js)
5. Haz clic en **"Create"**

### Paso 3: Crear Repositorio Backend
1. Haz clic en **"Create Repository"** nuevamente
2. **Repository Name:** `surfschool-backend`
3. **Visibility:** Public
4. **Description:** Surf School Booking Platform - Backend (Node.js)
5. Haz clic en **"Create"**

### Paso 4: Subir las Imágenes
Ejecuta estos comandos en PowerShell:

```powershell
# Subir frontend
docker push chambadigital/surfschool-frontend:latest

# Subir backend
docker push chambadigital/surfschool-backend:latest
```

## 🎉 Después de Subir

### URLs de tus Repositorios:
- **Frontend:** https://hub.docker.com/r/chambadigital/surfschool-frontend
- **Backend:** https://hub.docker.com/r/chambadigital/surfschool-backend

### Para Usar las Imágenes:
```bash
# Descargar imágenes
docker pull chambadigital/surfschool-frontend:latest
docker pull chambadigital/surfschool-backend:latest

# Usar con docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

## 📦 Archivos de Producción Creados

### docker-compose.prod.yml
Configuración completa para producción con:
- Frontend (chambadigital/surfschool-frontend:latest)
- Backend (chambadigital/surfschool-backend:latest)
- PostgreSQL
- Redis
- Nginx (opcional)

### .env.prod.example
Variables de entorno de ejemplo para producción.

## 🚀 Despliegue en Servidor

### 1. Copiar Archivos
```bash
# En tu servidor, crea una carpeta
mkdir surfschool-app
cd surfschool-app

# Copia estos archivos:
# - docker-compose.prod.yml
# - .env.prod.example (renombrar a .env.prod)
# - nginx/nginx.conf (si usas nginx)
```

### 2. Configurar Variables
```bash
# Copia el archivo de ejemplo
cp .env.prod.example .env.prod

# Edita con tus valores reales
nano .env.prod
```

### 3. Iniciar Aplicación
```bash
# Descargar imágenes e iniciar
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Ver estado
docker-compose -f docker-compose.prod.yml ps
```

## 🔒 Configuración de Producción

### Generar Secrets Seguros
```bash
# Para JWT_SECRET
openssl rand -base64 32

# Para NEXTAUTH_SECRET
openssl rand -base64 32
```

### Variables Importantes
```env
# Cambiar estos valores:
POSTGRES_PASSWORD=tu-password-muy-seguro
JWT_SECRET=tu-jwt-secret-de-32-caracteres
NEXTAUTH_SECRET=tu-nextauth-secret-de-32-caracteres

# URLs de tu dominio:
FRONTEND_URL=https://tu-dominio.com
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
NEXTAUTH_URL=https://tu-dominio.com
```

## 🌐 Despliegue en Cloud

### AWS ECS
```bash
# Crear task definition con tus imágenes
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

### Google Cloud Run
```bash
# Desplegar frontend
gcloud run deploy surfschool-frontend \
  --image chambaditigal/surfschool-frontend:latest \
  --platform managed

# Desplegar backend
gcloud run deploy surfschool-backend \
  --image chambaditigal/surfschool-backend:latest \
  --platform managed
```

### DigitalOcean App Platform
1. Conecta tu cuenta de Docker Hub
2. Crea nueva app
3. Selecciona las imágenes:
   - `chambadigital/surfschool-frontend:latest`
   - `chambadigital/surfschool-backend:latest`

## 📋 Checklist Final

- [ ] Repositorios creados en Docker Hub
- [ ] Imágenes subidas exitosamente
- [ ] docker-compose.prod.yml configurado
- [ ] Variables de entorno configuradas
- [ ] Secrets generados de forma segura
- [ ] Aplicación desplegada y funcionando

## 🔗 Enlaces Útiles

- **Docker Hub:** https://hub.docker.com/u/chambadigital
- **Documentación Docker:** https://docs.docker.com/
- **Docker Compose:** https://docs.docker.com/compose/

---

## ⚡ Comando Rápido

Una vez creados los repositorios en Docker Hub:

```powershell
# Subir ambas imágenes
docker push chambadigital/surfschool-frontend:latest; docker push chambadigital/surfschool-backend:latest
```

¡Tu aplicación Surf School estará disponible públicamente en Docker Hub! 🏄‍♂️