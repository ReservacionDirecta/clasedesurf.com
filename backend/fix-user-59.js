const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUser59() {
  try {
    console.log('🔧 Corrigiendo usuario ID 59...');
    
    const user = await prisma.user.findUnique({
      where: { id: 59 },
      include: { instructor: true }
    });
    
    if (!user) {
      console.log('❌ Usuario ID 59 no encontrado');
      return;
    }
    
    console.log(`✅ Usuario encontrado: ${user.name} (${user.email})`);
    console.log(`   Tiene instructor: ${user.instructor ? 'SÍ' : 'NO'}`);
    
    if (user.instructor) {
      console.log('✅ El usuario ya tiene instructor asignado');
      return;
    }
    
    // Buscar una escuela
    const school = await prisma.school.findFirst();
    
    if (!school) {
      console.log('❌ No se encontró ninguna escuela');
      return;
    }
    
    console.log(`✅ Escuela encontrada: ${school.name} (ID: ${school.id})`);
    
    // Crear instructor para este usuario
    console.log('📝 Creando registro de instructor...');
    await prisma.instructor.create({
      data: {
        userId: user.id,
        schoolId: school.id,
        bio: 'Administrador de la escuela',
        yearsExperience: 5,
        specialties: ['Administración', 'Enseñanza'],
        certifications: ['Certificado de Administración'],
        instructorRole: 'HEAD_COACH'
      }
    });
    
    console.log(`✅ Instructor creado con schoolId: ${school.id}`);
    console.log('🎉 Corrección completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixUser59();
