#!/usr/bin/env node

const { Client } = require('pg');
const { execSync } = require('child_process');
const path = require('path');

// Configuración
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

const RAILWAY_URL = 'postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  white: '\x1b[37m'
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

async function testConnection(config, name) {
  const client = new Client(config);
  try {
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    log(`  ✓ Conexión exitosa a ${name}`, 'green');
    return true;
  } catch (error) {
    log(`  ✗ Error conectando a ${name}: ${error.message}`, 'red');
    return false;
  }
}

async function cleanRailway() {
  header('PASO 1: Limpiando Railway');
  
  const client = new Client(RAILWAY_CONFIG);
  
  try {
    await client.connect();
    log('Conectado a Railway...', 'yellow');
    
    const cleanSQL = `
      DROP TABLE IF EXISTS refresh_tokens CASCADE;
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS reservations CASCADE;
      DROP TABLE IF EXISTS classes CASCADE;
      DROP TABLE IF EXISTS instructor_reviews CASCADE;
      DROP TABLE IF EXISTS instructors CASCADE;
      DROP TABLE IF EXISTS students CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS schools CASCADE;
      DROP TYPE IF EXISTS "UserRole" CASCADE;
      DROP TYPE IF EXISTS "ClassLevel" CASCADE;
      DROP TYPE IF EXISTS "ReservationStatus" CASCADE;
      DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
      DROP TYPE IF EXISTS "InstructorRole" CASCADE;
      DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;
    `;
    
    await client.query(cleanSQL);
    log('✓ Railway limpiado exitosamente', 'green');
    
  } catch (error) {
    log(`✗ Error limpiando Railway: ${error.message}`, 'red');
    throw error;
  } finally {
    await client.end();
  }
}

async function applyPrismaSchema() {
  header('PASO 2: Aplicando esquema Prisma a Railway');
  
  try {
    log('Ejecutando migraciones de Prisma...', 'yellow');
    
    process.env.DATABASE_URL = RAILWAY_URL;
    execSync('npx prisma migrate deploy', {
      cwd: path.join(__dirname, '..', 'backend'),
      stdio: 'inherit'
    });
    
    log('✓ Esquema aplicado correctamente', 'green');
    
  } catch (error) {
    log(`✗ Error aplicando esquema: ${error.message}`, 'red');
    throw error;
  }
}

async function migrateData() {
  header('PASO 3: Migrando datos');
  
  const localClient = new Client(LOCAL_CONFIG);
  const railwayClient = new Client(RAILWAY_CONFIG);
  
  try {
    await localClient.connect();
    await railwayClient.connect();
    
    log('Conectado a ambas bases de datos...', 'yellow');
    
    // Orden de migración (respetando foreign keys)
    const tables = [
      'schools',
      'users',
      'instructors',
      'students',
      'classes',
      'reservations',
      'payments',
      'instructor_reviews',
      'refresh_tokens'
    ];
    
    for (const table of tables) {
      try {
        log(`\nMigrando ${table}...`, 'cyan');
        
        // Obtener datos de local
        const localData = await localClient.query(`SELECT * FROM ${table}`);
        
        if (localData.rows.length === 0) {
          log(`  (sin datos)`, 'gray');
          continue;
        }
        
        log(`  Encontrados ${localData.rows.length} registros`, 'white');
        
        // Insertar en Railway uno por uno
        let inserted = 0;
        let errors = 0;
        
        for (const row of localData.rows) {
          const columns = Object.keys(row);
          const values = columns.map((_, i) => `$${i + 1}`);
          const insertSQL = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')})`;
          
          try {
            await railwayClient.query(insertSQL, Object.values(row));
            inserted++;
          } catch (error) {
            errors++;
            if (errors === 1) {
              log(`  ⚠ Error: ${error.message}`, 'yellow');
            }
          }
        }
        
        log(`  ✓ Insertados: ${inserted}/${localData.rows.length}`, 'green');
        if (errors > 0) {
          log(`  ⚠ Errores: ${errors}`, 'yellow');
        }
        
      } catch (error) {
        log(`  ✗ Error en ${table}: ${error.message}`, 'red');
      }
    }
    
    log('\n✓ Migración de datos completada', 'green');
    
  } catch (error) {
    log(`✗ Error migrando datos: ${error.message}`, 'red');
    throw error;
  } finally {
    await localClient.end();
    await railwayClient.end();
  }
}

async function verifyMigration() {
  header('PASO 4: Verificando migración');
  
  const client = new Client(RAILWAY_CONFIG);
  
  try {
    await client.connect();
    
    // Contar registros por tabla
    const tables = ['users', 'schools', 'instructors', 'students', 'classes', 'reservations', 'payments', 'instructor_reviews'];
    
    log('Conteo de registros:', 'cyan');
    let totalRecords = 0;
    
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        const count = parseInt(result.rows[0].count);
        totalRecords += count;
        log(`  ${table.padEnd(25)} : ${count}`, 'white');
      } catch (error) {
        log(`  ${table.padEnd(25)} : Error`, 'red');
      }
    }
    
    console.log('');
    log(`TOTAL DE REGISTROS: ${totalRecords}`, 'cyan');
    log('\n✓ Verificación completada', 'green');
    
  } catch (error) {
    log(`✗ Error verificando: ${error.message}`, 'red');
  } finally {
    await client.end();
  }
}

async function main() {
  console.log('');
  log('╔════════════════════════════════════════════╗', 'cyan');
  log('║   MIGRACIÓN LOCAL → RAILWAY (v2)           ║', 'cyan');
  log('╚════════════════════════════════════════════╝', 'cyan');
  console.log('');
  
  try {
    // Verificar conexiones
    header('Verificando conexiones');
    const localOk = await testConnection(LOCAL_CONFIG, 'Base de datos local');
    const railwayOk = await testConnection(RAILWAY_CONFIG, 'Railway');
    
    if (!localOk || !railwayOk) {
      log('\n✗ No se puede continuar sin conexiones válidas', 'red');
      process.exit(1);
    }
    
    // Ejecutar migración
    await cleanRailway();
    await applyPrismaSchema();
    await migrateData();
    await verifyMigration();
    
    // Resumen final
    console.log('');
    log('╔════════════════════════════════════════════╗', 'green');
    log('║      ✓ MIGRACIÓN COMPLETADA                ║', 'green');
    log('╚════════════════════════════════════════════╝', 'green');
    console.log('');
    log('📋 SIGUIENTE PASOS:', 'yellow');
    console.log('');
    log('1. Actualiza las variables de entorno en Railway:', 'white');
    log(`   DATABASE_URL=${RAILWAY_URL}`, 'cyan');
    console.log('');
    log('2. Configura las demás variables:', 'white');
    log('   - JWT_SECRET', 'cyan');
    log('   - NEXTAUTH_SECRET', 'cyan');
    log('   - FRONTEND_URL', 'cyan');
    log('   - NEXT_PUBLIC_API_URL', 'cyan');
    console.log('');
    
  } catch (error) {
    log(`\n✗ Error en la migración: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
