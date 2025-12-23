const { Client } = require('pg');
require('dotenv').config();

async function checkOperators() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  
  const result = await client.query('SELECT operator_id, name, email, password_hash FROM "Operators"');
  
  console.log('\n📋 OPERATORS IN DATABASE:\n');
  result.rows.forEach(op => {
    console.log(`✅ Operator ID: ${op.operator_id}`);
    console.log(`   📧 Email: ${op.email}`);
    console.log(`   👤 Name: ${op.name}`);
    console.log(`   🔑 Password: ${op.password_hash}`);
    console.log('');
  });
  
  await client.end();
}

checkOperators();
