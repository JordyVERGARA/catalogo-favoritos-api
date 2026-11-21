const Productos = require('../models/productos.model');
const { responder, ErrorHttp } = require('../utils/http');
const { validarId, validarProducto } = require('../utils/validaciones');

// GET /api/productos?categoria=hogar  (público)
const listar = async (req, res) => {
  const { categoria } = req.query;
  if (categoria !== undefined && (typeof categoria !== 'string' || categoria.trim() === '')) {
    throw new ErrorHttp(400, 'El filtro categoria no puede estar vacío');
  }
  const productos = await Productos.listar(categoria ? categoria.trim() : undefined);
  return responder(res, 200, productos);
};

// GET /api/productos/:id  (público)
const obtener = async (req, res) => {
  const id = validarId(req.params.id);
  const producto = await Productos.buscarPorId(id);
  if (!producto) throw new ErrorHttp(404, 'Producto no encontrado');
  return responder(res, 200, producto);
};

// POST /api/productos  (admin)
const crear = async (req, res) => {
  const datos = validarProducto(req.body || {});
  const producto = await Productos.crear(datos);
  return responder(res, 201, producto, 'Producto creado');
};

// PUT /api/productos/:id  (admin)
const actualizar = async (req, res) => {
  const id = validarId(req.params.id);
  const datos = validarProducto(req.body || {}, true);
  const producto = await Productos.actualizar(id, datos);
  if (!producto) throw new ErrorHttp(404, 'Producto no encontrado');
  return responder(res, 200, producto, 'Producto actualizado');
};

// DELETE /api/productos/:id  (admin) — sus favoritos se eliminan en cascada
const eliminar = async (req, res) => {
  const id = validarId(req.params.id);
  const producto = await Productos.eliminar(id);
  if (!producto) throw new ErrorHttp(404, 'Producto no encontrado');
  return responder(res, 200, { id: producto.id }, 'Producto eliminado (y retirado de los favoritos que lo contenían)');
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
