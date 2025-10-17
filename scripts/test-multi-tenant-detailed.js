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
  gray: '\x1b[90m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
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
            body: responseData ? JSON.parse(responseData) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
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
    error: response.body?.message || 'Login failed',
    status: response.status
  };
}

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }
  
  async test(name, fn) {
    try {
      const result = await fn();
      if (result) {
        log(`  ✓ ${name}`, 'green');
        this.passed++;
      } else {
        log(`  ✗ ${name}`, 'red');
        this.failed++;
      }
      return result;
    } catch (error) {
      log(`  ✗ ${name} - Error: ${error.message}`, 'red');
      this.failed++;
      return false;
    }
  }
  
  summary() {
    console.log('');
    log('═══════════════════════════════════════════', 'cyan');
    log(`Total: ${this.passed + this.failed} | Passed: ${this.passed} | Failed: ${this.failed}`, 'white');
    
    if (this.failed === 0) {
      log('✓ TODAS LAS PRUEBAS PASARON', 'green');
    } else {
      log(`✗ ${this.failed} PRUEBAS FALLARON`, 'red');
    }
    log('═══════════════════════════════════════════', 'cyan');
  }
}

async function main() {
  console.log('');
  log('╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║   PRUEBAS DETALLADAS DE MULTI-TENANCY                  ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  console.log('');
  
  const runner = new TestRunner();
  
  // Credenciales de prueba (basadas en datos reales de Railway)
  const credentials = {
    admin: { email: 'admin@surfschool.com', password: 'password123' },
    schoolAdmin: { email: 'yerctech@gmail.com', password: 'admin123' },
    instructor: { email: 'carlos.mendoza@limasurf.com', password: 'password123' },
    student: { email: 'prueba@gmail.com', password: 'admin123' }
  };
  
  // Login
  log('FASE 1: Autenticación', 'cyan');
  log('─────────────────────────────────────────────', 'gray');
  
  const tokens = {};
  const users = {};
  
  for (const [role, creds] of Object.entries(credentials)) {
    const result = await login(creds.email, creds.password);
    if (result.success) {
      tokens[role] = result.token;
      users[role] = result.user;
      log(`✓ ${role}: ${result.user.name} (${result.user.role})`, 'green');
    } else {
      log(`✗ ${role}: ${result.error} (Status: ${result.status})`, 'yellow');
    }
  }
  
  console.log('');
  
  // Pruebas de ADMIN
  if (tokens.admin) {
    log('FASE 2: Pruebas de ADMIN', 'cyan');
    log('─────────────────────────────────────────────', 'gray');
    log('Expectativa: ADMIN debe ver TODOS los datos', 'white');
    console.log('');
    
    await runner.test('Ver todas las escuelas', async () => {
      const res = await makeRequest('/api/schools', 'GET', null, tokens.admin);
      return res.status === 200 && Array.isArray(res.body) && res.body.length > 0;
    });
    
    await runner.test('Ver todas las clases', async () => {
      const res = await makeRequest('/api/classes', 'GET', null, tokens.admin);
      return res.status === 200 && Array.isArray(res.body);
    });
    
    await runner.test('Ver todos los instructores', async () => {
      const res = await makeRequest('/api/instructors', 'GET', null, tokens.admin);
      return res.status === 200 && Array.isArray(res.body);
    });
    
    await runner.test('Ver todos los estudiantes', async () => {
      const res = await makeRequest('/api/students', 'GET', null, tokens.admin);
      return res.status === 200 && Array.isArray(res.body);
    });
    
    await runner.test('Ver todas las reservas', async () => {
      const res = await makeRequest('/api/reservations', 'GET', null, tokens.admin);
      return res.status === 200 && Array.isArray(res.body);
    });
    
    console.log('');
  }
  
  // Pruebas de SCHOOL_ADMIN
  if (tokens.schoolAdmin) {
    log('FASE 3: Pruebas de SCHOOL_ADMIN', 'cyan');
    log('─────────────────────────────────────────────', 'gray');
    log('Expectativa: Solo datos de SU escuela', 'white');
    console.log('');
    
    let schoolId = null;
    
    await runner.test('Ver clases de su escuela', async () => {
      const res = await makeRequest('/api/classes', 'GET', null, tokens.schoolAdmin);
      if (res.status === 200 && Array.isArray(res.body)) {
        const schoolIds = [...new Set(res.body.map(c => c.schoolId))];
        if (schoolIds.length > 0) {
          schoolId = schoolIds[0];
        }
        // Debe tener solo una escuela
        return schoolIds.length <= 1;
      }
      return false;
    });
    
    await runner.test('Ver instructores de su escuela', async () => {
      const res = await makeRequest('/api/instructors', 'GET', null, tokens.schoolAdmin);
      if (res.status === 200 && Array.isArray(res.body)) {
        const schoolIds = [...new Set(res.body.map(i => i.schoolId))];
        // Todos deben ser de la misma escuela
        return schoolIds.length <= 1 && (schoolIds.length === 0 || schoolIds[0] === schoolId);
      }
      return false;
    });
    
    await runner.test('Ver estudiantes de su escuela', async () => {
      const res = await makeRequest('/api/students', 'GET', null, tokens.schoolAdmin);
      if (res.status === 200 && Array.isArray(res.body)) {
        const schoolIds = [...new Set(res.body.map(s => s.schoolId).filter(id => id !== null))];
        // Todos deben ser de la misma escuela o sin escuela
        return schoolIds.length <= 1 && (schoolIds.length === 0 || schoolIds[0] === schoolId);
      }
      return false;
    });
    
    await runner.test('Ver reservas de su escuela', async () => {
      const res = await makeRequest('/api/reservations', 'GET', null, tokens.schoolAdmin);
      if (res.status === 200 && Array.isArray(res.body)) {
        const schoolIds = [...new Set(res.body.map(r => r.class?.schoolId).filter(id => id))];
        // Todas las reservas deben ser de clases de su escuela
        return schoolIds.length <= 1 && (schoolIds.length === 0 || schoolIds[0] === schoolId);
      }
      return false;
    });
    
    console.log('');
  }
  
  // Pruebas de INSTRUCTOR
  if (tokens.instructor) {
    log('FASE 4: Pruebas de INSTRUCTOR', 'cyan');
    log('─────────────────────────────────────────────', 'gray');
    log('Expectativa: Solo datos de SU escuela', 'white');
    console.log('');
    
    let instructorSchoolId = null;
    
    await runner.test('Ver solo su perfil de instructor', async () => {
      const res = await makeRequest('/api/instructors', 'GET', null, tokens.instructor);
      if (res.status === 200 && Array.isArray(res.body)) {
        // Debe ver solo su propio perfil
        const isOwnProfile = res.body.length === 1 && res.body[0].userId === users.instructor.id;
        if (isOwnProfile) {
          instructorSchoolId = res.body[0].schoolId;
        }
        return isOwnProfile;
      }
      return false;
    });
    
    await runner.test('Ver clases de su escuela', async () => {
      const res = await makeRequest('/api/classes', 'GET', null, tokens.instructor);
      if (res.status === 200 && Array.isArray(res.body)) {
        const schoolIds = [...new Set(res.body.map(c => c.schoolId))];
        // Todas las clases deben ser de su escuela
        return schoolIds.length <= 1 && (schoolIds.length === 0 || schoolIds[0] === instructorSchoolId);
      }
      return false;
    });
    
    await runner.test('Ver reservas de su escuela', async () => {
      const res = await makeRequest('/api/reservations', 'GET', null, tokens.instructor);
      if (res.status === 200 && Array.isArray(res.body)) {
        const schoolIds = [...new Set(res.body.map(r => r.class?.schoolId).filter(id => id))];
        // Todas las reservas deben ser de su escuela
        return schoolIds.length <= 1 && (schoolIds.length === 0 || schoolIds[0] === instructorSchoolId);
      }
      return false;
    });
    
    console.log('');
  }
  
  // Pruebas de STUDENT
  if (tokens.student) {
    log('FASE 5: Pruebas de STUDENT', 'cyan');
    log('─────────────────────────────────────────────', 'gray');
    log('Expectativa: Todas las clases, solo SUS reservas', 'white');
    console.log('');
    
    await runner.test('Ver todas las clases disponibles', async () => {
      const res = await makeRequest('/api/classes', 'GET', null, tokens.student);
      // Estudiante debe poder ver clases de todas las escuelas
      return res.status === 200 && Array.isArray(res.body);
    });
    
    await runner.test('Ver solo sus propias reservas', async () => {
      const res = await makeRequest('/api/reservations', 'GET', null, tokens.student);
      if (res.status === 200 && Array.isArray(res.body)) {
        const userIds = [...new Set(res.body.map(r => r.userId))];
        // Todas las reservas deben ser del estudiante
        return userIds.length <= 1 && (userIds.length === 0 || userIds[0] === users.student.id);
      }
      return false;
    });
    
    await runner.test('Ver solo sus propios pagos', async () => {
      const res = await makeRequest('/api/payments', 'GET', null, tokens.student);
      if (res.status === 200 && Array.isArray(res.body)) {
        const userIds = [...new Set(res.body.map(p => p.reservation?.userId).filter(id => id))];
        // Todos los pagos deben ser del estudiante
        return userIds.length <= 1 && (userIds.length === 0 || userIds[0] === users.student.id);
      }
      return false;
    });
    
    console.log('');
  }
  
  // Pruebas de acceso denegado
  if (tokens.student) {
    log('FASE 6: Pruebas de Acceso Denegado', 'cyan');
    log('─────────────────────────────────────────────', 'gray');
    log('Expectativa: STUDENT no debe acceder a endpoints de admin', 'white');
    console.log('');
    
    await runner.test('No puede ver lista de instructores', async () => {
      const res = await makeRequest('/api/instructors', 'GET', null, tokens.student);
      // Debe ser 403 (Forbidden) o 401 (Unauthorized)
      return res.status === 403 || res.status === 401;
    });
    
    await runner.test('No puede ver lista de estudiantes', async () => {
      const res = await makeRequest('/api/students', 'GET', null, tokens.student);
      // Debe ser 403 o devolver solo su propio perfil
      if (res.status === 200 && Array.isArray(res.body)) {
        return res.body.length <= 1 && (res.body.length === 0 || res.body[0].userId === users.student.id);
      }
      return res.status === 403 || res.status === 401;
    });
    
    console.log('');
  }
  
  // Resumen
  runner.summary();
  
  console.log('');
  log('Nota: Algunas pruebas pueden fallar si no hay datos en la base de datos', 'yellow');
  log('o si las credenciales de prueba no existen.', 'yellow');
  console.log('');
}

main().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
