import { ref } from 'vue'
import expenseService from '../services/expenseService'

export const useExchangeRate = () => {
  const loadingExchangeRate = ref(false)
  const exchangeRate = ref(null)

  const fetchExchangeRate = async (currency) => {
    if (currency === 'USD') {
      exchangeRate.value = 1
      loadingExchangeRate.value = false
      return
    }

    loadingExchangeRate.value = true
    try {
      const response = await expenseService.getExchangeRate(currency)
      const rate = response.data.data.rate
      exchangeRate.value = rate
    } catch (error) {
      console.error('Error al obtener tasa de conversión:', error)
      exchangeRate.value = 1
    } finally {
      loadingExchangeRate.value = false
    }
  }

  const reset = () => {
    exchangeRate.value = null
    loadingExchangeRate.value = false
  }

  return {
    loadingExchangeRate,
    exchangeRate,
    fetchExchangeRate,
    reset
  }
}

