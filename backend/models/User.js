/**
 * MODELO USER (Usuario)
 * 
 * Define la estructura de la tabla 'users' en la base de datos.
 * Representa a los usuarios del sistema que pueden crear gastos y categorías.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Definir el modelo User
 * 
 * sequelize.define() crea un modelo Sequelize que mapea a una tabla en la base de datos.
 * El primer parámetro es el nombre del modelo, el segundo es la definición de campos.
 */
const User = sequelize.define('User', {
  /**
   * ID del usuario (clave primaria)
   * 
   * INTEGER: tipo de dato numérico entero
   * primaryKey: true - esta es la clave primaria (identificador único)
   * autoIncrement: true - se incrementa automáticamente (1, 2, 3, ...)
   */
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  /**
   * Nombre del usuario
   * 
   * STRING: tipo de dato texto
   * allowNull: false - campo obligatorio (no puede ser null)
   * validate.notEmpty: true - no puede ser una cadena vacía
   */
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  
  /**
   * Email del usuario
   * 
   * STRING: tipo de dato texto
   * allowNull: false - campo obligatorio
   * unique: true - debe ser único (no puede haber dos usuarios con el mismo email)
   * validate.isEmail: true - debe tener formato de email válido (ej: user@example.com)
   */
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  
  /**
   * Contraseña del usuario (hasheada)
   * 
   * STRING: tipo de dato texto (almacena el hash, no la contraseña en texto plano)
   * allowNull: false - campo obligatorio
   * validate.len: [6, 100] - debe tener entre 6 y 100 caracteres
   * 
   * IMPORTANTE: La contraseña se hashea con bcrypt antes de guardarse.
   * Nunca se almacena en texto plano por seguridad.
   */
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [6, 100] // Mínimo 6 caracteres, máximo 100
    }
  },

  /**
   * Rol del usuario
   *
   * - 'user': usuario común, solo ve y gestiona sus propios gastos y categorías
   * - 'admin': además puede entrar al panel de administración (/admin)
   *
   * Todo usuario nuevo se registra como 'user'. Para hacer admin a alguien,
   * se cambia este campo desde el panel de admin o desde Supabase (Table Editor → users).
   */
  role: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'user',
    validate: {
      isIn: [['user', 'admin']]
    }
  }
}, {
  /**
   * OPCIONES DEL MODELO
   * 
   * tableName: 'users' - nombre de la tabla en la base de datos (plural)
   * timestamps: true - agrega automáticamente campos createdAt y updatedAt
   */
  tableName: 'users',
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

module.exports = User;

