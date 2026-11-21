const responder = (res, status, data, mensaje) => {
  const cuerpo = { ok: true };
  if (mensaje) cuerpo.mensaje = mensaje;
  if (data !== undefined) cuerpo.data = data;
  return res.status(status).json(cuerpo);
};

class ErrorHttp extends Error {
  constructor(status, mensaje, errores) {
    super(mensaje);
    this.status = status;
    this.errores = errores;
  }
}

module.exports = { responder, ErrorHttp };
