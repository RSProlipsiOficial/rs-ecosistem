import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3002,
        host: '0.0.0.0',
        hmr: {
          port: 3002,
          clientPort: 3002,
        },
      },
      plugins: [react()],
      build: {
        rollupOptions: {
          output: {
            entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
            chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
            assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`
          }
        }
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
