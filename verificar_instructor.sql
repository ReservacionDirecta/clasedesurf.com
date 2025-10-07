-- Script para verificar el instructor creado
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    u.role,
    u.password as password_hash,
    i.id as instructor_id,
    i.bio,
    i.yearsExperience,
    i.specialties,
    i.isActive,
    s.name as school_name
FROM users u
LEFT JOIN instructors i ON u.id = i.userId
LEFT JOIN schools s ON i.schoolId = s.id
WHERE u.email = 'gbarrera@clasedesurf.com';

-- También verificar todos los instructores
SELECT 
    u.name,
    u.email,
    u.role,
    i.isActive,
    s.name as school_name
FROM users u
JOIN instructors i ON u.id = i.userId
JOIN schools s ON i.schoolId = s.id
ORDER BY u.id DESC;