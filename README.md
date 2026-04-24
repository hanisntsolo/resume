# Resume Timeline (Astro)

This repository now runs as an Astro static site for resume presentation, timeline browsing, SEO indexing, and AI crawler discoverability.

## What Is Included

- Astro pages for the home/resume view and timeline view.
- Built-in route metadata for SEO and social cards.
- Post-build SEO generation for:
  - sitemap.xml
  - robots.txt
  - llms.txt
- GoatCounter tracking for resume download events.

## Development

```bash
npm install
npm run dev
```

Hosted dev server:

```bash
npm run dev:host
```

## Build Commands

Production build:

```bash
npm run build
```

Preview path build (`/dev` base path):

```bash
npm run build:preview
```

## Static Assets

Important public assets are in `public/`:

- `hanisntsolo-resume.pdf`
- `hanisntsolo-cover-letter.pdf.1` (copied to canonical PDF name during post-build)
- `timeline-data.json`

## SEO + AI Discoverability

The post-build script `scripts/generate-seo-files.mjs` ensures:

- Canonical cover-letter filename in dist output.
- Sitemap generation with key pages and documents.
- Robots policy that explicitly allows major search and AI crawlers.
- `llms.txt` with canonical profile summary and links.

## Resume Source (LaTeX)

LaTeX resume files are still available in this repository (`*.tex`, `*.cls`, `publications.bib`) and can be built separately when needed.
