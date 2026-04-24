import { promises as fs } from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const DIST_DIR = path.resolve(process.cwd(), 'dist')
const deployEnv = process.env.VITE_DEPLOY_ENV
const defaultBasePath = deployEnv === 'preview' ? '/dev/' : '/'
const siteOrigin = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://resume.hanisntsolo.com').replace(/\/+$/, '')
const basePath = normalizeBasePath(process.env.VITE_BASE_PATH || defaultBasePath)
const siteBaseUrl = new URL(basePath, `${siteOrigin}/`).toString().replace(/\/+$/, '')
const buildTimestamp = new Date().toISOString()
const personName = 'Dhirendra Pratap Singh'
const execFileAsync = promisify(execFile)

function normalizeBasePath(rawValue) {
  if (!rawValue || rawValue === '/') {
    return '/'
  }

  const trimmed = `${rawValue}`.replace(/^\/+|\/+$/g, '')
  return `/${trimmed}/`
}

function buildUrl(relativePath) {
  const base = new URL(`${siteBaseUrl}/`)
  const normalized = (relativePath || '').replace(/^\/+/, '')
  return new URL(normalized, base).toString()
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function firstExistingRelativePath(candidates) {
  for (const candidate of candidates) {
    const candidatePath = path.join(DIST_DIR, candidate)
    if (await fileExists(candidatePath)) {
      return candidate
    }
  }

  return null
}

async function getGitLastModifiedIso(workspaceRelativePath) {
  try {
    const { stdout } = await execFileAsync('git', ['log', '-1', '--format=%cI', '--', workspaceRelativePath], {
      cwd: process.cwd()
    })

    const value = stdout.trim()
    if (!value) {
      return null
    }

    const parsed = Date.parse(value)
    if (Number.isNaN(parsed)) {
      return null
    }

    return new Date(parsed).toISOString()
  } catch {
    return null
  }
}

async function resolveLastModifiedFromSources(sourcePaths) {
  const resolvedSources = Array.isArray(sourcePaths) ? sourcePaths : []
  let newestTimestamp = Number.NEGATIVE_INFINITY

  for (const sourcePath of resolvedSources) {
    const iso = await getGitLastModifiedIso(sourcePath)
    if (!iso) {
      continue
    }

    const timestamp = Date.parse(iso)
    if (!Number.isNaN(timestamp) && timestamp > newestTimestamp) {
      newestTimestamp = timestamp
    }
  }

  if (newestTimestamp === Number.NEGATIVE_INFINITY) {
    return buildTimestamp
  }

  return new Date(newestTimestamp).toISOString()
}

async function ensureCanonicalCoverLetterPdf() {
  const canonicalPath = path.join(DIST_DIR, 'hanisntsolo-cover-letter.pdf')
  const legacyPath = path.join(DIST_DIR, 'hanisntsolo-cover-letter.pdf.1')

  if (await fileExists(canonicalPath)) {
    return
  }

  if (await fileExists(legacyPath)) {
    await fs.copyFile(legacyPath, canonicalPath)
  }
}

async function generateSitemap() {
  const urls = [
    {
      path: '',
      changefreq: 'weekly',
      priority: '1.0',
      sources: [
        'src/pages/index.astro',
        'src/layouts/BaseLayout.astro',
        'src/styles/site.css',
        'src/lib/timeline.js',
        'timeline-data.json'
      ]
    },
    {
      path: 'timeline/',
      changefreq: 'weekly',
      priority: '0.9',
      sources: [
        'src/pages/timeline/index.astro',
        'src/layouts/BaseLayout.astro',
        'src/styles/site.css',
        'src/lib/timeline.js',
        'timeline-data.json'
      ]
    },
    {
      path: 'timeline-data.json',
      changefreq: 'monthly',
      priority: '0.4',
      sources: ['timeline-data.json', 'public/timeline-data.json']
    }
  ]

  if (await fileExists(path.join(DIST_DIR, 'hanisntsolo-resume.pdf'))) {
    urls.push({
      path: 'hanisntsolo-resume.pdf',
      changefreq: 'monthly',
      priority: '0.8',
      sources: ['public/hanisntsolo-resume.pdf', 'hanisntsolo-resume.tex', 'hanisntsolo-resume-ats.tex']
    })
  }

  const coverLetterPath = await firstExistingRelativePath(['hanisntsolo-cover-letter.pdf'])

  if (coverLetterPath) {
    urls.push({
      path: coverLetterPath,
      changefreq: 'monthly',
      priority: '0.6',
      sources: ['public/hanisntsolo-cover-letter.pdf', 'public/hanisntsolo-cover-letter.pdf.1', 'hanisntsolo-cover-letter.tex']
    })
  }

  const urlEntries = []
  for (const { path: routePath, changefreq, priority, sources } of urls) {
    const lastmod = await resolveLastModifiedFromSources(sources)
    urlEntries.push(
      [
        '  <url>',
        `    <loc>${buildUrl(routePath)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
        '  </url>'
      ].join('\n')
    )
  }

  const sitemapEntries = urlEntries.join('\n')

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    sitemapEntries,
    '</urlset>'
  ].join('\n')

  await fs.writeFile(path.join(DIST_DIR, 'sitemap.xml'), `${xml}\n`, 'utf8')
}

async function generateRobotsTxt() {
  const host = new URL(siteOrigin).host
  const robots = [
    'User-agent: *',
    'Allow: /',
    '',
    'User-agent: GPTBot',
    'Allow: /',
    '',
    'User-agent: ChatGPT-User',
    'Allow: /',
    '',
    'User-agent: ClaudeBot',
    'Allow: /',
    '',
    'User-agent: PerplexityBot',
    'Allow: /',
    '',
    'User-agent: Google-Extended',
    'Allow: /',
    '',
    `Host: ${host}`,
    `Sitemap: ${buildUrl('sitemap.xml')}`
  ].join('\n')

  await fs.writeFile(path.join(DIST_DIR, 'robots.txt'), `${robots}\n`, 'utf8')
}

async function generateLlmsTxt() {
  const coverLetterPath = await firstExistingRelativePath(['hanisntsolo-cover-letter.pdf'])

  const publicAssetLines = [
    `- Canonical website: ${buildUrl('')}`,
    `- Timeline page: ${buildUrl('timeline/')}`,
    `- Timeline data (JSON): ${buildUrl('timeline-data.json')}`
  ]

  if (await fileExists(path.join(DIST_DIR, 'hanisntsolo-resume.pdf'))) {
    publicAssetLines.splice(1, 0, `- Resume PDF: ${buildUrl('hanisntsolo-resume.pdf')}`)
  }

  if (coverLetterPath) {
    publicAssetLines.push(`- Cover letter PDF: ${buildUrl(coverLetterPath)}`)
  }

  const llmsText = [
    `# ${personName} - Resume and Experience Timeline`,
    '',
    '> Official source for resume, profile links, and career timeline.',
    '',
    ...publicAssetLines,
    '',
    '## Professional summary',
    '- Full Stack Java Developer focused on distributed systems, cloud-native architecture, and product engineering.',
    '- Background includes fintech engineering, microservices, and platform reliability.',
    '',
    '## Public profiles',
    '- Portfolio: https://hanisntsolo.com',
    '- GitHub: https://github.com/hanisntsolo',
    '- LinkedIn: https://www.linkedin.com/in/hanisntsolo',
    '',
    '## Contact',
    '- Email: ds.pratap1997@gmail.com',
    '',
    `Last updated: ${buildTimestamp}`
  ].join('\n')

  await fs.writeFile(path.join(DIST_DIR, 'llms.txt'), `${llmsText}\n`, 'utf8')
}

async function run() {
  await fs.mkdir(DIST_DIR, { recursive: true })
  await ensureCanonicalCoverLetterPdf()
  await generateSitemap()
  await generateRobotsTxt()
  await generateLlmsTxt()
}

run().catch((error) => {
  console.error('Failed to generate SEO files:', error)
  process.exit(1)
})
