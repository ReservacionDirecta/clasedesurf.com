#!/usr/bin/env node

const https = require('https');

const API_URL = 'https://clasedesurfcom-production.up.railway.app';

function makeRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}${endpoint}`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
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

async function testLogin(email, password) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Probando login: ${email}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const data = { email, password };
  console.log('Datos enviados:', JSON.stringify(data, null, 2));
  
  try {
    // Probar primero con el backend directo
    console.log('Intentando con backend directo...');
    let response = await makeRequest('/auth/login', 'POST', data);
    
    if (response.status === 404) {
      console.log('Backend directo no encontrado, probando con /api/auth/login...');
      response = await makeRequest('/api/auth/login', 'POST', data);
    }
    
    console.log(`Status: ${response.status}`);
    console.log('Respuesta:', JSON.stringify(response.body, null, 2));
    
    if (response.status === 200) {
      console.log('✓ Login exitoso');
      return true;
    } else {
      console.log('✗ Login fallido');
      return false;
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   DEBUG DE LOGIN                           ║');
  console.log('╚════════════════════════════════════════════╝');
  
  const users = [
    { email: 'admin@surfschool.com', password: 'password123' },
    { email: 'yerctech@gmail.com', password: 'admin123' },
    { email: 'carlos.mendoza@limasurf.com', password: 'password123' },
    { email: 'prueba@gmail.com', password: 'admin123' }
  ];
  
  for (const user of users) {
    await testLogin(user.email, user.password);
  }
  
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   DEBUG COMPLETADO                         ║');
  console.log('╚════════════════════════════════════════════╝\n');
}

main();
