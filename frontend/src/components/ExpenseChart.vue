<template>
  <div class="card">
    <Chart type="bar" :data="chartData" :options="chartOptions" class="h-[30rem]" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Chart from 'primevue/chart'
import { parseDateString } from '../utils/date'
import { getExpenseValueInUSD } from '../utils/expense'

const props = defineProps({
  expenses: {
    type: Array,
    required: true
  },
  startDate: String,
  endDate: String
})

const chartData = ref()
const chartOptions = ref()

const setChartData = () => {
  const documentStyle = getComputedStyle(document.documentElement)
  
  // Determinar el rango de fechas usando helper compartido
  let startDate = props.startDate ? parseDateString(props.startDate) : new Date()
  let endDate = props.endDate ? parseDateString(props.endDate) : new Date()
  
  // Si no hay filtros, usar el rango de las fechas de los gastos
  if (!props.startDate && !props.endDate && props.expenses.length > 0) {
    const dates = props.expenses.map(e => {
      return e.date ? parseDateString(e.date) : new Date()
    })
    startDate = new Date(Math.min(...dates))
    endDate = new Date(Math.max(...dates))
  }
  
  // Calcular la diferencia en días
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
  
  // Si el rango es mayor a 6 meses (aproximadamente 180 días), agrupar por mes
  const isYearly = daysDiff > 180
  
  const labels = []
  
  // Inicializar estructuras para pagados y pendientes
  const paidByPeriod = {}
  const unpaidByPeriod = {}
  
  if (isYearly) {
    // Agrupar por mes
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const periodKey = `${year}-${String(month + 1).padStart(2, '0')}`
      const label = currentDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })
      
      labels.push(label)
      paidByPeriod[periodKey] = 0
      unpaidByPeriod[periodKey] = 0
      
      // Avanzar al siguiente mes
      currentDate.setMonth(currentDate.getMonth() + 1)
    }
    
    // Agrupar gastos por mes
    props.expenses.forEach(expense => {
      const expenseDate = new Date(expense.date)
      const year = expenseDate.getFullYear()
      const month = expenseDate.getMonth()
      const periodKey = `${year}-${String(month + 1).padStart(2, '0')}`
      
      const value = getExpenseValueInUSD(expense)
      
      if (expense.status === 'Paid') {
        paidByPeriod[periodKey] = (paidByPeriod[periodKey] || 0) + value
      } else {
        unpaidByPeriod[periodKey] = (unpaidByPeriod[periodKey] || 0) + value
      }
    })
  } else {
    // Agrupar por día
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const label = currentDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
      
      labels.push(label)
      paidByPeriod[dateStr] = 0
      unpaidByPeriod[dateStr] = 0
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    // Agrupar gastos por día
    props.expenses.forEach(expense => {
      const dateStr = expense.date
      
      const value = getExpenseValueInUSD(expense)
      
      if (expense.status === 'Paid') {
        paidByPeriod[dateStr] = (paidByPeriod[dateStr] || 0) + value
      } else {
        unpaidByPeriod[dateStr] = (unpaidByPeriod[dateStr] || 0) + value
      }
    })
  }
  
  // Crear arrays de datos para cada dataset
  const paidData = []
  const unpaidData = []
  
  if (isYearly) {
    // Para años, usar las keys en orden
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const periodKey = `${year}-${String(month + 1).padStart(2, '0')}`
      
      paidData.push(paidByPeriod[periodKey] || 0)
      unpaidData.push(unpaidByPeriod[periodKey] || 0)
      
      currentDate.setMonth(currentDate.getMonth() + 1)
    }
  } else {
    // Para días, usar las fechas en orden
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      
      paidData.push(paidByPeriod[dateStr] || 0)
      unpaidData.push(unpaidByPeriod[dateStr] || 0)
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
  }
  
  // Si no hay datos, retornar estructura vacía
  if (paidData.every(v => v === 0) && unpaidData.every(v => v === 0)) {
    return {
      labels: [],
      datasets: []
    }
  }
  
  // Colores: azul para pagados, naranja para pendientes
  const blueColor = documentStyle.getPropertyValue('--p-blue-500')
  const orangeColor = documentStyle.getPropertyValue('--p-orange-500')
  
  return {
      labels,
    datasets: [
      {
        type: 'bar',
        label: 'Pagados',
        backgroundColor: blueColor,
        data: paidData
      },
      {
        type: 'bar',
        label: 'Pendientes',
        backgroundColor: orangeColor,
        data: unpaidData
      }
    ]
  }
}

const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement)
  const textColor = documentStyle.getPropertyValue('--p-text-color')
  const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color')
  const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color')

  return {
      maintainAspectRatio: false,
    aspectRatio: 0.8,
      plugins: {
      tooltips: {
        mode: 'index',
        intersect: false
      },
        legend: {
          labels: {
          color: textColor,
            font: {
              family: 'Poppins',
              size: 12,
              weight: '500'
          }
        }
        }
      },
      scales: {
      x: {
        stacked: true,
          ticks: {
          color: textColorSecondary,
            font: {
              family: 'Poppins',
              size: 11
          }
        },
          grid: {
          color: surfaceBorder
        }
          },
      y: {
        stacked: true,
          ticks: {
          color: textColorSecondary,
            font: {
              family: 'Poppins',
              size: 11
            },
          callback: (value) => '$' + value
        },
        grid: {
          color: surfaceBorder
          }
        }
      }
    }
}

onMounted(() => {
  chartData.value = setChartData()
  chartOptions.value = setChartOptions()
})

// Watch para actualizar cuando cambien los datos o filtros
watch(() => [props.expenses, props.startDate, props.endDate], () => {
  chartData.value = setChartData()
  chartOptions.value = setChartOptions()
}, { deep: true })
</script>

