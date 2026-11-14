import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {countProg, cyc, fadeIn, fadeOutEnd, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 8. WATER FOOTPRINT OF FOOD — 1920x1080. Plate diagram: three foods
// ranked by water use, bars grow in rank order (labels only — no invented
// litre figures). Palette 60% #0F4C5C water blue / 30% #2EC4B6 aqua /
// 10% #E8D5B5 sand. Text EXACT per plan:
// "WORLD WATER DAY — 22 MAR 2027"
// "2.2 BILLION live without safely managed drinking water (UN)"
// "RICE" "BEEF" "VEGETABLES"
// Do NOT write any World Water Day 2027 theme name (none published).
// Different from water-cycle / groundwater (this is food footprint, not
// the cycle). Hero number counts up ONCE (f60-150), hold, fade-out
// f285-300 (never reversed). Frame 0: blue gradient + wave visible.
const W = 1920;
const H = 1080;
const FOODS = [
  {label: 'BEEF', rel: 1.0, color: '#E8D5B5'},
  {label: 'RICE', rel: 0.55, color: '#2EC4B6'},
  {label: 'VEGETABLES', rel: 0.25, color: '#7ED3C6'},
];

export const WaterFootprintFood = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;

  const headOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const statProg = countProg(frame, 60, 150);
  const statVal = (2.2 * statProg).toFixed(1);
  const waveX = 30 * cyc(p, 1, 0);

  return (
    <AbsoluteFill style={{backgroundColor: '#0F4C5C', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #0F4C5C 0%, #0D4250 55%, #0A3642 100%)',
          }}
        />
        {/* header */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 64,
            textAlign: 'center',
            color: '#E8D5B5',
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: 4,
            opacity: headOp,
          }}
        >
          WORLD WATER DAY — 22 MAR 2027
        </div>
        {/* hero stat */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 170,
            textAlign: 'center',
            color: '#2EC4B6',
            fontSize: 130,
            fontWeight: 800,
            opacity: fadeIn(frame - 40, 12) * fadeOutEnd(frame),
          }}
        >
          {statVal} BILLION
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 330,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 36,
            fontWeight: 600,
            opacity: fadeIn(frame - 55, 12) * fadeOutEnd(frame),
          }}
        >
          live without safely managed drinking water (UN)
        </div>
        {/* food bars, ranked by water use */}
        {FOODS.map((f, i) => {
          const y = 520 + i * 150;
          const scale = uiSpring(frame, 110 + i * 10);
          const op = fadeIn(frame - (110 + i * 10), 12) * fadeOutEnd(frame);
          const grow = f.rel * countProg(frame, 120 + i * 14, 200 + i * 14);
          return (
            <div key={f.label} style={{position: 'absolute', left: 0, top: y, width: W, opacity: op}}>
              <div
                style={{
                  position: 'absolute',
                  left: 200,
                  top: 0,
                  width: 300,
                  color: '#FFFFFF',
                  fontSize: 40,
                  fontWeight: 800,
                  letterSpacing: 2,
                  transform: `scale(${Math.max(0, Math.min(1, scale)).toFixed(3)})`,
                }}
              >
                {f.label}
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: 560,
                  top: 6,
                  width: 1100,
                  height: 52,
                  borderRadius: 26,
                  background: 'rgba(255,255,255,0.10)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: 1100,
                    height: 52,
                    borderRadius: 26,
                    background: f.color,
                    transform: `scaleX(${grow.toFixed(3)})`,
                    transformOrigin: 'left center',
                  }}
                />
              </div>
            </div>
          );
        })}
        {/* gentle wave at the bottom, drifting on a circle (seamless) */}
        <svg width={W} height={H} style={{position: 'absolute'}} opacity={0.3 * fadeOutEnd(frame)}>
          <g transform={`translate(${waveX.toFixed(1)} 0)`}>
            <path
              d="M-60,1010 Q240,960 540,1010 T1140,1010 T1740,1010 T2340,1010 L2340,1080 L-60,1080 Z"
              fill="#2EC4B6"
              opacity={0.35}
            />
          </g>
        </svg>
      </Grade>
      <GrainNoise opacity={0.05} seed={98} />
      <Vignette strength={0.16} rgb="4,24,32" />
    </AbsoluteFill>
  );
};
