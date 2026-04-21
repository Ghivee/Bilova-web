import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Use '/NutriSea-WebApp/' only for production build (GitHub Pages)
// Dev server uses '/' to avoid blank screen on localhost
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/NutriSea-WebApp/' : '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
}))



