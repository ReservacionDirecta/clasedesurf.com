-- ============================================
-- Script SQL SEGURO para limpiar todos los datos
-- Usa DELETE en lugar de TRUNCATE (más seguro, más lento)
-- ============================================

BEGIN;

-- Eliminar datos en orden respetando foreign keys
DELETE FROM payments;
DELETE FROM reservations;
DELETE FROM instructor_reviews;
DELETE FROM instructors;
DELETE FROM students;
DELETE FROM classes;
DELETE FROM refresh_tokens;
DELETE FROM users;
DELETE FROM schools;
DELETE FROM beaches;

-- Reiniciar secuencias
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

COMMIT;

