import { promises as fs } from 'node:fs'
import path from 'node:path'

const DIST_DIR = path.resolve(process.cwd(), 'dist')
const deployEnv = process.env.VITE_DEPLOY_ENV
const defaultSiteUrl = deployEnv === 'preview'
  ? 'https://resume.hanisntsolo.com/dev'
  : 'https://resume.hanisntsolo.com'

const siteUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || defaultSiteUrl).replace(/\/+$/, '')
const buildTimestamp = new Date().toISOString()
const personName = 'Dhirendra Pratap Singh'

function buildUrl(relativePath) {
  const base = new URL(`${siteUrl}/`)
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

function setMetaTag(html, attribute, key, content) {
  const tag = `<meta ${attribute}="${key}" content="${content}" />`
  const regex = new RegExp(`<meta\\s+${attribute}=["']${key}["'][^>]*>`, 'i')

  if (regex.test(html)) {
    return html.replace(regex, tag)
  }

  return html.replace('</head>', `  ${tag}\n</head>`)
}

function setCanonicalLink(html, href) {
  const tag = `<link rel="canonical" href="${href}" />`
  const regex = /<link\s+rel=["']canonical["'][^>]*>/i

  if (regex.test(html)) {
    return html.replace(regex, tag)
  }

  return html.replace('</head>', `  ${tag}\n</head>`)
}

function setJsonLd(html, data) {
  const scriptContent = JSON.stringify(data)
  const tag = `<script type="application/ld+json" id="route-structured-data">${scriptContent}</script>`
  const regex = /<script[^>]*id=["']route-structured-data["'][^>]*>[\s\S]*?<\/script>/i

  if (regex.test(html)) {
    return html.replace(regex, tag)
  }

  return html.replace('</head>', `  ${tag}\n</head>`)
}

async function generateSitemap() {
  const urls = [
    { path: '', changefreq: 'weekly', priority: '1.0' },
    { path: 'timeline/', changefreq: 'weekly', priority: '0.9' },
    { path: 'timeline-data.json', changefreq: 'monthly', priority: '0.4' }
  ]

  if (await fileExists(path.join(DIST_DIR, 'hanisntsolo-resume.pdf'))) {
    urls.push({ path: 'hanisntsolo-resume.pdf', changefreq: 'monthly', priority: '0.8' })
  }

  const coverLetterPath = await firstExistingRelativePath(['hanisntsolo-cover-letter.pdf'])

  if (coverLetterPath) {
    urls.push({ path: coverLetterPath, changefreq: 'monthly', priority: '0.6' })
  }

  const urlEntries = urls
    .map(({ path: routePath, changefreq, priority }) => {
      return [
        '  <url>',
        `    <loc>${buildUrl(routePath)}</loc>`,
        `    <lastmod>${buildTimestamp}</lastmod>`,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
        '  </url>'
      ].join('\n')
    })
    .join('\n')

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlEntries,
    '</urlset>'
  ].join('\n')

  await fs.writeFile(path.join(DIST_DIR, 'sitemap.xml'), `${xml}\n`, 'utf8')
}

async function generateRobotsTxt() {
  const host = new URL(siteUrl).host
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

async function generateTimelineIndexHtml() {
  const sourcePath = path.join(DIST_DIR, 'index.html')
  const timelineDir = path.join(DIST_DIR, 'timeline')
  const timelinePath = path.join(timelineDir, 'index.html')

  let html = await fs.readFile(sourcePath, 'utf8')

  const title = `Experience Timeline | ${personName}`
  const description = `Explore a detailed timeline of ${personName}'s work experience, projects, and engineering milestones.`
  const canonicalUrl = buildUrl('timeline/')
  const timelineSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${buildUrl('timeline/')}#page`,
        url: buildUrl('timeline/'),
        name: title,
        description,
        isPartOf: {
          '@id': `${buildUrl('')}#website`
        },
        about: {
          '@id': `${buildUrl('')}#person`
        }
      },
      {
        '@type': 'Dataset',
        '@id': `${buildUrl('timeline-data.json')}#dataset`,
        name: `${personName} professional timeline data`,
        description: 'Structured JSON data used to render the interactive career timeline.',
        url: buildUrl('timeline-data.json'),
        creator: {
          '@id': `${buildUrl('')}#person`
        }
      }
    ]
  }

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
  html = setMetaTag(html, 'name', 'description', description)
  html = setMetaTag(html, 'property', 'og:title', title)
  html = setMetaTag(html, 'property', 'og:description', description)
  html = setMetaTag(html, 'property', 'og:type', 'website')
  html = setMetaTag(html, 'property', 'og:url', canonicalUrl)
  html = setMetaTag(html, 'name', 'twitter:title', title)
  html = setMetaTag(html, 'name', 'twitter:description', description)
  html = setCanonicalLink(html, canonicalUrl)
  html = setJsonLd(html, timelineSchema)

  await fs.mkdir(timelineDir, { recursive: true })
  await fs.writeFile(timelinePath, html, 'utf8')
}

async function run() {
  await fs.mkdir(DIST_DIR, { recursive: true })
  await ensureCanonicalCoverLetterPdf()
  await generateSitemap()
  await generateRobotsTxt()
  await generateLlmsTxt()
  await generateTimelineIndexHtml()
}

run().catch((error) => {
  console.error('Failed to generate SEO files:', error)
  process.exit(1)
})
