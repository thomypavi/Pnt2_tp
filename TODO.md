# TODO – TP Final PNT2

Lista de pendientes. Al terminar algo, se marca `[x]` y se commitea junto con el cambio.

## 1. Cuentas propias (que nada dependa de cuentas ajenas)

- [x] Mover el repo del frontend a `github.com/thomypavi/pnt2_`
- [x] Unir frontend y backend en este mismo repo (carpetas `frontend/` y `backend/`)
- [x] Sacar del código del backend las URLs de CORS y leerlas de la variable `FRONTEND_URL`
- [x] Crear una base Postgres propia en Supabase y poner su URL (Session pooler) como `DATABASE_URL` en `backend/.env`
- [ ] Desplegar el backend en un Render propio (Root Directory: `backend`), con las variables `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production` y `FRONTEND_URL`
- [x] Sacar la URL del backend del código y leerla de la variable `VITE_API_URL`
- [ ] Cargar `VITE_API_URL` con la URL del Render nuevo (en Vercel y en `.env.local`)
- [ ] Desplegar el frontend en un Vercel propio (Root Directory: `frontend`)

## 2. Requisitos obligatorios que faltan

### Autenticación y roles
- [ ] Backend: agregar el campo `role` (`user` / `admin`) al modelo `User`
- [ ] Backend: incluir `role` en el JWT y en la respuesta de login, registro y `/auth/me`
- [ ] Backend: crear el middleware `requireAdmin` y protegerle las rutas de admin
- [ ] Frontend: agregar `isAdmin` en `authStore`
- [ ] Frontend: agregar `meta.requiresRole` en el router y chequearlo en el guard
- [ ] Frontend: crear una vista solo para admin (dashboard o gestión de usuarios)
- [ ] Frontend: mostrar u ocultar los ítems del Sidebar según el rol

### PWA
- [ ] Instalar y configurar `vite-plugin-pwa` en `vite.config.js`
- [ ] Armar el manifest (nombre, colores) y agregar los íconos en `public/`
- [ ] Probar que se instala desde el celular

### CI/CD
- [ ] Crear `.github/workflows/ci.yml` (install, test, build en cada push o PR)
- [ ] Crear `.github/workflows/deploy.yml` (deploy a Vercel al pushear a `main`)
- [ ] Cargar en GitHub los secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` y `VITE_API_URL`

### README
- [x] Explicar paso a paso la instalación de frontend y backend (README de la raíz)
- [ ] Escribir la descripción del proyecto
- [ ] Explicar cada secret de GitHub y de dónde se saca

## 3. Opcionales (suman nota)

- [ ] Dashboard con gráficos visible solo para admin
- [ ] Tests unitarios con Vitest para `authStore`, `expenseStore` y los composables
- [ ] Mail de bienvenida al registrarse (nodemailer + contraseña de aplicación de Gmail, con `EMAIL_USER` y `EMAIL_PASS` en el `.env`)
- [ ] Alguna función con IA (por ejemplo, sugerir la categoría a partir de la descripción del gasto)

## 4. Entender el proyecto

- [ ] Recorrer el flujo completo: login → router guard → store → service → backend
- [ ] Poder explicar cualquier parte del código (en la defensa oral lo preguntan)
