#!/usr/bin/env node

const { Client } = require('pg');

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

async function main() {
  const client = new Client(LOCAL_CONFIG);
  
  try {
    console.log('');
    log('============================================', 'cyan');
    log('   VERIFICACIÓN DE BASE LOCAL', 'cyan');
    log('============================================', 'cyan');
    console.log('');
    
    await client.connect();
    log('✓ Conectado a base de datos local', 'green');
    console.log('');
    
    // Ver tablas
    log('TABLAS EXISTENTES:', 'cyan');
    log('==================', 'cyan');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length === 0) {
      log('  (No hay tablas)', 'yellow');
    } else {
      tablesResult.rows.forEach(row => {
        log(`  - ${row.table_name}`, 'white');
      });
    }
    
    console.log('');
    log('CONTEO DE REGISTROS:', 'cyan');
    log('====================', 'cyan');
    
    const tables = ['users', 'schools', 'instructors', 'students', 'classes', 'reservations', 'payments'];
    
    let totalRecords = 0;
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        const count = parseInt(result.rows[0].count);
        totalRecords += count;
        log(`  ${table.padEnd(20)} : ${count}`, 'white');
      } catch (error) {
        log(`  ${table.padEnd(20)} : (tabla no existe)`, 'gray');
      }
    }
    
    console.log('');
    log(`TOTAL DE REGISTROS: ${totalRecords}`, 'cyan');
    
    console.log('');
    log('============================================', 'cyan');
    
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
