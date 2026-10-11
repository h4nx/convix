import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const backend = `http://localhost:${process.env.BACKEND_PORT ?? 3001}`;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@server': resolve(__dirname, 'server'),
    },
  },
  server: {
    port: Number(process.env.PORT ?? 3000),
    host: true,
    // La API vive en el servidor Node (server/); en desarrollo se proxea por el mismo origen.
    proxy: { '/api': { target: backend, changeOrigin: false } },
  },
  build: { outDir: 'dist' },
});
