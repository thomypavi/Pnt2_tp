export const CURRENCIES = {
  USD: { symbol: '$', color: 'text-blue-600' },
  EUR: { symbol: '€', color: 'text-green-600' },
  ARS: { symbol: '$', color: 'text-orange-600' },
  BRL: { symbol: 'R$', color: 'text-yellow-600' },
  MXN: { symbol: '$', color: 'text-purple-600' },
  GBP: { symbol: '£', color: 'text-indigo-600' },
  JPY: { symbol: '¥', color: 'text-red-600' },
  CNY: { symbol: '¥', color: 'text-pink-600' },
  CHF: { symbol: 'Fr', color: 'text-cyan-600' },
  CAD: { symbol: 'C$', color: 'text-teal-600' },
  AUD: { symbol: 'A$', color: 'text-amber-600' },
  INR: { symbol: '₹', color: 'text-lime-600' },
  NZD: { symbol: 'NZ$', color: 'text-emerald-600' }
}

export const CURRENCY_OPTIONS = Object.keys(CURRENCIES)

export const getCurrencySymbol = (currency) => {
  return CURRENCIES[currency]?.symbol
}

export const getCurrencyColor = (currency) => {
  return CURRENCIES[currency]?.color
}

export const formatAmount = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Formatear cantidad como moneda USD
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}
