// Debug script to check database URL and Prisma configuration
console.log('🔍 Database URL Debug');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20) + '...');
console.log('PRISMA_GENERATE_DATAPROXY:', process.env.PRISMA_GENERATE_DATAPROXY);
console.log('PRISMA_CLIENT_ENGINE_TYPE:', process.env.PRISMA_CLIENT_ENGINE_TYPE);

// Check if URL is valid PostgreSQL format
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    console.log('✅ Valid PostgreSQL URL format');
  } else if (dbUrl.startsWith('prisma://')) {
    console.log('⚠️ Prisma Accelerate URL detected - this might cause issues');
  } else {
    console.log('❌ Unknown URL format');
  }
}

// Try to import and initialize Prisma
try {
  const { PrismaClient } = require('@prisma/client');
  console.log('✅ Prisma Client imported successfully');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
  
  console.log('✅ Prisma Client created successfully');
  
  // Try to connect
  prisma.$connect()
    .then(() => {
      console.log('✅ Database connection successful');
      return prisma.$disconnect();
    })
    .then(() => {
      console.log('✅ Database disconnection successful');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database connection failed:', error.message);
      process.exit(1);
    });
    
} catch (error) {
  console.error('❌ Prisma Client creation failed:', error.message);
  process.exit(1);
}