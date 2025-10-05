const fetch = require('node-fetch');

const BACKEND_URL = 'http://localhost:4000';
const FRONTEND_URL = 'http://localhost:3000';

async function testEndpoint(url, description) {
  try {
    console.log(`\n🔍 Testing: ${description}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.text();
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📄 Response: ${data.substring(0, 100)}${data.length > 100 ? '...' : ''}`);
    } else {
      console.log(`   ❌ Status: ${response.status}`);
      const error = await response.text();
      console.log(`   📄 Error: ${error.substring(0, 100)}${error.length > 100 ? '...' : ''}`);
    }
  } catch (error) {
    console.log(`   💥 Connection Error: ${error.message}`);
  }
}

async function testConnectivity() {
  console.log('🚀 Testing Frontend-Backend Connectivity\n');
  console.log('=' .repeat(50));
  
  // Test Backend Direct Endpoints
  console.log('\n📡 BACKEND DIRECT ENDPOINTS:');
  await testEndpoint(`${BACKEND_URL}/`, 'Backend Root');
  await testEndpoint(`${BACKEND_URL}/test/123`, 'Backend Test Route');
  await testEndpoint(`${BACKEND_URL}/db-test`, 'Database Connection');
  await testEndpoint(`${BACKEND_URL}/schools`, 'Schools API');
  await testEndpoint(`${BACKEND_URL}/classes`, 'Classes API');
  await testEndpoint(`${BACKEND_URL}/users`, 'Users API (should require auth)');
  
  // Test Frontend Proxy Endpoints
  console.log('\n🔄 FRONTEND PROXY ENDPOINTS:');
  await testEndpoint(`${FRONTEND_URL}/api/schools`, 'Schools via Proxy');
  await testEndpoint(`${FRONTEND_URL}/api/classes`, 'Classes via Proxy');
  await testEndpoint(`${FRONTEND_URL}/api/instructors`, 'Instructors via Proxy');
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Connectivity Test Complete');
}

// Run the test
testConnectivity().catch(console.error);