import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      port: 3003,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy errored', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              // Allow large payloads to pass through
            });
          }
        },
        '/v1': {
          target: env.VITE_API_URL || 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              // Ensure no body parser conflicts at proxy level
            });
          }
        }
      }
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'react-is': path.resolve(__dirname, 'node_modules/react-is/index.js'),
      }
    },
    optimizeDeps: {
      include: ['react-is']
    }
  };
});
