const Favoritos = require('../models/favoritos.model');
const Productos = require('../models/productos.model');
const { responder, ErrorHttp } = require('../utils/http');
const { validarId, soloCampos } = require('../utils/validaciones');

// La identidad SIEMPRE sale de req.usuario (token verificado), nunca del body o la URL.

// GET /api/favoritos
const listar = async (req, res) => {
  const favoritos = await Favoritos.listarPorUsuario(req.usuario.id);
  return responder(res, 200, favoritos);
};

// POST /api/favoritos   body: { "productoId": 1 }
const agregar = async (req, res) => {
  const body = req.body || {};
  soloCampos(body, ['productoId']); // rechaza p. ej. "usuarioId" enviado por el cliente
  if (body.productoId === undefined) throw new ErrorHttp(400, 'productoId es obligatorio');
  const productoId = validarId(body.productoId, 'productoId');

  const producto = await Productos.buscarPorId(productoId);
  if (!producto) throw new ErrorHttp(404, 'El producto no existe');

  try {
    const favorito = await Favoritos.agregar(req.usuario.id, productoId);
    return responder(res, 201, { ...favorito, producto }, 'Producto agregado a favoritos');
  } catch (err) {
    if (err.code === '23505') throw new ErrorHttp(409, 'El producto ya está en sus favoritos');
    throw err;
  }
};

// DELETE /api/favoritos/:productoId
const quitar = async (req, res) => {
  const productoId = validarId(req.params.productoId, 'productoId');
  const eliminado = await Favoritos.quitar(req.usuario.id, productoId);
  // Si el favorito no es del usuario (p. ej. es de otro usuario) responde 404: no revela datos ajenos
  if (!eliminado) throw new ErrorHttp(404, 'El producto no está en sus favoritos');
  return responder(res, 200, { productoId }, 'Producto quitado de favoritos');
};

module.exports = { listar, agregar, quitar };
