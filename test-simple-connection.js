import pkg from 'pg';
const { Pool } = pkg;

async function testConnection() {
  console.log('Testing simple database connection...');
  
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'time_tracker_db',
    password: 'postgres',
    port: 5432,
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
    console.error('Full error:', error);
  }
}

testConnection();