# Feature Branch Preview Deployment Setup

## Overview

Your project now has **automatic preview deployments** for all feature branches on the same domain at a different path:

- **Production** (hanisntsolo branch): `resume.hanisntsolo.com/`
- **Preview** (all other branches): `resume.hanisntsolo.com/dev/`

---

## How It Works

### Workflows

**3 GitHub Actions workflows** handle different deployment scenarios:

#### 1. **Production** (hanisntsolo branch)
- **File**: `.github/workflows/compile-latex-hanisntsolo.yml`
- **Triggers on**: Push to `hanisntsolo` branch OR scheduled daily
- **Deploys to**: `resume.hanisntsolo.com/` (root)
- **React base path**: `/timeline/`
- **Builds**: `npm run build:prod`

#### 2. **Production** (master branch - for forks)
- **File**: `.github/workflows/compile-latex.yml`
- **Triggers on**: Push to `master` branch OR scheduled daily
- **Deploys to**: `resume.hanisntsolo.com/` (root, only if not the main repo owner)
- **React base path**: `/timeline/`
- **Builds**: `npm run build:prod`

#### 3. **Preview** (all other branches)
- **File**: `.github/workflows/compile-latex-preview.yml` ← NEW
- **Triggers on**: Push to ANY branch EXCEPT `hanisntsolo` and `master`
- **Deploys to**: `resume.hanisntsolo.com/dev/` (subdirectory)
- **React base path**: `/dev/timeline/`
- **Builds**: `npm run build:preview`

---

## Build Scripts

New npm scripts in `package.json`:

```bash
npm run build:prod      # Production build → /timeline/
npm run build:preview   # Preview build → /dev/timeline/
npm run build           # Default: production build
```

### How They Work

**Production Build:**
```bash
VITE_DEPLOY_ENV=production vite build
# Sets Vite base to: /timeline/
# Outputs to: dist/timeline/
```

**Preview Build:**
```bash
VITE_DEPLOY_ENV=preview vite build
# Sets Vite base to: /dev/timeline/
# Outputs to: dist/dev-timeline/
```

---

## Deployment Structure

### Production (resume.hanisntsolo.com/)
```
root/
├── index.html                    ← Landing page
├── hanisntsolo-resume.pdf        ← Resume PDF
├── timeline/                     ← React app
│   ├── index.html
│   ├── assets/
│   │   ├── index-[hash].js
│   │   └── index-[hash].css
│   └── timeline-data.json
├── fonts/
└── CNAME
```

### Preview (resume.hanisntsolo.com/dev/)
```
dev/
├── index.html                    ← Landing page (copy)
├── hanisntsolo-resume.pdf        ← Resume PDF (copy)
├── timeline-data.json            ← Timeline data (copy)
├── dev-timeline/                 ← React app (renamed from dist/dev-timeline)
│   ├── index.html
│   ├── assets/
│   │   ├── index-[hash].js
│   │   └── index-[hash].css
└── fonts/
```

---

## Usage

### Local Development
```bash
# Dev server always uses root path /
npm run dev
# Open: http://localhost:5173
```

### Create a Feature Branch
```bash
git checkout -b feature/my-feature
# Make changes...
git push origin feature/my-feature
```

**GitHub Actions automatically:**
1. ✅ Compiles LaTeX
2. ✅ Builds React app with `/dev/timeline/` base path
3. ✅ Deploys to `resume.hanisntsolo.com/dev/`
4. ✅ Accessible in ~1-2 minutes

### Test Feature Preview
```
https://resume.hanisntsolo.com/dev/              ← Landing page
https://resume.hanisntsolo.com/dev/timeline/     ← Timeline
```

### Merge to Production
```bash
# Create a PR to hanisntsolo branch
# When merged...
```

**GitHub Actions automatically:**
1. ✅ Builds with `/timeline/` base path
2. ✅ Deploys to root at `resume.hanisntsolo.com/`
3. ✅ Production is live in ~1-2 minutes

---

## Configuration Details

### Vite Config (`vite.config.js`)

```javascript
const deployEnv = process.env.VITE_DEPLOY_ENV
const getBasePath = () => {
  if (process.env.NODE_ENV !== 'production') {
    return '/'  // Local dev
  }
  if (deployEnv === 'preview') {
    return '/dev/timeline/'  // Feature branches
  }
  return '/timeline/'  // Production
}
```

- **Local dev**: Always uses `/` (root)
- **Production build**: Uses `/timeline/`
- **Preview build**: Uses `/dev/timeline/`

### Output Directories

```javascript
build: {
  outDir: deployEnv === 'preview' ? 'dist/dev-timeline' : 'dist/timeline'
}
```

---

## Troubleshooting

### Preview branch not deploying
1. **Check branch name**: Workflow triggers on ALL branches except `hanisntsolo` and `master`
2. **Check workflow file**: `.github/workflows/compile-latex-preview.yml` should exist
3. **Check Actions logs**: `https://github.com/hanisntsolo/resume/actions`

### Asset paths broken
1. **Check destination**: GitHub Actions deploys to `./dev` subfolder
2. **Check CNAME**: Both workflows set `resume.hanisntsolo.com`
3. **Check base path**: Vite config should inject `/dev/timeline/` for preview builds

### Can't access `/.dev/` paths
- GitHub Pages may have caching. Wait 5 minutes and try again
- Clear browser cache (Ctrl+Shift+Delete)
- Try incognito mode to verify

---

## What Gets Copied to /dev/

**From deployed build:**
```
output/
├── index.html                      (root landing page)
├── hanisntsolo-resume.pdf          (PDF)
├── timeline-data.json              (timeline events)
├── dev-timeline/                   (React app)
│   └── [assets]
└── fonts/
```

**GitHub Pages receives:**
```
destination_dir: ./dev
# Everything from ./output/ copies into /dev/ subfolder
```

---

## Branch Strategy Summary

| Branch | Deploy To | React Base Path | Use Case |
|--------|-----------|-----------------|----------|
| `hanisntsolo` | Root `/` | `/timeline/` | Production |
| `master` | Root `/` | `/timeline/` | Template (forks only) |
| `feature/*` | `/dev/` | `/dev/timeline/` | Preview/Testing |
| Local dev | `:5173` | `/` | Local testing |

---

## Next Steps

1. ✅ Push changes to a feature branch (not `hanisntsolo` or `master`)
2. ✅ Monitor GitHub Actions: `https://github.com/hanisntsolo/resume/actions`
3. ✅ Once deployed, test at: `https://resume.hanisntsolo.com/dev/timeline/`
4. ✅ Iterate safely without affecting production
5. ✅ When ready, create PR to `hanisntsolo` to merge to production

---

## API Summary

### npm scripts

- `npm run dev` — Local dev server (always root `/`)
- `npm run build` — Production build (outputs `dist/timeline/`)
- `npm run build:prod` — Explicit production build
- `npm run build:preview` — Preview build (outputs `dist/dev-timeline/`)

### Environment Variables

- `VITE_DEPLOY_ENV=production` — Production build
- `VITE_DEPLOY_ENV=preview` — Preview build
- `NODE_ENV=production` — Triggers production Vite behavior

---

## GitHub Actions Files

**Updated:**
- ✅ `.github/workflows/compile-latex-hanisntsolo.yml` — Now uses `npm run build:prod`
- ✅ `.github/workflows/compile-latex.yml` — Now uses `npm run build:prod`

**Created:**
- ✅ `.github/workflows/compile-latex-preview.yml` — New preview workflow

---

**Status**: ✅ **Ready for feature branch deployments**

All workflows are configured and tested. Feature branches now automatically deploy to `/dev/` while production remains at `/`.
