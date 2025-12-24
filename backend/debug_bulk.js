
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
// Try native fetch, fallback to node-fetch if needed
const fetch = global.fetch || require('node-fetch');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-for-development-only';

async function main() {
  try {
    console.log('🔍 Debugging Bulk Creation...');

    // 1. Get or Create Admin User
    let admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!admin) {
      console.log('Creating temp admin user...');
      admin = await prisma.user.create({
        data: {
          email: 'debug_admin@test.com',
          name: 'Debug Admin',
          password: 'hashes_are_hard',
          role: 'ADMIN'
        }
      });
    }

    console.log(`👤 Using Admin: ${admin.email} (ID: ${admin.id})`);

    // 2. Generate Token
    const token = jwt.sign(
      { userId: admin.id, role: admin.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('🔑 Token generated');

    // 3. Prepare Payload
    const payload = {
      baseData: {
        title: "CLASE DEBUG RECURRENTE JS",
        description: "Intento de reproduccion error 500",
        duration: 120,
        capacity: 8,
        price: 100,
        level: "BEGINNER",
        instructor: "Debug Bot",
        studentDetails: "Debug Details",
        images: ["debug.jpg"]
      },
      schoolId: 1, 
      beachId: 1, 
      occurrences: [
        { date: "2025-12-25", time: "06:00" },
        { date: "2025-12-25", time: "08:00" },
        { date: "2026-01-01", time: "06:00" },
        { date: "2026-01-01", time: "08:00" }
      ]
    };

    console.log('📦 Sending Payload:', JSON.stringify(payload, null, 2));

    // 4. Send Request
    const response = await fetch('http://localhost:4000/classes/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    console.log(`\n📨 Response Status: ${response.status} ${response.statusText}`);
    const text = await response.text();
    console.log('📄 Response Body:', text);

  } catch (err) {
    console.error('💥 Script Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
