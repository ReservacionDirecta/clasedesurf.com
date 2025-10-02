# Configuración de Base de Datos PostgreSQL

## Estado Actual

El backend está corriendo correctamente en el puerto 4000, pero necesita conectarse a una base de datos PostgreSQL.

## Error Actual

```
Authentication failed against database server at `localhost`
```

Esto significa que las credenciales en el archivo `.env` no son válidas o la base de datos no existe.

## Solución Paso a Paso

### Opción 1: Usar PostgreSQL Local (Recomendado para Desarrollo)

#### 1. Verificar que PostgreSQL esté instalado y corriendo

**Windows:**
```powershell
# Verificar si PostgreSQL está corriendo
Get-Service -Name postgresql*

# Si no está corriendo, iniciarlo
Start-Service postgresql-x64-14  # Ajusta el nombre según tu versión
```

**Linux/Mac:**
```bash
# Verificar estado
sudo systemctl status postgresql

# Iniciar si no está corriendo
sudo systemctl start postgresql
```

#### 2. Conectarse a PostgreSQL

**Windows (usando psql):**
```powershell
# Abrir psql como usuario postgres
psql -U postgres
```

**Linux/Mac:**
```bash
sudo -u postgres psql
```

#### 3. Crear la base de datos y usuario

Una vez dentro de psql, ejecuta:

```sql
-- Crear usuario (si no existe)
CREATE USER surfschool WITH PASSWORD 'surfschool123';

-- Crear base de datos
CREATE DATABASE "clasedesurf.com" OWNER surfschool;

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE "clasedesurf.com" TO surfschool;

-- Salir
\q
```

#### 4. Actualizar el archivo .env

Edita `backend/.env` con las credenciales correctas:

```env
DATABASE_URL="postgresql://surfschool:surfschool123@localhost:5432/clasedesurf.com"
JWT_SECRET="dev-secret-key-for-development-only"
PORT=4000
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
```

#### 5. Ejecutar migraciones

```bash
cd backend
npx prisma migrate dev
```

Cuando te pregunte por el nombre de la migración, puedes usar "init" o cualquier nombre descriptivo.

#### 6. Ejecutar seed para crear datos de prueba

```bash
npm run seed
```

Esto creará:
- 5 usuarios de prueba
- 2 escuelas
- 3 clases
- 2 reservas con pagos

### Opción 2: Usar PostgreSQL con tus credenciales existentes

Si ya tienes PostgreSQL configurado con otras credenciales:

#### 1. Identificar tus credenciales

Necesitas saber:
- Usuario de PostgreSQL (ejemplo: `postgres`, `admin`, etc.)
- Contraseña del usuario
- Puerto (por defecto: 5432)

#### 2. Crear solo la base de datos

```sql
-- Conectarse con tu usuario existente
psql -U tu_usuario

-- Crear la base de datos
CREATE DATABASE "clasedesurf.com";

-- Salir
\q
```

#### 3. Actualizar .env con tus credenciales

```env
DATABASE_URL="postgresql://tu_usuario:tu_password@localhost:5432/clasedesurf.com"
JWT_SECRET="dev-secret-key-for-development-only"
PORT=4000
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
```

#### 4. Ejecutar migraciones y seed

```bash
npx prisma migrate dev
npm run seed
```

### Opción 3: Usar Docker (Más Fácil)

Si tienes Docker instalado, puedes usar PostgreSQL en un contenedor:

#### 1. Crear archivo docker-compose.yml

Crea `backend/docker-compose.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14
    container_name: surfschool-db
    environment:
      POSTGRES_USER: surfschool
      POSTGRES_PASSWORD: surfschool123
      POSTGRES_DB: clasedesurf.com
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### 2. Iniciar PostgreSQL

```bash
cd backend
docker-compose up -d
```

#### 3. Actualizar .env

```env
DATABASE_URL="postgresql://surfschool:surfschool123@localhost:5432/clasedesurf.com"
JWT_SECRET="dev-secret-key-for-development-only"
PORT=4000
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
```

#### 4. Ejecutar migraciones y seed

```bash
npx prisma migrate dev
npm run seed
```

#### 5. Comandos útiles de Docker

```bash
# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Detener y eliminar datos
docker-compose down -v
```

## Verificar Conexión

Después de configurar, verifica que todo funcione:

### 1. Probar conexión con Prisma Studio

```bash
npx prisma studio
```

Esto debería abrir una interfaz web en `http://localhost:5555` mostrando tus tablas.

### 2. Verificar que el seed funcionó

```bash
# Deberías ver los usuarios creados
curl http://localhost:4000/users

# Deberías ver las clases creadas
curl http://localhost:4000/classes
```

### 3. Probar login

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

Deberías recibir un token JWT y datos del usuario.

## Troubleshooting Común

### Error: "role 'usuario' does not exist"

**Causa:** El usuario en DATABASE_URL no existe en PostgreSQL

**Solución:** Crear el usuario o usar uno existente (como `postgres`)

### Error: "database 'clasedesurf.com' does not exist"

**Causa:** La base de datos no ha sido creada

**Solución:** Crear la base de datos con `CREATE DATABASE`

### Error: "password authentication failed"

**Causa:** Contraseña incorrecta en DATABASE_URL

**Solución:** Verificar la contraseña del usuario PostgreSQL

### Error: "could not connect to server"

**Causa:** PostgreSQL no está corriendo

**Solución:** Iniciar el servicio PostgreSQL

### Error: "port 5432 already in use"

**Causa:** Otro proceso está usando el puerto

**Solución:** 
- Detener el otro proceso
- O cambiar el puerto en docker-compose.yml (ejemplo: "5433:5432")

## Credenciales Recomendadas para Desarrollo

Para facilitar el desarrollo, recomiendo usar:

```
Usuario: surfschool
Password: surfschool123
Database: clasedesurf.com
Port: 5432
```

Estas credenciales son:
- Fáciles de recordar
- Específicas para este proyecto
- Seguras para desarrollo local
- No interfieren con otros proyectos

## Próximos Pasos

Una vez que la base de datos esté configurada:

1. ✅ PostgreSQL corriendo
2. ✅ Base de datos creada
3. ✅ .env actualizado con credenciales correctas
4. ✅ Migraciones ejecutadas (`npx prisma migrate dev`)
5. ✅ Seed ejecutado (`npm run seed`)
6. ✅ Backend corriendo (`npm run dev`)
7. 🔄 Probar endpoints del API
8. 🔄 Iniciar frontend y probar login

## Recursos Adicionales

- [PostgreSQL Download](https://www.postgresql.org/download/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Prisma Database Setup](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgres)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)

## Ayuda Rápida

Si sigues teniendo problemas, aquí está la forma más rápida de empezar:

### Opción Rápida con Docker (5 minutos)

```bash
# 1. Crear docker-compose.yml (copiar contenido de arriba)
# 2. Iniciar PostgreSQL
docker-compose up -d

# 3. Actualizar .env
# DATABASE_URL="postgresql://surfschool:surfschool123@localhost:5432/clasedesurf.com"

# 4. Ejecutar migraciones
npx prisma migrate dev

# 5. Ejecutar seed
npm run seed

# 6. ¡Listo! Probar
curl http://localhost:4000/classes
```

### Opción Rápida con PostgreSQL Local (10 minutos)

```bash
# 1. Conectar a PostgreSQL
psql -U postgres

# 2. Ejecutar en psql:
CREATE USER surfschool WITH PASSWORD 'surfschool123';
CREATE DATABASE "clasedesurf.com" OWNER surfschool;
GRANT ALL PRIVILEGES ON DATABASE "clasedesurf.com" TO surfschool;
\q

# 3. Actualizar .env
# DATABASE_URL="postgresql://surfschool:surfschool123@localhost:5432/clasedesurf.com"

# 4. Ejecutar migraciones
npx prisma migrate dev

# 5. Ejecutar seed
npm run seed

# 6. ¡Listo! Probar
curl http://localhost:4000/classes
```
