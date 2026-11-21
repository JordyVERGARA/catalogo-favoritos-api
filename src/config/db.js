// Conexión a PostgreSQL usando variables de entorno
require('dotenv').config({ quiet: true });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Todas las consultas pasan por aquí y SIEMPRE son parametrizadas ($1, $2...)
const query = (texto, parametros) => pool.query(texto, parametros);

module.exports = { pool, query };
