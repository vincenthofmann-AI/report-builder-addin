import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Relative base so the built assets work when served from any path
  // (required for MyGeotab add-in hosting where the base URL varies)
  base: './',

  build: {
    // Geotab Add-In deployment: output a clean dist/ folder
    outDir: 'dist',
    assetsDir: 'assets',
    // Inline small assets so the add-in has fewer files to serve
    assetsInlineLimit: 8192,
    rollupOptions: {
      output: {
        // Stable filenames make caching predictable for add-in updates
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})