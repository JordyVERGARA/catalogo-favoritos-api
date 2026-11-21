require('dotenv').config({ quiet: true });
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

(async () => {
  const nombre = process.env.ADMIN_NOMBRE || 'Administrador';
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';

  if (!email || password.length < 6) {
    console.error('Defina ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 6 caracteres) en .env');
    process.exitCode = 1;
    return pool.end();
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, rol = 'admin'
       RETURNING id, email, rol`,
      [nombre, email, hash]
    );
    console.log(`Administrador listo: ${rows[0].email} (id ${rows[0].id}, rol ${rows[0].rol})`);
  } catch (err) {
    console.error('Error al crear el administrador:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
