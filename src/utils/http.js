// Formato JSON consistente para todas las respuestas

// Éxito: { ok: true, mensaje?, data }
const responder = (res, status, data, mensaje) => {
  const cuerpo = { ok: true };
  if (mensaje) cuerpo.mensaje = mensaje;
  if (data !== undefined) cuerpo.data = data;
  return res.status(status).json(cuerpo);
};

// Error controlado que el manejador central convierte en { ok: false, mensaje, errores? }
class ErrorHttp extends Error {
  constructor(status, mensaje, errores) {
    super(mensaje);
    this.status = status;
    this.errores = errores;
  }
}

module.exports = { responder, ErrorHttp };
