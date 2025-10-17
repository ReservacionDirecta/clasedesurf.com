import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Multi-Tenancy Seed...');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.payment.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.instructorReview.deleteMany();
  await prisma.instructor.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.class.deleteMany();
  await prisma.school.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // ============================================
  // ADMIN GLOBAL
  // ============================================
  console.log('👤 Creating global admin...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@surfschool.com',
      password: hashedPassword,
      name: 'Admin Global',
      role: 'ADMIN',
      age: 35,
      canSwim: true,
      phone: '+51999000001'
    }
  });

  // ============================================
  // ESCUELA 1: LIMA SURF ACADEMY
  // ============================================
  console.log('\n🏫 Creating School 1: Lima Surf Academy...');
  
  // School Admin 1
  const schoolAdmin1 = await prisma.user.create({
    data: {
      email: 'admin@limasurf.com',
      password: hashedPassword,
      name: 'Carlos Mendoza',
      role: 'SCHOOL_ADMIN',
      age: 38,
      canSwim: true,
      phone: '+51999000002'
    }
  });

  const limaSurf = await prisma.school.create({
    data: {
      name: 'Lima Surf Academy',
      location: 'Miraflores, Lima',
      description: 'Escuela de surf profesional con más de 15 años de experiencia',
      phone: '+51999111111',
      email: 'info@limasurf.com',
      website: 'https://limasurf.com',
      instagram: '@limasurf',
      address: 'Av. La Marina 123, Miraflores',
      ownerId: schoolAdmin1.id
    }
  });

  // Instructores Escuela 1
  const instructor1User = await prisma.user.create({
    data: {
      email: 'juan.perez@limasurf.com',
      password: hashedPassword,
      name: 'Juan Pérez',
      role: 'INSTRUCTOR',
      age: 30,
      canSwim: true,
      phone: '+51999111112'
    }
  });

  const instructor1 = await prisma.instructor.create({
    data: {
      userId: instructor1User.id,
      schoolId: limaSurf.id,
      bio: 'Instructor certificado ISA con 10 años de experiencia',
      yearsExperience: 10,
      specialties: ['Principiantes', 'Técnica avanzada'],
      certifications: ['ISA Level 1', 'Lifeguard'],
      rating: 4.8,
      totalReviews: 45,
      instructorRole: 'INSTRUCTOR'
    }
  });

  const instructor2User = await prisma.user.create({
    data: {
      email: 'maria.garcia@limasurf.com',
      password: hashedPassword,
      name: 'María García',
      role: 'INSTRUCTOR',
      age: 28,
      canSwim: true,
      phone: '+51999111113'
    }
  });

  const instructor2 = await prisma.instructor.create({
    data: {
      userId: instructor2User.id,
      schoolId: limaSurf.id,
      bio: 'Especialista en surf para niños y principiantes',
      yearsExperience: 7,
      specialties: ['Niños', 'Principiantes'],
      certifications: ['ISA Level 1', 'First Aid'],
      rating: 4.9,
      totalReviews: 38,
      instructorRole: 'INSTRUCTOR'
    }
  });

  // Head Coach Escuela 1
  const headCoach1User = await prisma.user.create({
    data: {
      email: 'roberto.silva@limasurf.com',
      password: hashedPassword,
      name: 'Roberto Silva',
      role: 'INSTRUCTOR',
      age: 42,
      canSwim: true,
      phone: '+51999111114'
    }
  });

  const headCoach1 = await prisma.instructor.create({
    data: {
      userId: headCoach1User.id,
      schoolId: limaSurf.id,
      bio: 'Head Coach con 20 años de experiencia en competencias',
      yearsExperience: 20,
      specialties: ['Competencia', 'Técnica avanzada', 'Coaching'],
      certifications: ['ISA Level 3', 'Lifeguard', 'First Aid'],
      rating: 5.0,
      totalReviews: 67,
      instructorRole: 'HEAD_COACH'
    }
  });

  // Clases Escuela 1
  console.log('📚 Creating classes for Lima Surf Academy...');
  const limaSurfClass1 = await prisma.class.create({
    data: {
      title: 'Surf para Principiantes',
      description: 'Clase introductoria al surf, técnicas básicas y seguridad',
      date: new Date('2025-10-20T09:00:00'),
      duration: 120,
      capacity: 8,
      price: 80,
      level: 'BEGINNER',
      instructor: 'Juan Pérez',
      schoolId: limaSurf.id
    }
  });

  const limaSurfClass2 = await prisma.class.create({
    data: {
      title: 'Surf Intermedio',
      description: 'Mejora tu técnica y aprende maniobras intermedias',
      date: new Date('2025-10-21T10:00:00'),
      duration: 120,
      capacity: 6,
      price: 100,
      level: 'INTERMEDIATE',
      instructor: 'Roberto Silva',
      schoolId: limaSurf.id
    }
  });

  const limaSurfClass3 = await prisma.class.create({
    data: {
      title: 'Surf Kids',
      description: 'Clases especiales para niños de 8 a 14 años',
      date: new Date('2025-10-22T11:00:00'),
      duration: 90,
      capacity: 10,
      price: 70,
      level: 'BEGINNER',
      instructor: 'María García',
      schoolId: limaSurf.id
    }
  });

  const limaSurfClass4 = await prisma.class.create({
    data: {
      title: 'Clase Privada Avanzada',
      description: 'Entrenamiento personalizado para surfistas avanzados',
      date: new Date('2025-10-23T14:00:00'),
      duration: 90,
      capacity: 2,
      price: 200,
      level: 'ADVANCED',
      instructor: 'Roberto Silva',
      schoolId: limaSurf.id
    }
  });

  // Estudiantes Escuela 1
  const student1_1 = await prisma.user.create({
    data: {
      email: 'pedro.lopez@gmail.com',
      password: hashedPassword,
      name: 'Pedro López',
      role: 'STUDENT',
      age: 25,
      canSwim: true,
      phone: '+51999222221',
      weight: 75,
      height: 175
    }
  });

  const student1_2 = await prisma.user.create({
    data: {
      email: 'ana.torres@gmail.com',
      password: hashedPassword,
      name: 'Ana Torres',
      role: 'STUDENT',
      age: 22,
      canSwim: true,
      phone: '+51999222222',
      weight: 60,
      height: 165
    }
  });

  const student1_3 = await prisma.user.create({
    data: {
      email: 'luis.ramirez@gmail.com',
      password: hashedPassword,
      name: 'Luis Ramírez',
      role: 'STUDENT',
      age: 12,
      canSwim: true,
      phone: '+51999222223',
      weight: 45,
      height: 150
    }
  });

  // Reservas Escuela 1
  console.log('📝 Creating reservations for Lima Surf Academy...');
  const reservation1_1 = await prisma.reservation.create({
    data: {
      userId: student1_1.id,
      classId: limaSurfClass1.id,
      status: 'CONFIRMED'
    }
  });

  await prisma.payment.create({
    data: {
      reservationId: reservation1_1.id,
      amount: 80,
      status: 'PAID',
      paymentMethod: 'CARD',
      paidAt: new Date()
    }
  });

  const reservation1_2 = await prisma.reservation.create({
    data: {
      userId: student1_2.id,
      classId: limaSurfClass2.id,
      status: 'CONFIRMED'
    }
  });

  await prisma.payment.create({
    data: {
      reservationId: reservation1_2.id,
      amount: 100,
      status: 'PAID',
      paymentMethod: 'CASH',
      paidAt: new Date()
    }
  });

  const reservation1_3 = await prisma.reservation.create({
    data: {
      userId: student1_3.id,
      classId: limaSurfClass3.id,
      status: 'CONFIRMED'
    }
  });

  await prisma.payment.create({
    data: {
      reservationId: reservation1_3.id,
      amount: 70,
      status: 'UNPAID',
      paymentMethod: 'TRANSFER'
    }
  });

  // ============================================
  // ESCUELA 2: BARRANCO SURF SCHOOL
  // ============================================
  console.log('\n🏫 Creating School 2: Barranco Surf School...');
  
  // School Admin 2
  const schoolAdmin2 = await prisma.user.create({
    data: {
      email: 'admin@barrancosurf.com',
      password: hashedPassword,
      name: 'Sofia Vargas',
      role: 'SCHOOL_ADMIN',
      age: 35,
      canSwim: true,
      phone: '+51999000003'
    }
  });

  const barrancoSurf = await prisma.school.create({
    data: {
      name: 'Barranco Surf School',
      location: 'Barranco, Lima',
      description: 'Escuela boutique de surf con enfoque personalizado',
      phone: '+51999333333',
      email: 'info@barrancosurf.com',
      website: 'https://barrancosurf.com',
      instagram: '@barrancosurf',
      address: 'Malecón Cisneros 456, Barranco',
      ownerId: schoolAdmin2.id
    }
  });

  // Instructores Escuela 2
  const instructor3User = await prisma.user.create({
    data: {
      email: 'diego.castro@barrancosurf.com',
      password: hashedPassword,
      name: 'Diego Castro',
      role: 'INSTRUCTOR',
      age: 32,
      canSwim: true,
      phone: '+51999333334'
    }
  });

  const instructor3 = await prisma.instructor.create({
    data: {
      userId: instructor3User.id,
      schoolId: barrancoSurf.id,
      bio: 'Instructor especializado en longboard y estilo clásico',
      yearsExperience: 12,
      specialties: ['Longboard', 'Estilo clásico', 'Intermedios'],
      certifications: ['ISA Level 2', 'Lifeguard'],
      rating: 4.7,
      totalReviews: 52,
      instructorRole: 'INSTRUCTOR'
    }
  });

  const instructor4User = await prisma.user.create({
    data: {
      email: 'camila.rojas@barrancosurf.com',
      password: hashedPassword,
      name: 'Camila Rojas',
      role: 'INSTRUCTOR',
      age: 26,
      canSwim: true,
      phone: '+51999333335'
    }
  });

  const instructor4 = await prisma.instructor.create({
    data: {
      userId: instructor4User.id,
      schoolId: barrancoSurf.id,
      bio: 'Instructora especializada en surf femenino y fitness acuático',
      yearsExperience: 6,
      specialties: ['Surf femenino', 'Fitness', 'Yoga surf'],
      certifications: ['ISA Level 1', 'Yoga Instructor'],
      rating: 4.9,
      totalReviews: 41,
      instructorRole: 'INSTRUCTOR'
    }
  });

  // Head Coach Escuela 2
  const headCoach2User = await prisma.user.create({
    data: {
      email: 'fernando.paz@barrancosurf.com',
      password: hashedPassword,
      name: 'Fernando Paz',
      role: 'INSTRUCTOR',
      age: 45,
      canSwim: true,
      phone: '+51999333336'
    }
  });

  const headCoach2 = await prisma.instructor.create({
    data: {
      userId: headCoach2User.id,
      schoolId: barrancoSurf.id,
      bio: 'Head Coach ex-profesional con experiencia internacional',
      yearsExperience: 25,
      specialties: ['Alto rendimiento', 'Competencia', 'Técnica profesional'],
      certifications: ['ISA Level 3', 'WSL Coach', 'Lifeguard'],
      rating: 5.0,
      totalReviews: 89,
      instructorRole: 'HEAD_COACH'
    }
  });

  // Clases Escuela 2
  console.log('📚 Creating classes for Barranco Surf School...');
  const barrancoClass1 = await prisma.class.create({
    data: {
      title: 'Longboard Session',
      description: 'Aprende el arte del longboard con estilo clásico',
      date: new Date('2025-10-20T08:00:00'),
      duration: 120,
      capacity: 6,
      price: 90,
      level: 'INTERMEDIATE',
      instructor: 'Diego Castro',
      schoolId: barrancoSurf.id
    }
  });

  const barrancoClass2 = await prisma.class.create({
    data: {
      title: 'Surf & Yoga',
      description: 'Combina surf con yoga para mejorar balance y flexibilidad',
      date: new Date('2025-10-21T07:00:00'),
      duration: 150,
      capacity: 8,
      price: 110,
      level: 'BEGINNER',
      instructor: 'Camila Rojas',
      schoolId: barrancoSurf.id
    }
  });

  const barrancoClass3 = await prisma.class.create({
    data: {
      title: 'Entrenamiento Competitivo',
      description: 'Preparación para competencias y alto rendimiento',
      date: new Date('2025-10-22T06:00:00'),
      duration: 180,
      capacity: 4,
      price: 180,
      level: 'ADVANCED',
      instructor: 'Fernando Paz',
      schoolId: barrancoSurf.id
    }
  });

  const barrancoClass4 = await prisma.class.create({
    data: {
      title: 'Surf para Mujeres',
      description: 'Clase exclusiva para mujeres en ambiente relajado',
      date: new Date('2025-10-23T09:00:00'),
      duration: 120,
      capacity: 8,
      price: 95,
      level: 'BEGINNER',
      instructor: 'Camila Rojas',
      schoolId: barrancoSurf.id
    }
  });

  // Estudiantes Escuela 2
  const student2_1 = await prisma.user.create({
    data: {
      email: 'carla.mendez@gmail.com',
      password: hashedPassword,
      name: 'Carla Méndez',
      role: 'STUDENT',
      age: 28,
      canSwim: true,
      phone: '+51999444441',
      weight: 58,
      height: 168
    }
  });

  const student2_2 = await prisma.user.create({
    data: {
      email: 'jorge.diaz@gmail.com',
      password: hashedPassword,
      name: 'Jorge Díaz',
      role: 'STUDENT',
      age: 35,
      canSwim: true,
      phone: '+51999444442',
      weight: 82,
      height: 180
    }
  });

  const student2_3 = await prisma.user.create({
    data: {
      email: 'patricia.luna@gmail.com',
      password: hashedPassword,
      name: 'Patricia Luna',
      role: 'STUDENT',
      age: 24,
      canSwim: true,
      phone: '+51999444443',
      weight: 55,
      height: 162
    }
  });

  // Reservas Escuela 2
  console.log('📝 Creating reservations for Barranco Surf School...');
  const reservation2_1 = await prisma.reservation.create({
    data: {
      userId: student2_1.id,
      classId: barrancoClass2.id,
      status: 'CONFIRMED'
    }
  });

  await prisma.payment.create({
    data: {
      reservationId: reservation2_1.id,
      amount: 110,
      status: 'PAID',
      paymentMethod: 'CARD',
      paidAt: new Date()
    }
  });

  const reservation2_2 = await prisma.reservation.create({
    data: {
      userId: student2_2.id,
      classId: barrancoClass3.id,
      status: 'CONFIRMED'
    }
  });

  await prisma.payment.create({
    data: {
      reservationId: reservation2_2.id,
      amount: 180,
      status: 'PAID',
      paymentMethod: 'TRANSFER',
      paidAt: new Date()
    }
  });

  const reservation2_3 = await prisma.reservation.create({
    data: {
      userId: student2_3.id,
      classId: barrancoClass4.id,
      status: 'PENDING'
    }
  });

  await prisma.payment.create({
    data: {
      reservationId: reservation2_3.id,
      amount: 95,
      status: 'UNPAID',
      paymentMethod: 'CASH'
    }
  });

  const reservation2_4 = await prisma.reservation.create({
    data: {
      userId: student2_1.id,
      classId: barrancoClass1.id,
      status: 'CONFIRMED'
    }
  });

  await prisma.payment.create({
    data: {
      reservationId: reservation2_4.id,
      amount: 90,
      status: 'PAID',
      paymentMethod: 'CARD',
      paidAt: new Date()
    }
  });

  console.log('\n✅ Multi-Tenancy Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 1 Global Admin');
  console.log('🏫 2 Schools:');
  console.log('   - Lima Surf Academy (Miraflores)');
  console.log('   - Barranco Surf School (Barranco)');
  console.log('👨‍💼 2 School Admins (1 per school)');
  console.log('👨‍🏫 6 Instructors total:');
  console.log('   - 2 Instructors + 1 Head Coach per school');
  console.log('📚 8 Classes total (4 per school)');
  console.log('👥 6 Students (3 per school)');
  console.log('📝 7 Reservations with payments');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n🔐 Test Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Global Admin:');
  console.log('   Email: admin@surfschool.com');
  console.log('   Password: password123');
  console.log('\nSchool 1 - Lima Surf Academy:');
  console.log('   Admin: admin@limasurf.com');
  console.log('   Instructor 1: juan.perez@limasurf.com');
  console.log('   Instructor 2: maria.garcia@limasurf.com');
  console.log('   Head Coach: roberto.silva@limasurf.com');
  console.log('   Student: pedro.lopez@gmail.com');
  console.log('\nSchool 2 - Barranco Surf School:');
  console.log('   Admin: admin@barrancosurf.com');
  console.log('   Instructor 1: diego.castro@barrancosurf.com');
  console.log('   Instructor 2: camila.rojas@barrancosurf.com');
  console.log('   Head Coach: fernando.paz@barrancosurf.com');
  console.log('   Student: carla.mendez@gmail.com');
  console.log('\n   All passwords: password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
