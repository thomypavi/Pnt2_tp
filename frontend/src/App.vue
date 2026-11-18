<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/authStore'
import { useExpenseStore } from './stores/expenseStore'

const authStore = useAuthStore()
const expenseStore = useExpenseStore()

onMounted(async () => {
  // router.beforeEach ya maneja initAuth() antes de cada navegación
  // Solo cargamos datos iniciales si está autenticado
  if (authStore.isAuthenticated) {
    expenseStore.loadInitialData()
  }
})
</script>

