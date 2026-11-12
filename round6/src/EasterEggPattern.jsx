import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {cyc, mulberry32, smoothstep} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 4. EASTER EGG PATTERN — pastel decorated eggs on a soft pattern.
// Palette 60% #D8EFE3 soft mint / 30% #F6C6D8 pastel pink / 10% #B8A9E8
// lavender (+ white neutral). Eggs pop in staggered 2 frames apart
// (Premium, no overshoot), then rotate slowly in full integer turns
// (k=+1 / -1, seamless). Pattern drifts via circular noise (radius 0.5).
// Pop scale is multiplied by the f285-300 fade so scale(300) = scale(0) = 0.
// Frame 0: mint background + drifting dots already visible (not empty).
const EGGS = [
  {x: 420, y: 360, k: 1, ph: 0, fill: '#F6C6D8', band: '#B8A9E8'},
  {x: 960, y: 360, k: -1, ph: 1.2, fill: '#B8A9E8', band: '#FFFFFF'},
  {x: 1500, y: 360, k: 1, ph: 2.4, fill: '#FFFFFF', band: '#F6C6D8'},
  {x: 420, y: 740, k: -1, ph: 3.1, fill: '#FFFFFF', band: '#B8A9E8'},
  {x: 960, y: 740, k: 1, ph: 4.0, fill: '#F6C6D8', band: '#FFFFFF'},
  {x: 1500, y: 740, k: -1, ph: 5.2, fill: '#B8A9E8', band: '#F6C6D8'},
];

export const EasterEggPattern = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  const dots = useMemo(() => {
    const rand = mulberry32(44);
    return Array.from({length: 70}, () => ({
      x: rand() * 1920,
      y: rand() * 1080,
      r: 3 + rand() * 6,
      c: rand() > 0.5 ? '#F6C6D8' : '#B8A9E8',
    }));
  }, []);

  const driftX = Math.cos(2 * Math.PI * p) * 10;
  const driftY = Math.sin(2 * Math.PI * p) * 10;

  return (
    <AbsoluteFill style={{backgroundColor: '#D8EFE3', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #E4F5EC 0%, #D8EFE3 55%, #C8E8D8 100%)',
          }}
        />
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {/* drifting dot pattern */}
          <g transform={`translate(${driftX.toFixed(1)} ${driftY.toFixed(1)})`}>
            {dots.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.c} opacity={0.35} />
            ))}
          </g>
          {EGGS.map((e, i) => {
            const startF = 15 + i * 2;
            const pop = interpolate(frame, [startF, startF + 18], [0, 1], {
              easing: Easing.bezier(0.4, 0, 0.2, 1),
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const scale = pop * (1 - smoothstep((frame - 285) / 15));
            const rot = p * 360 * e.k;
            const bob = 8 * cyc(p, 1, e.ph);
            return (
              <g
                key={i}
                transform={`translate(${e.x} ${(e.y + bob).toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${scale.toFixed(3)})`}
              >
                {/* contact shadow */}
                <ellipse cx={0} cy={158} rx={86} ry={12} fill="#000000" opacity={0.1} />
                <clipPath id={`eggClip${i}`}>
                  <ellipse rx={110} ry={150} />
                </clipPath>
                <ellipse rx={110} ry={150} fill={e.fill} stroke="#FFFFFF" strokeWidth={3} />
                <g clipPath={`url(#eggClip${i})`}>
                  <rect x={-110} y={-60} width={220} height={34} fill={e.band} opacity={0.9} />
                  <rect x={-110} y={26} width={220} height={34} fill={e.band} opacity={0.9} />
                  <circle cx={-52} cy={-98} r={10} fill={e.band} />
                  <circle cx={48} cy={-98} r={10} fill={e.band} />
                  <circle cx={0} cy={96} r={10} fill={e.band} />
                  <circle cx={-58} cy={96} r={7} fill={e.band} />
                  <circle cx={58} cy={96} r={7} fill={e.band} />
                </g>
                {/* rim light */}
                <path
                  d="M72,-110 Q104,0 72,110"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={5}
                  opacity={0.7}
                />
              </g>
            );
          })}
        </svg>
      </Grade>
      <GrainNoise opacity={0.05} seed={44} />
      <Vignette strength={0.1} rgb="90,140,110" />
    </AbsoluteFill>
  );
};
