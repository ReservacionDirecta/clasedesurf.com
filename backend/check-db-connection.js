#!/usr/bin/env node

const { Client } = require('pg');

const config = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres' // Connect to default database first
};

async function checkConnection() {
  const client = new Client(config);
  
  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    console.log('✓ Connected to PostgreSQL\n');
    
    // List databases
    const result = await client.query(`
      SELECT datname FROM pg_database 
      WHERE datistemplate = false 
      ORDER BY datname;
    `);
    
    console.log('Available databases:');
    result.rows.forEach(row => {
      console.log(`  - ${row.datname}`);
    });
    
    // Check if clasedesurf.com exists
    const hasDB = result.rows.some(row => row.datname === 'clasedesurf.com');
    
    if (!hasDB) {
      console.log('\n❌ Database "clasedesurf.com" does not exist');
      console.log('Creating database...');
      
      await client.query('CREATE DATABASE "clasedesurf.com"');
      console.log('✓ Database created successfully');
    } else {
      console.log('\n✓ Database "clasedesurf.com" exists');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === '28P01') {
      console.error('\nAuthentication failed. Please check:');
      console.error('1. PostgreSQL is running');
      console.error('2. Username is "postgres"');
      console.error('3. Password is "postgres"');
      console.error('4. PostgreSQL is accepting connections on localhost:5432');
    }
  } finally {
    await client.end();
  }
}

checkConnection();
