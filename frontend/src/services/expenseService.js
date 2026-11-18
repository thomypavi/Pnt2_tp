import api from './api'

const expenseService = {
  getAllExpenses (params = {}) {
    return api.get('/expenses', { params })
  },
  getExpenseById (id) {
    return api.get(`/expenses/${id}`)
  },
  createExpense (data) {
    return api.post('/expenses', data)
  },
  updateExpense (id, data) {
    return api.put(`/expenses/${id}`, data)
  },
  markAsPaid (id) {
    return api.patch(`/expenses/${id}/mark-as-paid`)
  },
  deleteExpense (id) {
    return api.delete(`/expenses/${id}`)
  },
  getExchangeRate (currency) {
    return api.get('/expenses/exchange-rate', { params: { currency } })
  }
}

export default expenseService

