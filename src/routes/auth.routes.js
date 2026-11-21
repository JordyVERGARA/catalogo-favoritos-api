const { Router } = require('express');
const ctrl = require('../controllers/auth.controller');

const router = Router();

router.post('/registro', ctrl.registro); // Público
router.post('/login', ctrl.login);       // Público

module.exports = router;
