-- Verificar si Gabriel Barrera existe en la base de datos
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.password IS NOT NULL as has_password,
    LENGTH(u.password) as password_length,
    u."createdAt"
FROM users u 
WHERE u.email = 'gbarrera@clasedesurf.com';

-- Verificar si tiene perfil de instructor
SELECT 
    i.id,
    i."userId",
    i."schoolId",
    i.bio,
    i."yearsExperience",
    i.rating,
    i."isActive",
    s.name as school_name
FROM instructors i
JOIN users u ON i."userId" = u.id
JOIN schools s ON i."schoolId" = s.id
WHERE u.email = 'gbarrera@clasedesurf.com';

-- Ver todos los usuarios para comparar
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.password IS NOT NULL as has_password
FROM users u 
ORDER BY u.id DESC
LIMIT 5;