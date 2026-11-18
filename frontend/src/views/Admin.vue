<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Administración</h1>
        <p class="page-subtitle">Estadísticas de todo el sistema y gestión de roles de usuarios</p>
      </div>
      <AppButton label="Actualizar" icon="pi pi-refresh" :loading="loading" @click="loadData" />
    </div>

    <p v-if="error" class="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</p>

    <!-- Tarjetas con totales -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="card-accent border-blue-500">
        <p class="stat-label">Usuarios</p>
        <p class="stat-value">{{ stats.totales.usuarios }}</p>
        <p class="stat-secondary">{{ stats.totales.admins }} admin(s)</p>
      </div>
      <div class="card-accent border-purple-500">
        <p class="stat-label">Gastos registrados</p>
        <p class="stat-value">{{ stats.totales.gastos }}</p>
      </div>
      <div class="card-accent border-green-500">
        <p class="stat-label">Total (USD)</p>
        <p class="stat-value">{{ formatUsd(stats.totales.totalUsd) }}</p>
      </div>
      <div class="card-accent border-orange-500">
        <p class="stat-label">Pendiente de pago (USD)</p>
        <p class="stat-value">{{ formatUsd(unpaidUsd) }}</p>
      </div>
    </div>

    <!-- Gráfico: gastos de todos los usuarios por mes -->
    <div class="card mb-8">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Gastos por mes (últimos 6 meses, todos los usuarios)</h2>
      <Chart v-if="stats.porMes.length" type="bar" :data="chartData" :options="chartOptions" class="h-72" />
      <p v-else class="empty-state">Todavía no hay gastos en los últimos 6 meses</p>
    </div>

    <!-- Tabla de usuarios -->
    <div class="table-container">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="table-header">
            <tr>
              <th class="table-header-cell">Nombre</th>
              <th class="table-header-cell">Email</th>
              <th class="table-header-cell">Gastos</th>
              <th class="table-header-cell">Rol</th>
              <th class="table-header-cell">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="u in users" :key="u.id" class="table-row">
              <td class="table-body-cell text-sm font-semibold text-gray-900">{{ u.name }}</td>
              <td class="table-body-cell table-body-text">{{ u.email }}</td>
              <td class="table-body-cell table-body-text">{{ u.expensesCount }}</td>
              <td class="table-body-cell">
                <Tag :value="u.role === 'admin' ? 'Admin' : 'Usuario'" :severity="u.role === 'admin' ? 'warn' : 'secondary'" />
              </td>
              <td class="table-body-cell">
                <span v-if="u.id === authStore.user?.id" class="text-xs text-gray-400">(vos)</span>
                <Button
                  v-else
                  size="small"
                  outlined
                  :severity="u.role === 'admin' ? 'danger' : 'info'"
                  :label="u.role === 'admin' ? 'Quitar admin' : 'Hacer admin'"
                  :loading="updatingId === u.id"
                  @click="toggleRole(u)"
                />
              </td>
            </tr>
            <tr v-if="!loading && users.length === 0">
              <td colspan="5" class="empty-state">No hay usuarios</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Chart from 'primevue/chart'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import AppButton from '../components/AppButton.vue'
import adminService from '../services/adminService'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const updatingId = ref(null)
const users = ref([])
const stats = ref({
  totales: { usuarios: 0, admins: 0, gastos: 0, totalUsd: 0 },
  porEstado: [],
  porMes: []
})

const formatUsd = (n) => `$${Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const unpaidUsd = computed(() => stats.value.porEstado.find(e => e.status === 'Unpaid')?.totalUsd || 0)

const chartData = computed(() => ({
  labels: stats.value.porMes.map(m => {
    const [year, month] = m.month.split('-')
    return new Date(year, month - 1).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })
  }),
  datasets: [{
    label: 'Total USD',
    data: stats.value.porMes.map(m => m.totalUsd),
    backgroundColor: '#3b82f6',
    borderRadius: 6
  }]
}))

const chartOptions = {
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true } }
}

// Trae estadísticas y usuarios en paralelo
const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    const [statsRes, usersRes] = await Promise.all([
      adminService.getStats(),
      adminService.getUsers()
    ])
    stats.value = statsRes.data.data
    users.value = usersRes.data.data
  } catch (err) {
    error.value = err.message || 'Error al cargar los datos de administración'
  } finally {
    loading.value = false
  }
}

const toggleRole = async (u) => {
  const newRole = u.role === 'admin' ? 'user' : 'admin'
  updatingId.value = u.id
  error.value = ''
  try {
    await adminService.updateUserRole(u.id, newRole)
    u.role = newRole
    stats.value.totales.admins += newRole === 'admin' ? 1 : -1
  } catch (err) {
    error.value = err.message || 'Error al cambiar el rol'
  } finally {
    updatingId.value = null
  }
}

onMounted(loadData)
</script>
