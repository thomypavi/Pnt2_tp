import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),

    /**
     * PWA (Progressive Web App) con vite-plugin-pwa
     *
     * Hace que la app se pueda INSTALAR en el celular o la compu como una app nativa:
     * - Genera el manifest (nombre, colores, íconos) → el navegador ofrece "Instalar app"
     * - Genera un Service Worker que guarda en caché los archivos de la app
     *   (HTML, JS, CSS, íconos) para que abra rápido y cargue aunque no haya internet.
     *   Los datos de la API (/api) NO se cachean: siempre se piden al backend.
     *
     * Para probarlo: npm run build && npm run preview → abrir en Chrome → ícono "Instalar" en la barra.
     */
    VitePWA({
      // Cuando se publica una versión nueva, el Service Worker se actualiza solo
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'logo.svg'],
      manifest: {
        name: 'Expense Manager',
        short_name: 'Gastos',
        description: 'Gestión de gastos personales',
        lang: 'es',
        start_url: '/',
        display: 'standalone',      // Se abre sin la barra del navegador, como una app
        orientation: 'portrait',
        theme_color: '#2563eb',     // Color de la barra de estado (azul del Sidebar)
        background_color: '#ffffff', // Color de la pantalla de carga
        // Íconos generados desde public/logo.svg con: npm run generate-pwa-assets
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Archivos que se guardan en caché al instalar
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Si se recarga una ruta como /expenses sin internet, se sirve index.html (es una SPA)
        navigateFallback: '/index.html',
        // ...pero nunca para las llamadas a la API
        navigateFallbackDenylist: [/^\/api/],
        // Algunos chunks (PrimeVue, Chart.js) superan los 2 MB por defecto
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
      }
    })
  ],
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
