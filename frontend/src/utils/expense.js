// Devuelve el valor del gasto en USD, usando conversion_usd si existe, sino amount
export const getExpenseValueInUSD = (expense) => {
  const raw =
    expense?.conversion_usd !== null && expense?.conversion_usd !== undefined
      ? expense.conversion_usd
      : expense?.amount || 0

  const value = parseFloat(raw)
  return Number.isNaN(value) ? 0 : value
}


