const { Router } = require('express');
const ctrl = require('../controllers/auth.controller');

const router = Router();

router.post('/registro', ctrl.registro);
router.post('/login', ctrl.login);

module.exports = router;
