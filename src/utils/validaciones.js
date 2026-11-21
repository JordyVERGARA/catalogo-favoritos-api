const { ErrorHttp } = require('./http');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const textoVacio = (v) => typeof v !== 'string' || v.trim() === '';

const soloCampos = (body, permitidos) => {
  const extra = Object.keys(body).filter((k) => !permitidos.includes(k));
  if (extra.length) {
    throw new ErrorHttp(400, 'La petición contiene campos no permitidos', extra.map((c) => `Campo no permitido: ${c}`));
  }
};

const validarId = (valor, nombre = 'id') => {
  const n = Number(valor);
  if (!Number.isInteger(n) || n <= 0 || !/^\d+$/.test(String(valor))) {
    throw new ErrorHttp(400, `El ${nombre} debe ser un entero positivo`);
  }
  return n;
};

const validarRegistro = (body) => {
  soloCampos(body, ['nombre', 'email', 'password', 'rol']);
  const vacios = ['nombre', 'email', 'password'].filter((c) => textoVacio(body[c]));
  if (vacios.length) throw new ErrorHttp(400, 'Faltan campos obligatorios', vacios.map((c) => `${c} es obligatorio`));

  const errores = [];
  if (!EMAIL_REGEX.test(body.email.trim())) errores.push('email no tiene un formato válido');
  if (body.password.length < 6) errores.push('password debe tener al menos 6 caracteres');
  if (body.nombre.trim().length > 100) errores.push('nombre admite máximo 100 caracteres');
  if (errores.length) throw new ErrorHttp(422, 'Datos inválidos', errores);

  return { nombre: body.nombre.trim(), email: body.email.trim().toLowerCase(), password: body.password };
};

const validarLogin = (body) => {
  const vacios = ['email', 'password'].filter((c) => textoVacio(body[c]));
  if (vacios.length) throw new ErrorHttp(400, 'Faltan campos obligatorios', vacios.map((c) => `${c} es obligatorio`));
  return { email: body.email.trim().toLowerCase(), password: body.password };
};

const validarProducto = (body, parcial = false) => {
  const campos = ['nombre', 'descripcion', 'categoria', 'precio'];
  soloCampos(body, campos);

  const presentes = campos.filter((c) => body[c] !== undefined);
  if (parcial && presentes.length === 0) {
    throw new ErrorHttp(400, 'Debe enviar al menos un campo para actualizar', campos.map((c) => `Permitido: ${c}`));
  }

  const errores400 = [];
  for (const c of ['nombre', 'descripcion', 'categoria']) {
    if (!parcial || body[c] !== undefined) {
      if (textoVacio(body[c])) errores400.push(`${c} es obligatorio y no puede estar vacío`);
    }
  }
  if (!parcial || body.precio !== undefined) {
    if (body.precio === undefined || body.precio === null || body.precio === '') errores400.push('precio es obligatorio');
    else if (typeof body.precio !== 'number' || Number.isNaN(body.precio)) errores400.push('precio debe ser numérico');
  }
  if (errores400.length) throw new ErrorHttp(400, 'Faltan campos obligatorios o tienen un tipo incorrecto', errores400);

  if (body.precio !== undefined && body.precio <= 0) {
    throw new ErrorHttp(422, 'Datos inválidos', ['precio debe ser mayor que cero']);
  }

  const limpio = {};
  for (const c of presentes) limpio[c] = typeof body[c] === 'string' ? body[c].trim() : body[c];
  if (limpio.categoria) limpio.categoria = limpio.categoria.toLowerCase();
  return limpio;
};

module.exports = { validarId, validarRegistro, validarLogin, validarProducto, soloCampos };
