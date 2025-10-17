import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'configured' : 'NOT FOUND');
console.log('DATABASE_URL value:', process.env.DATABASE_URL);

// Force direct database connection, not Prisma Accelerate
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: ['query', 'info', 'warn', 'error'],
});

export default prisma;
