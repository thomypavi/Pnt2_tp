import api from './api'

// Endpoints de /api/admin: el backend responde 403 si el usuario no es admin
const adminService = {
  getStats () {
    return api.get('/admin/stats')
  },
  getUsers () {
    return api.get('/admin/users')
  },
  updateUserRole (id, role) {
    return api.patch(`/admin/users/${id}/role`, { role })
  }
}

export default adminService
