# Expense Manager - Backend API

API RESTful para el sistema de gestión de gastos desarrollado con Node.js, Express y Sequelize.

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- npm (v8 o superior)

## 🚀 Instalación

1. Navegar al directorio del backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
   - Crear un archivo `.env` en la raíz del backend
   - Configurar con tus credenciales de Supabase:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
JWT_SECRET=tu-secret-key

```

4. Ejecutar el servidor:
```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en `http://localhost:3003`


## 🗄️ Modelos de Datos

### User (Usuario)
- `id`: INTEGER (PK, Auto-increment)
- `name`: STRING (requerido)
- `email`: STRING (requerido, único)
- `password`: STRING (requerido, hasheado con bcrypt)
- `createdAt`: TIMESTAMP
- `updatedAt`: TIMESTAMP

### Category (Categoría)
- `id`: INTEGER (PK, Auto-increment)
- `name`: STRING (requerido)
- `description`: TEXT (opcional)
- `color`: STRING(7) (hex color, requerido, default: '#3b82f6')
- `userId`: INTEGER (FK a User)
- `createdAt`: TIMESTAMP
- `updatedAt`: TIMESTAMP

### Expense (Gasto)
- `id`: INTEGER (PK, Auto-increment)
- `date`: DATEONLY (requerido)
- `vendor`: STRING (requerido)
- `amount`: DECIMAL(10,2) (requerido, min 0)
- `currency`: ENUM('USD', 'EUR', 'ARS', 'BRL', 'MXN') (requerido, default: 'USD')
- `description`: TEXT (opcional)
- `status`: ENUM('Paid', 'Unpaid') (requerido, default: 'Unpaid')
- `conversion_usd`: DECIMAL(10,2) (valor convertido a USD)
- `rate_usd`: DECIMAL(10,6) (tasa de conversión)
- `userId`: INTEGER (FK a User)
- `categoryId`: INTEGER (FK a Category, nullable)
- `createdAt`: TIMESTAMP
- `updatedAt`: TIMESTAMP

## 🔌 Endpoints API

### Autenticación (`/api/auth`)

- `POST /api/auth/register` - Registrar un nuevo usuario
- `POST /api/auth/login` - Iniciar sesión

**Ejemplo POST /api/auth/register:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}
```

**Ejemplo POST /api/auth/login:**
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

### Gastos (`/api/expenses`)

- `GET /api/expenses` - Obtener todos los gastos del usuario autenticado
  - Query params: `categoryId`, `status`, `startDate`, `endDate` (opcionales)
- `GET /api/expenses/exchange-rate` - Obtener tasa de conversión
  - Query params: `currency` (requerido)
- `GET /api/expenses/:id` - Obtener un gasto por ID
- `POST /api/expenses` - Crear un nuevo gasto
- `PUT /api/expenses/:id` - Actualizar un gasto
- `DELETE /api/expenses/:id` - Eliminar un gasto
- `PATCH /api/expenses/:id/mark-as-paid` - Marcar gasto como pagado

**Ejemplo POST /api/expenses:**
```json
{
  "date": "2024-01-15",
  "vendor": "Supermercado ABC",
  "amount": 150.50,
  "currency": "ARS",
  "description": "Compra semanal",
  "status": "Unpaid",
  "categoryId": 1,
  "rate_usd": 1420.00,
  "conversion_usd": 0.11
}
```

### Categorías (`/api/categories`)

- `GET /api/categories` - Obtener todas las categorías del usuario autenticado
- `GET /api/categories/:id` - Obtener una categoría por ID
- `POST /api/categories` - Crear una nueva categoría
- `PUT /api/categories/:id` - Actualizar una categoría
- `DELETE /api/categories/:id` - Eliminar una categoría

**Ejemplo POST /api/categories:**
```json
{
  "name": "Alimentación",
  "description": "Gastos en comida y restaurantes",
  "color": "#3b82f6"
}
```

## 📝 Respuestas de la API

### Respuesta Exitosa
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```

### Respuesta de Error
```json
{
  "success": false,
  "message": "Mensaje de error",
  "errors": [ ... ]
}
```

## 🛠️ Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución
- **Express**: Framework web
- **Sequelize**: ORM para PostgreSQL
- **PostgreSQL**: Base de datos (Supabase)
- **JWT**: Autenticación con tokens
- **bcryptjs**: Hash de contraseñas
- **dotenv**: Gestión de variables de entorno
- **cors**: Habilitación de CORS
- **axios**: Cliente HTTP para servicios externos

## 🔒 Seguridad

- ✅ Autenticación JWT implementada
- ✅ Hash de contraseñas con bcrypt
- ✅ Middleware de ownership para proteger recursos
- ✅ Validación de datos con Sequelize
- ✅ Manejo de errores centralizado


