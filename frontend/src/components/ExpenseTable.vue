<template>
  <div class="bg-white rounded-xl shadow-md overflow-hidden">
    <DataTable
      v-model:filters="tableFilters"
      :value="expenses"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      currentPageReportTemplate="{first} a {last} de {totalRecords}"
      filterDisplay="menu"
      :globalFilterFields="['vendor', 'description']"
      stripedRows
      showGridlines
      tableStyle="min-width: 50rem"
    >
      <template #header>
        <IconField iconPosition="left">
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText
            v-model="tableFilters['global'].value"
            placeholder="Buscar en toda la tabla..."
            class="w-full"
          />
        </IconField>
      </template>

      <Column field="date" header="Fecha" sortable>
        <template #body="{ data }">
          {{ formatDate(data.date) }}
        </template>
        <template #filter="{ filterModel }">
          <InputText
            v-model="filterModel.value"
            type="text"
            placeholder="Buscar por fecha"
          />
        </template>
      </Column>

      <Column field="vendor" header="Vendedor" sortable>
        <template #filter="{ filterModel }">
          <InputText
            v-model="filterModel.value"
            type="text"
            placeholder="Buscar vendedor"
          />
        </template>
      </Column>

      <Column field="amount" header="Monto" sortable>
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <span class="font-semibold">
              {{ getCurrencySymbol(data.currency) }}{{ formatAmount(data.amount) }}
            </span>
            <span :class="['font-bold', getCurrencyColor(data.currency)]">
              {{ data.currency }}
            </span>
          </div>
        </template>
        <template #filter="{ filterModel }">
          <InputText
            v-model="filterModel.value"
            type="text"
            placeholder="Buscar monto"
          />
        </template>
      </Column>

      <Column field="categoryId" header="Categoría" sortable filterMatchMode="equals">
        <template #body="{ data }">
          {{ getCategoryName(data.categoryId) }}
        </template>
        <template #filter="{ filterModel }">
          <Dropdown
            v-model="filterModel.value"
            :options="filterCategoryOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Todas"
            showClear
          />
        </template>
      </Column>

      <Column field="status" header="Estado" sortable filterMatchMode="equals">
        <template #body="{ data }">
          <Dropdown
            :modelValue="data.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            @update:modelValue="(value) => $emit('status-change', { expense: data, newStatus: value })"
          />
        </template>
        <template #filter="{ filterModel }">
          <Dropdown
            v-model="filterModel.value"
            :options="filterStatusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Todos"
            showClear
          />
        </template>
      </Column>

      <Column field="description" header="Descripción">
        <template #body="{ data }">
          {{ data.description || '-' }}
        </template>
        <template #filter="{ filterModel }">
          <InputText
            v-model="filterModel.value"
            type="text"
            placeholder="Buscar descripción"
          />
        </template>
      </Column>

      <Column header="Acciones" :exportable="false">
        <template #body="{ data }">
          <ActionButtons
            show-view
            :deleting="isDeleting(data.id)"
            @view="$emit('view', data.id)"
            @edit="$emit('edit', data)"
            @delete="$emit('delete', data.id)"
          />
        </template>
      </Column>

      <template #empty>No hay gastos registrados</template>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import ActionButtons from './ActionButtons.vue'
import { getCurrencySymbol, getCurrencyColor, formatAmount } from '../utils/currency'
import { formatDate } from '../utils/date'

const props = defineProps({
  expenses: {
    type: Array,
    required: true
  },
  categories: {
    type: Array,
    required: true
  },
  statusOptions: {
    type: Array,
    required: true
  },
  filterStatusOptions: {
    type: Array,
    required: true
  },
  deletingIds: {
    type: [Array, Set],
    default: () => []
  }
})

defineEmits(['edit', 'view', 'delete', 'status-change'])

const tableFilters = ref({
  global: { value: null, matchMode: 'contains' },
  date: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  vendor: { operator: 'and', constraints: [{ value: null, matchMode: 'startsWith' }] },
  amount: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] },
  categoryId: { value: null, matchMode: 'equals' },
  status: { value: null, matchMode: 'equals' },
  description: { operator: 'and', constraints: [{ value: null, matchMode: 'contains' }] }
})

const filterCategoryOptions = computed(() => {
  const options = props.categories.map(cat => ({ label: cat.name, value: cat.id }))
  options.unshift({ label: 'Sin categoría', value: null })
  return options
})

const getCategoryName = (categoryId) => {
  if (!categoryId) return 'Sin categoría'
  const category = props.categories.find(c => c.id === categoryId)
  return category ? category.name : 'Sin categoría'
}

const isDeleting = (id) => {
  if (props.deletingIds instanceof Set) {
    return props.deletingIds.has(id)
  }
  return Array.isArray(props.deletingIds) && props.deletingIds.includes(id)
}
</script>


