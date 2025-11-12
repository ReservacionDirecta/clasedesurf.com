#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

console.log('🚀 Starting Surf School Backend...');
console.log('====================================');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('PORT:', process.env.PORT || 4000);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'configured' : 'not set');
console.log('SEED_ON_START:', process.env.SEED_ON_START || 'false');
console.log('');

// Function to run a command with promise
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Command completed: ${command}`);
        resolve(code);
      } else {
        console.log(`⚠️  Command failed with code ${code}: ${command}`);
        resolve(code); // Don't reject, just continue
      }
    });
    
    child.on('error', (error) => {
      console.log(`❌ Command error: ${command}`, error.message);
      resolve(1); // Don't reject, just continue
    });
  });
}

// Function to check if server file exists
function checkServerFile() {
  const serverPaths = [
    'dist/server.js',
    'src/server.js',
    'server.js'
  ];
  
  for (const serverPath of serverPaths) {
    if (fs.existsSync(serverPath)) {
      console.log(`✅ Found server at: ${serverPath}`);
      return serverPath;
    }
  }
  
  console.log('❌ No server file found!');
  console.log('📁 Available files in dist/:');
  try {
    const distFiles = fs.readdirSync('dist');
    distFiles.forEach(file => console.log(`   - ${file}`));
  } catch (err) {
    console.log('   dist/ directory not found');
  }
  
  process.exit(1);
}

// Main startup function
async function startServer() {
  try {
    // Check server file
    const serverFile = checkServerFile();
    
    // Run migrations (don't fail if it doesn't work)
    console.log('🗄️  Setting up database...');
    await runCommand('npx', ['prisma', 'migrate', 'deploy']);
    
    // Seed database only when explicitly enabled
    // By default, seeding is DISABLED to avoid wiping production data
    const shouldSeed = String(process.env.SEED_ON_START || '').toLowerCase() === 'true';
    if (shouldSeed) {
      console.log('🌱 Seeding database (SEED_ON_START=true)...');
      await runCommand('npx', ['prisma', 'db', 'seed']);
    } else {
      console.log('🌱 Skipping database seed (set SEED_ON_START=true to enable)');
    }
    
    // Start the server
    console.log('🎯 Starting Node.js server...');
    console.log(`🌐 Server will be available at http://localhost:${process.env.PORT || 4000}`);
    console.log('');

    let command = 'node';
    let args = [serverFile];

    if (process.env.NODE_ENV !== 'production') {
      command = 'npx';
      args = ['ts-node', 'src/server.ts'];
      process.env.NODE_ENV = 'development';
    }

    // Start server (this will not return)
    const serverProcess = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });
    
    serverProcess.on('close', (code) => {
      console.log(`🛑 Server exited with code ${code}`);
      process.exit(code);
    });
    
    serverProcess.on('error', (error) => {
      console.log('❌ Server error:', error.message);
      process.exit(1);
    });
    
    // Handle shutdown signals
    process.on('SIGTERM', () => {
      console.log('🛑 Received SIGTERM, shutting down gracefully...');
      serverProcess.kill('SIGTERM');
    });
    
    process.on('SIGINT', () => {
      console.log('🛑 Received SIGINT, shutting down gracefully...');
      serverProcess.kill('SIGINT');
    });
    
  } catch (error) {
    console.log('💥 Startup error:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();