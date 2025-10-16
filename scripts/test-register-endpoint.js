#!/usr/bin/env node

const https = require('https');

const API_URL = 'https://clasedesurfcom-production.up.railway.app';

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  white: '\x1b[37m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(endpoint, method, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}${endpoint}`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      }
    };
    
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
            body: JSON.parse(responseData)
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
    
    req.write(JSON.stringify(data));
    req.end();
  });
}

async function testRegister() {
  console.log('');
  log('============================================', 'cyan');
  log('   TEST DE REGISTRO DE INSTRUCTOR', 'cyan');
  log('============================================', 'cyan');
  console.log('');
  
  log(`API: ${API_URL}`, 'white');
  console.log('');
  
  // Datos de prueba para registrar un instructor
  const testData = {
    name: 'Test Instructor',
    email: `test-instructor-${Date.now()}@example.com`,
    password: 'password123',
    role: 'INSTRUCTOR'
  };
  
  log('Datos de prueba:', 'cyan');
  console.log(JSON.stringify(testData, null, 2));
  console.log('');
  
  try {
    log('Enviando petición...', 'yellow');
    const response = await makeRequest('/api/auth/register', 'POST', testData);
    
    console.log('');
    log(`Status: ${response.status}`, response.status === 201 ? 'green' : 'red');
    console.log('');
    
    if (response.status === 201) {
      log('✓ Registro exitoso', 'green');
      console.log('');
      log('Usuario creado:', 'cyan');
      console.log(JSON.stringify(response.body.user, null, 2));
    } else {
      log('✗ Error en el registro', 'red');
      console.log('');
      log('Respuesta del servidor:', 'yellow');
      console.log(JSON.stringify(response.body, null, 2));
    }
    
    // Mostrar headers de rate limit
    console.log('');
    log('Rate Limit Info:', 'cyan');
    if (response.headers['ratelimit-limit']) {
      log(`  Límite: ${response.headers['ratelimit-limit']}`, 'white');
    }
    if (response.headers['ratelimit-remaining']) {
      log(`  Restantes: ${response.headers['ratelimit-remaining']}`, 'white');
    }
    if (response.headers['ratelimit-reset']) {
      const resetTime = new Date(parseInt(response.headers['ratelimit-reset']) * 1000);
      log(`  Reset: ${resetTime.toLocaleString()}`, 'white');
    }
    
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    console.error(error);
  }
  
  console.log('');
  log('============================================', 'cyan');
  console.log('');
}

// Test con diferentes escenarios
async function runTests() {
  console.log('');
  log('╔════════════════════════════════════════════╗', 'cyan');
  log('║   PRUEBAS DE ENDPOINT DE REGISTRO          ║', 'cyan');
  log('╚════════════════════════════════════════════╝', 'cyan');
  
  // Test 1: Registro válido
  await testRegister();
  
  // Test 2: Registro sin nombre
  console.log('');
  log('TEST 2: Registro sin nombre', 'yellow');
  try {
    const response = await makeRequest('/api/auth/register', 'POST', {
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      role: 'INSTRUCTOR'
    });
    log(`Status: ${response.status}`, response.status === 400 ? 'yellow' : 'red');
    console.log(JSON.stringify(response.body, null, 2));
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
  }
  
  // Test 3: Registro sin email
  console.log('');
  log('TEST 3: Registro sin email', 'yellow');
  try {
    const response = await makeRequest('/api/auth/register', 'POST', {
      name: 'Test User',
      password: 'password123',
      role: 'INSTRUCTOR'
    });
    log(`Status: ${response.status}`, response.status === 400 ? 'yellow' : 'red');
    console.log(JSON.stringify(response.body, null, 2));
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
  }
  
  // Test 4: Registro con password corto
  console.log('');
  log('TEST 4: Registro con password corto', 'yellow');
  try {
    const response = await makeRequest('/api/auth/register', 'POST', {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: '123',
      role: 'INSTRUCTOR'
    });
    log(`Status: ${response.status}`, response.status === 400 ? 'yellow' : 'red');
    console.log(JSON.stringify(response.body, null, 2));
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
  }
  
  console.log('');
  log('╔════════════════════════════════════════════╗', 'cyan');
  log('║   PRUEBAS COMPLETADAS                      ║', 'cyan');
  log('╚════════════════════════════════════════════╝', 'cyan');
  console.log('');
}

runTests();
