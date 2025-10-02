import { PrismaClient, UserRole, ClassLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // --- Clean up existing data ---
  await prisma.reservation.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.school.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Cleared existing data.');

  // --- Create Users ---
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@surfschool.com',
      name: 'Admin User',
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  const school1 = await prisma.school.create({
    data: {
      name: 'Lima Surf Academy',
      location: 'Miraflores, Lima',
      description: 'Pioneering surf school in Lima with over 8 years of experience.',
      email: 'contact@limasurf.com',
      phone: '+5112345678',
    },
  });

  const school2 = await prisma.school.create({
    data: {
      name: 'Waikiki Surf School',
      location: 'San Bartolo, Lima',
      description: 'Specializing in intermediate and advanced surf techniques.',
      email: 'info@waikikisurf.pe',
      phone: '+5118765432',
    },
  });
  console.log('Created schools.');

  const schoolAdmin = await prisma.user.create({
    data: {
      email: 'schooladmin@surfschool.com',
      name: 'School Admin',
      password: hashedPassword,
      role: UserRole.SCHOOL_ADMIN,
      schoolId: school1.id,
    },
  });

  const instructor1 = await prisma.user.create({
    data: {
      email: 'instructor1@surfschool.com',
      name: 'Carlos Mendoza',
      password: hashedPassword,
      role: UserRole.INSTRUCTOR,
    },
  });

  const instructor2 = await prisma.user.create({
    data: {
      email: 'instructor2@surfschool.com',
      name: 'Ana Rodriguez',
      password: hashedPassword,
      role: UserRole.INSTRUCTOR,
    },
  });

  const student1 = await prisma.user.create({
    data: {
      email: 'student1@surfschool.com',
      name: 'Alice Johnson',
      password: hashedPassword,
      role: UserRole.STUDENT,
      age: 28,
      canSwim: true,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@surfschool.com',
      name: 'Bob Williams',
      password: hashedPassword,
      role: UserRole.STUDENT,
      age: 35,
      canSwim: false,
    },
  });
  console.log('Created users.');

  // --- Create Classes ---
  const class1 = await prisma.class.create({
    data: {
      title: 'Iniciación en Miraflores',
      description: 'Aprende surf en la icónica Playa Makaha.',
      date: new Date('2024-12-20T08:00:00Z'),
      duration: 120,
      capacity: 8,
      price: 25,
      level: ClassLevel.BEGINNER,
      schoolId: school1.id,
      instructorId: instructor1.id,
    },
  });

  const class2 = await prisma.class.create({
    data: {
      title: 'Intermedio en San Bartolo',
      description: 'Perfecciona tu técnica en Playa Waikiki.',
      date: new Date('2024-12-20T16:00:00Z'),
      duration: 120,
      capacity: 6,
      price: 35,
      level: ClassLevel.INTERMEDIATE,
      schoolId: school2.id,
      instructorId: instructor2.id,
    },
  });

  const class3 = await prisma.class.create({
    data: {
      title: 'Avanzado en La Herradura',
      description: 'Para surfistas con experiencia.',
      date: new Date('2024-12-21T09:00:00Z'),
      duration: 120,
      capacity: 4,
      price: 45,
      level: ClassLevel.ADVANCED,
      schoolId: school1.id,
      instructorId: instructor1.id,
    },
  });
  console.log('Created classes.');

  // --- Create Reservations ---
  await prisma.reservation.create({
    data: {
      userId: student1.id,
      classId: class1.id,
      status: 'CONFIRMED',
    },
  });

  await prisma.reservation.create({
    data: {
      userId: student2.id,
      classId: class2.id,
      status: 'PENDING',
    },
  });
  console.log('Created reservations.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });