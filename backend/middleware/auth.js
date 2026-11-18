/**
 * MIDDLEWARE DE AUTENTICACIÓN
 * 
 * Este middleware verifica que el usuario esté autenticado mediante un token JWT.
 * Se usa en todas las rutas protegidas para asegurar que solo usuarios autenticados
 * puedan acceder a los recursos.
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * MIDDLEWARE AUTHENTICATE
 * 
 * Verifica el token JWT en el header Authorization y agrega información del usuario
 * al objeto req para que los controladores puedan usarla.
 * 
 * Uso: Se coloca antes del controlador en las rutas protegidas
 * Ejemplo: router.get('/expenses', authenticate, expenseController.getAllExpenses)
 * 
 * Proceso:
 * 1. Extrae el token del header Authorization
 * 2. Verifica que el token sea válido y no esté expirado
 * 3. Verifica que el usuario del token exista en la base de datos
 * 4. Agrega req.userId y req.user al request
 * 5. Si todo está bien, llama a next() para continuar
 * 6. Si hay error, responde con 401 (No autorizado)
 */
exports.authenticate = async (req, res, next) => {
  try {
    /**
     * Obtener token del header Authorization
     * 
     * El formato esperado es: "Authorization: Bearer <token>"
     * Ejemplo: "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     */
    const authHeader = req.headers.authorization;
    
    // Validar que el header existe y tiene el formato correcto
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido'
      });
    }

    /**
     * Extraer el token
     * 
     * substring(7) elimina los primeros 7 caracteres ("Bearer ")
     * para obtener solo el token
     */
    const token = authHeader.substring(7); // Remover "Bearer "

    /**
     * Verificar y decodificar el token JWT
     * 
     * jwt.verify() hace dos cosas:
     * 1. Verifica que el token esté firmado con la clave secreta correcta
     * 2. Verifica que el token no haya expirado
     * 
     * Si es válido, retorna el payload (los datos que se guardaron al crear el token)
     * Si no es válido, lanza una excepción
     */
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );

    /**
     * Verificar que el usuario existe en la base de datos
     * 
     * Aunque el token sea válido, el usuario podría haber sido eliminado
     * después de que se generó el token. Por eso verificamos que exista.
     */
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    /**
     * Agregar información del usuario al request
     * 
     * Esto permite que los controladores accedan a:
     * - req.userId: ID del usuario autenticado
     * - req.user: Objeto completo del usuario
     * 
     * Esto es importante para seguridad: el userId viene del token verificado,
     * no del body de la petición (que podría ser manipulado)
     */
    req.userId = decoded.userId;
    req.user = user;

    // Continuar con el siguiente middleware o controlador
    next();
  } catch (error) {
    /**
     * Manejo de errores específicos de JWT
     * 
     * jwt.verify() puede lanzar diferentes tipos de errores:
     */
    
    // Token malformado o firmado con clave incorrecta
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    // Token válido pero expirado
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    // Cualquier otro error, pasarlo al middleware de manejo de errores
    next(error);
  }
};

