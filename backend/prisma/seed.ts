import { PrismaClient, UserRole, ClassLevel, ReservationStatus, InstructorRole, SchoolStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.payment.deleteMany();
  await prisma.reservation.deleteMany();
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

  // Create Classes
  console.log('📚 Creating classes...');
  const now = new Date();
  const classes = [];

  // School 1 Classes (Lima)
  for (let i = 0; i < 8; i++) {
    const classDate = new Date(now);
    classDate.setDate(classDate.getDate() + i + 1);
    classDate.setHours(i % 2 === 0 ? 9 : 15, 0, 0, 0);

    const level = i < 3 ? ClassLevel.BEGINNER : i < 6 ? ClassLevel.INTERMEDIATE : ClassLevel.ADVANCED;
    const price = level === ClassLevel.BEGINNER ? 80 : level === ClassLevel.INTERMEDIATE ? 100 : 120;

    const cls = await prisma.class.create({
      data: {
        title: `Clase de Surf ${level === ClassLevel.BEGINNER ? 'Principiante' : level === ClassLevel.INTERMEDIATE ? 'Intermedio' : 'Avanzado'} - ${i % 2 === 0 ? 'Mañana' : 'Tarde'}`,
        description: `Clase de surf nivel ${level.toLowerCase()} con instructor certificado. Incluye tabla y traje de neopreno.`,
        date: classDate,
        duration: 120,
        capacity: 8,
        price: price,
        level: level,
        schoolId: school1.id,
        instructor: 'Juan Pérez',
        beachId: i % 2 === 0 ? beach1.id : beach2.id,
        images: [
          '/uploads/classes/surf-class-1.jpg',
          '/uploads/classes/surf-class-2.jpg'
        ]
      }
    });
    classes.push(cls);
  }

  // School 2 Classes (Máncora)
  for (let i = 0; i < 6; i++) {
    const classDate = new Date(now);
    classDate.setDate(classDate.getDate() + i + 2);
    classDate.setHours(i % 2 === 0 ? 10 : 16, 0, 0, 0);

    const level = i < 2 ? ClassLevel.BEGINNER : i < 4 ? ClassLevel.INTERMEDIATE : ClassLevel.ADVANCED;
    const price = level === ClassLevel.BEGINNER ? 90 : level === ClassLevel.INTERMEDIATE ? 110 : 130;

    const cls = await prisma.class.create({
      data: {
        title: `Surf en Máncora ${level === ClassLevel.BEGINNER ? 'Principiante' : level === ClassLevel.INTERMEDIATE ? 'Intermedio' : 'Avanzado'}`,
        description: `Aprende surf en las mejores olas del norte. Nivel ${level.toLowerCase()}.`,
        date: classDate,
        duration: 150,
        capacity: 6,
        price: price,
        level: level,
        schoolId: school2.id,
        instructor: 'Ana Torres',
        beachId: beach3.id,
        images: [
          '/uploads/classes/mancora-1.jpg',
          '/uploads/classes/mancora-2.jpg'
        ]
      }
    });
    classes.push(cls);
  }

  // Create one deleted class
  const deletedClass = await prisma.class.create({
    data: {
      title: 'Clase Cancelada - Mal Tiempo',
      description: 'Esta clase fue cancelada debido a condiciones climáticas adversas.',
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      duration: 120,
      capacity: 8,
      price: 80,
      level: ClassLevel.BEGINNER,
      schoolId: school1.id,
      instructor: 'Juan Pérez',
      beachId: beach1.id,
      deletedAt: new Date(), // Soft deleted
      images: []
    }
  });

  console.log('✅ Classes created:', classes.length + 1);

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

  for (let i = 0; i < Math.min(classes.length, 6); i++) {
    const cls = classes[i];
    const numReservations = Math.floor(Math.random() * 4) + 1; // 1-4 reservations per class

    for (let j = 0; j < numReservations; j++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const statuses: ReservationStatus[] = [ReservationStatus.PENDING, ReservationStatus.CONFIRMED, ReservationStatus.CONFIRMED, ReservationStatus.CONFIRMED]; // More confirmed
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const reservation = await prisma.reservation.create({
        data: {
          userId: student.id,
          classId: cls.id,
          status: status,
          specialRequest: j === 0 ? 'Necesito tabla más grande' : undefined
        }
      });
      reservationCount++;

      // Create payment for reservation
      const useDiscount = Math.random() > 0.7; // 30% chance of using discount
      const discount = useDiscount && cls.schoolId === school1.id ? discount1 : useDiscount ? discount2 : null;

      let originalAmount = cls.price;
      let discountAmount = 0;
      let finalAmount = originalAmount;

      if (discount) {
        discountAmount = (originalAmount * discount.discountPercentage) / 100;
        finalAmount = originalAmount - discountAmount;
      }

      const paymentStatuses = [PaymentStatus.PENDING, PaymentStatus.PAID, PaymentStatus.PAID, PaymentStatus.PAID]; // More paid
      const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];

      await prisma.payment.create({
        data: {
          reservationId: reservation.id,
          amount: finalAmount,
          originalAmount: useDiscount ? originalAmount : undefined,
          discountAmount: useDiscount ? discountAmount : undefined,
          status: paymentStatus,
          paymentMethod: ['transfer', 'yape', 'cash'][Math.floor(Math.random() * 3)],
          transactionId: paymentStatus === PaymentStatus.PAID ? `TXN${Date.now()}${j}` : undefined,
          paidAt: paymentStatus === PaymentStatus.PAID ? new Date() : undefined,
          discountCodeId: discount?.id
        }
      });
      paymentCount++;
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
  console.log(`   - Classes: ${classes.length + 1} (${classes.length} active, 1 deleted)`);
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
