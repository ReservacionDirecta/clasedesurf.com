
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Find a class product
    const product = await prisma.class.findFirst({
        where: {
            deletedAt: null,
            status: 'ACTIVE'
        },
        include: {
            sessions: {
                orderBy: { date: 'asc' }
            }
        }
    });

    if (!product) {
        console.log('No suitable class product found.');
        return;
    }

    console.log(`Found base product: ${product.id} - ${product.title}`);

    // Create Session 1 (Tomorrow)
    const date1 = new Date();
    date1.setDate(date1.getDate() + 1);
    const date1Str = date1.toISOString().split('T')[0];

    const session1 = await prisma.classSession.create({
        data: {
            classId: product.id,
            date: date1Str,
            startTime: '10:00',
            price: product.defaultPrice,
            capacity: product.defaultCapacity
        }
    });
    console.log(`Created session 1: ${session1.id} for ${date1Str} at 10:00`);

    // Create Session 2 (Day after tomorrow)
    const date2 = new Date();
    date2.setDate(date2.getDate() + 2);
    const date2Str = date2.toISOString().split('T')[0];

    const session2 = await prisma.classSession.create({
        data: {
            classId: product.id,
            date: date2Str,
            startTime: '14:00',
            price: product.defaultPrice,
            capacity: product.defaultCapacity
        }
    });
    console.log(`Created session 2: ${session2.id} for ${date2Str} at 14:00`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
