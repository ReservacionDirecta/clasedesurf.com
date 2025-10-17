#!/usr/bin/env node

const { Client } = require('pg');

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
  red: '\x1b[31m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  const client = new Client(RAILWAY_CONFIG);
  
  try {
    console.log('');
    log('╔════════════════════════════════════════════╗', 'cyan');
    log('║   VERIFICACIÓN DE USUARIOS Y DATOS         ║', 'cyan');
    log('╚════════════════════════════════════════════╝', 'cyan');
    console.log('');
    
    await client.connect();
    log('✓ Conectado a Railway', 'green');
    console.log('');
    
    // Ver usuarios por rol
    log('USUARIOS POR ROL:', 'cyan');
    log('═══════════════════════════════════════════', 'gray');
    
    const usersResult = await client.query(`
      SELECT id, email, name, role, 
             CASE 
               WHEN role = 'ADMIN' THEN '🔴'
               WHEN role = 'SCHOOL_ADMIN' THEN '🟡'
               WHEN role = 'INSTRUCTOR' THEN '🔵'
               WHEN role = 'STUDENT' THEN '🟢'
             END as icon
      FROM users 
      ORDER BY role, id
    `);
    
    const usersByRole = {};
    usersResult.rows.forEach(user => {
      if (!usersByRole[user.role]) {
        usersByRole[user.role] = [];
      }
      usersByRole[user.role].push(user);
    });
    
    for (const [role, users] of Object.entries(usersByRole)) {
      console.log('');
      log(`${role} (${users.length}):`, 'yellow');
      users.forEach(user => {
        log(`  ${user.icon} ID: ${user.id} | ${user.email} | ${user.name}`, 'white');
      });
    }
    
    // Ver escuelas
    console.log('');
    log('ESCUELAS:', 'cyan');
    log('═══════════════════════════════════════════', 'gray');
    
    const schoolsResult = await client.query(`
      SELECT s.id, s.name, s.location, s."ownerId",
             u.email as owner_email, u.name as owner_name
      FROM schools s
      LEFT JOIN users u ON s."ownerId" = u.id
      ORDER BY s.id
    `);
    
    schoolsResult.rows.forEach(school => {
      log(`  🏫 ID: ${school.id} | ${school.name} (${school.location})`, 'white');
      if (school.owner_email) {
        log(`     Owner: ${school.owner_name} (${school.owner_email})`, 'gray');
      }
    });
    
    // Ver instructores por escuela
    console.log('');
    log('INSTRUCTORES POR ESCUELA:', 'cyan');
    log('═══════════════════════════════════════════', 'gray');
    
    const instructorsResult = await client.query(`
      SELECT i.id, i."schoolId", i."userId",
             u.email, u.name,
             s.name as school_name
      FROM instructors i
      JOIN users u ON i."userId" = u.id
      JOIN schools s ON i."schoolId" = s.id
      ORDER BY i."schoolId", i.id
    `);
    
    const instructorsBySchool = {};
    instructorsResult.rows.forEach(instructor => {
      if (!instructorsBySchool[instructor.schoolId]) {
        instructorsBySchool[instructor.schoolId] = {
          schoolName: instructor.school_name,
          instructors: []
        };
      }
      instructorsBySchool[instructor.schoolId].instructors.push(instructor);
    });
    
    for (const [schoolId, data] of Object.entries(instructorsBySchool)) {
      console.log('');
      log(`  Escuela: ${data.schoolName} (ID: ${schoolId})`, 'yellow');
      data.instructors.forEach(instructor => {
        log(`    👨‍🏫 ${instructor.name} (${instructor.email})`, 'white');
      });
    }
    
    // Ver clases por escuela
    console.log('');
    log('CLASES POR ESCUELA:', 'cyan');
    log('═══════════════════════════════════════════', 'gray');
    
    const classesResult = await client.query(`
      SELECT c.id, c.title, c."schoolId", c.instructor,
             s.name as school_name,
             COUNT(r.id) as reservations_count
      FROM classes c
      JOIN schools s ON c."schoolId" = s.id
      LEFT JOIN reservations r ON c.id = r."classId" AND r.status != 'CANCELED'
      GROUP BY c.id, c.title, c."schoolId", c.instructor, s.name
      ORDER BY c."schoolId", c.id
    `);
    
    const classesBySchool = {};
    classesResult.rows.forEach(cls => {
      if (!classesBySchool[cls.schoolId]) {
        classesBySchool[cls.schoolId] = {
          schoolName: cls.school_name,
          classes: []
        };
      }
      classesBySchool[cls.schoolId].classes.push(cls);
    });
    
    for (const [schoolId, data] of Object.entries(classesBySchool)) {
      console.log('');
      log(`  Escuela: ${data.schoolName} (ID: ${schoolId})`, 'yellow');
      data.classes.forEach(cls => {
        log(`    📚 ${cls.title} | Instructor: ${cls.instructor || 'N/A'} | Reservas: ${cls.reservations_count}`, 'white');
      });
    }
    
    // Resumen de datos
    console.log('');
    log('RESUMEN DE DATOS:', 'cyan');
    log('═══════════════════════════════════════════', 'gray');
    
    const summary = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'ADMIN') as admins,
        (SELECT COUNT(*) FROM users WHERE role = 'SCHOOL_ADMIN') as school_admins,
        (SELECT COUNT(*) FROM users WHERE role = 'INSTRUCTOR') as instructors,
        (SELECT COUNT(*) FROM users WHERE role = 'STUDENT') as students,
        (SELECT COUNT(*) FROM schools) as schools,
        (SELECT COUNT(*) FROM classes) as classes,
        (SELECT COUNT(*) FROM reservations) as reservations,
        (SELECT COUNT(*) FROM payments) as payments
    `);
    
    const stats = summary.rows[0];
    console.log('');
    log(`  Total Usuarios: ${stats.total_users}`, 'white');
    log(`    - Admins: ${stats.admins}`, 'gray');
    log(`    - School Admins: ${stats.school_admins}`, 'gray');
    log(`    - Instructors: ${stats.instructors}`, 'gray');
    log(`    - Students: ${stats.students}`, 'gray');
    log(`  Escuelas: ${stats.schools}`, 'white');
    log(`  Clases: ${stats.classes}`, 'white');
    log(`  Reservas: ${stats.reservations}`, 'white');
    log(`  Pagos: ${stats.payments}`, 'white');
    
    // Sugerencias para pruebas
    console.log('');
    log('CREDENCIALES PARA PRUEBAS:', 'cyan');
    log('═══════════════════════════════════════════', 'gray');
    console.log('');
    
    if (usersByRole.ADMIN && usersByRole.ADMIN.length > 0) {
      const admin = usersByRole.ADMIN[0];
      log(`Admin:`, 'yellow');
      log(`  Email: ${admin.email}`, 'white');
      log(`  (Usa la contraseña que configuraste)`, 'gray');
    }
    
    if (usersByRole.SCHOOL_ADMIN && usersByRole.SCHOOL_ADMIN.length > 0) {
      const schoolAdmin = usersByRole.SCHOOL_ADMIN[0];
      log(`School Admin:`, 'yellow');
      log(`  Email: ${schoolAdmin.email}`, 'white');
      log(`  (Usa la contraseña que configuraste)`, 'gray');
    }
    
    if (usersByRole.INSTRUCTOR && usersByRole.INSTRUCTOR.length > 0) {
      const instructor = usersByRole.INSTRUCTOR[0];
      log(`Instructor:`, 'yellow');
      log(`  Email: ${instructor.email}`, 'white');
      log(`  (Usa la contraseña que configuraste)`, 'gray');
    }
    
    if (usersByRole.STUDENT && usersByRole.STUDENT.length > 0) {
      const student = usersByRole.STUDENT[0];
      log(`Student:`, 'yellow');
      log(`  Email: ${student.email}`, 'white');
      log(`  (Usa la contraseña que configuraste)`, 'gray');
    }
    
    console.log('');
    log('═══════════════════════════════════════════', 'cyan');
    console.log('');
    
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await client.end();
  }
}

main();
