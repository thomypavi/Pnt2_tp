import { ref, computed } from 'vue'
import { getFirstDayOfMonth, getLastDayOfMonth } from '../utils/date'

export const useDateFilters = (expenses) => {
  const today = new Date()
  
  const filters = ref({
    startDate: getFirstDayOfMonth(today),
    endDate: getLastDayOfMonth(today)
  })

  const selectedPreset = ref('currentMonth')

  const filteredExpenses = computed(() => {
    let result = expenses.value

    if (filters.value.startDate) {
      result = result.filter(e => e.date >= filters.value.startDate)
    }
    if (filters.value.endDate) {
      result = result.filter(e => e.date <= filters.value.endDate)
    }

    return result
  })

  return {
    filters,
    selectedPreset,
    filteredExpenses
  }
}

