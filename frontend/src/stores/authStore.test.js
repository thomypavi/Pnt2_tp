/**
 * Tests de authStore (lógica de negocio crítica: login, logout y roles)
 *
 * No llamamos al backend real: con vi.mock reemplazamos authService por funciones
 * falsas que devuelven lo que queremos, y el router por uno falso.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('../services/authService', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn()
  }
}))
vi.mock('../router', () => ({ default: { push: vi.fn() } }))

import authService from '../services/authService'
import router from '../router'
import { useAuthStore } from './authStore'

const usuario = { id: 1, name: 'Ana', email: 'ana@test.com', role: 'user' }
const admin = { id: 2, name: 'Admin', email: 'admin@test.com', role: 'admin' }

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    setActivePinia(createPinia()) // Un store nuevo y limpio para cada test
  })

  it('arranca sin usuario ni sesión', () => {
    const store = useAuthStore()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.isAdmin).toBe(false)
  })

  it('login correcto: guarda usuario y token (también en localStorage)', async () => {
    authService.login.mockResolvedValue({ success: true, data: { user: usuario, token: 'tok-123' } })
    const store = useAuthStore()

    const result = await store.login('ana@test.com', '123456')

    expect(result).toEqual({ success: true })
    expect(authService.login).toHaveBeenCalledWith('ana@test.com', '123456')
    expect(store.user).toEqual(usuario)
    expect(store.isAuthenticated).toBe(true)
    expect(localStorage.getItem('token')).toBe('tok-123')
  })

  it('login incorrecto: devuelve el error y no guarda nada', async () => {
    authService.login.mockRejectedValue(new Error('Credenciales inválidas'))
    const store = useAuthStore()

    const result = await store.login('ana@test.com', 'mal')

    expect(result).toEqual({ success: false, error: 'Credenciales inválidas' })
    expect(store.isAuthenticated).toBe(false)
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('isAdmin es false para un usuario común', async () => {
    authService.login.mockResolvedValue({ success: true, data: { user: usuario, token: 't' } })
    const store = useAuthStore()
    await store.login('ana@test.com', '123456')
    expect(store.isAdmin).toBe(false)
  })

  it('isAdmin es true para un administrador', async () => {
    authService.login.mockResolvedValue({ success: true, data: { user: admin, token: 't' } })
    const store = useAuthStore()
    await store.login('admin@test.com', '123456')
    expect(store.isAdmin).toBe(true)
  })

  it('logout limpia la sesión y redirige a /login', async () => {
    authService.login.mockResolvedValue({ success: true, data: { user: admin, token: 't' } })
    const store = useAuthStore()
    await store.login('admin@test.com', '123456')

    store.logout()

    expect(store.user).toBeNull()
    expect(store.isAdmin).toBe(false)
    expect(localStorage.getItem('token')).toBeNull()
    expect(router.push).toHaveBeenCalledWith('/login')
  })
})
