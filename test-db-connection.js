import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });
  
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully!');
    
    const result = await client.query('SELECT username, name FROM users LIMIT 1');
    console.log('✅ Test query successful:', result.rows);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();