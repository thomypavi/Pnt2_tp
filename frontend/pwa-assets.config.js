// Configuración de @vite-pwa/assets-generator
// A partir de public/logo.svg genera todos los íconos que necesita la PWA
// (favicon, apple-touch-icon, 64x64, 192x192, 512x512 y el "maskable" para Android).
// Si cambian el logo, regenerar con:  npm run generate-pwa-assets
import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: minimal2023Preset,
  images: ['public/logo.svg']
})
