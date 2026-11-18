<template>
  <div class="flex gap-2">
    <Button
      v-if="showView"
      icon="pi pi-eye"
      @click="$emit('view')"
      severity="info"
      size="small"
      outlined
      v-tooltip.top="'Ver detalle'"
    />
    <Button
      v-if="showEdit"
      icon="pi pi-pencil"
      @click="$emit('edit')"
      severity="secondary"
      size="small"
      outlined
      v-tooltip.top="'Editar'"
    />
    <Button
      v-if="showDelete"
      icon="pi pi-trash"
      @click="$emit('delete')"
      severity="danger"
      size="small"
      outlined
      :loading="deleting"
      :disabled="deleting"
      v-tooltip.top="'Eliminar'"
    />
  </div>
</template>

<script setup>
import Button from 'primevue/button'

defineProps({
  showView: {
    type: Boolean,
    default: false
  },
  showEdit: {
    type: Boolean,
    default: true
  },
  showDelete: {
    type: Boolean,
    default: true
  },
  deleting: {
    type: Boolean,
    default: false
  }
})

defineEmits(['view', 'edit', 'delete'])
</script>

