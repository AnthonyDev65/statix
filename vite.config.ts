import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/** Agrupa las dependencias pesadas en chunks de vendor estables. */
function manualChunks(id: string): string | undefined {
  if (!id.includes('node_modules')) return undefined;
  if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|@remix-run|scheduler)[\\/]/.test(id)) {
    return 'vendor-react';
  }
  if (/[\\/]node_modules[\\/](recharts|d3-[^\\/]+|victory-vendor|recharts-scale|internmap)[\\/]/.test(id)) {
    return 'vendor-recharts';
  }
  if (/[\\/]node_modules[\\/]katex[\\/]/.test(id)) return 'vendor-katex';
  if (/[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) {
    return 'vendor-motion';
  }
  return undefined;
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
});
