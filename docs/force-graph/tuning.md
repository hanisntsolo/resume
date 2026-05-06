# Tuning Reference

Every constant in the force-graph system, its location, valid range, and what changing it feels like. All values live in the `<script type="module" is:inline>` block inside `src/pages/index.astro`.

---

## Performance Budget

| Constant | Default | Range | Effect |
|---|---|---|---|
| `MAX_NODES` | `80` | 20 – 200 | Hard node cap. Above this, oldest node fades out. Lower = fewer particles, higher performance. Higher = denser graph, heavier CPU. |
| `FADE_MS` | `800` | 200 – 2000 | Duration (ms) for node fade-out. Lower = nodes vanish abruptly. Higher = ghost lingers longer. |
| `SHOCK_MS` | `700` | 200 – 1500 | Shockwave ring lifetime (ms). Lower = snappy ping. Higher = slow bloom. |

---

## Simulation Physics

### `d3.forceLink`

| Parameter | Default | Range | Effect |
|---|---|---|---|
| `.distance(78)` | 78 px | 40 – 200 | Rest length of spring links. Smaller = tightly packed graph. Larger = spread-out, airy structure. |
| `.strength(0.25)` | 0.25 | 0.05 – 1.0 | Spring stiffness. Higher = links snap more aggressively to rest length. |

### `d3.forceManyBody`

| Parameter | Default | Range | Effect |
|---|---|---|---|
| `.strength(-90)` | −90 | −20 – −300 | Node repulsion. Less negative = nodes cluster tightly. More negative = nodes explode apart. |
| `.distanceMax(240)` | 240 px | 80 – 500 | Repulsion radius. Larger = nodes "see" each other from further away and spread out more. |

### `d3.forceX` / `d3.forceY`

| Parameter | Default | Range | Effect |
|---|---|---|---|
| forceX `.strength(0.015)` | 0.015 | 0.005 – 0.08 | How strongly nodes are pulled to their flank anchor. Higher = graph clings to sides more rigidly. |
| forceY `.strength(0.006)` | 0.006 | 0.002 – 0.03 | How strongly nodes are pulled toward vertical centre. Higher = less vertical spread. |

### `d3.forceCollide`

| Parameter | Default | Range | Effect |
|---|---|---|---|
| radius `n.r + 9` | r + 9 | r + 2 – r + 20 | Minimum centre-to-centre distance. Smaller = nodes can overlap. Larger = more breathing room. |
| `.strength(0.65)` | 0.65 | 0.1 – 1.0 | Collision resolution strength. 1.0 = hard non-overlap. Lower = softer, overlapping allowed. |

### Simulation decay & target

| Parameter | Default | Range | Effect |
|---|---|---|---|
| `.alphaDecay(0.007)` | 0.007 | 0.001 – 0.05 | How fast the simulation cools. Lower = simulation stays hot (more movement) longer. D3 default is 0.0228. |
| `.alphaTarget(0.05)` | 0.05 | 0 – 0.3 | Prevents simulation from ever going cold. `0` = stops after settling. Higher = constant jitter. |
| `.velocityDecay(0.28)` | 0.28 | 0.1 – 0.7 | Friction. Lower = nodes feel slippery and overshoot. Higher = sluggish, damped. |

---

## Custom Forces

### `avoid-center` (content column avoidance)

```js
n.vx -= 0.55   // left nodes get pushed left
n.vx += 0.55   // right nodes get pushed right
```

| Value | Default | Range | Effect |
|---|---|---|---|
| Push magnitude | `0.55` | 0.1 – 2.0 | Higher = nodes flee the content column more aggressively. At > 1.5 nodes may oscillate at the boundary. |

### `bounds` (elastic walls)

```js
n.vx += (m - n.x) * 0.14    // spring back from left wall
```

| Value | Default | Range | Effect |
|---|---|---|---|
| Margin `m` | `30` px | 10 – 80 | Invisible wall inset from viewport edge. Larger = nodes stay further from edges. |
| Spring coefficient | `0.14` | 0.05 – 0.4 | Higher = harder snap back. Lower = nodes drift slightly outside before bouncing. |

### `wander` (Brownian drift)

```js
n._wa += (Math.random() - 0.5) * 0.09   // angle random-walk
n.vx  += Math.cos(n._wa) * 0.36
n.vy  += Math.sin(n._wa) * 0.36
```

| Value | Default | Range | Effect |
|---|---|---|---|
| Angle step | `0.09` rad | 0.02 – 0.4 | Lower = smooth, predictable drift. Higher = erratic, jittery motion. |
| Velocity kick | `0.36` | 0.1 – 1.5 | Higher = faster overall wandering. Too high and bounds/collide forces can't keep up. |

### `mouse` (attraction)

| Value | Default | Range | Effect |
|---|---|---|---|
| Radius | `220` px | 80 – 400 | Cursor influence range. Larger = nodes react from further away. |
| Strength `0.35` | 0.35 | 0.05 – 1.0 | Peak attraction at centre of range. Higher = nodes rush toward cursor more forcefully. |

---

## Visual Constants

### Palette

```js
const PALETTE = [
  [92, 200, 255],   // index 0 — blue   (Java, Spring Boot…)
  [61, 224, 200],   // index 1 — teal   (AWS, Docker…)
  [255, 189, 89],   // index 2 — orange (React, TypeScript…)
  [255, 111, 122],  // index 3 — pink   (CI/CD, Agile…)
  [167, 139, 250],  // index 4 — purple (DSA, Algorithms…)
]
```

To add a sixth group: append `[r, g, b]` here and add a corresponding note to `PALETTE_NOTES`.

### Node geometry

| Constant | Default | Range | Effect |
|---|---|---|---|
| Radius range `5 + rand*9` | 5–14 px | 3–30 px | Larger range = more size variety. All radii uniform → set to a constant. |
| Hover scale | `1.55×` | 1.2 – 2.5 | How much a hovered node enlarges. |
| Glow aura radius | `r + 18` | r + 5 – r + 40 | Larger = wider glow halo on hover/pin. |

### Trails

| Constant | Default | Range | Effect |
|---|---|---|---|
| Trail alpha `0.18` | 0.18 | 0.05 – 0.5 | `0.05` = very long ghost trails (~20 frames). `0.5` = almost no trails (~2 frames). |
| Trail colour | `rgba(7, 13, 25, _)` | any | Must match page background colour for seamless blending. |

### Curved links

| Constant | Default | Range | Effect |
|---|---|---|---|
| Curvature `0.18` | 0.18 | 0 – 0.6 | `0` = straight lines. `0.5` = dramatically bowed arcs. |
| Lit lineWidth | `1.6` | 0.5 – 4.0 | Width of the animated gradient stroke on hovered links. |
| Unlit lineWidth | `0.7` | 0.3 – 2.0 | Width of default edge lines. |
| Dash pattern | `[8, 6]` | any | First number = dash length, second = gap. `[4, 4]` = finer dotted. |
| Dash speed `now / 30` | ÷30 | ÷10 – ÷60 | Lower divisor = faster travelling dashes. Higher = slower. |

### Constellation lines

| Constant | Default | Range | Effect |
|---|---|---|---|
| `PROX` | `80` px | 40 – 200 | Proximity threshold. Higher = more connections drawn, denser starfield. |
| Max alpha `0.18` | 0.18 | 0.05 – 0.6 | Peak opacity of constellation lines at zero distance. |
| Line colour | `rgba(124, 188, 255, _)` | any | Hairline colour. Using a contrasting colour to the PALETTE creates separation. |
| lineWidth | `0.5` | 0.3 – 1.5 | Thicker lines = more visible constellation map, less subtle. |

### Cluster halos

| Constant | Default | Range | Effect |
|---|---|---|---|
| `shadowBlur` | `40` | 10 – 80 | Softness of the glow spread. Higher = ethereal. Lower = tight ring. |
| Shadow alpha `0.4` | 0.4 | 0.1 – 0.8 | Intensity of the colour glow. |
| Fill alpha `0.06` | 0.06 | 0.01 – 0.2 | Interior fill opacity. Higher = clearly visible region, lower = pure aura. |
| Min group size | `3` | 2 – 5 | Minimum nodes required to draw a hull. `2` = lines between pairs; `5` = only large clusters. |

### Node pulse

| Constant | Default | Range | Effect |
|---|---|---|---|
| Amplitude `0.08` | 0.08 | 0.01 – 0.25 | `±8%` radius swing. Higher = more dramatic pulsing. |
| Frequency `0.0014` | 0.0014 rad/ms | 0.0005 – 0.005 | `0.0014` ≈ 0.71 Hz (very slow breath). `0.004` ≈ 2 Hz (heartbeat). |

### Shockwaves

| Constant | Default | Range | Effect |
|---|---|---|---|
| Expansion speed `age × 0.5` | ×0.5 px/ms | ×0.2 – ×1.0 | Higher = ring expands faster and wider before fading. |
| Peak lineWidth `2.5` | 2.5 | 1.0 – 5.0 | Ring thickness at birth. |

---

## Audio Constants

| Constant | Default | Range | Effect |
|---|---|---|---|
| Throttle `80` ms | 80 | 20 – 300 | Minimum time between pings. Lower = more rapid-fire sounds. Higher = sparser audio. |
| Peak gain `0.06` | 0.06 | 0.01 – 0.2 | Master volume. WebAudio gain is linear; 0.06 is quiet-to-moderate. |
| Attack `0.015` s | 0.015 | 0.005 – 0.05 | Click transient. Very short = percussive. Longer = smoother onset. |
| Decay `0.24` s | 0.24 | 0.05 – 0.8 | Note length. Longer = more musical, shorter = more game-like. |
| Oscillator type | `'sine'` | sine, triangle, square, sawtooth | Sine = pure, clean. Triangle = slightly hollow. Square = buzzy. Sawtooth = bright/harsh. |

**Pentatonic notes (Hz):**

| Index | Note | Frequency |
|---|---|---|
| 0 | C4 | 261.63 |
| 1 | E4 | 329.63 |
| 2 | G4 | 392.00 |
| 3 | A4 | 440.00 |
| 4 | C5 | 523.25 |

To change scale, replace `PALETTE_NOTES` array with any 5 frequencies.

---

## Scroll Parallax

| Constant | Default | Range | Effect |
|---|---|---|---|
| Depth factor `-0.15` | −0.15 | −0.05 – −0.40 | Canvas drift per scrolled pixel. `-0.30` = strong parallax depth. `-0.05` = barely perceptible. |

---

## Burst Spawn

| Constant | Default | Range | Effect |
|---|---|---|---|
| Child count `3 + rand*3` | 3–5 | 1–10 | How many children spawn per click. |
| Angle jitter `±0.4` rad | 0.4 | 0 – 1.5 | `0` = perfectly radial star pattern. `1.5` = near-random scatter. |
| Spawn distance `60 + rand*50` | 60–110 px | 30–200 px | How far children land from parent. |
| Stagger `i × 60` ms | 60 ms | 0 – 300 ms | Delay between successive child spawns. `0` = instantaneous burst. |
