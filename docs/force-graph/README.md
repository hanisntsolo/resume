# Force-Graph Background System

An interactive, physics-driven D3 force-directed graph rendered on a full-viewport HTML5 Canvas, used as the animated background of the portfolio landing page.

---

## At a Glance

| Dimension | Value |
|---|---|
| Renderer | HTML5 Canvas 2D API |
| Physics engine | D3 v7 `forceSimulation` (ESM from CDN) |
| Entry point | `src/pages/index.astro` — `<script type="module" is:inline>` |
| Canvas element | `<canvas id="force-graph-bg">` — `position:fixed`, `z-index:0`, `pointer-events:none` |
| Max live nodes | 80 (FIFO fade-eviction above threshold) |
| Render layers | 6 (trails → halos → constellation → links → nodes → shockwaves) |
| Accessibility | `prefers-reduced-motion` gates trails, halos, constellation, pulse, wander |
| Audio | Opt-in via `♪` button — WebAudio pentatonic pings, `localStorage`-persisted |

---

## Features Summary

1. **Particle Trails** — semi-transparent fill (`rgba(7,13,25, 0.18)`) creates motion-blur ghost tails  
2. **Curved Links** — `quadraticCurveTo` with deterministic perpendicular offset per link pair  
3. **Animated Gradient Links** — hovered node's edges glow with a travelling dash animation  
4. **Node Pulse / Breathing** — sinusoidal radius oscillation (`±8 %`, 0.7 Hz) per-node phase-offset  
5. **Constellation Lines** — proximity hairlines between unlinked nodes within 80 px  
6. **Cluster Halos** — `d3.polygonHull` convex-hull glow around same-group nodes (≥ 3 members)  
7. **Burst Spawn + Shockwaves** — clicking a node emits 3–5 staggered children + expanding ring ripple  
8. **Scroll Parallax** — canvas drifts at `−0.15×` scroll offset via `translate3d`, rAF-throttled  
9. **Reduced-Motion + Perf Budget** — `REDUCED` flag disables heavy effects; `MAX_NODES = 80` with graceful FIFO fade  
10. **Audio Toggle** — bottom-left `♪` button, lazy `AudioContext`, C-major pentatonic per palette colour  

---

## Quick Navigation

| Document | Purpose |
|---|---|
| [architecture.md](./architecture.md) | Data model, simulation forces, render pipeline |
| [features.md](./features.md) | All 10 features: original state → change made → extension guide |
| [tuning.md](./tuning.md) | Every constant with valid ranges and observed effects |

---

## Running Locally

```bash
npm run dev          # Astro dev server → http://localhost:4321/
npm run build        # Production build → output/
```

The graph code is inlined into the Astro page — no separate bundle step needed. Changes to `src/pages/index.astro` hot-reload instantly.

---

## Repository Context

```
src/pages/index.astro        ← all graph code lives here (script block)
src/styles/site.css          ← canvas + audio-toggle CSS overrides
public/                      ← static assets (no graph assets needed)
```

Branch: `d3-force-graph`
