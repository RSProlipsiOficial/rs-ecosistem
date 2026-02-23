import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3036,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});
