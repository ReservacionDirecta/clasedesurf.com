#!/usr/bin/env node

const { Client } = require('pg');

const LOCAL_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'clasedesurf.com'
};

const RAILWAY_CONFIG = {
  host: 'hopper.proxy.rlwy.net',
  port: 14816,
  user: 'postgres',
  password: 'BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb',
  database: 'railway'
};

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testConnection(config, name) {
  const client = new Client(config);
  try {
    log(`\nProbando conexión a ${name}...`, 'yellow');
    await client.connect();
    const result = await client.query('SELECT version()');
    await client.end();
    log(`✓ Conexión exitosa a ${name}`, 'green');
    log(`  ${result.rows[0].version.split(',')[0]}`, 'cyan');
    return true;
  } catch (error) {
    log(`✗ Error conectando a ${name}`, 'red');
    log(`  ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  console.log('');
  log('============================================', 'cyan');
  log('   VERIFICACIÓN DE CONEXIONES', 'cyan');
  log('============================================', 'cyan');
  
  const localOk = await testConnection(LOCAL_CONFIG, 'Base de datos local');
  const railwayOk = await testConnection(RAILWAY_CONFIG, 'Railway');
  
  console.log('');
  log('============================================', 'cyan');
  
  if (localOk && railwayOk) {
    log('\n✓ TODAS LAS CONEXIONES OK', 'green');
    log('\nPuedes proceder con la migración:', 'white');
    log('  node scripts/migrate-to-railway.js', 'cyan');
    console.log('');
  } else {
    log('\n✗ HAY PROBLEMAS DE CONEXIÓN', 'red');
    console.log('');
    if (!localOk) {
      log('Base de datos local:', 'yellow');
      log('  - Verifica que Docker esté corriendo', 'white');
      log('  - Ejecuta: docker-compose up -d', 'cyan');
    }
    if (!railwayOk) {
      log('Railway:', 'yellow');
      log('  - Verifica tu conexión a internet', 'white');
      log('  - Verifica las credenciales', 'white');
    }
    console.log('');
    process.exit(1);
  }
}

main();
