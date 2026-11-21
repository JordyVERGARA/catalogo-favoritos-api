require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
    await pool.query(sql);
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM productos');
    console.log(`Base de datos inicializada. Productos de ejemplo: ${rows[0].total}`);
  } catch (err) {
    console.error('Error al inicializar la base de datos:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
