import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // TODO: pass port as variable or env variable
      '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,      
          ws: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      } 
    }
  }
)
