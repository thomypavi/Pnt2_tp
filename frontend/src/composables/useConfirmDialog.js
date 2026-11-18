import { ref } from 'vue'

export const useConfirmDialog = () => {
  const confirmDialog = ref({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    loading: false
  })

  const showConfirmModal = (
    title,
    message,
    type = 'info',
    onConfirm,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar'
  ) => {
    confirmDialog.value = {
      visible: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
      cancelText,
      loading: false
    }
  }

  const handleConfirm = async () => {
    if (confirmDialog.value.loading) return

    if (confirmDialog.value.onConfirm) {
      confirmDialog.value.loading = true
      try {
        await confirmDialog.value.onConfirm()
        confirmDialog.value.visible = false
      } finally {
        confirmDialog.value.loading = false
      }
    } else {
      confirmDialog.value.visible = false
    }
  }

  const handleCancel = () => {
    confirmDialog.value.visible = false
  }

  return {
    confirmDialog,
    showConfirmModal,
    handleConfirm,
    handleCancel
  }
}


