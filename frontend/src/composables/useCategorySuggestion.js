import { ref } from 'vue'
import categoryService from '../services/categoryService'

/**
 * Composable: sugerir la categoría de un gasto
 *
 * Encapsula el estado (cargando, mensaje, error) y la llamada al backend,
 * así el formulario solo tiene que llamar a suggest().
 *
 * Uso:
 *   const { suggesting, hint, suggest } = useCategorySuggestion()
 *   const id = await suggest(form.vendor, form.description)
 *   if (id) form.categoryId = id
 */
export function useCategorySuggestion () {
  const suggesting = ref(false)
  const hint = ref('')       // Texto que se muestra debajo del selector
  const hintIsError = ref(false)

  const suggest = async (vendor, description) => {
    suggesting.value = true
    hint.value = ''
    hintIsError.value = false

    try {
      const { data } = await categoryService.suggestCategory(vendor, description)
      const { categoryId, categoryName } = data.data

      if (!categoryId) {
        hint.value = 'No encontré una categoría que encaje. Elegila a mano.'
        return null
      }

      hint.value = `Sugerencia: ${categoryName}`
      return categoryId
    } catch (err) {
      hintIsError.value = true
      hint.value = err.message || 'No se pudo obtener una sugerencia'
      return null
    } finally {
      suggesting.value = false
    }
  }

  const clearHint = () => {
    hint.value = ''
    hintIsError.value = false
  }

  return { suggesting, hint, hintIsError, suggest, clearHint }
}
