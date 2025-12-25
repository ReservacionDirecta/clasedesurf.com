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
    // Using simple TRUNCATE CASCADE on main tables
    await client.query(`
      TRUNCATE TABLE 
        refresh_tokens, payments, reservations, 
        instructor_reviews, school_reviews, 
        classes, instructors, students, schools, users 
      RESTART IDENTITY CASCADE;
    `);
    log('✓ Cleaned', 'green');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // ========================
    // 1. ADMIN
    // ========================
    log('\n1. Creating Admin...', 'yellow');
    const adminRes = await client.query(`
      INSERT INTO users (email, name, password, role, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, email
    `, ['admin@test.com', 'Admin Global', hashedPassword, 'ADMIN']);
    log(`✓ Admin: ${adminRes.rows[0].email}`, 'green');

    // Workaround for updatedAt column weirdness
    try {
      await client.query('ALTER TABLE schools ALTER COLUMN "updatedAt" SET DEFAULT NOW()');
    } catch(e) { log('Alter failed: ' + e.message, 'red'); }

    // ========================
    // 2. SCHOOL 1 (LIMA)
    // ========================
    log('\n2. Creating School 1 (Lima)...', 'yellow');
    const sa1Res = await client.query(`
      INSERT INTO users (email, name, password, role, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id
    `, ['admin.lima@test.com', 'Admin Lima', hashedPassword, 'SCHOOL_ADMIN']);
    const sa1Id = sa1Res.rows[0].id;

    const s1Res = await client.query(`
      INSERT INTO schools ("name", "location", "description", "ownerId", "coverImage", "createdAt")
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING "id"
    `, ['Surf School Lima', 'Miraflores, Lima', 'Escuela Lima', sa1Id, '/uploads/schools/surf-school-lima.jpg']);
    const s1Id = s1Res.rows[0].id;

    // Instructor 1 (Lima)
    const i1Res = await client.query(`
      INSERT INTO users (email, name, password, role, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id
    `, ['instructor1.lima@test.com', 'Carlos Lima', hashedPassword, 'INSTRUCTOR']);
    
    await client.query(`
      INSERT INTO instructors ("userId", "schoolId", bio, "yearsExperience", specialties, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    `, [i1Res.rows[0].id, s1Id, 'Bio', 5, ['A']]);

    // Class 1
    const c1Res = await client.query(`
      INSERT INTO classes (title, description, date, duration, capacity, "defaultPrice", level, "schoolId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING id
    `, ['Clase Lima', 'Desc', '2025-11-01 10:00:00', 120, 10, 50.00, 'BEGINNER', s1Id]);
    const c1Id = c1Res.rows[0].id;

    // Student 1
    const stu1Res = await client.query(`
      INSERT INTO users (email, name, password, role, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id
    `, ['student1.lima@test.com', 'Student Lima', hashedPassword, 'STUDENT']);
    const stu1Id = stu1Res.rows[0].id;

    await client.query(`
      INSERT INTO students ("userId", "schoolId", level, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, NOW(), NOW())
    `, [stu1Id, s1Id, 'BEGINNER']);

    // Reservation
    await client.query(`
      INSERT INTO reservations ("userId", "classId", status, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, NOW(), NOW())
    `, [stu1Id, c1Id, 'CONFIRMED']);

    log(`✓ School 1 Setup Complete`, 'green');

    // ========================
    // 3. SCHOOL 2 (TRUJILLO)
    // ========================
    log('\n3. Creating School 2 (Trujillo)...', 'yellow');
    const sa2Res = await client.query(`
      INSERT INTO users (email, name, password, role, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id
    `, ['admin.trujillo@test.com', 'Admin Trujillo', hashedPassword, 'SCHOOL_ADMIN']);
    const sa2Id = sa2Res.rows[0].id;

    const s2Res = await client.query(`
      INSERT INTO schools (name, location, description, "ownerId", "coverImage", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, name
    `, ['Surf School Trujillo', 'Huanchaco', 'Escuela Trujillo', sa2Id, '/uploads/schools/mancora-surf.jpg']);
    const s2Id = s2Res.rows[0].id;

     // Instructor 2 (Trujillo)
     const i2Res = await client.query(`
      INSERT INTO users (email, name, password, role, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id
    `, ['instructor1.trujillo@test.com', 'Pedro Trujillo', hashedPassword, 'INSTRUCTOR']);
    
    await client.query(`
      INSERT INTO instructors ("userId", "schoolId", bio, "yearsExperience", specialties, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    `, [i2Res.rows[0].id, s2Id, 'Bio', 7, ['B']]);

    // Class 2
    const c2Res = await client.query(`
       INSERT INTO classes (title, description, date, duration, capacity, "defaultPrice", level, "schoolId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING id
    `, ['Clase Trujillo', 'Desc', '2025-11-02 10:00:00', 120, 12, 45.00, 'BEGINNER', s2Id]);

    log(`✓ School 2 Setup Complete`, 'green');

    log('\n✓ SEED FINAL COMPLETED', 'cyan');

  } catch (e) {
    log(`\nERROR: ${e.message}`, 'red');
    if (e.position) console.log(`Position: ${e.position}`);
    console.error(e);
  } finally {
    await client.end();
  }
}

main();
