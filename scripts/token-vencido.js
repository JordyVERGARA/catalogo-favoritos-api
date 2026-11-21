require('dotenv').config({ quiet: true });
const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en .env');
  process.exit(1);
}

const ahora = Math.floor(Date.now() / 1000);
const token = jwt.sign(
  { sub: 1, rol: 'usuario', iat: ahora - 7200, exp: ahora - 3600 },
  process.env.JWT_SECRET,
  { algorithm: 'HS256' }
);
console.log(token);
