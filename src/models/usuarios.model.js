// Acceso a datos: tabla usuarios
const { query } = require('../config/db');

// Columnas públicas: NUNCA se devuelve password_hash
const PUBLICAS = 'id, nombre, email, rol, creado_en';

const crear = async ({ nombre, email, passwordHash, rol = 'usuario' }) => {
  const { rows } = await query(
    `INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4) RETURNING ${PUBLICAS}`,
    [nombre, email, passwordHash, rol]
  );
  return rows[0];
};

// Solo para login: incluye el hash para compararlo, nunca se envía al cliente
const buscarPorEmailConHash = async (email) => {
  const { rows } = await query('SELECT id, nombre, email, rol, password_hash FROM usuarios WHERE email = $1', [email]);
  return rows[0];
};

const buscarPorId = async (id) => {
  const { rows } = await query(`SELECT ${PUBLICAS} FROM usuarios WHERE id = $1`, [id]);
  return rows[0];
};

module.exports = { crear, buscarPorEmailConHash, buscarPorId };
