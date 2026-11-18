<template>
  <Dialog
    :visible="visible"
    :header="isEditing ? 'Editar Gasto' : 'Nuevo Gasto'"
    :modal="true"
    :style="{ width: '32rem' }"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    @update:visible="(value) => $emit('update:visible', value)"
    @hide="handleHide"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="field">
        <label for="date" class="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
        <Calendar
          v-model="formDate"
          dateFormat="yy-mm-dd"
          showIcon
          iconDisplay="input"
          inputId="date"
          class="w-full"
          required
        />
      </div>

      <div class="field">
        <label for="vendor" class="block text-sm font-medium text-gray-700 mb-2">Vendedor</label>
        <InputText
          id="vendor"
          v-model="form.vendor"
          class="w-full"
          required
        />
      </div>

      <div class="field">
        <label for="amount" class="block text-sm font-medium text-gray-700 mb-2">Monto</label>
        <InputNumber
          id="amount"
          v-model="form.amount"
          mode="decimal"
          :minFractionDigits="2"
          :maxFractionDigits="2"
          :min="0"
          class="w-full"
          required
          @update:model-value="handleAmountChange"
        />
      </div>

      <div class="field">
        <label for="currency" class="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
        <Dropdown
          id="currency"
          v-model="form.currency"
          :options="currencyOptions"
          class="w-full"
          required
          @change="handleCurrencyChange"
        />
      </div>

      <!-- Campos de conversión (solo si no es USD) -->
      <template v-if="form.currency && form.currency !== 'USD'">
        <div class="field bg-blue-50 p-4 rounded-lg border border-blue-200">
          <label for="rate_usd" class="block text-sm font-medium text-blue-700 mb-2">
            Tasa de conversión ({{ form.currency }}/USD)
            <i v-if="loadingExchangeRate" class="pi pi-spin pi-spinner ml-2 text-blue-600"></i>
          </label>
          <InputNumber
            id="rate_usd"
            v-model="form.rate_usd"
            mode="decimal"
            :minFractionDigits="2"
            :maxFractionDigits="6"
            :min="0.000001"
            class="w-full"
            :disabled="loadingExchangeRate"
            @update:model-value="handleRateChange"
          />
          <p class="text-xs text-blue-600 mt-1">
            <span v-if="loadingExchangeRate">Obteniendo tasa de conversión...</span>
            <span v-else>Cuántas unidades de {{ form.currency }} equivalen a 1 USD</span>
          </p>
        </div>

        <div class="field bg-blue-50 p-4 rounded-lg border border-blue-200">
          <label for="conversion_usd" class="block text-sm font-medium text-blue-700 mb-2">
            Conversión a USD
          </label>
          <InputNumber
            id="conversion_usd"
            v-model="form.conversion_usd"
            mode="decimal"
            :minFractionDigits="2"
            :maxFractionDigits="2"
            :min="0"
            class="w-full"
            :disabled="loadingExchangeRate"
            @update:model-value="handleConversionChange"
          />
          <p class="text-xs text-blue-600 mt-1">
            <span v-if="loadingExchangeRate">Calculando conversión...</span>
            <span v-else>Valor en USD calculado automáticamente o editado manualmente</span>
          </p>
        </div>
      </template>

      <div class="field">
        <label for="category" class="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
        <Dropdown
          id="category"
          v-model="form.categoryId"
          :options="categoryOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Selecciona una categoría (opcional)"
          class="w-full"
          showClear
        />
      </div>

      <div class="field">
        <label for="status" class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
        <Dropdown
          id="status"
          v-model="form.status"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          class="w-full"
          required
        />
      </div>

      <div class="field">
        <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
        <Textarea
          id="description"
          v-model="form.description"
          rows="3"
          class="w-full"
        />
      </div>

      <div class="flex gap-3 mt-6">
        <Button
          type="submit"
          label="Guardar"
          icon="pi pi-check"
          :loading="saving"
          class="flex-1"
          :disabled="saving"
        />
        <Button
          type="button"
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          outlined
          class="flex-1"
          :disabled="saving"
          @click="handleCancel"
        />
      </div>
    </form>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import Dialog from 'primevue/dialog'
import Calendar from 'primevue/calendar'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import { formatDateToString, parseDateString } from '../utils/date'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  initialExpense: {
    type: Object,
    default: null
  },
  categories: {
    type: Array,
    default: () => []
  },
  statusOptions: {
    type: Array,
    required: true
  },
  currencyOptions: {
    type: Array,
    required: true
  },
  saving: {
    type: Boolean,
    default: false
  },
  loadingExchangeRate: {
    type: Boolean,
    default: false
  },
  exchangeRate: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'save', 'closed', 'currency-change'])

const isEditing = computed(() => !!props.initialExpense)

const form = ref({
  date: '',
  vendor: '',
  amount: null,
  currency: 'USD',
  categoryId: null,
  status: 'Unpaid',
  description: '',
  rate_usd: 1,
  conversion_usd: null
})

const formDate = ref(new Date())

const categoryOptions = computed(() => {
  return props.categories.map(cat => ({ label: cat.name, value: cat.id }))
})

const resetForm = () => {
  form.value = {
    date: '',
    vendor: '',
    amount: null,
    currency: 'USD',
    categoryId: null,
    status: 'Unpaid',
    description: '',
    rate_usd: 1,
    conversion_usd: null
  }
  formDate.value = new Date()
}

// Sincronizar cuando cambia el gasto inicial (editar)
watch(
  () => props.initialExpense,
  (expense) => {
    if (expense) {
      form.value = {
        date: expense.date,
        vendor: expense.vendor,
        amount: expense.amount,
        currency: expense.currency,
        categoryId: expense.categoryId,
        status: expense.status,
        description: expense.description || '',
        rate_usd: expense.rate_usd || 1,
        conversion_usd: expense.conversion_usd || null
      }
      formDate.value = expense.date ? parseDateString(expense.date) : new Date()
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// Sincronizar tasa de cambio cuando la vista la obtiene
watch(
  () => props.exchangeRate,
  (rate) => {
    if (rate && form.value.currency && form.value.currency !== 'USD') {
      form.value.rate_usd = rate
      if (form.value.amount) {
        form.value.conversion_usd = form.value.amount / rate
      }
    }
  }
)

const handleCurrencyChange = () => {
  if (form.value.currency === 'USD') {
    form.value.rate_usd = 1
    form.value.conversion_usd = form.value.amount || null
  } else {
    // Emitir evento para que la vista obtenga la tasa de cambio
    emit('currency-change', {
      currency: form.value.currency,
      amount: form.value.amount
    })
  }
}

const handleRateChange = () => {
  if (form.value.rate_usd && form.value.amount) {
    form.value.conversion_usd = form.value.amount / form.value.rate_usd
  }
}

const handleConversionChange = () => {
  if (form.value.conversion_usd && form.value.amount && form.value.amount > 0) {
    form.value.rate_usd = form.value.amount / form.value.conversion_usd
  }
}

const handleAmountChange = () => {
  if (form.value.currency === 'USD') {
    form.value.conversion_usd = form.value.amount || null
  } else if (form.value.currency && form.value.rate_usd && form.value.amount) {
    form.value.conversion_usd = form.value.amount / form.value.rate_usd
  } else if (form.value.currency && form.value.amount) {
    // Si cambia el monto y hay moneda pero no tasa, pedir tasa
    emit('currency-change', {
      currency: form.value.currency,
      amount: form.value.amount
    })
  }
}

const handleSubmit = () => {
  const dateString = formDate.value ? formatDateToString(formDate.value) : form.value.date

  emit('save', {
    ...form.value,
    date: dateString
  })
}

const handleCancel = () => {
  emit('update:visible', false)
}

const handleHide = () => {
  emit('closed')
}
</script>


