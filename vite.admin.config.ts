import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to serve admin.html on root
const serveAdminHtml = () => {
  return {
    name: 'serve-admin-html',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url === '/' || req.url?.startsWith('/admin')) {
          req.url = '/admin.html';
        }
        next();
      });
    }
  }
}

export default defineConfig({
  plugins: [react(), serveAdminHtml()],
  build: {
    rollupOptions: {
      input: 'admin.html',
    },
  },
})
