require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST || '/tmp',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'mirage_db',
  user: process.env.PGUSER || 'Macbook',
});

pool.on('error', (error) => {
  console.error('Error inesperado en PostgreSQL:', error.message);
});

module.exports = pool;
