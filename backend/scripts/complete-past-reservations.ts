
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting job: Complete Past Reservations...');

    const now = new Date();

    // Find reservations that are CONFIRMED or PENDING for classes in the past
    // Status 'COMPLETED' is valid in ReservationStatus enum

    const pastReservations = await prisma.reservation.findMany({
        where: {
            status: { in: ['CONFIRMED', 'PENDING'] },
            class: {
                date: { lt: now }
            }
        },
        include: {
            class: true
        }
    });

    console.log(`Found ${pastReservations.length} past reservations to complete.`);

    let updatedCount = 0;

    for (const reservation of pastReservations) {
        try {
            await prisma.reservation.update({
                where: { id: reservation.id },
                data: { status: 'COMPLETED' }
            });
            updatedCount++;
        } catch (error) {
            console.error(`Failed to update reservation ${reservation.id}:`, error);
        }
    }

    console.log(`Successfully updated ${updatedCount} reservations to COMPLETED.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
