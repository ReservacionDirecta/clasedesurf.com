-- Script para actualizar datos de prueba y asociar escuela con usuario SCHOOL_ADMIN
-- Ejecutar este script después de crear los usuarios de prueba

-- Verificar que existe el usuario SCHOOL_ADMIN
SELECT id, name, email, role FROM users WHERE role = 'SCHOOL_ADMIN';

-- Verificar que existe la escuela Lima Surf School
SELECT id, name, location FROM schools WHERE name = 'Lima Surf School';

-- Si no existe la escuela, crearla
INSERT INTO schools (
  name, 
  location, 
  description, 
  phone, 
  email, 
  website, 
  address, 
  "createdAt", 
  "updatedAt"
)
SELECT 
  'Lima Surf School',
  'Miraflores, Lima',
  'Escuela de surf profesional en Lima con más de 10 años de experiencia. Ofrecemos clases para todos los niveles en las mejores playas de la costa limeña.',
  '+51 999 123 456',
  'info@limasurfschool.com',
  'https://limasurfschool.com',
  'Malecón de Miraflores 123, Lima, Perú',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM schools WHERE name = 'Lima Surf School'
);

-- Crear una segunda escuela para tener más datos de prueba
INSERT INTO schools (
  name, 
  location, 
  description, 
  phone, 
  email, 
  website, 
  instagram,
  facebook,
  whatsapp,
  address, 
  "createdAt", 
  "updatedAt"
)
SELECT 
  'Barranco Surf Academy',
  'Barranco, Lima',
  'Academia de surf ubicada en el bohemio distrito de Barranco. Especialistas en clases personalizadas y grupos pequeños.',
  '+51 999 654 321',
  'contacto@barrancosurf.com',
  'https://barrancosurf.com',
  '@barrancosurf',
  'Barranco Surf Academy',
  '+51 999 654 321',
  'Av. Grau 456, Barranco, Lima, Perú',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM schools WHERE name = 'Barranco Surf Academy'
);

-- Actualizar algunas clases existentes para que tengan fechas futuras
UPDATE classes 
SET date = NOW() + INTERVAL '2 days'
WHERE title = 'Clase de Surf para Principiantes';

UPDATE classes 
SET date = NOW() + INTERVAL '4 days'
WHERE title = 'Surf Intermedio - Perfeccionamiento';

-- Crear clases adicionales para la segunda escuela
INSERT INTO classes (
  title, 
  description, 
  date, 
  duration, 
  capacity, 
  price, 
  level, 
  instructor, 
  "schoolId", 
  "createdAt", 
  "updatedAt"
)
SELECT 
  'Surf Avanzado - Maniobras',
  'Clase para surfistas experimentados que quieren perfeccionar maniobras avanzadas como cutbacks, floaters y aerials.',
  NOW() + INTERVAL '6 days',
  180,
  4,
  150.00,
  'ADVANCED',
  'María Rodríguez',
  s.id,
  NOW(),
  NOW()
FROM schools s 
WHERE s.name = 'Barranco Surf Academy'
  AND NOT EXISTS (
    SELECT 1 FROM classes c WHERE c.title = 'Surf Avanzado - Maniobras'
  );

-- Crear más instructores
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
  'Instructora certificada con especialización en surf femenino y técnicas avanzadas. Campeona nacional de surf 2019.',
  8,
  ARRAY['Surf Avanzado', 'Surf Femenino', 'Competición'],
  ARRAY['ISA Level 2', 'Surf Coach Certification', 'Primeros Auxilios'],
  4.9,
  18,
  true,
  NOW(),
  NOW()
FROM users u, schools s 
WHERE u.email = 'maria@estudiante.com' 
  AND s.name = 'Barranco Surf Academy'
  AND NOT EXISTS (
    SELECT 1 FROM instructors i WHERE i."userId" = u.id
  );

-- Verificar los datos creados
SELECT 
  s.id,
  s.name as school_name,
  s.location,
  s.email,
  s.phone,
  COUNT(c.id) as total_classes
FROM schools s
LEFT JOIN classes c ON s.id = c."schoolId"
GROUP BY s.id, s.name, s.location, s.email, s.phone
ORDER BY s.name;

-- Verificar instructores
SELECT 
  s.name as school_name,
  u.name as instructor_name,
  u.email as instructor_email,
  i."yearsExperience",
  i.rating
FROM schools s
LEFT JOIN instructors i ON s.id = i."schoolId"
LEFT JOIN users u ON i."userId" = u.id
ORDER BY s.name, u.name;

-- Verificar clases con fechas futuras
SELECT 
  c.title,
  c.level,
  c.price,
  c.capacity,
  s.name as school_name,
  c.date,
  c.instructor
FROM classes c
JOIN schools s ON c."schoolId" = s.id
WHERE c.date > NOW()
ORDER BY c.date;