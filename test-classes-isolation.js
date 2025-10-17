#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'http://localhost:4000';

async function login(email, password) {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password
  });
  return response.data.token;
}

async function getClasses(token) {
  const response = await axios.get(`${API_URL}/classes`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

async function test() {
  console.log('🧪 Probando aislamiento de clases...\n');
  
  // Test 1: Admin Lima
  console.log('1️⃣  Testing admin.lima@test.com');
  const tokenLima = await login('admin.lima@test.com', 'password123');
  const classesLima = await getClasses(tokenLima);
  console.log(`   ✓ Clases obtenidas: ${classesLima.length}`);
  classesLima.forEach(c => {
    console.log(`     - ${c.title} (School ID: ${c.schoolId})`);
  });
  
  const allLima = classesLima.every(c => c.schoolId === 1);
  if (allLima && classesLima.length === 4) {
    console.log(`   ✅ CORRECTO: Solo ve clases de su escuela (School ID: 1)\n`);
  } else {
    console.log(`   ❌ ERROR: Viendo clases de otras escuelas o cantidad incorrecta\n`);
  }
  
  // Test 2: Admin Trujillo
  console.log('2️⃣  Testing admin.trujillo@test.com');
  const tokenTrujillo = await login('admin.trujillo@test.com', 'password123');
  const classesTrujillo = await getClasses(tokenTrujillo);
  console.log(`   ✓ Clases obtenidas: ${classesTrujillo.length}`);
  classesTrujillo.forEach(c => {
    console.log(`     - ${c.title} (School ID: ${c.schoolId})`);
  });
  
  const allTrujillo = classesTrujillo.every(c => c.schoolId === 2);
  if (allTrujillo && classesTrujillo.length === 4) {
    console.log(`   ✅ CORRECTO: Solo ve clases de su escuela (School ID: 2)\n`);
  } else {
    console.log(`   ❌ ERROR: Viendo clases de otras escuelas o cantidad incorrecta\n`);
  }
  
  // Test 3: Estudiante (debe ver todas)
  console.log('3️⃣  Testing student1.lima@test.com');
  const tokenStudent = await login('student1.lima@test.com', 'password123');
  const classesStudent = await getClasses(tokenStudent);
  console.log(`   ✓ Clases obtenidas: ${classesStudent.length}`);
  
  if (classesStudent.length === 8) {
    console.log(`   ✅ CORRECTO: Estudiante ve todas las clases (8 total)\n`);
  } else {
    console.log(`   ❌ ERROR: Estudiante debería ver todas las clases\n`);
  }
  
  console.log('✅ Pruebas completadas!');
}

test().catch(err => {
  console.error('❌ Error:', err.response?.data || err.message);
  process.exit(1);
});
