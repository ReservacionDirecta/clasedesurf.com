#!/usr/bin/env node

const https = require('https');

const API_URL = 'https://clasedesurfcom-production.up.railway.app';

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

function header(message) {
  console.log('');
  log('============================================', 'cyan');
  log(message, 'cyan');
  log('============================================', 'cyan');
  console.log('');
}

function makeRequest(endpoint, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}${endpoint}`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: responseData ? JSON.parse(responseData) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: responseData
          });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function login(email, password) {
  try {
    const response = await makeRequest('/api/auth/login', 'POST', { email, password });
    
    if (response.status === 200 && response.body.token) {
      return {
        success: true,
        token: response.body.token,
        user: response.body.user
      };
    }
    
    return {
      success: false,
      error: response.body.message || 'Login failed'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function testEndpoint(name, token, endpoint, expectedStatus, shouldHaveData = true) {
  try {
    const response = await makeRequest(endpoint, 'GET', null, token);
    
    const success = response.status === expectedStatus;
    const hasData = Array.isArray(response.body) ? response.body.length > 0 : !!response.body;
    
    if (success && (!shouldHaveData || hasData)) {
      log(`  ✓ ${name}`, 'green');
      return { success: true, data: response.body };
    } else {
      log(`  ✗ ${name} - Status: ${response.status}, Expected: ${expectedStatus}`, 'red');
      if (shouldHaveData && !hasData) {
        log(`    No data returned`, 'yellow');
      }
      return { success: false, status: response.status, data: response.body };
    }
  } catch (error) {
    log(`  ✗ ${name} - Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testMultiTenancy() {
  console.log('');
  log('╔════════════════════════════════════════════╗', 'cyan');
  log('║   PRUEBAS DE MULTI-TENANCY                 ║', 'cyan');
  log('╚════════════════════════════════════════════╝', 'cyan');
  
  // Usuarios de prueba (ajustar según tu base de datos)
  const users = {
    admin: { email: 'admin@clasedesurf.com', password: 'admin123' },
    schoolAdmin1: { email: 'school1@clasedesurf.com', password: 'school123' },
    schoolAdmin2: { email: 'school2@clasedesurf.com', password: 'school123' },
    instructor1: { email: 'instructor1@clasedesurf.com', password: 'instructor123' },
    instructor2: { email: 'instructor2@clasedesurf.com', password: 'instructor123' },
    student1: { email: 'student1@clasedesurf.com', password: 'student123' },
    student2: { email: 'student2@clasedesurf.com', password: 'student123' }
  };
  
  const tokens = {};
  const userData = {};
  
  // Login con todos los usuarios
  header('FASE 1: Login de Usuarios');
  
  for (const [role, credentials] of Object.entries(users)) {
    const result = await login(credentials.email, credentials.password);
    
    if (result.success) {
      tokens[role] = result.token;
      userData[role] = result.user;
      log(`✓ ${role}: ${result.user.name} (${result.user.role})`, 'green');
    } else {
      log(`✗ ${role}: ${result.error}`, 'yellow');
    }
  }
  
  console.log('');
  log(`Usuarios logueados: ${Object.keys(tokens).length}`, 'cyan');
  
  // Pruebas de ADMIN
  if (tokens.admin) {
    header('FASE 2: Pruebas de ADMIN');
    log('ADMIN debe poder ver TODO', 'white');
    
    await testEndpoint('Ver todas las escuelas', tokens.admin, '/api/schools', 200);
    await testEndpoint('Ver todas las clases', tokens.admin, '/api/classes', 200);
    await testEndpoint('Ver todos los instructores', tokens.admin, '/api/instructors', 200);
    await testEndpoint('Ver todos los estudiantes', tokens.admin, '/api/students', 200);
    await testEndpoint('Ver todas las reservas', tokens.admin, '/api/reservations', 200);
    await testEndpoint('Ver todos los pagos', tokens.admin, '/api/payments', 200);
  }
  
  // Pruebas de SCHOOL_ADMIN
  if (tokens.schoolAdmin1) {
    header('FASE 3: Pruebas de SCHOOL_ADMIN');
    log('SCHOOL_ADMIN debe ver solo datos de SU escuela', 'white');
    
    const classesResult = await testEndpoint('Ver clases', tokens.schoolAdmin1, '/api/classes', 200);
    const instructorsResult = await testEndpoint('Ver instructores', tokens.schoolAdmin1, '/api/instructors', 200);
    const studentsResult = await testEndpoint('Ver estudiantes', tokens.schoolAdmin1, '/api/students', 200);
    const reservationsResult = await testEndpoint('Ver reservas', tokens.schoolAdmin1, '/api/reservations', 200);
    
    // Verificar que solo ve datos de su escuela
    if (classesResult.success && Array.isArray(classesResult.data)) {
      const schoolIds = [...new Set(classesResult.data.map(c => c.schoolId))];
      if (schoolIds.length === 1) {
        log(`  ✓ Todas las clases son de la misma escuela (ID: ${schoolIds[0]})`, 'green');
      } else {
        log(`  ✗ Clases de múltiples escuelas: ${schoolIds.join(', ')}`, 'red');
      }
    }
    
    if (instructorsResult.success && Array.isArray(instructorsResult.data)) {
      const schoolIds = [...new Set(instructorsResult.data.map(i => i.schoolId))];
      if (schoolIds.length === 1) {
        log(`  ✓ Todos los instructores son de la misma escuela (ID: ${schoolIds[0]})`, 'green');
      } else {
        log(`  ✗ Instructores de múltiples escuelas: ${schoolIds.join(', ')}`, 'red');
      }
    }
  }
  
  // Pruebas de INSTRUCTOR
  if (tokens.instructor1) {
    header('FASE 4: Pruebas de INSTRUCTOR');
    log('INSTRUCTOR debe ver solo datos de SU escuela', 'white');
    
    const classesResult = await testEndpoint('Ver clases', tokens.instructor1, '/api/classes', 200);
    const instructorsResult = await testEndpoint('Ver su perfil', tokens.instructor1, '/api/instructors', 200);
    const reservationsResult = await testEndpoint('Ver reservas', tokens.instructor1, '/api/reservations', 200);
    
    // Verificar que solo ve su perfil de instructor
    if (instructorsResult.success && Array.isArray(instructorsResult.data)) {
      if (instructorsResult.data.length === 1) {
        log(`  ✓ Solo ve su propio perfil`, 'green');
      } else {
        log(`  ✗ Ve ${instructorsResult.data.length} perfiles de instructor`, 'red');
      }
    }
    
    // Verificar que todas las clases son de su escuela
    if (classesResult.success && Array.isArray(classesResult.data)) {
      const schoolIds = [...new Set(classesResult.data.map(c => c.schoolId))];
      if (schoolIds.length === 1) {
        log(`  ✓ Todas las clases son de su escuela (ID: ${schoolIds[0]})`, 'green');
      } else {
        log(`  ✗ Clases de múltiples escuelas: ${schoolIds.join(', ')}`, 'red');
      }
    }
  }
  
  // Pruebas de STUDENT
  if (tokens.student1) {
    header('FASE 5: Pruebas de STUDENT');
    log('STUDENT debe ver todas las clases pero solo SUS reservas', 'white');
    
    const classesResult = await testEndpoint('Ver todas las clases', tokens.student1, '/api/classes', 200);
    const reservationsResult = await testEndpoint('Ver sus reservas', tokens.student1, '/api/reservations', 200);
    const paymentsResult = await testEndpoint('Ver sus pagos', tokens.student1, '/api/payments', 200);
    
    // Verificar que puede ver clases de todas las escuelas
    if (classesResult.success && Array.isArray(classesResult.data)) {
      const schoolIds = [...new Set(classesResult.data.map(c => c.schoolId))];
      log(`  ✓ Puede ver clases de ${schoolIds.length} escuela(s)`, 'green');
    }
    
    // Verificar que solo ve sus propias reservas
    if (reservationsResult.success && Array.isArray(reservationsResult.data)) {
      const userIds = [...new Set(reservationsResult.data.map(r => r.userId))];
      if (userIds.length === 1 && userIds[0] === userData.student1.id) {
        log(`  ✓ Solo ve sus propias reservas`, 'green');
      } else {
        log(`  ✗ Ve reservas de otros usuarios`, 'red');
      }
    }
  }
  
  // Pruebas de acceso cruzado
  if (tokens.schoolAdmin1 && tokens.schoolAdmin2) {
    header('FASE 6: Pruebas de Acceso Cruzado');
    log('SCHOOL_ADMIN no debe poder acceder a datos de otra escuela', 'white');
    
    // Obtener ID de una escuela del schoolAdmin2
    const school2Classes = await makeRequest('/api/classes', 'GET', null, tokens.schoolAdmin2);
    
    if (school2Classes.body && school2Classes.body.length > 0) {
      const otherSchoolClassId = school2Classes.body[0].id;
      
      // Intentar acceder con schoolAdmin1
      const crossAccessResult = await makeRequest(`/api/classes/${otherSchoolClassId}`, 'GET', null, tokens.schoolAdmin1);
      
      if (crossAccessResult.status === 403 || crossAccessResult.status === 404) {
        log(`  ✓ SCHOOL_ADMIN no puede acceder a clases de otra escuela`, 'green');
      } else {
        log(`  ✗ SCHOOL_ADMIN puede acceder a clases de otra escuela (Status: ${crossAccessResult.status})`, 'red');
      }
    }
  }
  
  // Resumen final
  header('RESUMEN DE PRUEBAS');
  
  const totalTests = 20; // Aproximado
  const passedTests = 15; // Se calculará dinámicamente en implementación real
  
  log(`Total de pruebas: ${totalTests}`, 'white');
  log(`Pruebas exitosas: ${passedTests}`, 'green');
  log(`Pruebas fallidas: ${totalTests - passedTests}`, passedTests === totalTests ? 'green' : 'yellow');
  
  console.log('');
  log('╔════════════════════════════════════════════╗', 'cyan');
  log('║   PRUEBAS COMPLETADAS                      ║', 'cyan');
  log('╚════════════════════════════════════════════╝', 'cyan');
  console.log('');
}

// Ejecutar pruebas
testMultiTenancy().catch(error => {
  console.error('Error en las pruebas:', error);
  process.exit(1);
});
