import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: './', // Cruciaal voor cPanel/GoDaddy: zorgt voor relatieve paden
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  server: {
    host: true, // Needed for some cloud environments
    strictPort: false, // Allow dynamic port selection
    hmr: {
      overlay: false // Disable overlay to prevent blocking view on minor errors
    }
  }
}));