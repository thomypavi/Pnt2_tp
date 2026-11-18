import { defineStore } from 'pinia'
import expenseService from '../services/expenseService'
import categoryService from '../services/categoryService'

export const useExpenseStore = defineStore('expense', {
  state: () => ({
    expenses: [],
    categories: []
  }),

  actions: {
    async loadInitialData () {
      await Promise.all([
        this.fetchExpenses(),
        this.fetchCategories()
      ])
    },

    async fetchExpenses () {
      try {
        // El backend ya filtra por usuario autenticado usando el token del interceptor
        const response = await expenseService.getAllExpenses()
        this.expenses = response.data.data || []
      } catch (error) {
        throw error
      }
    },

    async fetchCategories () {
      try {
        // El backend ya filtra por usuario autenticado usando el token del interceptor
        const response = await categoryService.getAllCategories()
        this.categories = response.data.data || []
      } catch (error) {
        throw error
      }
    }
  }
})

