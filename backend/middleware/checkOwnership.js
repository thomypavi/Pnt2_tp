/**
 * MIDDLEWARE DE VALIDACIÓN DE PROPIEDAD
 * 
 * Estos middlewares verifican que un recurso (gasto o categoría) pertenezca
 * al usuario autenticado antes de permitir operaciones sobre él.
 * 
 * IMPORTANTE: Previene que usuarios accedan a recursos de otros usuarios
 * cambiando el ID en la URL. Por ejemplo, sin esto, un usuario podría hacer
 * DELETE /api/expenses/123 aunque el gasto 123 pertenezca a otro usuario.
 */

const { Expense, Category } = require('../models');

/**
 * VALIDAR PROPIEDAD DE GASTO
 * 
 * Middleware que verifica que el gasto con el ID especificado pertenezca
 * al usuario autenticado.
 * 
 * Uso: Se coloca después de authenticate y antes del controlador
 * Ejemplo: router.get('/:id', authenticate, checkExpenseOwnership, getExpenseById)
 * 
 * Proceso:
 * 1. Extrae el ID del gasto de los parámetros de la URL
 * 2. Obtiene el userId del request (agregado por authenticate)
 * 3. Busca el gasto que coincida con el ID Y el userId
 * 4. Si existe, lo agrega a req.expense para que el controlador lo use
 * 5. Si no existe o no pertenece al usuario, responde con error
 */
exports.checkExpenseOwnership = async (req, res, next) => {
  try {
    // Extraer ID de los parámetros de la URL (ej: /api/expenses/123 -> id = "123")
    const { id } = req.params;
    
    // Obtener userId del request (agregado por el middleware authenticate)
    const userId = req.userId;

    // Validar que el ID esté presente
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID de gasto requerido'
      });
    }

    /**
     * Convertir ID a número
     * 
     * Los parámetros de URL vienen como strings. parseInt() los convierte a número.
     * El segundo parámetro (10) especifica que es base 10 (decimal).
     * 
     * Esto es importante porque Sequelize espera números para campos INTEGER.
     */
    const expenseId = parseInt(id, 10);
    
    // Validar que la conversión fue exitosa (isNaN = "is Not a Number")
    if (isNaN(expenseId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de gasto inválido'
      });
    }

    /**
     * Buscar gasto que coincida con el ID Y el userId
     * 
     * La condición where busca un gasto que:
     * - Tenga el id especificado
     * - Y pertenezca al usuario autenticado
     * 
     * Si el gasto existe pero pertenece a otro usuario, findOne retornará null.
     */
    const expense = await Expense.findOne({
      where: { id: expenseId, userId } // Ambas condiciones deben cumplirse
    });

    // Si no se encontró, el gasto no existe o no pertenece al usuario
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado o no tienes permiso para acceder a él'
      });
    }

    /**
     * Agregar el gasto al request
     * 
     * Esto evita que el controlador tenga que buscar el gasto de nuevo,
     * mejorando el rendimiento y asegurando que se use el mismo objeto.
     */
    req.expense = expense;
    
    // Continuar con el siguiente middleware o controlador
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * VALIDAR PROPIEDAD DE CATEGORÍA
 * 
 * Middleware que verifica que la categoría con el ID especificado pertenezca
 * al usuario autenticado.
 * 
 * Funciona igual que checkExpenseOwnership pero para categorías.
 * 
 * Uso: router.get('/:id', authenticate, checkCategoryOwnership, getCategoryById)
 */
exports.checkCategoryOwnership = async (req, res, next) => {
  try {
    // Extraer ID de los parámetros de la URL
    const { id } = req.params;
    
    // Obtener userId del request (agregado por authenticate)
    const userId = req.userId;

    // Validar que el ID esté presente
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID de categoría requerido'
      });
    }

    /**
     * Convertir ID a número
     * 
     * parseInt(id, 10) convierte el string a número en base 10.
     * Esto es necesario porque los parámetros de URL siempre vienen como strings.
     */
    const categoryId = parseInt(id, 10);
    
    // Validar que la conversión fue exitosa
    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de categoría inválido'
      });
    }

    /**
     * Buscar categoría que coincida con el ID Y el userId
     * 
     * La búsqueda verifica ambas condiciones para asegurar que:
     * 1. La categoría existe
     * 2. Pertenece al usuario autenticado
     */
    const category = await Category.findOne({
      where: { id: categoryId, userId }
    });

    // Si no se encontró, la categoría no existe o no pertenece al usuario
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada o no tienes permiso para acceder a ella'
      });
    }

    /**
     * Agregar la categoría al request
     * 
     * El controlador puede usar req.category directamente sin buscarla de nuevo.
     */
    req.category = category;
    
    // Continuar con el siguiente middleware o controlador
    next();
  } catch (error) {
    next(error);
  }
};

