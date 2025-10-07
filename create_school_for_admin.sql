-- Crear escuela para admin@escuela.com
INSERT INTO schools (name, location, description, phone, email, website, address, "ownerId", "createdAt", "updatedAt")
SELECT 
  'Escuela de Surf Lima',
  'Lima, Perú',
  'Escuela de surf profesional en Lima',
  '+51 999 123 456',
  'info@escuelalimasurf.com',
  'https://escuelalimasurf.com',
  'Lima, Perú',
  u.id,
  NOW(),
  NOW()
FROM users u 
WHERE u.email = 'admin@escuela.com'
  AND NOT EXISTS (
    SELECT 1 FROM schools s WHERE s."ownerId" = u.id
  );

-- Verificar que se creó
SELECT s.name, s.location, u.name as owner_name, u.email as owner_email
FROM schools s
JOIN users u ON s."ownerId" = u.id
WHERE u.email = 'admin@escuela.com';