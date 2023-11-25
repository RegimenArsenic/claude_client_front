import { fileURLToPath, URL } from 'node:url'
import  globalConfig  from './config.js'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  server: {
    host: globalConfig.host,
    port: globalConfig.port,
    proxy: {
      '/api': {
        target: globalConfig.api,	//实际请求地址
        changeOrigin: true,
        ws: true,
        rewrite: (path) => {
          return path.replace(/^\/api/, '')
        }
      },
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
