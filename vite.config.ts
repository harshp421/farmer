import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The farmer panel is one of three separate frontends (farmer / org / platform).
// It talks to the single Canopy backend defined in spac/001_poc.md §7.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
   
  },
});
