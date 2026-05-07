import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    proxy: {
      '/hubs': {
        target: 'http://localhost:5227',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
