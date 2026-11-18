/**
 * CONTROLADOR DE AUTENTICACIÓN
 * 
 * Maneja el registro, login y obtención de información del usuario actual.
 * Utiliza bcrypt para hashear contraseñas y JWT para tokens de autenticación.
 */

const { User } = require('../models');
const bcrypt = require('bcryptjs'); // Librería para hashear contraseñas de forma segura
const jwt = require('jsonwebtoken'); // Librería para generar y verificar tokens JWT

/**
 * REGISTRAR NUEVO USUARIO
 * 
 * Endpoint: POST /api/auth/register
 * 
 * Proceso:
 * 1. Valida que todos los campos requeridos estén presentes
 * 2. Valida que la contraseña tenga al menos 6 caracteres
 * 3. Verifica que el email no esté ya registrado
 * 4. Hashea la contraseña con bcrypt (10 rounds = nivel de seguridad)
 * 5. Crea el usuario en la base de datos
 * 6. Genera un token JWT que expira en 7 días
 * 7. Retorna el usuario (sin contraseña) y el token
 */
exports.register = async (req, res, next) => {
  try {
    // Extraer datos del body de la petición
    const { name, email, password } = req.body;

    // Validación: verificar que todos los campos requeridos estén presentes
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Validación: la contraseña debe tener al menos 6 caracteres
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el usuario ya existe en la base de datos
    // findOne busca un registro que coincida con la condición where
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    /**
     * Hash de la contraseña
     * 
     * bcrypt.hash() toma la contraseña en texto plano y la convierte en un hash
     * El segundo parámetro (10) es el "salt rounds" - número de iteraciones
     * Más rounds = más seguro pero más lento. 10 es un buen balance.
     * 
     * Ejemplo: "miPassword123" -> "$2a$10$N9qo8uLOickgx2ZMRZoMye..."
     */
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario en la base de datos
    // User.create() inserta un nuevo registro en la tabla users
    const user = await User.create({
      name,
      email,
      password: hashedPassword // Guardar el hash, nunca la contraseña en texto plano
    });

    /**
     * Generar token JWT (JSON Web Token)
     * 
     * jwt.sign() crea un token firmado que contiene:
     * - Payload: datos del usuario (userId, email)
     * - Secret: clave secreta para firmar el token (desde variable de entorno)
     * - Options: configuración (expiración en 7 días)
     * 
     * El token se envía al frontend y se usa para autenticar peticiones futuras
     */
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role }, // Payload: datos que se guardan en el token
      process.env.JWT_SECRET || 'your-secret-key-change-in-production', // Clave secreta
      { expiresIn: '7d' } // El token expira en 7 días
    );

    // Convertir el objeto Sequelize a JSON y eliminar la contraseña antes de enviar
    const userResponse = user.toJSON(); // toJSON() convierte el modelo Sequelize a objeto plano
    delete userResponse.password; // Nunca enviar la contraseña (ni siquiera el hash) al frontend

    // Responder con éxito (código 201 = Created)
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: userResponse,
        token // El frontend guardará este token para usarlo en peticiones futuras
      }
    });
  } catch (error) {
    // Pasar el error al middleware de manejo de errores
    next(error);
  }
};

/**
 * LOGIN DE USUARIO
 * 
 * Endpoint: POST /api/auth/login
 * 
 * Proceso:
 * 1. Valida que email y contraseña estén presentes
 * 2. Busca el usuario por email en la base de datos
 * 3. Compara la contraseña ingresada con el hash guardado usando bcrypt.compare()
 * 4. Si las credenciales son correctas, genera un token JWT
 * 5. Retorna el usuario (sin contraseña) y el token
 */
exports.login = async (req, res, next) => {
  try {
    // Extraer credenciales del body
    const { email, password } = req.body;

    // Validación básica
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario por email
    // findOne busca un registro que coincida con la condición where
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // No decir "usuario no existe" por seguridad - mejor mensaje genérico
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    /**
     * Verificar contraseña
     * 
     * bcrypt.compare() toma la contraseña en texto plano y el hash guardado,
     * y verifica si coinciden. Esto es seguro porque:
     * - No se puede "revertir" el hash para obtener la contraseña original
     * - bcrypt.compare() hace el hash de la contraseña ingresada y lo compara
     */
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Si llegamos aquí, las credenciales son correctas
    // Generar token JWT (igual que en register)
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    // Preparar respuesta sin contraseña
    const userResponse = user.toJSON();
    delete userResponse.password;

    // Responder con éxito (código 200 = OK)
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * OBTENER USUARIO ACTUAL
 * 
 * Endpoint: GET /api/auth/me
 * Requiere: Autenticación (middleware authenticate)
 * 
 * Proceso:
 * 1. Usa req.userId que fue agregado por el middleware authenticate
 * 2. Busca el usuario en la base de datos
 * 3. Retorna la información del usuario (sin contraseña)
 * 
 * Útil para verificar que el token sigue siendo válido y obtener datos actualizados
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    /**
     * Buscar usuario por ID
     * 
     * findByPk() busca por Primary Key (clave primaria = id)
     * Es más eficiente que findOne({ where: { id } })
     * 
     * attributes: { exclude: ['password'] } - excluye el campo password del resultado
     */
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] } // No incluir la contraseña en la respuesta
    });

    // Verificar que el usuario existe (por si acaso fue eliminado después de autenticarse)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Responder con los datos del usuario
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

