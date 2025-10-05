# Despliegue en Railway

## 📋 Requisitos Previos

1. Cuenta en [Railway](https://railway.app)
2. Repositorio en GitHub: https://github.com/ReservacionDirecta/clasedesurf.com.git

## 🚀 Pasos para Desplegar

### 1. Crear Proyecto en Railway

1. Ve a [Railway Dashboard](https://railway.app/dashboard)
2. Click en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Conecta tu repositorio: `ReservacionDirecta/clasedesurf.com`

### 2. Configurar Base de Datos PostgreSQL

1. En tu proyecto de Railway, click en "New"
2. Selecciona "Database" → "PostgreSQL"
3. Railway creará automáticamente la base de datos

### 3. Configurar Variables de Entorno

En el servicio del backend, agrega las siguientes variables:

```env
# Database (Railway lo genera automáticamente)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Secret (genera uno seguro)
JWT_SECRET=tu-secret-key-super-seguro-aqui-cambiar

# Frontend URL (después de desplegar el frontend)
FRONTEND_URL=https://tu-frontend.vercel.app

# Port (Railway lo asigna automáticamente)
PORT=${{PORT}}
```

### 4. Configurar el Build

Railway debería detectar automáticamente la configuración gracias a los archivos:
- `railway.json`
- `nixpacks.toml`
- `Procfile`

Si necesitas configurar manualmente:

**Build Command:**
```bash
cd backend && npm ci && npx prisma generate && npm run build
```

**Start Command:**
```bash
cd backend && npm run start:prod
```

### 5. Desplegar Frontend en Vercel

El frontend Next.js se despliega mejor en Vercel:

1. Ve a [Vercel](https://vercel.com)
2. Importa el repositorio
3. Configura:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

4. Variables de entorno en Vercel:
```env
NEXT_PUBLIC_BACKEND_URL=https://tu-backend.railway.app
NEXTAUTH_URL=https://tu-frontend.vercel.app
NEXTAUTH_SECRET=otro-secret-key-diferente-aqui
```

### 6. Ejecutar Migraciones

Después del primer despliegue, las migraciones se ejecutan automáticamente con:
```bash
npx prisma migrate deploy
```

### 7. Seed de Datos (Opcional)

Para cargar datos de prueba, ejecuta en Railway CLI o en el dashboard:

```bash
cd backend && npm run seed
```

## 🔧 Estructura del Proyecto

```
clasedesurf.com/
├── backend/          # API Node.js + Express + Prisma
│   ├── src/
│   ├── prisma/
│   └── package.json
├── frontend/         # Next.js App
│   ├── src/
│   └── package.json
├── railway.json      # Configuración de Railway
├── nixpacks.toml     # Configuración de build
└── Procfile          # Comando de inicio
```

## 📝 Variables de Entorno Requeridas

### Backend (Railway)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de PostgreSQL | Auto-generada por Railway |
| `JWT_SECRET` | Secret para JWT | String aleatorio seguro |
| `FRONTEND_URL` | URL del frontend | https://app.vercel.app |
| `PORT` | Puerto del servidor | Auto-asignado por Railway |

### Frontend (Vercel)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_BACKEND_URL` | URL del backend | https://api.railway.app |
| `NEXTAUTH_URL` | URL del frontend | https://app.vercel.app |
| `NEXTAUTH_SECRET` | Secret para NextAuth | String aleatorio seguro |

## 🐛 Troubleshooting

### Error: "Cannot find module"
- Asegúrate de que `npm ci` se ejecute en el directorio correcto
- Verifica que `node_modules` no esté en `.gitignore`

### Error: "Prisma Client not generated"
- Ejecuta `npx prisma generate` en el build
- Verifica que `@prisma/client` esté en `dependencies`, no en `devDependencies`

### Error: "Database connection failed"
- Verifica que `DATABASE_URL` esté configurada correctamente
- Asegúrate de que la base de datos PostgreSQL esté activa

### Error: "Port already in use"
- Railway asigna el puerto automáticamente vía `$PORT`
- Asegúrate de usar `process.env.PORT` en el código

## 🔗 Enlaces Útiles

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

## 📞 Soporte

Si tienes problemas con el despliegue, revisa:
1. Los logs en Railway Dashboard
2. Las variables de entorno
3. La configuración de build en `railway.json`

## ✅ Checklist de Despliegue

- [ ] PostgreSQL creado en Railway
- [ ] Variables de entorno configuradas en Railway
- [ ] Backend desplegado en Railway
- [ ] Frontend desplegado en Vercel
- [ ] Variables de entorno configuradas en Vercel
- [ ] URLs actualizadas en ambos servicios
- [ ] Migraciones ejecutadas
- [ ] Seed de datos ejecutado (opcional)
- [ ] Prueba de login funcionando
- [ ] Prueba de API funcionando

¡Listo! Tu aplicación debería estar funcionando en producción. 🎉
