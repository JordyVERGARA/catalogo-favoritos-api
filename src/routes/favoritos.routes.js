const { Router } = require('express');
const ctrl = require('../controllers/favoritos.controller');
const { verificarToken } = require('../middlewares/auth');

const router = Router();

// Todas requieren usuario autenticado (cualquier rol)
router.use(verificarToken);

router.get('/', ctrl.listar);
router.post('/', ctrl.agregar);
router.delete('/:productoId', ctrl.quitar);

module.exports = router;
