#!/usr/bin/env node

const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const LOCAL_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'clasedesurf.com'
};

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function cleanDatabase(client) {
  log('\n🧹 Limpiando base de datos...', 'yellow');

  await client.query('DELETE FROM refresh_tokens');
  await client.query('DELETE FROM payments');
  await client.query('DELETE FROM reservations');
  await client.query('DELETE FROM instructor_reviews');
  await client.query('DELETE FROM classes');
  await client.query('DELETE FROM instructors');
  await client.query('DELETE FROM students');
  await client.query('DELETE FROM users');
  await client.query('DELETE FROM schools');

  // Reset sequences
  await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
  await client.query('ALTER SEQUENCE schools_id_seq RESTART WITH 1');
  await client.query('ALTER SEQUENCE instructors_id_seq RESTART WITH 1');
  await client.query('ALTER SEQUENCE students_id_seq RESTART WITH 1');
  await client.query('ALTER SEQUENCE classes_id_seq RESTART WITH 1');
  await client.query('ALTER SEQUENCE reservations_id_seq RESTART WITH 1');
  await client.query('ALTER SEQUENCE payments_id_seq RESTART WITH 1');

  log('✓ Base de datos limpiada', 'green');
}

async function createTestData(client) {
  log('\n📝 Creando datos de prueba...', 'cyan');

  const password = await bcrypt.hash('password123', 10);

  // ============================================
  // 1. CREAR ADMIN
  // ============================================
  log('\n1. Creando ADMIN...', 'yellow');
  const adminResult = await client.query(`
    INSERT INTO users (email, name, password, role, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING id, email, name, role
  `, ['admin@test.com', 'Admin Global', password, 'ADMIN']);

  const admin = adminResult.rows[0];
  log(`   ✓ Admin creado: ${admin.email} (ID: ${admin.id})`, 'green');

  // ============================================
  // 2. CREAR ESCUELA 1: Surf School Lima
  // ============================================
  log('\n2. Creando Escuela 1: Surf School Lima...', 'yellow');

  // School Admin 1
  const schoolAdmin1Result = await client.query(`
    INSERT INTO users (email, name, password, role, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING id, email, name, role
  `, ['admin.lima@test.com', 'Admin Lima', password, 'SCHOOL_ADMIN']);

  const schoolAdmin1 = schoolAdmin1Result.rows[0];
  log(`   ✓ School Admin creado: ${schoolAdmin1.email} (ID: ${schoolAdmin1.id})`, 'green');

  // Escuela 1
  const school1Result = await client.query(`
    INSERT INTO schools (name, location, description, "ownerId", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING id, name
  `, ['Surf School Lima', 'Miraflores, Lima', 'Escuela de surf en Lima', schoolAdmin1.id]);

  const school1 = school1Result.rows[0];
  log(`   ✓ Escuela creada: ${school1.name} (ID: ${school1.id})`, 'green');

  // Instructores de Escuela 1
  const instructor1Result = await client.query(`
    INSERT INTO users (email, name, password, role, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING id, email, name, role
  `, ['instructor1.lima@test.com', 'Carlos Lima', password, 'INSTRUCTOR']);

  const instructor1 = instructor1Result.rows[0];

  await client.query(`
    INSERT INTO instructors ("userId", "schoolId", bio, "yearsExperience", specialties, certifications, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
  `, [instructor1.id, school1.id, 'Instructor experimentado', 5, ['Principiantes', 'Intermedio'], ['ISA Level 1']]);

  log(`   ✓ Instructor creado: ${instructor1.email} (ID: ${instructor1.id})`, 'green');

  const instructor2Result = await client.query(`
    INSERT INTO users (email, name, password, role, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING id, email, name, role
  `, ['instructor2.lima@test.com', 'Ana Lima', password, 'INSTRUCTOR']);

  const instructor2 = instructor2Result.rows[0];

  await client.query(`
    INSERT INTO instructors ("userId", "schoolId", bio, "yearsExperience", specialties, certifications, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
  `, [instructor2.id, school1.id, 'Instructora especializada', 3, ['Avanzado'], ['ISA Level 2']]);

  log(`   ✓ Instructor creado: ${instructor2.email} (ID: ${instructor2.id})`, 'green');

  // Clases de Escuela 1
  const class1Result = await client.query(`
    INSERT INTO classes (title, description, date, duration, capacity, price, level, instructor, "schoolId", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING id, title
  `, [
    'Clase Principiantes Lima',
    'Clase para principiantes en Miraflores',
    new Date('2025-11-01T10:00:00'),
    120,
    10,
    50.00,
    'BEGINNER',
    'Carlos Lima',
    school1.id
  ]);

  const class1 = class1Result.rows[0];
  log(`   ✓ Clase creada: ${class1.title} (ID: ${class1.id})`, 'green');

  const class2Result = await client.query(`
    INSERT INTO classes (title, description, date, duration, capacity, price, level, instructor, "schoolId", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING id, title
  `, [
    'Clase Avanzada Lima',
    'Clase para avanzados en La Herradura',
    new Date('2025-11-02T14:00:00'),
    120,
    8,
    80.00,
    'ADVANCED',
    'Ana Lima',
    school1.id
  ]);

  const class2 = class2Result.rows[0];
  log(`   ✓ Clase creada: ${class2.title} (ID: ${class2.id})`, 'green');

  // Estudiantes de Escuela 1
  const student1Result = await client.query(`
    INSERT INTO users (email, name, password, role, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING id, email, name, role
  `, ['student1.lima@test.com', 'Juan Estudiante Lima', password, 'STUDENT']);

  const student1 = student1Result.rows[0];

  await client.query(`
    INSERT INTO students ("userId", "schoolId", level, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW())
  `, [student1.id, school1.id, 'BEGINNER']);

  log(`   ✓ Estudiante creado: ${student1.email} (ID: ${student1.id})`, 'green');

  // Reserva para Escuela 1
  const reservation1Result = await client.query(`
    INSERT INTO reservations ("userId", "classId", status, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING id
  `, [student1.id, class1.id, 'CONFIRMED']);

  log(`   ✓ Reserva creada para ${student1.email} en ${class1.title}`, 'green');

  // ============================================
  // 3. CREAR ESCUELA 2: Surf School Trujillo
  // ============================================
  log('\n3. Creando Escuela 2: Surf School Trujillo...', 'yellow');

  // School Admin 2
  const schoolAdmin2Result = await client.query(`
    INSERT INTO users (email, name, password, role, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING id, email, name, role
  `, ['admin.trujillo@test.com', 'Admin Trujillo', password, 'SCHOOL_ADMIN']);

  const schoolAdmin2 = schoolAdmin2Result.rows[0];
  log(`   ✓ School Admin creado: ${schoolAdmin2.email} (ID: ${schoolAdmin2.id})`, 'green');

  // Escuela 2
  const school2Result = await client.query(`
    INSERT INTO schools (name, location, description, "ownerId", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING id, name
  `, ['Surf School Trujillo', 'Huanchaco, Trujillo', 'Escuela de surf en Trujillo', schoolAdmin2.id]);

  const school2 = school2Result.rows[0];
  log(`   ✓ Escuela creada: ${school2.name} (ID: ${school2.id})`, 'green');

  // Instructores de Escuela 2
  const instructor3Result = await client.query(`
    INSERT INTO users (email, name, password, role, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING id, email, name, role
  `, ['instructor1.trujillo@test.com', 'Pedro Trujillo', password, 'INSTRUCTOR']);

  const instructor3 = instructor3Result.rows[0];

  await client.query(`
    INSERT INTO instructors ("userId", "schoolId", bio, "yearsExperience", specialties, certifications, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
  `, [instructor3.id, school2.id, 'Instructor local de Huanchaco', 7, ['Principiantes', 'Longboard'], ['ISA Level 2']]);

  log(`   ✓ Instructor creado: ${instructor3.email} (ID: ${instructor3.id})`, 'green');

  // Clases de Escuela 2
  const class3Result = await client.query(`
    INSERT INTO classes (title, description, date, duration, capacity, price, level, instructor, "schoolId", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING id, title
  `, [
    'Clase Principiantes Trujillo',
    'Clase para principiantes en Huanchaco',
    new Date('2025-11-01T09:00:00'),
    120,
    12,
    45.00,
    'BEGINNER',
    'Pedro Trujillo',
    school2.id
  ]);

  const class3 = class3Result.rows[0];
  log(`   ✓ Clase creada: ${class3.title} (ID: ${class3.id})`, 'green');

  const class4Result = await client.query(`
    INSERT INTO classes (title, description, date, duration, capacity, price, level, instructor, "schoolId", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING id, title
  `, [
    'Clase Intermedia Trujillo',
    'Clase para intermedios en Huanchaco',
    new Date('2025-11-03T15:00:00'),
    120,
    10,
    60.00,
    'INTERMEDIATE',
    'Pedro Trujillo',
    school2.id
  ]);

  const class4 = class4Result.rows[0];
  log(`   ✓ Clase creada: ${class4.title} (ID: ${class4.id})`, 'green');

  // Estudiantes de Escuela 2
  const student2Result = await client.query(`
    INSERT INTO users (email, name, password, role, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING id, email, name, role
  `, ['student1.trujillo@test.com', 'Maria Estudiante Trujillo', password, 'STUDENT']);

  const student2 = student2Result.rows[0];

  await client.query(`
    INSERT INTO students ("userId", "schoolId", level, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW())
  `, [student2.id, school2.id, 'INTERMEDIATE']);

  log(`   ✓ Estudiante creado: ${student2.email} (ID: ${student2.id})`, 'green');

  // Reserva para Escuela 2
  const reservation2Result = await client.query(`
    INSERT INTO reservations ("userId", "classId", status, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING id
  `, [student2.id, class3.id, 'CONFIRMED']);

  log(`   ✓ Reserva creada para ${student2.email} en ${class3.title}`, 'green');

  // ============================================
  // 4. CREAR ESTUDIANTE INDEPENDIENTE
  // ============================================
  log('\n4. Creando Estudiante Independiente...', 'yellow');

  const student3Result = await client.query(`
    INSERT INTO users (email, name, password, role, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING id, email, name, role
  `, ['student.independent@test.com', 'Luis Estudiante Independiente', password, 'STUDENT']);

  const student3 = student3Result.rows[0];

  await client.query(`
    INSERT INTO students ("userId", "schoolId", level, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW())
  `, [student3.id, null, 'BEGINNER']);

  log(`   ✓ Estudiante independiente creado: ${student3.email} (ID: ${student3.id})`, 'green');

  // Reserva en ambas escuelas
  await client.query(`
    INSERT INTO reservations ("userId", "classId", status, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW())
  `, [student3.id, class1.id, 'PENDING']);

  await client.query(`
    INSERT INTO reservations ("userId", "classId", status, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW())
  `, [student3.id, class4.id, 'PENDING']);

  log(`   ✓ Reservas creadas en ambas escuelas`, 'green');

  // ============================================
  // 5. CREAR MÁS CLASES Y RESERVACIONES CON PAGOS
  // ============================================
  log('\n5. Creando más clases, reservaciones y pagos...', 'yellow');

  // Más clases para Escuela 1
  const class5Result = await client.query(`
    INSERT INTO classes (title, description, date, duration, capacity, price, level, instructor, "schoolId", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING id, title
  `, [
    'Clase Intermedia Lima',
    'Clase para nivel intermedio en Costa Verde',
    new Date('2025-11-05T11:00:00'),
    120,
    8,
    65.00,
    'INTERMEDIATE',
    'Carlos Lima',
    school1.id
  ]);
  const class5 = class5Result.rows[0];
  log(`   ✓ Clase creada: ${class5.title} (ID: ${class5.id})`, 'green');

  const class6Result = await client.query(`
    INSERT INTO classes (title, description, date, duration, capacity, price, level, instructor, "schoolId", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING id, title
  `, [
    'Clase Grupal Lima',
    'Clase grupal para principiantes',
    new Date('2025-11-06T09:00:00'),
    90,
    15,
    40.00,
    'BEGINNER',
    'Ana Lima',
    school1.id
  ]);
  const class6 = class6Result.rows[0];
  log(`   ✓ Clase creada: ${class6.title} (ID: ${class6.id})`, 'green');

  // Más clases para Escuela 2
  const class7Result = await client.query(`
    INSERT INTO classes (title, description, date, duration, capacity, price, level, instructor, "schoolId", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING id, title
  `, [
    'Clase Avanzada Trujillo',
    'Clase para surfistas avanzados',
    new Date('2025-11-07T14:00:00'),
    120,
    6,
    75.00,
    'ADVANCED',
    'Pedro Trujillo',
    school2.id
  ]);
  const class7 = class7Result.rows[0];
  log(`   ✓ Clase creada: ${class7.title} (ID: ${class7.id})`, 'green');

  const class8Result = await client.query(`
    INSERT INTO classes (title, description, date, duration, capacity, price, level, instructor, "schoolId", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING id, title
  `, [
    'Clase Longboard Trujillo',
    'Especialidad en longboard',
    new Date('2025-11-08T10:00:00'),
    150,
    8,
    70.00,
    'INTERMEDIATE',
    'Pedro Trujillo',
    school2.id
  ]);
  const class8 = class8Result.rows[0];
  log(`   ✓ Clase creada: ${class8.title} (ID: ${class8.id})`, 'green');

  // Crear más estudiantes para Lima
  const student4Result = await client.query(`
    INSERT INTO users (email, name, password, role, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING id, email, name, role
  `, ['student2.lima@test.com', 'Sofia Lima', password, 'STUDENT']);
  const student4 = student4Result.rows[0];

  await client.query(`
    INSERT INTO students ("userId", "schoolId", level, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW())
  `, [student4.id, school1.id, 'INTERMEDIATE']);
  log(`   ✓ Estudiante creado: ${student4.email} (ID: ${student4.id})`, 'green');

  // Crear más estudiantes para Trujillo
  const student5Result = await client.query(`
    INSERT INTO users (email, name, password, role, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING id, email, name, role
  `, ['student2.trujillo@test.com', 'Diego Trujillo', password, 'STUDENT']);
  const student5 = student5Result.rows[0];

  await client.query(`
    INSERT INTO students ("userId", "schoolId", level, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW())
  `, [student5.id, school2.id, 'ADVANCED']);
  log(`   ✓ Estudiante creado: ${student5.email} (ID: ${student5.id})`, 'green');

  // Reservaciones con pagos para Escuela 1
  const res1 = await client.query(`
    INSERT INTO reservations ("userId", "classId", status, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING id
  `, [student4.id, class5.id, 'CONFIRMED']);

  await client.query(`
    INSERT INTO payments ("reservationId", amount, status, "paymentMethod", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, NOW(), NOW())
  `, [res1.rows[0].id, 65.00, 'PAID', 'CREDIT_CARD']);
  log(`   ✓ Reserva + Pago: ${student4.email} → ${class5.title} ($65)`, 'green');

  const res2 = await client.query(`
    INSERT INTO reservations ("userId", "classId", status, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING id
  `, [student1.id, class6.id, 'CONFIRMED']);

  await client.query(`
    INSERT INTO payments ("reservationId", amount, status, "paymentMethod", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, NOW(), NOW())
  `, [res2.rows[0].id, 40.00, 'PAID', 'CASH']);
  log(`   ✓ Reserva + Pago: ${student1.email} → ${class6.title} ($40)`, 'green');

  const res3 = await client.query(`
    INSERT INTO reservations ("userId", "classId", status, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING id
  `, [student4.id, class2.id, 'CONFIRMED']);

  await client.query(`
    INSERT INTO payments ("reservationId", amount, status, "paymentMethod", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, NOW(), NOW())
  `, [res3.rows[0].id, 80.00, 'PAID', 'CREDIT_CARD']);
  log(`   ✓ Reserva + Pago: ${student4.email} → ${class2.title} ($80)`, 'green');

  // Reservaciones con pagos para Escuela 2
  const res4 = await client.query(`
    INSERT INTO reservations ("userId", "classId", status, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING id
  `, [student5.id, class7.id, 'CONFIRMED']);

  await client.query(`
    INSERT INTO payments ("reservationId", amount, status, "paymentMethod", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, NOW(), NOW())
  `, [res4.rows[0].id, 75.00, 'PAID', 'CREDIT_CARD']);
  log(`   ✓ Reserva + Pago: ${student5.email} → ${class7.title} ($75)`, 'green');

  const res5 = await client.query(`
    INSERT INTO reservations ("userId", "classId", status, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING id
  `, [student2.id, class8.id, 'CONFIRMED']);

  await client.query(`
    INSERT INTO payments ("reservationId", amount, status, "paymentMethod", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, NOW(), NOW())
  `, [res5.rows[0].id, 70.00, 'PAID', 'CASH']);
  log(`   ✓ Reserva + Pago: ${student2.email} → ${class8.title} ($70)`, 'green');

  const res6 = await client.query(`
    INSERT INTO reservations ("userId", "classId", status, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING id
  `, [student5.id, class4.id, 'CONFIRMED']);

  await client.query(`
    INSERT INTO payments ("reservationId", amount, status, "paymentMethod", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, NOW(), NOW())
  `, [res6.rows[0].id, 60.00, 'PAID', 'CREDIT_CARD']);
  log(`   ✓ Reserva + Pago: ${student5.email} → ${class4.title} ($60)`, 'green');

  // Algunas reservaciones pendientes sin pago
  await client.query(`
    INSERT INTO reservations ("userId", "classId", status, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW())
  `, [student3.id, class5.id, 'PENDING']);
  log(`   ✓ Reserva pendiente: ${student3.email} → ${class5.title}`, 'gray');

  await client.query(`
    INSERT INTO reservations ("userId", "classId", status, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW())
  `, [student3.id, class7.id, 'PENDING']);
  log(`   ✓ Reserva pendiente: ${student3.email} → ${class7.title}`, 'gray');

  return {
    admin,
    school1: { ...school1, admin: schoolAdmin1, instructors: [instructor1, instructor2], students: [student1, student4], classes: [class1, class2, class5, class6] },
    school2: { ...school2, admin: schoolAdmin2, instructors: [instructor3], students: [student2, student5], classes: [class3, class4, class7, class8] },
    independentStudent: student3
  };
}

async function printSummary(data) {
  log('\n╔════════════════════════════════════════════╗', 'cyan');
  log('║   RESUMEN DE DATOS CREADOS                 ║', 'cyan');
  log('╚════════════════════════════════════════════╝', 'cyan');

  log('\n🔴 ADMIN GLOBAL:', 'red');
  log(`   Email: ${data.admin.email}`, 'white');
  log(`   Password: password123`, 'gray');
  log(`   Puede ver: TODO`, 'gray');

  log('\n🟡 ESCUELA 1: Surf School Lima', 'yellow');
  log(`   Admin: ${data.school1.admin.email}`, 'white');
  log(`   Password: password123`, 'gray');
  log(`   Instructores: ${data.school1.instructors.length}`, 'white');
  data.school1.instructors.forEach(i => {
    log(`     - ${i.email}`, 'gray');
  });
  log(`   Clases: ${data.school1.classes.length}`, 'white');
  data.school1.classes.forEach(c => {
    log(`     - ${c.title}`, 'gray');
  });
  log(`   Estudiantes: ${data.school1.students.length}`, 'white');
  data.school1.students.forEach(s => {
    log(`     - ${s.email}`, 'gray');
  });
  log(`   Pagos completados: 3 ($185 total)`, 'white');

  log('\n🟢 ESCUELA 2: Surf School Trujillo', 'green');
  log(`   Admin: ${data.school2.admin.email}`, 'white');
  log(`   Password: password123`, 'gray');
  log(`   Instructores: ${data.school2.instructors.length}`, 'white');
  data.school2.instructors.forEach(i => {
    log(`     - ${i.email}`, 'gray');
  });
  log(`   Clases: ${data.school2.classes.length}`, 'white');
  data.school2.classes.forEach(c => {
    log(`     - ${c.title}`, 'gray');
  });
  log(`   Estudiantes: ${data.school2.students.length}`, 'white');
  data.school2.students.forEach(s => {
    log(`     - ${s.email}`, 'gray');
  });
  log(`   Pagos completados: 3 ($205 total)`, 'white');

  log('\n🔵 ESTUDIANTE INDEPENDIENTE:', 'cyan');
  log(`   Email: ${data.independentStudent.email}`, 'white');
  log(`   Password: password123`, 'gray');
  log(`   Reservas: 4 pendientes en ambas escuelas`, 'gray');

  log('\n╔════════════════════════════════════════════╗', 'cyan');
  log('║   PRUEBAS RECOMENDADAS                     ║', 'cyan');
  log('╚════════════════════════════════════════════╝', 'cyan');

  log('\n1. Login como admin.lima@test.com:', 'yellow');
  log('   - Debe ver solo 4 clases (Lima)', 'white');
  log('   - Debe ver solo 2 instructores (Lima)', 'white');
  log('   - Debe ver 2 estudiantes de su escuela', 'white');
  log('   - Debe ver 3 pagos completados ($185)', 'white');
  log('   - NO debe ver clases de Trujillo', 'red');

  log('\n2. Login como instructor1.lima@test.com:', 'yellow');
  log('   - Debe ver solo su perfil', 'white');
  log('   - Debe ver clases de Lima', 'white');
  log('   - NO debe ver instructores de Trujillo', 'red');

  log('\n3. Login como student1.lima@test.com:', 'yellow');
  log('   - Debe ver todas las clases (8 total)', 'white');
  log('   - Debe ver solo sus 2 reservas', 'white');
  log('   - NO debe ver reservas de otros', 'red');

  log('\n4. Login como admin.trujillo@test.com:', 'yellow');
  log('   - Debe ver solo 4 clases (Trujillo)', 'white');
  log('   - Debe ver solo 1 instructor (Trujillo)', 'white');
  log('   - Debe ver 2 estudiantes de su escuela', 'white');
  log('   - Debe ver 3 pagos completados ($205)', 'white');
  log('   - NO debe ver clases de Lima', 'red');

  log('\n5. Login como student.independent@test.com:', 'yellow');
  log('   - Debe ver todas las clases (8 total)', 'white');
  log('   - Debe ver sus 4 reservas pendientes', 'white');
  log('   - Puede reservar en cualquier escuela', 'white');

  log('');
}

async function main() {
  const client = new Client(LOCAL_CONFIG);

  try {
    console.log('');
    log('╔════════════════════════════════════════════╗', 'cyan');
    log('║   SEED DE DATOS DE PRUEBA                  ║', 'cyan');
    log('╚════════════════════════════════════════════╝', 'cyan');

    await client.connect();
    log('\n✓ Conectado a Base de Datos Local', 'green');

    // Confirmar
    log('\n⚠️  ADVERTENCIA: Esto eliminará TODOS los datos actuales', 'red');
    log('Presiona Ctrl+C para cancelar o Enter para continuar...', 'yellow');

    // En Node.js, esperar input
    await new Promise((resolve) => {
      process.stdin.once('data', () => resolve());
    });

    await cleanDatabase(client);
    const data = await createTestData(client);
    await printSummary(data);

    log('╔════════════════════════════════════════════╗', 'green');
    log('║   ✓ DATOS CREADOS EXITOSAMENTE             ║', 'green');
    log('╚════════════════════════════════════════════╝', 'green');
    log('');

  } catch (error) {
    log(`\n✗ Error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await client.end();
  }
}

main();

