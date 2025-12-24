import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function count() {
    const classes = await prisma.class.count();
    const sessions = await prisma.classSession.count();
    const schedules = await prisma.classSchedule.count();
    const reservations = await prisma.reservation.count();
    console.log({ classes, sessions, schedules, reservations });
}
count().finally(() => prisma.$disconnect());
