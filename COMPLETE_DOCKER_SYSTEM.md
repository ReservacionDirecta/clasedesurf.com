# 🚀 Sistema Docker Completo - Clasedesurf.com

## 📋 Índice

1. [🎯 Inicio Rápido](#-inicio-rápido)
2. [🔨 Scripts de Construcción](#-scripts-de-construcción)
3. [🧪 Scripts de Pruebas](#-scripts-de-pruebas)
4. [🚀 Scripts de Despliegue](#-scripts-de-despliegue)
5. [📊 Scripts de Monitoreo](#-scripts-de-monitoreo)
6. [💾 Scripts de Backup](#-scripts-de-backup)
7. [🔧 Scripts de Optimización](#-scripts-de-optimización)
8. [⚙️ CI/CD Automatizado](#️-cicd-automatizado)
9. [📚 Documentación](#-documentación)

---

## 🎯 Inicio Rápido

### 🚀 Script Principal: `quick-start.ps1`

**Un solo comando para configurar todo desde cero:**

```bash
./quick-start.ps1
```

**Opciones avanzadas:**
```bash
# Saltar verificación de prerrequisitos
./quick-start.ps1 -SkipPrerequisites

# Saltar pruebas locales
./quick-start.ps1 -SkipLocalTest

# Despliegue automático sin confirmaciones
./quick-start.ps1 -AutoDeploy
```

**¿Qué hace?**
1. ✅ Verifica prerrequisitos (Docker, Node.js, Railway CLI)
2. 📦 Instala dependencias del proyecto
3. 🐳 Construye imágenes Docker
4. 🧪 Prueba la aplicación localmente (opcional)
5. 🚂 Configura Railway CLI
6. 🚀 Despliega en Railway
7. 📋 Muestra próximos pasos

---

## 🔨 Scripts de Construcción

### 📦 `docker-build-local.ps1`

Construye imágenes Docker usando `docker build`.

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
./docker-build-local.ps1 -Push -Registry "miregistry"
```

**Características:**
- 🏗️ Multi-stage builds optimizados
- 🔒 Usuarios no-root para seguridad
- 📊 Información detallada de imágenes
- ⚡ Construcción paralela
- 🏷️ Tags personalizables

---

## 🧪 Scripts de Pruebas

### 🔍 `docker-test-local.ps1`

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

### 🚀 `docker-build-and-test.ps1`

Proceso completo automatizado: construcción + pruebas.

```bash
# Proceso completo
./docker-build-and-test.ps1

# Solo construir
./docker-build-and-test.ps1 -SkipTest

# Solo probar
./docker-build-and-test.ps1 -SkipBuild

# Usar Docker Compose
./docker-build-and-test.ps1 -UseCompose

# Limpiar todo
./docker-build-and-test.ps1 -Clean
```

---

## 🚀 Scripts de Despliegue

### 🚂 `deploy-railway.ps1`

Despliega en Railway con validación previa.

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

### ⚙️ `setup-railway-env.ps1`

Configura variables de entorno automáticamente.

```bash
./setup-railway-env.ps1 -BackendDomain "backend.railway.app" -FrontendDomain "frontend.railway.app" -DatabaseUrl "postgresql://..."
```

### ✅ `verify-railway-deployment.ps1`

Verifica que el despliegue funcione correctamente.

```bash
./verify-railway-deployment.ps1 -BackendUrl "https://backend.railway.app" -FrontendUrl "https://frontend.railway.app"
```

---

## 📊 Scripts de Monitoreo

### 📈 `monitor-railway.ps1`

Monitoreo continuo de servicios en Railway.

```bash
# Verificación única
./monitor-railway.ps1 -BackendUrl "https://backend.railway.app" -FrontendUrl "https://frontend.railway.app"

# Monitoreo continuo cada 5 minutos
./monitor-railway.ps1 -BackendUrl "https://backend.railway.app" -FrontendUrl "https://frontend.railway.app" -Continuous -IntervalSeconds 300

# Con alertas de Slack
./monitor-railway.ps1 -BackendUrl "https://backend.railway.app" -FrontendUrl "https://frontend.railway.app" -Continuous -SendAlerts -SlackWebhook "https://hooks.slack.com/..."
```

**Características:**
- 🔍 Health checks automáticos
- 📊 Estadísticas de uptime
- 🚨 Alertas configurables
- 📱 Integración con Slack
- ⏰ Monitoreo continuo

---

## 💾 Scripts de Backup

### 🗄️ `backup-railway-db.ps1`

Backup automático de la base de datos Railway.

```bash
# Backup básico
./backup-railway-db.ps1

# Backup comprimido
./backup-railway-db.ps1 -Compress

# Backup a S3
./backup-railway-db.ps1 -Compress -Upload -S3Bucket "mi-bucket"

# Backup programado con retención
./backup-railway-db.ps1 -Compress -Scheduled -RetentionDays 30
```

**Características:**
- 🗜️ Compresión automática
- ☁️ Subida a S3 opcional
- 🧹 Limpieza de backups antiguos
- 📊 Verificación de integridad
- 📝 Logging de operaciones

---

## 🔧 Scripts de Optimización

### ⚡ `optimize-docker.ps1`

Optimización y limpieza del sistema Docker.

```bash
# Limpieza completa
./optimize-docker.ps1 -CleanAll

# Limpiar solo contenedores
./optimize-docker.ps1 -PruneContainers

# Limpiar solo imágenes
./optimize-docker.ps1 -PruneImages

# Análisis de tamaño
./optimize-docker.ps1 -AnalyzeSize

# Optimizar imágenes específicas
./optimize-docker.ps1 -OptimizeImages
```

**Características:**
- 🧹 Limpieza automática de recursos
- 📊 Análisis de uso de espacio
- ⚡ Optimización de imágenes
- 💡 Recomendaciones de mejora
- 🔍 Análisis detallado de capas

---

## ⚙️ CI/CD Automatizado

### 🤖 GitHub Actions: `.github/workflows/deploy-railway.yml`

Pipeline completo de CI/CD automatizado.

**Triggers:**
- 📤 Push a `main` o `production`
- 🔄 Pull requests
- 🎯 Despliegue manual

**Jobs:**
1. **🔍 Build and Test**
   - Instalar dependencias
   - Lint y tests
   - Build de aplicaciones

2. **🐳 Build Docker Images**
   - Construir imágenes
   - Subir a GitHub Container Registry
   - Tagging automático

3. **🚀 Deploy to Railway**
   - Desplegar backend y frontend
   - Configurar variables de entorno
   - Verificar despliegue

4. **🗄️ Database Migrations**
   - Ejecutar migraciones Prisma
   - Seed de datos (opcional)

5. **📢 Notifications**
   - Notificar resultado
   - Integración con Slack (opcional)

**Configuración requerida:**
```bash
# Secrets de GitHub
RAILWAY_TOKEN=your_railway_token
SLACK_WEBHOOK=your_slack_webhook  # opcional
```

---

## 📚 Documentación

### 📖 Archivos de Documentación

| Archivo | Descripción |
|---------|-------------|
| `RAILWAY_DEPLOYMENT_GUIDE.md` | Guía completa de despliegue |
| `RAILWAY_ENV_VARIABLES.md` | Variables de entorno necesarias |
| `DOCKER_BUILD_GUIDE.md` | Guía de construcción Docker |
| `RAILWAY_DOCKER_SUMMARY.md` | Resumen de dockerización |
| `COMPLETE_DOCKER_SYSTEM.md` | Este documento |

### 🐳 Dockerfiles

| Archivo | Propósito |
|---------|-----------|
| `backend/Dockerfile.railway` | Backend optimizado para Railway |
| `frontend/Dockerfile.railway` | Frontend optimizado para Railway |
| `docker-compose.test.yml` | Pruebas locales completas |

### ⚙️ Configuración

| Archivo | Propósito |
|---------|-----------|
| `backend/railway.json` | Configuración Railway backend |
| `frontend/railway.json` | Configuración Railway frontend |
| `backend/.dockerignore.railway` | Exclusiones Docker backend |
| `frontend/.dockerignore.railway` | Exclusiones Docker frontend |

---

## 🎯 Flujos de Trabajo Recomendados

### 🚀 Para Nuevos Desarrolladores

```bash
# 1. Configuración inicial completa
./quick-start.ps1

# 2. Verificar despliegue
./verify-railway-deployment.ps1 -BackendUrl "https://tu-backend.railway.app" -FrontendUrl "https://tu-frontend.railway.app"
```

### 🔄 Para Desarrollo Continuo

```bash
# 1. Construir y probar localmente
./docker-build-and-test.ps1

# 2. Desplegar cambios
./deploy-railway.ps1 -BuildFirst -TestFirst

# 3. Monitorear aplicación
./monitor-railway.ps1 -BackendUrl "https://backend.railway.app" -FrontendUrl "https://frontend.railway.app" -Continuous
```

### 🛠️ Para Mantenimiento

```bash
# 1. Backup de base de datos
./backup-railway-db.ps1 -Compress

# 2. Optimizar Docker
./optimize-docker.ps1 -CleanAll

# 3. Verificar estado
./verify-railway-deployment.ps1 -BackendUrl "https://backend.railway.app" -FrontendUrl "https://frontend.railway.app"
```

---

## 🎉 Características del Sistema

### ✨ **Automatización Completa**
- 🚀 Configuración desde cero en un comando
- 🤖 CI/CD con GitHub Actions
- 📊 Monitoreo automático
- 💾 Backups programados

### 🔒 **Seguridad**
- 👤 Usuarios no-root en contenedores
- 🔐 Secretos seguros generados automáticamente
- 🛡️ Variables de entorno protegidas
- 🔍 Validación de integridad

### ⚡ **Rendimiento**
- 🏗️ Multi-stage builds optimizados
- 📦 Imágenes Alpine ligeras
- 🗜️ Compresión automática
- ⚡ Standalone Next.js

### 📊 **Monitoreo**
- 🔍 Health checks integrados
- 📈 Estadísticas de uptime
- 🚨 Alertas configurables
- 📱 Notificaciones Slack

### 🛠️ **Mantenimiento**
- 🧹 Limpieza automática
- 📊 Análisis de uso
- 💾 Backups automáticos
- 🔧 Optimización continua

---

## 🆘 Troubleshooting

### ❌ Problemas Comunes

1. **Docker no encontrado**
   ```bash
   # Instalar Docker Desktop
   # https://docs.docker.com/get-docker/
   ```

2. **Railway CLI no encontrado**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

3. **Error de permisos**
   ```bash
   # Ejecutar PowerShell como administrador
   Set-ExecutionPolicy RemoteSigned
   ```

4. **Imágenes muy grandes**
   ```bash
   ./optimize-docker.ps1 -AnalyzeSize
   ./optimize-docker.ps1 -CleanAll
   ```

### 🔍 **Debugging**

```bash
# Ver logs de construcción
docker build --progress=plain --no-cache -f backend/Dockerfile.railway backend/

# Ver logs de contenedor
docker logs clasedesurf-backend-test -f

# Verificar variables de entorno
railway variables

# Probar conexión a base de datos
railway run npx prisma db pull
```

---

## 🎯 Próximos Pasos

1. **🚀 Ejecutar configuración inicial**
   ```bash
   ./quick-start.ps1
   ```

2. **📊 Configurar monitoreo**
   ```bash
   ./monitor-railway.ps1 -Continuous
   ```

3. **💾 Programar backups**
   ```bash
   # Agregar a cron/task scheduler
   ./backup-railway-db.ps1 -Compress -Scheduled
   ```

4. **🤖 Configurar CI/CD**
   - Agregar `RAILWAY_TOKEN` a GitHub Secrets
   - Hacer push a rama `main`

---

## 🏄‍♂️ ¡Tu Marketplace de Surf está Listo!

Con este sistema completo tienes:
- ✅ Dockerización profesional
- ✅ Despliegue automatizado
- ✅ Monitoreo continuo
- ✅ Backups automáticos
- ✅ CI/CD completo
- ✅ Optimización automática

**¡Disfruta surfeando en la nube! 🌊🚀**