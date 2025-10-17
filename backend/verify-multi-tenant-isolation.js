#!/usr/bin/env node

const axios = require('axios');

// const API_URL = 'https://clasedesurfcom-production.up.railway.app';
const API_URL = 'http://localhost:4000';

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

async function login(email, password) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    return response.data.token;
  } catch (error) {
    log(`✗ Error login ${email}: ${error.response?.data?.message || error.message}`, 'red');
    if (error.response?.data) {
      log(`   Detalles: ${JSON.stringify(error.response.data)}`, 'gray');
    }
    return null;
  }
}

async function getClasses(token) {
  try {
    const response = await axios.get(`${API_URL}/classes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    log(`✗ Error obteniendo clases: ${error.response?.data?.message || error.message}`, 'red');
    return [];
  }
}

async function getInstructors(token) {
  try {
    const response = await axios.get(`${API_URL}/instructors`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    log(`✗ Error obteniendo instructores: ${error.response?.data?.message || error.message}`, 'red');
    return [];
  }
}

async function getReservations(token) {
  try {
    const response = await axios.get(`${API_URL}/reservations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    log(`✗ Error obteniendo reservaciones: ${error.response?.data?.message || error.message}`, 'red');
    return [];
  }
}

async function getPayments(token) {
  try {
    const response = await axios.get(`${API_URL}/payments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    log(`✗ Error obteniendo pagos: ${error.response?.data?.message || error.message}`, 'red');
    return [];
  }
}

async function verifySchoolAdmin(email, password, schoolName, expectedClasses, expectedInstructors) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`VERIFICANDO: ${email} (${schoolName})`, 'cyan');
  log('='.repeat(60), 'cyan');

  const token = await login(email, password);
  if (!token) return false;

  log('✓ Login exitoso', 'green');

  // Verificar clases
  const classes = await getClasses(token);
  log(`\n📚 Clases obtenidas: ${classes.length}`, 'white');

  if (classes.length !== expectedClasses) {
    log(`✗ ERROR: Esperaba ${expectedClasses} clases, obtuvo ${classes.length}`, 'red');
    return false;
  }

  const schoolIds = [...new Set(classes.map(c => c.schoolId))];
  if (schoolIds.length > 1) {
    log(`✗ ERROR: Viendo clases de múltiples escuelas: ${schoolIds.join(', ')}`, 'red');
    return false;
  }

  classes.forEach(c => {
    log(`   - ${c.title} (School ID: ${c.schoolId})`, 'gray');
  });
  log(`✓ Todas las clases pertenecen a la misma escuela (ID: ${schoolIds[0]})`, 'green');

  // Verificar instructores
  const instructors = await getInstructors(token);
  log(`\n👨‍🏫 Instructores obtenidos: ${instructors.length}`, 'white');

  if (instructors.length !== expectedInstructors) {
    log(`✗ ERROR: Esperaba ${expectedInstructors} instructores, obtuvo ${instructors.length}`, 'red');
    return false;
  }

  const instructorSchoolIds = [...new Set(instructors.map(i => i.schoolId))];
  if (instructorSchoolIds.length > 1) {
    log(`✗ ERROR: Viendo instructores de múltiples escuelas: ${instructorSchoolIds.join(', ')}`, 'red');
    return false;
  }

  instructors.forEach(i => {
    log(`   - ${i.user.name} (School ID: ${i.schoolId})`, 'gray');
  });
  log(`✓ Todos los instructores pertenecen a la misma escuela (ID: ${instructorSchoolIds[0]})`, 'green');

  // Verificar que schoolId de clases e instructores coincidan
  if (schoolIds[0] !== instructorSchoolIds[0]) {
    log(`✗ ERROR: School ID de clases (${schoolIds[0]}) no coincide con instructores (${instructorSchoolIds[0]})`, 'red');
    return false;
  }

  log(`✓ Aislamiento correcto para ${schoolName}`, 'green');
  return true;
}

async function verifyInstructor(email, password, expectedSchoolId) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`VERIFICANDO: ${email} (Instructor)`, 'cyan');
  log('='.repeat(60), 'cyan');

  const token = await login(email, password);
  if (!token) return false;

  log('✓ Login exitoso', 'green');

  // Verificar instructores (debe ver solo su perfil)
  const instructors = await getInstructors(token);
  log(`\n👨‍🏫 Instructores obtenidos: ${instructors.length}`, 'white');

  if (instructors.length !== 1) {
    log(`✗ ERROR: Instructor debe ver solo su perfil, obtuvo ${instructors.length}`, 'red');
    return false;
  }

  const instructor = instructors[0];
  log(`   - ${instructor.user.name} (School ID: ${instructor.schoolId})`, 'gray');

  if (instructor.schoolId !== expectedSchoolId) {
    log(`✗ ERROR: School ID incorrecto. Esperaba ${expectedSchoolId}, obtuvo ${instructor.schoolId}`, 'red');
    return false;
  }

  log(`✓ Instructor ve solo su perfil de la escuela correcta (ID: ${expectedSchoolId})`, 'green');

  // Verificar clases (debe ver solo de su escuela)
  const classes = await getClasses(token);
  log(`\n📚 Clases obtenidas: ${classes.length}`, 'white');

  const schoolIds = [...new Set(classes.map(c => c.schoolId))];
  if (schoolIds.length > 1 || (schoolIds.length === 1 && schoolIds[0] !== expectedSchoolId)) {
    log(`✗ ERROR: Viendo clases de escuelas incorrectas: ${schoolIds.join(', ')}`, 'red');
    return false;
  }

  log(`✓ Instructor ve solo clases de su escuela (ID: ${expectedSchoolId})`, 'green');
  return true;
}

async function verifyStudent(email, password, expectedReservations) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`VERIFICANDO: ${email} (Estudiante)`, 'cyan');
  log('='.repeat(60), 'cyan');

  const token = await login(email, password);
  if (!token) return false;

  log('✓ Login exitoso', 'green');

  // Verificar clases (debe ver todas)
  const classes = await getClasses(token);
  log(`\n📚 Clases disponibles: ${classes.length}`, 'white');
  log(`   (Los estudiantes pueden ver todas las clases)`, 'gray');

  // Verificar reservaciones (debe ver solo las suyas)
  const reservations = await getReservations(token);
  log(`\n🎫 Reservaciones obtenidas: ${reservations.length}`, 'white');

  if (reservations.length !== expectedReservations) {
    log(`✗ ERROR: Esperaba ${expectedReservations} reservaciones, obtuvo ${reservations.length}`, 'red');
    return false;
  }

  reservations.forEach(r => {
    log(`   - Clase ID: ${r.classId}, Status: ${r.status}`, 'gray');
  });

  log(`✓ Estudiante ve solo sus ${expectedReservations} reservaciones`, 'green');
  return true;
}

async function verifyPayments(email, password, expectedPayments, expectedTotal) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`VERIFICANDO PAGOS: ${email}`, 'cyan');
  log('='.repeat(60), 'cyan');

  const token = await login(email, password);
  if (!token) return false;

  const payments = await getPayments(token);
  log(`\n💰 Pagos obtenidos: ${payments.length}`, 'white');

  if (payments.length !== expectedPayments) {
    log(`✗ ERROR: Esperaba ${expectedPayments} pagos, obtuvo ${payments.length}`, 'red');
    return false;
  }

  let total = 0;
  payments.forEach(p => {
    total += parseFloat(p.amount);
    log(`   - $${p.amount} (${p.status}) - Método: ${p.paymentMethod}`, 'gray');
  });

  if (Math.abs(total - expectedTotal) > 0.01) {
    log(`✗ ERROR: Total esperado $${expectedTotal}, obtuvo $${total}`, 'red');
    return false;
  }

  log(`✓ Total de pagos correcto: $${total}`, 'green');
  return true;
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║   VERIFICACIÓN DE AISLAMIENTO MULTI-TENANT                 ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');

  const results = [];

  // Test 1: Admin Lima
  results.push(await verifySchoolAdmin(
    'admin.lima@test.com',
    'password123',
    'Surf School Lima',
    4, // 4 clases
    2  // 2 instructores
  ));

  // Test 2: Admin Trujillo
  results.push(await verifySchoolAdmin(
    'admin.trujillo@test.com',
    'password123',
    'Surf School Trujillo',
    4, // 4 clases
    1  // 1 instructor
  ));

  // Test 3: Instructor Lima
  results.push(await verifyInstructor(
    'instructor1.lima@test.com',
    'password123',
    1 // School ID Lima
  ));

  // Test 4: Instructor Trujillo
  results.push(await verifyInstructor(
    'instructor1.trujillo@test.com',
    'password123',
    2 // School ID Trujillo
  ));

  // Test 5: Estudiante Lima
  results.push(await verifyStudent(
    'student1.lima@test.com',
    'password123',
    2 // 2 reservaciones
  ));

  // Test 6: Estudiante Trujillo
  results.push(await verifyStudent(
    'student1.trujillo@test.com',
    'password123',
    2 // 2 reservaciones
  ));

  // Test 7: Estudiante Independiente
  results.push(await verifyStudent(
    'student.independent@test.com',
    'password123',
    4 // 4 reservaciones
  ));

  // Test 8: Pagos Lima
  results.push(await verifyPayments(
    'admin.lima@test.com',
    'password123',
    3,   // 3 pagos
    185  // $185 total
  ));

  // Test 9: Pagos Trujillo
  results.push(await verifyPayments(
    'admin.trujillo@test.com',
    'password123',
    3,   // 3 pagos
    205  // $205 total
  ));

  // Resumen
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║   RESUMEN DE VERIFICACIÓN                                  ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');

  const passed = results.filter(r => r).length;
  const total = results.length;

  log(`\nTests ejecutados: ${total}`, 'white');
  log(`Tests exitosos: ${passed}`, passed === total ? 'green' : 'yellow');
  log(`Tests fallidos: ${total - passed}`, total - passed === 0 ? 'green' : 'red');

  if (passed === total) {
    log('\n✓ TODOS LOS TESTS PASARON - AISLAMIENTO CORRECTO', 'green');
  } else {
    log('\n✗ ALGUNOS TESTS FALLARON - REVISAR AISLAMIENTO', 'red');
  }

  log('');
}

main();
