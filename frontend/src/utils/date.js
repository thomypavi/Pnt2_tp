// Parsear string YYYY-MM-DD a Date en hora local
export const parseDateString = (dateString) => {
  if (!dateString) return null
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Formatear Date a string YYYY-MM-DD en hora local
export const formatDateToString = (date) => {
  if (!date) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Primer día del mes de una fecha (por defecto, hoy)
export const getFirstDayOfMonth = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}-01`
}

// Último día del mes de una fecha (por defecto, hoy)
export const getLastDayOfMonth = (date = new Date()) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const lastDay = new Date(year, month, 0).getDate()
  return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
}

// Formatear fecha string (YYYY-MM-DD) a formato legible
// Opciones: 'short' (corto) o 'long' (largo con mes completo)
export const formatDate = (date, format = 'short') => {
  if (!date) return '-'
  const [year, month, day] = date.split('-').map(Number)
  const dateObj = new Date(year, month - 1, day)
  
  if (format === 'long') {
    return dateObj.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }
  
  return dateObj.toLocaleDateString('es-ES')
}

// Formatear fecha y hora (datetime) a formato legible
export const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Formatear número con decimales
export const formatNumber = (number, decimals = 2) => {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number)
}

