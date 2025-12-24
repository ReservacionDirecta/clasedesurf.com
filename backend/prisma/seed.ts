import { PrismaClient, UserRole, ClassLevel, ReservationStatus, InstructorRole, SchoolStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.payment.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.classSession.deleteMany();
  await prisma.classSchedule.deleteMany();
  await prisma.class.deleteMany();
  await prisma.discountCode.deleteMany();
  await prisma.instructorReview.deleteMany();
  await prisma.schoolReview.deleteMany();
  await prisma.instructor.deleteMany();
  await prisma.student.deleteMany();
  await prisma.beach.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.school.deleteMany();
  await prisma.user.deleteMany();


  console.log('✅ Existing data cleared');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Admin User
  console.log('👤 Creating admin user...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@clasedesurf.com',
      name: 'Administrador Principal',
      password: hashedPassword,
      role: UserRole.ADMIN,
      phone: '+51 999 888 777',
      avatar: 'wave1'
    }
  });
  console.log('✅ Admin created:', admin.email);

  // Create Schools
  console.log('🏫 Creating schools...');
  const school1 = await prisma.school.create({
    data: {
      name: 'Surf School Lima',
      description: 'La mejor escuela de surf en Lima. Clases para todos los niveles con instructores certificados.',
      location: 'Miraflores, Lima',
      phone: '+51 987 654 321',
      email: 'info@surfschoollima.com',
      website: 'https://surfschoollima.com',
      logo: '/uploads/schools/surf-school-lima.jpg',
      status: SchoolStatus.APPROVED
    }
  });

  const school2 = await prisma.school.create({
    data: {
      name: 'Máncora Surf Academy',
      description: 'Aprende a surfear en las mejores olas del norte del Perú. Instructores profesionales y ambiente familiar.',
      location: 'Máncora, Piura',
      phone: '+51 976 543 210',
      email: 'contacto@mancorasurf.com',
      website: 'https://mancorasurf.com',
      logo: '/uploads/schools/mancora-surf.jpg',
      status: SchoolStatus.APPROVED
    }
  });

  console.log('✅ Schools created:', school1.name, school2.name);

  // Create School Admins
  console.log('👨‍💼 Creating school admins...');
  const schoolAdmin1 = await prisma.user.create({
    data: {
      email: 'admin@surfschoollima.com',
      name: 'Carlos Rodríguez',
      password: hashedPassword,
      role: UserRole.SCHOOL_ADMIN,
      phone: '+51 987 654 321',
      avatar: 'surf1',
      instructor: {
        create: {
          schoolId: school1.id,
          bio: 'Director y fundador de Surf School Lima con más de 15 años de experiencia.',
          yearsExperience: 15,
          specialties: ['Surf', 'Bodyboard', 'Stand Up Paddle'],
          certifications: ['ISA Level 2', 'Lifeguard'],
          rating: 4.9,
          totalReviews: 45,
          instructorRole: InstructorRole.HEAD_COACH,
          isActive: true
        }
      }
    }
  });

  const schoolAdmin2 = await prisma.user.create({
    data: {
      email: 'admin@mancorasurf.com',
      name: 'María González',
      password: hashedPassword,
      role: UserRole.SCHOOL_ADMIN,
      phone: '+51 976 543 210',
      avatar: 'wave2',
      instructor: {
        create: {
          schoolId: school2.id,
          bio: 'Surfista profesional y directora de Máncora Surf Academy.',
          yearsExperience: 12,
          specialties: ['Surf Avanzado', 'Competición'],
          certifications: ['ISA Level 3', 'CPR'],
          rating: 4.8,
          totalReviews: 38,
          instructorRole: InstructorRole.HEAD_COACH,
          isActive: true
        }
      }
    }
  });

  console.log('✅ School admins created');

  // Create Instructors
  console.log('🏄 Creating instructors...');
  const instructor1 = await prisma.user.create({
    data: {
      email: 'juan@surfschoollima.com',
      name: 'Juan Pérez',
      password: hashedPassword,
      role: UserRole.INSTRUCTOR,
      phone: '+51 988 777 666',
      avatar: 'surf2',
      instructor: {
        create: {
          schoolId: school1.id,
          bio: 'Instructor certificado especializado en principiantes.',
          yearsExperience: 5,
          specialties: ['Surf Principiante', 'Niños'],
          certifications: ['ISA Level 1', 'First Aid'],
          rating: 4.7,
          totalReviews: 28,
          instructorRole: InstructorRole.INSTRUCTOR,
          isActive: true
        }
      }
    }
  });

  const instructor2 = await prisma.user.create({
    data: {
      email: 'ana@mancorasurf.com',
      name: 'Ana Torres',
      password: hashedPassword,
      role: UserRole.INSTRUCTOR,
      phone: '+51 977 666 555',
      avatar: 'wave3',
      instructor: {
        create: {
          schoolId: school2.id,
          bio: 'Instructora con experiencia en surf avanzado y maniobras.',
          yearsExperience: 8,
          specialties: ['Surf Avanzado', 'Maniobras'],
          certifications: ['ISA Level 2', 'Lifeguard'],
          rating: 4.9,
          totalReviews: 35,
          instructorRole: InstructorRole.INSTRUCTOR,
          isActive: true
        }
      }
    }
  });

  console.log('✅ Instructors created');

  // Create Students
  console.log('🎓 Creating students...');
  const students = [];
  for (let i = 1; i <= 10; i++) {
    const student = await prisma.user.create({
      data: {
        email: `estudiante${i}@example.com`,
        name: `Estudiante ${i}`,
        password: hashedPassword,
        role: UserRole.STUDENT,
        phone: `+51 9${String(i).padStart(8, '0')}`,
        age: 18 + Math.floor(Math.random() * 30),
        weight: 60 + Math.floor(Math.random() * 30),
        height: 160 + Math.floor(Math.random() * 30),
        canSwim: Math.random() > 0.3,
        avatar: `surf${(i % 3) + 1}`,
        student: {
          create: {
            schoolId: i % 2 === 0 ? school1.id : school2.id,
            level: i <= 3 ? ClassLevel.BEGINNER : i <= 7 ? ClassLevel.INTERMEDIATE : ClassLevel.ADVANCED,
            canSwim: Math.random() > 0.3
          }
        }
      }
    });
    students.push(student);
  }

  console.log('✅ Students created:', students.length);

  // Create Beaches
  console.log('🏖️  Creating beaches...');
  const beach1 = await prisma.beach.create({
    data: {
      name: 'Playa Makaha',
      location: 'Miraflores, Lima',
      description: 'Playa ideal para principiantes con olas suaves y constantes.'
    }
  });

  const beach2 = await prisma.beach.create({
    data: {
      name: 'Playa Waikiki',
      location: 'Miraflores, Lima',
      description: 'Playa con olas más grandes, perfecta para nivel intermedio.'
    }
  });

  const beach3 = await prisma.beach.create({
    data: {
      name: 'Playa Máncora',
      location: 'Máncora, Piura',
      description: 'Una de las mejores playas de surf del Perú con olas todo el año.'
    }
  });

  console.log('✅ Beaches created');

  // Create Classes (as Products)
  console.log('📚 Creating classes (Products)...');
  const now = new Date();

  // School 1 Products
  const products1 = [
    {
      title: 'Clase de Surf Principiante - Miraflores',
      description: 'Aprende las bases del surf en la Playa Makaha. Incluye tabla, wetsuit e instrucción de 2 horas.',
      duration: 120,
      defaultCapacity: 8,
      defaultPrice: 80,
      level: ClassLevel.BEGINNER,
      schoolId: school1.id,
      instructor: 'Juan Pérez',
      beachId: beach1.id,
      type: 'SURF_LESSON',
      images: ['/uploads/classes/surf-class-1.jpg', '/uploads/classes/surf-class-2.jpg']
    },
    {
      title: 'Surf Coaching Intermedio - Waikiki',
      description: 'Perfecciona tu técnica y lectura de olas. Grupos reducidos.',
      duration: 120,
      defaultCapacity: 6,
      defaultPrice: 100,
      level: ClassLevel.INTERMEDIATE,
      schoolId: school1.id,
      instructor: 'Juan Pérez',
      beachId: beach2.id,
      type: 'SURF_LESSON',
      images: ['/uploads/classes/surf-class-3.jpg']
    }
  ];

  const createdProducts = [];
  for (const p of products1) {
    const product = await prisma.class.create({ data: p });
    createdProducts.push(product);

    // Create a few sessions (instances) for each product
    for (let i = 0; i < 5; i++) {
      const sessionDate = new Date(now);
      sessionDate.setDate(sessionDate.getDate() + i + 1);
      sessionDate.setHours(0, 0, 0, 0);

      const times = ["08:00", "15:00"];
      for (const t of times) {
        await prisma.classSession.create({
          data: {
            classId: product.id,
            date: sessionDate,
            time: t,
            capacity: product.defaultCapacity,
            price: product.defaultPrice
          }
        });
      }
    }
  }

  // School 2 Products
  const products2 = [
    {
      title: 'Surf Experience Máncora',
      description: 'Vive el surf en el paraíso del norte. Olas tibias todo el año.',
      duration: 150,
      defaultCapacity: 6,
      defaultPrice: 90,
      level: ClassLevel.BEGINNER,
      schoolId: school2.id,
      instructor: 'Ana Torres',
      beachId: beach3.id,
      type: 'SURF_LESSON',
      images: ['/uploads/classes/mancora-1.jpg']
    }
  ];

  for (const p of products2) {
    const product = await prisma.class.create({ data: p });
    createdProducts.push(product);

    // 10 sessions for Mancora
    for (let i = 0; i < 7; i++) {
      const sessionDate = new Date(now);
      sessionDate.setDate(sessionDate.getDate() + i + 1);
      sessionDate.setHours(0, 0, 0, 0);

      await prisma.classSession.create({
        data: {
          classId: product.id,
          date: sessionDate,
          time: "10:00",
          capacity: product.defaultCapacity,
          price: product.defaultPrice
        }
      });
    }
  }

  // Soft deleted product example
  await prisma.class.create({
    data: {
      title: 'Antiguo Programa de Surf',
      description: 'Este producto ya no se ofrece.',
      duration: 120,
      defaultCapacity: 0,
      defaultPrice: 50,
      level: ClassLevel.BEGINNER,
      schoolId: school1.id,
      deletedAt: new Date()
    }
  });

  console.log('✅ Products and Sessions created');

  // Create Discount Codes
  console.log('🎟️  Creating discount codes...');
  const discount1 = await prisma.discountCode.create({
    data: {
      code: 'VERANO2024',
      description: 'Descuento de verano - 20% off',
      discountPercentage: 20,
      validFrom: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      validTo: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
      maxUses: 100,
      usedCount: 15,
      schoolId: school1.id
    }
  });

  const discount2 = await prisma.discountCode.create({
    data: {
      code: 'PRIMERAVEZ',
      description: 'Descuento para nuevos estudiantes - 30% off',
      discountPercentage: 30,
      validFrom: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      validTo: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
      maxUses: 50,
      usedCount: 8,
      schoolId: school2.id
    }
  });

  console.log('✅ Discount codes created');

  // Create Reservations and Payments
  console.log('📝 Creating reservations and payments...');
  let reservationCount = 0;
  let paymentCount = 0;

  for (let i = 0; i < createdProducts.length; i++) {
    const product = createdProducts[i];

    // Find sessions for this product to book
    const sessions = await prisma.classSession.findMany({
      where: { classId: product.id },
      take: 3
    });

    for (const session of sessions) {
      const numReservations = Math.floor(Math.random() * 2) + 1;

      for (let j = 0; j < numReservations; j++) {
        const student = students[Math.floor(Math.random() * students.length)];

        const reservation = await prisma.reservation.create({
          data: {
            userId: student.id,
            classId: product.id,
            status: ReservationStatus.CONFIRMED,
            date: session.date,
            time: session.time,
            specialRequest: j === 0 ? 'Necesito tabla más grande' : undefined
          }
        });
        reservationCount++;

        // Payment
        const finalPrice = session.price || product.defaultPrice;
        await prisma.payment.create({
          data: {
            reservationId: reservation.id,
            amount: finalPrice,
            status: PaymentStatus.PAID,
            paymentMethod: 'transfer',
            transactionId: `TXN${Date.now()}${j}`,
            paidAt: new Date()
          }
        });
        paymentCount++;
      }
    }
  }

  console.log('✅ Reservations created:', reservationCount);
  console.log('✅ Payments created:', paymentCount);


  // Create Reviews
  console.log('⭐ Creating reviews...');
  await prisma.schoolReview.create({
    data: {
      schoolId: school1.id,
      studentName: 'Pedro Martínez',
      rating: 5,
      comment: '¡Excelente escuela! Los instructores son muy profesionales y pacientes.'
    }
  });

  await prisma.schoolReview.create({
    data: {
      schoolId: school1.id,
      studentName: 'Laura Sánchez',
      rating: 4,
      comment: 'Muy buena experiencia. Aprendí mucho en poco tiempo.'
    }
  });

  const schoolAdmin1Instructor = await prisma.instructor.findUnique({
    where: { userId: schoolAdmin1.id }
  });

  if (schoolAdmin1Instructor) {
    await prisma.instructorReview.create({
      data: {
        instructorId: schoolAdmin1Instructor.id,
        studentName: 'Roberto García',
        rating: 5,
        comment: 'Carlos es un instructor increíble. Muy recomendado.'
      }
    });
  }

  console.log('✅ Reviews created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${1 + 2 + 2 + students.length} (1 admin, 2 school admins, 2 instructors, ${students.length} students)`);
  console.log(`   - Schools: 2`);
  console.log(`   - Beaches: 3`);
  console.log(`   - Classes: ${createdProducts.length + 1} (${createdProducts.length} active, 1 deleted)`);
  console.log(`   - Discount Codes: 2`);
  console.log(`   - Reservations: ${reservationCount}`);
  console.log(`   - Payments: ${paymentCount}`);
  console.log(`   - Reviews: 3`);
  console.log('\n🔑 Login credentials:');
  console.log('   Admin: admin@clasedesurf.com / password123');
  console.log('   School 1: admin@surfschoollima.com / password123');
  console.log('   School 2: admin@mancorasurf.com / password123');
  console.log('   Instructor 1: juan@surfschoollima.com / password123');
  console.log('   Instructor 2: ana@mancorasurf.com / password123');
  console.log('   Students: estudiante1@example.com to estudiante10@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
