import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp01, cyc, easeOut, fadeIn, fadeOutEnd, revealScale, smoothstep, uiSpring, valueNoise1D} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 7. NYEPI — 1920x1080. Bali night: moon + Ogoh-ogoh candle flames
// that burn then die into silence, 24-hour timeline bar.
// Palette 60% #0F172A night navy / 30% #94A3B8 moonlight grey /
// 10% #F5A623 candle amber. Text EXACT: "NYEPI" · "8 MARCH 2027" ·
// "DAY OF SILENCE" · "SAKA 1949" · "AIRPORT CLOSED 24 HOURS".
// Date per government decree: 8 Mar 2027 — NEVER print 9 Mar as the
// Nyepi day (the timeline end marker shows "06:00" with no date).
// Frame 0: gradient + moon + temple gate visible.
const W = 1920;
const H = 1080;
const FLAMES = [
  {x: 420, h: 120, seed: 3.1},
  {x: 660, h: 150, seed: 7.7},
  {x: 960, h: 170, seed: 5.3},
  {x: 1260, h: 150, seed: 9.9},
  {x: 1500, h: 120, seed: 2.7},
];

export const NyepiDay = () => {
  const frame = useCurrentFrame();
  const p = frame / 300;
  const fade = fadeOutEnd(frame);

  // flames burn f30-200, die out f200-260 into silence
  const flameLife = 1 - smoothstep((frame - 200) / 60);
  const moonDrift = 22 * cyc(p, 1);
  const barProg = interpolate(frame, [90, 200], [0, 1], {
    easing: easeOut,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#0F172A', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #0F172A 0%, #16233A 55%, #0A101D 100%)',
          }}
        />
        {/* moon, slow drift, visible from f0 */}
        <div
          style={{
            position: 'absolute',
            left: 1450 - 180 + moonDrift,
            top: 300 - 180,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 38% 32%, #CBD5E1 0%, #94A3B8 60%, #64748B 100%)',
            boxShadow: '0 0 140px rgba(148,163,184,0.35)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 1450 - 260 + moonDrift,
            top: 300 - 260,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(148,163,184,0.14) 0%, rgba(148,163,184,0) 68%)',
          }}
        />
        {/* candi bentar temple gate silhouette, visible from f0 */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <g fill="#0B1220">
            <path d="M 760 1080 L 800 760 L 880 760 L 920 1080 Z" />
            <path d="M 1000 1080 L 1040 760 L 1120 760 L 1160 1080 Z" />
            <rect x="760" y="740" width="160" height="24" />
            <rect x="1000" y="740" width="160" height="24" />
          </g>
        </svg>
        {/* candle flames */}
        <svg width={W} height={H} style={{position: 'absolute', opacity: flameLife * fade}}>
          {FLAMES.map((f, i) => {
            const flick = 0.75 + 0.25 * valueNoise1D(frame * 0.12 + f.seed);
            const h = f.h * flick;
            return (
              <g key={i}>
                <ellipse cx={f.x} cy={940} rx={26} ry={10} fill="#F5A623" opacity={0.5} />
                <path
                  d={`M ${f.x} ${940 - h} C ${f.x + 16} ${940 - h * 0.55} ${f.x + 14} ${940 - h * 0.15} ${f.x} ${940} C ${f.x - 14} ${940 - h * 0.15} ${f.x - 16} ${940 - h * 0.55} ${f.x} ${940 - h} Z`}
                  fill="#F5A623"
                />
                <path
                  d={`M ${f.x} ${940 - h * 0.55} C ${f.x + 7} ${940 - h * 0.3} ${f.x + 6} ${940 - h * 0.08} ${f.x} ${940} C ${f.x - 6} ${940 - h * 0.08} ${f.x - 7} ${940 - h * 0.3} ${f.x} ${940 - h * 0.55} Z`}
                  fill="#FFE9A8"
                />
              </g>
            );
          })}
        </svg>
        {/* title block */}
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 100,
            color: '#FFFFFF',
            fontSize: 150,
            fontWeight: 900,
            letterSpacing: 10,
            scale: revealScale(frame, 10, 18),
            opacity: fadeIn(frame - 10, 12) * fade,
          }}
        >
          NYEPI
        </div>
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 280,
            color: '#F5A623',
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: 4,
            scale: clamp01(uiSpring(frame, 22)),
            opacity: fadeIn(frame - 22, 12) * fade,
          }}
        >
          8 MARCH 2027
        </div>
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 380,
            color: '#94A3B8',
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: 5,
            scale: clamp01(uiSpring(frame, 34)),
            opacity: fadeIn(frame - 34, 12) * fade,
          }}
        >
          DAY OF SILENCE
        </div>
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 480,
            width: 300,
            height: 84,
            borderRadius: 42,
            background: '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0F172A',
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: 2,
            scale: clamp01(uiSpring(frame, 46)),
            opacity: fadeIn(frame - 46, 12) * fade,
          }}
        >
          SAKA 1949
        </div>
        {/* 24-hour timeline bar */}
        <svg width={W} height={H} style={{position: 'absolute', opacity: fade}}>
          <line
            x1={80}
            y1={640}
            x2={1840}
            y2={640}
            stroke="#94A3B8"
            strokeWidth={6}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - barProg}
            opacity={0.6}
          />
          <circle cx={80} cy={640} r={14} fill="#F5A623" />
          <circle cx={1840} cy={640} r={14} fill="#F5A623" />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 680,
            color: '#F5EFE6',
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: 2,
            opacity: fadeIn(frame - 110, 12) * fade,
          }}
        >
          8 MARCH 06:00
        </div>
        <div
          style={{
            position: 'absolute',
            right: 80,
            top: 680,
            color: '#F5EFE6',
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: 2,
            opacity: fadeIn(frame - 140, 12) * fade,
          }}
        >
          06:00
        </div>
        {/* airport card */}
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 800,
            width: 760,
            height: 110,
            borderRadius: 24,
            background: '#F5A623',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0F172A',
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: 1,
            scale: clamp01(uiSpring(frame, 170)),
            opacity: fadeIn(frame - 170, 12) * fade,
          }}
        >
          AIRPORT CLOSED 24 HOURS
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={107} />
      <Vignette strength={0.18} rgb="6,10,22" />
    </AbsoluteFill>
  );
};
