-- ============================================
-- Script para insertar un usuario Super Admin
-- ============================================
-- 
-- Este script inserta un usuario con rol ADMIN en la base de datos.
-- La contraseña por defecto es: password123
-- 
-- IMPORTANTE: Cambiar la contraseña después del primer login en producción.
-- ============================================

-- Insertar Super Admin
-- Email: admin@clasedesurf.com
-- Password: password123 (hash bcrypt)
-- Rol: ADMIN

INSERT INTO users (
    email,
    name,
    password,
    role,
    "createdAt",
    "updatedAt"
)
VALUES (
    'admin@clasedesurf.com',
    'Super Admin',
    '$2a$10$4CeLLoyNUqZSiWcE5aJ8.OdrxQzgJ.fZQt3UdRr2/XjFhL32rlSzS', -- password123
    'ADMIN',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE
SET
    name = EXCLUDED.name,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    "updatedAt" = NOW();

-- Verificar que se insertó correctamente
SELECT 
    id,
    email,
    name,
    role,
    "createdAt"
FROM users
WHERE email = 'admin@clasedesurf.com';

