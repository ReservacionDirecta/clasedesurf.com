-- Script para crear usuarios de prueba en Railway
-- Ejecutar este script en la consola de Railway o usando una herramienta como pgAdmin

-- Primero, verificar las tablas existentes
-- \dt

-- Crear usuarios de prueba con diferentes roles
-- Nota: Las contraseñas están hasheadas con bcrypt (10 rounds)

-- 1. ADMIN - Usuario administrador
INSERT INTO users (name, email, password, role, "canSwim", "createdAt", "updatedAt") 
VALUES (
  'Admin Principal',
  'admin@clasedesurf.com',
  '$2a$10$cV5DEzGI9SpEYGz9YBvACOhLAhc3QNovGirhkBzpGge4Lg/7xgQAO',  -- password: admin123
  'ADMIN',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- 2. SCHOOL_ADMIN - Administrador de escuela
INSERT INTO users (name, email, password, role, "canSwim", "createdAt", "updatedAt") 
VALUES (
  'Director Escuela Lima',
  'director@escuelalimasurf.com',
  '$2a$10$L5KXkWdnU.pbsVM5v1qVkuj/FlP/uBfqMZQoCZSarysqnRxm83A4m',  -- password: school123
  'SCHOOL_ADMIN',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- 3. INSTRUCTOR - Instructor de surf
INSERT INTO users (name, email, password, role, "canSwim", age, weight, height, phone, "createdAt", "updatedAt") 
VALUES (
  'Carlos Mendoza',
  'carlos@instructor.com',
  '$2a$10$45dyP5YwfnXRZV42gpZ28uPsCgqjML/re4iCgqEs.FuzxCB0UCx/G',  -- password: instructor123
  'INSTRUCTOR',
  true,
  28,
  75.5,
  180.0,
  '+51 999 888 777',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- 4. STUDENT - Estudiante principiante
INSERT INTO users (name, email, password, role, "canSwim", age, weight, height, phone, injuries, "createdAt", "updatedAt") 
VALUES (
  'María García',
  'maria@estudiante.com',
  '$2a$10$Hn9ZdT2xkjoAao7XX0DbE.HVBfaBChBEmKZzO87N3XHis2i9oITLy',  -- password: student123
  'STUDENT',
  true,
  25,
  60.0,
  165.0,
  '+51 999 777 666',
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- 5. STUDENT - Estudiante intermedio
INSERT INTO users (name, email, password, role, "canSwim", age, weight, height, phone, injuries, "createdAt", "updatedAt") 
VALUES (
  'Diego Rodríguez',
  'diego@estudiante.com',
  '$2a$10$Hn9ZdT2xkjoAao7XX0DbE.HVBfaBChBEmKZzO87N3XHis2i9oITLy',  -- password: student123
  'STUDENT',
  true,
  30,
  80.0,
  175.0,
  '+51 999 666 555',
  'Lesión menor en rodilla izquierda (2022)',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- 6. STUDENT - Estudiante que no sabe nadar
INSERT INTO users (name, email, password, role, "canSwim", age, weight, height, phone, "createdAt", "updatedAt") 
VALUES (
  'Ana López',
  'ana@estudiante.com',
  '$2a$10$Hn9ZdT2xkjoAao7XX0DbE.HVBfaBChBEmKZzO87N3XHis2i9oITLy',  -- password: student123
  'STUDENT',
  false,
  22,
  55.0,
  160.0,
  '+51 999 555 444',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Crear una escuela de prueba
INSERT INTO schools (name, location, description, phone, email, website, address, "createdAt", "updatedAt")
VALUES (
  'Lima Surf School',
  'Miraflores, Lima',
  'Escuela de surf profesional en Lima con más de 10 años de experiencia. Ofrecemos clases para todos los niveles.',
  '+51 999 123 456',
  'info@limasurfschool.com',
  'https://limasurfschool.com',
  'Malecón de Miraflores 123, Lima, Perú',
  NOW(),
  NOW()
) ON CONFLICT (name) DO NOTHING;

-- Crear instructor asociado a la escuela
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
  'Instructor certificado con más de 5 años de experiencia enseñando surf. Especialista en técnicas para principiantes.',
  5,
  ARRAY['Principiantes', 'Técnica básica', 'Seguridad en el agua'],
  ARRAY['ISA Level 1', 'Primeros Auxilios', 'Salvavidas'],
  4.8,
  24,
  true,
  NOW(),
  NOW()
FROM users u, schools s 
WHERE u.email = 'carlos@instructor.com' 
  AND s.name = 'Lima Surf School'
  AND NOT EXISTS (
    SELECT 1 FROM instructors i WHERE i."userId" = u.id
  );

-- Crear algunas clases de ejemplo
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
  'Clase de Surf para Principiantes',
  'Clase perfecta para quienes nunca han surfeado. Incluye teoría básica, técnicas de seguridad y práctica en el agua.',
  NOW() + INTERVAL '3 days',
  120,
  8,
  80.00,
  'BEGINNER',
  'Carlos Mendoza',
  s.id,
  NOW(),
  NOW()
FROM schools s 
WHERE s.name = 'Lima Surf School'
  AND NOT EXISTS (
    SELECT 1 FROM classes c WHERE c.title = 'Clase de Surf para Principiantes'
  );

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
  'Surf Intermedio - Perfeccionamiento',
  'Para surfistas con experiencia básica que quieren mejorar su técnica y aprender maniobras avanzadas.',
  NOW() + INTERVAL '5 days',
  150,
  6,
  120.00,
  'INTERMEDIATE',
  'Carlos Mendoza',
  s.id,
  NOW(),
  NOW()
FROM schools s 
WHERE s.name = 'Lima Surf School'
  AND NOT EXISTS (
    SELECT 1 FROM classes c WHERE c.title = 'Surf Intermedio - Perfeccionamiento'
  );

-- Verificar que los usuarios se crearon correctamente
SELECT 
  id, 
  name, 
  email, 
  role, 
  "canSwim",
  age,
  "createdAt"
FROM users 
ORDER BY role, name;

-- Verificar escuelas e instructores
SELECT 
  s.name as school_name,
  u.name as instructor_name,
  u.email as instructor_email,
  i."yearsExperience",
  i.rating
FROM schools s
LEFT JOIN instructors i ON s.id = i."schoolId"
LEFT JOIN users u ON i."userId" = u.id;

-- Verificar clases
SELECT 
  c.title,
  c.level,
  c.price,
  c.capacity,
  s.name as school_name,
  c.date
FROM classes c
JOIN schools s ON c."schoolId" = s.id
ORDER BY c.date;