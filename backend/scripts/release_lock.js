const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function releaseLock() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to DB');
    
    // DROP SCHEMA public and RECREATE it to wipe everything
    await client.query('DROP SCHEMA public CASCADE');
    await client.query('CREATE SCHEMA public');
    await client.query('GRANT ALL ON SCHEMA public TO public');
    console.log('Dropped and recreated schema public');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

releaseLock();
