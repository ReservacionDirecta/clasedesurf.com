const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const RAILWAY_CONFIG = {
  host: 'hopper.proxy.rlwy.net',
  port: 14816,
  user: 'postgres',
  password: 'BJrFcoAnIvEWPxvQLJHJfzYPiHMOrkhb',
  database: 'railway'
};

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

async function main() {
  const client = new Client(RAILWAY_CONFIG);
  try {
    await client.connect();
    log('✓ Connected', 'green');

    // 1. CLEAN
    log('\nCleaning DB...', 'yellow');
    await client.query(`
      TRUNCATE TABLE 
        refresh_tokens, payments, reservations, 
        instructor_reviews, school_reviews, 
        classes, instructors, students, schools, users 
      RESTART IDENTITY CASCADE;
    `);
    log('✓ Cleaned', 'green');

    // 2. ADMIN
    log('\nCreating Admin...', 'yellow');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Explicitly using quotes for createdAt, updatedAt as they are camelCase in DB
    const adminRes = await client.query(`
      INSERT INTO users (email, name, password, role, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, email
    `, ['admin@test.com', 'Admin Global', hashedPassword, 'ADMIN']);
    
    log(`✓ Admin created: ${adminRes.rows[0].email} (ID: ${adminRes.rows[0].id})`, 'green');

    // 3. SCHOOL
    log('\nCreating School...', 'yellow');
    const schoolAdminRes = await client.query(`
      INSERT INTO users (email, name, password, role, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id
    `, ['admin.lima@test.com', 'Admin Lima', hashedPassword, 'SCHOOL_ADMIN']);
    const schoolAdminId = schoolAdminRes.rows[0].id;

    // schools table: "ownerId", "coverImage" are camelCase
    const schoolRes = await client.query(`
      INSERT INTO schools (name, location, description, "ownerId", "coverImage", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, name
    `, ['Surf School Lima', 'Miraflores, Lima', 'Desc', schoolAdminId, '/uploads/schools/surf-school-lima.jpg']);
    
    log(`✓ School created: ${schoolRes.rows[0].name}`, 'green');

    // 4. INSTRUCTOR
    log('\nCreating Instructor...', 'yellow');
    const instrUserRes = await client.query(`
      INSERT INTO users (email, name, password, role, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id
    `, ['instr@test.com', 'Carlos Instructor', hashedPassword, 'INSTRUCTOR']);
    const instrUserId = instrUserRes.rows[0].id;

    // instructors table: "userId", "schoolId", "yearsExperience"
    await client.query(`
      INSERT INTO instructors ("userId", "schoolId", bio, "yearsExperience", specialties, certifications, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    `, [instrUserId, schoolRes.rows[0].id, 'Bio', 5, ['A'], ['B']]);
    
    log('✓ Instructor created', 'green');

    log('\n✓ SEED COMPLETED SUCCESSFULLY', 'cyan');

  } catch (e) {
    log(`\nERROR: ${e.message}`, 'red');
    if (e.position) console.log(`Position: ${e.position}`);
    console.error(e);
  } finally {
    await client.end();
  }
}

main();
