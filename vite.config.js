import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// خدمة index.html لمجلدات public (مطلوب في dev/preview فقط؛ GitHub Pages يفعله تلقائياً)
function directoryIndex() {
  const attach = (server) => {
    server.middlewares.use((req, res, next) => {
      const path = (req.url || '').split('?')[0]
      if (path === '/b2b' || path === '/b2b/') {
        req.url = '/b2b/index.html'
      }
      next()
    })
  }
  return {
    name: 'public-directory-index',
    apply: 'serve',
    configureServer: attach,
    configurePreviewServer: attach,
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), directoryIndex()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  }
})
