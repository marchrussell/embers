import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { quality: 80 },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router-dom/') ||
            id.includes('node_modules/react-router/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'vendor-react'
          }

          if (
            id.includes('node_modules/@radix-ui/') ||
            id.includes('node_modules/lucide-react/')
          ) {
            return 'vendor-ui'
          }

          if (
            id.includes('node_modules/@tanstack/react-query') ||
            id.includes('node_modules/react-hook-form/') ||
            id.includes('node_modules/@hookform/') ||
            id.includes('node_modules/zod/')
          ) {
            return 'vendor-data'
          }

          if (id.includes('node_modules/@supabase/')) {
            return 'vendor-supabase'
          }

          if (id.includes('node_modules/@daily-co/')) {
            return 'vendor-video'
          }

          if (
            id.includes('node_modules/recharts/') ||
            id.includes('node_modules/d3-') ||
            id.includes('node_modules/victory-vendor/')
          ) {
            return 'vendor-charts'
          }

          if (id.includes('node_modules/posthog-js/')) {
            return 'vendor-analytics'
          }

          if (id.includes('node_modules/date-fns/')) {
            return 'vendor-date'
          }

          if (
            id.includes('node_modules/class-variance-authority/') ||
            id.includes('node_modules/clsx/') ||
            id.includes('node_modules/tailwind-merge/') ||
            id.includes('node_modules/cmdk/') ||
            id.includes('node_modules/sonner/') ||
            id.includes('node_modules/vaul/') ||
            id.includes('node_modules/embla-carousel') ||
            id.includes('node_modules/input-otp/') ||
            id.includes('node_modules/next-themes/') ||
            id.includes('node_modules/react-day-picker/') ||
            id.includes('node_modules/react-resizable-panels/')
          ) {
            return 'vendor-ui-utils'
          }
        },
      },
    },
  },
})
