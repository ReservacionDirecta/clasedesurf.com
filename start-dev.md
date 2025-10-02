# Guía Rápida de Inicio

## Solución al Error 401 (Unauthorized)

El error 401 que estás viendo indica que hay un problema con la autenticación. Aquí están los pasos para solucionarlo:

### 1. Verificar que el Backend está Corriendo

Abre una terminal y ejecuta:

```bash
cd backend
npm run dev
```

Deberías ver:
```
Backend listening on port 4000
```

### 2. Verificar Variables de Entorno

**Backend (.env):**
```env
DATABASE_URL="postgres://postgres:postgres@localhost:5432/clasedesurf.com"
JWT_SECRET="dev-secret-change-in-production"
PORT=4000
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXTAUTH_SECRET=dev-secret-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

### 3. Probar el Backend Directamente

Abre otra terminal y prueba el endpoint de login:

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"password123\"}"
```

Deberías recibir una respuesta con un token y datos del usuario.

### 4. Verificar la Base de Datos

Asegúrate de que la base de datos tiene usuarios:

```bash
cd backend
npx prisma studio
```

Esto abrirá una interfaz web donde puedes ver los usuarios en la tabla `users`.

### 5. Reiniciar Ambos Servidores

A veces es necesario reiniciar ambos servidores después de cambiar configuraciones:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Limpiar Caché del Navegador

1. Abre las DevTools (F12)
2. Ve a la pestaña "Application" o "Almacenamiento"
3. Limpia:
   - Cookies
   - Local Storage
   - Session Storage
4. Recarga la página (Ctrl+Shift+R o Cmd+Shift+R)

### 7. Verificar CORS

El backend ahora está configurado para aceptar peticiones desde `http://localhost:3000` con credenciales.

Si estás usando un puerto diferente, actualiza la variable `FRONTEND_URL` en el backend.

## Pasos para Probar el Login

1. Abre http://localhost:3000
2. Haz clic en "Iniciar Sesión"
3. Usa estas credenciales:
   ```
   Email: test@test.com
   Password: password123
   ```
4. Deberías ser redirigido al dashboard

## Troubleshooting Adicional

### Error: "Cannot connect to database"

```bash
# Verificar que PostgreSQL está corriendo
# Windows:
services.msc
# Buscar "PostgreSQL" y verificar que está "Running"

# O reiniciar PostgreSQL
net stop postgresql-x64-14
net start postgresql-x64-14
```

### Error: "Table does not exist"

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### Error: "Port 4000 already in use"

```bash
# Windows - Encontrar y matar el proceso
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# O cambiar el puerto en backend/.env
PORT=4001
```

### Error: "Module not found"

```bash
# Reinstalar dependencias
cd backend
rm -rf node_modules
npm install

cd ../frontend
rm -rf node_modules
npm install
```

## Verificación Final

Una vez que todo esté corriendo, deberías poder:

1. ✅ Ver el backend respondiendo en http://localhost:4000
2. ✅ Ver el frontend en http://localhost:3000
3. ✅ Hacer login con test@test.com / password123
4. ✅ Ver el dashboard después del login

## Logs Útiles

### Backend
El backend mostrará logs de las peticiones:
```
[auth] POST /login body -> { email: 'test@test.com', password: '***' }
```

### Frontend
Abre las DevTools (F12) y ve a la pestaña "Console" para ver logs de NextAuth:
```
[nextauth] authorize -> POST http://localhost:4000/auth/login
```

Si ves errores, cópialos y revisa la configuración correspondiente.
