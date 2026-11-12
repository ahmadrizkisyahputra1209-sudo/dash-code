import React, {useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';
import {mulberry32} from './smooth.js';

// Shared post stack: content -> color grade -> grain -> vignette.
// Grain/vignette are the outermost layers ("camera/print" artifacts).
// Pure code, no new npm deps beyond @remotion/noise (already in package.json).
export const Grade = ({children, cssOnly = false}) => {
  if (cssOnly) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          filter: 'contrast(1.12) saturate(1.15) brightness(0.97) sepia(0.06)',
        }}
      >
        {children}
      </div>
    );
  }
  return (
    <>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <defs>
          <filter id="grade-tealOrange">
            <feColorMatrix
              type="matrix"
              values="1.08 0 0.05 0 0.02  0 1.0 0 0 0  0.02 0 0.95 0 -0.02  0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          filter:
            'url(#grade-tealOrange) contrast(1.12) saturate(1.15) brightness(0.97)',
        }}
      >
        {children}
      </div>
    </>
  );
};

// Deterministic film grain (feTurbulence re-seeded per frame,
// seed cycles frame%8, mixBlendMode overlay, opacity 0.04-0.10).
export const Grain = ({opacity = 0.06}) => {
  const frame = useCurrentFrame();
  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        mixBlendMode: 'overlay',
        opacity,
        pointerEvents: 'none',
      }}
    >
      <filter id="grain-v3">
        <feTurbulence
          type="fractalNoise"
          baseFrequency={0.9}
          numOctaves={2}
          seed={frame % 8}
          stitchTiles="stitch"
        />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.3 0.3 0.3 0 0"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-v3)" />
    </svg>
  );
};

// Grain from @remotion/noise: a field of small dots whose per-frame opacity
// comes from noise2D (sampled at non-integer coordinates — noise2D is exactly
// 0 on integer lattice points). Positions are fixed per clip (mulberry32
// seed), only the opacity flickers, so the grain shimmers without swimming.
export const GrainNoise = ({opacity = 0.07, dots = 420, seed = 11}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const pts = useMemo(() => {
    const rand = mulberry32(seed);
    return Array.from({length: dots}, () => ({
      x: rand(),
      y: rand(),
      r: 1 + rand() * 2.2,
      white: rand() > 0.5,
    }));
  }, [seed]);
  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    >
      {pts.map((d, i) => {
        const n = Math.abs(noise2D('grain', i * 13.7 + 0.31, frame * 7.3 + 0.17));
        return (
          <circle
            key={i}
            cx={d.x * width}
            cy={d.y * height}
            r={d.r}
            fill={d.white ? '#FFFFFF' : '#000000'}
            opacity={opacity * (0.35 + 0.65 * n)}
          />
        );
      })}
    </svg>
  );
};

export const Vignette = ({strength = 0.22, rgb = '8,50,70'}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 62%, rgba(${rgb},${strength}) 100%)`,
      pointerEvents: 'none',
    }}
  />
);
