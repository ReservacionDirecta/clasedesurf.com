// Script para verificar usuarios en la base de datos
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...\n');
    
    const users = await prisma.user.findMany({
      include: {
        instructor: {
          include: {
            school: true
          }
        }
      },
      orderBy: { id: 'asc' }
    });

    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
      return;
    }

    console.log(`✅ Encontrados ${users.length} usuarios:\n`);
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`${i + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password: ${user.password ? 'Sí' : 'No'}`);
      
      if (user.instructor) {
        console.log(`   Instructor: Sí (ID: ${user.instructor.id})`);
        console.log(`   Escuela: ${user.instructor.school?.name || 'Sin escuela'}`);
      } else {
        console.log(`   Instructor: No`);
      }
      
      // Verificar si es dueño de alguna escuela
      const ownedSchool = await prisma.school.findFirst({
        where: { ownerId: user.id }
      });
      if (ownedSchool) {
        console.log(`   Dueño de escuela: ${ownedSchool.name}`);
      }
      
      console.log('');
    }

    // Verificar escuelas
    console.log('🏫 Verificando escuelas...\n');
    const schools = await prisma.school.findMany({
      include: {
        owner: true,
        instructors: true
      }
    });

    schools.forEach((school, index) => {
      console.log(`${index + 1}. ${school.name}`);
      console.log(`   Dueño: ${school.owner?.name || 'Sin dueño'}`);
      console.log(`   Instructores: ${school.instructors.length}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();