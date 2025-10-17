#!/usr/bin/env node

const https = require('https');

const possibleUrls = [
  'https://clasedesurfcom-production.up.railway.app',
  'https://surfschool-backend-production.up.railway.app',
  'https://clasedesurf-backend-production.up.railway.app',
  'https://backend-production.up.railway.app'
];

function makeRequest(url, path) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url + path);
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname,
        method: 'GET',
        timeout: 5000
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          resolve({
            success: true,
            status: res.statusCode,
            body: data
          });
        });
      });
      
      req.on('error', () => {
        resolve({ success: false });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false });
      });
      
      req.end();
    } catch (error) {
      resolve({ success: false });
    }
  });
}

async function main() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   BUSCANDO URL DEL BACKEND                 ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  for (const url of possibleUrls) {
    console.log(`Probando: ${url}`);
    
    // Probar /health
    const healthResult = await makeRequest(url, '/health');
    if (healthResult.success && healthResult.status === 200) {
      console.log(`  ✓ /health responde (${healthResult.status})`);
      console.log(`  ✓ BACKEND ENCONTRADO: ${url}`);
      console.log(`  Respuesta:`, healthResult.body.substring(0, 100));
      return;
    }
    
    // Probar /api/health
    const apiHealthResult = await makeRequest(url, '/api/health');
    if (apiHealthResult.success && apiHealthResult.status === 200) {
      console.log(`  ✓ /api/health responde (${apiHealthResult.status})`);
      console.log(`  ✓ BACKEND ENCONTRADO: ${url}`);
      return;
    }
    
    // Probar /
    const rootResult = await makeRequest(url, '/');
    if (rootResult.success) {
      console.log(`  ⚠ Responde pero no es el backend (${rootResult.status})`);
      if (rootResult.body.includes('Backend API')) {
        console.log(`  ✓ BACKEND ENCONTRADO: ${url}`);
        return;
      }
    } else {
      console.log(`  ✗ No responde`);
    }
    
    console.log('');
  }
  
  console.log('✗ No se encontró el backend en ninguna URL conocida');
  console.log('\nPor favor verifica la URL del backend en Railway.');
}

main();
