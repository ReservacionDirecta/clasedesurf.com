const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testInstructorEndpoints() {
  try {
    // Primero necesitamos crear un instructor de prueba
    // Vamos a usar el instructor Gabriel de la escuela Trujillo
    
    console.log('🔐 Logging in as instructor Gabriel...');
    
    // Intentar login con instructor1.trujillo@test.com
    let loginRes;
    try {
      loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'instructor1.trujillo@test.com',
        password: 'password123'
      });
    } catch (error) {
      console.log('❌ Instructor no existe, necesitamos crearlo primero');
      console.log('\n📝 Para probar los endpoints de instructor, primero necesitas:');
      console.log('1. Crear un usuario con role INSTRUCTOR');
      console.log('2. Crear un registro en la tabla Instructor asociado a ese usuario');
      console.log('3. Asignar el instructor a una escuela (schoolId)');
      return;
    }
    
    const token = loginRes.data.token;
    const user = loginRes.data.user;
    console.log('✓ Login exitoso');
    console.log(`   Usuario: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user.id}\n`);
    
    // Test 1: Get instructor profile
    console.log('👤 Test 1: Obteniendo perfil del instructor...');
    try {
      const profileRes = await axios.get(`${BASE_URL}/instructor/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✓ Perfil obtenido:');
      console.log(`   - Nombre: ${profileRes.data.user.name}`);
      console.log(`   - Email: ${profileRes.data.user.email}`);
      console.log(`   - Escuela: ${profileRes.data.school?.name || 'N/A'}`);
      console.log(`   - School ID: ${profileRes.data.schoolId}\n`);
    } catch (error) {
      console.log('❌ Error obteniendo perfil:', error.response?.data?.message || error.message);
    }
    
    // Test 2: Get instructor classes
    console.log('📚 Test 2: Obteniendo clases del instructor...');
    try {
      const classesRes = await axios.get(`${BASE_URL}/instructor/classes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✓ Clases obtenidas: ${classesRes.data.classes?.length || 0}`);
      if (classesRes.data.classes && classesRes.data.classes.length > 0) {
        classesRes.data.classes.slice(0, 3).forEach(cls => {
          console.log(`   - ${cls.title} (${cls.reservations?.length || 0} reservaciones)`);
        });
      }
      console.log('');
    } catch (error) {
      console.log('❌ Error obteniendo clases:', error.response?.data?.message || error.message);
    }
    
    // Test 3: Get instructor students
    console.log('👥 Test 3: Obteniendo estudiantes del instructor...');
    try {
      const studentsRes = await axios.get(`${BASE_URL}/instructor/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✓ Estudiantes obtenidos: ${studentsRes.data?.length || 0}`);
      if (studentsRes.data && studentsRes.data.length > 0) {
        studentsRes.data.slice(0, 3).forEach(student => {
          console.log(`   - ${student.name} (${student.totalReservations} reservaciones)`);
        });
      }
      console.log('');
    } catch (error) {
      console.log('❌ Error obteniendo estudiantes:', error.response?.data?.message || error.message);
    }
    
    // Test 4: Get instructor earnings
    console.log('💰 Test 4: Obteniendo ganancias del instructor...');
    try {
      const earningsRes = await axios.get(`${BASE_URL}/instructor/earnings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✓ Ganancias obtenidas:');
      console.log(`   - Total: S/. ${earningsRes.data.totalEarnings || 0}`);
      console.log(`   - Clases: ${earningsRes.data.totalClasses || 0}`);
      console.log(`   - Pagos: ${earningsRes.data.totalPayments || 0}\n`);
    } catch (error) {
      console.log('❌ Error obteniendo ganancias:', error.response?.data?.message || error.message);
    }
    
    console.log('✅ Tests completados!');
    
  } catch (error) {
    console.error('❌ Error general:', error.response?.data || error.message);
  }
}

testInstructorEndpoints();
