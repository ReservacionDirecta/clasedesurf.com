> clasesde-pe-platform@2.0.0 build
> next build

Next.js config - NODE_ENV: production
Next.js config - BACKEND URL: https://surfschool-backend-production.up.railway.app
Next.js rewrites: [
  { source: '/api/auth/:path*', destination: '/api/auth/:path*' },
  {
    source: '/api/:path*',
    destination: 'https://surfschool-backend-production.up.railway.app/:path*'
  }
]
  ▲ Next.js 14.2.32
  - Environments: .env.local, .env.production

   Creating an optimized production build ...
Next.js config - NODE_ENV: production
Next.js config - BACKEND URL: https://surfschool-backend-production.up.railway.app
Next.js config - NODE_ENV: production
Next.js config - BACKEND URL: https://surfschool-backend-production.up.railway.app
Next.js config - NODE_ENV: production
Next.js config - BACKEND URL: https://surfschool-backend-production.up.railway.app
 ✓ Compiled successfully

./src/app/dashboard/school/page.tsx
143:6  Warning: React Hook useEffect has a missing dependency: 'fetchSchoolData'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
150:6  Warning: React Hook useEffect has a missing dependency: 'generateMockStats'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./src/app/dashboard/school/payments/page.tsx
54:6  Warning: React Hook useEffect has a missing dependency: 'fetchPayments'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./src/app/dashboard/school/reservations/page.tsx
62:6  Warning: React Hook useEffect has a missing dependency: 'fetchReservations'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./src/app/dashboard/school/students/page.tsx
53:6  Warning: React Hook useEffect has a missing dependency: 'fetchStudents'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./src/app/dashboard/student/page.tsx
78:6  Warning: React Hook useEffect has a missing dependency: 'fetchStudentData'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./src/app/dashboard/student/reservations/page.tsx
70:6  Warning: React Hook useEffect has a missing dependency: 'fetchReservations'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./src/app/reservations/confirmation/page.tsx
117:6  Warning: React Hook useEffect has a missing dependency: 'fetchReservation'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
137:6  Warning: React Hook useEffect has a missing dependency: 'handleCreateReservation'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./src/app/reservations/page.tsx
62:6  Warning: React Hook useEffect has a missing dependency: 'fetchReservations'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./src/components/calendar/ReservationCalendar.tsx
34:6  Warning: React Hook useEffect has a missing dependency: 'fetchReservations'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./src/components/forms/InstructorForm.tsx
33:6  Warning: React Hook useEffect has a missing dependency: 'fetchAvailableUsers'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./src/components/forms/PaymentForm.tsx
37:6  Warning: React Hook useEffect has a missing dependency: 'fetchReservations'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./src/components/forms/ReservationForm.tsx
30:6  Warning: React Hook useEffect has missing dependencies: 'fetchClasses' and 'fetchUsers'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps   

./src/components/instructors/InstructorStats.tsx
30:6  Warning: React Hook useEffect has a missing dependency: 'fetchInstructorAnalytics'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
   Linting and checking validity of types  ...Failed to compile.

./src/components/payments/PaymentUpload.tsx:448:102
Type error: Property 'accountInfo' does not exist on type '{ title: "Transferencia Bancaria"; icon: ComponentType<any>; instructions: string[]; accountInfo?: { bank: string; accountType: string; accountNumber: string; accountName: string; } | undefined; } | { ...; } | { ...; } | { ...; } | { ...; }'.
  Property 'accountInfo' does not exist on type '{ title: "Yape"; icon: ComponentType<any>; instructions: string[]; phoneNumber?: string | undefined; }'.

  446 |
  447 |             {/* Account Info for Transfer/Deposit */}
> 448 |             {(selectedMethod === 'transfer' || selectedMethod === 'deposit') && selectedInstructions.accountInfo && (
      |                                                                                  
                    ^
  449 |               <div className="mt-4 p-3 bg-white rounded border border-blue-200"> 
  450 |                 <p className="font-semibold text-sm text-gray-900 mb-2">Datos de la cuenta:</p>
  451 |                 <div className="space-y-1 text-sm text-gray-700">
Next.js build worker exited with code: 1 and signal: null
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