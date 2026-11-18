const { Category, User } = require('../models');
const PREDEFINED_COLORS = require('../constants/colors');

// Función para obtener el siguiente color disponible
const getNextAvailableColor = async (userId) => {
  // Obtener todos los colores usados por el usuario
  const userCategories = await Category.findAll({
    where: { userId },
    attributes: ['color']
  });
  
  const usedColors = new Set(userCategories.map(c => c.color));
  
  // Buscar el primer color que no esté en uso
  for (const color of PREDEFINED_COLORS) {
    if (!usedColors.has(color)) {
      return color;
    }
  }
  
  // Si todos los colores están en uso, devolver el primero
  return PREDEFINED_COLORS[0];
};

// Obtener todas las categorías
exports.getAllCategories = async (req, res, next) => {
  try {
    // IMPORTANTE: Solo mostrar categorías del usuario autenticado
    const where = {
      userId: req.userId // Forzar que sea el userId del token
    };

    const categories = await Category.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// Obtener una categoría por ID
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.category.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          association: 'expenses',
          attributes: ['id', 'date', 'vendor', 'amount', 'currency', 'status']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Crear una nueva categoría
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre es requerido'
      });
    }

    // IMPORTANTE: Usar el userId del token, no del body (seguridad)
    const userId = req.userId;

    // Si no se proporciona color, buscar el siguiente disponible
    let categoryColor = color;
    if (!categoryColor) {
      categoryColor = await getNextAvailableColor(userId);
    }

    const category = await Category.create({
      name,
      description,
      color: categoryColor,
      userId // Usar el userId del token
    });

    const categoryWithUser = await Category.findByPk(category.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: categoryWithUser
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar una categoría
exports.updateCategory = async (req, res, next) => {
  try {
    const category = req.category; // Ya validado por middleware
    const { name, description, color } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    // NO permitir cambiar el userId (seguridad)
    // El userId siempre será el del usuario autenticado

    await category.update(updateData);

    const categoryWithUser = await Category.findByPk(category.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: categoryWithUser
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar una categoría
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = req.category; // Ya validado por middleware
    const { Expense } = require('../models');
    
    // Antes de eliminar, actualizar todos los gastos asociados para que queden sin categoría
    await Expense.update(
      { categoryId: null },
      { 
        where: { 
          categoryId: category.id,
          userId: req.userId // Solo actualizar gastos del usuario autenticado
        } 
      }
    );

    // Ahora sí eliminar la categoría
    await category.destroy();

    res.status(200).json({
      success: true,
      message: 'Categoría eliminada exitosamente. Los gastos asociados quedaron sin categoría.'
    });
  } catch (error) {
    next(error);
  }
};

