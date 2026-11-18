<template>
  <Button
    :type="type"
    :label="computedLabel"
    :icon="icon"
    :loading="loading"
    :disabled="disabled || loading"
    :class="['font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed', { 'w-full': fullWidth }]"
    @click="$emit('click', $event)"
  />
</template>

<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'

const props = defineProps({
  label: { type: String, required: true },
  loadingLabel: { type: String, default: '' },
  type: { type: String, default: 'button' },
  icon: { type: String, default: null },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: false }
})

defineEmits(['click'])

const computedLabel = computed(() => {
  if (props.loading && props.loadingLabel) {
    return props.loadingLabel
  }
  return props.label
})
</script>


