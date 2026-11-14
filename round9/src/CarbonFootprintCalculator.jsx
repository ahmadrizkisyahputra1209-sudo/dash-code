import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, countProg, fadeIn, fadeOutEnd, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 7. CARBON FOOTPRINT CALCULATOR — 1920x1080. Household dashboard: four
// category bars shrink as toggles flip on. Palette 60% #2D6A4F leaf green
// / 30% #2B2B2B charcoal / 10% #F5EFE6 warm cream. Text EXACT per plan:
// "HOME" "FOOD" "TRAVEL" "ENERGY" "CO₂e"
// Generic labels ONLY — no invented kg figures. Bars shrink ONCE
// (f90-210 staggered), hold, fade-out f285-300 (never reversed). Frame 0:
// green gradient + row shells visible (not empty).
const W = 1920;
const H = 1080;
const ROWS = [
  {label: 'HOME', shrink: 0.45},
  {label: 'FOOD', shrink: 0.55},
  {label: 'TRAVEL', shrink: 0.4},
  {label: 'ENERGY', shrink: 0.5},
];

export const CarbonFootprintCalculator = () => {
  const frame = useCurrentFrame();

  const headOp = fadeIn(frame, 12) * fadeOutEnd(frame);

  return (
    <AbsoluteFill style={{backgroundColor: '#2D6A4F', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #2D6A4F 0%, #265C44 55%, #1E4A37 100%)',
          }}
        />
        {/* header unit */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 70,
            textAlign: 'center',
            color: '#F5EFE6',
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: 4,
            opacity: headOp,
          }}
        >
          CO₂e
        </div>
        {ROWS.map((r, i) => {
          const y = 260 + i * 180;
          const scale = clamp01(uiSpring(frame, 30 + i * 10));
          const op = fadeIn(frame - (30 + i * 10), 12) * fadeOutEnd(frame);
          const prog = countProg(frame, 90 + i * 12, 170 + i * 12);
          const barScale = 1 - r.shrink * prog;
          const knobX = 54 * prog;
          return (
            <div
              key={r.label}
              style={{
                position: 'absolute',
                left: 240,
                top: y,
                width: 1440,
                height: 150,
                borderRadius: 24,
                background: '#F5EFE6',
                boxShadow: '0 18px 40px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 44px',
                transform: `scale(${scale.toFixed(3)})`,
                opacity: op,
              }}
            >
              <div style={{width: 260, color: '#2B2B2B', fontSize: 40, fontWeight: 800, letterSpacing: 2}}>
                {r.label}
              </div>
              {/* bar track + fill */}
              <div style={{position: 'relative', width: 700, height: 44, borderRadius: 22, background: 'rgba(45,106,79,0.16)', overflow: 'hidden'}}>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: 700,
                    height: 44,
                    borderRadius: 22,
                    background: '#2D6A4F',
                    transform: `scaleX(${barScale.toFixed(3)})`,
                    transformOrigin: 'left center',
                  }}
                />
              </div>
              {/* toggle */}
              <div
                style={{
                  position: 'relative',
                  marginLeft: 'auto',
                  width: 110,
                  height: 56,
                  borderRadius: 28,
                  background: prog > 0.5 ? '#2D6A4F' : 'rgba(43,43,43,0.25)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 6 + knobX,
                    top: 6,
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </Grade>
      <GrainNoise opacity={0.05} seed={97} />
      <Vignette strength={0.16} rgb="10,30,20" />
    </AbsoluteFill>
  );
};
