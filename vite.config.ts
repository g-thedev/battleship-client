import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'



// https://vitejs.dev/config/
export default defineConfig(({ mode }) =>{
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  const {VITE_API_URL} = process.env;
  return {
  plugins: [react()],
  server: {
    proxy: {
      // TODO: pass port as variable or env variable
      '/api': {
        target: VITE_API_URL,
        changeOrigin: true,
        secure: false,      
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // '/socket': {
      //   target: 'ws://localhost:3000',
      //   ws: true,
      //   rewrite: (path) => path.replace(/^\/socket/, ''),
      //   secure: false, 
      //   changeOrigin: true
      // },
    } 
  }}
})
