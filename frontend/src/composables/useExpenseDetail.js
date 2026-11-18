import { ref } from 'vue'
import expenseService from '../services/expenseService'

export const useExpenseDetail = () => {
  const expense = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const loadExpense = async (expenseId) => {
    loading.value = true
    error.value = null
    try {
      const response = await expenseService.getExpenseById(expenseId)
      expense.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Error al cargar el gasto'
      console.error('Error al cargar gasto:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    expense,
    loading,
    error,
    loadExpense
  }
}

