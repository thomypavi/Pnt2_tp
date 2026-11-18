<template>
  <Dialog
    :visible="visible"
    @update:visible="(value) => $emit('update:visible', value)"
    :header="title"
    :modal="true"
    :style="{ width: '32rem' }"
  >
    <p class="m-0">{{ message }}</p>
    <template #footer>
      <Button
        :label="cancelText"
        icon="pi pi-times"
        @click="handleCancel"
        severity="secondary"
        outlined
        :disabled="loading"
      />
      <Button
        :label="confirmText"
        icon="pi pi-check"
        @click="handleConfirm"
        :severity="type === 'danger' ? 'danger' : null"
        :loading="loading"
        :disabled="loading"
      />
    </template>
  </Dialog>
</template>

<script setup>
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirmar'
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'danger', 'warning', 'success'].includes(value)
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}
</script>

