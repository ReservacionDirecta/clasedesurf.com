#!/usr/bin/env node

const { Client } = require('pg');

const LOCAL_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'clasedesurf.com'
};

async function checkData() {
  const client = new Client(LOCAL_CONFIG);
  
  try {
    await client.connect();
    console.log('✓ Conectado a la base de datos\n');
    
    // Obtener estudiantes de Trujillo
    console.log('📚 ESTUDIANTES DE TRUJILLO (School ID: 2):');
    const students = await client.query(`
      SELECT s.id, u.name, u.email, s."schoolId"
      FROM students s
      JOIN users u ON s."userId" = u.id
      WHERE s."schoolId" = 2
    `);
    
    students.rows.forEach(s => {
      console.log(`  - ${s.name} (ID: ${s.id}, School: ${s.schoolId})`);
    });
    
    // Obtener clases de Trujillo
    console.log('\n🏄 CLASES DE TRUJILLO (School ID: 2):');
    const classes = await client.query(`
      SELECT id, title, "schoolId"
      FROM classes
      WHERE "schoolId" = 2
    `);
    
    classes.rows.forEach(c => {
      console.log(`  - ${c.title} (ID: ${c.id}, School: ${c.schoolId})`);
    });
    
    // Obtener reservaciones de estudiantes de Trujillo
    console.log('\n🎫 RESERVACIONES DE ESTUDIANTES DE TRUJILLO:');
    const reservations = await client.query(`
      SELECT r.id, u.name as student_name, c.title as class_title, r.status, c."schoolId"
      FROM reservations r
      JOIN users u ON r."userId" = u.id
      JOIN classes c ON r."classId" = c.id
      JOIN students s ON s."userId" = u.id
      WHERE s."schoolId" = 2
      ORDER BY r.id
    `);
    
    if (reservations.rows.length === 0) {
      console.log('  ❌ No hay reservaciones para estudiantes de Trujillo');
    } else {
      reservations.rows.forEach(r => {
        console.log(`  - ${r.student_name} → ${r.class_title} (${r.status}) [Class School: ${r.schoolId}]`);
      });
    }
    
    // Obtener pagos de Trujillo
    console.log('\n💰 PAGOS DE TRUJILLO:');
    const payments = await client.query(`
      SELECT p.id, p.amount, p.status, u.name as student_name, c.title as class_title
      FROM payments p
      JOIN reservations r ON p."reservationId" = r.id
      JOIN users u ON r."userId" = u.id
      JOIN classes c ON r."classId" = c.id
      WHERE c."schoolId" = 2
      ORDER BY p.id
    `);
    
    if (payments.rows.length === 0) {
      console.log('  ❌ No hay pagos para Trujillo');
    } else {
      payments.rows.forEach(p => {
        console.log(`  - ${p.student_name} → ${p.class_title}: $${p.amount} (${p.status})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkData();
