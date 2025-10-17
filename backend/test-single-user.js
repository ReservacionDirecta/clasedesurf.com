#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'http://localhost:4000';

async function test() {
  console.log('Testing admin.lima@test.com...\n');

  // Login
  const loginRes = await axios.post(`${API_URL}/auth/login`, {
    email: 'admin.lima@test.com',
    password: 'password123'
  });

  console.log('✓ Login successful');
  console.log('Token:', loginRes.data.token.substring(0, 20) + '...\n');

  // Get classes
  const classesRes = await axios.get(`${API_URL}/classes`, {
    headers: { Authorization: `Bearer ${loginRes.data.token}` }
  });

  console.log(`Classes returned: ${classesRes.data.length}`);
  classesRes.data.forEach(c => {
    console.log(`  - ${c.title} (School ID: ${c.schoolId})`);
  });
}

test().catch(err => {
  console.error('Error:', err.response?.data || err.message);
  console.error('Full error:', err);
});
