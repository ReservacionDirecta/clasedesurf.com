-- ============================================
-- Script para insertar un usuario Super Admin
-- ============================================
-- 
-- Credenciales:
--   Email: admin@clasedesurf.com
--   Password: password123
--   Name: Super Admin
--   Rol: ADMIN
-- 
-- IMPORTANTE: Cambiar la contraseña después del primer login en producción.
-- ============================================

-- Insertar Super Admin
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
    '$2a$10$.0E9cOKYsgz/7dcNLoih5eoHyx9hu5Y2gxF1TlUI2SNRJTWuHDHZm', -- password123
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
