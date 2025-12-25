-- ============================================
-- SCRIPT DE ACTUALIZACIÓN RAILWAY DATABASE
-- Fecha: 2025-12-24
-- ============================================
-- 1. LIMPIAR DATOS EXISTENTES (en orden correcto para foreign keys)
-- ============================================
TRUNCATE TABLE refresh_tokens,
payments,
reservations,
instructor_reviews,
school_reviews,
class_sessions,
class_schedules,
discount_codes,
calendar_notes,
notifications,
classes,
instructors,
students,
schools,
users RESTART IDENTITY CASCADE;
-- 2. INSERTAR USUARIOS
-- ============================================
-- Admin Global
INSERT INTO users (
        email,
        name,
        password,
        role,
        "createdAt",
        "updatedAt"
    )
VALUES (
        'admin@test.com',
        'Admin Global',
        '$2a$10$YourHashedPasswordHere',
        -- Reemplazar con hash real de bcrypt
        'ADMIN',
        NOW(),
        NOW()
    );
-- Admin Escuela Lima
INSERT INTO users (
        email,
        name,
        password,
        role,
        "createdAt",
        "updatedAt"
    )
VALUES (
        'admin.lima@test.com',
        'Admin Lima',
        '$2a$10$YourHashedPasswordHere',
        'SCHOOL_ADMIN',
        NOW(),
        NOW()
    );
-- Admin Escuela Trujillo
INSERT INTO users (
        email,
        name,
        password,
        role,
        "createdAt",
        "updatedAt"
    )
VALUES (
        'admin.trujillo@test.com',
        'Admin Trujillo',
        '$2a$10$YourHashedPasswordHere',
        'SCHOOL_ADMIN',
        NOW(),
        NOW()
    );
-- Instructores Lima
INSERT INTO users (
        email,
        name,
        password,
        role,
        "createdAt",
        "updatedAt"
    )
VALUES (
        'instructor1.lima@test.com',
        'Carlos Lima',
        '$2a$10$YourHashedPasswordHere',
        'INSTRUCTOR',
        NOW(),
        NOW()
    ),
    (
        'instructor2.lima@test.com',
        'Ana Lima',
        '$2a$10$YourHashedPasswordHere',
        'INSTRUCTOR',
        NOW(),
        NOW()
    );
-- Instructores Trujillo
INSERT INTO users (
        email,
        name,
        password,
        role,
        "createdAt",
        "updatedAt"
    )
VALUES (
        'instructor1.trujillo@test.com',
        'Pedro Trujillo',
        '$2a$10$YourHashedPasswordHere',
        'INSTRUCTOR',
        NOW(),
        NOW()
    );
-- Estudiantes Lima
INSERT INTO users (
        email,
        name,
        password,
        role,
        "createdAt",
        "updatedAt"
    )
VALUES (
        'student1.lima@test.com',
        'Juan Estudiante Lima',
        '$2a$10$YourHashedPasswordHere',
        'STUDENT',
        NOW(),
        NOW()
    ),
    (
        'student2.lima@test.com',
        'Sofia Lima',
        '$2a$10$YourHashedPasswordHere',
        'STUDENT',
        NOW(),
        NOW()
    );
-- Estudiantes Trujillo
INSERT INTO users (
        email,
        name,
        password,
        role,
        "createdAt",
        "updatedAt"
    )
VALUES (
        'student1.trujillo@test.com',
        'Maria Estudiante Trujillo',
        '$2a$10$YourHashedPasswordHere',
        'STUDENT',
        NOW(),
        NOW()
    ),
    (
        'student2.trujillo@test.com',
        'Diego Trujillo',
        '$2a$10$YourHashedPasswordHere',
        'STUDENT',
        NOW(),
        NOW()
    );
-- Estudiante Independiente
INSERT INTO users (
        email,
        name,
        password,
        role,
        "createdAt",
        "updatedAt"
    )
VALUES (
        'student.independent@test.com',
        'Luis Estudiante Independiente',
        '$2a$10$YourHashedPasswordHere',
        'STUDENT',
        NOW(),
        NOW()
    );
-- 3. INSERTAR ESCUELAS
-- ============================================
-- Escuela Lima (ownerId debe coincidir con admin.lima@test.com)
INSERT INTO schools (
        name,
        location,
        description,
        "ownerId",
        "coverImage",
        "createdAt",
        "updatedAt"
    )
SELECT 'Surf School Lima',
    'Miraflores, Lima',
    'Escuela de surf en Lima con instructores certificados',
    u.id,
    '/uploads/schools/surf-school-lima.jpg',
    NOW(),
    NOW()
FROM users u
WHERE u.email = 'admin.lima@test.com';
-- Escuela Trujillo (ownerId debe coincidir con admin.trujillo@test.com)
INSERT INTO schools (
        name,
        location,
        description,
        "ownerId",
        "coverImage",
        "createdAt",
        "updatedAt"
    )
SELECT 'Surf School Trujillo',
    'Huanchaco, Trujillo',
    'Escuela de surf en Trujillo con las mejores olas',
    u.id,
    '/uploads/schools/mancora-surf.jpg',
    NOW(),
    NOW()
FROM users u
WHERE u.email = 'admin.trujillo@test.com';
-- 4. INSERTAR INSTRUCTORES
-- ============================================
-- Instructores Lima
INSERT INTO instructors (
        "userId",
        "schoolId",
        bio,
        "yearsExperience",
        specialties,
        certifications,
        "createdAt",
        "updatedAt"
    )
SELECT u.id,
    s.id,
    'Instructor experimentado en surf',
    5,
    ARRAY ['Principiantes', 'Intermedio'],
    ARRAY ['ISA Level 1'],
    NOW(),
    NOW()
FROM users u
    CROSS JOIN schools s
WHERE u.email = 'instructor1.lima@test.com'
    AND s.name = 'Surf School Lima';
INSERT INTO instructors (
        "userId",
        "schoolId",
        bio,
        "yearsExperience",
        specialties,
        certifications,
        "createdAt",
        "updatedAt"
    )
SELECT u.id,
    s.id,
    'Instructora especializada en surf avanzado',
    3,
    ARRAY ['Avanzado'],
    ARRAY ['ISA Level 2'],
    NOW(),
    NOW()
FROM users u
    CROSS JOIN schools s
WHERE u.email = 'instructor2.lima@test.com'
    AND s.name = 'Surf School Lima';
-- Instructor Trujillo
INSERT INTO instructors (
        "userId",
        "schoolId",
        bio,
        "yearsExperience",
        specialties,
        certifications,
        "createdAt",
        "updatedAt"
    )
SELECT u.id,
    s.id,
    'Instructor local de Huanchaco',
    7,
    ARRAY ['Principiantes', 'Longboard'],
    ARRAY ['ISA Level 2'],
    NOW(),
    NOW()
FROM users u
    CROSS JOIN schools s
WHERE u.email = 'instructor1.trujillo@test.com'
    AND s.name = 'Surf School Trujillo';
-- 5. INSERTAR CLASES
-- ============================================
-- Clases Lima
INSERT INTO classes (
        title,
        description,
        duration,
        capacity,
        "defaultPrice",
        level,
        "schoolId",
        "createdAt",
        "updatedAt"
    )
SELECT 'Clase Principiantes Lima',
    'Clase para principiantes en Miraflores',
    120,
    10,
    50.00,
    'BEGINNER',
    s.id,
    NOW(),
    NOW()
FROM schools s
WHERE s.name = 'Surf School Lima';
INSERT INTO classes (
        title,
        description,
        duration,
        capacity,
        "defaultPrice",
        level,
        "schoolId",
        "createdAt",
        "updatedAt"
    )
SELECT 'Clase Avanzada Lima',
    'Clase para surfistas avanzados en La Herradura',
    120,
    8,
    80.00,
    'ADVANCED',
    s.id,
    NOW(),
    NOW()
FROM schools s
WHERE s.name = 'Surf School Lima';
INSERT INTO classes (
        title,
        description,
        duration,
        capacity,
        "defaultPrice",
        level,
        "schoolId",
        "createdAt",
        "updatedAt"
    )
SELECT 'Clase Intermedia Lima',
    'Clase para nivel intermedio en Costa Verde',
    120,
    8,
    65.00,
    'INTERMEDIATE',
    s.id,
    NOW(),
    NOW()
FROM schools s
WHERE s.name = 'Surf School Lima';
INSERT INTO classes (
        title,
        description,
        duration,
        capacity,
        "defaultPrice",
        level,
        "schoolId",
        "createdAt",
        "updatedAt"
    )
SELECT 'Clase Grupal Lima',
    'Clase grupal para principiantes',
    90,
    15,
    40.00,
    'BEGINNER',
    s.id,
    NOW(),
    NOW()
FROM schools s
WHERE s.name = 'Surf School Lima';
-- Clases Trujillo
INSERT INTO classes (
        title,
        description,
        duration,
        capacity,
        "defaultPrice",
        level,
        "schoolId",
        "createdAt",
        "updatedAt"
    )
SELECT 'Clase Principiantes Trujillo',
    'Clase para principiantes en Huanchaco',
    120,
    12,
    45.00,
    'BEGINNER',
    s.id,
    NOW(),
    NOW()
FROM schools s
WHERE s.name = 'Surf School Trujillo';
INSERT INTO classes (
        title,
        description,
        duration,
        capacity,
        "defaultPrice",
        level,
        "schoolId",
        "createdAt",
        "updatedAt"
    )
SELECT 'Clase Intermedia Trujillo',
    'Clase para intermedios en Huanchaco',
    120,
    10,
    60.00,
    'INTERMEDIATE',
    s.id,
    NOW(),
    NOW()
FROM schools s
WHERE s.name = 'Surf School Trujillo';
INSERT INTO classes (
        title,
        description,
        duration,
        capacity,
        "defaultPrice",
        level,
        "schoolId",
        "createdAt",
        "updatedAt"
    )
SELECT 'Clase Avanzada Trujillo',
    'Clase para surfistas avanzados',
    120,
    6,
    75.00,
    'ADVANCED',
    s.id,
    NOW(),
    NOW()
FROM schools s
WHERE s.name = 'Surf School Trujillo';
INSERT INTO classes (
        title,
        description,
        duration,
        capacity,
        "defaultPrice",
        level,
        "schoolId",
        "createdAt",
        "updatedAt"
    )
SELECT 'Clase Longboard Trujillo',
    'Especialidad en longboard',
    150,
    8,
    70.00,
    'INTERMEDIATE',
    s.id,
    NOW(),
    NOW()
FROM schools s
WHERE s.name = 'Surf School Trujillo';
-- 6. INSERTAR ESTUDIANTES
-- ============================================
-- Estudiantes Lima
INSERT INTO students (
        "userId",
        "schoolId",
        level,
        "createdAt",
        "updatedAt"
    )
SELECT u.id,
    s.id,
    'BEGINNER',
    NOW(),
    NOW()
FROM users u
    CROSS JOIN schools s
WHERE u.email = 'student1.lima@test.com'
    AND s.name = 'Surf School Lima';
INSERT INTO students (
        "userId",
        "schoolId",
        level,
        "createdAt",
        "updatedAt"
    )
SELECT u.id,
    s.id,
    'INTERMEDIATE',
    NOW(),
    NOW()
FROM users u
    CROSS JOIN schools s
WHERE u.email = 'student2.lima@test.com'
    AND s.name = 'Surf School Lima';
-- Estudiantes Trujillo
INSERT INTO students (
        "userId",
        "schoolId",
        level,
        "createdAt",
        "updatedAt"
    )
SELECT u.id,
    s.id,
    'INTERMEDIATE',
    NOW(),
    NOW()
FROM users u
    CROSS JOIN schools s
WHERE u.email = 'student1.trujillo@test.com'
    AND s.name = 'Surf School Trujillo';
INSERT INTO students (
        "userId",
        "schoolId",
        level,
        "createdAt",
        "updatedAt"
    )
SELECT u.id,
    s.id,
    'ADVANCED',
    NOW(),
    NOW()
FROM users u
    CROSS JOIN schools s
WHERE u.email = 'student2.trujillo@test.com'
    AND s.name = 'Surf School Trujillo';
-- Estudiante Independiente (sin escuela)
INSERT INTO students (
        "userId",
        "schoolId",
        level,
        "createdAt",
        "updatedAt"
    )
SELECT u.id,
    NULL,
    'BEGINNER',
    NOW(),
    NOW()
FROM users u
WHERE u.email = 'student.independent@test.com';
-- 7. INSERTAR RESERVACIONES
-- ============================================
-- Reservaciones confirmadas Lima
INSERT INTO reservations (
        "userId",
        "classId",
        status,
        "createdAt",
        "updatedAt"
    )
SELECT u.id,
    c.id,
    'CONFIRMED',
    NOW(),
    NOW()
FROM users u
    CROSS JOIN classes c
    CROSS JOIN schools s
WHERE u.email = 'student1.lima@test.com'
    AND c.title = 'Clase Principiantes Lima'
    AND c."schoolId" = s.id
    AND s.name = 'Surf School Lima';
INSERT INTO reservations (
        "userId",
        "classId",
        status,
        "createdAt",
        "updatedAt"
    )
SELECT u.id,
    c.id,
    'CONFIRMED',
    NOW(),
    NOW()
FROM users u
    CROSS JOIN classes c
    CROSS JOIN schools s
WHERE u.email = 'student2.lima@test.com'
    AND c.title = 'Clase Intermedia Lima'
    AND c."schoolId" = s.id
    AND s.name = 'Surf School Lima';
-- Reservaciones confirmadas Trujillo
INSERT INTO reservations (
        "userId",
        "classId",
        status,
        "createdAt",
        "updatedAt"
    )
SELECT u.id,
    c.id,
    'CONFIRMED',
    NOW(),
    NOW()
FROM users u
    CROSS JOIN classes c
    CROSS JOIN schools s
WHERE u.email = 'student1.trujillo@test.com'
    AND c.title = 'Clase Principiantes Trujillo'
    AND c."schoolId" = s.id
    AND s.name = 'Surf School Trujillo';
INSERT INTO reservations (
        "userId",
        "classId",
        status,
        "createdAt",
        "updatedAt"
    )
SELECT u.id,
    c.id,
    'CONFIRMED',
    NOW(),
    NOW()
FROM users u
    CROSS JOIN classes c
    CROSS JOIN schools s
WHERE u.email = 'student2.trujillo@test.com'
    AND c.title = 'Clase Avanzada Trujillo'
    AND c."schoolId" = s.id
    AND s.name = 'Surf School Trujillo';
-- Reservaciones pendientes del estudiante independiente
INSERT INTO reservations (
        "userId",
        "classId",
        status,
        "createdAt",
        "updatedAt"
    )
SELECT u.id,
    c.id,
    'PENDING',
    NOW(),
    NOW()
FROM users u
    CROSS JOIN classes c
    CROSS JOIN schools s
WHERE u.email = 'student.independent@test.com'
    AND c.title = 'Clase Principiantes Lima'
    AND c."schoolId" = s.id
    AND s.name = 'Surf School Lima';
INSERT INTO reservations (
        "userId",
        "classId",
        status,
        "createdAt",
        "updatedAt"
    )
SELECT u.id,
    c.id,
    'PENDING',
    NOW(),
    NOW()
FROM users u
    CROSS JOIN classes c
    CROSS JOIN schools s
WHERE u.email = 'student.independent@test.com'
    AND c.title = 'Clase Intermedia Trujillo'
    AND c."schoolId" = s.id
    AND s.name = 'Surf School Trujillo';
-- 8. INSERTAR PAGOS (para reservaciones confirmadas)
-- ============================================
INSERT INTO payments (
        "reservationId",
        amount,
        status,
        "paymentMethod",
        "createdAt",
        "updatedAt"
    )
SELECT r.id,
    50.00,
    'PAID',
    'CREDIT_CARD',
    NOW(),
    NOW()
FROM reservations r
    INNER JOIN users u ON r."userId" = u.id
    INNER JOIN classes c ON r."classId" = c.id
WHERE u.email = 'student1.lima@test.com'
    AND c.title = 'Clase Principiantes Lima'
    AND r.status = 'CONFIRMED';
INSERT INTO payments (
        "reservationId",
        amount,
        status,
        "paymentMethod",
        "createdAt",
        "updatedAt"
    )
SELECT r.id,
    65.00,
    'PAID',
    'CREDIT_CARD',
    NOW(),
    NOW()
FROM reservations r
    INNER JOIN users u ON r."userId" = u.id
    INNER JOIN classes c ON r."classId" = c.id
WHERE u.email = 'student2.lima@test.com'
    AND c.title = 'Clase Intermedia Lima'
    AND r.status = 'CONFIRMED';
INSERT INTO payments (
        "reservationId",
        amount,
        status,
        "paymentMethod",
        "createdAt",
        "updatedAt"
    )
SELECT r.id,
    45.00,
    'PAID',
    'CASH',
    NOW(),
    NOW()
FROM reservations r
    INNER JOIN users u ON r."userId" = u.id
    INNER JOIN classes c ON r."classId" = c.id
WHERE u.email = 'student1.trujillo@test.com'
    AND c.title = 'Clase Principiantes Trujillo'
    AND r.status = 'CONFIRMED';
INSERT INTO payments (
        "reservationId",
        amount,
        status,
        "paymentMethod",
        "createdAt",
        "updatedAt"
    )
SELECT r.id,
    75.00,
    'PAID',
    'CREDIT_CARD',
    NOW(),
    NOW()
FROM reservations r
    INNER JOIN users u ON r."userId" = u.id
    INNER JOIN classes c ON r."classId" = c.id
WHERE u.email = 'student2.trujillo@test.com'
    AND c.title = 'Clase Avanzada Trujillo'
    AND r.status = 'CONFIRMED';
-- ============================================
-- VERIFICACIÓN DE DATOS
-- ============================================
-- Contar registros insertados
SELECT 'users' as tabla,
    COUNT(*) as total
FROM users
UNION ALL
SELECT 'schools',
    COUNT(*)
FROM schools
UNION ALL
SELECT 'instructors',
    COUNT(*)
FROM instructors
UNION ALL
SELECT 'classes',
    COUNT(*)
FROM classes
UNION ALL
SELECT 'students',
    COUNT(*)
FROM students
UNION ALL
SELECT 'reservations',
    COUNT(*)
FROM reservations
UNION ALL
SELECT 'payments',
    COUNT(*)
FROM payments;
-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Reemplazar '$2a$10$YourHashedPasswordHere' con hashes reales de bcrypt
--    Puedes generar hashes usando: node -e "console.log(require('bcryptjs').hashSync('password123', 10))"
--
-- 2. Las rutas de imágenes (/uploads/schools/*.jpg) deben existir en el servidor
--
-- 3. Este script usa SELECT con CROSS JOIN para obtener IDs dinámicamente,
--    evitando hardcodear valores numéricos
--
-- 4. Para ejecutar en Railway:
--    - Ir a la pestaña "Data" del servicio PostgreSQL
--    - Abrir "Query"
--    - Copiar y pegar este script
--    - Ejecutar
--
-- 5. Credenciales de prueba (todas con password: password123):
--    - admin@test.com (ADMIN)
--    - admin.lima@test.com (SCHOOL_ADMIN - Lima)
--    - admin.trujillo@test.com (SCHOOL_ADMIN - Trujillo)
--    - instructor1.lima@test.com (INSTRUCTOR)
--    - student1.lima@test.com (STUDENT)
--    - etc.