const { query } = require('../config/db');

const listarPorUsuario = async (usuarioId) => {
  const { rows } = await query(
    `SELECT p.id, p.nombre, p.descripcion, p.categoria, p.precio::float AS precio, f.agregado_en
       FROM favoritos f
       JOIN productos p ON p.id = f.producto_id
      WHERE f.usuario_id = $1
      ORDER BY f.agregado_en DESC`,
    [usuarioId]
  );
  return rows;
};

const agregar = async (usuarioId, productoId) => {
  const { rows } = await query(
    'INSERT INTO favoritos (usuario_id, producto_id) VALUES ($1, $2) RETURNING usuario_id, producto_id, agregado_en',
    [usuarioId, productoId]
  );
  return rows[0];
};

const quitar = async (usuarioId, productoId) => {
  const { rowCount } = await query(
    'DELETE FROM favoritos WHERE usuario_id = $1 AND producto_id = $2',
    [usuarioId, productoId]
  );
  return rowCount > 0;
};

module.exports = { listarPorUsuario, agregar, quitar };
