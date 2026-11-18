/**
 * ARCHIVO DE RELACIONES ENTRE MODELOS
 * 
 * Este archivo importa todos los modelos y define las relaciones entre ellos.
 * Las relaciones permiten hacer consultas con JOIN y acceder a datos relacionados
 * fácilmente (ej: expense.user, category.expenses).
 */

const User = require('./User');
const Category = require('./Category');
const Expense = require('./Expense');

/**
 * DEFINIR RELACIONES ENTRE MODELOS
 * 
 * Sequelize usa métodos especiales para definir relaciones:
 * - hasMany: "tiene muchos" (uno a muchos)
 * - belongsTo: "pertenece a" (muchos a uno)
 * 
 * foreignKey: nombre de la columna en la tabla que referencia a la otra tabla
 * as: alias para acceder a la relación (ej: user.categories, expense.user)
 */

/**
 * RELACIÓN: User <-> Category
 * 
 * Un usuario puede tener muchas categorías
 * Una categoría pertenece a un usuario
 */
User.hasMany(Category, { foreignKey: 'userId', as: 'categories' });
Category.belongsTo(User, { foreignKey: 'userId', as: 'user' });

/**
 * RELACIÓN: User <-> Expense
 * 
 * Un usuario puede tener muchos gastos
 * Un gasto pertenece a un usuario
 */
User.hasMany(Expense, { foreignKey: 'userId', as: 'expenses' });
Expense.belongsTo(User, { foreignKey: 'userId', as: 'user' });

/**
 * RELACIÓN: Category <-> Expense
 * 
 * Una categoría puede tener muchos gastos
 * Un gasto pertenece a una categoría (opcional, puede ser null)
 */
Category.hasMany(Expense, { foreignKey: 'categoryId', as: 'expenses' });
Expense.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Exportar todos los modelos para uso en controladores y otros archivos
module.exports = {
  User,
  Category,
  Expense
};

