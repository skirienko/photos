import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    open: true,
    proxy: {
      '/api/search': 'http://localhost:5005'
    }
  },
  build: {
    outDir: 'build',
  },
  plugins: [
    react(), 
  ],
  /*
  resolve: {
    viteTsconfigPaths: true
  }
  */
});
