const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixSchoolAdmin() {
  try {
    console.log('🔧 Corrigiendo School Admin...');
    
    // Buscar TODOS los usuarios con este email
    const allUsers = await prisma.user.findMany({
      where: { email: 'schooladmin@surfschool.com' },
      include: { instructor: true }
    });
    
    console.log(`📋 Encontrados ${allUsers.length} usuarios con este email:`);
    allUsers.forEach(u => {
      console.log(`   - ID: ${u.id}, Nombre: ${u.name}, Tiene instructor: ${u.instructor ? 'SÍ (schoolId: ' + u.instructor.schoolId + ')' : 'NO'}`);
    });
    
    // Usar el primer usuario encontrado
    const schoolAdmin = allUsers[0];
    
    if (!schoolAdmin) {
      console.log('❌ Usuario schooladmin@surfschool.com no encontrado');
      return;
    }
    
    console.log(`✅ Usuario encontrado: ${schoolAdmin.name} (ID: ${schoolAdmin.id})`);
    console.log(`   Tiene instructor: ${schoolAdmin.instructor ? 'Sí' : 'No'}`);
    
    // Buscar o crear una escuela
    let school = await prisma.school.findFirst();
    
    if (!school) {
      console.log('📝 Creando escuela...');
      school = await prisma.school.create({
        data: {
          name: 'Surf School Lima',
          location: 'Lima, Perú',
          description: 'Escuela de surf principal'
        }
      });
      console.log(`✅ Escuela creada: ${school.name} (ID: ${school.id})`);
    } else {
      console.log(`✅ Escuela encontrada: ${school.name} (ID: ${school.id})`);
    }
    
    // Crear o actualizar el registro de instructor
    if (schoolAdmin.instructor) {
      console.log('📝 Actualizando instructor existente...');
      await prisma.instructor.update({
        where: { id: schoolAdmin.instructor.id },
        data: { schoolId: school.id }
      });
      console.log(`✅ Instructor actualizado con schoolId: ${school.id}`);
    } else {
      console.log('📝 Creando registro de instructor...');
      await prisma.instructor.create({
        data: {
          userId: schoolAdmin.id,
          schoolId: school.id,
          bio: 'Administrador de la escuela',
          yearsExperience: 5,
          specialties: ['Administración', 'Enseñanza'],
          certifications: ['Certificado de Administración'],
          instructorRole: 'HEAD_COACH'
        }
      });
      console.log(`✅ Instructor creado con schoolId: ${school.id}`);
    }
    
    console.log('🎉 Corrección completada exitosamente!');
    console.log('\n📋 Ahora puedes ejecutar: node test-classes-api.js');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSchoolAdmin();
