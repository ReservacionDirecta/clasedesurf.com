import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function test() {
    const cls = await prisma.class.findFirst();
    console.log(cls?.defaultPrice);
}
