-- Script simplificado para crear usuarios de prueba
-- Primero eliminar usuarios existentes si es necesario
DELETE FROM users WHERE email IN (
  'admin@clasedesurf.com',
  'admin@escuela.com',
  'student@test.com',
  'director@escuelalimasurf.com'
);

-- Crear usuarios de prueba
INSERT INTO users (name, email, password, role, "canSwim", "createdAt", "updatedAt") 
VALUES 
  (
    'Admin Principal',
    'admin@clasedesurf.com',
    '$2a$10$cV5DEzGI9SpEYGz9YBvACOhLAhc3QNovGirhkBzpGge4Lg/7xgQAO',  -- password: admin123
    'ADMIN',
    true,
    NOW(),
    NOW()
  ),
  (
    'Admin Escuela',
    'admin@escuela.com',
    '$2a$10$cV5DEzGI9SpEYGz9YBvACOhLAhc3QNovGirhkBzpGge4Lg/7xgQAO',  -- password: admin123
    'SCHOOL_ADMIN',
    true,
    NOW(),
    NOW()
  ),
  (
    'Estudiante Test',
    'student@test.com',
    '$2a$10$Hn9ZdT2xkjoAao7XX0DbE.HVBfaBChBEmKZzO87N3XHis2i9oITLy',  -- password: student123
    'STUDENT',
    true,
    NOW(),
    NOW()
  );

-- Verificar usuarios creados
SELECT id, name, email, role FROM users WHERE email IN (
  'admin@clasedesurf.com',
  'admin@escuela.com', 
  'student@test.com'
) ORDER BY role;