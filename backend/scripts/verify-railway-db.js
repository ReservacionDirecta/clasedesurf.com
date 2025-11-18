/**
 * Script para verificar la estructura de la base de datos de Railway
 * Verifica que todas las tablas y columnas estén correctamente configuradas
 */

const { PrismaClient } = require('@prisma/client');

// Priorizar el argumento de línea de comandos sobre la variable de entorno
const DATABASE_URL = process.argv[2] || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: Se requiere DATABASE_URL como argumento o variable de entorno');
  console.log('Uso: node scripts/verify-railway-db.js <DATABASE_URL>');
  process.exit(1);
}

console.log('🔗 URL de conexión recibida:', DATABASE_URL.replace(/:[^:@]+@/, ':****@'));

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function verifyDatabase() {
  console.log('🔍 Verificando estructura de la base de datos de Railway...\n');
  console.log(`📡 Conectando a: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`);

  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  try {
    // 1. Verificar conexión
    console.log('1️⃣ Verificando conexión...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa\n');
    results.passed.push('Conexión a la base de datos');

    // 2. Verificar tabla schools
    console.log('2️⃣ Verificando tabla schools...');
    const schoolColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'schools'
      ORDER BY ordinal_position;
    `;

    const requiredSchoolColumns = [
      'id', 'name', 'location', 'description', 'phone', 'email',
      'website', 'instagram', 'facebook', 'whatsapp', 'address',
      'logo', 'coverImage', 'foundedYear', 'rating', 'totalReviews',
      'ownerId', 'createdAt', 'updatedAt'
    ];

    const existingColumns = schoolColumns.map(col => col.column_name);
    
    console.log(`   Columnas encontradas: ${existingColumns.length}`);
    
    for (const col of requiredSchoolColumns) {
      if (existingColumns.includes(col)) {
        const colInfo = schoolColumns.find(c => c.column_name === col);
        console.log(`   ✅ ${col} (${colInfo.data_type}, nullable: ${colInfo.is_nullable})`);
        results.passed.push(`Tabla schools - columna ${col}`);
      } else {
        console.log(`   ❌ ${col} - NO ENCONTRADA`);
        results.failed.push(`Tabla schools - columna ${col} faltante`);
      }
    }

    // Verificar valores por defecto
    const ratingCol = schoolColumns.find(c => c.column_name === 'rating');
    const totalReviewsCol = schoolColumns.find(c => c.column_name === 'totalReviews');
    
    if (ratingCol && (!ratingCol.column_default || !ratingCol.column_default.includes('0'))) {
      console.log(`   ⚠️  rating no tiene default 0`);
      results.warnings.push('Tabla schools - rating sin default 0');
    }
    
    if (totalReviewsCol && (!totalReviewsCol.column_default || !totalReviewsCol.column_default.includes('0'))) {
      console.log(`   ⚠️  totalReviews no tiene default 0`);
      results.warnings.push('Tabla schools - totalReviews sin default 0');
    }

    console.log('');

    // 3. Verificar tabla school_reviews
    console.log('3️⃣ Verificando tabla school_reviews...');
    const reviewTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'school_reviews'
      );
    `;

    if (reviewTableExists[0].exists) {
      console.log('   ✅ Tabla school_reviews existe');
      results.passed.push('Tabla school_reviews existe');

      const reviewColumns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'school_reviews'
        ORDER BY ordinal_position;
      `;

      const requiredReviewColumns = ['id', 'schoolId', 'studentName', 'rating', 'comment', 'createdAt'];
      const existingReviewColumns = reviewColumns.map(col => col.column_name);

      for (const col of requiredReviewColumns) {
        if (existingReviewColumns.includes(col)) {
          const colInfo = reviewColumns.find(c => c.column_name === col);
          console.log(`   ✅ ${col} (${colInfo.data_type}, nullable: ${colInfo.is_nullable})`);
          results.passed.push(`Tabla school_reviews - columna ${col}`);
        } else {
          console.log(`   ❌ ${col} - NO ENCONTRADA`);
          results.failed.push(`Tabla school_reviews - columna ${col} faltante`);
        }
      }

      // Verificar foreign key
      const foreignKeys = await prisma.$queryRaw`
        SELECT
          tc.constraint_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = 'school_reviews'
          AND kcu.column_name = 'schoolId';
      `;

      if (foreignKeys.length > 0) {
        console.log(`   ✅ Foreign key schoolId -> schools.id existe`);
        results.passed.push('Tabla school_reviews - foreign key');
      } else {
        console.log(`   ❌ Foreign key schoolId -> schools.id NO ENCONTRADA`);
        results.failed.push('Tabla school_reviews - foreign key faltante');
      }
    } else {
      console.log('   ❌ Tabla school_reviews NO EXISTE');
      results.failed.push('Tabla school_reviews no existe');
    }

    console.log('');

    // 4. Verificar otras tablas importantes
    console.log('4️⃣ Verificando otras tablas importantes...');
    const importantTables = ['users', 'instructors', 'instructor_reviews', 'classes', 'reservations', 'payments'];
    
    for (const table of importantTables) {
      const exists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = ${table}
        );
      `;
      
      if (exists[0].exists) {
        console.log(`   ✅ Tabla ${table} existe`);
        results.passed.push(`Tabla ${table} existe`);
      } else {
        console.log(`   ❌ Tabla ${table} NO EXISTE`);
        results.failed.push(`Tabla ${table} no existe`);
      }
    }

    console.log('');

    // 5. Verificar datos de ejemplo
    console.log('5️⃣ Verificando datos de ejemplo...');
    try {
      const schoolCount = await prisma.school.count();
      console.log(`   📊 Total de escuelas: ${schoolCount}`);
      
      if (schoolCount > 0) {
        const sampleSchool = await prisma.school.findFirst({
          select: {
            id: true,
            name: true,
            foundedYear: true,
            rating: true,
            totalReviews: true
          }
        });
        
        if (sampleSchool) {
          console.log(`   📝 Escuela de ejemplo:`);
          console.log(`      ID: ${sampleSchool.id}`);
          console.log(`      Nombre: ${sampleSchool.name}`);
          console.log(`      Año de fundación: ${sampleSchool.foundedYear ?? 'No definido'}`);
          console.log(`      Calificación: ${sampleSchool.rating}`);
          console.log(`      Total reseñas: ${sampleSchool.totalReviews}`);
        }
      }
    } catch (err) {
      console.log(`   ⚠️  Error al verificar datos: ${err.message}`);
      results.warnings.push(`Error al verificar datos: ${err.message}`);
    }

    console.log('');

    // 6. Resumen
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 RESUMEN DE VERIFICACIÓN');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Pruebas pasadas: ${results.passed.length}`);
    console.log(`❌ Pruebas fallidas: ${results.failed.length}`);
    console.log(`⚠️  Advertencias: ${results.warnings.length}`);
    console.log('');

    if (results.failed.length > 0) {
      console.log('❌ ERRORES ENCONTRADOS:');
      results.failed.forEach(error => console.log(`   - ${error}`));
      console.log('');
      console.log('💡 SOLUCIÓN: Ejecuta el script update-railway-db.sql para corregir los problemas');
    }

    if (results.warnings.length > 0) {
      console.log('⚠️  ADVERTENCIAS:');
      results.warnings.forEach(warning => console.log(`   - ${warning}`));
    }

    if (results.failed.length === 0 && results.warnings.length === 0) {
      console.log('🎉 ¡Todas las verificaciones pasaron exitosamente!');
      console.log('✅ La base de datos está correctamente configurada');
    }

    console.log('═══════════════════════════════════════════════════════\n');

    process.exit(results.failed.length > 0 ? 1 : 0);

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar verificación
verifyDatabase();

