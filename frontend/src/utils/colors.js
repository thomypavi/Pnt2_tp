// Lista de colores predefinidos para categorías (mismos que el backend)
export const PREDEFINED_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#a855f7', // purple-500
  '#ef4444', // red-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
  '#8b5cf6'  // violet-500
]

// Función para obtener el siguiente color disponible
export const getNextAvailableColor = (categories) => {
  const usedColors = new Set(categories.map(c => c.color))
  
  // Buscar el primer color que no esté en uso
  for (const color of PREDEFINED_COLORS) {
    if (!usedColors.has(color)) {
      return color
    }
  }
  
  // Si todos los colores están en uso, devolver el primero
  return PREDEFINED_COLORS[0]
}

