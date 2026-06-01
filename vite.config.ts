import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The farmer panel is one of three separate frontends (farmer / org / platform).
// It talks to the single Canopy backend defined in spac/001_poc.md §7.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls to the backend in dev so the browser sees same-origin.
      '/api': {
        target: process.env.VITE_API_TARGET ?? 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
