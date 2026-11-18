# Expense Manager

Aplicación para gestionar gastos personales: frontend en Vue 3 y backend propio en Express + PostgreSQL.

## Estructura

```
├── frontend/   Vue 3 + Vite + Pinia + Vue Router + PrimeVue + Tailwind
├── backend/    Node.js + Express + Sequelize + PostgreSQL (API REST con JWT)
└── TODO.md     Pendientes del proyecto
```

## Cómo levantarlo en local

Se necesita Node.js 18 o superior y una base PostgreSQL (local, o gratis en Render o Neon).

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

## Deploy

| Parte | Servicio | Root Directory | Variables de entorno |
|---|---|---|---|
| Backend | Render | `backend` | `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, `FRONTEND_URL` |
| Frontend | Vercel | `frontend` | `VITE_API_URL` (URL del backend + `/api`) |

> Falta documentar los secrets de GitHub Actions. Ver [TODO.md](TODO.md).
