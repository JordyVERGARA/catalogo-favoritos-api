// Genera un JWT YA VENCIDO (firmado con el JWT_SECRET local) para probar el 401 por expiración.
// Uso: npm run token:vencido  -> copiar el valor en la variable "tokenVencido" del entorno de Postman.
require('dotenv').config({ quiet: true });
const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en .env');
  process.exit(1);
}

const ahora = Math.floor(Date.now() / 1000);
const token = jwt.sign(
  { sub: 1, rol: 'usuario', iat: ahora - 7200, exp: ahora - 3600 }, // venció hace 1 hora
  process.env.JWT_SECRET,
  { algorithm: 'HS256' }
);
console.log(token);
