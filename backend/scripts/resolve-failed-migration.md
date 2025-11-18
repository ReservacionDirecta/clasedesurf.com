# Resolver Migración Fallida: add_school_rating_and_founded_year

## Problema
La migración `20251118184826_add_school_rating_and_founded_year` falló y está bloqueando nuevas migraciones.

## Solución

### Opción 1: Marcar como aplicada (si los cambios ya están en la BD)

Si los cambios de la migración ya están aplicados en la base de datos, simplemente marca la migración como aplicada:

```bash
cd backend
npx prisma migrate resolve --applied 20251118184826_add_school_rating_and_founded_year
```

### Opción 2: Aplicar manualmente y luego marcar como aplicada

Si los cambios NO están aplicados, primero aplica los cambios manualmente y luego marca la migración como aplicada.

#### Paso 1: Verificar qué cambios faltan

Conéctate a la base de datos y verifica:

```sql
-- Verificar si las columnas existen en schools
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'schools' 
AND column_name IN ('foundedYear', 'rating', 'totalReviews');

-- Verificar si la tabla school_reviews existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'school_reviews';
```

#### Paso 2: Aplicar cambios manualmente (si faltan)

Si faltan los cambios, ejecuta este SQL:

```sql
-- Agregar columnas a schools (si no existen)
ALTER TABLE "schools" 
ADD COLUMN IF NOT EXISTS "foundedYear" INTEGER,
ADD COLUMN IF NOT EXISTS "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "totalReviews" INTEGER NOT NULL DEFAULT 0;

-- Crear tabla school_reviews (si no existe)
CREATE TABLE IF NOT EXISTS "school_reviews" (
    "id" SERIAL NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "studentName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "school_reviews_pkey" PRIMARY KEY ("id")
);

-- Agregar foreign key (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'school_reviews_schoolId_fkey'
    ) THEN
        ALTER TABLE "school_reviews" 
        ADD CONSTRAINT "school_reviews_schoolId_fkey" 
        FOREIGN KEY ("schoolId") 
        REFERENCES "schools"("id") 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE;
    END IF;
END $$;
```

#### Paso 3: Marcar migración como aplicada

Después de aplicar los cambios manualmente:

```bash
cd backend
npx prisma migrate resolve --applied 20251118184826_add_school_rating_and_founded_year
```

### Opción 3: Marcar como revertida (si quieres empezar de nuevo)

Si prefieres revertir la migración fallida y aplicar una nueva:

```bash
cd backend
npx prisma migrate resolve --rolled-back 20251118184826_add_school_rating_and_founded_year
```

Luego puedes crear una nueva migración:

```bash
npx prisma migrate dev --name add_school_rating_and_founded_year_v2
```

## Verificación

Después de resolver la migración, verifica que todo esté bien:

```bash
cd backend
npx prisma migrate status
```

Deberías ver que todas las migraciones están aplicadas y no hay migraciones fallidas.

## Nota sobre Railway

Si estás trabajando con Railway, puedes ejecutar estos comandos:

1. **Desde Railway CLI:**
```bash
railway run bash
cd backend
npx prisma migrate resolve --applied 20251118184826_add_school_rating_and_founded_year
```

2. **O desde el dashboard de Railway:**
   - Ve a tu servicio de base de datos
   - Abre la pestaña "Query" o "SQL Editor"
   - Ejecuta los comandos SQL necesarios
   - Luego ejecuta el comando `prisma migrate resolve` desde el servicio backend

