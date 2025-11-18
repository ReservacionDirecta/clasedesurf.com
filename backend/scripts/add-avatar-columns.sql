-- Script para agregar las columnas avatar a users e instructors
-- Ejecuta este script en Railway Dashboard si la migración no se puede aplicar

-- ============================================
-- 1. Agregar columna avatar a users
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'avatar'
    ) THEN
        ALTER TABLE "users" ADD COLUMN "avatar" TEXT;
        RAISE NOTICE 'Columna avatar agregada a users';
    ELSE
        RAISE NOTICE 'Columna avatar ya existe en users';
    END IF;
END $$;

-- ============================================
-- 2. Agregar columna avatar a instructors
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'instructors' 
        AND column_name = 'avatar'
    ) THEN
        ALTER TABLE "instructors" ADD COLUMN "avatar" TEXT;
        RAISE NOTICE 'Columna avatar agregada a instructors';
    ELSE
        RAISE NOTICE 'Columna avatar ya existe en instructors';
    END IF;
END $$;

-- ============================================
-- 3. Verificación
-- ============================================
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('users', 'instructors')
AND column_name = 'avatar'
ORDER BY table_name, column_name;

