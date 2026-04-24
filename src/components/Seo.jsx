import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const DEFAULT_SITE_URL = 'https://resume.hanisntsolo.com'
const SITE_NAME = 'Dhirendra Pratap Singh Resume'
const PERSON_NAME = 'Dhirendra Pratap Singh'

const SITE_URL = (import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '')

function normalizePath(pathname) {
  if (!pathname || pathname === '/') {
    return '/'
  }

  return pathname.endsWith('/') ? pathname : `${pathname}/`
}

function toAbsoluteUrl(pathname) {
  return `${SITE_URL}${normalizePath(pathname)}`
}

function upsertMeta(attribute, key, content) {
  let meta = document.head.querySelector(`meta[${attribute}="${key}"]`)

  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attribute, key)
    document.head.appendChild(meta)
  }

  meta.setAttribute('content', content)
}

function upsertCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]')

  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }

  link.setAttribute('href', href)
}

function upsertJsonLd(data) {
  const scriptId = 'route-structured-data'
  let script = document.getElementById(scriptId)

  if (!script) {
    script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = scriptId
    document.head.appendChild(script)
  }

  script.textContent = JSON.stringify(data)
}

function buildHomeSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: PERSON_NAME,
        url: `${SITE_URL}/`,
        jobTitle: 'Full Stack Java Developer',
        worksFor: {
          '@type': 'Organization',
          name: 'Citi'
        },
        sameAs: [
          'https://hanisntsolo.com',
          'https://github.com/hanisntsolo',
          'https://www.linkedin.com/in/hanisntsolo'
        ]
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        publisher: {
          '@id': `${SITE_URL}/#person`
        }
      },
      {
        '@type': 'ProfilePage',
        '@id': `${SITE_URL}/#profile`,
        url: `${SITE_URL}/`,
        name: `${PERSON_NAME} Resume`,
        about: {
          '@id': `${SITE_URL}/#person`
        },
        isPartOf: {
          '@id': `${SITE_URL}/#website`
        },
        mainEntity: {
          '@id': `${SITE_URL}/#person`
        }
      }
    ]
  }
}

function buildTimelineSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/timeline/#page`,
        url: `${SITE_URL}/timeline/`,
        name: `Experience Timeline | ${PERSON_NAME}`,
        description: 'Interactive timeline of work experience, projects, and professional milestones.',
        isPartOf: {
          '@id': `${SITE_URL}/#website`
        },
        about: {
          '@id': `${SITE_URL}/#person`
        }
      },
      {
        '@type': 'Dataset',
        '@id': `${SITE_URL}/timeline-data.json#dataset`,
        name: `${PERSON_NAME} professional timeline data`,
        description: 'Structured JSON data used to render the interactive career timeline.',
        url: `${SITE_URL}/timeline-data.json`,
        creator: {
          '@id': `${SITE_URL}/#person`
        }
      }
    ]
  }
}

const SEO_BY_ROUTE = {
  '/': {
    title: 'Dhirendra Pratap Singh | Full Stack Java Developer Resume and Timeline',
    description: 'Dhirendra Pratap Singh is a Full Stack Java Developer focused on distributed systems, cloud-native architecture, and product engineering. Explore resume, timeline, and contact links.',
    canonicalPath: '/',
    keywords: 'Dhirendra Pratap Singh, Full Stack Java Developer, resume, software engineer, distributed systems, cloud-native, microservices, timeline',
    ogType: 'profile',
    schema: buildHomeSchema
  },
  '/timeline/': {
    title: 'Experience Timeline | Dhirendra Pratap Singh',
    description: 'Explore a detailed timeline of Dhirendra Pratap Singh\'s work experience, projects, and engineering milestones.',
    canonicalPath: '/timeline/',
    keywords: 'experience timeline, software engineer timeline, Dhirendra Pratap Singh, Java developer projects, engineering milestones',
    ogType: 'website',
    schema: buildTimelineSchema
  }
}

export default function Seo() {
  const location = useLocation()

  useEffect(() => {
    const normalizedPath = normalizePath(location.pathname)
    const config = SEO_BY_ROUTE[normalizedPath] || SEO_BY_ROUTE['/']
    const canonicalUrl = toAbsoluteUrl(config.canonicalPath)

    document.title = config.title

    upsertMeta('name', 'description', config.description)
    upsertMeta('name', 'robots', 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1')
    upsertMeta('name', 'author', PERSON_NAME)
    upsertMeta('name', 'keywords', config.keywords)
    upsertMeta('name', 'theme-color', '#0b1220')

    upsertMeta('property', 'og:title', config.title)
    upsertMeta('property', 'og:description', config.description)
    upsertMeta('property', 'og:type', config.ogType)
    upsertMeta('property', 'og:url', canonicalUrl)
    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('property', 'og:locale', 'en_US')

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', config.title)
    upsertMeta('name', 'twitter:description', config.description)

    upsertCanonical(canonicalUrl)
    upsertJsonLd(config.schema())
  }, [location.pathname])

  return null
}
