import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 이렇게 하면 --host 옵션을 항상 켜는 것과 같습니다.
    port: 5173,
  }
})