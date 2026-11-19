/**
 * DATOS DE DEMO: carga categorías y gastos de ejemplo para un usuario
 *
 * Uso (el usuario tiene que estar registrado antes en la app):
 *
 *   cd backend
 *   npm run seed:demo -- usuario@email.com
 *
 * Crea 6 categorías (si no existen ya con ese nombre) y ~30 gastos repartidos
 * en los últimos 6 meses, en ARS y USD, algunos pagados y otros pendientes.
 * Sirve para ver el Dashboard y el panel de Administración con datos.
 *
 * Correrlo dos veces duplica los gastos (las categorías no).
 */
const sequelize = require('../config/database');
const { User, Category, Expense } = require('../models');

// Tasa fija de ejemplo: cuántos ARS equivalen a 1 USD
const ARS_POR_USD = 1450;

const CATEGORIAS = [
  { name: 'Comida', description: 'Supermercado y delivery', color: '#22c55e' },
  { name: 'Transporte', description: 'SUBE, nafta, Uber', color: '#3b82f6' },
  { name: 'Servicios', description: 'Luz, gas, internet, celular', color: '#f59e0b' },
  { name: 'Entretenimiento', description: 'Salidas, streaming, juegos', color: '#a855f7' },
  { name: 'Salud', description: 'Farmacia y prepaga', color: '#ef4444' },
  { name: 'Educación', description: 'Cursos y materiales', color: '#06b6d4' }
];

// [categoría, comercio, monto, moneda, descripción]
const PLANTILLAS = [
  ['Comida', 'Coto', 85000, 'ARS', 'Compra del mes'],
  ['Comida', 'PedidosYa', 18500, 'ARS', 'Pizza'],
  ['Comida', 'Carrefour', 42000, 'ARS', 'Compra semanal'],
  ['Transporte', 'SUBE', 15000, 'ARS', 'Carga de SUBE'],
  ['Transporte', 'YPF', 55000, 'ARS', 'Nafta'],
  ['Transporte', 'Uber', 9800, 'ARS', 'Viaje a la facu'],
  ['Servicios', 'Edenor', 32000, 'ARS', 'Factura de luz'],
  ['Servicios', 'Personal', 21000, 'ARS', 'Plan de celular'],
  ['Servicios', 'Telecentro', 28500, 'ARS', 'Internet'],
  ['Entretenimiento', 'Netflix', 12, 'USD', 'Suscripción mensual'],
  ['Entretenimiento', 'Spotify', 4.5, 'USD', 'Suscripción mensual'],
  ['Entretenimiento', 'Cinemark', 24000, 'ARS', 'Cine con amigos'],
  ['Salud', 'Farmacity', 16000, 'ARS', 'Remedios'],
  ['Salud', 'OSDE', 120000, 'ARS', 'Cuota prepaga'],
  ['Educación', 'Udemy', 15, 'USD', 'Curso de Vue 3'],
  ['Educación', 'Librería', 11000, 'ARS', 'Apuntes y fotocopias']
];

const fechaHace = (meses, dia) => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - meses);
  const ultimoDia = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(dia, ultimoDia));
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

(async () => {
  const email = process.argv[2];
  if (!email) {
    console.error('Uso: npm run seed:demo -- usuario@email.com');
    process.exitCode = 1;
    return sequelize.close();
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error(`No existe ningún usuario con email ${email} (registrate primero en la app)`);
    }

    // Categorías: se crean solo las que el usuario no tiene
    const categoriaId = {};
    for (const cat of CATEGORIAS) {
      const [registro] = await Category.findOrCreate({
        where: { name: cat.name, userId: user.id },
        defaults: { ...cat, userId: user.id }
      });
      categoriaId[cat.name] = registro.id;
    }

    // Gastos: cada plantilla se repite en 2 meses distintos dentro de los últimos 6
    const gastos = [];
    PLANTILLAS.forEach(([cat, vendor, amount, currency, description], i) => {
      for (const meses of [i % 6, (i + 3) % 6]) {
        const rate = currency === 'ARS' ? ARS_POR_USD : 1;
        gastos.push({
          date: fechaHace(meses, 3 + ((i * 7) % 25)),
          vendor,
          amount,
          currency,
          description,
          // Los de meses anteriores están pagados; los del mes actual, algunos pendientes
          status: meses === 0 && i % 2 === 0 ? 'Unpaid' : 'Paid',
          rate_usd: rate,
          conversion_usd: Math.round((amount / rate) * 100) / 100,
          userId: user.id,
          categoryId: categoriaId[cat]
        });
      }
    });

    await Expense.bulkCreate(gastos, { validate: true });

    console.log(`✅ ${email}: ${CATEGORIAS.length} categorías y ${gastos.length} gastos de demo cargados`);
  } catch (error) {
    console.error('❌ Error cargando datos de demo:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
})();
