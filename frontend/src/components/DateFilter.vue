<template>
  <div class="flex flex-wrap items-center gap-3">
    <!-- Date filters -->
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">Desde:</label>
        <Calendar
          :model-value="startDate ? parseDateString(startDate) : null"
          @update:model-value="handleStartDateChange"
          dateFormat="yy-mm-dd"
          showIcon
          iconDisplay="input"
          inputId="start-date"
          class="w-auto"
        />
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">Hasta:</label>
        <Calendar
          :model-value="endDate ? parseDateString(endDate) : null"
          @update:model-value="handleEndDateChange"
          dateFormat="yy-mm-dd"
          showIcon
          iconDisplay="input"
          inputId="end-date"
          class="w-auto"
        />
      </div>
    </div>

    <!-- Preset dropdown -->
    <Dropdown
      v-model="selectedPreset"
      :options="presetOptions"
      optionLabel="label"
      optionValue="value"
      placeholder="Preset"
      @change="handlePresetChange"
      class="w-auto"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import {
  parseDateString,
  formatDateToString,
  getFirstDayOfMonth,
  getLastDayOfMonth
} from '../utils/date'

const props = defineProps({
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  selectedPreset: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:startDate', 'update:endDate', 'update:selectedPreset', 'dateChanged'])

const selectedPreset = ref(props.selectedPreset)

// Sincronizar con el prop
watch(() => props.selectedPreset, (newValue) => {
  selectedPreset.value = newValue
})

const presetOptions = [
  { label: 'Mes actual', value: 'currentMonth' },
  { label: 'Mes anterior', value: 'previousMonth' },
  { label: 'Anual', value: 'yearly' }
]

const handleStartDateChange = (date) => {
  if (!date) return
  // El Calendar devuelve fecha en hora local, usar directamente
  const dateString = formatDateToString(date)
  emit('update:startDate', dateString)
  emit('dateChanged')
  selectedPreset.value = ''
  emit('update:selectedPreset', '')
}

const handleEndDateChange = (date) => {
  if (!date) return
  // El Calendar devuelve fecha en hora local, usar directamente
  const dateString = formatDateToString(date)
  emit('update:endDate', dateString)
  emit('dateChanged')
  selectedPreset.value = ''
  emit('update:selectedPreset', '')
}

const handlePresetChange = () => {
  emit('update:selectedPreset', selectedPreset.value)
  
  const now = new Date()
  
  switch (selectedPreset.value) {
    case 'currentMonth':
      emit('update:startDate', getFirstDayOfMonth(now))
      emit('update:endDate', getLastDayOfMonth(now))
      break
    case 'previousMonth':
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      emit('update:startDate', getFirstDayOfMonth(previousMonth))
      emit('update:endDate', getLastDayOfMonth(previousMonth))
      break
    case 'yearly':
      const currentYear = now.getFullYear()
      emit('update:startDate', `${currentYear}-01-01`)
      emit('update:endDate', `${currentYear}-12-31`)
      break
  }
  emit('dateChanged')
}
</script>


