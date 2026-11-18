/**
 * CONTROLADOR DE ADMINISTRACIÓN
 *
 * Endpoints que solo puede usar un usuario con role = 'admin'.
 * La protección se hace en routes/adminRoutes.js con los middlewares
 * authenticate + requireAdmin, así que acá ya sabemos que req.user es admin.
 *
 * A diferencia del resto de la API (donde cada usuario solo ve SUS datos),
 * acá se consultan datos de TODOS los usuarios.
 */

const { fn, col, literal } = require('sequelize');
const { User, Expense } = require('../models');

/**
 * ESTADÍSTICAS GENERALES
 *
 * Endpoint: GET /api/admin/stats
 *
 * Devuelve:
 * - totales: cantidad de usuarios, admins, gastos y monto total en USD
 * - porEstado: monto y cantidad de gastos pagados / impagos
 * - porMes: monto en USD y cantidad de gastos de los últimos 6 meses (para el gráfico)
 */
exports.getStats = async (req, res, next) => {
  try {
    const [usersCount, adminsCount, expensesCount, totalUsd] = await Promise.all([
      User.count(),
      User.count({ where: { role: 'admin' } }),
      Expense.count(),
      Expense.sum('conversion_usd')
    ]);

    // GROUP BY status → [{ status: 'Paid', count: 3, totalUsd: '120.50' }, ...]
    const porEstado = await Expense.findAll({
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count'],
        [fn('COALESCE', fn('SUM', col('conversion_usd')), 0), 'totalUsd']
      ],
      group: ['status'],
      raw: true
    });

    // GROUP BY mes (últimos 6 meses) → [{ month: '2026-11', count: 4, totalUsd: '80.00' }, ...]
    const porMes = await Expense.findAll({
      attributes: [
        [fn('TO_CHAR', col('date'), 'YYYY-MM'), 'month'],
        [fn('COUNT', col('id')), 'count'],
        [fn('COALESCE', fn('SUM', col('conversion_usd')), 0), 'totalUsd']
      ],
      where: literal("date >= (CURRENT_DATE - INTERVAL '6 months')"),
      group: [literal('1')],
      order: [literal('1')],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: {
        totales: {
          usuarios: usersCount,
          admins: adminsCount,
          gastos: expensesCount,
          totalUsd: Number(totalUsd || 0)
        },
        porEstado: porEstado.map(e => ({
          status: e.status,
          count: Number(e.count),
          totalUsd: Number(e.totalUsd)
        })),
        porMes: porMes.map(m => ({
          month: m.month,
          count: Number(m.count),
          totalUsd: Number(m.totalUsd)
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * LISTAR USUARIOS
 *
 * Endpoint: GET /api/admin/users
 *
 * Devuelve todos los usuarios (sin contraseña) con la cantidad de gastos de cada uno.
 */
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: [
        'id', 'name', 'email', 'role', 'createdAt',
        // Subconsulta: cuántos gastos tiene cada usuario
        [literal('(SELECT COUNT(*) FROM expenses WHERE expenses."userId" = "User"."id")'), 'expensesCount']
      ],
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: users.map(u => ({ ...u.toJSON(), expensesCount: Number(u.get('expensesCount')) }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CAMBIAR EL ROL DE UN USUARIO
 *
 * Endpoint: PATCH /api/admin/users/:id/role
 * Body: { "role": "admin" } o { "role": "user" }
 *
 * Regla: un admin no puede cambiarse el rol a sí mismo
 * (así nunca se queda el sistema sin poder entrar al panel por error).
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const targetId = Number(req.params.id);

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "El rol debe ser 'user' o 'admin'"
      });
    }

    if (targetId === req.userId) {
      return res.status(400).json({
        success: false,
        message: 'No podés cambiar tu propio rol'
      });
    }

    const user = await User.findByPk(targetId, { attributes: { exclude: ['password'] } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Rol actualizado a '${role}'`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
