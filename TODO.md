# TODO – TP Final PNT2

Lista de pendientes. Al terminar algo, se marca `[x]` y se commitea junto con el cambio.

## 1. Cuentas propias (que nada dependa de cuentas ajenas)

- [x] Mover el repo del frontend a `github.com/thomypavi/pnt2_`
- [x] Unir frontend y backend en este mismo repo (carpetas `frontend/` y `backend/`)
- [x] Sacar del código del backend las URLs de CORS y leerlas de la variable `FRONTEND_URL`
- [x] Crear una base Postgres propia en Supabase y poner su URL (Session pooler) como `DATABASE_URL` en `backend/.env`
- [x] Adaptar el backend para que corra en Vercel (exporta `app`, `listen` solo en local)
- [x] Desplegar el backend en Vercel (proyecto aparte, Root Directory: `backend`), con las variables `DATABASE_URL` (Transaction pooler de Supabase, puerto 6543), `JWT_SECRET`, `NODE_ENV=production` y `FRONTEND_URL`
- [x] Sacar la URL del backend del código y leerla de la variable `VITE_API_URL`
- [x] Cargar `VITE_API_URL` con la URL del backend en Vercel (en Vercel y en `.env.local`)
- [x] Desplegar el frontend en un Vercel propio (Root Directory: `frontend`)

## 2. Requisitos obligatorios que faltan

### Autenticación y roles
- [x] Backend: agregar el campo `role` (`user` / `admin`) al modelo `User` (y la migración `npm run migrate:role`)
- [x] Backend: incluir `role` en el JWT y en la respuesta de login, registro y `/auth/me`
- [x] Backend: crear el middleware `requireAdmin` y protegerle las rutas `/api/admin/*` (stats, users, cambiar rol)
- [x] Frontend: agregar `isAdmin` en `authStore`
- [x] Frontend: agregar `meta.requiresRole` en el router y chequearlo en el guard
- [x] Frontend: crear la vista `/admin` (estadísticas de todo el sistema, gráfico por mes y gestión de roles)
- [x] Frontend: mostrar el ítem "Administración" en el Sidebar solo a los admins

### PWA
- [x] Instalar y configurar `vite-plugin-pwa` en `vite.config.js`
- [x] Armar el manifest (nombre, colores) y generar los íconos desde `public/logo.svg` (`npm run generate-pwa-assets`)
- [ ] Probar que se instala desde el celular

### CI/CD
- [x] Crear `.github/workflows/ci.yml` (install, test, build en cada push o PR)
- [x] Crear `.github/workflows/deploy.yml` (deploy a Vercel al pushear a `main`, solo si pasa el CI)
- [ ] Cargar en GitHub (repo de entrega) los secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID_BACKEND` y `VERCEL_PROJECT_ID_FRONTEND` (ver README)

### README
- [x] Explicar paso a paso la instalación de frontend y backend (README de la raíz)
- [x] Escribir la descripción del proyecto
- [x] Explicar cada secret de GitHub y de dónde se saca

## 3. Opcionales (suman nota)

- [x] Dashboard con gráficos visible solo para admin (vista `/admin`)
- [x] Tests unitarios: Vitest en el frontend (`authStore`, composable de sugerencia, utils) y `node --test` en el backend (`requireAdmin`, sugerencia de categoría)
- [ ] Mail de bienvenida al registrarse (nodemailer + contraseña de aplicación de Gmail, con `EMAIL_USER` y `EMAIL_PASS` en el `.env`)
- [x] Sugerir la categoría de un gasto por palabras clave

## 4. Entender el proyecto

- [ ] Recorrer el flujo completo: login → router guard → store → service → backend
- [ ] Poder explicar cualquier parte del código (en la defensa oral lo preguntan)
