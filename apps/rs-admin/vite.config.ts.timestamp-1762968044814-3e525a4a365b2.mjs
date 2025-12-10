// vite.config.ts
import path from "path";
import { defineConfig, loadEnv } from "file:///G:/Rs%20Pr%C3%B3lipsi%20Oficial%20v.1%20Roberto%20Camargo/RS_Prolipsi_Full_Stack/rs-admin/node_modules/vite/dist/node/index.js";
import react from "file:///G:/Rs%20Pr%C3%B3lipsi%20Oficial%20v.1%20Roberto%20Camargo/RS_Prolipsi_Full_Stack/rs-admin/node_modules/@vitejs/plugin-react/dist/index.js";
var __vite_injected_original_dirname = "G:\\Rs Pr\xF3lipsi Oficial v.1 Roberto Camargo\\RS_Prolipsi_Full_Stack\\rs-admin";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3e3,
      host: "0.0.0.0"
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
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, ".")
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJHOlxcXFxScyBQclx1MDBGM2xpcHNpIE9maWNpYWwgdi4xIFJvYmVydG8gQ2FtYXJnb1xcXFxSU19Qcm9saXBzaV9GdWxsX1N0YWNrXFxcXHJzLWFkbWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJHOlxcXFxScyBQclx1MDBGM2xpcHNpIE9maWNpYWwgdi4xIFJvYmVydG8gQ2FtYXJnb1xcXFxSU19Qcm9saXBzaV9GdWxsX1N0YWNrXFxcXHJzLWFkbWluXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9HOi9ScyUyMFByJUMzJUIzbGlwc2klMjBPZmljaWFsJTIwdi4xJTIwUm9iZXJ0byUyMENhbWFyZ28vUlNfUHJvbGlwc2lfRnVsbF9TdGFjay9ycy1hZG1pbi92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gICAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCAnLicsICcnKTtcbiAgICByZXR1cm4ge1xuICAgICAgc2VydmVyOiB7XG4gICAgICAgIHBvcnQ6IDMwMDAsXG4gICAgICAgIGhvc3Q6ICcwLjAuMC4wJyxcbiAgICAgIH0sXG4gICAgICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gICAgICBidWlsZDoge1xuICAgICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgICBlbnRyeUZpbGVOYW1lczogYGFzc2V0cy9bbmFtZV0tW2hhc2hdLSR7RGF0ZS5ub3coKX0uanNgLFxuICAgICAgICAgICAgY2h1bmtGaWxlTmFtZXM6IGBhc3NldHMvW25hbWVdLVtoYXNoXS0ke0RhdGUubm93KCl9LmpzYCxcbiAgICAgICAgICAgIGFzc2V0RmlsZU5hbWVzOiBgYXNzZXRzL1tuYW1lXS1baGFzaF0tJHtEYXRlLm5vdygpfS5bZXh0XWBcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBkZWZpbmU6IHtcbiAgICAgICAgJ3Byb2Nlc3MuZW52LkFQSV9LRVknOiBKU09OLnN0cmluZ2lmeShlbnYuR0VNSU5JX0FQSV9LRVkpLFxuICAgICAgICAncHJvY2Vzcy5lbnYuR0VNSU5JX0FQSV9LRVknOiBKU09OLnN0cmluZ2lmeShlbnYuR0VNSU5JX0FQSV9LRVkpXG4gICAgICB9LFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICBhbGlhczoge1xuICAgICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4nKSxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBdWEsT0FBTyxVQUFVO0FBQ3hiLFNBQVMsY0FBYyxlQUFlO0FBQ3RDLE9BQU8sV0FBVztBQUZsQixJQUFNLG1DQUFtQztBQUl6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN0QyxRQUFNLE1BQU0sUUFBUSxNQUFNLEtBQUssRUFBRTtBQUNqQyxTQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsSUFDUjtBQUFBLElBQ0EsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLElBQ2pCLE9BQU87QUFBQSxNQUNMLGVBQWU7QUFBQSxRQUNiLFFBQVE7QUFBQSxVQUNOLGdCQUFnQix3QkFBd0IsS0FBSyxJQUFJLENBQUM7QUFBQSxVQUNsRCxnQkFBZ0Isd0JBQXdCLEtBQUssSUFBSSxDQUFDO0FBQUEsVUFDbEQsZ0JBQWdCLHdCQUF3QixLQUFLLElBQUksQ0FBQztBQUFBLFFBQ3BEO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLHVCQUF1QixLQUFLLFVBQVUsSUFBSSxjQUFjO0FBQUEsTUFDeEQsOEJBQThCLEtBQUssVUFBVSxJQUFJLGNBQWM7QUFBQSxJQUNqRTtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsR0FBRztBQUFBLE1BQ2xDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDSixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
