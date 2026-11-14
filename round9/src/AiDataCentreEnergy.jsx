import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, countProg, env, fadeIn, fadeOutEnd, mulberry32, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 6. AI DATA CENTRE ENERGY — 1920x1080. Server rack morphs into an energy
// chart: two bars (2024 vs 2030) with a rising connector line. Palette
// 60% #1A202C dark slate / 30% #FF6B35 hot orange / 10% #2EC4B6 teal
// (renewables cap on the 2030 bar). Text EXACT per plan:
// "415 TWh — 2024"
// "~950 TWh — 2030"
// "AI DATA CENTRES +50% IN 2025"
// IEA figures use "~950 TWh" (2026 update; the 2025 report said 945 —
// use ~950 per plan). Bars count up ONCE, hold, fade-out f285-300 (never
// reversed). Frame 0: slate gradient + rack shells visible (not empty).
const W = 1920;
const H = 1080;
const BASE_Y = 880;
const BAR_MAX = 480;

export const AiDataCentreEnergy = () => {
  const frame = useCurrentFrame();

  const badgeOp = fadeIn(frame, 12) * fadeOutEnd(frame);
  const badgeScale = clamp01(uiSpring(frame, 12));
  const prog1 = countProg(frame, 60, 180);
  const prog2 = countProg(frame, 90, 210);
  const lineProg = countProg(frame, 120, 200);
  const num1 = Math.round(415 * prog1);
  const num2 = Math.round(950 * prog2);
  const bar1H = Math.round(BAR_MAX * (415 / 950) * prog1);
  const bar2H = Math.round(BAR_MAX * prog2);
  // Rising connector: from top of bar 1 to top of bar 2 (draw-on).
  const x1 = 1030;
  const y1 = BASE_Y - Math.round(BAR_MAX * (415 / 950));
  const x2 = 1430;
  const y2 = BASE_Y - BAR_MAX;
  const lineLen = Math.hypot(x2 - x1, y2 - y1);
  const lineOff = lineLen * (1 - lineProg);

  return (
    <AbsoluteFill style={{backgroundColor: '#1A202C', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #1A202C 0%, #161D28 55%, #11161F 100%)',
          }}
        />
        {/* badge */}
        <div
          style={{
            position: 'absolute',
            left: 1000,
            top: 90,
            width: 780,
            height: 96,
            borderRadius: 48,
            background: 'rgba(255,107,53,0.14)',
            border: '2px solid #FF6B35',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FF6B35',
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: 1,
            transform: `scale(${badgeScale.toFixed(3)})`,
            opacity: badgeOp,
          }}
        >
          AI DATA CENTRES +50% IN 2025
        </div>
        {/* server rack (left): 3 cols x 4 rows, LEDs blink via env phase */}
        {Array.from({length: 12}, (_, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const rand = mulberry32(96 + i);
          const led = 0.25 + 0.75 * env(frame / 300 + rand());
          const unitOp = fadeIn(frame - (20 + i * 3), 10) * fadeOutEnd(frame);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 140 + col * 190,
                top: 300 + row * 140,
                width: 170,
                height: 120,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.06)',
                border: '2px solid rgba(255,255,255,0.14)',
                opacity: unitOp,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 16,
                  top: 16,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#2EC4B6',
                  opacity: led,
                }}
              />
              <div style={{position: 'absolute', left: 44, top: 20, width: 100, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.18)'}} />
              <div style={{position: 'absolute', left: 44, top: 40, width: 70, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.12)'}} />
              <div style={{position: 'absolute', left: 16, top: 78, width: 138, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.10)'}} />
            </div>
          );
        })}
        {/* rising connector line */}
        <svg width={W} height={H} style={{position: 'absolute'}} opacity={fadeOutEnd(frame)}>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#FF6B35"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={lineLen}
            strokeDashoffset={lineOff}
          />
        </svg>
        {/* bar 1: 2024 */}
        <div
          style={{
            position: 'absolute',
            left: 900,
            top: BASE_Y - bar1H,
            width: 260,
            height: Math.max(0, bar1H),
            background: '#FF6B35',
            borderRadius: '16px 16px 0 0',
            opacity: fadeOutEnd(frame),
          }}
        />
        {/* bar 2: 2030 with teal renewables cap */}
        <div
          style={{
            position: 'absolute',
            left: 1300,
            top: BASE_Y - bar2H,
            width: 260,
            height: Math.max(0, bar2H),
            background: '#FF6B35',
            borderRadius: '16px 16px 0 0',
            opacity: fadeOutEnd(frame),
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 260,
              height: Math.round(Math.max(0, bar2H) * 0.25),
              background: '#2EC4B6',
              borderRadius: '16px 16px 0 0',
            }}
          />
        </div>
        {/* bar numbers */}
        <div
          style={{
            position: 'absolute',
            left: 830,
            top: 300,
            width: 400,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 52,
            fontWeight: 800,
            opacity: fadeIn(frame - 70, 12) * fadeOutEnd(frame),
          }}
        >
          {num1} TWh — 2024
        </div>
        <div
          style={{
            position: 'absolute',
            left: 1230,
            top: 300,
            width: 400,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 52,
            fontWeight: 800,
            opacity: fadeIn(frame - 100, 12) * fadeOutEnd(frame),
          }}
        >
          ~{num2} TWh — 2030
        </div>
        {/* baseline */}
        <div
          style={{
            position: 'absolute',
            left: 820,
            top: BASE_Y,
            width: 820,
            height: 6,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.35)',
            opacity: fadeOutEnd(frame),
          }}
        />
      </Grade>
      <GrainNoise opacity={0.05} seed={96} />
      <Vignette strength={0.16} rgb="8,10,16" />
    </AbsoluteFill>
  );
};
