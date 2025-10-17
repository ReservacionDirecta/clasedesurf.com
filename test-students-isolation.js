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

async function getStudents(token) {
  const response = await axios.get(`${API_URL}/students`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

async function test() {
  console.log('🧪 Probando aislamiento de estudiantes...\n');
  
  // Test 1: Admin Lima
  console.log('1️⃣  Testing admin.lima@test.com');
  const tokenLima = await login('admin.lima@test.com', 'password123');
  const studentsLima = await getStudents(tokenLima);
  console.log(`   ✓ Estudiantes obtenidos: ${studentsLima.length}`);
  studentsLima.forEach(s => {
    console.log(`     - ${s.user?.name || 'Sin nombre'} (School ID: ${s.schoolId})`);
  });
  
  const allLima = studentsLima.every(s => s.schoolId === 1);
  if (allLima && studentsLima.length === 2) {
    console.log(`   ✅ CORRECTO: Solo ve estudiantes de su escuela (School ID: 1)\n`);
  } else {
    console.log(`   ❌ ERROR: Viendo estudiantes de otras escuelas o cantidad incorrecta (esperaba 2, obtuvo ${studentsLima.length})\n`);
  }
  
  // Test 2: Admin Trujillo
  console.log('2️⃣  Testing admin.trujillo@test.com');
  const tokenTrujillo = await login('admin.trujillo@test.com', 'password123');
  const studentsTrujillo = await getStudents(tokenTrujillo);
  console.log(`   ✓ Estudiantes obtenidos: ${studentsTrujillo.length}`);
  studentsTrujillo.forEach(s => {
    console.log(`     - ${s.user?.name || 'Sin nombre'} (School ID: ${s.schoolId})`);
  });
  
  const allTrujillo = studentsTrujillo.every(s => s.schoolId === 2);
  if (allTrujillo && studentsTrujillo.length === 2) {
    console.log(`   ✅ CORRECTO: Solo ve estudiantes de su escuela (School ID: 2)\n`);
  } else {
    console.log(`   ❌ ERROR: Viendo estudiantes de otras escuelas o cantidad incorrecta (esperaba 2, obtuvo ${studentsTrujillo.length})\n`);
  }
  
  console.log('✅ Pruebas completadas!');
}

test().catch(err => {
  console.error('❌ Error:', err.response?.data || err.message);
  process.exit(1);
});
