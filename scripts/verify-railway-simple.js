#!/usr/bin/env node

const { Client } = require('pg');

const RAILWAY_DB_URL = 'postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway';

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

async function main() {
  console.log('🔍 Verificación de Schema Railway\n');
  console.log('='.repeat(70));

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
      AND table_name NOT LIKE '_prisma%'
      ORDER BY table_name;
    `);

    console.log(`📊 Tablas encontradas: ${tablesResult.rows.length}\n`);
    
    const expectedTables = [
      'users', 'instructors', 'instructor_reviews', 'students', 
      'schools', 'beaches', 'classes', 'reservations', 
      'payments', 'refresh_tokens'
    ];

    console.log('TABLAS:');
    console.log('-'.repeat(70));
    
    for (const table of expectedTables) {
      const exists = tablesResult.rows.some(t => t.table_name === table);
      if (exists) {
        console.log(`  ✅ ${table}`);
      } else {
        console.log(`  ❌ ${table} - FALTANTE`);
      }
    }

    // Verificar estructura de tablas clave
    console.log('\n' + '='.repeat(70));
    console.log('ESTRUCTURA DE TABLAS CLAVE:\n');

    const keyTables = ['users', 'classes', 'reservations', 'schools', 'payments'];
    
    for (const tableName of keyTables) {
      const exists = tablesResult.rows.some(t => t.table_name === tableName);
      if (!exists) {
        console.log(`\n❌ ${tableName.toUpperCase()} - NO EXISTE`);
        continue;
      }

      const columnsResult = await client.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      console.log(`\n✅ ${tableName.toUpperCase()} (${columnsResult.rows.length} columnas):`);
      columnsResult.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ' [DEFAULT]' : '';
        console.log(`   - ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${nullable}${defaultVal}`);
      });
    }

    // Verificar constraints y relaciones
    console.log('\n' + '='.repeat(70));
    console.log('RELACIONES Y CONSTRAINTS:\n');

    const fkResult = await client.query(`
      SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name;
    `);

    if (fkResult.rows.length > 0) {
      console.log(`Foreign Keys encontrados: ${fkResult.rows.length}\n`);
      fkResult.rows.forEach(fk => {
        console.log(`   ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    } else {
      console.log('   ⚠️  No se encontraron Foreign Keys');
    }

    // Resumen final
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN:\n');
    console.log(`   Tablas en Railway: ${tablesResult.rows.length}`);
    console.log(`   Tablas esperadas: ${expectedTables.length}`);
    console.log(`   Foreign Keys: ${fkResult.rows.length}`);

    const missingTables = expectedTables.filter(t => 
      !tablesResult.rows.some(tr => tr.table_name === t)
    );

    if (missingTables.length === 0) {
      console.log('\n✅ Todas las tablas esperadas existen en Railway');
      console.log('\n💡 El schema parece estar correcto.');
      console.log('   Si hay problemas, ejecuta:');
      console.log('   cd backend');
      console.log(`   $env:DATABASE_URL="${RAILWAY_DB_URL}"`);
      console.log('   npx prisma db push');
    } else {
      console.log(`\n⚠️  Faltan ${missingTables.length} tablas:`);
      missingTables.forEach(t => console.log(`   - ${t}`));
      console.log('\n💡 Para crear las tablas faltantes:');
      console.log('   cd backend');
      console.log(`   $env:DATABASE_URL="${RAILWAY_DB_URL}"`);
      console.log('   npx prisma db push');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();

