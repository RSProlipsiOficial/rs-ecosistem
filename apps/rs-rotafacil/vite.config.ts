import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'robots.txt', 'logo-rotafacil.png', 'assets/branding/logo-og.png'],
      manifest: {
        name: 'Rota Fácil',
        short_name: 'Rota Fácil',
        description: 'Sistema Inteligente de Gestão de Transporte Escolar',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        orientation: 'portrait',
        start_url: '/?utm_source=pwa',
        scope: '/',
        id: 'br.com.rsprolipsi.rotafacil.v1',
        icons: [
          {
            src: 'logo-rotafacil.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'logo-rotafacil.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'logo-rotafacil.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Financeiro',
            short_name: 'Financeiro',
            description: 'Acesse o controle financeiro',
            url: '/financeiro',
            icons: [{ src: 'logo-rotafacil.png', sizes: '192x192' }]
          },
          {
            name: 'Alunos',
            short_name: 'Alunos',
            description: 'Veja a lista de alunos',
            url: '/alunos',
            icons: [{ src: 'logo-rotafacil.png', sizes: '192x192' }]
          }
        ],
        categories: ['business', 'finance', 'productivity']
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5242880,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
