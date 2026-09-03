import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // The storefront is a single-page application; the current production bundle
    // is ~203 kB gzip. Keep the warning threshold aligned with the measured,
    // acceptable payload while route-level lazy loading is introduced separately.
    chunkSizeWarningLimit: 800,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    // أثناء التطوير: مرر طلبات /api إلى wrangler dev (Cloudflare Worker + D1)
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  }
})
