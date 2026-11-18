<template>
  <div class="page-container">
    <!-- Header -->
    <div class="mb-6">
      <Button
        label="Volver"
        icon="pi pi-arrow-left"
        severity="secondary"
        outlined
        @click="$router.push({ name: 'Expenses' })"
        class="mb-4"
      />
      <h1 class="page-title">Detalle del Gasto</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="card text-center">
      <i class="pi pi-spin pi-spinner text-4xl text-blue-600 mb-4"></i>
      <p class="page-subtitle">Cargando gasto...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="card">
      <div class="text-center">
        <i class="pi pi-exclamation-triangle text-4xl text-red-500 mb-4"></i>
        <h2 class="section-title mb-2">Error</h2>
        <p class="page-subtitle mb-4">{{ error }}</p>
        <Button
          label="Volver a Gastos"
          icon="pi pi-arrow-left"
          @click="$router.push({ name: 'Expenses' })"
        />
      </div>
    </div>

    <!-- Expense Detail -->
    <div v-else-if="expense" class="space-y-6">
      <!-- Main Card -->
      <div class="card">
        <div class="mb-6">
          <h2 class="section-title">Información del Gasto</h2>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <!-- Fecha -->
          <div>
            <label class="detail-label">Fecha</label>
            <p class="detail-value">{{ formatDate(expense.date, 'long') }}</p>
          </div>

          <!-- Vendedor -->
          <div>
            <label class="detail-label">Vendedor</label>
            <p class="detail-value">{{ expense.vendor }}</p>
          </div>

          <!-- Monto -->
          <div>
            <label class="detail-label">Monto</label>
            <p class="detail-value" :class="getCurrencyColor(expense.currency)">
              {{ getCurrencySymbol(expense.currency) }}{{ formatAmount(expense.amount, expense.currency) }}
            </p>
          </div>

          <!-- Moneda -->
          <div>
            <label class="detail-label">Moneda</label>
            <p class="detail-value">{{ expense.currency }}</p>
          </div>

          <!-- Tasa de Conversión -->
          <div v-if="expense.currency !== 'USD'">
            <label class="detail-label">
              Tasa de Conversión ({{ expense.currency }}/USD)
            </label>
            <p class="detail-value">
              {{ formatNumber(expense.rate_usd, 6) }}
            </p>
          </div>

          <!-- Conversión a USD -->
          <div>
            <label class="detail-label">Conversión a USD</label>
            <p class="detail-value text-blue-600">
              ${{ formatAmount(expense.conversion_usd || expense.amount, 'USD') }}
            </p>
          </div>

          <!-- Estado -->
          <div>
            <label class="detail-label">Estado</label>
            <Tag
              :value="expense.status === 'Paid' ? 'Pagado' : 'Pendiente'"
              :severity="expense.status === 'Paid' ? 'success' : 'warning'"
              class="text-sm"
            />
          </div>

          <!-- Categoría -->
          <div>
            <label class="detail-label">Categoría</label>
            <div v-if="expense.category" class="flex items-center gap-2">
              <div
                class="icon-container w-8 h-8"
                :style="{ backgroundColor: expense.category.color || '#3b82f6', color: '#ffffff' }"
              >
                <i class="pi pi-tag text-sm"></i>
              </div>
              <p class="detail-value">{{ expense.category.name }}</p>
            </div>
            <p v-else class="detail-value text-gray-400">Sin categoría</p>
          </div>
        </div>

        <!-- Descripción -->
        <div v-if="expense.description" class="mt-6 pt-6 border-t border-gray-200">
          <label class="detail-label mb-2">Descripción</label>
          <p class="text-gray-700 leading-relaxed">{{ expense.description }}</p>
        </div>
      </div>

      <!-- Metadata Card -->
      <div class="card">
        <h3 class="section-title mb-4">Información Adicional</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label class="detail-label">ID del Gasto</label>
            <p class="text-gray-900 font-medium">#{{ expense.id }}</p>
          </div>
          <div v-if="expense.user">
            <label class="detail-label">Usuario</label>
            <p class="text-gray-900 font-medium">{{ expense.user.name }}</p>
          </div>
          <div v-if="expense.createdAt">
            <label class="detail-label">Fecha de Creación</label>
            <p class="text-gray-900 font-medium">{{ formatDateTime(expense.createdAt) }}</p>
          </div>
          <div v-if="expense.updatedAt">
            <label class="detail-label">Última Actualización</label>
            <p class="text-gray-900 font-medium">{{ formatDateTime(expense.updatedAt) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getCurrencySymbol, getCurrencyColor, formatAmount } from '../utils/currency'
import { formatDate, formatDateTime, formatNumber } from '../utils/date'
import { useExpenseDetail } from '../composables/useExpenseDetail'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

const route = useRoute()

const { expense, loading, error, loadExpense } = useExpenseDetail()

onMounted(() => {
  loadExpense(route.params.id)
})
</script>

