-- Actualizar la contraseña de Gabriel con el hash correcto
UPDATE users 
SET password = '$2a$10$o6jSWghiNkRBNbo1AgAmouzcF23KReOXh3TldhsB62vk8ILTuQVF2',
    "updatedAt" = NOW()
WHERE email = 'gbarrera@clasedesurf.com';

-- Verificar que se actualizó
SELECT 
    name,
    email,
    role,
    password,
    "updatedAt"
FROM users 
WHERE email = 'gbarrera@clasedesurf.com';