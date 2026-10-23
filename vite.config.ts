import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // SPA fallback: /verify-email gibi yollarda index.html'i sun
    // Vite bunu varsayılan olarak yapar ama açıkça belirtelim
    proxy: {},
  },
})
