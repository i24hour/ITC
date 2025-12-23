const { Client } = require('pg');
require('dotenv').config();

async function addSupervisor() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  
  try {
    // Delete if exists
    await client.query(`DELETE FROM "Supervisors" WHERE supervisor_id = $1`, ['n@gmail.com']);
    
    // Insert new
    await client.query(`
      INSERT INTO "Supervisors" (supervisor_id, email, password, name)
      VALUES ($1, $2, $3, $4)
    `, ['n@gmail.com', 'n@gmail.com', '1234', 'N Supervisor']);
    
    console.log('✅ Added n@gmail.com');
    console.log('📧 Email: n@gmail.com');
    console.log('🔑 Password: 1234');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  await client.end();
}

addSupervisor();
