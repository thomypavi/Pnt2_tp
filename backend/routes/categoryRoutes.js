/**
 * RUTAS DE CATEGORÍAS
 * 
 * Define todas las rutas relacionadas con categorías.
 * Todas las rutas requieren autenticación (middleware authenticate).
 * Las rutas que operan sobre una categoría específica también requieren
 * validación de propiedad (middleware checkCategoryOwnership).
 */

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');
const { checkCategoryOwnership } = require('../middleware/checkOwnership');

/**
 * RUTAS CRUD PARA CATEGORÍAS
 * 
 * Todas las rutas están protegidas (requieren autenticación).
 * Las rutas con :id también validan que la categoría pertenezca al usuario.
 */

// Listar todas las categorías del usuario
router.get('/', authenticate, categoryController.getAllCategories);

// Sugerir categoría para un gasto según comercio/descripción (va antes de las rutas con :id)
router.post('/suggest', authenticate, categoryController.suggestCategory);

// Obtener una categoría específica por ID
router.get('/:id', authenticate, checkCategoryOwnership, categoryController.getCategoryById);

// Crear una nueva categoría
router.post('/', authenticate, categoryController.createCategory);

// Actualizar una categoría existente
router.put('/:id', authenticate, checkCategoryOwnership, categoryController.updateCategory);

// Eliminar una categoría
router.delete('/:id', authenticate, checkCategoryOwnership, categoryController.deleteCategory);

module.exports = router;

