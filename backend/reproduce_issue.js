
const fetch = require('node-fetch');

async function reproduce() {
  try {
    // 1. Login
    console.log('Logging in...');
    const loginRes = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'yerctech@gmail.com', password: 'admin123' })
    });

    if (!loginRes.ok) {
      console.error('Login failed:', await loginRes.text());
      return;
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Logged in. Token obtained.');

    // 2. Create Bulk Class
    const payload = {
      baseData: {
        title: "Clase Recurrente Test",
        description: "Test de reproducción de error 500",
        duration: 120,
        capacity: 5,
        price: 100,
        level: "BEGINNER",
        instructor: "Tester",
        studentDetails: "Traer toalla",
        images: []
      },
      beachId: 1, // Trying with ID 1, assuming it exists. If not, we might get 400 or 500 depending on handling.
      occurrences: [
        { date: "2025-12-25", time: "06:00" },
        { date: "2025-12-25", time: "08:00" },
        { date: "2026-01-01", time: "06:00" },
        { date: "2026-01-01", time: "08:00" }
      ]
    };

    console.log('Sending payload:', JSON.stringify(payload, null, 2));

    const res = await fetch('http://localhost:4000/classes/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    console.log('Response Status:', res.status);
    const text = await res.text();
    console.log('Response Body:', text);

  } catch (error) {
    console.error('Error:', error);
  }
}

reproduce();
