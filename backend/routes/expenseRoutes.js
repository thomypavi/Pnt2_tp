/**
 * RUTAS DE GASTOS
 * 
 * Define todas las rutas relacionadas con gastos.
 * Todas las rutas requieren autenticación (middleware authenticate).
 * Las rutas que operan sobre un gasto específico también requieren
 * validación de propiedad (middleware checkExpenseOwnership).
 */

const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticate } = require('../middleware/auth');
const { checkExpenseOwnership } = require('../middleware/checkOwnership');

/**
 * IMPORTANTE: Orden de las rutas
 * 
 * Express evalúa las rutas en orden. Las rutas más específicas deben ir
 * ANTES de las rutas con parámetros dinámicos.
 * 
 * Ejemplo:
 * - GET /exchange-rate debe ir ANTES de GET /:id
 * - PATCH /:id/mark-as-paid debe ir ANTES de GET /:id
 * 
 * Si no, Express podría interpretar "exchange-rate" como un ID.
 */

// Ruta específica: Obtener tasa de conversión (sin parámetros)
router.get('/exchange-rate', authenticate, expenseController.getExchangeRate);

// Ruta: Listar todos los gastos (sin parámetros)
router.get('/', authenticate, expenseController.getAllExpenses);

// Ruta: Crear nuevo gasto (sin parámetros)
router.post('/', authenticate, expenseController.createExpense);

// Ruta específica: Marcar gasto como pagado (con parámetro :id)
router.patch('/:id/mark-as-paid', authenticate, checkExpenseOwnership, expenseController.markAsPaid);

// Ruta: Obtener gasto por ID (con parámetro :id)
router.get('/:id', authenticate, checkExpenseOwnership, expenseController.getExpenseById);

// Ruta: Actualizar gasto (con parámetro :id)
router.put('/:id', authenticate, checkExpenseOwnership, expenseController.updateExpense);

// Ruta: Eliminar gasto (con parámetro :id)
router.delete('/:id', authenticate, checkExpenseOwnership, expenseController.deleteExpense);

module.exports = router;

