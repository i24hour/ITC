const { Client } = require('pg');
require('dotenv').config();

async function addBinsHeldColumn() {
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
    console.log('🔧 Adding bins_held column to Pending_Tasks table...');
    
    await client.query(`
      ALTER TABLE "Pending_Tasks" 
      ADD COLUMN IF NOT EXISTS bins_held JSONB
    `);
    
    console.log('✅ bins_held column added successfully!');
    
    // Test insert
    const testResult = await client.query(`
      INSERT INTO "Pending_Tasks" (operator_id, task_type, sku, bins_held, expires_at)
      VALUES ($1, $2, $3, $4::jsonb, NOW() + interval '30 seconds')
      RETURNING *
    `, ['OP002', 'incoming', 'TEST-SKU', JSON.stringify([{binNo: 'A01', cfc: 100}])]);
    
    console.log('✅ Test insert successful:', testResult.rows[0].id);
    
    // Delete test record
    await client.query(`DELETE FROM "Pending_Tasks" WHERE id = $1`, [testResult.rows[0].id]);
    console.log('✅ Test record cleaned up');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  await client.end();
}

addBinsHeldColumn();
