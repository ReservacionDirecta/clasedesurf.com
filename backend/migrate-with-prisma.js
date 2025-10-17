#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

// Configurar Prisma para ambas bases de datos
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:postgres@localhost:5432/clasedesurf.com'
    }
  }
});

const railwayPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb@hopper.proxy.rlwy.net:14816/railway'
    }
  }
});

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
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

async function migrateSchools() {
  log('\nMigrando schools...', 'cyan');
  const schools = await localPrisma.school.findMany();
  log(`  Encontrados ${schools.length} registros`, 'white');
  
  for (const school of schools) {
    try {
      await railwayPrisma.school.create({ data: school });
    } catch (error) {
      log(`  ⚠ Error: ${error.message}`, 'yellow');
    }
  }
  
  const count = await railwayPrisma.school.count();
  log(`  ✓ Insertados: ${count}`, 'green');
}

async function migrateUsers() {
  log('\nMigrando users...', 'cyan');
  const users = await localPrisma.user.findMany();
  log(`  Encontrados ${users.length} registros`, 'white');
  
  for (const user of users) {
    try {
      await railwayPrisma.user.create({ data: user });
    } catch (error) {
      log(`  ⚠ Error: ${error.message}`, 'yellow');
    }
  }
  
  const count = await railwayPrisma.user.count();
  log(`  ✓ Insertados: ${count}`, 'green');
}

async function migrateInstructors() {
  log('\nMigrando instructors...', 'cyan');
  const instructors = await localPrisma.instructor.findMany();
  log(`  Encontrados ${instructors.length} registros`, 'white');
  
  for (const instructor of instructors) {
    try {
      await railwayPrisma.instructor.create({ data: instructor });
    } catch (error) {
      log(`  ⚠ Error: ${error.message}`, 'yellow');
    }
  }
  
  const count = await railwayPrisma.instructor.count();
  log(`  ✓ Insertados: ${count}`, 'green');
}

async function migrateStudents() {
  log('\nMigrando students...', 'cyan');
  const students = await localPrisma.student.findMany();
  log(`  Encontrados ${students.length} registros`, 'white');
  
  for (const student of students) {
    try {
      await railwayPrisma.student.create({ data: student });
    } catch (error) {
      log(`  ⚠ Error: ${error.message}`, 'yellow');
    }
  }
  
  const count = await railwayPrisma.student.count();
  log(`  ✓ Insertados: ${count}`, 'green');
}

async function migrateClasses() {
  log('\nMigrando classes...', 'cyan');
  const classes = await localPrisma.class.findMany();
  log(`  Encontrados ${classes.length} registros`, 'white');
  
  for (const classItem of classes) {
    try {
      await railwayPrisma.class.create({ data: classItem });
    } catch (error) {
      log(`  ⚠ Error: ${error.message}`, 'yellow');
    }
  }
  
  const count = await railwayPrisma.class.count();
  log(`  ✓ Insertados: ${count}`, 'green');
}

async function migrateReservations() {
  log('\nMigrando reservations...', 'cyan');
  const reservations = await localPrisma.reservation.findMany();
  log(`  Encontrados ${reservations.length} registros`, 'white');
  
  for (const reservation of reservations) {
    try {
      await railwayPrisma.reservation.create({ data: reservation });
    } catch (error) {
      log(`  ⚠ Error: ${error.message}`, 'yellow');
    }
  }
  
  const count = await railwayPrisma.reservation.count();
  log(`  ✓ Insertados: ${count}`, 'green');
}

async function migratePayments() {
  log('\nMigrando payments...', 'cyan');
  const payments = await localPrisma.payment.findMany();
  log(`  Encontrados ${payments.length} registros`, 'white');
  
  for (const payment of payments) {
    try {
      await railwayPrisma.payment.create({ data: payment });
    } catch (error) {
      log(`  ⚠ Error: ${error.message}`, 'yellow');
    }
  }
  
  const count = await railwayPrisma.payment.count();
  log(`  ✓ Insertados: ${count}`, 'green');
}

async function migrateInstructorReviews() {
  log('\nMigrando instructor_reviews...', 'cyan');
  const reviews = await localPrisma.instructorReview.findMany();
  log(`  Encontrados ${reviews.length} registros`, 'white');
  
  for (const review of reviews) {
    try {
      await railwayPrisma.instructorReview.create({ data: review });
    } catch (error) {
      log(`  ⚠ Error: ${error.message}`, 'yellow');
    }
  }
  
  const count = await railwayPrisma.instructorReview.count();
  log(`  ✓ Insertados: ${count}`, 'green');
}

async function migrateRefreshTokens() {
  log('\nMigrando refresh_tokens...', 'cyan');
  const tokens = await localPrisma.refreshToken.findMany();
  log(`  Encontrados ${tokens.length} registros`, 'white');
  
  for (const token of tokens) {
    try {
      await railwayPrisma.refreshToken.create({ data: token });
    } catch (error) {
      log(`  ⚠ Error: ${error.message}`, 'yellow');
    }
  }
  
  const count = await railwayPrisma.refreshToken.count();
  log(`  ✓ Insertados: ${count}`, 'green');
}

async function verifyMigration() {
  header('Verificando migración');
  
  const counts = {
    users: await railwayPrisma.user.count(),
    schools: await railwayPrisma.school.count(),
    instructors: await railwayPrisma.instructor.count(),
    students: await railwayPrisma.student.count(),
    classes: await railwayPrisma.class.count(),
    reservations: await railwayPrisma.reservation.count(),
    payments: await railwayPrisma.payment.count(),
    reviews: await railwayPrisma.instructorReview.count(),
    tokens: await railwayPrisma.refreshToken.count()
  };
  
  log('Conteo de registros:', 'cyan');
  Object.entries(counts).forEach(([table, count]) => {
    log(`  ${table.padEnd(25)} : ${count}`, 'white');
  });
  
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log('');
  log(`TOTAL DE REGISTROS: ${total}`, 'cyan');
}

async function main() {
  console.log('');
  log('╔════════════════════════════════════════════╗', 'cyan');
  log('║   MIGRACIÓN CON PRISMA                     ║', 'cyan');
  log('╚════════════════════════════════════════════╝', 'cyan');
  
  try {
    header('Migrando datos');
    
    // Migrar en orden (respetando foreign keys)
    await migrateSchools();
    await migrateUsers();
    await migrateInstructors();
    await migrateStudents();
    await migrateClasses();
    await migrateReservations();
    await migratePayments();
    await migrateInstructorReviews();
    await migrateRefreshTokens();
    
    await verifyMigration();
    
    console.log('');
    log('╔════════════════════════════════════════════╗', 'green');
    log('║      ✓ MIGRACIÓN COMPLETADA                ║', 'green');
    log('╚════════════════════════════════════════════╝', 'green');
    console.log('');
    
  } catch (error) {
    log(`\n✗ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await localPrisma.$disconnect();
    await railwayPrisma.$disconnect();
  }
}

main();
