/**
 * CONTROLADOR DE GASTOS
 * 
 * Maneja todas las operaciones CRUD (Create, Read, Update, Delete) para gastos.
 * Incluye funcionalidades especiales como conversión de monedas y filtros avanzados.
 */

const { Expense, Category, User } = require('../models');
const { Op } = require('sequelize'); // Operadores de Sequelize para consultas complejas (gte, lte, etc.)
const currencyService = require('../services/currencyService'); // Servicio para obtener tasas de cambio

/**
 * OBTENER TASA DE CONVERSIÓN
 * 
 * Endpoint: GET /api/expenses/exchange-rate?currency=EUR
 * Requiere: Autenticación
 * 
 * Obtiene la tasa de conversión de una moneda específica a USD desde una API externa.
 * Útil para que el frontend muestre tasas actualizadas antes de crear un gasto.
 * 
 * @param {string} currency - Código de moneda (EUR, ARS, BRL, etc.)
 * @returns {number} rate - Tasa de conversión (cuántas unidades de la moneda = 1 USD)
 */
exports.getExchangeRate = async (req, res, next) => {
  try {
    // Extraer parámetro currency de la query string (ej: ?currency=EUR)
    const { currency } = req.query;
    
    // Validar que el parámetro esté presente
    if (!currency) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro currency es requerido'
      });
    }

    /**
     * Obtener tasa de conversión desde el servicio
     * 
     * currencyService.getExchangeRate() hace una petición HTTP a una API externa
     * para obtener la tasa de cambio actual. Si la moneda es USD, retorna 1.
     */
    const rate = await currencyService.getExchangeRate(currency);
    
    // Responder con la tasa obtenida
    res.status(200).json({
      success: true,
      data: {
        currency,
        rate
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * OBTENER TODOS LOS GASTOS
 * 
 * Endpoint: GET /api/expenses?categoryId=1&status=Paid&startDate=2024-01-01&endDate=2024-12-31
 * Requiere: Autenticación
 * 
 * Lista todos los gastos del usuario autenticado con filtros opcionales.
 * Soporta filtrado por categoría, estado y rango de fechas.
 * 
 * Filtros disponibles (todos opcionales):
 * - categoryId: Filtrar por categoría específica
 * - status: Filtrar por estado (Paid o Unpaid)
 * - startDate: Fecha de inicio del rango (formato: YYYY-MM-DD)
 * - endDate: Fecha de fin del rango (formato: YYYY-MM-DD)
 */
exports.getAllExpenses = async (req, res, next) => {
  try {
    // Extraer filtros de la query string
    const { categoryId, status, startDate, endDate } = req.query;
    
    /**
     * Construir objeto where para la consulta
     * 
     * IMPORTANTE: Siempre filtrar por userId para seguridad.
     * Esto asegura que un usuario solo vea sus propios gastos,
     * incluso si intenta manipular los parámetros.
     */
    const where = {
      userId: req.userId // userId viene del token verificado (seguro)
    };
    
    // Agregar filtros opcionales si están presentes
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    
    /**
     * Filtro por rango de fechas
     * 
     * Op.gte = "greater than or equal" (mayor o igual que)
     * Op.lte = "less than or equal" (menor o igual que)
     * 
     * Esto permite buscar gastos entre dos fechas.
     */
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = startDate; // Fecha >= startDate
      if (endDate) where.date[Op.lte] = endDate;     // Fecha <= endDate
    }

    /**
     * Buscar gastos con relaciones incluidas
     * 
     * findAll() busca todos los registros que coincidan con where.
     * include[] permite incluir datos de tablas relacionadas (JOIN).
     * 
     * En este caso, incluye:
     * - User: datos del usuario que creó el gasto
     * - Category: datos de la categoría del gasto
     */
    const expenses = await Expense.findAll({
      where, // Condiciones de búsqueda
      include: [
        {
          model: User,
          as: 'user', // Alias de la relación (definido en models/index.js)
          attributes: ['id', 'name', 'email'] // Solo incluir estos campos del usuario
        },
        {
          model: Category,
          as: 'category', // Alias de la relación
          attributes: ['id', 'name', 'description'] // Solo incluir estos campos de la categoría
        }
      ],
      order: [['date', 'DESC']] // Ordenar por fecha descendente (más recientes primero)
    });

    // Responder con la lista de gastos
    res.status(200).json({
      success: true,
      data: expenses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * OBTENER UN GASTO POR ID
 * 
 * Endpoint: GET /api/expenses/:id
 * Requiere: Autenticación + checkExpenseOwnership
 * 
 * Obtiene un gasto específico por su ID.
 * El middleware checkExpenseOwnership ya validó que el gasto pertenece
 * al usuario, por lo que req.expense ya contiene el gasto.
 * 
 * Se vuelve a buscar con include para obtener las relaciones (User, Category).
 */
exports.getExpenseById = async (req, res, next) => {
  try {
    /**
     * Buscar gasto por ID con relaciones
     * 
     * req.expense ya fue agregado por el middleware checkExpenseOwnership,
     * pero lo buscamos de nuevo con include para obtener las relaciones.
     * 
     * findByPk() busca por Primary Key (id) - más eficiente que findOne.
     */
    const expense = await Expense.findByPk(req.expense.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'description']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CREAR UN NUEVO GASTO
 * 
 * Endpoint: POST /api/expenses
 * Requiere: Autenticación
 * 
 * Crea un nuevo gasto con conversión automática a USD.
 * 
 * Campos requeridos:
 * - date: Fecha del gasto (YYYY-MM-DD)
 * - vendor: Proveedor/vendedor
 * - amount: Monto del gasto
 * - currency: Moneda (USD, EUR, ARS, etc.)
 * 
 * Campos opcionales:
 * - description: Descripción del gasto
 * - status: Estado (Paid/Unpaid, por defecto Unpaid)
 * - categoryId: ID de la categoría
 * - rate_usd: Tasa de conversión manual (si no se proporciona, se obtiene de API)
 * - conversion_usd: Conversión a USD manual (si no se proporciona, se calcula)
 * 
 * Lógica de conversión:
 * - Si currency es USD: rate_usd = 1, conversion_usd = amount
 * - Si no es USD: obtiene tasa de API o usa valores proporcionados por el usuario
 */
exports.createExpense = async (req, res, next) => {
  try {
    // Extraer todos los campos del body
    const { date, vendor, amount, currency, description, status, categoryId, rate_usd, conversion_usd } = req.body;

    // Validar campos requeridos
    if (!date || !vendor || !amount || !currency) {
      return res.status(400).json({
        success: false,
        message: 'Los campos date, vendor, amount y currency son requeridos'
      });
    }

    /**
     * IMPORTANTE: Usar el userId del token, no del body
     * 
     * Esto previene que un usuario cree gastos a nombre de otro usuario
     * manipulando el body de la petición. El userId siempre viene del token verificado.
     */
    const userId = req.userId;

    /**
     * Verificar que la categoría existe y pertenece al usuario
     * 
     * Solo se valida si se proporcionó un categoryId.
     * Si no se proporciona, el gasto se crea sin categoría (categoryId = null).
     */
    if (categoryId) {
      const category = await Category.findOne({
        where: {
          id: categoryId,
          userId: userId // Validar que la categoría pertenece al usuario
        }
      });
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada o no pertenece al usuario'
        });
      }
    }

    /**
     * CALCULAR TASA DE CONVERSIÓN Y CONVERSIÓN A USD
     * 
     * Esta lógica maneja diferentes escenarios:
     * 1. Moneda es USD: rate_usd = 1 siempre
     * 2. Usuario proporciona rate_usd: usar ese valor
     * 3. Usuario proporciona conversion_usd: calcular rate_usd
     * 4. Usuario no proporciona nada: obtener de API externa
     */
    let finalRateUsd;
    let finalConversionUsd;
    const amountNum = parseFloat(amount); // Convertir a número para cálculos

    if (currency === 'USD') {
      /**
       * CASO 1: Moneda es USD
       * 
       * Si la moneda ya es USD, la tasa siempre es 1
       * (1 USD = 1 USD)
       */
      finalRateUsd = 1;
      
      // Si el usuario proporcionó conversion_usd, usarlo; sino usar amount
      finalConversionUsd = conversion_usd !== undefined ? parseFloat(conversion_usd) : amountNum;
    } else {
      /**
       * CASO 2: Moneda no es USD
       * 
       * Hay varias opciones dependiendo de qué datos proporcionó el usuario
       */
      
      // Opción A: Usuario proporcionó rate_usd
      if (rate_usd !== undefined && rate_usd !== null) {
        finalRateUsd = parseFloat(rate_usd);
        
        // Si también proporcionó conversion_usd, usarlo; sino calcularlo
        if (conversion_usd !== undefined && conversion_usd !== null) {
          finalConversionUsd = parseFloat(conversion_usd);
        } else {
          // Calcular: conversion_usd = amount / rate_usd
          // Ejemplo: 100 ARS / 64.51 = 1.55 USD
          finalConversionUsd = amountNum / finalRateUsd;
        }
      } 
      // Opción B: Usuario proporcionó conversion_usd pero no rate_usd
      else if (conversion_usd !== undefined && conversion_usd !== null) {
        finalConversionUsd = parseFloat(conversion_usd);
        
        // Calcular rate_usd: rate_usd = amount / conversion_usd
        // Ejemplo: 100 ARS / 1.55 USD = 64.51
        finalRateUsd = amountNum > 0 ? amountNum / finalConversionUsd : 1;
      } 
      // Opción C: Usuario no proporcionó ninguno, obtener de API
      else {
        try {
          /**
           * Obtener tasa de conversión desde API externa
           * 
           * currencyService.getExchangeRate() hace una petición HTTP a:
           * https://open.er-api.com/v6/latest/USD
           * 
           * Retorna cuántas unidades de la moneda equivalen a 1 USD.
           * Ejemplo: Para ARS podría retornar 64.51 (1 USD = 64.51 ARS)
           */
          finalRateUsd = await currencyService.getExchangeRate(currency);
          
          // Calcular conversión: conversion_usd = amount / rate_usd
          finalConversionUsd = amountNum / finalRateUsd;
        } catch (error) {
          /**
           * Si falla la API, usar valores por defecto
           * 
           * Esto permite que el sistema siga funcionando aunque la API esté caída.
           * Los valores por defecto (rate_usd = 1, conversion_usd = amount)
           * significan que se trata como si fuera USD.
           */
          console.error('Error al obtener tasa de conversión:', error);
          finalRateUsd = 1;
          finalConversionUsd = amountNum;
        }
      }
    }

    /**
     * Redondear valores
     * 
     * rate_usd: 6 decimales (precisión para tasas de cambio)
     * conversion_usd: 2 decimales (formato estándar de moneda)
     * 
     * Math.round(valor * factor) / factor redondea a la cantidad de decimales deseada.
     */
    finalRateUsd = Math.round(finalRateUsd * 1000000) / 1000000; // 6 decimales
    finalConversionUsd = Math.round(finalConversionUsd * 100) / 100; // 2 decimales

    /**
     * Crear el gasto en la base de datos
     * 
     * Expense.create() inserta un nuevo registro en la tabla expenses.
     */
    const expense = await Expense.create({
      date,
      vendor,
      amount: amountNum,
      currency,
      description,
      status: status || 'Unpaid', // Por defecto 'Unpaid' si no se especifica
      userId, // Usar el userId del token (seguridad)
      categoryId,
      rate_usd: finalRateUsd,
      conversion_usd: finalConversionUsd
    });

    /**
     * Buscar el gasto recién creado con relaciones incluidas
     * 
     * Esto permite retornar el gasto completo con datos del usuario y categoría,
     * útil para que el frontend muestre toda la información inmediatamente.
     */
    const expenseWithRelations = await Expense.findByPk(expense.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'description']
        }
      ]
    });

    // Responder con éxito (código 201 = Created)
    res.status(201).json({
      success: true,
      message: 'Gasto creado exitosamente',
      data: expenseWithRelations
    });
  } catch (error) {
    /**
     * Manejo de errores de validación de Sequelize
     * 
     * Si hay errores de validación (campos requeridos, tipos incorrectos, etc.),
     * Sequelize lanza SequelizeValidationError con detalles de cada error.
     */
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map(e => e.message) // Mapear errores a mensajes legibles
      });
    }
    next(error);
  }
};

/**
 * ACTUALIZAR UN GASTO
 * 
 * Endpoint: PUT /api/expenses/:id
 * Requiere: Autenticación + checkExpenseOwnership
 * 
 * Actualiza un gasto existente. Todos los campos son opcionales (solo se actualizan
 * los que se envían en el body). Si se cambia la moneda o el monto, recalcula
 * automáticamente la conversión a USD.
 * 
 * Campos actualizables:
 * - date, vendor, amount, currency, description, status, categoryId
 * - rate_usd, conversion_usd (si se proporcionan, se usan; si no, se calculan)
 * 
 * IMPORTANTE: El userId NO se puede cambiar (seguridad).
 */
exports.updateExpense = async (req, res, next) => {
  try {
    // req.expense ya fue validado por el middleware checkExpenseOwnership
    const expense = req.expense;
    
    // Extraer todos los campos del body (todos opcionales)
    const { date, vendor, amount, currency, description, status, categoryId, rate_usd, conversion_usd } = req.body;

    /**
     * Construir objeto updateData con solo los campos que se quieren actualizar
     * 
     * Solo agregamos campos al objeto si están presentes en el body.
     * Esto permite actualizaciones parciales (PATCH-like).
     */
    const updateData = {};
    if (date) updateData.date = date;
    if (vendor) updateData.vendor = vendor;
    // amount !== undefined permite establecer amount a 0 si es necesario
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (currency) updateData.currency = currency;
    // description !== undefined permite establecer description a "" (cadena vacía)
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;
    
    /**
     * Obtener valores actuales o nuevos para cálculos de conversión
     * 
     * Si el usuario actualizó amount o currency, usamos los nuevos valores.
     * Si no, usamos los valores actuales del gasto.
     * Esto es necesario para recalcular la conversión si cambió la moneda o el monto.
     */
    const currentAmount = updateData.amount !== undefined ? updateData.amount : parseFloat(expense.amount);
    const currentCurrency = updateData.currency || expense.currency;
    
    /**
     * SEGURIDAD: NO permitir cambiar el userId
     * 
     * El userId siempre será el del usuario autenticado (del token).
     * Esto previene que un usuario transfiera gastos a otro usuario.
     */
    
    /**
     * Validar y actualizar categoryId
     * 
     * Permite:
     * - Establecer categoryId a null (sin categoría)
     * - Cambiar a otra categoría válida que pertenezca al usuario
     */
    if (categoryId !== undefined) {
      if (categoryId === null) {
        // Permitir establecer a null (sin categoría)
        updateData.categoryId = null;
      } else {
        // Validar que la categoría existe y pertenece al usuario
        const category = await Category.findOne({
          where: {
            id: categoryId,
            userId: req.userId
          }
        });
        if (!category) {
          return res.status(404).json({
            success: false,
            message: 'Categoría no encontrada o no pertenece al usuario'
          });
        }
        updateData.categoryId = categoryId;
      }
    }

    /**
     * MANEJAR CONVERSIÓN DE MONEDA
     * 
     * La lógica es similar a createExpense pero más compleja porque:
     * 1. Puede que solo se actualicen algunos campos
     * 2. Necesitamos decidir si recalcular o mantener valores actuales
     * 3. Si cambia la moneda o el monto, debemos recalcular
     */
    if (currentCurrency === 'USD') {
      /**
       * CASO 1: Moneda es USD (o se cambió a USD)
       * 
       * Si la moneda es USD, rate_usd siempre debe ser 1.
       */
      if (rate_usd !== undefined && rate_usd !== null) {
        updateData.rate_usd = 1; // Forzar a 1 si es USD (ignorar valor proporcionado)
      } else if (!expense.rate_usd || expense.rate_usd !== 1) {
        // Si el gasto actual no tiene rate_usd = 1, actualizarlo
        updateData.rate_usd = 1;
      }
      
      /**
       * conversion_usd debe ser igual a amount si es USD
       */
      if (conversion_usd !== undefined && conversion_usd !== null) {
        updateData.conversion_usd = parseFloat(conversion_usd);
      } else if (updateData.amount !== undefined) {
        // Si se actualizó amount, actualizar conversion_usd también
        updateData.conversion_usd = currentAmount;
      } else if (!expense.conversion_usd || expense.conversion_usd !== expense.amount) {
        // Si los valores actuales no coinciden, corregirlos
        updateData.conversion_usd = currentAmount;
      }
    } else {
      /**
       * CASO 2: Moneda no es USD
       * 
       * Hay varias opciones dependiendo de qué datos proporcionó el usuario
       */
      
      // Opción A: Usuario proporcionó rate_usd
      if (rate_usd !== undefined && rate_usd !== null) {
        const newRate = parseFloat(rate_usd);
        updateData.rate_usd = Math.round(newRate * 1000000) / 1000000; // 6 decimales
        
        // Si el usuario cambió rate_usd pero no conversion_usd, recalcular conversion_usd
        if (conversion_usd === undefined || conversion_usd === null) {
          updateData.conversion_usd = Math.round((currentAmount / newRate) * 100) / 100;
        } else {
          // Usar el valor proporcionado por el usuario
          updateData.conversion_usd = Math.round(parseFloat(conversion_usd) * 100) / 100;
        }
      } 
      // Opción B: Usuario proporcionó conversion_usd pero no rate_usd
      else if (conversion_usd !== undefined && conversion_usd !== null) {
        const newConversion = parseFloat(conversion_usd);
        updateData.conversion_usd = Math.round(newConversion * 100) / 100;
        
        // Calcular rate_usd: rate_usd = amount / conversion_usd
        updateData.rate_usd = currentAmount > 0 
          ? Math.round((currentAmount / newConversion) * 1000000) / 1000000 
          : (expense.rate_usd || 1); // Si amount es 0, mantener rate_usd actual
      } 
      // Opción C: Usuario no proporcionó rate_usd ni conversion_usd
      // Pero cambió la moneda o el monto, entonces recalcular con API
      else if (updateData.currency || updateData.amount !== undefined) {
        try {
          /**
           * Obtener nueva tasa de conversión desde API
           * 
           * Solo se hace si cambió la moneda o el monto, porque si no cambió nada,
           * mantenemos los valores actuales.
           */
          const newRate = await currencyService.getExchangeRate(currentCurrency);
          updateData.rate_usd = Math.round(newRate * 1000000) / 1000000;
          updateData.conversion_usd = Math.round((currentAmount / newRate) * 100) / 100;
        } catch (error) {
          console.error('Error al obtener tasa de conversión:', error);
          // Si falla la API, mantener los valores actuales (no actualizar rate_usd ni conversion_usd)
        }
      }
      // Si no se cambió nada relacionado con la moneda, no actualizar rate_usd ni conversion_usd
    }

    /**
     * Actualizar el gasto en la base de datos
     * 
     * expense.update() actualiza solo los campos especificados en updateData.
     */
    await expense.update(updateData);

    /**
     * Buscar el gasto actualizado con relaciones incluidas
     * 
     * Esto permite retornar el gasto completo actualizado con datos del usuario y categoría.
     */
    const expenseWithRelations = await Expense.findByPk(expense.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'description']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Gasto actualizado exitosamente',
      data: expenseWithRelations
    });
  } catch (error) {
    // Manejo de errores de validación de Sequelize
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map(e => e.message)
      });
    }
    next(error);
  }
};

/**
 * MARCAR GASTO COMO PAGADO
 * 
 * Endpoint: PATCH /api/expenses/:id/mark-as-paid
 * Requiere: Autenticación + checkExpenseOwnership
 * 
 * Cambia el estado de un gasto de "Unpaid" a "Paid".
 * Es un endpoint específico para esta acción común, más simple que usar updateExpense.
 */
exports.markAsPaid = async (req, res, next) => {
  try {
    // req.expense ya fue validado por el middleware checkExpenseOwnership
    const expense = req.expense;

    // Validar que el gasto no esté ya marcado como pagado
    if (expense.status === 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'El gasto ya está marcado como pagado'
      });
    }

    /**
     * Actualizar solo el status
     * 
     * expense.update() actualiza el registro en la base de datos.
     * Solo actualizamos el status, no recalculamos la conversión
     * (esa se calcula al crear/editar el gasto).
     */
    await expense.update({
      status: 'Paid'
    });

    // Buscar el gasto actualizado con relaciones para retornarlo
    const expenseWithRelations = await Expense.findByPk(expense.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'description']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Gasto marcado como pagado exitosamente',
      data: expenseWithRelations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ELIMINAR UN GASTO
 * 
 * Endpoint: DELETE /api/expenses/:id
 * Requiere: Autenticación + checkExpenseOwnership
 * 
 * Elimina permanentemente un gasto de la base de datos.
 * Esta acción no se puede deshacer.
 */
exports.deleteExpense = async (req, res, next) => {
  try {
    // req.expense ya fue validado por el middleware checkExpenseOwnership
    const expense = req.expense;
    
    // Verificación adicional (aunque el middleware ya lo validó)
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado'
      });
    }

    /**
     * Eliminar el gasto
     * 
     * expense.destroy() elimina el registro de la base de datos.
     * Sequelize maneja automáticamente las relaciones (no elimina categorías ni usuarios).
     */
    await expense.destroy();

    res.status(200).json({
      success: true,
      message: 'Gasto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar gasto:', error);
    next(error);
  }
};

