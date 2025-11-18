# Migración de Base de Datos para Railway

Este script SQL actualiza la base de datos de Railway con los últimos cambios del schema de Prisma.

## Cambios incluidos

1. **Tabla `schools`**:
   - Agregar columna `foundedYear` (INTEGER, nullable) - Año de fundación de la escuela
   - Agregar columna `rating` (DOUBLE PRECISION, default 0) - Calificación promedio
   - Agregar columna `totalReviews` (INTEGER, default 0) - Total de reseñas

2. **Nueva tabla `school_reviews`**:
   - `id` (SERIAL, PRIMARY KEY)
   - `schoolId` (INTEGER, FOREIGN KEY a schools)
   - `studentName` (VARCHAR(255))
   - `rating` (INTEGER) - Calificación de 1 a 5 estrellas
   - `comment` (TEXT, nullable)
   - `createdAt` (TIMESTAMP)

## Cómo ejecutar

### Opción 1: Desde Railway Dashboard

1. Ve a tu proyecto en Railway
2. Abre la base de datos PostgreSQL
3. Ve a la pestaña "Query" o "SQL Editor"
4. Copia y pega el contenido de `update-railway-db.sql`
5. Ejecuta el script

### Opción 2: Desde la línea de comandos

```bash
# Conectarse a la base de datos de Railway
psql $DATABASE_URL < backend/scripts/update-railway-db.sql
```

O si tienes las credenciales:

```bash
psql -h <host> -U <user> -d <database> -f backend/scripts/update-railway-db.sql
```

### Opción 3: Usando Prisma Migrate (Recomendado)

Si tienes acceso a la base de datos de Railway desde tu entorno local:

```bash
cd backend
npx prisma migrate deploy
```

Esto aplicará todas las migraciones pendientes, incluyendo la de `foundedYear`, `rating`, `totalReviews` y `school_reviews`.

## Verificación

Después de ejecutar el script, puedes verificar que los cambios se aplicaron correctamente ejecutando:

```sql
-- Verificar columnas en schools
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'schools' 
AND column_name IN ('foundedYear', 'rating', 'totalReviews');

-- Verificar que la tabla school_reviews existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'school_reviews';

-- Verificar estructura de school_reviews
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'school_reviews'
ORDER BY ordinal_position;
```

## Notas importantes

- El script usa `IF NOT EXISTS` para evitar errores si las columnas/tablas ya existen
- Los valores por defecto son: `rating = 0` y `totalReviews = 0`
- La foreign key tiene `ON DELETE CASCADE` para eliminar reseñas cuando se elimina una escuela
- El script incluye verificaciones al final para confirmar que todo se aplicó correctamente

## Rollback (si es necesario)

Si necesitas revertir los cambios:

```sql
-- Eliminar tabla school_reviews
DROP TABLE IF EXISTS "school_reviews";

-- Eliminar columnas de schools
ALTER TABLE "schools" DROP COLUMN IF EXISTS "foundedYear";
ALTER TABLE "schools" DROP COLUMN IF EXISTS "rating";
ALTER TABLE "schools" DROP COLUMN IF EXISTS "totalReviews";
```

**⚠️ ADVERTENCIA**: El rollback eliminará todos los datos de reseñas y los valores de rating/foundedYear. Úsalo solo si es absolutamente necesario.

