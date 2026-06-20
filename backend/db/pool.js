
const { Pool } = require('pg');
require('dotenv').config();
 
// Si existe DATABASE_URL (producción en Railway/Supabase/Neon), úsala directamente
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // necesario en la mayoría de proveedores cloud
    })
  : new Pool({
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME     || 'boxing_club',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || '',
    });
 
pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('✅ Conectado a PostgreSQL');
  }
});
 
pool.on('error', (err) => {
  console.error('❌ Error en el pool de PostgreSQL:', err.message);
  process.exit(-1);
});
 
module.exports = pool;