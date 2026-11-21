const { Router } = require('express');
const ctrl = require('../controllers/productos.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);

router.post('/', verificarToken, requiereRol('admin'), ctrl.crear);
router.put('/:id', verificarToken, requiereRol('admin'), ctrl.actualizar);
router.delete('/:id', verificarToken, requiereRol('admin'), ctrl.eliminar);

module.exports = router;
