// vite.config.ts
import path from "path";
import { defineConfig, loadEnv } from "file:///D:/Rs%20%20Ecosystem/rs-ecosystem/apps/rs-admin/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Rs%20%20Ecosystem/rs-ecosystem/apps/rs-admin/node_modules/@vitejs/plugin-react/dist/index.js";
var __vite_injected_original_dirname = "D:\\Rs  Ecosystem\\rs-ecosystem\\apps\\rs-admin";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3001,
      strictPort: true,
      host: "0.0.0.0",
      hmr: {
        port: 3001,
        clientPort: 3001
      }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxScyAgRWNvc3lzdGVtXFxcXHJzLWVjb3N5c3RlbVxcXFxhcHBzXFxcXHJzLWFkbWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxScyAgRWNvc3lzdGVtXFxcXHJzLWVjb3N5c3RlbVxcXFxhcHBzXFxcXHJzLWFkbWluXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9ScyUyMCUyMEVjb3N5c3RlbS9ycy1lY29zeXN0ZW0vYXBwcy9ycy1hZG1pbi92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcclxuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsICcuJywgJycpO1xyXG4gIHJldHVybiB7XHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgcG9ydDogMzAwMSxcclxuICAgICAgc3RyaWN0UG9ydDogdHJ1ZSxcclxuICAgICAgaG9zdDogJzAuMC4wLjAnLFxyXG4gICAgICBobXI6IHtcclxuICAgICAgICBwb3J0OiAzMDAxLFxyXG4gICAgICAgIGNsaWVudFBvcnQ6IDMwMDEsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgcGx1Z2luczogW3JlYWN0KCldLFxyXG4gICAgYnVpbGQ6IHtcclxuICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgIG91dHB1dDoge1xyXG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6IGBhc3NldHMvW25hbWVdLVtoYXNoXS0ke0RhdGUubm93KCl9LmpzYCxcclxuICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiBgYXNzZXRzL1tuYW1lXS1baGFzaF0tJHtEYXRlLm5vdygpfS5qc2AsXHJcbiAgICAgICAgICBhc3NldEZpbGVOYW1lczogYGFzc2V0cy9bbmFtZV0tW2hhc2hdLSR7RGF0ZS5ub3coKX0uW2V4dF1gXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgZGVmaW5lOiB7XHJcbiAgICAgICdwcm9jZXNzLmVudi5BUElfS0VZJzogSlNPTi5zdHJpbmdpZnkoZW52LkdFTUlOSV9BUElfS0VZKSxcclxuICAgICAgJ3Byb2Nlc3MuZW52LkdFTUlOSV9BUElfS0VZJzogSlNPTi5zdHJpbmdpZnkoZW52LkdFTUlOSV9BUElfS0VZKVxyXG4gICAgfSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IHtcclxuICAgICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuJyksXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFpVSxPQUFPLFVBQVU7QUFDbFYsU0FBUyxjQUFjLGVBQWU7QUFDdEMsT0FBTyxXQUFXO0FBRmxCLElBQU0sbUNBQW1DO0FBSXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sTUFBTSxRQUFRLE1BQU0sS0FBSyxFQUFFO0FBQ2pDLFNBQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLFlBQVk7QUFBQSxNQUNaLE1BQU07QUFBQSxNQUNOLEtBQUs7QUFBQSxRQUNILE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxNQUNkO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLElBQ2pCLE9BQU87QUFBQSxNQUNMLGVBQWU7QUFBQSxRQUNiLFFBQVE7QUFBQSxVQUNOLGdCQUFnQix3QkFBd0IsS0FBSyxJQUFJLENBQUM7QUFBQSxVQUNsRCxnQkFBZ0Isd0JBQXdCLEtBQUssSUFBSSxDQUFDO0FBQUEsVUFDbEQsZ0JBQWdCLHdCQUF3QixLQUFLLElBQUksQ0FBQztBQUFBLFFBQ3BEO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLHVCQUF1QixLQUFLLFVBQVUsSUFBSSxjQUFjO0FBQUEsTUFDeEQsOEJBQThCLEtBQUssVUFBVSxJQUFJLGNBQWM7QUFBQSxJQUNqRTtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsR0FBRztBQUFBLE1BQ2xDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
