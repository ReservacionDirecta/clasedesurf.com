const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testStudentData() {
  try {
    console.log('🔐 Logging in as student Maria...\n');
    
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student1.trujillo@test.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    const user = loginRes.data.user;
    console.log('✓ Login exitoso');
    console.log(`   Usuario: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user.id}\n`);
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // Test 1: Get user profile
    console.log('👤 Test 1: PERFIL DEL ESTUDIANTE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const profileRes = await axios.get(`${BASE_URL}/users/profile`, { headers });
    console.log(`✓ Nombre: ${profileRes.data.name}`);
    console.log(`✓ Email: ${profileRes.data.email}`);
    console.log(`✓ Edad: ${profileRes.data.age || 'No registrada'}`);
    console.log(`✓ Puede nadar: ${profileRes.data.canSwim ? 'Sí' : 'No'}`);
    console.log(`✓ Teléfono: ${profileRes.data.phone || 'No registrado'}\n`);
    
    // Test 2: Get reservations
    console.log('📚 Test 2: RESERVACIONES DEL ESTUDIANTE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const reservationsRes = await axios.get(`${BASE_URL}/reservations`, { headers });
    console.log(`✓ Total de reservaciones: ${reservationsRes.data?.length || 0}\n`);
    
    if (reservationsRes.data && reservationsRes.data.length > 0) {
      reservationsRes.data.forEach((reservation, index) => {
        console.log(`   ${index + 1}. ${reservation.class?.title || 'Clase'}`);
        console.log(`      - Fecha: ${new Date(reservation.class?.date).toLocaleDateString('es-ES')}`);
        console.log(`      - Estado: ${reservation.status}`);
        console.log(`      - Precio: S/. ${reservation.class?.price || 0}`);
        console.log(`      - Nivel: ${reservation.class?.level || 'N/A'}`);
        console.log(`      - Ubicación: ${reservation.class?.location || 'N/A'}`);
        if (reservation.payment) {
          console.log(`      - Pago: ${reservation.payment.status} - S/. ${reservation.payment.amount}`);
        }
        console.log('');
      });
    }
    
    // Test 3: Get payments
    console.log('💰 Test 3: PAGOS DEL ESTUDIANTE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const paymentsRes = await axios.get(`${BASE_URL}/payments`, { headers });
    console.log(`✓ Total de pagos: ${paymentsRes.data?.length || 0}\n`);
    
    if (paymentsRes.data && paymentsRes.data.length > 0) {
      let totalPaid = 0;
      paymentsRes.data.forEach((payment, index) => {
        console.log(`   ${index + 1}. Pago #${payment.id}`);
        console.log(`      - Monto: S/. ${payment.amount}`);
        console.log(`      - Estado: ${payment.status}`);
        console.log(`      - Método: ${payment.paymentMethod || 'N/A'}`);
        console.log(`      - Fecha: ${new Date(payment.createdAt).toLocaleDateString('es-ES')}`);
        if (payment.status === 'PAID') {
          totalPaid += Number(payment.amount);
        }
        console.log('');
      });
      console.log(`   💵 Total pagado: S/. ${totalPaid}\n`);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TODOS LOS TESTS COMPLETADOS!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testStudentData();
