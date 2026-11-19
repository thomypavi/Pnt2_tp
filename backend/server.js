/**
 * SERVIDOR PRINCIPAL - Punto de entrada de la aplicación
 * 
 * Este archivo configura y arranca el servidor Express con todas las rutas,
 * middleware y conexión a la base de datos.
 */

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Importar rutas - Cada archivo de rutas maneja un recurso específico
const authRoutes = require('./routes/authRoutes');        // Rutas de autenticación (login, register)
const categoryRoutes = require('./routes/categoryRoutes'); // Rutas de categorías
const expenseRoutes = require('./routes/expenseRoutes');   // Rutas de gastos
const adminRoutes = require('./routes/adminRoutes');       // Rutas de administración (solo admin)

const app = express();
const PORT = process.env.PORT || 3003; // Puerto desde variable de entorno (3003 por defecto, el que espera el frontend)

/**
 * CONFIGURACIÓN DE CORS (Cross-Origin Resource Sharing)
 * 
 * CORS permite que el frontend (que corre en otro puerto/dominio) pueda hacer
 * peticiones al backend. Sin esto, el navegador bloquearía las peticiones.
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (Postman, mobile apps, etc.)
    // Esto es útil para herramientas de desarrollo que no envían origin
    if (!origin) return callback(null, true);
    
    // Lista de orígenes permitidos (dominios que pueden hacer peticiones)
    // FRONTEND_URL: URL(s) del frontend en producción (Vercel), separadas por coma
    // Se normaliza cada URL con new URL(...).origin, así funciona aunque la variable
    // tenga "/" al final, espacios o alguna ruta (ej. "https://mi-app.vercel.app/login")
    const productionOrigins = (process.env.FRONTEND_URL || '')
      .split(',')
      .map(url => {
        try {
          return new URL(url.trim()).origin;
        } catch {
          return null; // Valor inválido: se ignora (y se ve en el log de abajo)
        }
      })
      .filter(Boolean);

    const allowedOrigins = [
      'http://localhost:8080',      // Frontend local puerto 8080
      'http://localhost:3000',      // Frontend local puerto 3000
      'http://localhost:5173',      // Vite dev server (puerto común)
      ...productionOrigins          // Frontend en producción
    ];
    
    // En desarrollo, permitir cualquier origin (más permisivo para desarrollo)
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // En producción, verificar contra la lista de orígenes permitidos
    // callback(null, true) = permitir, callback(error) = bloquear
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Se ve en Vercel → proyecto del backend → Logs. Muestra qué llegó y qué se esperaba.
      console.warn(`⚠️  CORS bloqueado para origin: ${origin}`);
      console.warn(`   FRONTEND_URL leída: ${JSON.stringify(process.env.FRONTEND_URL)} → orígenes permitidos: ${JSON.stringify(productionOrigins)}`);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true, // Permite enviar cookies y headers de autenticación
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Headers permitidos
  exposedHeaders: ['Authorization'], // Headers que el frontend puede leer
  preflightContinue: false, // No continuar con el siguiente handler después de preflight
  optionsSuccessStatus: 204 // Código de estado para requests OPTIONS exitosos
};

// MIDDLEWARE GLOBAL - Se ejecutan en orden para todas las peticiones
app.use(cors(corsOptions)); // Aplicar configuración CORS

// Manejar preflight requests explícitamente
// Los navegadores envían un request OPTIONS antes de hacer peticiones CORS
app.options('*', cors(corsOptions));

// Parsear el body de las peticiones JSON a objeto JavaScript
app.use(express.json());

// Parsear el body de formularios HTML (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// RUTAS - Se aplican en orden, las más específicas primero
// Rutas públicas (no requieren autenticación)
app.use('/api/auth', authRoutes);

// Rutas protegidas (requieren autenticación JWT - se valida en cada ruta)
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);

// Rutas de administración: /api/admin/* (requieren rol admin)
app.use('/api/admin', adminRoutes);


/**
 * MANEJO DE ERRORES
 * 
 * IMPORTANTE: Debe ir al final, después de todas las rutas.
 * Express ejecuta los middleware en orden, y el errorHandler captura
 * cualquier error que ocurra en las rutas anteriores.
 */
app.use(errorHandler);

/**
 * FUNCIÓN PARA INICIAR EL SERVIDOR
 * 
 * Esta función asíncrona:
 * 1. Conecta a la base de datos
 * 2. Sincroniza los modelos (crea/actualiza tablas si es necesario)
 * 3. Inicia el servidor HTTP en el puerto especificado
 */
const startServer = async () => {
  try {
    // Testear conexión a la base de datos
    // authenticate() verifica que las credenciales sean correctas
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    /**
     * Sincronizar modelos con la base de datos
     * 
     * sync({ alter: false }) - No modifica las tablas existentes
     * - Si alter: true, modificaría las tablas para que coincidan con los modelos
     * - En producción se usan migraciones en lugar de sync
     */
    await sequelize.sync({ alter: false });
    console.log('✅ Modelos sincronizados con la base de datos.');

    // Iniciar servidor HTTP - escucha en el puerto especificado
    app.listen(PORT, () => {
      console.log(`✅ Servidor iniciado en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    // Sequelize a veces envuelve errores en error.original
    if (error.original) {
      console.error('Error original:', error.original.message);
    }
    process.exit(1); // Salir con código de error
  }
};

/**
 * ¿LOCAL O VERCEL?
 *
 * - En local (npm run dev / npm start) levantamos el servidor con app.listen().
 * - En Vercel no hay un servidor "prendido" todo el tiempo: Vercel importa `app`
 *   y la ejecuta como función serverless en cada request. Por eso ahí NO se llama
 *   a startServer() (ni a listen ni a sync: las tablas ya existen en Supabase).
 *   Vercel define automáticamente la variable de entorno VERCEL=1.
 */
if (!process.env.VERCEL) {
  startServer();

  /**
   * MANEJO DE CIERRE GRACEFUL
   *
   * SIGTERM es una señal que se envía para pedirle al proceso que termine.
   * Esto permite cerrar conexiones de base de datos correctamente antes de salir.
   */
  process.on('SIGTERM', async () => {
    console.log('SIGTERM recibido, cerrando servidor...');
    await sequelize.close(); // Cerrar conexión a la base de datos
    process.exit(0); // Salir con código de éxito
  });
}

// Exportar la app para que Vercel la pueda ejecutar
module.exports = app;

