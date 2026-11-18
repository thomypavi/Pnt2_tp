import axios from 'axios'

// Configuración de la URL base de la API

// La URL del backend se toma de la variable de entorno VITE_API_URL
// (en local: archivo .env.local; en producción: variables de Vercel / secrets de GitHub).
// Si no está definida, se usa el backend local.
const getBaseURL = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3003/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token a las peticiones, recordemos que el backend ya filtra por usuario autenticado usando el token del interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    // Si el error es 401 (no autorizado), limpiar token y redirigir
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      // Solo redirigir si no estamos ya en login/register
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login'
      }
    }
    const message = error.response?.data?.message || error.message || 'Error desconocido'
    return Promise.reject(new Error(message))
  }
)

export default api

