// vite.config.ts
import { defineConfig } from "file:///C:/Users/Asus/Desktop/rs-rotafacil-main/rs-rotafacil/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Asus/Desktop/rs-rotafacil-main/rs-rotafacil/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/Asus/Desktop/rs-rotafacil-main/rs-rotafacil/node_modules/lovable-tagger/dist/index.js";
import { VitePWA } from "file:///C:/Users/Asus/Desktop/rs-rotafacil-main/rs-rotafacil/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Asus\\Desktop\\rs-rotafacil-main\\rs-rotafacil";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["favicon.ico", "robots.txt", "assets/branding/falcon-icon.png", "assets/branding/logo-og.png"],
      manifest: {
        name: "RS Pr\xF3lipsi - RotaF\xE1cil",
        short_name: "RotaFacil",
        description: "Sistema Inteligente de Gest\xE3o RS Pr\xF3lipsi",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        display_override: ["window-controls-overlay", "standalone"],
        orientation: "portrait",
        start_url: "/?utm_source=pwa",
        scope: "/",
        id: "br.com.rsprolipsi.rotafacil.v1",
        icons: [
          {
            src: "assets/branding/falcon-icon.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "assets/branding/falcon-icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "assets/branding/falcon-icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        shortcuts: [
          {
            name: "Financeiro",
            short_name: "Financeiro",
            description: "Acesse o controle financeiro",
            url: "/financeiro",
            icons: [{ src: "assets/branding/falcon-icon.png", sizes: "192x192" }]
          },
          {
            name: "Alunos",
            short_name: "Alunos",
            description: "Veja a lista de alunos",
            url: "/alunos",
            icons: [{ src: "assets/branding/falcon-icon.png", sizes: "192x192" }]
          }
        ],
        categories: ["business", "finance", "productivity"]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5242880,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
                // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
                // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    }),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBc3VzXFxcXERlc2t0b3BcXFxccnMtcm90YWZhY2lsLW1haW5cXFxccnMtcm90YWZhY2lsXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBc3VzXFxcXERlc2t0b3BcXFxccnMtcm90YWZhY2lsLW1haW5cXFxccnMtcm90YWZhY2lsXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9Bc3VzL0Rlc2t0b3AvcnMtcm90YWZhY2lsLW1haW4vcnMtcm90YWZhY2lsL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiMC4wLjAuMFwiLFxyXG4gICAgcG9ydDogODA4MCxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBWaXRlUFdBKHtcclxuICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXHJcbiAgICAgIGluamVjdFJlZ2lzdGVyOiAnYXV0bycsXHJcbiAgICAgIGluY2x1ZGVBc3NldHM6IFsnZmF2aWNvbi5pY28nLCAncm9ib3RzLnR4dCcsICdhc3NldHMvYnJhbmRpbmcvZmFsY29uLWljb24ucG5nJywgJ2Fzc2V0cy9icmFuZGluZy9sb2dvLW9nLnBuZyddLFxyXG4gICAgICBtYW5pZmVzdDoge1xyXG4gICAgICAgIG5hbWU6ICdSUyBQclx1MDBGM2xpcHNpIC0gUm90YUZcdTAwRTFjaWwnLFxyXG4gICAgICAgIHNob3J0X25hbWU6ICdSb3RhRmFjaWwnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnU2lzdGVtYSBJbnRlbGlnZW50ZSBkZSBHZXN0XHUwMEUzbyBSUyBQclx1MDBGM2xpcHNpJyxcclxuICAgICAgICB0aGVtZV9jb2xvcjogJyMwMDAwMDAnLFxyXG4gICAgICAgIGJhY2tncm91bmRfY29sb3I6ICcjMDAwMDAwJyxcclxuICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXHJcbiAgICAgICAgZGlzcGxheV9vdmVycmlkZTogWyd3aW5kb3ctY29udHJvbHMtb3ZlcmxheScsICdzdGFuZGFsb25lJ10sXHJcbiAgICAgICAgb3JpZW50YXRpb246ICdwb3J0cmFpdCcsXHJcbiAgICAgICAgc3RhcnRfdXJsOiAnLz91dG1fc291cmNlPXB3YScsXHJcbiAgICAgICAgc2NvcGU6ICcvJyxcclxuICAgICAgICBpZDogJ2JyLmNvbS5yc3Byb2xpcHNpLnJvdGFmYWNpbC52MScsXHJcbiAgICAgICAgaWNvbnM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnYXNzZXRzL2JyYW5kaW5nL2ZhbGNvbi1pY29uLnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnMTkyeDE5MicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55J1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnYXNzZXRzL2JyYW5kaW5nL2ZhbGNvbi1pY29uLnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55J1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnYXNzZXRzL2JyYW5kaW5nL2ZhbGNvbi1pY29uLnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICAgICAgICBwdXJwb3NlOiAnbWFza2FibGUnXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXSxcclxuICAgICAgICBzaG9ydGN1dHM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogJ0ZpbmFuY2Vpcm8nLFxyXG4gICAgICAgICAgICBzaG9ydF9uYW1lOiAnRmluYW5jZWlybycsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQWNlc3NlIG8gY29udHJvbGUgZmluYW5jZWlybycsXHJcbiAgICAgICAgICAgIHVybDogJy9maW5hbmNlaXJvJyxcclxuICAgICAgICAgICAgaWNvbnM6IFt7IHNyYzogJ2Fzc2V0cy9icmFuZGluZy9mYWxjb24taWNvbi5wbmcnLCBzaXplczogJzE5MngxOTInIH1dXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiAnQWx1bm9zJyxcclxuICAgICAgICAgICAgc2hvcnRfbmFtZTogJ0FsdW5vcycsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVmVqYSBhIGxpc3RhIGRlIGFsdW5vcycsXHJcbiAgICAgICAgICAgIHVybDogJy9hbHVub3MnLFxyXG4gICAgICAgICAgICBpY29uczogW3sgc3JjOiAnYXNzZXRzL2JyYW5kaW5nL2ZhbGNvbi1pY29uLnBuZycsIHNpemVzOiAnMTkyeDE5MicgfV1cclxuICAgICAgICAgIH1cclxuICAgICAgICBdLFxyXG4gICAgICAgIGNhdGVnb3JpZXM6IFsnYnVzaW5lc3MnLCAnZmluYW5jZScsICdwcm9kdWN0aXZpdHknXVxyXG4gICAgICB9LFxyXG4gICAgICB3b3JrYm94OiB7XHJcbiAgICAgICAgbWF4aW11bUZpbGVTaXplVG9DYWNoZUluQnl0ZXM6IDUyNDI4ODAsXHJcbiAgICAgICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLGNzcyxodG1sLGljbyxwbmcsc3ZnLHdvZmYsd29mZjJ9J10sXHJcbiAgICAgICAgY2xlYW51cE91dGRhdGVkQ2FjaGVzOiB0cnVlLFxyXG4gICAgICAgIGNsaWVudHNDbGFpbTogdHJ1ZSxcclxuICAgICAgICBza2lwV2FpdGluZzogdHJ1ZSxcclxuICAgICAgICBydW50aW1lQ2FjaGluZzogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcL2ZvbnRzXFwuZ29vZ2xlYXBpc1xcLmNvbVxcLy4qL2ksXHJcbiAgICAgICAgICAgIGhhbmRsZXI6ICdDYWNoZUZpcnN0JyxcclxuICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ2dvb2dsZS1mb250cy1jYWNoZScsXHJcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgbWF4RW50cmllczogMTAsXHJcbiAgICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgKiAzNjUgLy8gPD09IDM2NSBkYXlzXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBjYWNoZWFibGVSZXNwb25zZToge1xyXG4gICAgICAgICAgICAgICAgc3RhdHVzZXM6IFswLCAyMDBdXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcL2ZvbnRzXFwuZ3N0YXRpY1xcLmNvbVxcLy4qL2ksXHJcbiAgICAgICAgICAgIGhhbmRsZXI6ICdDYWNoZUZpcnN0JyxcclxuICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ2dzdGF0aWMtZm9udHMtY2FjaGUnLFxyXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcclxuICAgICAgICAgICAgICAgIG1heEVudHJpZXM6IDEwLFxyXG4gICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogMzY1IC8vIDw9PSAzNjUgZGF5c1xyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHtcclxuICAgICAgICAgICAgICAgIHN0YXR1c2VzOiBbMCwgMjAwXVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgfSksXHJcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmXHJcbiAgICBjb21wb25lbnRUYWdnZXIoKSxcclxuICBdLmZpbHRlcihCb29sZWFuKSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxufSkpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTBWLFNBQVMsb0JBQW9CO0FBQ3ZYLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFDaEMsU0FBUyxlQUFlO0FBSnhCLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04s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
