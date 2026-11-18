<template>
  <div class="page-container">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Categorías</h1>
        <p class="page-subtitle">Organiza tus gastos por categorías personalizadas</p>
      </div>
      
      <AppButton
        label="Nueva Categoría"
        icon="pi pi-plus"
        @click="() => { updateSuggestedColor(); showModal = true; }"
      />
    </div>

    <!-- Categories Table -->
    <div class="table-container">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="table-header">
            <tr>
              <th class="table-header-cell">Nombre</th>
              <th class="table-header-cell">Descripción</th>
              <th class="table-header-cell">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="category in categories" :key="category.id" class="table-row">
              <td class="table-body-cell">
                <div class="flex items-center gap-3">
                  <div 
                    class="w-10 h-10 rounded-lg"
                    :style="{ backgroundColor: category.color || '#3b82f6' }"
                  >
                  </div>
                  <span class="text-sm font-semibold text-gray-900">{{ category.name }}</span>
                </div>
              </td>
              <td class="table-body-cell table-body-text">{{ category.description || '-' }}</td>
              <td class="table-body-cell">
                <ActionButtons
                  :deleting="deletingCategoryIds.has(category.id)"
                  @edit="editCategory(category)"
                  @delete="deleteCategory(category.id)"
                />
              </td>
            </tr>
            <tr v-if="categories.length === 0">
              <td colspan="3" class="empty-state">
                No hay categorías registradas
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <Dialog
      v-model:visible="showModal"
      :header="editingCategory ? 'Editar Categoría' : 'Nueva Categoría'"
      :modal="true"
      :style="{ width: '32rem' }"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      @hide="closeModal"
    >
      <form @submit.prevent="saveCategory" class="space-y-4">
        <div class="field">
          <label for="name" class="form-label">Nombre</label>
          <InputText
            id="name"
                v-model="categoryForm.name"
            placeholder="Ej: Transporte, Comida, etc."
            class="w-full"
                required
              />
            </div>
        <div class="field">
          <label for="description" class="form-label">Descripción</label>
          <Textarea
            id="description"
                v-model="categoryForm.description"
                rows="3"
                placeholder="Describe brevemente esta categoría"
            class="w-full"
          />
        </div>
        <div class="field">
          <label for="color" class="form-label">Color</label>
          <div class="flex items-center gap-3">
            <input
              v-model="categoryForm.color"
              type="color"
              class="w-16 h-10 rounded-lg border border-gray-300 cursor-pointer"
            />
            <InputText
              id="color"
              v-model="categoryForm.color"
              placeholder="#3b82f6"
              pattern="^#[0-9A-Fa-f]{6}$"
              class="flex-1"
            />
            </div>
          <p class="text-xs text-gray-500 mt-1">Selecciona un color para identificar esta categoría</p>
          </div>
        <div class="flex gap-3 mt-6">
          <Button
              type="submit"
            label="Guardar"
            icon="pi pi-check"
            :loading="savingCategory"
            class="flex-1"
            :disabled="savingCategory"
          />
          <Button
              type="button"
            label="Cancelar"
            icon="pi pi-times"
            severity="secondary"
            outlined
              @click="closeModal"
            class="flex-1"
            :disabled="savingCategory"
          />
          </div>
        </form>
    </Dialog>

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
import { ref, computed, onMounted } from 'vue'
import { useExpenseStore } from '../stores/expenseStore'
import categoryService from '../services/categoryService'
import ActionButtons from '../components/ActionButtons.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import AppButton from '../components/AppButton.vue'
import { useConfirmDialog } from '../composables/useConfirmDialog'
import { getNextAvailableColor } from '../utils/colors'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

const expenseStore = useExpenseStore()

const showModal = ref(false)
const editingCategory = ref(null)
const deletingCategoryIds = ref(new Set())
const savingCategory = ref(false)

// Inicializar con el siguiente color disponible
const categoryForm = ref({
  name: '',
  description: '',
  color: ''
})

// Función para actualizar el color cuando se abre el modal
const updateSuggestedColor = () => {
  if (!editingCategory.value) {
    categoryForm.value.color = getNextAvailableColor(categories.value)
  }
}

const categories = computed(() => expenseStore.categories)

const editCategory = (category) => {
  editingCategory.value = category
  categoryForm.value = {
    name: category.name,
    description: category.description || '',
    color: category.color || getNextAvailableColor(categories.value)
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingCategory.value = null
  categoryForm.value = {
    name: '',
    description: '',
    color: getNextAvailableColor(categories.value)
  }
}

const saveCategory = async () => {
  if (savingCategory.value) return // Evitar múltiples envíos
  
  savingCategory.value = true
  try {
    const categoryData = {
      ...categoryForm.value
      // El backend obtiene userId del token automáticamente (no se envía en el body)
    }

    if (editingCategory.value) {
      await categoryService.updateCategory(editingCategory.value.id, categoryData)
    } else {
      await categoryService.createCategory(categoryData)
    }

    await expenseStore.fetchCategories()
    closeModal()
  } catch (error) {
    console.error('Error al guardar categoría:', error)
    showConfirmModal(
      'Error',
      error.response?.data?.message || 'Error al guardar la categoría',
      'danger',
      null,
      'Aceptar'
    )
  } finally {
    savingCategory.value = false
  }
}

// Estado y helpers del modal de confirmación (composable reutilizable)
const { confirmDialog, showConfirmModal, handleConfirm, handleCancel } = useConfirmDialog()

const deleteCategory = (id) => {
  showConfirmModal(
    'Eliminar Categoría',
    '¿Estás seguro de eliminar esta categoría? Esta acción no se puede deshacer.',
    'danger',
    async () => {
      if (deletingCategoryIds.value.has(id)) return // Evitar múltiples eliminaciones
      
      deletingCategoryIds.value.add(id)
    try {
      await categoryService.deleteCategory(id)
      await expenseStore.fetchCategories()
    } catch (error) {
      console.error('Error al eliminar categoría:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar la categoría'
        showConfirmModal(
          'Error',
          errorMessage,
          'danger',
          null,
          'Aceptar'
        )
      } finally {
        deletingCategoryIds.value.delete(id)
    }
    },
    'Eliminar',
    'Cancelar'
  )
}

onMounted(async () => {
  await expenseStore.fetchCategories()
  // Inicializar el color sugerido después de cargar las categorías
  categoryForm.value.color = getNextAvailableColor(categories.value)
})
</script>
