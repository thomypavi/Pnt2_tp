/**
 * MIGRACIÓN: agregar la columna `role` a la tabla `users`
 *
 * sequelize.sync({ alter: false }) crea tablas nuevas pero NO agrega columnas
 * a tablas que ya existen. Por eso, si la base se creó antes de que existiera
 * el campo `role`, hay que correr esto una vez:
 *
 *   cd backend
 *   npm run migrate:role
 *
 * Opcional: pasar un email para hacerlo admin en el mismo paso:
 *
 *   npm run migrate:role -- tu@email.com
 *
 * Es seguro correrlo varias veces (IF NOT EXISTS).
 */
const sequelize = require('../config/database');

(async () => {
  try {
    await sequelize.query(
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(10) NOT NULL DEFAULT 'user'"
    );
    console.log("✅ Columna 'role' lista en la tabla users");

    const email = process.argv[2];
    if (email) {
      const [, result] = await sequelize.query(
        "UPDATE users SET role = 'admin' WHERE email = :email",
        { replacements: { email } }
      );
      console.log(result.rowCount
        ? `✅ ${email} ahora es admin`
        : `⚠️  No existe ningún usuario con email ${email} (registrate primero en la app)`);
    }
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
})();
