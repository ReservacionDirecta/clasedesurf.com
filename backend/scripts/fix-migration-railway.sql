-- Script SQL para resolver migración fallida en Railway
-- Ejecutar en: Railway Dashboard > PostgreSQL > Query

-- Paso 1: Verificar el estado actual de la migración
SELECT 
    migration_name,
    finished_at,
    applied_steps_count,
    logs
FROM "_prisma_migrations" 
WHERE migration_name = '20251201191207_add_avatar_field';

-- Paso 2: Verificar si la columna avatar ya existe
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'avatar';

-- Paso 3A: Si la columna NO existe, crearla
-- (Ejecutar solo si el Paso 2 no devuelve resultados)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar" TEXT;

-- Paso 3B: Marcar la migración como completada
-- (Ejecutar siempre)
UPDATE "_prisma_migrations" 
SET 
    finished_at = NOW(), 
    applied_steps_count = 1,
    logs = NULL
WHERE migration_name = '20251201191207_add_avatar_field';

-- Paso 4: Verificar que se resolvió
SELECT 
    migration_name,
    finished_at,
    applied_steps_count
FROM "_prisma_migrations" 
WHERE migration_name = '20251201191207_add_avatar_field';

-- Resultado esperado:
-- migration_name: 20251201191207_add_avatar_field
-- finished_at: [timestamp actual]
-- applied_steps_count: 1
