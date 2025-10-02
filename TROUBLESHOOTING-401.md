# Solución al Error 401 (Unauthorized)

## Diagnóstico Rápido

El error `POST http://localhost:3000/api/auth/callback/credentials 401 (Unauthorized)` indica que NextAuth no puede autenticar al usuario con el backend.

## Causas Comunes

### 1. Backend No Está Corriendo ❌

**Síntoma:** El frontend no puede conectarse al backend.

**Solución:**
```bash
cd backend
npm run dev
```

Verifica que veas: `Backend listening on port 4000`

### 2. Credenciales Incorrectas ❌

**Síntoma:** Usuario o contraseña incorrectos.

**Solución:** Usa las credenciales de prueba correctas:
```
Email: test@test.com
Password: password123
```

### 3. Base de Datos Sin Datos ❌

**Síntoma:** No hay usuarios en la base de datos.

**Solución:**
```bash
cd backend
npx prisma db seed
```

### 4. Variables de Entorno Incorrectas ❌

**Síntoma:** El frontend no puede encontrar el backend.

**Solución Backend (`backend/.env`):**
```env
DATABASE_URL="postgres://postgres:postgres@localhost:5432/clasedesurf.com"
JWT_SECRET="dev-secret-change-in-production"
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

**Solución Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXTAUTH_SECRET=dev-secret-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

### 5. Problema de CORS ❌

**Síntoma:** El navegador bloquea la petición por CORS.

**Solución:** Ya actualicé la configuración de CORS en `backend/src/server.ts`. Reinicia el backend:
```bash
cd backend
# Ctrl+C para detener
npm run dev
```

### 6. Puerto Incorrecto ❌

**Síntoma:** El frontend intenta conectarse al puerto equivocado.

**Verificación:**
- Backend debe estar en: `http://localhost:4000`
- Frontend debe estar en: `http://localhost:3000`
- `NEXT_PUBLIC_BACKEND_URL` debe ser: `http://localhost:4000`

## Pasos de Verificación

### Paso 1: Verificar Backend

```bash
curl http://localhost:4000
```

Deberías ver:
```json
{"message":"Backend API running"}
```

### Paso 2: Probar Login Directamente

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"password123\"}"
```

Deberías recibir:
```json
{
  "user": {
    "id": 5,
    "email": "test@test.com",
    "name": "Test User",
    "role": "STUDENT"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Paso 3: Verificar Usuarios en DB

```bash
cd backend
npx prisma studio
```

Abre http://localhost:5555 y verifica que existan usuarios en la tabla `users`.

### Paso 4: Verificar Logs del Backend

En la terminal donde corre el backend, deberías ver logs cuando intentas hacer login:
```
[auth] POST /login body -> { email: 'test@test.com', password: '***' }
```

Si no ves logs, el frontend no está llegando al backend.

### Paso 5: Verificar Logs del Frontend

Abre DevTools (F12) → Console y busca:
```
[nextauth] authorize -> POST http://localhost:4000/auth/login
```

Si ves un error de red, verifica que el backend esté corriendo.

## Solución Paso a Paso

### 1. Detener Todo

```bash
# Detén el backend (Ctrl+C)
# Detén el frontend (Ctrl+C)
```

### 2. Verificar Variables de Entorno

**Backend:**
```bash
cd backend
cat .env  # Linux/Mac
type .env  # Windows
```

Debe contener:
```env
DATABASE_URL="postgres://postgres:postgres@localhost:5432/clasedesurf.com"
JWT_SECRET="dev-secret-change-in-production"
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

**Frontend:**
```bash
cd frontend
cat .env.local  # Linux/Mac
type .env.local  # Windows
```

Debe contener:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXTAUTH_SECRET=dev-secret-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

### 3. Verificar Base de Datos

```bash
cd backend
npx prisma db seed
```

Deberías ver:
```
=== Test Users Created ===
Admin: admin@surfschool.com / password123
School Admin: schooladmin@surfschool.com / password123
Student 1: student1@surfschool.com / password123
Student 2: student2@surfschool.com / password123
Test User: test@test.com / password123
```

### 4. Iniciar Backend

```bash
cd backend
npm run dev
```

Espera a ver:
```
Backend listening on port 4000
```

### 5. Probar Backend

En otra terminal:
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"password123\"}"
```

Si esto funciona, el backend está OK.

### 6. Iniciar Frontend

```bash
cd frontend
npm run dev
```

Espera a ver:
```
- Local:        http://localhost:3000
```

### 7. Limpiar Caché del Navegador

1. Abre http://localhost:3000
2. Presiona F12 (DevTools)
3. Click derecho en el botón de recargar → "Empty Cache and Hard Reload"
4. O ve a Application → Clear storage → Clear site data

### 8. Intentar Login

1. Ve a http://localhost:3000/login
2. Ingresa:
   - Email: `test@test.com`
   - Password: `password123`
3. Click en "Iniciar Sesión"

## Si Aún No Funciona

### Revisar Logs Detallados

**Backend Terminal:**
Deberías ver algo como:
```
[auth] POST /login body -> { email: 'test@test.com', password: '***' }
```

**Frontend DevTools Console:**
Deberías ver:
```
[nextauth] authorize -> POST http://localhost:4000/auth/login
```

### Errores Específicos

**Error: "ECONNREFUSED"**
- El backend no está corriendo
- Verifica el puerto correcto

**Error: "Invalid credentials"**
- Contraseña incorrecta
- Ejecuta `npx prisma db seed` de nuevo

**Error: "CORS"**
- Reinicia el backend después de los cambios de CORS
- Verifica que `FRONTEND_URL` sea correcta

**Error: "Cannot find module"**
- Reinstala dependencias: `npm install`

## Contacto

Si después de seguir todos estos pasos aún tienes problemas, proporciona:

1. Logs del backend (terminal)
2. Logs del frontend (DevTools Console)
3. Contenido de las variables de entorno (sin contraseñas)
4. Resultado del comando: `curl http://localhost:4000`
