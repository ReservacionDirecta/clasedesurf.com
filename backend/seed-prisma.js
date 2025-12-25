const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

async function main() {
  try {
    log('\n╔════════════════════════════════════════════╗', 'cyan');
    log('║   SEED DE DATOS DE PRUEBA (PRISMA)        ║', 'cyan');
    log('╚════════════════════════════════════════════╝', 'cyan');

    log('\n⚠️  ADVERTENCIA: Esto eliminará TODOS los datos actuales', 'red');
    log('Presiona Ctrl+C para cancelar o Enter para continuar...', 'yellow');

    await new Promise((resolve) => {
      process.stdin.once('data', () => resolve());
    });

    // 1. CLEAN DATABASE (using TRUNCATE CASCADE)
    log('\n🧹 Limpiando base de datos...', 'yellow');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE users, schools RESTART IDENTITY CASCADE');
    log('✓ Base de datos limpiada', 'green');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 2. CREATE ADMIN
    log('\n1. Creando ADMIN...', 'yellow');
    const admin = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        name: 'Admin Global',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    log(`✓ Admin creado: ${admin.email} (ID: ${admin.id})`, 'green');

    // 3. CREATE SCHOOL 1 (LIMA)
    log('\n2. Creando Escuela 1: Surf School Lima...', 'yellow');
    const schoolAdmin1 = await prisma.user.create({
      data: {
        email: 'admin.lima@test.com',
        name: 'Admin Lima',
        password: hashedPassword,
        role: 'SCHOOL_ADMIN',
      },
    });

    const school1 = await prisma.school.create({
      data: {
        name: 'Surf School Lima',
        location: 'Miraflores, Lima',
        description: 'Escuela de surf en Lima',
        ownerId: schoolAdmin1.id,
        coverImage: '/uploads/schools/surf-school-lima.jpg',
      },
    });
    log(`✓ Escuela creada: ${school1.name} (ID: ${school1.id})`, 'green');

    // Instructor 1
    const instructor1User = await prisma.user.create({
      data: {
        email: 'instructor1.lima@test.com',
        name: 'Carlos Lima',
        password: hashedPassword,
        role: 'INSTRUCTOR',
      },
    });

    const instructor1 = await prisma.instructor.create({
      data: {
        userId: instructor1User.id,
        schoolId: school1.id,
        bio: 'Instructor experimentado',
        yearsExperience: 5,
        specialties: ['Principiantes', 'Intermedio'],
        certifications: ['ISA Level 1'],
      },
    });
    log(`✓ Instructor creado: ${instructor1User.email}`, 'green');

    // Class 1
    const class1 = await prisma.class.create({
      data: {
        title: 'Clase Principiantes Lima',
        description: 'Clase para principiantes en Miraflores',
        duration: 120,
        capacity: 10,
        defaultPrice: 50.00,
        level: 'BEGINNER',
        schoolId: school1.id,
      },
    });
    log(`✓ Clase creada: ${class1.title} (ID: ${class1.id})`, 'green');

    // Student 1
    const student1User = await prisma.user.create({
      data: {
        email: 'student1.lima@test.com',
        name: 'Juan Estudiante Lima',
        password: hashedPassword,
        role: 'STUDENT',
      },
    });

    const student1 = await prisma.student.create({
      data: {
        userId: student1User.id,
        schoolId: school1.id,
        level: 'BEGINNER',
      },
    });
    log(`✓ Estudiante creado: ${student1User.email}`, 'green');

    // Reservation 1
    const reservation1 = await prisma.reservation.create({
      data: {
        userId: student1User.id,
        classId: class1.id,
        status: 'CONFIRMED',
      },
    });
    log(`✓ Reserva creada para ${student1User.email}`, 'green');

    // 4. CREATE SCHOOL 2 (TRUJILLO)
    log('\n3. Creando Escuela 2: Surf School Trujillo...', 'yellow');
    const schoolAdmin2 = await prisma.user.create({
      data: {
        email: 'admin.trujillo@test.com',
        name: 'Admin Trujillo',
        password: hashedPassword,
        role: 'SCHOOL_ADMIN',
      },
    });

    const school2 = await prisma.school.create({
      data: {
        name: 'Surf School Trujillo',
        location: 'Huanchaco, Trujillo',
        description: 'Escuela de surf en Trujillo',
        ownerId: schoolAdmin2.id,
        coverImage: '/uploads/schools/mancora-surf.jpg',
      },
    });
    log(`✓ Escuela creada: ${school2.name} (ID: ${school2.id})`, 'green');

    log('\n╔════════════════════════════════════════════╗', 'green');
    log('║   ✓ DATOS CREADOS EXITOSAMENTE             ║', 'green');
    log('╚════════════════════════════════════════════╝', 'green');
    log('');

  } catch (error) {
    log(`\n✗ Error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
