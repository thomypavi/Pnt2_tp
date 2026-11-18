/**
 * RUTAS DE ADMINISTRACIÓN — /api/admin/...
 *
 * router.use(authenticate, requireAdmin) aplica los dos middlewares a TODAS
 * las rutas de este archivo, en orden:
 *   1. authenticate → verifica el token y carga req.user (si falla: 401)
 *   2. requireAdmin → verifica que req.user.role sea 'admin' (si falla: 403)
 */
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/requireAdmin');

router.use(authenticate, requireAdmin);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', adminController.updateUserRole);

module.exports = router;
