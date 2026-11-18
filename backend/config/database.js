/**
 * CONFIGURACIÓN DE BASE DE DATOS
 * 
 * Este archivo configura la conexión a PostgreSQL usando Sequelize.
 * Soporta dos formas de configuración:
 * 1. DATABASE_URL (usado en producción, ej: Heroku, Render)
 * 2. Variables individuales (DB_HOST, DB_USER, etc.) para desarrollo local
 */

const { Sequelize } = require('sequelize');
require('dotenv').config(); // Cargar variables de entorno desde .env

/**
 * CONFIGURACIÓN BASE
 * 
 * Opciones comunes para todas las conexiones:
 * - dialect: 'postgres' - tipo de base de datos
 * - protocol: 'postgres' - protocolo de conexión
 * - logging: false - no mostrar logs de SQL (cambiar a console.log para debugging)
 * - dialectOptions.ssl - configuración SSL para conexiones seguras (requerido en producción)
 */
const baseConfig = {
  dialect: 'postgres',
  // Pasar el driver explícitamente: en Vercel, Sequelize no lo encuentra solo
  dialectModule: require('pg'),
  protocol: 'postgres',
  logging: false, // Cambiar a console.log para ver las consultas SQL
  // Pocas conexiones por instancia: en Vercel puede haber varias instancias a la vez
  pool: { max: 3, min: 0, idle: 10000 },
  dialectOptions: {
    ssl: {
      require: true,              // Requerir conexión SSL
      rejectUnauthorized: false  // No rechazar certificados no autorizados (común en servicios cloud)
    }
  }
};

/**
 * CASO 1: Usar DATABASE_URL (producción)
 * 
 * Si existe la variable DATABASE_URL, usarla directamente.
 * Esta es la forma más común en servicios como Heroku, Render, Railway, etc.
 * 
 * Formato: postgres://usuario:contraseña@host:puerto/nombre_base_datos
 */
if (process.env.DATABASE_URL) {
  /**
   * new Sequelize(DATABASE_URL, config)
   * 
   * Sequelize puede parsear automáticamente la URL de conexión.
   */
  module.exports = new Sequelize(process.env.DATABASE_URL, baseConfig);
  return; // Salir temprano, no ejecutar el código de abajo
}

/**
 * CASO 2: Usar variables individuales (desarrollo local)
 * 
 * Si no hay DATABASE_URL, usar variables de entorno individuales.
 * Esto es útil para desarrollo local con archivo .env
 */
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

/**
 * Validar que las variables requeridas estén presentes
 * 
 * DB_HOST, DB_USER y DB_PASSWORD son obligatorios.
 * DB_NAME y DB_PORT son opcionales (tienen valores por defecto).
 */
if (!DB_HOST || !DB_USER || !DB_PASSWORD) {
  throw new Error('DATABASE_URL o (DB_HOST, DB_USER, DB_PASSWORD) son obligatorios.');
}

/**
 * Crear instancia de Sequelize con variables individuales
 * 
 * new Sequelize(database, username, password, options)
 * 
 * - DB_NAME || 'postgres': nombre de la base de datos (por defecto 'postgres')
 * - DB_USER: usuario de la base de datos
 * - DB_PASSWORD: contraseña del usuario
 * - options: configuración adicional (host, port, etc.)
 */
module.exports = new Sequelize(
  DB_NAME || 'postgres', // Nombre de la base de datos (por defecto 'postgres')
  DB_USER,               // Usuario
  DB_PASSWORD,           // Contraseña
  {
    ...baseConfig,       // Extender la configuración base
    host: DB_HOST,       // Host de la base de datos (ej: localhost)
    port: DB_PORT || 5432 // Puerto (por defecto 5432, puerto estándar de PostgreSQL)
  }
);

