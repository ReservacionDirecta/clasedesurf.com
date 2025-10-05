-- Script para corregir el rol del usuario admin@clasedesurf.com
-- Este usuario actualmente tiene rol STUDENT pero debería ser ADMIN

-- Actualizar el rol del usuario admin@clasedesurf.com a ADMIN
UPDATE users 
SET role = 'ADMIN', 
    "updatedAt" = NOW()
WHERE email = 'admin@clasedesurf.com';

-- Verificar que el cambio se aplicó correctamente
SELECT 
    id, 
    name, 
    email, 
    role, 
    "createdAt", 
    "updatedAt"
FROM users 
WHERE email IN ('admin@clasedesurf.com', 'admin@surfschool.com')
ORDER BY email;

-- También podemos crear un usuario admin adicional si es necesario
INSERT INTO users (name, email, password, role, "canSwim", age, "createdAt", "updatedAt") 
VALUES (
  'Super Admin',
  'superadmin@clasedesurf.com',
  '$2a$10$cV5DEzGI9SpEYGz9YBvACOhLAhc3QNovGirhkBzpGge4Lg/7xgQAO',  -- password: admin123
  'ADMIN',
  true,
  30,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Mostrar todos los usuarios ADMIN
SELECT 
    id, 
    name, 
    email, 
    role,
    "createdAt"
FROM users 
WHERE role = 'ADMIN'
ORDER BY "createdAt";