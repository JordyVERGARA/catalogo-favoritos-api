const jwt = require('jsonwebtoken');
const { ErrorHttp } = require('../utils/http');

const verificarToken = (req, res, next) => {
  const cabecera = req.headers.authorization || '';
  const [tipo, token] = cabecera.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return next(new ErrorHttp(401, 'Token no proporcionado. Use Authorization: Bearer <token>'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    req.usuario = { id: payload.sub, rol: payload.rol };
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return next(new ErrorHttp(401, 'Token vencido. Inicie sesión nuevamente'));
    return next(new ErrorHttp(401, 'Token inválido'));
  }
};

const requiereRol = (...roles) => (req, res, next) => {
  if (!req.usuario || !roles.includes(req.usuario.rol)) {
    return next(new ErrorHttp(403, 'No tiene permisos para realizar esta acción'));
  }
  return next();
};

module.exports = { verificarToken, requiereRol };
