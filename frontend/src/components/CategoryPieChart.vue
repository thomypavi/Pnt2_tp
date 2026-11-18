<template>
  <div class="card flex justify-center">
    <Chart type="pie" :data="chartData" :options="chartOptions" class="w-[30rem]" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import Chart from 'primevue/chart'
import { getExpenseValueInUSD } from '../utils/expense'

const props = defineProps({
  expenses: {
    type: Array,
    required: true
  },
  categories: {
    type: Array,
    required: true
  }
})

const chartData = ref()
const chartOptions = ref()

const setChartData = () => {
  // Agrupar gastos por categoría usando conversion_usd
  // Usar un Map para mantener la relación con la categoría completa
  const categoryTotalsMap = new Map()
  
  props.expenses.forEach(expense => {
    const categoryId = expense.categoryId
    const category = props.categories.find(c => c.id === categoryId)
    
    // Manejar gastos sin categoría
    const categoryName = category ? category.name : 'Sin categoría'
    const categoryColor = category ? (category.color || '#3b82f6') : '#9ca3af' // Gris para sin categoría
    const mapKey = categoryId || 'sin-categoria' // Usar string para null
    
    const value = getExpenseValueInUSD(expense)
    
    if (!categoryTotalsMap.has(mapKey)) {
      categoryTotalsMap.set(mapKey, {
        name: categoryName,
        color: categoryColor,
        total: 0
      })
    }
    
    const categoryData = categoryTotalsMap.get(mapKey)
    categoryData.total += value
  })

  const labels = Array.from(categoryTotalsMap.values()).map(c => c.name)
  const data = Array.from(categoryTotalsMap.values()).map(c => c.total)
  const categoryColors = Array.from(categoryTotalsMap.values()).map(c => c.color)

  // Si no hay datos, retornar estructura vacía
  if (data.length === 0 || data.every(v => v === 0)) {
    return {
      labels: [],
      datasets: [{
        data: []
      }]
    }
  }

  // Función para aclarar un color hexadecimal (para hover)
  const lightenColor = (hex, percent = 30) => {
    const num = parseInt(hex.replace('#', ''), 16)
    const r = Math.min(255, Math.floor((num >> 16) * (1 + percent / 100)))
    const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) * (1 + percent / 100)))
    const b = Math.min(255, Math.floor((num & 0x0000FF) * (1 + percent / 100)))
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  const backgroundColor = categoryColors
  const hoverBackgroundColor = categoryColors.map(color => lightenColor(color, 30))

  return {
      labels,
      datasets: [{
        data,
      backgroundColor,
      hoverBackgroundColor
      }]
  }
}

const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement)
  const textColor = documentStyle.getPropertyValue('--p-text-color')

  return {
      plugins: {
        legend: {
          labels: {
          usePointStyle: true,
          color: textColor,
            font: {
              family: 'Poppins',
              size: 12,
              weight: '500'
            }
          }
        }
      }
    }
}

onMounted(() => {
  chartData.value = setChartData()
  chartOptions.value = setChartOptions()
})

// Watch para actualizar cuando cambien los datos
watch(() => [props.expenses, props.categories], () => {
  chartData.value = setChartData()
}, { deep: true })
</script>



