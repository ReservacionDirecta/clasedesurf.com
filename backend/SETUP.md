# Setup Guide - Backend

## Requisitos Previos

- Node.js 18+ instalado
- PostgreSQL instalado y corriendo
- npm o yarn

## Configuración Inicial

### 1. Instalar Dependencias

```bash
cd backend
npm install
```

### 2. Configurar Base de Datos

Crea una base de datos PostgreSQL:

```sql
CREATE DATABASE "clasedesurf.com";
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/clasedesurf.com"
JWT_SECRET="tu-secreto-jwt-super-seguro-cambiar-en-produccion"
PORT=4000
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"

# Optional: Skip rate limiting in development (set to 'true' to disable)
# SKIP_RATE_LIMIT="true"
```

**Importante:** Reemplaza `usuario` y `password` con tus credenciales de PostgreSQL.

### 4. Ejecutar Migraciones

Aplica las migraciones de Prisma para crear las tablas:

```bash
npx prisma migrate dev
```

Este comando:
- Crea las tablas en la base de datos
- Genera el cliente de Prisma
- Te pedirá un nombre para la migración (puedes usar "init" o cualquier nombre descriptivo)

### 5. Poblar Base de Datos con Datos de Prueba

Ejecuta el seed para crear usuarios y datos de prueba:

```bash
npm run seed
```

Este comando creará:
- 5 usuarios de prueba (admin, school admin, 3 estudiantes)
- 2 escuelas de surf
- 3 clases programadas
- 2 reservas de ejemplo
- 2 pagos de ejemplo

### 6. Iniciar el Servidor

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:4000`

## Verificar Instalación

### Probar el API

```bash
# Health check
curl http://localhost:4000/

# Listar clases
curl http://localhost:4000/classes

# Login de prueba
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

### Explorar Base de Datos

Abre Prisma Studio para ver los datos:

```bash
npx prisma studio
```

Esto abrirá una interfaz web en `http://localhost:5555`

## Credenciales de Prueba

Después de ejecutar el seed, puedes usar estas credenciales:

### 👨‍💼 Administrador del Sistema
```
Email: admin@surfschool.com
Password: password123
```

### 🏫 Administrador de Escuela
```
Email: schooladmin@surfschool.com
Password: password123
```

### 🏄 Estudiantes
```
Email: student1@surfschool.com (Alice - tiene reserva confirmada)
Email: student2@surfschool.com (Bob - tiene reserva pendiente)
Email: test@test.com (Usuario limpio para testing)
Password: password123 (para todos)
```

## Comandos Útiles

### Desarrollo
```bash
npm run dev              # Inicia servidor en modo desarrollo
npm run build            # Compila TypeScript
npm start                # Inicia servidor compilado
```

### Prisma
```bash
npx prisma generate      # Regenera cliente Prisma
npx prisma migrate dev   # Crea y aplica nueva migración
npx prisma migrate reset # Resetea DB y ejecuta seed
npx prisma studio        # Abre interfaz visual de DB
npm run seed             # Ejecuta seed manualmente
```

### Testing
```bash
# Probar rate limiting (debe bloquear después de 5 intentos)
for i in {1..6}; do
  curl -X POST http://localhost:4000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

## Troubleshooting

### Error: "Authentication failed against database"

**Causa:** Credenciales incorrectas en DATABASE_URL

**Solución:**
1. Verifica que PostgreSQL esté corriendo
2. Verifica usuario y contraseña en `.env`
3. Verifica que la base de datos exista

```bash
# En PostgreSQL
psql -U postgres
\l  # Lista bases de datos
```

### Error: "Table does not exist"

**Causa:** Migraciones no aplicadas

**Solución:**
```bash
npx prisma migrate dev
```

### Error: "Cannot find module '@prisma/client'"

**Causa:** Cliente Prisma no generado

**Solución:**
```bash
npx prisma generate
```

### Error: "Port 4000 already in use"

**Causa:** Otro proceso usando el puerto

**Solución:**
1. Cambia el puerto en `.env`: `PORT=4001`
2. O mata el proceso:
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4000 | xargs kill -9
```

### Resetear Todo

Si algo sale mal y quieres empezar de cero:

```bash
# Elimina y recrea todo
npx prisma migrate reset

# Esto hará:
# 1. Eliminar la base de datos
# 2. Crear nueva base de datos
# 3. Aplicar todas las migraciones
# 4. Ejecutar el seed automáticamente
```

## Estructura del Proyecto

```
backend/
├── prisma/
│   ├── migrations/      # Migraciones de base de datos
│   ├── schema.prisma    # Esquema de base de datos
│   └── seed.ts          # Script de seed
├── src/
│   ├── middleware/      # Middleware (auth, validation, rate limiting)
│   ├── routes/          # Rutas del API
│   ├── validations/     # Esquemas de validación Zod
│   ├── prisma.ts        # Cliente Prisma
│   └── server.ts        # Punto de entrada
├── .env                 # Variables de entorno (crear)
├── package.json
└── tsconfig.json
```

## Próximos Pasos

1. ✅ Configurar base de datos
2. ✅ Ejecutar migraciones
3. ✅ Ejecutar seed
4. ✅ Iniciar servidor backend
5. 🔄 Configurar y iniciar frontend (ver `../frontend/README.md`)
6. 🔄 Probar login con usuarios de prueba
7. 🔄 Explorar funcionalidades

## Documentación Adicional

- [TESTING.md](./TESTING.md) - Guía completa de testing y usuarios de prueba
- [SECURITY.md](./SECURITY.md) - Configuración de seguridad
- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js Docs](https://expressjs.com/)

## Soporte

Si encuentras problemas:
1. Revisa los logs del servidor
2. Verifica que PostgreSQL esté corriendo
3. Verifica las variables de entorno
4. Consulta la sección de Troubleshooting
