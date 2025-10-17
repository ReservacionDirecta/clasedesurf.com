# 🚂 Variables de Entorno para Railway - SurfSchool Platform

## 🔧 Backend Service Variables

### Variables Requeridas (OBLIGATORIAS)

```env
# Base de Datos PostgreSQL (Railway la proporciona automáticamente)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Seguridad JWT (Generar una clave segura)
JWT_SECRET=tu-clave-jwt-super-secreta-de-al-menos-32-caracteres

# URL del Frontend (Usar la URL de Railway del frontend)
FRONTEND_URL=https://clasedesurfcom-production.up.railway.app

# Entorno de Producción
NODE_ENV=production

# Puerto (Railway lo asigna automáticamente)
PORT=${{PORT}}
```

### Variables Opcionales (WhatsApp Integration)

```env
# Evolution API para WhatsApp (si tienes el servicio configurado)
EVOLUTION_API_URL=https://tu-evolution-api.com
EVOLUTION_API_KEY=tu-clave-evolution-api
EVOLUTION_INSTANCE_NAME=surfschool-prod
```

---

## 🎨 Frontend Service Variables

### Variables Requeridas (OBLIGATORIAS)

```env
# NextAuth.js Secret (Generar una clave segura)
NEXTAUTH_SECRET=tu-nextauth-secret-super-seguro-de-al-menos-32-caracteres

# URL del Frontend (Usar la URL de Railway del frontend)
NEXTAUTH_URL=https://clasedesurfcom-production.up.railway.app

# URL del Backend API (Usar la URL de Railway del backend)
NEXT_PUBLIC_BACKEND_URL=https://surfschool-backend-production.up.railway.app

# Entorno de Producción
NODE_ENV=production

# Puerto (Railway lo asigna automáticamente)
PORT=${{PORT}}
```

---

## 🔐 Generación de Secrets Seguros

### Para JWT_SECRET y NEXTAUTH_SECRET:

**Opción 1 - Comando Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Opción 2 - OpenSSL:**
```bash
openssl rand -hex 32
```

**Opción 3 - Online (usar con precaución):**
- https://generate-secret.vercel.app/32

---

## 📋 Checklist de Configuración Railway

### Backend Service Setup:
- [ ] Crear nuevo servicio en Railway
- [ ] Seleccionar "Deploy from Docker Image"
- [ ] Imagen: `chambadigital/surfschool-backend:latest`
- [ ] Agregar PostgreSQL database (Railway addon)
- [ ] Configurar variables de entorno del backend
- [ ] Verificar que el servicio inicie correctamente
- [ ] Probar endpoint: `https://tu-backend.up.railway.app/health`

### Frontend Service Setup:
- [ ] Crear nuevo servicio en Railway
- [ ] Seleccionar "Deploy from Docker Image"  
- [ ] Imagen: `chambadigital/surfschool-frontend:latest`
- [ ] Configurar variables de entorno del frontend
- [ ] Verificar que el servicio inicie correctamente
- [ ] Probar endpoint: `https://tu-frontend.up.railway.app/api/health`

---

## 🔗 URLs de Referencia

### Actuales (según tu configuración):
- **Backend**: `https://surfschool-backend-production.up.railway.app`
- **Frontend**: `https://clasedesurfcom-production.up.railway.app`

### Health Check Endpoints:
- **Backend Health**: `https://surfschool-backend-production.up.railway.app/health`
- **Frontend Health**: `https://clasedesurfcom-production.up.railway.app/api/health`

---

## ⚠️ Notas Importantes

1. **DATABASE_URL**: Railway la genera automáticamente cuando agregas PostgreSQL
2. **PORT**: Railway lo asigna automáticamente, usar `${{PORT}}`
3. **Secrets**: Nunca usar valores de desarrollo en producción
4. **CORS**: El FRONTEND_URL debe coincidir exactamente con NEXTAUTH_URL
5. **HTTPS**: Todas las URLs deben usar HTTPS en producción

---

## 🚀 Orden de Deployment Recomendado

1. **Primero**: Deploy Backend + PostgreSQL
2. **Segundo**: Verificar que backend funcione
3. **Tercero**: Deploy Frontend con URL del backend
4. **Cuarto**: Verificar que frontend se conecte al backend

---

## 🔍 Troubleshooting

### Si el Backend no inicia:
- Verificar DATABASE_URL está configurada
- Verificar JWT_SECRET tiene al menos 32 caracteres
- Revisar logs de Railway para errores de Prisma

### Si el Frontend no se conecta:
- Verificar NEXT_PUBLIC_BACKEND_URL apunta al backend correcto
- Verificar NEXTAUTH_URL coincide con la URL del frontend
- Verificar CORS en el backend permite el dominio del frontend

### Comandos de Debug:
```bash
# Ver logs del servicio
railway logs

# Conectar a la base de datos
railway connect

# Ver variables de entorno
railway variables
```