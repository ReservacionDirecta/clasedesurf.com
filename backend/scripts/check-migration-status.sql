-- Script para verificar el estado de la migración fallida
-- Ejecuta esto primero para ver qué cambios faltan

-- ============================================
-- 1. Verificar columnas en schools
-- ============================================
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    CASE 
        WHEN column_name IN ('foundedYear', 'rating', 'totalReviews') THEN '✅ Existe'
        ELSE '❌ No existe'
    END as status
FROM information_schema.columns 
WHERE table_name = 'schools' 
AND column_name IN ('foundedYear', 'rating', 'totalReviews')
ORDER BY column_name;

-- Si no hay resultados, significa que las columnas no existen

-- ============================================
-- 2. Verificar tabla school_reviews
-- ============================================
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'school_reviews' THEN '✅ Tabla existe'
        ELSE '❌ Tabla no existe'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'school_reviews';

-- Si no hay resultados, significa que la tabla no existe

-- ============================================
-- 3. Verificar foreign key
-- ============================================
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table,
    CASE 
        WHEN conname = 'school_reviews_schoolId_fkey' THEN '✅ Foreign key existe'
        ELSE '❌ Foreign key no existe'
    END as status
FROM pg_constraint
WHERE conname = 'school_reviews_schoolId_fkey';

-- Si no hay resultados, significa que el foreign key no existe

-- ============================================
-- 4. Verificar migraciones en _prisma_migrations
-- ============================================
SELECT 
    migration_name,
    finished_at,
    applied_steps_count,
    CASE 
        WHEN finished_at IS NULL THEN '❌ Migración fallida o pendiente'
        ELSE '✅ Migración aplicada'
    END as status
FROM "_prisma_migrations"
WHERE migration_name LIKE '%add_school_rating_and_founded_year%'
ORDER BY started_at DESC;

