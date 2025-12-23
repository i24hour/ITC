const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function checkUsers() {
  await client.connect();
  
  console.log('\n📋 SUPERVISORS:');
  const supervisors = await client.query('SELECT supervisor_id, email, password FROM Supervisors');
  supervisors.rows.forEach(s => {
    console.log(`  - ID: ${s.supervisor_id}, Email: ${s.email}, Has Password: ${s.password ? 'Yes' : 'No'}`);
  });
  
  console.log('\n📋 OPERATORS:');
  const operators = await client.query('SELECT operator_id, email FROM Operators LIMIT 5');
  operators.rows.forEach(o => {
    console.log(`  - ID: ${o.operator_id}, Email: ${o.email}`);
  });
  
  await client.end();
}

checkUsers().catch(console.error);
