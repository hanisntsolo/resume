# Feature Log

All 10 enhancements implemented on the `d3-force-graph` branch. Each section documents:
- **Before** — the original state
- **What changed** — specific code modifications
- **How to extend** — concrete next steps

---

## Feature 1 — Particle Trails (Motion Blur)

### Before
`draw()` began with `ctx.clearRect(0, 0, W, H)` — a full canvas clear every frame, producing a crisp but static-looking graph with no sense of momentum.

### What changed
```js
// Before
ctx.clearRect(0, 0, W, H)

// After
if (REDUCED) {
  ctx.clearRect(0, 0, W, H)          // crisp for accessibility
} else {
  ctx.fillStyle = 'rgba(7, 13, 25, 0.18)'
  ctx.fillRect(0, 0, W, H)           // semi-transparent overlay = motion ghost
}
```
Each frame paints a near-opaque rect over the previous frame. Previous node positions bleed through with ~5–6 frames of visible ghost, creating comet-tail motion blur.

### How to extend
- **Longer tails** — decrease alpha toward `0.10` (more frames bleed through)
- **Shorter tails** — increase alpha toward `0.30`
- **Colour-matched trails** — instead of a flat fill, use `ctx.globalCompositeOperation = 'destination-in'` with a radial fade for per-node colour trails (significantly more expensive)
- **Trail toggle** — add a second button or checkbox that sets a `TRAILS = false` flag to swap back to `clearRect`

---

## Feature 2 — Curved Links

### Before
Links were straight lines drawn with `ctx.moveTo / ctx.lineTo`, making the graph look like a conventional network diagram.

### What changed
Each link stores `_sign: ((a.id ^ b.id) & 1) ? 1 : -1` at creation. The draw pass uses a quadratic Bézier with a perpendicular control point:

```js
const mx = (s.x + t.x) / 2
const my = (s.y + t.y) / 2
const px = -(t.y - s.y) * 0.18 * lk._sign
const py =  (t.x - s.x) * 0.18 * lk._sign

ctx.beginPath()
ctx.moveTo(s.x, s.y)
ctx.quadraticCurveTo(mx + px, my + py, t.x, t.y)
```

`_sign` is deterministic (XOR of IDs) so the curve direction is stable even when node positions change.

### How to extend
- **Cubic curves** — use `ctx.bezierCurveTo` with two control points for S-shaped links
- **Dynamic curvature** — scale `0.18` by link distance so short links are nearly straight and long links curve dramatically
- **Curvature by group** — vary `_sign` to always curve toward the viewport centre for a more organic layout

---

## Feature 3 — Animated Gradient Links

### Before
All links were rendered as a uniform `rgba(92,200,255, 0.07)` stroke.

### What changed
When the hovered node is an endpoint of a link, that link switches to:
1. A `linearGradient` from source node colour → target node colour
2. `setLineDash([8, 6])` dashed stroke
3. `lineDashOffset = -now / 30` — advances each frame, creating a travelling-ant effect

```js
const lit = hovNode && (s === hovNode || t === hovNode)
if (lit && !REDUCED) {
  const grad = ctx.createLinearGradient(s.x, s.y, t.x, t.y)
  grad.addColorStop(0, `rgba(${s.rgb.join(',')}, ${0.65 * am})`)
  grad.addColorStop(1, `rgba(${t.rgb.join(',')}, ${0.65 * am})`)
  ctx.strokeStyle = grad
  ctx.lineWidth = 1.6
  ctx.setLineDash([8, 6])
  ctx.lineDashOffset = dashOffset   // dashOffset = -now / 30
  ctx.stroke()
  ctx.setLineDash([])               // reset for subsequent draws
}
```

### How to extend
- **Always-animated** — remove the `lit &&` check; performance impact is low for < 80 nodes
- **Speed by velocity** — compute `speed = Math.hypot(s.vx + t.vx, s.vy + t.vy)` and multiply `now / 30` by `speed` so fast-moving links animate faster
- **Glow effect** — set `ctx.shadowColor` to the gradient midpoint colour and `ctx.shadowBlur = 8` before stroking lit links

---

## Feature 4 — Node Pulse / Breathing

### Before
Nodes were drawn at their fixed radius `n.r`, unchanging over time.

### What changed
Each node gets a `_phase: Math.random() * Math.PI * 2` on creation. The draw pass applies:

```js
const pulse = REDUCED ? 1 : (1 + 0.08 * Math.sin(now * 0.0014 + n._phase))
const r     = hov ? n.r * 1.55 : n.r * pulse
```

At 60 fps, `now` grows ~16.7 ms/frame. `0.0014 rad/ms ≈ 0.71 Hz` — a very slow breath. `_phase` offsets each node so they are never in sync.

### How to extend
- **Faster pulse** — increase `0.0014` (e.g. `0.003` ≈ 1.4 Hz for a heartbeat rhythm)
- **Larger amplitude** — increase `0.08` (e.g. `0.18` for ±18% radius swing)
- **Group-synchronised pulse** — use `n.g * (Math.PI / 5)` instead of random `_phase` so all nodes in the same group breathe together
- **Colour pulse** — also oscillate `rgb alpha` alongside radius for a luminance effect

---

## Feature 5 — Constellation Lines

### Before
Only explicit `links[]` were drawn. Nodes that happened to drift close together had no visual relationship.

### What changed
An O(n²) pass runs after the cluster halos, drawing faint hairlines between any two unlinked nodes closer than `PROX = 80 px`:

```js
const PROX = 80, PROX2 = PROX * PROX
for (let i = 0; i < nodes.length; i++) {
  const a = nodes[i]
  for (let j = i + 1; j < nodes.length; j++) {
    const b = nodes[j]
    const key = a.id < b.id ? `${a.id},${b.id}` : `${b.id},${a.id}`
    if (linkKeySet.has(key)) continue   // skip explicit links
    const dx = a.x - b.x, dy = a.y - b.y
    const d2 = dx * dx + dy * dy
    if (d2 < PROX2) {
      const alpha = 0.18 * (1 - Math.sqrt(d2) / PROX) * aMul(a) * aMul(b)
      ctx.strokeStyle = `rgba(124, 188, 255, ${alpha})`
      ctx.lineWidth = 0.5
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
    }
  }
}
```

`linkKeySet` ensures we never draw both a constellation line and a curved explicit link between the same pair.

### How to extend
- **Increase density** — raise `PROX` to `120` for a more entangled starfield look
- **Cross-group only** — add `if (a.g === b.g) continue` to highlight structural bridges between groups
- **Spatial indexing** — at > 200 nodes, replace O(n²) with a d3-quadtree `.visit()` pass for better performance
- **Animated opacity** — modulate `alpha` with `Math.sin(now * 0.001 + a._phase)` for shimmering connections

---

## Feature 6 — Cluster Halos

### Before
Nodes of the same group had no visual grouping — their colour was the only indicator.

### What changed
The render pass uses `d3.polygonHull` to compute the convex hull of each group's node positions and fills it with a translucent, deeply-blurred polygon:

```js
const hull = d3.polygonHull(pts)   // pts = [[n.x, n.y], ...]
ctx.shadowBlur = 40
ctx.shadowColor = `rgba(${r},${gC},${b}, 0.4)`
ctx.fillStyle   = `rgba(${r},${gC},${b}, 0.06)`
ctx.fill()
```

Groups with fewer than 3 nodes are skipped (hull algorithm requires ≥ 3 points). Fading nodes are excluded from hull calculation to avoid visual popping.

### How to extend
- **Stroke outline** — add `ctx.strokeStyle = rgba(r,g,b,0.15); ctx.lineWidth=1; ctx.stroke()` after `fill()` for a visible border
- **Concave hulls** — replace convex hull with a D3 contour / alpha-shape for more organic group boundaries (requires additional geometry work)
- **Animated fill** — oscillate fill alpha with `0.04 + 0.03 * Math.sin(now * 0.0008 + g)` for group-specific breathing
- **Label per group** — compute centroid of hull and draw a faint group name in large, low-opacity text behind the nodes

---

## Feature 7 — Burst Spawn + Shockwaves

### Before
Clicking a node spawned a single child at a random angle.

### What changed

**`burstFrom(parent)`** — spawns N = 3–5 children radially with staggered timing:

```js
const burstFrom = (parent) => {
  const N = 3 + Math.floor(Math.random() * 3)
  const baseAngle = Math.random() * Math.PI * 2
  emitShock(parent.x, parent.y, parent.rgb)   // trigger ripple
  for (let i = 0; i < N; i++) {
    const angle = baseAngle + (i * 2 * Math.PI) / N + (Math.random() - 0.5) * 0.4
    const dist  = 60 + Math.random() * 50
    setTimeout(() => spawnNode(parent.x + cos×dist, parent.y + sin×dist, parent), i * 60)
  }
}
```

**Shockwaves** — expanding ring drawn on top of all other layers:

```js
const SHOCK_MS = 700
const emitShock = (x, y, rgb) => shockwaves.push({ x, y, rgb, t0: time() })

// In draw(), layer 7:
const k = age / SHOCK_MS
ctx.arc(w.x, w.y, age * 0.5, 0, 2 * Math.PI)
ctx.strokeStyle = `rgba(${w.rgb.join(',')}, ${1 - k})`
ctx.lineWidth   = 2.5 * (1 - k)
```

Empty-space clicks also emit a shockwave at the click point before spawning the free node.

### How to extend
- **Secondary burst** — trigger `burstFrom` on spawned children after a delay for recursive fractal-like expansion
- **Burst size by node size** — map `n.r` to `N`: `const N = 2 + Math.floor(n.r / 4)` for big nodes producing more children
- **Multiple rings** — call `emitShock` 3× with 80 ms stagger and different rgb for concentric rainbow rings
- **Implosion** — on double-click, emit a shockwave that shrinks inward by starting at large radius and contracting (`age × -0.5 + SHOCK_MS * 0.5`)

---

## Feature 8 — Scroll Parallax

### Before
The canvas was `position: fixed` and did not respond to page scroll at all.

### What changed
A passive scroll listener applies a `translate3d` on the canvas element, offset at −15% of scroll position:

```js
let scrollRaf = false
window.addEventListener('scroll', () => {
  if (scrollRaf) return
  scrollRaf = true
  requestAnimationFrame(() => {
    const off = window.scrollY * -0.15
    canvas.style.transform = `translate3d(0, ${off}px, 0)`
    scrollRaf = false
  })
}, { passive: true })
```

`translate3d` forces GPU compositing, so the canvas layer moves without triggering a canvas repaint.

### How to extend
- **Stronger parallax** — change `-0.15` to `-0.25` or `-0.30`
- **Per-node depth** — store `n.depth = 0.8 + Math.random() * 0.4` on each node and scale `vx/vy` in `draw()` by that depth to simulate different Z layers moving at different scroll speeds (requires manual parallax in draw rather than CSS transform)
- **Horizontal drift** — add `window.addEventListener('deviceorientation', ...)` and tilt the canvas horizontally based on `event.gamma` for mobile

---

## Feature 9 — Reduced-Motion + Performance Budget

### Before
The simulation ran at maximum intensity regardless of user preferences or device capability. No node cap was enforced.

### What changed

**Reduced-motion detection:**
```js
const REDUCED = window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

Effects disabled when `REDUCED = true`:
- Wander force (entire `sim.force('wander', ...)` block skipped)
- Trail fill (cleared to crisp black instead)
- Cluster halos (full layer skipped)
- Constellation lines (full layer skipped)
- Node pulse (factor fixed at `1`)
- `alphaTarget` set to `0` (simulation stops when settled)

**Performance budget:**
```js
const MAX_NODES = 80
const FADE_MS   = 800

// In spawnNode():
if (nodes.length > MAX_NODES) {
  // find oldest non-pinned, non-fading node
  oldest._fadeStart = time()   // begin graceful fade-out
}
```

`aMul(n)` linearly interpolates alpha from 1 → 0 over `FADE_MS`. The `draw()` GC pass splices the node and all its links once the fade completes.

### How to extend
- **Dynamic budget** — measure `performance.now()` at the start and end of `draw()` and reduce `MAX_NODES` automatically if a frame takes > 12 ms
- **`prefers-reduced-data`** — additionally detect the [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation) and disable audio on slow connections
- **Level-of-detail** — skip constellation + halos when `nodes.length > 60` even without `REDUCED`, using only the cheaper layers

---

## Feature 10 — Audio Toggle

### Before
No audio. The graph was entirely visual.

### What changed

A `<button id="graph-audio-toggle">♪</button>` is added to the bottom-left of the page. Clicking it:
1. Lazily creates an `AudioContext` (satisfying browser autoplay policy)
2. Resumes the context if it was auto-suspended
3. Toggles `audioOn` and persists to `localStorage.graphAudio`

**`playPing(paletteIdx, vel)`** synthesises a short sine-wave ping:

```js
const t = audioCtx.currentTime
const osc  = audioCtx.createOscillator()
const gain = audioCtx.createGain()
osc.type = 'sine'
osc.frequency.value = PALETTE_NOTES[paletteIdx % PALETTE_NOTES.length]
gain.gain.setValueAtTime(0, t)
gain.gain.linearRampToValueAtTime(0.06 * vel, t + 0.015)
gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.24)
osc.connect(gain).connect(audioCtx.destination)
osc.start(t); osc.stop(t + 0.26)
```

**Call sites and velocities:**
| Event | Call | Velocity |
|---|---|---|
| Node spawned | `playPing(g, 0.7)` | 0.7 |
| Node hovered (new) | `playPing(hovNode.g, 0.4)` | 0.4 (quiet) |
| Audio turned on | `playPing(1, 0.8)` | 0.8 (confirmation) |

**Global throttle:** 80 ms minimum between any two pings prevents audio stacking during rapid bursts.

### How to extend
- **Reverb** — create a `ConvolverNode` with an impulse response buffer for a room-reverb effect on spawn pings
- **Chord on burst** — in `burstFrom`, call `playPing` with the parent's `g` and 2–3 additional notes (stacked semitones) for a chord
- **Spatial audio** — use `PannerNode` with `setPosition(n.x / W * 2 - 1, ...)` so left-side nodes sound left and right-side nodes sound right
- **Scale change** — replace `PALETTE_NOTES` with a different scale array (e.g. `[220, 246.94, 277.18, 311.13, 369.99]` for A-minor pentatonic) for a darker mood
