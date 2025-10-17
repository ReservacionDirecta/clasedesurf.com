// Force Prisma to use direct database connection
const fs = require('fs');
const path = require('path');

console.log('🔧 Forcing Prisma direct database connection...');

// Remove any existing Prisma client
const prismaClientPath = path.join(__dirname, 'node_modules', '.prisma');
const prismaClientPath2 = path.join(__dirname, 'node_modules', '@prisma', 'client');

try {
  if (fs.existsSync(prismaClientPath)) {
    fs.rmSync(prismaClientPath, { recursive: true, force: true });
    console.log('✅ Removed .prisma directory');
  }
  
  if (fs.existsSync(prismaClientPath2)) {
    fs.rmSync(prismaClientPath2, { recursive: true, force: true });
    console.log('✅ Removed @prisma/client directory');
  }
} catch (error) {
  console.log('⚠️ Error cleaning Prisma client:', error.message);
}

// Set environment variables to force direct connection
process.env.PRISMA_GENERATE_DATAPROXY = 'false';
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
delete process.env.PRISMA_ACCELERATE_URL;

console.log('✅ Environment configured for direct connection');

// Generate new client
const { execSync } = require('child_process');

try {
  console.log('📦 Installing fresh Prisma client...');
  execSync('npm install @prisma/client', { stdio: 'inherit' });
  
  console.log('🔧 Generating Prisma client with direct connection...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      PRISMA_GENERATE_DATAPROXY: 'false',
      PRISMA_CLIENT_ENGINE_TYPE: 'library'
    }
  });
  
  console.log('✅ Prisma client generated successfully');
} catch (error) {
  console.error('❌ Error generating Prisma client:', error.message);
  process.exit(1);
}