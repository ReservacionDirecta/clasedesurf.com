-- Script simplificado para crear instructor Gabriel Barrera

-- 1. Crear usuario instructor
INSERT INTO users (
    name, 
    email, 
    password, 
    role, 
    phone, 
    age, 
    weight, 
    height, 
    "canSwim", 
    "createdAt", 
    "updatedAt"
) VALUES (
    'Gabriel Barrera',
    'gbarrera@clasedesurf.com',
    '$2a$10$Hn9ZdT2xkjoAao7XX0DbE.HVBfaBChBEmKZzO87N3XHis2i9oITLy', -- password: instruc123
    'INSTRUCTOR',
    '+51 987 654 321',
    29,
    78.5,
    182.0,
    true,
    NOW(),
    NOW()
);

-- 2. Crear perfil de instructor
INSERT INTO instructors (
    "userId",
    "schoolId", 
    bio,
    "yearsExperience",
    specialties,
    certifications,
    rating,
    "totalReviews",
    "isActive",
    "createdAt",
    "updatedAt"
) 
SELECT 
    u.id,
    s.id,
    'Instructor profesional de surf con más de 8 años de experiencia. Especialista en enseñanza para principiantes y técnicas avanzadas. Apasionado por el océano y comprometido con la seguridad de sus estudiantes.',
    8,
    ARRAY[
        'Surf para principiantes',
        'Técnicas avanzadas', 
        'Longboard',
        'Seguridad en el agua',
        'Competición'
    ],
    ARRAY[
        'ISA Level 2 Instructor',
        'Primeros Auxilios Certificado',
        'RCP Avanzado',
        'Salvavidas Profesional'
    ],
    4.9,
    3,
    true,
    NOW(),
    NOW()
FROM users u, schools s 
WHERE u.email = 'gbarrera@clasedesurf.com' 
  AND s.name = 'Escuela de Surf Lima'
  AND NOT EXISTS (
    SELECT 1 FROM instructors i WHERE i."userId" = u.id
  );

-- 3. Verificar que se creó correctamente
SELECT 
    u.name as instructor_name,
    u.email,
    u.phone,
    i.bio,
    i."yearsExperience",
    i.rating,
    s.name as school_name
FROM users u
JOIN instructors i ON u.id = i."userId"
JOIN schools s ON i."schoolId" = s.id
WHERE u.email = 'gbarrera@clasedesurf.com';