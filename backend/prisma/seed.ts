import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.payment.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.class.deleteMany();
  await prisma.school.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Users
  console.log('👥 Creating users...');
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@surfschool.com',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      age: 35,
      canSwim: true,
      phone: '+5119876543'
    }
  });

  const schoolAdmin = await prisma.user.create({
    data: {
      email: 'schooladmin@surfschool.com',
      password: hashedPassword,
      name: 'School Administrator',
      role: 'SCHOOL_ADMIN',
      age: 40,
      canSwim: true,
      phone: '+5119876544'
    }
  });

  const student1 = await prisma.user.create({
    data: {
      email: 'student1@surfschool.com',
      password: hashedPassword,
      name: 'Alice Johnson',
      role: 'STUDENT',
      age: 28,
      canSwim: true,
      weight: 65,
      height: 170,
      phone: '+5119876545'
    }
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@surfschool.com',
      password: hashedPassword,
      name: 'Bob Williams',
      role: 'STUDENT',
      age: 35,
      canSwim: false,
      weight: 80,
      height: 180,
      phone: '+5119876546'
    }
  });

  const testUser = await prisma.user.create({
    data: {
      email: 'test@test.com',
      password: hashedPassword,
      name: 'Test User',
      role: 'STUDENT',
      age: 25,
      canSwim: true,
      weight: 70,
      height: 175,
      phone: '+5119876547'
    }
  });

  console.log('✅ Users created');

  // Create Schools
  console.log('🏫 Creating schools...');
  
  const limaSurfAcademy = await prisma.school.create({
    data: {
      name: 'Lima Surf Academy',
      location: 'Miraflores, Lima',
      description: 'Pioneering surf school in Lima with over 8 years of experience. We offer professional surf lessons for all levels with certified instructors and top-quality equipment.',
      email: 'contact@limasurf.com',
      phone: '+5112345678',
      website: 'https://limasurf.com',
      instagram: '@limasurfacademy',
      facebook: 'LimaSurfAcademy',
      whatsapp: '+5112345678',
      address: 'Av. Malecón de la Reserva 610, Miraflores, Lima'
    }
  });

  const waikikiSurfSchool = await prisma.school.create({
    data: {
      name: 'Waikiki Surf School',
      location: 'San Bartolo, Lima',
      description: 'Specializing in intermediate and advanced surf techniques with personalized attention and small groups.',
      email: 'info@waikikisurf.pe',
      phone: '+5118765432',
      website: 'https://waikikisurf.pe',
      instagram: '@waikikisurf',
      facebook: 'WaikikiSurfPeru',
      whatsapp: '+5118765432',
      address: 'Playa Waikiki, San Bartolo, Lima'
    }
  });

  console.log('✅ Schools created');

  // Create Classes
  console.log('🏄 Creating classes...');
  
  const class1 = await prisma.class.create({
    data: {
      title: 'Iniciación en Miraflores',
      description: 'Aprende surf en la icónica Playa Makaha. Clase perfecta para principiantes que quieren dar sus primeros pasos en el surf.',
      date: new Date('2025-01-15T08:00:00'),
      duration: 120,
      capacity: 8,
      price: 25,
      level: 'BEGINNER',
      instructor: 'Carlos Mendoza',
      schoolId: limaSurfAcademy.id
    }
  });

  const class2 = await prisma.class.create({
    data: {
      title: 'Intermedio en San Bartolo',
      description: 'Perfecciona tu técnica en Playa Waikiki. Para surfistas con experiencia básica que quieren mejorar.',
      date: new Date('2025-01-16T16:00:00'),
      duration: 120,
      capacity: 6,
      price: 35,
      level: 'INTERMEDIATE',
      instructor: 'Maria Rodriguez',
      schoolId: limaSurfAcademy.id
    }
  });

  const class3 = await prisma.class.create({
    data: {
      title: 'Avanzado en La Herradura',
      description: 'Para surfistas con experiencia. Técnicas avanzadas y maniobras complejas.',
      date: new Date('2025-01-17T09:00:00'),
      duration: 120,
      capacity: 4,
      price: 45,
      level: 'ADVANCED',
      instructor: 'Juan Perez',
      schoolId: limaSurfAcademy.id
    }
  });

  console.log('✅ Classes created');
  console.log(`   - Class 1 ID: ${class1.id} - ${class1.title}`);
  console.log(`   - Class 2 ID: ${class2.id} - ${class2.title}`);
  console.log(`   - Class 3 ID: ${class3.id} - ${class3.title}`);

  // Create Reservations
  console.log('📝 Creating reservations...');
  
  // Reservation 1: Alice - Clase 1 (Confirmada y Pagada)
  const reservation1 = await prisma.reservation.create({
    data: {
      userId: student1.id,
      classId: class1.id,
      status: 'CONFIRMED',
      specialRequest: 'Necesito tabla más grande, tengo experiencia previa en bodyboard'
    }
  });

  // Reservation 2: Bob - Clase 2 (Pendiente, sin pagar)
  const reservation2 = await prisma.reservation.create({
    data: {
      userId: student2.id,
      classId: class2.id,
      status: 'PENDING',
      specialRequest: 'Primera vez en el agua, necesito atención especial. No sé nadar muy bien.'
    }
  });

  // Reservation 3: Test User - Clase 1 (Confirmada, sin pagar)
  const reservation3 = await prisma.reservation.create({
    data: {
      userId: testUser.id,
      classId: class1.id,
      status: 'CONFIRMED',
      specialRequest: 'Prefiero clases por la mañana temprano'
    }
  });

  // Reservation 4: Alice - Clase 3 (Pagada)
  const reservation4 = await prisma.reservation.create({
    data: {
      userId: student1.id,
      classId: class3.id,
      status: 'PAID',
      specialRequest: 'Quiero practicar maniobras avanzadas'
    }
  });

  // Reservation 5: Test User - Clase 2 (Cancelada)
  const reservation5 = await prisma.reservation.create({
    data: {
      userId: testUser.id,
      classId: class2.id,
      status: 'CANCELED',
      specialRequest: 'Tuve que cancelar por motivos personales'
    }
  });

  console.log('✅ Reservations created');

  // Create Payments
  console.log('💳 Creating payments...');
  
  // Payment 1: Reservation 1 - Pagado con tarjeta
  await prisma.payment.create({
    data: {
      reservationId: reservation1.id,
      amount: 25,
      status: 'PAID',
      paymentMethod: 'credit_card',
      transactionId: 'txn_cc_001_2025',
      paidAt: new Date('2025-01-10T10:30:00')
    }
  });

  // Payment 2: Reservation 2 - No pagado
  await prisma.payment.create({
    data: {
      reservationId: reservation2.id,
      amount: 35,
      status: 'UNPAID',
      paymentMethod: null,
      transactionId: null
    }
  });

  // Payment 3: Reservation 3 - No pagado
  await prisma.payment.create({
    data: {
      reservationId: reservation3.id,
      amount: 25,
      status: 'UNPAID',
      paymentMethod: null,
      transactionId: null
    }
  });

  // Payment 4: Reservation 4 - Pagado en efectivo
  await prisma.payment.create({
    data: {
      reservationId: reservation4.id,
      amount: 45,
      status: 'PAID',
      paymentMethod: 'cash',
      transactionId: 'txn_cash_002_2025',
      paidAt: new Date('2025-01-12T14:00:00')
    }
  });

  // Payment 5: Reservation 5 - Reembolsado
  await prisma.payment.create({
    data: {
      reservationId: reservation5.id,
      amount: 35,
      status: 'REFUNDED',
      paymentMethod: 'credit_card',
      transactionId: 'txn_cc_003_2025_refund',
      paidAt: new Date('2025-01-11T09:00:00')
    }
  });

  console.log('✅ Payments created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👨‍💼 Admin:');
  console.log('   Email: admin@surfschool.com');
  console.log('   Password: password123');
  console.log('\n🏫 School Admin:');
  console.log('   Email: schooladmin@surfschool.com');
  console.log('   Password: password123');
  console.log('\n🏄 Students:');
  console.log('   Email: student1@surfschool.com (Alice - has confirmed reservation)');
  console.log('   Email: student2@surfschool.com (Bob - has pending reservation)');
  console.log('   Email: test@test.com (Clean user for testing)');
  console.log('   Password: password123 (for all)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
