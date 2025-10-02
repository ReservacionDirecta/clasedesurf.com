// Simple script to verify database data
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('🔍 Verificando datos en la base de datos...\n');

  // Check schools
  const schools = await prisma.school.findMany();
  console.log('🏫 Escuelas:');
  schools.forEach(s => console.log(`   - ID ${s.id}: ${s.name}`));

  // Check classes
  const classes = await prisma.class.findMany({ include: { school: true } });
  console.log('\n🏄 Clases:');
  classes.forEach(c => console.log(`   - ID ${c.id}: ${c.title} (Escuela: ${c.school.name}, ID: ${c.schoolId})`));

  // Check reservations
  const reservations = await prisma.reservation.findMany({ 
    include: { 
      user: true, 
      class: true,
      payment: true
    } 
  });
  console.log('\n📝 Reservas:');
  reservations.forEach(r => {
    console.log(`   - ID ${r.id}: ${r.user.name} → Clase ${r.classId} (${r.class.title})`);
    console.log(`     Estado: ${r.status}, Pago: ${r.payment?.status || 'N/A'}`);
  });

  console.log('\n📊 Resumen:');
  console.log(`   - Total Escuelas: ${schools.length}`);
  console.log(`   - Total Clases: ${classes.length}`);
  console.log(`   - Total Reservas: ${reservations.length}`);
  
  // Check Lima Surf Academy classes
  const limaSurfClasses = classes.filter(c => c.school.name === 'Lima Surf Academy');
  console.log(`   - Clases de Lima Surf Academy: ${limaSurfClasses.length}`);
  limaSurfClasses.forEach(c => {
    const classReservations = reservations.filter(r => r.classId === c.id);
    console.log(`     * ${c.title} (ID: ${c.id}) - ${classReservations.length} reservas`);
  });

  await prisma.$disconnect();
}

verify().catch(console.error);
