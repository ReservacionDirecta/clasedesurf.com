// Script para debuggear el problema del instructor
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugInstructor() {
  try {
    console.log('🔍 Buscando instructor Gabriel Barrera...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'gbarrera@clasedesurf.com' },
      include: {
        instructor: {
          include: {
            school: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log('- ID:', user.id);
    console.log('- Nombre:', user.name);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- Password hash:', user.password ? user.password.substring(0, 20) + '...' : 'NULL');
    
    if (user.instructor) {
      console.log('✅ Perfil de instructor encontrado:');
      console.log('- Instructor ID:', user.instructor.id);
      console.log('- Escuela:', user.instructor.school?.name || 'Sin escuela');
      console.log('- Activo:', user.instructor.isActive);
    } else {
      console.log('❌ No tiene perfil de instructor');
    }

    // Probar la contraseña
    console.log('\n🔐 Probando contraseña...');
    const password = 'instruc123';
    
    if (user.password) {
      const isValid = await bcrypt.compare(password, user.password);
      console.log('- Contraseña válida:', isValid ? '✅ SÍ' : '❌ NO');
      
      if (!isValid) {
        console.log('- Hash almacenado:', user.password);
        console.log('- Contraseña probada:', password);
        
        // Generar un nuevo hash para comparar
        const newHash = await bcrypt.hash(password, 10);
        console.log('- Nuevo hash generado:', newHash);
        
        const testValid = await bcrypt.compare(password, newHash);
        console.log('- Nuevo hash válido:', testValid ? '✅ SÍ' : '❌ NO');
      }
    } else {
      console.log('❌ No hay contraseña almacenada');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugInstructor();