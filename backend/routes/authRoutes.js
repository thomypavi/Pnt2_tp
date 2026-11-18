/**
 * RUTAS DE AUTENTICACIÓN
 * 
 * Define las rutas relacionadas con autenticación de usuarios.
 * Las rutas de registro y login son públicas (no requieren autenticación).
 * La ruta /me requiere autenticación para obtener el usuario actual.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

/**
 * RUTAS PÚBLICAS
 * 
 * Estas rutas no requieren autenticación porque son para:
 * - Registrar nuevos usuarios (register)
 * - Iniciar sesión (login)
 */
router.post('/register', authController.register);
router.post('/login', authController.login);

/**
 * RUTA PROTEGIDA
 * 
 * Esta ruta requiere autenticación (middleware authenticate).
 * Permite obtener la información del usuario autenticado usando el token JWT.
 */
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;

