import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp01, cyc, easeOut, env, fadeIn, fadeOutEnd, revealScale, triWave, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 10. DATA CENTRE WATER — 1920x1080. Cooling tower + rising steam,
// water tank filling, two stat cards. Palette 60% #0F4C5C water blue
// / 30% #2EC4B6 aqua / 10% #FF6B35 hot orange (server heat).
// Text EXACT: "HOW MUCH WATER DOES AI USE?" ·
// "100 MW SITE — ~2 MILLION LITRES / DAY" ·
// "GOOGLE — 10.5 BN GALLONS (2025)". The WATER twin of R9 AI Data
// Centre Energy (electricity) — do NOT reuse the TWh numbers.
// Frame 0: gradient + tower silhouette visible.
const W = 1920;
const H = 1080;

export const DataCentreWater = () => {
  const frame = useCurrentFrame();
  const p = frame / 300;
  const fade = fadeOutEnd(frame);

  const tankProg = interpolate(frame, [60, 180], [0, 1], {
    easing: easeOut,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tankH = 300 * tankProg;

  return (
    <AbsoluteFill style={{backgroundColor: '#0F4C5C', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #0F4C5C 0%, #0B3A47 60%, #072530 100%)',
          }}
        />
        {/* server heat strip (orange), visible from f0 */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: W,
            height: 14,
            background: 'linear-gradient(90deg, #FF6B35 0%, #FF8A5C 50%, #FF6B35 100%)',
            opacity: 0.85,
          }}
        />
        {/* cooling tower silhouette, visible from f0 */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <path d="M 180 980 L 260 560 L 460 560 L 540 980 Z" fill="#072530" />
          <ellipse cx={360} cy={560} rx={110} ry={26} fill="#0B3A47" />
          <ellipse cx={360} cy={560} rx={86} ry={18} fill="#0F4C5C" />
        </svg>
        {/* rising steam puffs (loop-safe triangle wave) */}
        {[0, 1, 2].map((i) => {
          const cycT = triWave(frame + i * 33, 100) / 50; // 0..1..0
          const y = 520 - cycT * 260;
          const op = (1 - cycT) * 0.5 * fade;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 330 + i * 30 - 30,
                top: y,
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#FFFFFF',
                opacity: op,
              }}
            />
          );
        })}
        {/* falling droplets (loop-safe) */}
        {[0, 1, 2, 3].map((i) => {
          const fall = triWave(frame + i * 25, 100) / 50; // 0..1..0
          const y = 120 + fall * 380;
          return (
            <div
              key={`d${i}`}
              style={{
                position: 'absolute',
                left: 700 + i * 90,
                top: y,
                width: 22,
                height: 30,
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                background: '#2EC4B6',
                opacity: (0.35 + 0.45 * (1 - fall)) * fade,
              }}
            />
          );
        })}
        {/* header */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 90,
            width: W,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 84,
            fontWeight: 900,
            letterSpacing: 2,
            scale: revealScale(frame, 10, 18),
            opacity: fadeIn(frame - 10, 12) * fade,
          }}
        >
          HOW MUCH WATER DOES AI USE?
        </div>
        {/* water tank filling */}
        <div
          style={{
            position: 'absolute',
            left: 1150,
            top: 560,
            width: 560,
            height: 340,
            borderRadius: 28,
            border: '6px solid #2EC4B6',
            overflow: 'hidden',
            opacity: fadeIn(frame - 40, 12) * fade,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              width: '100%',
              height: tankH,
              background: 'linear-gradient(180deg, #2EC4B6 0%, #1A8A80 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: tankH,
              width: '100%',
              height: 8,
              background: '#FFFFFF',
              opacity: 0.7,
            }}
          />
        </div>
        {/* stat cards */}
        <div
          style={{
            position: 'absolute',
            left: 640,
            top: 300,
            width: 1080,
            height: 130,
            borderRadius: 24,
            background: '#2EC4B6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#072530',
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: 1,
            boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
            scale: clamp01(uiSpring(frame, 140)),
            opacity: fadeIn(frame - 140, 12) * fade,
          }}
        >
          100 MW SITE — ~2 MILLION LITRES / DAY
        </div>
        <div
          style={{
            position: 'absolute',
            left: 640,
            top: 470,
            width: 1080,
            height: 130,
            borderRadius: 24,
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0F4C5C',
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: 1,
            boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
            scale: clamp01(uiSpring(frame, 160)),
            opacity: fadeIn(frame - 160, 12) * fade,
          }}
        >
          GOOGLE — 10.5 BN GALLONS (2025)
        </div>
        {/* heat warning chip */}
        <div
          style={{
            position: 'absolute',
            left: 640,
            top: 640,
            width: 420,
            height: 84,
            borderRadius: 42,
            background: '#FF6B35',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: 40,
            fontWeight: 800,
            letterSpacing: 2,
            scale: clamp01(uiSpring(frame, 180)),
            opacity: fadeIn(frame - 180, 12) * fade,
          }}
        >
          COOLING = WATER
        </div>
        {/* gentle wave line (loop-safe) */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 1000,
            width: W,
            height: 10,
            background: 'linear-gradient(90deg, rgba(46,196,182,0) 0%, rgba(46,196,182,0.5) 50%, rgba(46,196,182,0) 100%)',
            translate: `${60 * cyc(p, 1)}px 0px`,
            opacity: 0.6,
          }}
        />
      </Grade>
      <GrainNoise opacity={0.05} seed={110} />
      <Vignette strength={0.16} rgb="4,28,36" />
    </AbsoluteFill>
  );
};
