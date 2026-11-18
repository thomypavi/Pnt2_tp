<template>
  <div class="page-container">
    <!-- Header with filters at same height -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Bienvenido, {{ authStore.user?.name || 'Usuario' }}! Aquí está el resumen de tus gastos</p>
      </div>

      <!-- Date filter component -->
      <DateFilter
        v-model:start-date="filters.startDate"
        v-model:end-date="filters.endDate"
        v-model:selected-preset="selectedPreset"
        @date-changed="selectedPreset = ''"
      />
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-3 gap-6 mb-8">
      <div class="card-accent border-green-500">
        <div class="flex items-start justify-between">
          <div>
            <p class="stat-label">Total de Gastos (USD)</p>
            <p class="stat-value">{{ filteredTotals.total }}</p>
          </div>
          <div class="icon-container bg-green-50">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="card-accent border-blue-500">
        <div class="flex items-start justify-between">
          <div>
            <p class="stat-label">Gastos Pagados (USD)</p>
            <p class="stat-value">{{ filteredTotals.paid }}</p>
            <p class="stat-secondary">{{ filteredTotals.paidCount }} gastos</p>
          </div>
          <div class="icon-container bg-blue-50">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="card-accent border-orange-500">
        <div class="flex items-start justify-between">
          <div>
            <p class="stat-label">Gastos Pendientes (USD)</p>
            <p class="stat-value">{{ filteredTotals.pending }}</p>
            <p class="stat-secondary">{{ filteredTotals.pendingCount }} gastos</p>
          </div>
          <div class="icon-container bg-orange-50">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 gap-6 mb-8">
      <!-- Chart de Barras - Gastos por Día/Mes -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="section-title">Gastos por Día</h2>
        </div>
        
        <ExpenseChart 
          :expenses="filteredExpenses"
          :start-date="filters.startDate" 
          :end-date="filters.endDate" 
        />
      </div>

      <!-- Chart de Torta - Gastos por Categoría -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="section-title">Gastos por Categoría</h2>
        </div>
        
        <CategoryPieChart 
          :expenses="filteredExpenses"
          :categories="categories"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useExpenseStore } from '../stores/expenseStore'
import { useAuthStore } from '../stores/authStore'
import ExpenseChart from '../components/ExpenseChart.vue'
import CategoryPieChart from '../components/CategoryPieChart.vue'
import DateFilter from '../components/DateFilter.vue'
import { useDateFilters } from '../composables/useDateFilters'
import { STATUS } from '../utils/status'
import { getExpenseValueInUSD } from '../utils/expense'
import { formatCurrency } from '../utils/currency'

const expenseStore = useExpenseStore()
const authStore = useAuthStore()

// Obtener datos del store
const expenses = computed(() => expenseStore.expenses)
const categories = computed(() => expenseStore.categories)

// Usar composable para filtros de fecha
const { filters, selectedPreset, filteredExpenses } = useDateFilters(expenses)

// Totales basados en gastos filtrados
const filteredTotals = computed(() => {
  const total = filteredExpenses.value.reduce((sum, expense) => {
    return sum + getExpenseValueInUSD(expense)
  }, 0)

  const paid = filteredExpenses.value
    .filter(e => e.status === STATUS.PAID)
    .reduce((sum, expense) => {
      return sum + getExpenseValueInUSD(expense)
    }, 0)

  const pending = filteredExpenses.value
    .filter(e => e.status === STATUS.UNPAID)
    .reduce((sum, expense) => {
      return sum + getExpenseValueInUSD(expense)
    }, 0)

  const paidCount = filteredExpenses.value.filter(e => e.status === STATUS.PAID).length
  const pendingCount = filteredExpenses.value.filter(e => e.status === STATUS.UNPAID).length

  return {
    total: formatCurrency(total),
    paid: formatCurrency(paid),
    paidCount,
    pending: formatCurrency(pending),
    pendingCount
  }
})

onMounted(async () => {
  if (authStore.isAuthenticated && expenseStore.expenses.length === 0) {
    await expenseStore.loadInitialData()
  }
})
</script>
