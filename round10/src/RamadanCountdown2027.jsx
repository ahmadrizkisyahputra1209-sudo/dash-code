import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {clamp01, cyc, easeOut, fadeIn, fadeOutEnd, mulberry32, revealScale, sparklePoints, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 1. RAMADAN COUNTDOWN 2027 — 1080x1920 VERTICAL. Pre-Ramadan countdown
// card: big crescent + mosque geometry, static date card (no live day
// countdown — the number would change daily). Palette 60% #1B1035
// pre-dawn indigo / 30% #E8B84B gold / 10% #F5A623 amber. Text EXACT:
// "RAMADAN 2027" · "8 FEBRUARY" · "1 RAMADAN 1448H" ·
// "DATES BY MOON SIGHTING". Frame 0: gradient + stars + crescent visible.
const W = 1080;
const H = 1920;

export const RamadanCountdown2027 = () => {
  const frame = useCurrentFrame();
  const p = frame / 300;
  const fade = fadeOutEnd(frame);

  const stars = useMemo(() => {
    const rand = mulberry32(101);
    return Array.from({length: 46}, () => ({
      x: rand() * W,
      y: rand() * H * 0.75,
      r: 1.5 + rand() * 3.2,
      s: rand() * 10,
    }));
  }, []);

  const glow = 0.35 + 0.25 * cyc(p, 1);

  return (
    <AbsoluteFill style={{backgroundColor: '#1B1035', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #1B1035 0%, #241547 52%, #120A26 100%)',
          }}
        />
        {/* twinkling stars, visible from f0 */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {stars.map((s, i) => {
            const n = Math.abs(noise2D('star', s.s + 0.31, frame * 0.9 + 0.17));
            return <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#F5EFE6" opacity={0.25 + 0.6 * n} />;
          })}
          {[
            {x: 180, y: 300, s: 26},
            {x: 900, y: 420, s: 20},
            {x: 830, y: 1150, s: 24},
            {x: 210, y: 1250, s: 18},
          ].map((s, i) => (
            <polygon
              key={`sp${i}`}
              points={sparklePoints(s.x, s.y, s.s)}
              fill="#E8B84B"
              opacity={0.35 + 0.45 * Math.abs(noise2D('sp', i * 7.3 + 0.11, frame * 1.4 + 0.23))}
            />
          ))}
        </svg>
        {/* crescent glow + crescent (SVG mask cutout) */}
        <div
          style={{
            position: 'absolute',
            left: 540 - 330,
            top: 1010 - 330,
            width: 660,
            height: 660,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232,184,75,0.55) 0%, rgba(232,184,75,0) 68%)',
            opacity: glow,
          }}
        />
        <svg
          width={W}
          height={H}
          style={{position: 'absolute', scale: revealScale(frame, 0, 24), opacity: fadeIn(frame, 12) * fade}}
        >
          <defs>
            <mask id="crescent-mask">
              <rect width={W} height={H} fill="black" />
              <circle cx="540" cy="1010" r="250" fill="white" />
              <circle cx="648" cy="930" r="212" fill="black" />
            </mask>
          </defs>
          <circle cx="540" cy="1010" r="250" fill="#E8B84B" mask="url(#crescent-mask)" />
        </svg>
        {/* mosque silhouette, visible from f0 */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <g fill="#120A26">
            <rect x="120" y="1560" width="840" height="360" />
            <path d="M 400 1560 A 140 140 0 0 1 680 1560 Z" />
            <path d="M 180 1560 A 90 90 0 0 1 360 1560 Z" />
            <path d="M 720 1560 A 90 90 0 0 1 900 1560 Z" />
            <rect x="150" y="1330" width="34" height="230" />
            <path d="M 136 1330 A 31 31 0 0 1 198 1330 Z" />
            <rect x="896" y="1330" width="34" height="230" />
            <path d="M 882 1330 A 31 31 0 0 1 944 1330 Z" />
            <rect x="528" y="1240" width="24" height="90" />
            <circle cx="540" cy="1232" r="14" />
          </g>
          <g fill="#E8B84B" opacity={0.9}>
            <circle cx="540" cy="1620" r="10" />
            <circle cx="270" cy="1620" r="10" />
            <circle cx="810" cy="1620" r="10" />
          </g>
        </svg>
        {/* date card texts — 9:16 safe zone 15–75% height */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 330,
            width: W,
            textAlign: 'center',
            color: '#E8B84B',
            fontSize: 104,
            fontWeight: 800,
            letterSpacing: 8,
            scale: revealScale(frame, 15, 18),
            opacity: fadeIn(frame - 15, 12) * fade,
          }}
        >
          RAMADAN 2027
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 470,
            width: W,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 150,
            fontWeight: 900,
            letterSpacing: 2,
            scale: revealScale(frame, 25, 18),
            opacity: fadeIn(frame - 25, 12) * fade,
          }}
        >
          8 FEBRUARY
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 660,
            width: W,
            textAlign: 'center',
            color: '#E8B84B',
            fontSize: 62,
            fontWeight: 700,
            letterSpacing: 6,
            scale: clamp01(uiSpring(frame, 35)),
            opacity: fadeIn(frame - 35, 12) * fade,
          }}
        >
          1 RAMADAN 1448H
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 760,
            width: W,
            textAlign: 'center',
            color: '#F5EFE6',
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: 5,
            scale: clamp01(uiSpring(frame, 45)),
            opacity: fadeIn(frame - 45, 12) * fade,
          }}
        >
          DATES BY MOON SIGHTING
        </div>
        <div
          style={{
            position: 'absolute',
            left: 390,
            top: 850,
            width: 300,
            height: 6,
            borderRadius: 3,
            background: '#F5A623',
            scale: clamp01(uiSpring(frame, 55)),
            opacity: fadeIn(frame - 55, 12) * fade,
          }}
        />
      </Grade>
      <GrainNoise opacity={0.05} seed={101} />
      <Vignette strength={0.18} rgb="8,4,20" />
    </AbsoluteFill>
  );
};
