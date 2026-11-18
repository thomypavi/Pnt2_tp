/**
 * MIDDLEWARE DE MANEJO DE ERRORES
 * 
 * Este middleware captura todos los errores que ocurren en las rutas y controladores,
 * y los convierte en respuestas JSON consistentes para el cliente.
 * 
 * IMPORTANTE: Debe ser el último middleware en server.js para capturar todos los errores.
 * 
 * Express detecta automáticamente que es un error handler porque tiene 4 parámetros:
 * (err, req, res, next)
 */

const errorHandler = (err, req, res, next) => {
  // Log del error en la consola para debugging
  console.error('Error:', err);

  /**
   * ERRORES DE VALIDACIÓN DE SEQUELIZE
   * 
   * Ocurre cuando los datos no cumplen las validaciones definidas en los modelos.
   * Ejemplo: email inválido, campo requerido faltante, etc.
   */
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      // Mapear cada error a un formato legible
      errors: err.errors.map(e => ({
        field: e.path,      // Campo que falló (ej: "email")
        message: e.message   // Mensaje de error (ej: "Email inválido")
      }))
    });
  }

  /**
   * ERROR DE RESTRICCIÓN ÚNICA
   * 
   * Ocurre cuando se intenta crear un registro con un valor que ya existe
   * en un campo marcado como único (unique: true).
   * Ejemplo: intentar registrar un email que ya está en uso.
   */
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Error de restricción única',
      error: err.errors[0].message // Mensaje del primer error
    });
  }

  /**
   * ERROR DE CLAVE FORÁNEA
   * 
   * Ocurre cuando se intenta crear/actualizar un registro con una referencia
   * a otro registro que no existe.
   * Ejemplo: crear un gasto con categoryId=999 pero la categoría 999 no existe.
   */
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Error de clave foránea',
      error: 'La referencia no existe en la base de datos'
    });
  }

  /**
   * ERROR DE BASE DE DATOS
   * 
   * Ocurre cuando hay un problema con la consulta SQL o la conexión a la base de datos.
   * Ejemplo: sintaxis SQL incorrecta, tabla no existe, etc.
   */
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      success: false,
      message: 'Error de base de datos',
      error: 'Error al procesar la consulta'
    });
  }

  /**
   * ERROR GENÉRICO
   * 
   * Captura cualquier otro tipo de error que no sea de Sequelize.
   * 
   * err.status: código de estado HTTP personalizado (si existe)
   * err.message: mensaje de error
   * err.stack: stack trace (solo en desarrollo para debugging)
   */
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    // Solo incluir stack trace en desarrollo (no en producción por seguridad)
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;

