import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Determine base path based on deployment environment
// VITE_DEPLOY_ENV can be 'production' or 'preview' (set by GitHub Actions)
// VITE_BASE_PATH can be used in development to override the base path for testing
const deployEnv = process.env.VITE_DEPLOY_ENV || (process.env.NODE_ENV === 'production' ? 'production' : 'development')
const getBasePath = () => {
  // Allow override via environment variable for local testing
  if (process.env.VITE_BASE_PATH) {
    return process.env.VITE_BASE_PATH
  }
  
  // Development (local): use root /
  if (process.env.NODE_ENV !== 'production') {
    return '/'
  }
  
  // Preview deployments go to /dev/ on GitHub Pages
  if (deployEnv === 'preview') {
    return '/dev/'
  }
  
  // Production: deploy to root /
  return '/'
}

export default defineConfig({
  plugins: [react()],
  base: getBasePath(),
  publicDir: 'public',
  build: {
    outDir: 'dist',
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
