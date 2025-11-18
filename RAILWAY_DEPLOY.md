# Guía de Despliegue en Railway

Esta guía explica cómo desplegar el backend y frontend en Railway usando Docker Hub.

## Prerequisitos

1. Cuenta en Railway: https://railway.app
2. Cuenta en Docker Hub: https://hub.docker.com
3. Imágenes Docker construidas y subidas a Docker Hub

## Configuración de Variables de Entorno en Railway

### Backend

Crea un nuevo servicio en Railway y configura las siguientes variables de entorno:

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://usuario:password@host:5432/database
JWT_SECRET=tu-secreto-jwt-super-seguro
FRONTEND_URL=https://tu-frontend-url.up.railway.app
SEED_ON_START=false
```

### Frontend

Crea otro servicio en Railway y configura las siguientes variables de entorno:

```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_BACKEND_URL=https://tu-backend-url.up.railway.app
NEXT_PUBLIC_API_URL=https://tu-backend-url.up.railway.app
NEXTAUTH_URL=https://tu-frontend-url.up.railway.app
NEXTAUTH_SECRET=tu-secreto-nextauth-super-seguro
```

## Construir y Subir Imágenes a Docker Hub

### 1. Configurar Docker Hub Username

En Windows (PowerShell):
```powershell
$env:DOCKER_USERNAME = "tu-usuario-dockerhub"
```

En Linux/Mac:
```bash
export DOCKER_USERNAME="tu-usuario-dockerhub"
```

### 2. Iniciar Sesión en Docker Hub

```bash
docker login
```

### 3. Construir y Subir Imágenes

**Windows (PowerShell):**
```powershell
# Construir y subir todo
.\docker-build.ps1 all -Push

# O solo backend
.\docker-build.ps1 backend -Push

# O solo frontend
.\docker-build.ps1 frontend -Push
```

**Linux/Mac:**
```bash
# Hacer el script ejecutable
chmod +x docker-build.sh

# Construir y subir todo
./docker-build.sh all push

# O solo backend
./docker-build.sh backend push

# O solo frontend
./docker-build.sh frontend push
```

## Desplegar en Railway

### Opción 1: Desde Docker Hub (Recomendado)

1. **Backend:**
   - Crea un nuevo servicio en Railway
   - Selecciona "Deploy from Docker Hub"
   - Ingresa: `tu-usuario/clasedesurf-backend:latest`
   - Configura las variables de entorno del backend
   - Railway detectará automáticamente el puerto desde la variable `PORT`

2. **Frontend:**
   - Crea otro servicio en Railway
   - Selecciona "Deploy from Docker Hub"
   - Ingresa: `tu-usuario/clasedesurf-frontend:latest`
   - Configura las variables de entorno del frontend
   - Asegúrate de que `NEXT_PUBLIC_BACKEND_URL` apunte a la URL del backend

### Opción 2: Desde GitHub (CI/CD)

1. Conecta tu repositorio de GitHub a Railway
2. Railway detectará automáticamente los Dockerfiles
3. Configura las variables de entorno en cada servicio
4. Railway construirá y desplegará automáticamente en cada push

## URLs de Railway

Después del despliegue, Railway te proporcionará URLs como:
- Backend: `https://tu-backend.up.railway.app`
- Frontend: `https://tu-frontend.up.railway.app`

**Importante:** Actualiza las variables de entorno en Railway con las URLs reales:
- En el backend: `FRONTEND_URL=https://tu-frontend.up.railway.app`
- En el frontend: `NEXT_PUBLIC_BACKEND_URL=https://tu-backend.up.railway.app`
- En el frontend: `NEXTAUTH_URL=https://tu-frontend.up.railway.app`

## Verificación

1. Verifica que el backend esté funcionando:
   ```bash
   curl https://tu-backend.up.railway.app/health
   ```

2. Verifica que el frontend esté funcionando:
   - Abre `https://tu-frontend.up.railway.app` en tu navegador
   - Deberías ver la aplicación funcionando

## Troubleshooting

### Backend no inicia
- Verifica que `DATABASE_URL` esté correctamente configurado
- Verifica que el puerto esté expuesto correctamente
- Revisa los logs en Railway

### Frontend no puede conectar con el backend
- Verifica que `NEXT_PUBLIC_BACKEND_URL` apunte a la URL correcta del backend
- Verifica que el backend esté funcionando y accesible
- Revisa la configuración de CORS en el backend

### Errores de autenticación
- Verifica que `NEXTAUTH_SECRET` esté configurado en el frontend
- Verifica que `NEXTAUTH_URL` apunte a la URL correcta del frontend
- Verifica que `JWT_SECRET` esté configurado en el backend








