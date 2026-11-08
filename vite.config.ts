import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// proxy 는 개발 서버에서만 쓰이므로 development 모드의 .env 를 읽는다
const env = loadEnv('development', process.cwd(), '')
const API_TARGET = env.VITE_API_BASE_URL || 'http://localhost:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // /api 를 백엔드로 넘겨 세션 쿠키가 같은 origin 에 남게 한다 (W-07)
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: true },
    },
  },
})
