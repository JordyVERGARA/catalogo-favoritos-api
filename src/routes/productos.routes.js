const { Router } = require('express');
const ctrl = require('../controllers/productos.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

// Públicas
router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);

// Solo administrador: primero se verifica el token (401) y luego el rol (403)
router.post('/', verificarToken, requiereRol('admin'), ctrl.crear);
router.put('/:id', verificarToken, requiereRol('admin'), ctrl.actualizar);
router.delete('/:id', verificarToken, requiereRol('admin'), ctrl.eliminar);

module.exports = router;
