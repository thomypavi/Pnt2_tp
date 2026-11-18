<template>
  <aside
    :class="[
      'bg-gradient-to-b from-blue-600 to-blue-700 text-white flex flex-col shadow-xl transition-all duration-300',
      'h-full',
      isCollapsed ? 'w-20' : 'w-64 min-w-[256px]'
    ]"
  >
    <!-- Header -->
    <div class="p-6 border-b border-blue-500 border-opacity-30">
      <div class="flex items-center gap-3 justify-start">
        <h1 v-show="!isCollapsed" class="text-xl font-semibold flex-1">Expense Manager</h1>
        <button
          @click="toggleCollapse"
          class="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all flex-shrink-0"
          :title="isCollapsed ? 'Expandir sidebar' : 'Comprimir sidebar'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="isCollapsed" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4 overflow-y-auto">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        :class="[
          'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 group',
          'justify-start',
          $route.path === item.path || ($route.path === '/' && item.path === '/')
            ? 'bg-white bg-opacity-20 shadow-md'
            : 'hover:bg-white hover:bg-opacity-10'
        ]"
        :title="isCollapsed ? item.label : ''"
      >
        <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
        <span v-show="!isCollapsed" class="font-medium">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-blue-500 border-opacity-30">
      <div v-if="user && !isCollapsed" class="flex items-center gap-3 px-4 py-3 mb-3">
        <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
          <span class="text-sm font-semibold">{{ getUserInitials(user.name) }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-sm truncate">{{ user.name }}</p>
          <p class="text-xs text-blue-100 truncate">{{ user.email }}</p>
        </div>
      </div>
      <div v-else-if="user && isCollapsed" class="flex justify-center mb-3">
        <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <span class="text-sm font-semibold">{{ getUserInitials(user.name) }}</span>
        </div>
      </div>
      <button
        @click="$emit('logout')"
        :class="[
          'w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all text-red-200',
          'justify-start'
        ]"
        :title="isCollapsed ? 'Cerrar Sesión' : ''"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span v-show="!isCollapsed" class="font-medium">Cerrar Sesión</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const props = defineProps({
  user: {
    type: Object,
    default: null
  }
})

defineEmits(['logout'])

// Estado del sidebar
const isCollapsed = ref(false)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  // Guardar preferencia en localStorage
  localStorage.setItem('sidebarCollapsed', isCollapsed.value.toString())
}

// Obtener iniciales de un nombre
const getUserInitials = (name) => {
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}


// Definir iconos como componentes
const DashboardIcon = () => h('svg', {
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24',
  class: 'w-5 h-5'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  })
])

const ExpensesIcon = () => h('svg', {
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24',
  class: 'w-5 h-5'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  })
])

const CategoriesIcon = () => h('svg', {
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24',
  class: 'w-5 h-5'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
  })
])

const AdminIcon = () => h('svg', {
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24',
  class: 'w-5 h-5'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
  })
])

// computed: si cambia el usuario (login/logout), el menú se recalcula solo
const menuItems = computed(() => {
  const items = [
    {
      path: '/',
      label: 'Dashboard',
      icon: DashboardIcon
    },
    {
      path: '/expenses',
      label: 'Gastos',
      icon: ExpensesIcon
    },
    {
      path: '/categories',
      label: 'Categorías',
      icon: CategoriesIcon
    }
  ]

  // El ítem de administración solo se muestra a los admins
  if (props.user?.role === 'admin') {
    items.push({
      path: '/admin',
      label: 'Administración',
      icon: AdminIcon
    })
  }

  return items
})

onMounted(() => {
  // Cargar preferencia de sidebar colapsado
  const savedCollapsed = localStorage.getItem('sidebarCollapsed')
  if (savedCollapsed !== null) {
    isCollapsed.value = savedCollapsed === 'true'
  }
})
</script>

