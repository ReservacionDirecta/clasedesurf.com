-- Script para resolver la migración fallida: 20251118184826_add_school_rating_and_founded_year
-- Ejecuta este script en la base de datos de Railway si los cambios no están aplicados

-- ============================================
-- 1. Agregar columnas a la tabla schools
-- ============================================

-- Agregar columna foundedYear (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'schools' 
        AND column_name = 'foundedYear'
    ) THEN
        ALTER TABLE "schools" ADD COLUMN "foundedYear" INTEGER;
    END IF;
END $$;

-- Agregar columna rating (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'schools' 
        AND column_name = 'rating'
    ) THEN
        ALTER TABLE "schools" ADD COLUMN "rating" DOUBLE PRECISION NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Agregar columna totalReviews (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'schools' 
        AND column_name = 'totalReviews'
    ) THEN
        ALTER TABLE "schools" ADD COLUMN "totalReviews" INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- ============================================
-- 2. Crear tabla school_reviews
-- ============================================

CREATE TABLE IF NOT EXISTS "school_reviews" (
    "id" SERIAL NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "studentName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "school_reviews_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- 3. Agregar foreign key constraint
-- ============================================

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

-- ============================================
-- 4. Verificación
-- ============================================

-- Verificar columnas en schools
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'schools' 
AND column_name IN ('foundedYear', 'rating', 'totalReviews')
ORDER BY column_name;

-- Verificar que la tabla school_reviews existe
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'school_reviews') as column_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'school_reviews';

-- Verificar foreign key
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table
FROM pg_constraint
WHERE conname = 'school_reviews_schoolId_fkey';

