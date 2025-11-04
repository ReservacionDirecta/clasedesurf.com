// Script para aplicar migración de participants manualmente
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔄 Aplicando migración de participants...');
    
    // Verificar si la columna ya existe
    const result = await prisma.$queryRawUnsafe(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='reservations' AND column_name='participants'
    `);
    
    if (result.length > 0) {
      console.log('✅ La columna participants ya existe');
      return;
    }
    
    // Aplicar migración
    await prisma.$queryRawUnsafe(`
      ALTER TABLE "reservations" ADD COLUMN "participants" JSONB;
    `);
    
    console.log('✅ Migración aplicada exitosamente');
    console.log('   Columna participants agregada a la tabla reservations');
    
  } catch (error) {
    console.error('❌ Error al aplicar migración:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

