import { defineConfig } from 'astro/config'

const deployEnv = process.env.VITE_DEPLOY_ENV || 'production'
const configuredBase = process.env.VITE_BASE_PATH
const base = configuredBase
  ? configuredBase.replace(/\/$/, '') || '/'
  : deployEnv === 'preview'
    ? '/dev'
    : '/'

const site = process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://resume.hanisntsolo.com'

export default defineConfig({
  site,
  base,
  output: 'static'
})
