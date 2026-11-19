// Configuración de los tests unitarios (Vitest)
// Se corre con: npm test
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    // jsdom simula el navegador (window, localStorage...) que usan los stores
    environment: 'jsdom',
    include: ['src/**/*.test.js']
  }
})
