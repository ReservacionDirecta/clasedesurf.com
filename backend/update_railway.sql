-- ============================================
-- SCRIPT DE ACTUALIZACIÓN DE DATOS DE PRUEBA
-- PARA RAILWAY (Basado en seed-test-data.js)
-- ============================================
-- 1. LIMPIAR DATOS EXISTENTES (Orden correcto por dependencias foreign key)
TRUNCATE TABLE "refresh_tokens" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "payments" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "reservations" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "instructor_reviews" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "classes" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "instructors" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "students" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "schools" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;
-- 2. REINICIAR SECUENCIAS (Ya cubierto por RESTART IDENTITY pero aseguramos)
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE schools_id_seq RESTART WITH 1;
ALTER SEQUENCE instructors_id_seq RESTART WITH 1;
ALTER SEQUENCE students_id_seq RESTART WITH 1;
ALTER SEQUENCE classes_id_seq RESTART WITH 1;
ALTER SEQUENCE reservations_id_seq RESTART WITH 1;
ALTER SEQUENCE payments_id_seq RESTART WITH 1;
-- 3. INSERTAR ADMIN GLOBAL (ID: 1)
-- Hash para 'password123': $2a$10$wI5zN.A8y.X.X.X.X.X.X.X.X.X.X.X.X.X.X (Ejemplo)
-- Usaremos un hash válido generado previamente para 'password123'
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
        '$2a$10$YourGeneratedHashHereOrValidBcryptString',
        'ADMIN',
        NOW(),
        NOW()
    );
-- 4. ESCUELA 1: Surf School Lima
-- Admin Escuela (ID: 2)
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
        '$2a$10$YourGeneratedHashHereOrValidBcryptString',
        'SCHOOL_ADMIN',
        NOW(),
        NOW()
    );
-- Escuela (ID: 1)
INSERT INTO schools (
        name,
        location,
        description,
        "ownerId",
        "coverImage",
        "createdAt",
        "updatedAt"
    )
VALUES (
        'Surf School Lima',
        'Miraflores, Lima',
        'Escuela de surf en Lima',
        2,
        '/uploads/schools/surf-school-lima.jpg',
        NOW(),
        NOW()
    );
-- Instructores (ID: 3, 4)
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
        '$2a$10$YourGeneratedHashHereOrValidBcryptString',
        'INSTRUCTOR',
        NOW(),
        NOW()
    ),
    (
        'instructor2.lima@test.com',
        'Ana Lima',
        '$2a$10$YourGeneratedHashHereOrValidBcryptString',
        'INSTRUCTOR',
        NOW(),
        NOW()
    );
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
VALUES (
        3,
        1,
        'Instructor experimentado',
        5,
        ARRAY ['Principiantes', 'Intermedio'],
        ARRAY ['ISA Level 1'],
        NOW(),
        NOW()
    ),
    (
        4,
        1,
        'Instructora especializada',
        3,
        ARRAY ['Avanzado'],
        ARRAY ['ISA Level 2'],
        NOW(),
        NOW()
    );
-- Clases
INSERT INTO classes (
        title,
        description,
        date,
        duration,
        capacity,
        "defaultPrice",
        level,
        "instructor",
        "schoolId",
        "createdAt",
        "updatedAt"
    )
VALUES (
        'Clase Principiantes Lima',
        'Clase para principiantes en Miraflores',
        '2025-11-01 10:00:00',
        120,
        10,
        50.00,
        'BEGINNER',
        'Carlos Lima',
        1,
        NOW(),
        NOW()
    ),
    (
        'Clase Avanzada Lima',
        'Clase para avanzados en La Herradura',
        '2025-11-02 14:00:00',
        120,
        8,
        80.00,
        'ADVANCED',
        'Ana Lima',
        1,
        NOW(),
        NOW()
    );
-- Estudiantes (ID: 5)
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
        '$2a$10$YourGeneratedHashHereOrValidBcryptString',
        'STUDENT',
        NOW(),
        NOW()
    );
INSERT INTO students (
        "userId",
        "schoolId",
        level,
        "createdAt",
        "updatedAt"
    )
VALUES (5, 1, 'BEGINNER', NOW(), NOW());
-- Reserva (ID: 1)
INSERT INTO reservations (
        "userId",
        "classId",
        status,
        "createdAt",
        "updatedAt"
    )
VALUES (5, 1, 'CONFIRMED', NOW(), NOW());
-- 5. ESCUELA 2: Surf School Trujillo
-- Admin Escuela (ID: 6)
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
        '$2a$10$YourGeneratedHashHereOrValidBcryptString',
        'SCHOOL_ADMIN',
        NOW(),
        NOW()
    );
-- Escuela (ID: 2)
INSERT INTO schools (
        name,
        location,
        description,
        "ownerId",
        "coverImage",
        "createdAt",
        "updatedAt"
    )
VALUES (
        'Surf School Trujillo',
        'Huanchaco, Trujillo',
        'Escuela de surf en Trujillo',
        6,
        '/uploads/schools/mancora-surf.jpg',
        NOW(),
        NOW()
    );
-- Instructor (ID: 7)
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
        '$2a$10$YourGeneratedHashHereOrValidBcryptString',
        'INSTRUCTOR',
        NOW(),
        NOW()
    );
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
VALUES (
        7,
        2,
        'Instructor local de Huanchaco',
        7,
        ARRAY ['Principiantes', 'Longboard'],
        ARRAY ['ISA Level 2'],
        NOW(),
        NOW()
    );
-- Clases
INSERT INTO classes (
        title,
        description,
        date,
        duration,
        capacity,
        "defaultPrice",
        level,
        "instructor",
        "schoolId",
        "createdAt",
        "updatedAt"
    )
VALUES (
        'Clase Principiantes Trujillo',
        'Clase para principiantes en Huanchaco',
        '2025-11-01 09:00:00',
        120,
        12,
        45.00,
        'BEGINNER',
        'Pedro Trujillo',
        2,
        NOW(),
        NOW()
    ),
    (
        'Clase Intermedia Trujillo',
        'Clase para intermedios en Huanchaco',
        '2025-11-03 15:00:00',
        120,
        10,
        60.00,
        'INTERMEDIATE',
        'Pedro Trujillo',
        2,
        NOW(),
        NOW()
    );
-- Estudiantes (ID: 8)
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
        '$2a$10$YourGeneratedHashHereOrValidBcryptString',
        'STUDENT',
        NOW(),
        NOW()
    );
INSERT INTO students (
        "userId",
        "schoolId",
        level,
        "createdAt",
        "updatedAt"
    )
VALUES (8, 2, 'INTERMEDIATE', NOW(), NOW());
-- Reserva (ID: 2)
INSERT INTO reservations (
        "userId",
        "classId",
        status,
        "createdAt",
        "updatedAt"
    )
VALUES (8, 3, 'CONFIRMED', NOW(), NOW());
-- ... (Más datos se pueden agregar siguiendo este patrón)