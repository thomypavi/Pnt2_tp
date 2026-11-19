/**
 * Tests de utilidades usadas en los cálculos del dashboard
 */
import { describe, it, expect } from 'vitest'
import { parseDateString, formatDateToString, getFirstDayOfMonth, getLastDayOfMonth } from './date'
import { getExpenseValueInUSD } from './expense'

describe('utils/date', () => {
  it('parseDateString y formatDateToString son inversas (sin corrimiento de zona horaria)', () => {
    const date = parseDateString('2026-03-01')
    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(2) // marzo (los meses arrancan en 0)
    expect(date.getDate()).toBe(1)
    expect(formatDateToString(date)).toBe('2026-03-01')
  })

  it('devuelven null con entrada vacía', () => {
    expect(parseDateString('')).toBeNull()
    expect(formatDateToString(null)).toBeNull()
  })

  it('primer y último día del mes (incluye febrero bisiesto)', () => {
    expect(getFirstDayOfMonth(new Date(2028, 1, 15))).toBe('2028-02-01')
    expect(getLastDayOfMonth(new Date(2028, 1, 15))).toBe('2028-02-29')
    expect(getLastDayOfMonth(new Date(2026, 1, 15))).toBe('2026-02-28')
    expect(getLastDayOfMonth(new Date(2026, 11, 1))).toBe('2026-12-31')
  })
})

describe('utils/expense: getExpenseValueInUSD', () => {
  it('usa conversion_usd cuando existe (viene como string desde la API)', () => {
    expect(getExpenseValueInUSD({ amount: '14500', currency: 'ARS', conversion_usd: '10.00' })).toBe(10)
  })

  it('si no hay conversión, usa el monto', () => {
    expect(getExpenseValueInUSD({ amount: '25.5', currency: 'USD' })).toBe(25.5)
  })

  it('devuelve 0 con datos inválidos o vacíos', () => {
    expect(getExpenseValueInUSD(null)).toBe(0)
    expect(getExpenseValueInUSD({ amount: 'abc' })).toBe(0)
  })
})
