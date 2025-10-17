const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testStudentsEndpoint() {
  try {
    // Login como admin de Trujillo
    console.log('🔐 Logging in as admin.trujillo@test.com...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin.trujillo@test.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    console.log('✓ Login exitoso\n');
    
    // Get students
    console.log('📚 Obteniendo estudiantes...');
    const studentsRes = await axios.get(`${BASE_URL}/students`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✓ Estudiantes obtenidos: ${studentsRes.data.length}\n`);
    
    // Show each student with details
    studentsRes.data.forEach(student => {
      console.log(`👤 ${student.user.name}`);
      console.log(`   - ID: ${student.id}`);
      console.log(`   - School ID: ${student.schoolId}`);
      console.log(`   - Total Classes: ${student.totalClasses || 'N/A'}`);
      console.log(`   - Completed Classes: ${student.completedClasses || 'N/A'}`);
      console.log(`   - Total Paid: $${student.totalPaid || 0}`);
      console.log(`   - Status: ${student.status || 'N/A'}`);
      console.log(`   - Last Class: ${student.lastClass || 'N/A'}`);
      console.log('');
    });
    
    console.log('✅ Test completado!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testStudentsEndpoint();
