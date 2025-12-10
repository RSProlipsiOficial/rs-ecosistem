import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5009,
    host: '0.0.0.0',
  },
  define: {
    // This makes the environment variable available in the client-side code.
    // Vite performs a direct text replacement, so `process.env.API_KEY` in the source
    // will be replaced with the value of the API_KEY from the build environment.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY)
  }
})