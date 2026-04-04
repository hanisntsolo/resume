import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Determine base path based on environment
// VITE_DEPLOY_ENV can be 'production' or 'preview' (set by GitHub Actions)
const deployEnv = process.env.VITE_DEPLOY_ENV || (process.env.NODE_ENV === 'production' ? 'production' : 'development')
const getBasePath = () => {
  // Development (local): use root /
  if (process.env.NODE_ENV !== 'production') {
    return '/'
  }
  // Production build: check which deployment
  if (deployEnv === 'preview') {
    return '/dev/timeline/'
  }
  // Default (main production): /timeline/
  return '/timeline/'
}

export default defineConfig({
  plugins: [react()],
  base: getBasePath(),
  publicDir: 'public',
  build: {
    outDir: deployEnv === 'preview' ? 'dist/dev-timeline' : 'dist/timeline',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'public/index.html'),
    },
  },
  server: {
    port: 5173,
    middlewareMode: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }
})
