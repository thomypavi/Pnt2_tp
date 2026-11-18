<template>
  <div class="flex h-screen bg-gray-50">
    <Sidebar :user="authStore.user" @logout="handleLogout" />

    <!-- Main Content -->
    <main class="flex-1 overflow-auto w-full">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/authStore'
import Sidebar from '../components/Sidebar.vue'

const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
}
</script>

