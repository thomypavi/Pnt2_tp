/**
 * MODELO EXPENSE (Gasto)
 * 
 * Define la estructura de la tabla 'expenses' en la base de datos.
 * Representa los gastos de los usuarios con conversión automática a USD.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define('Expense', {
  /**
   * ID del gasto (clave primaria)
   */
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  /**
   * Fecha del gasto
   * 
   * DATEONLY: solo fecha, sin hora (formato: YYYY-MM-DD)
   * Ejemplo: '2024-01-15'
   */
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: true,
      isDate: true
    }
  },
  
  /**
   * Proveedor/Vendedor
   * 
   * STRING: nombre del lugar donde se hizo el gasto
   * Ejemplo: "Supermercado", "Amazon", "Restaurante XYZ"
   */
  vendor: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  
  /**
   * Monto del gasto
   * 
   * DECIMAL(10, 2): número decimal con 10 dígitos totales y 2 decimales
   * Ejemplo: 1234.56
   * min: 0 - no puede ser negativo
   */
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      notEmpty: true,
      isDecimal: true,
      min: 0
    }
  },
  
  /**
   * Moneda del gasto
   * 
   * ENUM: solo permite valores de la lista especificada
   * Soporta 13 monedas diferentes
   * defaultValue: 'USD' - si no se especifica, usa USD
   */
  currency: {
    type: DataTypes.ENUM('USD', 'EUR', 'ARS', 'BRL', 'MXN', 'GBP', 'JPY', 'CNY', 'CHF', 'CAD', 'AUD', 'INR', 'NZD'),
    allowNull: false,
    defaultValue: 'USD',
    validate: {
      notEmpty: true,
      isIn: [['USD', 'EUR', 'ARS', 'BRL', 'MXN', 'GBP', 'JPY', 'CNY', 'CHF', 'CAD', 'AUD', 'INR', 'NZD']]
    }
  },
  
  /**
   * Descripción del gasto (opcional)
   * 
   * TEXT: tipo de dato texto largo (puede almacenar mucho texto)
   * allowNull: true - campo opcional
   */
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  /**
   * Estado del gasto
   * 
   * ENUM: solo permite 'Paid' (Pagado) o 'Unpaid' (No pagado)
   * defaultValue: 'Unpaid' - por defecto está sin pagar
   */
  status: {
    type: DataTypes.ENUM('Paid', 'Unpaid'),
    allowNull: false,
    defaultValue: 'Unpaid',
    validate: {
      notEmpty: true,
      isIn: [['Paid', 'Unpaid']]
    }
  },
  
  /**
   * Valor convertido a USD
   * 
   * DECIMAL(10, 2): valor en dólares con 2 decimales
   * Se calcula automáticamente al crear/actualizar el gasto
   * El usuario también puede editarlo manualmente
   * 
   * Ejemplo: Si amount = 100 ARS y rate_usd = 64.51, entonces conversion_usd = 1.55
   */
  conversion_usd: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    comment: 'Valor convertido a USD. Se calcula automáticamente o puede ser editado por el usuario'
  },
  
  /**
   * Tasa de conversión a USD
   * 
   * DECIMAL(10, 6): tasa con 6 decimales de precisión
   * Representa cuántas unidades de la moneda equivalen a 1 USD
   * 
   * Ejemplo: Para ARS, rate_usd = 64.51 significa que 1 USD = 64.51 ARS
   * Si amount = 100 ARS, entonces conversion_usd = 100 / 64.51 = 1.55 USD
   */
  rate_usd: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true,
    defaultValue: 1,
    comment: 'Tasa de conversión: cuántas unidades de la moneda equivalen a 1 USD. Ej: 64.51 para ARS significa 1 USD = 64.51 ARS'
  },
  
  /**
   * ID del usuario propietario (clave foránea)
   * 
   * INTEGER: referencia al campo id de la tabla users
   * allowNull: false - todo gasto debe pertenecer a un usuario
   * references: define la relación con la tabla users
   */
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // Nombre de la tabla referenciada
      key: 'id'       // Campo de la tabla referenciada
    }
  },
  
  /**
   * ID de la categoría (clave foránea, opcional)
   * 
   * INTEGER: referencia al campo id de la tabla categories
   * allowNull: true - un gasto puede no tener categoría
   * references: define la relación con la tabla categories
   */
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Permitir null para gastos sin categoría
    references: {
      model: 'categories',
      key: 'id'
    }
  }
}, {
  tableName: 'expenses',
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

module.exports = Expense;

