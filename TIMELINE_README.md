# Resume Timeline - Development Guide

## Overview

This project now includes an interactive **React-based Timeline** that showcases your work experience, projects, and professional milestones alongside the traditional LaTeX resume.

### Project Structure

```
.
├── index.html                    # Landing page (resume entry point)
├── hanisntsolo-resume.tex       # LaTeX resume source
├── hanisntsolo-resume.cls       # LaTeX style class
├── timeline-data.json           # Centralized timeline event data
├── package.json                 # React dependencies
├── vite.config.js               # Vite build configuration
├── public/
│   └── index.html               # HTML template for React app
├── src/
│   ├── main.jsx                 # React entry point
│   ├── App.jsx                  # Root React component
│   ├── pages/
│   │   └── Timeline.jsx         # Main timeline page
│   ├── components/
│   │   ├── FilterBar.jsx        # Filter UI
│   │   ├── TimelineEvent.jsx    # Event card component
│   │   └── TimelineVisualization.jsx  # Timeline visualization
│   └── styles/
│       └── timeline.css         # Timeline styling & animations
├── output/                      # Build output (generated)
│   ├── index.html               # Landing page
│   ├── hanisntsolo-resume.pdf   # Compiled PDF
│   └── timeline/                # React app build
│       ├── index.html
│       └── assets/
└── .github/workflows/           # CI/CD pipelines (updated for React)
```

## Local Development

### Prerequisites

- **Node.js** 18+ and npm (or yarn)
- **LaTeX** (XeLaTeX) - for PDF compilation
  - macOS: `brew install mactex`
  - Ubuntu/Debian: `sudo apt install texlive-xetex texlive-fonts-recommended texlive-latex-extra`
  - Windows: Download [MiKTeX](https://miktex.org/) or [TeX Live](https://www.tug.org/texlive/)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Verify installations:**
   ```bash
   npm --version
   xelatex --version
   ```

### Development Workflow

You can run both builds independently in separate terminals:

#### Option A: React Development Server (with hot reload)
```bash
npm run dev
```
- Opens at `http://localhost:5173`
- Hot Module Replacement (HMR) enabled
- Changes to React code reload instantly in browser

#### Option B: Build React for production
```bash
npm run build
```
- Generates optimized build in `dist/timeline/`
- No development server; use a static HTTP server to test

#### Option C: LaTeX PDF compilation
```bash
# Using latexmk (recommended)
latexmk -xelatex -output-directory=output hanisntsolo-resume.tex

# Or direct xelatex
xelatex -output-directory=output hanisntsolo-resume.tex
```

### Local Testing

To test both builds locally as they'll be deployed:

```bash
# Build both assets
npm run build
latexmk -xelatex -output-directory=output hanisntsolo-resume.tex

# Create the combined output directory (simulating GitHub Pages output)
mkdir -p local-output
cp index.html local-output/
cp output/hanisntsolo-resume.pdf local-output/
cp -r dist/timeline local-output/

# Serve locally
cd local-output
python3 -m http.server 8000
```

Open `http://localhost:8000` to test:
- Landing page at `/`
- Timeline at `/timeline/`
- PDF download at `/hanisntsolo-resume.pdf`

### Timeline Data

Timeline events are defined in **[timeline-data.json](timeline-data.json)**. The format:

```json
{
  "events": [
    {
      "id": "unique-event-id",
      "date": "YYYY-MM",           // ISO format, required
      "endDate": "YYYY-MM",        // Optional; use with "present" for current roles
      "type": "job|project|milestone",  // Event category
      "title": "Event Title",
      "company": "Company Name",   // Optional
      "description": "Description",
      "tags": ["job", "current"],  // Tags for filtering
      "technologies": ["Tech1", "Tech2"],  // Tech stack
      "url": "https://..."         // Optional link
    }
  ]
}
```

**Event Types:**
- `job` — Work experience
- `project` — Side projects, open-source, portfolio work
- `milestone` — Learning achievements, certifications, domain mastery

**To add a new event:**
1. Edit `timeline-data.json`
2. Add a new object to the `events` array
3. Rebuild: `npm run build` (or automatically on next push)

## Deployment

### Automatic (GitHub Actions)

When you push to the configured branch, GitHub Actions:

1. Compiles LaTeX to PDF
2. Installs Node dependencies
3. Builds React app with Vite
4. Copies everything to `output/` directory:
   ```
   output/
   ├── index.html (landing page)
   ├── hanisntsolo-resume.pdf
   ├── timeline/
   │   ├── index.html (React app)
   │   └── assets/
   └── CNAME
   ```
5. Deploys to GitHub Pages

### Manual (Local)

If you need to deploy manually:

```bash
# Build everything
npm run build
latexmk -xelatex -output-directory=output hanisntsolo-resume.tex

# Verify output directory has both assets
ls output/
# Should see: index.html, hanisntsolo-resume.pdf, timeline/, fonts/, etc.

# Push to your configured GitHub Pages branch
git add .
git commit -m "Build static assets"
git push
```

## Architecture & Design Decisions

### Why Separate React App?

- **Isolated build pipeline**: React uses Vite (fast, modern bundler)
- **LaTeX pipeline unchanged**: Your resume PDF generation is unaffected
- **Independent deployments**: Can update timeline without rebuilding PDF
- **Better performance**: React app is code-split and optimized
- **Scalability**: Easy to add more React features in future

### Why Vite?

- **Fast development**: Hot reload, instant feedback
- **Small bundle**: Optimized production builds (typically ~50-80KB gzipped for this app)
- **No eject trap**: Configuration is straightforward
- **Modern tooling**: ES modules, CSS preprocessing, etc.

### Data Strategy

- **Single source of truth**: `timeline-data.json` is version-controlled
- **Flexible maintenance**: Update manually, or later automate with a script that parses `hanisntsolo-resume.tex`
- **Decoupled systems**: LaTeX doesn't depend on JSON; JSON is additive enrichment

## Styling & Customization

### Theme Colors

Edit CSS variables in `src/styles/timeline.css`:

```css
:root {
  --bg: #0b1220;              /* Background */
  --card: #121a2b;            /* Card background */
  --text: #e8edf7;            /* Text color */
  --muted: #9fb0cf;           /* Muted text */
  --accent: #5eead4;          /* Accent (teal) */
  --accent-2: #60a5fa;        /* Secondary accent (blue) */
  --color-job: #60a5fa;       /* Job event color */
  --color-project: #5eead4;   /* Project event color */
  --color-milestone: #f59e0b; /* Milestone event color */
}
```

### Responsive Design

Timeline is fully responsive:
- **Desktop** (>768px): Full layout with details
- **Mobile** (<768px): Optimized for touch, condensed details
- **Small mobile** (<480px): Single-column, icon-only filters

### Animations

Events animate in staggered on page load. Disable by modifying `animation` rules in `timeline.css`.

## Troubleshooting

### `npm install` fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Vite dev server doesn't start

```bash
# Check if port 5173 is in use
lsof -i :5173
# Kill process if needed: kill -9 <PID>

# Try a different port
npm run dev -- --port 5174
```

### React timeline not appearing after deployment

- Verify `dist/timeline/` exists locally: `npm run build && ls -la dist/timeline/`
- Check GitHub Actions workflow logs for build errors
- Verify GitHub Pages is pointing to `./output` directory
- Check browser console for asset loading errors (should be relative to `/timeline/`)

### Timeline data not loading

- Verify `timeline-data.json` is in the project root
- Check browser Network tab for failed requests
- Ensure JSON is valid: `npx jsonlint timeline-data.json`

## Performance

- **Lighthouse**: Targeting 90+ scores across all metrics
- **Bundle size**: ~60-80KB gzipped (React + dependencies)
- **Data size**: ~10KB for timeline JSON
- **Load time**: <2s on 4G, <500ms on desktop

## Future Enhancements

1. **Auto-generation**: Parse `hanisntsolo-resume.tex` to auto-generate `timeline-data.json`
2. **Search**: Add text search across timeline events
3. **Export**: Export timeline as PDF or image
4. **Analytics**: Track which timeline sections are viewed most
5. **Themes**: Dark/light mode toggle
6. **Mobile optimizations**: Gesture-based filtering, swipe navigation

## CI/CD Integration

Both workflows (master and hanisntsolo branches) now:

1. Compile LaTeX to PDF (unchanged)
2. Install npm dependencies (new)
3. Build React timeline (new)
4. Copy React build to output/timeline/ (new)
5. Deploy everything to GitHub Pages (unchanged)

See `.github/workflows/compile-latex*.yml` for details.

## Questions?

For issues or feature requests, see the main [README.md](README.md) and [PROJECT_ENHANCEMENTS.md](PROJECT_ENHANCEMENTS.md).
