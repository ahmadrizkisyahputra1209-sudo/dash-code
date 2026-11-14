import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, countProg, env, fadeIn, fadeOutEnd, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 9. VERTICAL FARM YIELD — 1920x1080. Tiered racks with sensor readouts:
// three crop shelves, LED strips pulsing, harvest day counting up.
// Palette 60% #2A1B4A deep purple / 30% #C026D3 LED magenta /
// 10% #4ADE80 leaf green. Text EXACT per plan:
// "LETTUCE" "BASIL" "STRAWBERRY"
// "LED • WATER • NUTRIENTS"
// "HARVEST — DAY 28"
// "EARTH DAY — 22 APR 2027 — FOOD FOR OUR PLANET"
// Harvest day counts up ONCE (0 -> 28, f60-180), hold, fade-out f285-300
// (never reversed). Frame 0: purple gradient + shelf shells visible.
const W = 1920;
const H = 1080;
const CROPS = ['LETTUCE', 'BASIL', 'STRAWBERRY'];

export const VerticalFarmYield = () => {
  const frame = useCurrentFrame();
  const p = frame / 300;

  const chipOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const chipScale = clamp01(uiSpring(frame, 12));
  const harvestProg = countProg(frame, 60, 180);
  const day = Math.round(28 * harvestProg);
  const footOp = fadeIn(frame - 200, 12) * fadeOutEnd(frame);

  return (
    <AbsoluteFill style={{backgroundColor: '#2A1B4A', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #2A1B4A 0%, #241640 55%, #1C1133 100%)',
          }}
        />
        {/* sensor chip */}
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 130,
            height: 88,
            borderRadius: 44,
            background: 'rgba(192,38,211,0.14)',
            border: '2px solid #C026D3',
            display: 'flex',
            alignItems: 'center',
            padding: '0 36px',
            color: '#FFFFFF',
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: 2,
            transform: `scale(${chipScale.toFixed(3)})`,
            opacity: chipOp,
          }}
        >
          LED • WATER • NUTRIENTS
        </div>
        {/* harvest card */}
        <div
          style={{
            position: 'absolute',
            left: 1150,
            top: 130,
            width: 650,
            height: 88,
            borderRadius: 44,
            background: '#4ADE80',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2A1B4A',
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: 1,
            transform: `scale(${chipScale.toFixed(3)})`,
            opacity: chipOp,
          }}
        >
          HARVEST — DAY {day}
        </div>
        {/* shelves */}
        {CROPS.map((crop, r) => {
          const y = 300 + r * 200;
          const shelfOp = fadeIn(frame - (30 + r * 10), 12) * fadeOutEnd(frame);
          const ledGlow = 0.4 + 0.6 * env(p + r * 0.33);
          return (
            <React.Fragment key={crop}>
              {/* LED strip */}
              <div
                style={{
                  position: 'absolute',
                  left: 420,
                  top: y - 6,
                  width: 1380,
                  height: 12,
                  borderRadius: 6,
                  background: '#C026D3',
                  boxShadow: `0 0 ${Math.round(24 * ledGlow)}px rgba(192,38,211,0.8)`,
                  opacity: shelfOp,
                }}
              />
              {/* tray */}
              <div
                style={{
                  position: 'absolute',
                  left: 420,
                  top: y + 10,
                  width: 1380,
                  height: 150,
                  borderRadius: 20,
                  background: '#1E1338',
                  border: '2px solid rgba(192,38,211,0.4)',
                  opacity: shelfOp,
                }}
              />
              {/* plants growing on the tray */}
              {Array.from({length: 10}, (_, i) => {
                const px = 480 + i * 132;
                const s = clamp01(uiSpring(frame, 80 + r * 20 + i * 6));
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: px,
                      top: y + 62,
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: '#4ADE80',
                      border: '3px solid #2A7A44',
                      transform: `scale(${s.toFixed(3)})`,
                      opacity: s * fadeOutEnd(frame),
                    }}
                  />
                );
              })}
              {/* crop label */}
              <div
                style={{
                  position: 'absolute',
                  left: 120,
                  top: y + 52,
                  width: 260,
                  color: '#FFFFFF',
                  fontSize: 40,
                  fontWeight: 800,
                  letterSpacing: 2,
                  opacity: shelfOp,
                }}
              >
                {crop}
              </div>
            </React.Fragment>
          );
        })}
        {/* footer */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 950,
            textAlign: 'center',
            color: '#4ADE80',
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: 2,
            opacity: footOp,
          }}
        >
          EARTH DAY — 22 APR 2027 — FOOD FOR OUR PLANET
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={99} />
      <Vignette strength={0.16} rgb="16,8,32" />
    </AbsoluteFill>
  );
};
