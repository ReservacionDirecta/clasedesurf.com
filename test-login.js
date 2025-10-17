// Script rápido para probar el endpoint de login
const fetch = global.fetch || require('node-fetch');

async function testLogin() {
  try {
    const response = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'schooladmin@surfschool.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.user) {
      console.log('\n📊 Análisis:');
      console.log('- Usuario ID:', data.user.id);
      console.log('- Nombre:', data.user.name);
      console.log('- Rol:', data.user.role);
      console.log('- Tiene instructor?:', data.user.instructor ? 'SÍ' : 'NO');
      
      if (data.user.instructor) {
        console.log('- Instructor ID:', data.user.instructor.id);
        console.log('- School ID:', data.user.instructor.schoolId);
        console.log('- School Name:', data.user.instructor.school?.name);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();
