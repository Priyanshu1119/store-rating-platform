require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error:', err.message);
});

// All queries in the app go through this helper and use $1, $2... placeholders.
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
