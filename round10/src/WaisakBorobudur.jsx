import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Trail} from '@remotion/motion-blur';
import {clamp01, cyc, easeMove, fadeIn, fadeOutEnd, revealScale, uiSpring, valueNoise1D} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 12. WAISAK AT BOROBUDUR — 1920x1080. Borobudur stupa silhouette +
// floating lanterns + Mendut → Borobudur procession dots.
// Palette 60% #2B2118 dark stone / 30% #E8B84B gold / 10% #F5EFE6
// cream. Text EXACT: "WAISAK" · "20 MAY 2027" · "2571 BE" ·
// "BOROBUDUR" · "BIRTH • ENLIGHTENMENT • PASSING".
// Frame 0: gradient + stupa silhouette visible.
const W = 1920;
const H = 1080;
const LANTERNS = [
  {x: 240, y: 300, seed: 3.1, delay: 0},
  {x: 420, y: 210, seed: 7.7, delay: 40},
  {x: 1500, y: 240, seed: 5.3, delay: 80},
  {x: 1680, y: 330, seed: 9.9, delay: 120},
  {x: 960, y: 160, seed: 2.7, delay: 160},
];

export const WaisakBorobudur = () => {
  const frame = useCurrentFrame();
  const p = frame / 300;
  const fade = fadeOutEnd(frame);

  const procT = interpolate(frame, [60, 240], [0, 1], {
    easing: easeMove,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const procOp = fadeIn(frame - 60, 12) * fade;

  return (
    <AbsoluteFill style={{backgroundColor: '#2B2118', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #2B2118 0%, #211811 55%, #17100B 100%)',
          }}
        />
        {/* floating lanterns (loop-safe float + flicker) */}
        {LANTERNS.map((l, i) => {
          const floatY = 14 * cyc(p + l.delay / 300, 1);
          const flick = 0.7 + 0.3 * valueNoise1D(frame * 0.1 + l.seed);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: l.x - 26,
                top: l.y + floatY,
                width: 52,
                height: 66,
                borderRadius: '26px 26px 10px 10px',
                background: 'radial-gradient(circle at 50% 30%, #F5D67A 0%, #E8B84B 60%, #B98A1E 100%)',
                boxShadow: '0 0 40px rgba(232,184,75,0.45)',
                opacity: flick * fade,
              }}
            />
          );
        })}
        {/* Borobudur silhouette, visible from f0 */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <g fill="#17100B">
            <rect x="660" y="900" width="600" height="180" />
            <path d="M 700 900 L 740 800 L 1180 800 L 1220 900 Z" />
            <path d="M 780 800 L 810 720 L 1110 720 L 1140 800 Z" />
            <path d="M 850 720 L 880 650 L 1040 650 L 1070 720 Z" />
            <path d="M 900 650 A 60 60 0 0 1 1020 650 Z" />
            <rect x="952" y="560" width="16" height="40" />
            <circle cx="960" cy="552" r="10" />
          </g>
          {/* bell stupas on terraces */}
          <g fill="#17100B">
            {[760, 860, 1060, 1160].map((x) => (
              <path key={`s1-${x}`} d={`M ${x - 32} 800 A 32 32 0 0 1 ${x + 32} 800 Z`} />
            ))}
            {[830, 930, 1030].map((x) => (
              <path key={`s2-${x}`} d={`M ${x - 28} 720 A 28 28 0 0 1 ${x + 28} 720 Z`} />
            ))}
          </g>
          {/* gold rim light */}
          <path
            d="M 700 900 L 740 800 L 780 800 M 1140 800 L 1180 800 L 1220 900"
            fill="none"
            stroke="#E8B84B"
            strokeWidth={4}
            opacity={0.8}
          />
        </svg>
        {/* procession dots Mendut → Borobudur (fast element — Trail on lead) */}
        <div style={{position: 'absolute', left: 0, top: 0, opacity: procOp}}>
          <Trail layers={6} lagInFrames={1} trailOpacity={0.5}>
            <div
              style={{
                position: 'absolute',
                left: 120 + procT * 640 - 12,
                top: 1010 - 12,
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#E8B84B',
                boxShadow: '0 0 20px rgba(232,184,75,0.8)',
              }}
            />
          </Trail>
          {[0.15, 0.3, 0.45, 0.6].map((off) => {
            const t = Math.max(0, procT - off);
            return (
              <div
                key={off}
                style={{
                  position: 'absolute',
                  left: 120 + t * 640 - 9,
                  top: 1010 - 9,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#E8B84B',
                  opacity: 0.7,
                }}
              />
            );
          })}
        </div>
        {/* title block */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 110,
            width: W,
            textAlign: 'center',
            color: '#E8B84B',
            fontSize: 130,
            fontWeight: 900,
            letterSpacing: 12,
            scale: revealScale(frame, 10, 18),
            opacity: fadeIn(frame - 10, 12) * fade,
          }}
        >
          WAISAK
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 280,
            width: W,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: 6,
            scale: clamp01(uiSpring(frame, 22)),
            opacity: fadeIn(frame - 22, 12) * fade,
          }}
        >
          20 MAY 2027
        </div>
        <div
          style={{
            position: 'absolute',
            left: 810,
            top: 390,
            width: 300,
            height: 84,
            borderRadius: 42,
            background: '#E8B84B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2B2118',
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: 2,
            scale: clamp01(uiSpring(frame, 34)),
            opacity: fadeIn(frame - 34, 12) * fade,
          }}
        >
          2571 BE
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 500,
            width: W,
            textAlign: 'center',
            color: '#F5EFE6',
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: 10,
            scale: clamp01(uiSpring(frame, 46)),
            opacity: fadeIn(frame - 46, 12) * fade,
          }}
        >
          BOROBUDUR
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 610,
            width: W,
            textAlign: 'center',
            color: '#E8B84B',
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: 4,
            scale: clamp01(uiSpring(frame, 58)),
            opacity: fadeIn(frame - 58, 12) * fade,
          }}
        >
          BIRTH • ENLIGHTENMENT • PASSING
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={112} />
      <Vignette strength={0.18} rgb="14,8,4" />
    </AbsoluteFill>
  );
};
