const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuarios = require('../models/usuarios.model');
const { responder, ErrorHttp } = require('../utils/http');
const { validarRegistro, validarLogin } = require('../utils/validaciones');

// POST /api/auth/registro  (público)
const registro = async (req, res) => {
  const { nombre, email, password } = validarRegistro(req.body || {});

  const existente = await Usuarios.buscarPorEmailConHash(email);
  if (existente) throw new ErrorHttp(409, 'El correo ya está registrado');

  const passwordHash = await bcrypt.hash(password, 10);
  // El rol se fija en "usuario"; se ignora cualquier "rol" enviado por el cliente
  const usuario = await Usuarios.crear({ nombre, email, passwordHash, rol: 'usuario' });

  return responder(res, 201, usuario, 'Usuario registrado correctamente');
};

// POST /api/auth/login  (público)
const login = async (req, res) => {
  const { email, password } = validarLogin(req.body || {});

  const usuario = await Usuarios.buscarPorEmailConHash(email);
  const valido = usuario && (await bcrypt.compare(password, usuario.password_hash));
  // Mismo mensaje para correo inexistente o contraseña incorrecta (no revela cuál falló)
  if (!valido) throw new ErrorHttp(401, 'Credenciales incorrectas');

  const token = jwt.sign(
    { sub: usuario.id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h', algorithm: 'HS256' }
  );

  return responder(res, 200, {
    token,
    tipo: 'Bearer',
    expiraEn: process.env.JWT_EXPIRES_IN || '1h',
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
  }, 'Inicio de sesión correcto');
};

module.exports = { registro, login };
