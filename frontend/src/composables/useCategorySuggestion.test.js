/**
 * Tests del composable useCategorySuggestion
 * El servicio que llama al backend se reemplaza por uno falso.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../services/categoryService', () => ({
  default: { suggestCategory: vi.fn() }
}))

import categoryService from '../services/categoryService'
import { useCategorySuggestion } from './useCategorySuggestion'

const respuesta = (data) => ({ data: { success: true, data } })

describe('useCategorySuggestion', () => {
  beforeEach(() => vi.clearAllMocks())

  it('devuelve el id sugerido y arma el mensaje', async () => {
    categoryService.suggestCategory.mockResolvedValue(respuesta({ categoryId: 3, categoryName: 'Comida' }))
    const { suggest, hint, suggesting } = useCategorySuggestion()

    const id = await suggest('Coto', 'compra')

    expect(id).toBe(3)
    expect(categoryService.suggestCategory).toHaveBeenCalledWith('Coto', 'compra')
    expect(hint.value).toBe('Sugerencia: Comida')
    expect(suggesting.value).toBe(false)
  })

  it('devuelve null si no hay ninguna categoría que encaje', async () => {
    categoryService.suggestCategory.mockResolvedValue(respuesta({ categoryId: null, categoryName: null }))
    const { suggest, hint } = useCategorySuggestion()
    expect(await suggest('Ferretería', 'tornillos')).toBeNull()
    expect(hint.value).toMatch(/Elegila a mano/)
  })

  it('si el backend falla, muestra el error y devuelve null', async () => {
    categoryService.suggestCategory.mockRejectedValue(new Error('Sin conexión'))
    const { suggest, hint, hintIsError, suggesting } = useCategorySuggestion()

    expect(await suggest('Coto', '')).toBeNull()
    expect(hint.value).toBe('Sin conexión')
    expect(hintIsError.value).toBe(true)
    expect(suggesting.value).toBe(false)
  })
})
