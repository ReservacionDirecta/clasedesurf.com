-- Script SQL para actualizar la base de datos de Railway con los últimos cambios
-- Este script agrega los campos: foundedYear, rating, totalReviews a la tabla schools
-- y crea la tabla school_reviews

-- ============================================
-- 1. Agregar campos a la tabla schools
-- ============================================

-- Agregar columna foundedYear (año de fundación)
ALTER TABLE "schools" 
ADD COLUMN IF NOT EXISTS "foundedYear" INTEGER;

-- Agregar columna rating (calificación promedio)
ALTER TABLE "schools" 
ADD COLUMN IF NOT EXISTS "rating" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Agregar columna totalReviews (total de reseñas)
ALTER TABLE "schools" 
ADD COLUMN IF NOT EXISTS "totalReviews" INTEGER NOT NULL DEFAULT 0;

-- ============================================
-- 2. Crear tabla school_reviews
-- ============================================

-- Crear la tabla de reseñas de escuelas si no existe
CREATE TABLE IF NOT EXISTS "school_reviews" (
    "id" SERIAL NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "studentName" VARCHAR(255) NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "school_reviews_pkey" PRIMARY KEY ("id")
);

-- Crear índice para mejorar las consultas por schoolId
CREATE INDEX IF NOT EXISTS "school_reviews_schoolId_idx" ON "school_reviews"("schoolId");

-- Agregar foreign key constraint
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
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================
-- 3. Verificar que los cambios se aplicaron
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
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'school_reviews'
ORDER BY ordinal_position;

-- Verificar foreign keys
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'school_reviews';

-- ============================================
-- 4. Mensaje de confirmación
-- ============================================

DO $$ 
BEGIN
    RAISE NOTICE '✅ Migración completada exitosamente';
    RAISE NOTICE '   - Columnas agregadas a schools: foundedYear, rating, totalReviews';
    RAISE NOTICE '   - Tabla school_reviews creada';
    RAISE NOTICE '   - Foreign key constraint agregada';
END $$;

