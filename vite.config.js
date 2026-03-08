import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Use a modern esbuild target that fully supports CSS custom properties
    target: 'es2020',
    cssMinify: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://mongodb-production-744f.up.railway.app',
        changeOrigin: true,
      },
      '/auth': {
        target: 'https://mongodb-production-744f.up.railway.app',
        changeOrigin: true,
      },
    },
  },
});
