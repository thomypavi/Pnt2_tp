# Expense Manager

Aplicación web (SPA) para **gestionar gastos personales**. Cada usuario registra sus gastos (en distintas monedas, con conversión automática a USD), los organiza en categorías y ve un dashboard con totales y gráficos. Los administradores tienen además un panel con estadísticas de todo el sistema y gestión de roles.

**Funcionalidades principales**
- Registro e inicio de sesión con JWT, con roles **usuario** y **administrador**
- ABM de **gastos** (fecha, comercio, monto, moneda, estado pagado/pendiente) y de **categorías**
- Conversión de monedas a USD con cotización real
- Dashboard con filtros por fecha y gráficos (Chart.js)
- Panel de **administración** (solo admins): estadísticas globales y cambio de roles
- Sugerencia automática de la categoría de un gasto (por palabras clave)
- **PWA**: se puede instalar en el celular como una app
- **CI/CD** con GitHub Actions y deploy en Vercel

## Estructura

```
├── frontend/             Vue 3 + Vite + Pinia + Vue Router + PrimeVue + Tailwind
│   └── src/
│       ├── components/   Componentes reutilizables (tablas, formularios, gráficos)
│       ├── composables/  Lógica reutilizable (filtros de fecha, sugerencia de categoría...)
│       ├── stores/       Estado global con Pinia (auth, gastos)
│       ├── views/        Pantallas (Home, Gastos, Categorías, Admin, Login...)
│       ├── services/     Llamadas a la API (axios)
│       └── router/       Rutas y guards (auth y roles)
├── backend/              Node.js + Express + Sequelize + PostgreSQL (API REST con JWT)
│   ├── controllers/  routes/  middleware/  models/  services/
│   ├── scripts/          Migración de roles y datos de demo
│   └── tests/            Tests unitarios (node --test)
├── .github/workflows/    CI (tests + build) y CD (deploy a Vercel)
└── TODO.md               Pendientes del proyecto
```

## Cómo levantarlo en local

Se necesita Node.js 18 o superior y una base PostgreSQL (se usa Supabase).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env    # completar DATABASE_URL y JWT_SECRET
npm run dev             # queda en http://localhost:3003
```

### 2. Frontend (en otra terminal)

```bash
cd frontend
npm install
npm run dev             # queda en http://localhost:8080
```

En local, el frontend usa `http://localhost:3003/api` por defecto. Para apuntar a otro backend, se crea `frontend/.env.local` a partir de `frontend/.env.example`.

## Roles

| Rol | Qué puede hacer |
|---|---|
| `user` | Ver y gestionar sus propios gastos y categorías |
| `admin` | Todo lo anterior, y además el panel **Administración** (`/admin`): estadísticas de todos los usuarios y cambio de roles |

Todo usuario nuevo se registra como `user`. Para crear el **primer admin**:

```bash
cd backend
npm run migrate:role -- tu@email.com   # agrega la columna role (si falta) y hace admin a ese email
```

También se puede hacer desde Supabase (**Table Editor → users**, cambiar `role` a `admin`). Después, ese admin puede dar o quitar el rol a otros usuarios desde el panel.

La seguridad real la hace el backend: las rutas `/api/admin/*` pasan por los middlewares `authenticate` y `requireAdmin` (si el usuario no es admin, la respuesta es 403). El guard del router (`meta.requiresRole`) y el Sidebar solo ocultan la vista en el frontend.

## PWA (instalar como app)

El frontend es una PWA gracias a `vite-plugin-pwa` (configurado en `frontend/vite.config.js`):

- **En el celular:** abrir la app en Chrome → menú ⋮ → **Instalar app** / **Agregar a pantalla principal**. En iPhone (Safari): botón Compartir → **Agregar a inicio**.
- **En la compu:** en Chrome aparece un ícono de instalar en la barra de direcciones.
- **Para probar en local:** el Service Worker solo se genera en el build, no con `npm run dev`:
  ```bash
  cd frontend
  npm run build
  npm run preview
  ```
- **Íconos:** se generan desde `frontend/public/logo.svg` con `npm run generate-pwa-assets`.

## Sugerencia de categoría

En el formulario de un gasto, el botón **Sugerir** (al lado del selector de categoría) elige la categoría según el **comercio** y la **descripción**. Por ejemplo: "Coto" → Comida, "Edenor" → Servicios, "Netflix" → Entretenimiento.

Funciona con un diccionario de palabras clave (`backend/services/categorySuggestionService.js`, endpoint `POST /api/categories/suggest`): busca palabras conocidas en el texto y sugiere una de las categorías **del usuario** con un nombre que corresponda. Si no encuentra coincidencia, no sugiere nada.

## Tests

```bash
cd frontend && npm test   # Vitest: authStore (login, roles), composable de sugerencia, utilidades
cd backend && npm test    # node --test: middleware requireAdmin, sugerencia de categoría
```

Los tests no necesitan base de datos ni internet, así que corren igual en GitHub Actions.

## Deploy

| Parte | Servicio | Root Directory | Variables de entorno (en Vercel) |
|---|---|---|---|
| Backend | Vercel (proyecto aparte) | `backend` | `DATABASE_URL` (Transaction pooler de Supabase, puerto 6543), `JWT_SECRET`, `NODE_ENV=production`, `FRONTEND_URL` (URL del frontend, sin `/` final) |
| Frontend | Vercel | `frontend` | `VITE_API_URL` (URL del backend + `/api`) |

## CI/CD y secrets de GitHub

Hay dos workflows en `.github/workflows/`:

| Workflow | Cuándo corre | Qué hace |
|---|---|---|
| `ci.yml` (CI) | En cada push y Pull Request a `main` | Instala dependencias, corre los tests de frontend y backend, y compila el frontend. Si algo falla, el commit queda con ❌ en GitHub. **No necesita secrets.** |
| `deploy.yml` (CD) | En cada push a `main` (o a mano desde la pestaña **Actions**) | Primero corre el CI. **Solo si pasa**, despliega backend y frontend a Vercel en producción. |

### Secrets necesarios para el deploy

Se cargan en GitHub → el repo → **Settings → Secrets and variables → Actions → New repository secret**. GitHub los guarda encriptados: no se ven en el código ni en los logs.

| Secret | Qué es | De dónde se saca |
|---|---|---|
| `VERCEL_TOKEN` | Token personal que le da permiso a GitHub Actions para desplegar en tu cuenta de Vercel | Vercel → foto de perfil → **Account Settings → Tokens → Create Token**. Se copia una sola vez, al crearlo |
| `VERCEL_ORG_ID` | ID de tu cuenta (o equipo) de Vercel | Vercel → **Settings** de la cuenta/equipo → **General → Team ID** (en cuentas personales también aparece ahí). Empieza con `team_...` |
| `VERCEL_PROJECT_ID_BACKEND` | ID del proyecto del backend en Vercel | Proyecto del backend → **Settings → General → Project ID**. Empieza con `prj_...` |
| `VERCEL_PROJECT_ID_FRONTEND` | ID del proyecto del frontend en Vercel | Proyecto del frontend → **Settings → General → Project ID** |

**Los secrets de la app no van en GitHub.** `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` y `VITE_API_URL` se cargan en **Vercel** (tabla de Deploy), porque es Vercel el que compila y ejecuta la app. GitHub Actions solo necesita permiso para decirle a Vercel "desplegá".

Si los secrets de Vercel no están cargados, el workflow de deploy **se saltea** (con un aviso) y el CI sigue funcionando.

> **Nota:** si los proyectos de Vercel también están conectados al repo (deploy automático de Vercel), cada push despliega dos veces: una por Vercel y otra por GitHub Actions. No rompe nada. Si se quiere que el deploy pase **solo** por GitHub Actions (y solo cuando los tests pasan), en cada proyecto de Vercel: **Settings → Git → Disconnect**. Los deploys por la CLI siguen funcionando sin esa conexión.
