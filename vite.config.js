import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vercel deployment usually requires '/' as the base path
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
})



