import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: '.contact-build',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        contact: resolve(process.cwd(), 'contact-src/index.html')
      }
    }
  },
  server: {
    open: '/contact-src/index.html'
  },
  preview: {
    open: '/contact-src/index.html'
  }
});
