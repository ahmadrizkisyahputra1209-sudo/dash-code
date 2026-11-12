import React from 'react';
import {useCurrentFrame} from 'remotion';

// Shared post stack (#6 cinematic-vfx + #1 five-layer stack):
// content -> color grade -> grain -> vignette. Grain/vignette are the
// outermost layers ("camera/print" artifacts). Pure code, no new npm deps.
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

// Deterministic film grain (#6): feTurbulence re-seeded per frame,
// seed cycles frame%8, mixBlendMode overlay, opacity 0.04-0.10.
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
