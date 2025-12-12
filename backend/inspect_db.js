
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('--- Schools Table Columns ---');
    const schoolsCols = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'schools' 
      ORDER BY column_name;
    `;
    console.log(JSON.stringify(schoolsCols, null, 2));

    console.log('\n--- Classes Table Columns ---');
    const classesCols = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'classes'
      ORDER BY column_name;
    `;
    console.log(JSON.stringify(classesCols, null, 2));

  } catch (e) {
    console.error('Error querying schema:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
