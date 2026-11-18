<template>
  <div class="page-container">
    <!-- Header with filters and action button -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Gastos</h1>
        <p class="page-subtitle">Gestiona y visualiza todos tus gastos</p>
    </div>

      <div class="flex flex-col items-end gap-3">
        <!-- Date filter component -->
        <DateFilter
          v-model:start-date="filters.startDate"
          v-model:end-date="filters.endDate"
          v-model:selected-preset="selectedPreset"
          @date-changed="selectedPreset = ''"
        />
        
        <!-- Action button -->
        <AppButton
          label="Nuevo Gasto"
          icon="pi pi-plus"
          @click="showModal = true"
        />
      </div>
    </div>

    <!-- Expenses Table -->
    <ExpenseTable
      :expenses="filteredExpenses"
      :categories="categories"
      :status-options="STATUS_OPTIONS"
      :filter-status-options="STATUS_OPTIONS"
      :deleting-ids="Array.from(deletingExpenseIds)"
      @view="$router.push({ name: 'ExpenseDetail', params: { id: $event } })"
      @edit="editExpense"
      @delete="deleteExpense"
      @status-change="handleStatusChange"
              />

    <!-- Modal de formulario -->
    <ExpenseFormDialog
      v-model:visible="showModal"
      :initial-expense="editingExpense"
      :categories="categories"
      :status-options="STATUS_OPTIONS"
      :currency-options="CURRENCY_OPTIONS"
      :saving="savingExpense"
      :loading-exchange-rate="loadingExchangeRate"
      :exchange-rate="exchangeRate"
      @save="handleSaveExpense"
      @closed="closeModal"
      @currency-change="handleCurrencyChange"
    />

    <!-- Dialog de Confirmación -->
    <ConfirmDialog
      v-model:visible="confirmDialog.visible"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :type="confirmDialog.type"
      :confirm-text="confirmDialog.confirmText"
      :cancel-text="confirmDialog.cancelText"
      :loading="confirmDialog.loading"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useExpenseStore } from '../stores/expenseStore'
import expenseService from '../services/expenseService'
import { CURRENCY_OPTIONS } from '../utils/currency'
import { STATUS_OPTIONS } from '../utils/status'
import { useConfirmDialog } from '../composables/useConfirmDialog'
import { useDateFilters } from '../composables/useDateFilters'
import { useExchangeRate } from '../composables/useExchangeRate'
import DateFilter from '../components/DateFilter.vue'
import ExpenseTable from '../components/ExpenseTable.vue'
import ExpenseFormDialog from '../components/ExpenseFormDialog.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import AppButton from '../components/AppButton.vue'

const route = useRoute()
const expenseStore = useExpenseStore()

const showModal = ref(false)
const editingExpense = ref(null)
const savingExpense = ref(false)
const deletingExpenseIds = ref(new Set())

const expenses = computed(() => expenseStore.expenses)
const categories = computed(() => expenseStore.categories)

// Usar composable para filtros de fecha
const { filters, selectedPreset, filteredExpenses } = useDateFilters(expenses)

// Usar composable para tasa de cambio
const { loadingExchangeRate, exchangeRate, fetchExchangeRate, reset: resetExchangeRate } = useExchangeRate()

// Función para abrir el modal de edición con un expense o un ID
const editExpense = async (expenseOrId) => {
  // Si es un objeto expense, usarlo directamente
  if (typeof expenseOrId === 'object' && expenseOrId !== null) {
    editingExpense.value = expenseOrId
    showModal.value = true
    return
  }
  
  // Si es un ID, cargarlo primero
  try {
    const response = await expenseService.getExpenseById(expenseOrId)
    const expense = response.data.data
  editingExpense.value = expense
    showModal.value = true
  } catch (error) {
    console.error('Error al cargar gasto para editar:', error)
    showConfirmModal(
      'Error',
      error.response?.data?.message || 'Error al cargar el gasto',
      'danger',
      null,
      'Aceptar'
    )
  }
}

const closeModal = () => {
  showModal.value = false
  editingExpense.value = null
  resetExchangeRate()
}

const handleCurrencyChange = async ({ currency }) => {
  await fetchExchangeRate(currency)
}

const handleSaveExpense = async (formData) => {
  if (savingExpense.value) return

  savingExpense.value = true
  try {
    const expenseData = {
      ...formData,
      // El backend obtiene userId del token automáticamente
      amount: formData.amount ? parseFloat(formData.amount) : 0,
      rate_usd: formData.rate_usd || null,
      conversion_usd: formData.conversion_usd || null
    }

    if (editingExpense.value) {
      await expenseService.updateExpense(editingExpense.value.id, expenseData)
    } else {
      await expenseService.createExpense(expenseData)
    }

    await expenseStore.fetchExpenses()
    closeModal()
  } catch (error) {
    console.error('Error al guardar gasto:', error)
    showConfirmModal(
      'Error',
      error.response?.data?.message || 'Error al guardar el gasto',
      'danger',
      null,
      'Aceptar'
    )
  } finally {
    savingExpense.value = false
}
}
// Estado y helpers del modal de confirmación (composable reutilizable)
const { confirmDialog, showConfirmModal, handleConfirm, handleCancel } = useConfirmDialog()

const handleStatusChange = async ({ expense, newStatus }) => {
  // Si el estado no cambió, no hacer nada
  if (expense.status === newStatus) {
    return
  }

  try {
  if (newStatus === 'Paid') {
          await expenseService.markAsPaid(expense.id)
    } else {
          await expenseService.updateExpense(expense.id, {
            ...expense,
            status: 'Unpaid'
          })
    }
          await expenseStore.fetchExpenses()
        } catch (error) {
          console.error('Error al cambiar estado:', error)
          showConfirmModal(
            'Error',
            error.response?.data?.message || 'Error al cambiar el estado del gasto',
            'danger',
            null,
            'Aceptar'
          )
          // Recargar para revertir el cambio visual
          await expenseStore.fetchExpenses()
  }
}

const deleteExpense = (id) => {
  showConfirmModal(
    'Eliminar Gasto',
    '¿Estás seguro de eliminar este gasto? Esta acción no se puede deshacer.',
    'danger',
    async () => {
      if (deletingExpenseIds.value.has(id)) return // Evitar múltiples eliminaciones
      
      deletingExpenseIds.value.add(id)
      try {
        await expenseService.deleteExpense(id)
        await expenseStore.fetchExpenses()
      } catch (error) {
        console.error('Error al eliminar gasto:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar el gasto'
        showConfirmModal(
          'Error',
          errorMessage,
          'danger',
          null,
          'Aceptar'
        )
      } finally {
        deletingExpenseIds.value.delete(id)
      }
    },
    'Eliminar',
    'Cancelar'
  )
}

// Verificar si hay un query parameter para editar
watch(() => route.query.edit, async (expenseId) => {
  if (expenseId) {
    await expenseStore.fetchExpenses() // Asegurar que los gastos estén cargados
    await editExpense(Number(expenseId))
  }
}, { immediate: true })

onMounted(async () => {
  await expenseStore.fetchExpenses()
  await expenseStore.fetchCategories()
  
  // Si hay un query parameter edit, abrir el modal
  if (route.query.edit) {
    await editExpense(Number(route.query.edit))
  }
})
</script>
