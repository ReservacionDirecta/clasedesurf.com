#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const RAILWAY_DB_URL = 'postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway';

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

// Mapear tipos de Prisma a PostgreSQL
function prismaToPgType(prismaType) {
  const mapping = {
    'Int': 'integer',
    'String': 'text',
    'Boolean': 'boolean',
    'DateTime': 'timestamp without time zone',
    'Float': 'double precision',
    'Json': 'jsonb'
  };
  return mapping[prismaType] || prismaType;
}

// Extraer modelos del schema.prisma
function parsePrismaSchema(schemaContent) {
  const models = {};
  const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
  let match;

  while ((match = modelRegex.exec(schemaContent)) !== null) {
    const modelName = match[1];
    const modelBody = match[2];
    const fields = {};

    // Extraer campos
    const fieldMatches = modelBody.matchAll(/(\w+)\s+(\S+)(?:\s+@[^\n]+)*/g);

    for (const fieldMatch of fieldMatches) {
      const fieldName = fieldMatch[1];
      const fieldType = fieldMatch[2];
      const fieldDef = fieldMatch[0];

      // Verificar si es nullable
      const isOptional = fieldType.endsWith('?');
      const type = isOptional ? fieldType.slice(0, -1) : fieldType;

      // Verificar si tiene default
      const hasDefault = fieldDef.includes('@default');

      fields[fieldName] = {
        type: type,
        nullable: isOptional,
        hasDefault: hasDefault
      };
    }

    // Obtener nombre de tabla desde @@map
    const mapMatch = modelBody.match(/@@map\("(\w+)"\)/);
    const tableName = mapMatch ? mapMatch[1] : modelName.toLowerCase() + 's';

    models[tableName] = {
      modelName: modelName,
      fields: fields
    };
  }

  return models;
}

async function main() {
  try {
    console.log('🔍 Verificación detallada de schema Railway\n');
    console.log('='.repeat(70));

    // Leer schema local
    const schemaPath = path.join(__dirname, '../backend/prisma/schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    const localModels = parsePrismaSchema(schemaContent);

    // Conectar a Railway
    const dbConfig = parsePostgresUrl(RAILWAY_DB_URL);
    const client = new Client(dbConfig);
    await client.connect();
    console.log('✅ Conectado a Railway\n');

    // Verificar cada tabla
    let allMatch = true;
    for (const [tableName, modelInfo] of Object.entries(localModels)) {
      console.log(`\n📋 Verificando tabla: ${tableName}`);
      console.log('-'.repeat(70));

      try {
        // Obtener columnas de Railway
        const result = await client.query(`
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            udt_name
          FROM information_schema.columns
          WHERE table_schema = 'public' 
          AND table_name = $1
          ORDER BY ordinal_position;
        `, [tableName]);

        if (result.rows.length === 0) {
          console.log(`   ❌ Tabla ${tableName} NO EXISTE en Railway`);
          allMatch = false;
          continue;
        }

        const railwayColumns = {};
        result.rows.forEach(col => {
          railwayColumns[col.column_name] = {
            type: col.data_type,
            nullable: col.is_nullable === 'YES',
            default: col.column_default,
            udt: col.udt_name
          };
        });

        // Comparar con schema local
        let tableMatch = true;
        for (const [fieldName, fieldInfo] of Object.entries(modelInfo.fields)) {
          const railwayCol = railwayColumns[fieldName];

          if (!railwayCol) {
            console.log(`   ⚠️  Columna faltante: ${fieldName}`);
            tableMatch = false;
            allMatch = false;
          } else {
            // Verificar nullable
            if (railwayCol.nullable !== fieldInfo.nullable) {
              console.log(`   ⚠️  ${fieldName}: nullable mismatch (Railway: ${railwayCol.nullable}, Local: ${fieldInfo.nullable})`);
              tableMatch = false;
            }
          }
        }

        // Verificar columnas extra en Railway
        for (const colName of Object.keys(railwayColumns)) {
          if (!modelInfo.fields[colName] && colName !== 'id') {
            console.log(`   ℹ️  Columna adicional en Railway: ${colName}`);
          }
        }

        if (tableMatch) {
          console.log(`   ✅ Tabla ${tableName} coincide con schema local`);
        }

      } catch (error) {
        console.log(`   ❌ Error verificando ${tableName}: ${error.message}`);
        allMatch = false;
      }
    }

    console.log('\n' + '='.repeat(70));
    if (allMatch) {
      console.log('\n✅ El schema de Railway coincide completamente con el schema local');
    } else {
      console.log('\n⚠️  Se encontraron diferencias. Revisa los detalles arriba.');
      console.log('\n💡 Para sincronizar:');
      console.log('   cd backend');
      console.log(`   $env:DATABASE_URL="${RAILWAY_DB_URL}"`);
      console.log('   npx prisma db push');
    }

    await client.end();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();

