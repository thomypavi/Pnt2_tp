# Expense Manager

Aplicación para gestionar gastos personales: frontend en Vue 3 y backend propio en Express + PostgreSQL.

## Estructura

```
├── frontend/   Vue 3 + Vite + Pinia + Vue Router + PrimeVue + Tailwind
├── backend/    Node.js + Express + Sequelize + PostgreSQL (API REST con JWT)
└── TODO.md     Pendientes del proyecto
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

## Deploy

| Parte | Servicio | Root Directory | Variables de entorno |
|---|---|---|---|
| Backend | Vercel (proyecto aparte) | `backend` | `DATABASE_URL` (Transaction pooler de Supabase, puerto 6543), `JWT_SECRET`, `NODE_ENV=production`, `FRONTEND_URL` |
| Frontend | Vercel | `frontend` | `VITE_API_URL` (URL del backend + `/api`) |

> Falta documentar los secrets de GitHub Actions. Ver [TODO.md](TODO.md).
