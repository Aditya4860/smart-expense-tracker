import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [
      react(),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@layouts': path.resolve(__dirname, './src/layouts'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@context': path.resolve(__dirname, './src/context'),
        '@services': path.resolve(__dirname, './src/services'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@constants': path.resolve(__dirname, './src/constants'),
        '@assets': path.resolve(__dirname, './src/assets'),
      },
    },

    server: {
      port: 3000,
      open: true,
    },

    build: {
      outDir: 'dist',
      // Only generate sourcemaps for dev/staging, not production
      sourcemap: !isProduction,
      // Target modern browsers for smaller output
      target: 'es2020',
      // Minify with esbuild (faster than terser, same quality)
      minify: 'esbuild',
      cssMinify: true,
      // Warn if a chunk exceeds 600 kB
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Manual chunk splitting for optimal caching
          manualChunks: {
            // Core React runtime — changes least often
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            // Charts library — large, split separately
            'vendor-charts': ['recharts'],
            // Date utilities
            'vendor-dates': ['date-fns', 'react-datepicker'],
            // HTTP client
            'vendor-axios': ['axios'],
            // Icon set
            'vendor-icons': ['lucide-react'],
          },
          // Consistent asset filenames for CDN caching
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
    },

    // Optimise deps pre-bundling
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'axios', 'recharts', 'date-fns'],
    },
  };
});
