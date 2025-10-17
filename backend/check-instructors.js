const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkInstructors() {
  try {
    await prisma.$connect();
    console.log('✓ Conectado a la base de datos\n');
    
    // Get all instructors
    const instructors = await prisma.instructor.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        school: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    console.log(`📋 INSTRUCTORES EN LA BASE DE DATOS (${instructors.length}):\n`);
    
    if (instructors.length === 0) {
      console.log('❌ No hay instructores registrados\n');
      console.log('💡 Necesitas crear un instructor. Ejemplo:');
      console.log('   1. Crear usuario con role INSTRUCTOR');
      console.log('   2. Crear registro en tabla Instructor con userId y schoolId');
    } else {
      instructors.forEach(instructor => {
        console.log(`👤 ${instructor.user.name}`);
        console.log(`   - Email: ${instructor.user.email}`);
        console.log(`   - User ID: ${instructor.userId}`);
        console.log(`   - Instructor ID: ${instructor.id}`);
        console.log(`   - School: ${instructor.school?.name || 'Sin escuela'} (ID: ${instructor.schoolId})`);
        console.log(`   - Role: ${instructor.user.role}`);
        console.log('');
      });
    }
    
    // Also check users with INSTRUCTOR role
    const instructorUsers = await prisma.user.findMany({
      where: { role: 'INSTRUCTOR' }
    });
    
    console.log(`\n👥 USUARIOS CON ROLE INSTRUCTOR (${instructorUsers.length}):\n`);
    instructorUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ID: ${user.id}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInstructors();
