
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.class.count();
    console.log(`Total classes: ${count}`);
    const classes = await prisma.class.findMany({ take: 5 });
    console.log('Classes:', JSON.stringify(classes, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
