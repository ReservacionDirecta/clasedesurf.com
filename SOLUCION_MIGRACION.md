# Solución para Error de Migración P3009

## Problema

La migración `20251201191207_add_avatar_field` falló en la base de datos de producción y está bloqueando nuevas migraciones.

## Solución 1: Marcar la migración como resuelta (Recomendado)

Esta solución marca la migración como completada sin ejecutarla nuevamente.

### Paso 1: Conectarse a la base de datos de producción

Necesitas acceso a la base de datos de Railway. Puedes hacerlo de dos formas:

#### Opción A: Desde Railway Dashboard

1. Ve a https://railway.app/
2. Selecciona tu proyecto
3. Ve a la base de datos PostgreSQL
4. Haz clic en "Connect" o "Query"

#### Opción B: Desde terminal local

```bash
# Obtén la DATABASE_URL de Railway
# Ve a Railway > PostgreSQL > Variables > DATABASE_URL

# Conéctate usando psql
psql "postgresql://postgres:PASSWORD@HOST:PORT/railway"
```

### Paso 2: Verificar el estado de la migración

```sql
-- Ver todas las migraciones
SELECT * FROM "_prisma_migrations" ORDER BY finished_at DESC;

-- Ver específicamente la migración fallida
SELECT * FROM "_prisma_migrations"
WHERE migration_name = '20251201191207_add_avatar_field';
```

### Paso 3: Verificar si la columna ya existe

```sql
-- Verificar si la columna avatar existe en la tabla users
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'avatar';
```

### Paso 4A: Si la columna NO existe, ejecutar manualmente

```sql
-- Ejecutar la migración manualmente
ALTER TABLE "users" ADD COLUMN "avatar" TEXT;

-- Marcar la migración como completada
UPDATE "_prisma_migrations"
SET finished_at = NOW(),
    applied_steps_count = 1,
    logs = NULL
WHERE migration_name = '20251201191207_add_avatar_field';
```

### Paso 4B: Si la columna SÍ existe, solo marcar como completada

```sql
-- La columna ya existe, solo marcar la migración como completada
UPDATE "_prisma_migrations"
SET finished_at = NOW(),
    applied_steps_count = 1,
    logs = NULL
WHERE migration_name = '20251201191207_add_avatar_field';
```

## Solución 2: Resolver desde Prisma CLI

### Opción 1: Marcar como resuelta

```bash
cd backend
npx prisma migrate resolve --applied 20251201191207_add_avatar_field
```

### Opción 2: Marcar como rollback (si quieres revertir)

```bash
cd backend
npx prisma migrate resolve --rolled-back 20251201191207_add_avatar_field
```

## Solución 3: Reset completo (⚠️ PELIGROSO - Solo en desarrollo)

**NO USAR EN PRODUCCIÓN** - Esto borrará todos los datos:

```bash
cd backend
npx prisma migrate reset
```

## Verificación después de resolver

```bash
cd backend

# Ver el estado de las migraciones
npx prisma migrate status

# Si todo está bien, debería mostrar:
# "Database schema is up to date!"
```

## Para aplicar en Railway

### Método 1: Desde Railway CLI

```bash
# Instalar Railway CLI si no lo tienes
npm install -g @railway/cli

# Login
railway login

# Conectar al proyecto
railway link

# Ejecutar comando en el servicio backend
railway run npx prisma migrate resolve --applied 20251201191207_add_avatar_field
```

### Método 2: Agregar comando en Dockerfile

Edita `backend/Dockerfile.production` para incluir:

```dockerfile
# Antes de CMD
RUN npx prisma migrate resolve --applied 20251201191207_add_avatar_field || true
```

### Método 3: Script de inicio

Crea `backend/scripts/fix-migration.sh`:

```bash
#!/bin/bash
echo "Checking migration status..."
npx prisma migrate status

echo "Resolving failed migration..."
npx prisma migrate resolve --applied 20251201191207_add_avatar_field || true

echo "Deploying pending migrations..."
npx prisma migrate deploy

echo "Migration fix complete!"
```

Luego ejecuta en Railway:

```bash
railway run bash scripts/fix-migration.sh
```

## Prevención futura

### 1. Siempre probar migraciones en desarrollo primero

```bash
# En desarrollo
npx prisma migrate dev --name descriptive_name

# Verificar que funciona
npx prisma migrate status
```

### 2. Usar transacciones en migraciones complejas

```sql
BEGIN;
-- Tus cambios aquí
ALTER TABLE "users" ADD COLUMN "avatar" TEXT;
COMMIT;
```

### 3. Hacer backup antes de migrar en producción

```bash
# Desde Railway, hacer backup de la base de datos
# Dashboard > PostgreSQL > Backups > Create Backup
```

## Comando rápido para Railway

Si tienes acceso a la consola de Railway:

```bash
# Conectar a la base de datos
psql $DATABASE_URL

# Ejecutar
UPDATE "_prisma_migrations"
SET finished_at = NOW(), applied_steps_count = 1, logs = NULL
WHERE migration_name = '20251201191207_add_avatar_field';

# Salir
\q
```

## Siguiente paso después de resolver

Una vez resuelto el error de migración:

```bash
cd backend

# Verificar estado
npx prisma migrate status

# Desplegar migraciones pendientes
npx prisma migrate deploy

# Generar cliente Prisma
npx prisma generate
```

## Notas importantes

- ✅ La migración solo agrega una columna TEXT nullable, es segura
- ✅ No afecta datos existentes
- ✅ Puede ejecutarse manualmente sin problemas
- ⚠️ Asegúrate de tener backup antes de modificar producción
- ⚠️ No uses `migrate reset` en producción
