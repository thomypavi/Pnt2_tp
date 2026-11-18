# Resumen del Código - Sistema de Gestión de Gastos

## 📋 Propósito General
API REST desarrollada en Node.js y Express para gestionar gastos personales con sistema de autenticación, categorización y conversión automática de monedas.

## 🏗️ Arquitectura
- **Stack Tecnológico**: Node.js, Express, Sequelize (ORM), PostgreSQL
- **Estructura**: Arquitectura MVC (Modelos, Vistas/Controladores, Rutas)
- **Autenticación**: JWT (JSON Web Tokens)
- **Seguridad**: bcrypt para hash de contraseñas, middleware de autenticación y validación de propiedad

## 📊 Modelos de Datos (Sequelize)

### 1. **User (Usuario)**
- Campos: `id`, `name`, `email`, `password`
- Validaciones: email único, contraseña mínimo 6 caracteres

### 2. **Category (Categoría)**
- Campos: `id`, `name`, `description`, `color` (hexadecimal), `userId`
- Relación: pertenece a un User, tiene muchos Expenses

### 3. **Expense (Gasto)**
- Campos: `id`, `date`, `vendor`, `amount`, `currency`, `description`, `status` (Paid/Unpaid), `rate_usd`, `conversion_usd`, `userId`, `categoryId`
- Monedas soportadas: USD, EUR, ARS, BRL, MXN, GBP, JPY, CNY, CHF, CAD, AUD, INR, NZD
- Conversión automática a USD con tasa de cambio

## 🎮 Controladores Principales

### 1. **authController.js**
- `register`: Registro de nuevos usuarios con hash de contraseña y generación de JWT
- `login`: Autenticación de usuarios y generación de token
- `getCurrentUser`: Obtener perfil del usuario autenticado

### 2. **expenseController.js**
- `getAllExpenses`: Listar todos los gastos con filtros (categoría, estado, fechas)
- `getExpenseById`: Obtener un gasto específico
- `createExpense`: Crear nuevo gasto con conversión automática a USD
- `updateExpense`: Actualizar gasto (recalcula conversión si cambia moneda/monto)
- `markAsPaid`: Marcar gasto como pagado
- `deleteExpense`: Eliminar gasto
- `getExchangeRate`: Obtener tasa de conversión de moneda

### 3. **categoryController.js**
- `getAllCategories`: Listar todas las categorías del usuario
- `getCategoryById`: Obtener categoría con sus gastos asociados
- `createCategory`: Crear categoría con color automático si no se especifica
- `updateCategory`: Actualizar categoría
- `deleteCategory`: Eliminar categoría (los gastos quedan sin categoría)

## 🛡️ Middleware

### 1. **auth.js**
- Verifica token JWT en header `Authorization: Bearer <token>`
- Valida existencia del usuario
- Agrega `req.userId` y `req.user` al request

### 2. **checkOwnership.js**
- `checkExpenseOwnership`: Valida que el gasto pertenece al usuario
- `checkCategoryOwnership`: Valida que la categoría pertenece al usuario
- Previene acceso a recursos de otros usuarios

### 3. **errorHandler.js**
- Manejo centralizado de errores
- Errores específicos de Sequelize (validación, claves únicas, claves foráneas)
- Respuestas JSON consistentes

## 🛣️ Rutas

### **`/api/auth`**
- `POST /register` (pública) - Registrar nuevo usuario
- `POST /login` (pública) - Iniciar sesión
- `GET /me` (protegida) - Obtener usuario actual

### **`/api/expenses`** (todas protegidas)
- `GET /exchange-rate` - Obtener tasa de conversión
- `GET /` - Listar todos los gastos
- `POST /` - Crear nuevo gasto
- `GET /:id` - Obtener gasto por ID
- `PUT /:id` - Actualizar gasto
- `PATCH /:id/mark-as-paid` - Marcar como pagado
- `DELETE /:id` - Eliminar gasto

### **`/api/categories`** (todas protegidas)
- `GET /` - Listar todas las categorías
- `GET /:id` - Obtener categoría por ID
- `POST /` - Crear nueva categoría
- `PUT /:id` - Actualizar categoría
- `DELETE /:id` - Eliminar categoría

## 🌐 Servicios Externos

### **currencyService.js**
- Integración con API `open.er-api.com` para obtener tasas de cambio
- Convierte monedas a USD automáticamente
- Manejo de errores si falla la API

## 🔒 Características de Seguridad

1. **Autenticación JWT** con expiración de 7 días
2. **Contraseñas hasheadas** con bcrypt (10 rounds)
3. **Validación de propiedad**: usuarios solo acceden a sus propios recursos
4. **userId siempre del token**, nunca del body (previene suplantación)
5. **CORS configurado** para orígenes permitidos
6. **Validación de datos** en modelos y controladores

## ⭐ Funcionalidades Destacadas

### 1. **Conversión Automática de Monedas**
- Calcula `rate_usd` y `conversion_usd` automáticamente
- Permite valores manuales si el usuario los proporciona
- Si falla la API, usa valores por defecto

### 2. **Sistema de Categorías con Colores**
- Asignación automática de colores disponibles
- Colores predefinidos en `constants/colors.js`

### 3. **Filtros Avanzados**
- Por categoría, estado, rango de fechas
- Ordenamiento por fecha descendente

### 4. **Manejo de Relaciones**
- Incluye datos relacionados (User, Category) en respuestas
- Eliminación en cascada controlada (categorías → gastos sin categoría)

## ⚙️ Configuración del Servidor

- Puerto configurable vía `process.env.PORT`
- CORS configurado para desarrollo y producción
- Sincronización de base de datos con Sequelize
- Manejo graceful de cierre (SIGTERM)

## 📝 Estructura de Respuesta API

Todas las respuestas siguen el formato:
```json
{
  "success": true/false,
  "message": "Mensaje descriptivo",
  "data": { ... }
}
```

---

**Nota**: Este proyecto implementa una API REST completa para gestión de gastos personales con autenticación robusta, seguridad y conversión automática de monedas.

