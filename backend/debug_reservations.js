
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkReservations() {
  try {
    console.log('--- Latest 5 Reservations ---');
    const reservations = await prisma.reservation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        class: true,
      }
    });
    
    reservations.forEach(r => {
      console.log(`ID: ${r.id}, User: ${r.user.email} (${r.user.role}), Class: ${r.class.title}, Date: ${r.date}, Status: ${r.status}`);
    });

    console.log('\n--- Checking User Roles ---');
    const users = await prisma.user.findMany();
    users.forEach(u => {
        console.log(`User: ${u.email}, Role: ${u.role}, ID: ${u.id}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkReservations();
