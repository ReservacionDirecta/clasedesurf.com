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

function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${API_URL}${endpoint}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function testRateLimit() {
  console.log('');
  log('============================================', 'cyan');
  log('   TEST DE RATE LIMITER', 'cyan');
  log('============================================', 'cyan');
  console.log('');
  
  log(`Probando: ${API_URL}`, 'white');
  console.log('');
  
  try {
    // Hacer una petición de prueba
    log('Haciendo petición de prueba...', 'yellow');
    const response = await makeRequest('/api/auth/login');
    
    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    
    // Mostrar headers de rate limit
    console.log('');
    log('Headers de Rate Limit:', 'cyan');
    
    if (response.headers['ratelimit-limit']) {
      log(`  Límite: ${response.headers['ratelimit-limit']} peticiones`, 'white');
    }
    
    if (response.headers['ratelimit-remaining']) {
      log(`  Restantes: ${response.headers['ratelimit-remaining']}`, 'white');
    }
    
    if (response.headers['ratelimit-reset']) {
      const resetTime = new Date(parseInt(response.headers['ratelimit-reset']) * 1000);
      log(`  Reset: ${resetTime.toLocaleString()}`, 'white');
    }
    
    console.log('');
    
    if (response.status === 429) {
      log('⚠ RATE LIMIT ACTIVO - Demasiadas peticiones', 'red');
      log('Espera 15 minutos o usa una IP diferente', 'yellow');
    } else {
      log('✓ Rate limiter funcionando correctamente', 'green');
    }
    
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
  }
  
  console.log('');
  log('============================================', 'cyan');
  console.log('');
}

testRateLimit();
