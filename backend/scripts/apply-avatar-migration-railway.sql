-- Script para aplicar la migración de avatar en Railway
-- Ejecuta este script en Railway Dashboard > Tu Base de Datos > Query

-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar" TEXT;

-- AlterTable
ALTER TABLE "instructors" ADD COLUMN IF NOT EXISTS "avatar" TEXT;

-- Verificación
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('users', 'instructors')
AND column_name = 'avatar'
ORDER BY table_name;

