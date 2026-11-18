import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('../views/Home.vue')
      },
      {
        path: 'expenses',
        name: 'Expenses',
        component: () => import('../views/Expenses.vue')
      },
      {
        path: 'expenses/:id',
        name: 'ExpenseDetail',
        component: () => import('../views/ExpenseDetail.vue'),
        props: true
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('../views/Categories.vue')
      },
      {
        // Panel de administración: solo para usuarios con rol 'admin'
        path: 'admin',
        name: 'Admin',
        component: () => import('../views/Admin.vue'),
        meta: { requiresRole: 'admin' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Inicializar auth si hay token
  if (authStore.token && !authStore.user) {
    await authStore.initAuth()
  }

  // Rutas que requieren autenticación
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // Rutas que requieren un rol específico (ej. meta: { requiresRole: 'admin' })
  // to.matched incluye las rutas padre, así que también funciona con rutas anidadas.
  // Ojo: esto solo oculta la vista; la seguridad real la hace el backend (403).
  const requiredRole = to.matched.find(r => r.meta.requiresRole)?.meta.requiresRole
  if (requiredRole && authStore.user?.role !== requiredRole) {
    next('/')
    return
  }

  // Rutas que requieren ser invitado (login/register)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
    return
  }

  next()
})

export default router