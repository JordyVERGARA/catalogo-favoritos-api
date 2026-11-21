require('dotenv').config({ quiet: true });
const app = require('./app');
const { pool } = require('./config/db');

const PORT = Number(process.env.PORT) || 3000;

if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en el archivo .env');
  process.exit(1);
}

pool.query('SELECT 1')
  .then(() => {
    app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}/api`));
  })
  .catch((err) => {
    console.error('No se pudo conectar a PostgreSQL:', err.message);
    process.exit(1);
  });
