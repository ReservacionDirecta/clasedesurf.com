// Simple test to check proxy functionality
const fetch = require('node-fetch');

async function testProxy() {
  try {
    console.log('Testing proxy endpoint...');
    
    const response = await fetch('http://localhost:3000/api/schools', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers));
    
    const text = await response.text();
    console.log('Response:', text);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testProxy();