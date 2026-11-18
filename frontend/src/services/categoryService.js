import api from './api'

const categoryService = {
  getAllCategories (params = {}) {
    return api.get('/categories', { params })
  },
  createCategory (data) {
    return api.post('/categories', data)
  },
  updateCategory (id, data) {
    return api.put(`/categories/${id}`, data)
  },
  deleteCategory (id) {
    return api.delete(`/categories/${id}`)
  }
}

export default categoryService

