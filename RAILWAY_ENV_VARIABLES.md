# Variables de Entorno para Railway

## Backend Service

### Base de Datos
```
DATABASE_URL=postgresql://postgres:password@host:port/database
```

### Servidor
```
PORT=4000
NODE_ENV=production
```

### JWT
```
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars
```

### CORS
```
FRONTEND_URL=https://your-frontend-domain.railway.app
```

### WhatsApp (Opcional)
```
WHATSAPP_ENABLED=false
WHATSAPP_SESSION_PATH=./whatsapp-session
```

## Frontend Service

### Backend URLs
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.railway.app
BACKEND_URL=https://your-backend-domain.railway.app
```

### NextAuth
```
NEXTAUTH_URL=https://your-frontend-domain.railway.app
NEXTAUTH_SECRET=your-nextauth-secret-change-in-production-min-32-chars
```

### Node
```
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## PostgreSQL Database Service

### Configuración de Base de Datos
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure-password-change-this
POSTGRES_DB=clasedesurf
```

## Pasos para Configurar

1. **Crear Proyecto en Railway**
   ```bash
   railway login
   railway init
   ```

2. **Agregar PostgreSQL**
   - En Railway Dashboard, agrega PostgreSQL addon
   - Copia la DATABASE_URL generada

3. **Desplegar Backend**
   ```bash
   cd backend
   railway up
   ```

4. **Desplegar Frontend**
   ```bash
   cd frontend
   railway up
   ```

5. **Configurar Variables**
   - Ve a Railway Dashboard
   - Configura todas las variables listadas arriba
   - Actualiza las URLs con los dominios generados por Railway

6. **Ejecutar Migraciones**
   ```bash
   railway run npx prisma migrate deploy
   railway run npx prisma db seed
   ```

## Comandos Útiles

### Ver logs
```bash
railway logs
```

### Conectar a base de datos
```bash
railway connect
```

### Ejecutar comandos en producción
```bash
railway run [comando]
```

### Ver variables de entorno
```bash
railway variables
```

## Dominios

Railway generará dominios automáticamente:
- Backend: `https://[service-name]-production.up.railway.app`
- Frontend: `https://[service-name]-production.up.railway.app`

Asegúrate de actualizar las variables de entorno con estos dominios.