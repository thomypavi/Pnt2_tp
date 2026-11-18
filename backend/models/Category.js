/**
 * MODELO CATEGORY (Categoría)
 * 
 * Define la estructura de la tabla 'categories' en la base de datos.
 * Representa las categorías que los usuarios pueden asignar a sus gastos.
 * Cada categoría tiene un color para identificación visual.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  /**
   * ID de la categoría (clave primaria)
   */
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  /**
   * Nombre de la categoría
   * 
   * STRING: texto con el nombre
   * Ejemplo: "Comida", "Transporte", "Entretenimiento"
   */
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  
  /**
   * Descripción de la categoría (opcional)
   * 
   * TEXT: texto largo para descripción detallada
   * allowNull: true - campo opcional
   */
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  /**
   * Color de la categoría (formato hexadecimal)
   * 
   * STRING(7): exactamente 7 caracteres (#RRGGBB)
   * Ejemplo: "#3b82f6" (azul), "#10b981" (verde)
   * 
   * validate.is: /^#[0-9A-Fa-f]{6}$/ - valida que sea formato hexadecimal válido
   * - ^# - debe empezar con #
   * - [0-9A-Fa-f]{6} - seguido de exactamente 6 caracteres hexadecimales
   * - $ - fin de la cadena
   * 
   * NOTA: El valor por defecto se sobrescribe en el controlador si no se proporciona,
   * asignando automáticamente el siguiente color disponible de la lista predefinida.
   */
  color: {
    type: DataTypes.STRING(7),
    allowNull: false,
    defaultValue: '#3b82f6', // Este valor se sobrescribe en el controlador si no se proporciona
    validate: {
      is: /^#[0-9A-Fa-f]{6}$/ // Validar formato hexadecimal (# seguido de 6 caracteres hex)
    }
  },
  
  /**
   * ID del usuario propietario (clave foránea)
   * 
   * INTEGER: referencia al campo id de la tabla users
   * allowNull: false - toda categoría debe pertenecer a un usuario
   * references: define la relación con la tabla users
   */
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'categories',
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

module.exports = Category;

