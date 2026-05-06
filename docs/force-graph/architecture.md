# Architecture

Deep-dive into how the force-graph system is structured, from data representation to the pixel-by-pixel render pipeline.

---

## 1. Data Model

### Node

```js
{
  id:         Number,          // auto-increment uid
  label:      String,          // skill / concept text
  g:          Number (0-4),    // palette / group index
  side:       'left'|'right',  // which viewport flank to anchor to
  rgb:        [r, g, b],       // resolved from PALETTE[g]
  r:          Number,          // base radius (5–14 px)
  x, y:       Number,          // current position (mutated by sim)
  vx, vy:     Number,          // current velocity (mutated by sim)
  fx, fy:     Number|null,     // fixed-position override (null = free)

  // Lifecycle fields
  _birth:     Number,          // performance.now() at creation — used for FIFO eviction
  _phase:     Number,          // random [0, 2π] — per-node pulse phase offset
  _fadeStart: Number,          // 0 = alive; performance.now() when eviction begins
  _wa:        Number,          // wander angle (radians) — slowly random-walks each tick
}
```

### Link

```js
{
  source: Node,    // D3 replaces string id with object reference after sim.nodes()
  target: Node,
  _sign:  1|-1,   // deterministic curve direction: ((a.id ^ b.id) & 1) ? 1 : -1
}
```

`_sign` makes each link curve in a fixed direction regardless of render order, so links never flip.

### linkKeySet

A `Set<string>` of `"minId,maxId"` strings. Rebuilt whenever a node/link is added. Used by the constellation-lines pass to skip pairs that already have an explicit link, avoiding visual double-lines.

---

## 2. Simulation Forces

Forces are applied by `d3.forceSimulation` in the order they are registered. Each tick calls all forces, then calls `draw()`.

| Force name | Type | Purpose |
|---|---|---|
| `link` | `forceLink` | Spring attraction along explicit edges; distance 78 px, strength 0.25 |
| `charge` | `forceManyBody` | Repulsion between all nodes; strength −90, max distance 240 px |
| `x` | `forceX` | Horizontal anchor pulling each node toward its flank anchor point; strength 0.015 |
| `y` | `forceY` | Vertical centering at 50% viewport height; strength 0.006 |
| `collide` | `forceCollide` | Hard collision prevention; radius = node.r + 9, strength 0.65 |
| `avoid-center` | custom | Soft nudge away from content column: `vx ± 0.55` if node drifts into content zone |
| `bounds` | custom | Elastic walls: spring back from 30 px margin; coefficient 0.14 |
| `wander` | custom | Brownian drift: `_wa` angle random-walks by ±0.09 rad/tick; `vx/vy += cos/sin(_wa) × 0.36` |
| `mouse` | custom | Attraction to cursor within 220 px radius; strength falls off linearly; skips `dragNode` |

**Simulation parameters**

```js
alphaDecay:    0.007   // very slow cool-down — keeps graph alive indefinitely
alphaTarget:   0.05    // non-zero idle target — prevents simulation from sleeping
velocityDecay: 0.28    // moderate friction — nodes feel weighty but still fluid
```

### Content-column geometry

```
┌────────────────────────────────────────┐
│ left flank │    content column    │ right flank │
│ ◄─────────►│◄──min(1140,92vw)───►│◄────────────►│
│ leftAnchor │ contentLeft          contentRight │ rightAnchor │
└────────────────────────────────────────┘
```

`leftAnchor()` and `rightAnchor()` are the target X positions for `forceX`. They sit in the middle of each flank band.

---

## 3. Node Lifecycle

```
makeNode()
   │
   ▼
nodes[] push
   │
   ├─ normal life: x/y/vx/vy evolve each tick
   │
   ├─ pin: fx/fy set on mousedown / at drag-end / on click (keeps position)
   │        double-click → fx=fy=null (releases pin)
   │
   └─ eviction: when nodes.length > MAX_NODES (80)
         oldest non-pinned, non-fading node gets _fadeStart = now
         aMul(n) linearly ramps to 0 over FADE_MS (800 ms)
         draw() GC pass splices node + its links when _fadeStart + FADE_MS < now
```

---

## 4. Render Pipeline

`draw()` is called on every simulation tick. Six layers paint in Z order:

```
Layer 1  Trail fill
         ├─ REDUCED=true  → clearRect(full canvas)          crisp, no trails
         └─ REDUCED=false → fillRect rgba(7,13,25, 0.18)    motion-blur ghosts

Layer 2  GC dying nodes
         Splice nodes / links where _fadeStart + FADE_MS < now
         Rebuild sim state only if nodes._dirty

Layer 3  Cluster halos  [skipped in REDUCED]
         d3.polygonHull per group (≥ 3 live members)
         shadowBlur=40, fill rgba(r,g,b, 0.06), stroke none

Layer 4  Constellation lines  [skipped in REDUCED]
         O(n²) pair scan, skip pairs in linkKeySet
         Draws if sqrt(d²) < PROX (80 px)
         Opacity: 0.18 × (1 − dist/PROX) × aMul(a) × aMul(b)

Layer 5  Explicit curved links
         quadraticCurveTo — control point = midpoint + perpendicular × 0.18 × _sign
         Lit link (hovNode is endpoint):
           linearGradient source→target colour
           setLineDash([8,6]) + animated lineDashOffset = −now/30
         Unlit link:
           rgba(92,200,255, 0.07 × am)

Layer 6  Nodes
         per node:
           aMul(n) = fade alpha multiplier
           pulse   = 1 + 0.08 × sin(now×0.0014 + _phase)   [skipped in REDUCED]
           r_draw  = hovNode ? r×1.55 : r×pulse
           radial gradient glow aura if hov || pinned
           circle fill (solid if hov, teal if pinned, translucent otherwise)
           circle stroke (bright if hov/pinned)
           teal centre dot if pinned
           label text if hov || r > 9

Layer 7  Shockwaves
         Expanding rings: radius = age × 0.5, lifetime SHOCK_MS (700 ms)
         strokeStyle rgba(rgb, 1−k), lineWidth 2.5×(1−k) where k = age/SHOCK_MS
```

---

## 5. Event Model

The canvas has `pointer-events: none`. All interaction is captured on `window`.

```
mousemove  → update mx/my, hitTest for hovNode, hover-ping debounce, drag update
mousedown  → hitTest; if hit: set dragNode, pin, alphaTarget 0.3
mouseup    → if dragNode + no move: burstFrom(dragNode)
             if dragNode + moved:   keep pinned at drop
             if no dragNode:        spawn free node at empty-space click + emitShock
dblclick   → hitTest; if hit: unpin (fx=fy=null)
mouseleave → reset mx/my, hovNode, dragNode, cursor
resize     → update W/H, canvas dimensions, reapply forceX/forceY
scroll     → rAF-throttled translate3d(0, scrollY × −0.15, 0) on canvas
```

---

## 6. Audio System

- **Lazy init** — `AudioContext` created only on first toggle-button click (satisfies browser autoplay policy)
- **`playPing(paletteIdx, vel)`** — creates a fresh `OscillatorNode` + `GainNode` per ping, connects, starts, and auto-stops at +0.26 s. No pooling needed — nodes are GC'd by the browser
- **Global throttle** — 80 ms minimum between pings prevents audio stacking
- **Envelope** — `linearRampToValueAtTime(0.06 × vel, t+0.015)` attack → `exponentialRampToValueAtTime(0.0001, t+0.24)` decay
- **Notes** — C-major pentatonic: C4 261.63 Hz, E4 329.63, G4 392.0, A4 440.0, C5 523.25
- **Persistence** — `localStorage.graphAudio` = `'on'` | `'off'`

---

## 7. Accessibility & Performance

| Concern | Mechanism |
|---|---|
| Reduced motion | `window.matchMedia('(prefers-reduced-motion: reduce)').matches` → `REDUCED` flag |
| Effects gated | Wander, trails, halos, constellation, node pulse all skipped when `REDUCED` |
| Canvas opacity | CSS `@media (prefers-reduced-motion: reduce) { #force-graph-bg { opacity: 0.55 } }` |
| Node cap | `MAX_NODES = 80` — FIFO fade-eviction prevents unbounded growth |
| Fade duration | `FADE_MS = 800` ms — graceful exit animation, not abrupt removal |
| Passive listeners | All scroll/resize/mousemove listeners use `{ passive: true }` |
| Content coverage | Canvas is `z-index: 0`, content is `z-index: 1`; canvas is `pointer-events: none` |
| aria | `<canvas aria-hidden="true">` — decorative, excluded from accessibility tree |
