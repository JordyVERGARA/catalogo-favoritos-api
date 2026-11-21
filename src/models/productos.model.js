// Acceso a datos: tabla productos (consultas parametrizadas)
const { query } = require('../config/db');

const COLUMNAS = 'id, nombre, descripcion, categoria, precio::float AS precio, creado_en, actualizado_en';

const listar = async (categoria) => {
  if (categoria) {
    const { rows } = await query(
      `SELECT ${COLUMNAS} FROM productos WHERE LOWER(categoria) = LOWER($1) ORDER BY id`,
      [categoria]
    );
    return rows;
  }
  const { rows } = await query(`SELECT ${COLUMNAS} FROM productos ORDER BY id`);
  return rows;
};

const buscarPorId = async (id) => {
  const { rows } = await query(`SELECT ${COLUMNAS} FROM productos WHERE id = $1`, [id]);
  return rows[0];
};

const crear = async ({ nombre, descripcion, categoria, precio }) => {
  const { rows } = await query(
    `INSERT INTO productos (nombre, descripcion, categoria, precio)
     VALUES ($1, $2, $3, $4) RETURNING ${COLUMNAS}`,
    [nombre, descripcion, categoria, precio]
  );
  return rows[0];
};

// Actualización parcial: solo cambia los campos enviados (COALESCE conserva los demás)
const actualizar = async (id, { nombre, descripcion, categoria, precio }) => {
  const { rows } = await query(
    `UPDATE productos SET
       nombre = COALESCE($2, nombre),
       descripcion = COALESCE($3, descripcion),
       categoria = COALESCE($4, categoria),
       precio = COALESCE($5, precio),
       actualizado_en = NOW()
     WHERE id = $1
     RETURNING ${COLUMNAS}`,
    [id, nombre ?? null, descripcion ?? null, categoria ?? null, precio ?? null]
  );
  return rows[0];
};

// Al eliminar, los favoritos asociados se borran por ON DELETE CASCADE
const eliminar = async (id) => {
  const { rows } = await query(`DELETE FROM productos WHERE id = $1 RETURNING ${COLUMNAS}`, [id]);
  return rows[0];
};

module.exports = { listar, buscarPorId, crear, actualizar, eliminar };
