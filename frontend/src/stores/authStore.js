import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '../services/authService'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Rol del usuario logueado ('user' | 'admin'), viene del backend en login, register y /auth/me
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Inicializar usuario desde token guardado
  const initAuth = async () => {
    if (token.value) {
      try {
        // El interceptor de api.js ya agrega el token automáticamente
        const response = await authService.getCurrentUser()
        user.value = response.data
      } catch (err) {
        // Token inválido, limpiar
        logout()
      }
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)

      // El backend devuelve: { success, message, data: { user, token } }
      if (response.success && response.data) {
        token.value = response.data.token
        user.value = response.data.user
        localStorage.setItem('token', token.value)

        return { success: true }
      }

      throw new Error(response.message || 'Error al iniciar sesión')
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al iniciar sesión'
      return { success: false, error: errorMessage }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      
      // El backend devuelve: { success: true, data: { user, token } }
      if (response.success && response.data) {
        token.value = response.data.token
        user.value = response.data.user
        localStorage.setItem('token', token.value)
        
        return { success: true }
      } else {
        throw new Error(response.message || 'Error al registrarse')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al registrarse'
      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    // El interceptor de api.js ya maneja la limpieza del header automáticamente
    router.push('/login')
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    initAuth,
    login,
    register,
    logout
  }
})

