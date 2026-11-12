// Shared deterministic helpers for round 5.
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
