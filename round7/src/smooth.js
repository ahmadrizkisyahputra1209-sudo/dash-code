// Shared deterministic helpers for round 7.
// Pure code — no AI assets. No Math.random anywhere (deterministic per frame).
export function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp01 = (v) => Math.max(0, Math.min(1, v));

// Smoothstep 0..1 (eased). Use for rise/fall edges of envelopes.
export const smoothstep = (t) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

export const easeOutCubic = (t) => 1 - Math.pow(1 - clamp01(t), 3);

// Deterministic 1D value noise (hash lattice + smootherstep). Frame is the
// time axis — never Math.random, so every frame renders identically.
export function hash1(n) {
  const h = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return h - Math.floor(h);
}
export function valueNoise1D(x) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * f * (f * (f * 6 - 15) + 10);
  return hash1(i) * (1 - u) + hash1(i + 1) * u;
}
export function fbm1D(x) {
  return 0.6 * valueNoise1D(x) + 0.3 * valueNoise1D(x * 2.13 + 7.7) + 0.15 * valueNoise1D(x * 4.31 + 3.1);
}

// n-point star polygon (2n vertices, alternating radii).
export function starPoints(cx, cy, R, r, n = 8) {
  const pts = [];
  for (let k = 0; k < 2 * n; k++) {
    const ang = -Math.PI / 2 + (k * Math.PI) / n;
    const rad = k % 2 === 0 ? R : r;
    pts.push(`${(cx + rad * Math.cos(ang)).toFixed(1)},${(cy + rad * Math.sin(ang)).toFixed(1)}`);
  }
  return pts.join(' ');
}

// n-point star as an SVG path "d" string (for evolvePath draw-on).
export function starPath(cx, cy, R, r, n = 8) {
  const pts = [];
  for (let k = 0; k < 2 * n; k++) {
    const ang = -Math.PI / 2 + (k * Math.PI) / n;
    const rad = k % 2 === 0 ? R : r;
    pts.push(`${(cx + rad * Math.cos(ang)).toFixed(1)} ${(cy + rad * Math.sin(ang)).toFixed(1)}`);
  }
  return `M${pts[0]} L${pts.slice(1).join(' L')} Z`;
}

// Full circle as an SVG path "d" string (for evolvePath / getPointAtLength).
export function circlePath(cx, cy, r) {
  return `M${(cx + r).toFixed(1)} ${cy.toFixed(1)} A${r} ${r} 0 1 1 ${(cx - r).toFixed(1)} ${cy.toFixed(1)} A${r} ${r} 0 1 1 ${(cx + r).toFixed(1)} ${cy.toFixed(1)}`;
}

// Arc segment as an SVG path "d" string, from angle a0 to a1 (radians).
export function arcPath(cx, cy, r, a0, a1) {
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
}

export function sparklePoints(cx, cy, s) {
  return [
    `${cx},${cy - s}`,
    `${cx + s * 0.25},${cy - s * 0.25}`,
    `${cx + s},${cy}`,
    `${cx + s * 0.25},${cy + s * 0.25}`,
    `${cx},${cy + s}`,
    `${cx - s * 0.25},${cy + s * 0.25}`,
    `${cx - s},${cy}`,
    `${cx - s * 0.25},${cy - s * 0.25}`,
  ].join(' ');
}

// Velocity-based smear: stretch along the direction of travel, conserving
// volume (scaleX * scaleY = 1). speed in px/frame; k tunes the effect.
export function smearFromSpeed(speed, k = 0.02, maxStretch = 1.6) {
  const stretch = Math.min(maxStretch, 1 + Math.abs(speed) * k);
  return {scaleY: stretch, scaleX: 1 / stretch};
}

// Triangle wave 0..period/2..0, period in frames. Feeding its output to
// spring() gives a LOOPING spring motion: it rises and falls and returns to
// the start value, seamless over 300 frames when period divides 300
// (periods 50/60/75/100/150 all divide 300).
export const triWave = (frame, period) => {
  const t = ((frame % period) + period) % period;
  return t < period / 2 ? t : period - t;
};

// One full sine cycle over the loop. p = frame / durationInFrames.
// sin(2*PI*k*p) is 0 at p=0 and ~0 at p=1, so motion driven by cyc is seamless.
export const cyc = (p, k = 1, ph = 0) => Math.sin(2 * Math.PI * k * p + ph);

// Smooth 0..1..0 envelope over the loop (0 at p=0 and p=1, 1 at p=0.5).
// Use for elements that appear and disappear once per loop.
export const env = (p, ph = 0) => 0.5 - 0.5 * Math.cos(2 * Math.PI * p + ph);

// --- Round 6/7 loop-safe event helpers (RenderComp rules) ---

// Event envelope in p-units: 0 before start, smooth rise, hold, smooth fall
// back to 0 by start+rise+hold+fall (must be <= 1). value(0) = value(1) = 0.
export const eventEnv = (p, start, rise, hold, fall) => {
  if (p < start) return 0;
  if (p < start + rise) return smoothstep((p - start) / rise);
  if (p < start + rise + hold) return 1;
  if (p < start + rise + hold + fall) return 1 - smoothstep((p - start - rise - hold) / fall);
  return 0;
};

// Fade-out in the last 15 frames (f285-300): 1 until f285, 0 at f300.
// Multiply every counted-up / appeared element's opacity by this so that
// f300 matches the empty f0. (CORRECTED count-up rule — never reverse.)
export const fadeOutEnd = (frame) => 1 - smoothstep((frame - 285) / 15);

// Count-up progress: 0 at startF, 1 at endF (ease-out), stays 1 after.
// Pair with fadeOutEnd on opacity for the corrected loop.
export const countProg = (frame, startF, endF) => easeOutCubic((frame - startF) / (endF - startF));

// Fade-in over the first `frames` frames (0 at f0, 1 at f`frames`).
export const fadeIn = (frame, frames = 12) => smoothstep(frame / frames);
