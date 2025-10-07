-- Script para crear un perfil completo de instructor
-- Incluye usuario + perfil de instructor con datos realistas

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
    'Instructor profesional de surf con más de 8 años de experiencia. Especialista en enseñanza para principiantes y técnicas avanzadas. Apasionado por el océano y comprometido con la seguridad de sus estudiantes. Ha entrenado a más de 500 estudiantes y participado en competencias nacionales.',
    8,
    ARRAY[
        'Surf para principiantes',
        'Técnicas avanzadas', 
        'Longboard',
        'Shortboard',
        'Seguridad en el agua',
        'Lectura de olas',
        'Competición'
    ],
    ARRAY[
        'ISA Level 2 Instructor',
        'Primeros Auxilios Certificado',
        'RCP Avanzado',
        'Salvavidas Profesional',
        'Instructor de Natación',
        'Surf Coach Certificado'
    ],
    4.9,
    47,
    true,
    NOW(),
    NOW()
FROM users u, schools s 
WHERE u.email = 'gbarrera@clasedesurf.com' 
  AND s.name = 'Escuela de Surf Lima'
  AND NOT EXISTS (
    SELECT 1 FROM instructors i WHERE i."userId" = u.id
  );

-- 3. Crear algunas reseñas para el instructor
INSERT INTO instructor_reviews (
    "instructorId",
    "studentName",
    rating,
    comment,
    "createdAt",
    "updatedAt"
)
SELECT 
    i.id,
    'María González',
    5,
    'Excelente instructor! Gabriel me enseñó desde cero y ahora puedo surfear olas intermedias. Muy paciente y profesional.',
    NOW() - INTERVAL '15 days'
FROM instructors i
JOIN users u ON i."userId" = u.id
WHERE u.email = 'gbarrera@clasedesurf.com';

INSERT INTO instructor_reviews (
    "instructorId",
    "studentName", 
    rating,
    comment,
    "createdAt"
)
SELECT 
    i.id,
    'Carlos Mendoza',
    5,
    'Gabriel es increíble! Me ayudó a mejorar mi técnica de bottom turn. Definitivamente recomendado para surfistas de todos los niveles.',
    NOW() - INTERVAL '8 days'
FROM instructors i
JOIN users u ON i."userId" = u.id
WHERE u.email = 'gbarrera@clasedesurf.com';

INSERT INTO instructor_reviews (
    "instructorId",
    "studentName",
    rating,
    comment, 
    "createdAt"
)
SELECT 
    i.id,
    'Ana Rodríguez',
    4,
    'Muy buen instructor, conoce mucho sobre seguridad en el agua. Solo le faltó un poco más de paciencia con los principiantes.',
    NOW() - INTERVAL '3 days'
FROM instructors i
JOIN users u ON i."userId" = u.id
WHERE u.email = 'gbarrera@clasedesurf.com';

-- 4. Verificar que se creó correctamente
SELECT 
    u.name as instructor_name,
    u.email,
    u.phone,
    u.age,
    i.bio,
    i."yearsExperience",
    i.specialties,
    i.certifications,
    i.rating,
    i."totalReviews",
    s.name as school_name
FROM users u
JOIN instructors i ON u.id = i."userId"
JOIN schools s ON i."schoolId" = s.id
WHERE u.email = 'gbarrera@clasedesurf.com';

-- 5. Ver las reseñas
SELECT 
    ir."studentName",
    ir.rating,
    ir.comment,
    ir."createdAt"
FROM instructor_reviews ir
JOIN instructors i ON ir."instructorId" = i.id
JOIN users u ON i."userId" = u.id
WHERE u.email = 'gbarrera@clasedesurf.com'
ORDER BY ir."createdAt" DESC;