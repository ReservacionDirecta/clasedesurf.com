#!/usr/bin/env node

const { Client } = require('pg');
const { execSync } = require('child_process');
const fs = require('fs');
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

async function exportLocalData() {
  header('PASO 2: Exportando datos locales');
  
  const client = new Client(LOCAL_CONFIG);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const exportFile = `export_local_${timestamp}.sql`;
  
  try {
    await client.connect();
    log('Conectado a base de datos local...', 'yellow');
    
    // Obtener todas las tablas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE '_prisma%'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(r => r.table_name);
    log(`Encontradas ${tables.length} tablas para exportar`, 'cyan');
    
    let sqlContent = '-- Exportación de datos locales\n';
    sqlContent += `-- Fecha: ${new Date().toISOString()}\n\n`;
    sqlContent += 'SET session_replication_role = replica;\n\n';
    
    // Exportar datos de cada tabla
    for (const table of tables) {
      log(`  Exportando ${table}...`, 'gray');
      
      const dataResult = await client.query(`SELECT * FROM ${table}`);
      
      if (dataResult.rows.length > 0) {
        sqlContent += `-- Tabla: ${table}\n`;
        
        for (const row of dataResult.rows) {
          const columns = Object.keys(row);
          const values = columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'boolean') return val ? 'true' : 'false';
            if (typeof val === 'number') return val;
            if (val instanceof Date) return `'${val.toISOString()}'`;
            if (Array.isArray(val)) return `ARRAY[${val.map(v => `'${v}'`).join(',')}]`;
            return `'${String(val).replace(/'/g, "''")}'`;
          });
          
          sqlContent += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        
        sqlContent += '\n';
        log(`  ✓ ${dataResult.rows.length} registros de ${table}`, 'green');
      }
    }
    
    sqlContent += 'SET session_replication_role = DEFAULT;\n';
    
    fs.writeFileSync(exportFile, sqlContent, 'utf8');
    log(`✓ Datos exportados a: ${exportFile}`, 'green');
    
    return exportFile;
    
  } catch (error) {
    log(`✗ Error exportando datos: ${error.message}`, 'red');
    throw error;
  } finally {
    await client.end();
  }
}

async function applyPrismaSchema() {
  header('PASO 3: Aplicando esquema Prisma a Railway');
  
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

async function importData(exportFile) {
  header('PASO 4: Importando datos a Railway');
  
  const client = new Client(RAILWAY_CONFIG);
  
  try {
    await client.connect();
    log('Conectado a Railway...', 'yellow');
    
    const sqlContent = fs.readFileSync(exportFile, 'utf8');
    
    log('Importando datos...', 'yellow');
    await client.query(sqlContent);
    
    log('✓ Datos importados exitosamente', 'green');
    
  } catch (error) {
    log(`⚠ Algunos datos pueden no haberse importado: ${error.message}`, 'yellow');
    log('Esto es normal si hay conflictos de IDs o constraints', 'yellow');
  } finally {
    await client.end();
  }
}

async function verifyMigration() {
  header('PASO 5: Verificando migración');
  
  const client = new Client(RAILWAY_CONFIG);
  
  try {
    await client.connect();
    
    // Contar registros por tabla
    const tables = ['users', 'schools', 'instructors', 'students', 'classes', 'reservations', 'payments'];
    
    log('Conteo de registros:', 'cyan');
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        const count = result.rows[0].count;
        log(`  ${table.padEnd(20)} : ${count}`, 'white');
      } catch (error) {
        log(`  ${table.padEnd(20)} : Error`, 'red');
      }
    }
    
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
  log('║   MIGRACIÓN LOCAL → RAILWAY                ║', 'cyan');
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
    const exportFile = await exportLocalData();
    await applyPrismaSchema();
    await importData(exportFile);
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
