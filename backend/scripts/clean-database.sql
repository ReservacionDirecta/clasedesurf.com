-- ============================================
-- Script SQL para limpiar todos los datos de la base de datos clasedesurf.com
-- ============================================
-- 
-- ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos
-- pero mantendrá la estructura de las tablas intacta.
-- 
-- USO: Ejecutar con cuidado, preferiblemente en un entorno de desarrollo o staging
-- ============================================

-- Deshabilitar temporalmente las verificaciones de foreign keys para evitar errores
SET session_replication_role = 'replica';

-- ============================================
-- ELIMINAR DATOS EN ORDEN (respetando foreign keys)
-- ============================================

-- 1. Eliminar pagos (depende de reservations)
TRUNCATE TABLE payments CASCADE;

-- 2. Eliminar reservas (depende de users y classes)
TRUNCATE TABLE reservations CASCADE;

-- 3. Eliminar reseñas de instructores (depende de instructors)
TRUNCATE TABLE instructor_reviews CASCADE;

-- 4. Eliminar instructores (depende de users y schools)
TRUNCATE TABLE instructors CASCADE;

-- 5. Eliminar estudiantes (depende de users y schools)
TRUNCATE TABLE students CASCADE;

-- 6. Eliminar clases (depende de schools y beaches)
TRUNCATE TABLE classes CASCADE;

-- 7. Eliminar tokens de refresco (depende de users)
TRUNCATE TABLE refresh_tokens CASCADE;

-- 8. Eliminar usuarios (tabla principal)
TRUNCATE TABLE users CASCADE;

-- 9. Eliminar escuelas (tabla principal)
TRUNCATE TABLE schools CASCADE;

-- 10. Eliminar playas (tabla principal)
TRUNCATE TABLE beaches CASCADE;

-- ============================================
-- REINICIAR SECUENCIAS DE AUTOINCREMENT
-- ============================================

-- Reiniciar los contadores de ID para que empiecen desde 1
ALTER SEQUENCE IF EXISTS payments_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS reservations_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS instructor_reviews_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS instructors_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS students_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS classes_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS refresh_tokens_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS schools_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS beaches_id_seq RESTART WITH 1;

-- Restaurar las verificaciones de foreign keys
SET session_replication_role = 'origin';

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Mostrar conteo de registros en cada tabla (debería ser 0)
SELECT 
    'payments' as tabla, COUNT(*) as registros FROM payments
UNION ALL
SELECT 
    'reservations', COUNT(*) FROM reservations
UNION ALL
SELECT 
    'instructor_reviews', COUNT(*) FROM instructor_reviews
UNION ALL
SELECT 
    'instructors', COUNT(*) FROM instructors
UNION ALL
SELECT 
    'students', COUNT(*) FROM students
UNION ALL
SELECT 
    'classes', COUNT(*) FROM classes
UNION ALL
SELECT 
    'refresh_tokens', COUNT(*) FROM refresh_tokens
UNION ALL
SELECT 
    'users', COUNT(*) FROM users
UNION ALL
SELECT 
    'schools', COUNT(*) FROM schools
UNION ALL
SELECT 
    'beaches', COUNT(*) FROM beaches;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
-- 
-- Todas las tablas han sido limpiadas pero la estructura se mantiene intacta.
-- Las secuencias de autoincrement han sido reiniciadas.
-- ============================================

