const { ErrorHttp } = require('../utils/http');

const rutaNoEncontrada = (req, res, next) => {
  next(new ErrorHttp(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};

const manejadorErrores = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, mensaje: 'El cuerpo de la petición no es un JSON válido' });
  }

  if (err.code === '23505') return res.status(409).json({ ok: false, mensaje: 'El registro ya existe' });
  if (err.code === '23503') return res.status(404).json({ ok: false, mensaje: 'La referencia indicada no existe' });
  if (err.code === '23514') return res.status(422).json({ ok: false, mensaje: 'Los datos no cumplen las reglas de validación' });

  if (err instanceof ErrorHttp) {
    const cuerpo = { ok: false, mensaje: err.message };
    if (err.errores) cuerpo.errores = err.errores;
    return res.status(err.status).json(cuerpo);
  }

  console.error('[Error interno]', err.message);
  return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
};

module.exports = { rutaNoEncontrada, manejadorErrores };
