const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testSchool2Stats() {
  try {
    // Login como escuela2@gmail.com
    console.log('🔐 Logging in as escuela2@gmail.com...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'escuela2@gmail.com',
      password: 'admin123'
    });
    
    const token = loginRes.data.token;
    const user = loginRes.data.user;
    console.log('✓ Login exitoso');
    console.log(`   Usuario: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user.id}\n`);
    
    // Get dashboard stats
    console.log('📊 Obteniendo estadísticas del dashboard...');
    const statsRes = await axios.get(`${BASE_URL}/stats/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✓ Estadísticas obtenidas:\n');
    console.log(JSON.stringify(statsRes.data, null, 2));
    
    console.log('\n📋 Resumen:');
    console.log(`   - Instructores: ${statsRes.data.totalInstructors}`);
    console.log(`   - Estudiantes: ${statsRes.data.totalStudents}`);
    console.log(`   - Clases: ${statsRes.data.totalClasses}`);
    console.log(`   - Ingresos mensuales: S/. ${statsRes.data.monthlyRevenue}`);
    console.log(`   - Ocupación promedio: ${statsRes.data.averageOccupancy}%`);
    console.log(`   - Reservaciones pendientes: ${statsRes.data.pendingReservations}`);
    console.log(`   - Nuevos estudiantes este mes: ${statsRes.data.newStudentsThisMonth}`);
    
    console.log('\n✅ Test completado!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.error('   Credenciales incorrectas o usuario no existe');
    }
  }
}

testSchool2Stats();
