#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Schema local (desde el archivo schema.prisma)
const LOCAL_SCHEMA_PATH = path.join(__dirname, '../backend/prisma/schema.prisma');

// URL de Railway
const RAILWAY_DB_URL = 'postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway';

// Modelos esperados según el schema local
const EXPECTED_TABLES = [
  'users',
  'instructors',
  'instructor_reviews',
  'students',
  'schools',
  'beaches',
  'classes',
  'reservations',
  'payments',
  'refresh_tokens'
];

// Parsear URL de PostgreSQL
function parsePostgresUrl(url) {
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) throw new Error('Invalid PostgreSQL URL');
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5]
  };
}

async function getRailwaySchema() {
  console.log('🔍 Conectando a Railway...\n');
  
  const dbConfig = parsePostgresUrl(RAILWAY_DB_URL);
  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log('✅ Conectado a Railway\n');

    // Obtener todas las tablas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const tableNames = tablesResult.rows.map(t => t.table_name);

    // Obtener columnas de cada tabla
    const schema = {};
    for (const tableName of tableNames) {
      const columnsResult = await client.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);
      schema[tableName] = columnsResult.rows;
    }

    return { tableNames, schema };
  } catch (error) {
    console.error('❌ Error conectando a Railway:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

function readLocalSchema() {
  const schemaContent = fs.readFileSync(LOCAL_SCHEMA_PATH, 'utf-8');
  return schemaContent;
}

function compareSchemas(railwaySchema, localSchemaContent) {
  console.log('📊 Comparando schemas...\n');
  console.log('='.repeat(60));
  console.log('COMPARACIÓN DE SCHEMAS');
  console.log('='.repeat(60));
  console.log('');

  const railwayTables = railwaySchema.tableNames;
  const missingTables = EXPECTED_TABLES.filter(t => !railwayTables.includes(t));
  const extraTables = railwayTables.filter(t => !EXPECTED_TABLES.includes(t));

  // Verificar tablas faltantes
  if (missingTables.length > 0) {
    console.log('⚠️  TABLAS FALTANTES EN RAILWAY:');
    missingTables.forEach(table => {
      console.log(`   ❌ ${table}`);
    });
    console.log('');
  } else {
    console.log('✅ Todas las tablas esperadas existen en Railway\n');
  }

  // Verificar tablas extra
  if (extraTables.length > 0) {
    console.log('ℹ️  TABLAS ADICIONALES EN RAILWAY (no en schema local):');
    extraTables.forEach(table => {
      console.log(`   ➕ ${table}`);
    });
    console.log('');
  }

  // Verificar estructura de tablas principales
  console.log('📋 ESTRUCTURA DE TABLAS PRINCIPALES:');
  console.log('-'.repeat(60));

  const importantTables = ['users', 'classes', 'reservations', 'schools', 'payments'];
  
  for (const table of importantTables) {
    if (railwayTables.includes(table)) {
      const columns = railwaySchema.schema[table];
      console.log(`\n✅ ${table.toUpperCase()}`);
      console.log(`   Columnas (${columns.length}):`);
      columns.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        console.log(`     - ${col.column_name}: ${col.data_type}${length} ${nullable}${defaultVal}`);
      });
    } else {
      console.log(`\n❌ ${table.toUpperCase()} - NO EXISTE`);
    }
  }

  console.log('\n' + '='.repeat(60));
  
  // Resumen
  console.log('\n📊 RESUMEN:');
  console.log(`   Tablas en Railway: ${railwayTables.length}`);
  console.log(`   Tablas esperadas: ${EXPECTED_TABLES.length}`);
  console.log(`   Tablas faltantes: ${missingTables.length}`);
  console.log(`   Tablas adicionales: ${extraTables.length}`);

  if (missingTables.length === 0 && extraTables.length === 0) {
    console.log('\n✅ El schema de Railway coincide con el schema local');
  } else {
    console.log('\n⚠️  Hay diferencias entre Railway y el schema local');
    console.log('\n💡 Para sincronizar, ejecuta:');
    console.log('   cd backend');
    console.log('   $env:DATABASE_URL="' + RAILWAY_DB_URL + '"');
    console.log('   npx prisma db push');
  }
}

async function main() {
  try {
    // Leer schema local
    console.log('📖 Leyendo schema local...\n');
    const localSchema = readLocalSchema();
    console.log('✅ Schema local leído\n');

    // Obtener schema de Railway
    const railwaySchema = await getRailwaySchema();

    // Comparar
    compareSchemas(railwaySchema, localSchema);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();

