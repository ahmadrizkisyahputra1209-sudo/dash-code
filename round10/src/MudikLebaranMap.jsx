import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Trail} from '@remotion/motion-blur';
import {clamp01, cyc, easeMove, easeOut, env, fadeIn, fadeOutEnd, revealScale, uiSpring} from './smooth.js';
import {GrainNoise, Grade, Vignette} from './postfx.jsx';

// 2. MUDIK LEBARAN MAP — 1920x1080. Schematic Java island drawn from
// code (NO Mapbox tiles): animated route Jakarta → Semarang → Surabaya,
// moving train marker (Trail), date card. Palette 60% #14532D deep
// green / 30% #E8D5B5 sand / 10% #F5A623 amber (route). Text EXACT:
// "MUDIK LEBARAN" · "JAKARTA → SEMARANG → SURABAYA" ·
// "10–11 MAR 2027 — GOVT HOLIDAY" ·
// "≈144 MILLION TRAVELLERS — 2026 SURVEY".
// "10–11 MAR 2027" is the GOVT HOLIDAY window per decree — labelled as
// such on screen, never claimed as 1 Syawal. Frame 0: gradient + island
// + header visible.
const W = 1920;
const H = 1080;
const CITIES = [
  {x: 380, y: 500},
  {x: 950, y: 460},
  {x: 1560, y: 500},
];

const pointOnRoute = (t) => {
  if (t < 0.5) {
    const u = t / 0.5;
    return {
      x: CITIES[0].x + (CITIES[1].x - CITIES[0].x) * u,
      y: CITIES[0].y + (CITIES[1].y - CITIES[0].y) * u,
    };
  }
  const u = (t - 0.5) / 0.5;
  return {
    x: CITIES[1].x + (CITIES[2].x - CITIES[1].x) * u,
    y: CITIES[1].y + (CITIES[2].y - CITIES[1].y) * u,
  };
};

export const MudikLebaranMap = () => {
  const frame = useCurrentFrame();
  const p = frame / 300;
  const fade = fadeOutEnd(frame);

  const routeProg = interpolate(frame, [30, 180], [0, 1], {
    easing: easeOut,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const trainT = interpolate(frame, [60, 240], [0, 1], {
    easing: easeMove,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const train = pointOnRoute(trainT);
  const trainOp = fadeIn(frame - 60, 12) * fade;

  return (
    <AbsoluteFill style={{backgroundColor: '#14532D', overflow: 'hidden'}}>
      <Grade>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #14532D 0%, #0F3D22 60%, #0B2E1A 100%)',
          }}
        />
        {/* schematic Java island, visible from f0 */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <path
            d="M 260 540 C 420 440 720 430 1020 455 C 1320 478 1620 480 1700 530 C 1580 590 1180 610 880 595 C 580 580 340 575 260 540 Z"
            fill="#E8D5B5"
            opacity={0.16}
          />
          <path
            d="M 260 540 C 420 440 720 430 1020 455 C 1320 478 1620 480 1700 530 C 1580 590 1180 610 880 595 C 580 580 340 575 260 540 Z"
            fill="none"
            stroke="#E8D5B5"
            strokeWidth={3}
            opacity={0.5}
          />
          {/* route draw-on */}
          <path
            d="M 380 500 L 950 460 L 1560 500"
            fill="none"
            stroke="#F5A623"
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - routeProg}
            opacity={fade}
          />
          {CITIES.map((c, i) => (
            <g key={i}>
              <circle cx={c.x} cy={c.y} r={16 + 26 * env(p, i * 0.33)} fill="none" stroke="#F5A623" strokeWidth={3} opacity={0.55 * env(p, i * 0.33) * fade} />
              <circle cx={c.x} cy={c.y} r={16} fill="#F5A623" stroke="#FFFFFF" strokeWidth={4} opacity={fade} />
            </g>
          ))}
        </svg>
        {/* moving train marker (fast element — Trail) */}
        <div
          style={{
            position: 'absolute',
            left: train.x - 42,
            top: train.y - 24,
            opacity: trainOp,
          }}
        >
          <Trail layers={6} lagInFrames={1} trailOpacity={0.5}>
            <div
              style={{
                width: 84,
                height: 48,
                borderRadius: 14,
                background: '#F5A623',
                border: '4px solid #FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                padding: '0 8px',
              }}
            >
              <div style={{width: 14, height: 14, borderRadius: 3, background: '#14532D'}} />
              <div style={{width: 14, height: 14, borderRadius: 3, background: '#14532D'}} />
              <div style={{width: 14, height: 14, borderRadius: 3, background: '#14532D'}} />
            </div>
          </Trail>
        </div>
        {/* header */}
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 90,
            color: '#FFFFFF',
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: 4,
            scale: revealScale(frame, 10, 18),
            opacity: fadeIn(frame - 10, 12) * fade,
          }}
        >
          MUDIK LEBARAN
        </div>
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 210,
            color: '#F5A623',
            fontSize: 54,
            fontWeight: 800,
            letterSpacing: 2,
            scale: clamp01(uiSpring(frame, 22)),
            opacity: fadeIn(frame - 22, 12) * fade,
          }}
        >
          JAKARTA → SEMARANG → SURABAYA
        </div>
        {/* bottom cards */}
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 830,
            width: 880,
            height: 130,
            borderRadius: 24,
            background: '#F5A623',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#14532D',
            fontSize: 46,
            fontWeight: 800,
            letterSpacing: 1,
            scale: clamp01(uiSpring(frame, 150)),
            opacity: fadeIn(frame - 150, 12) * fade,
          }}
        >
          10–11 MAR 2027 — GOVT HOLIDAY
        </div>
        <div
          style={{
            position: 'absolute',
            left: 1000,
            top: 830,
            width: 840,
            height: 130,
            borderRadius: 24,
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#14532D',
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: 1,
            scale: clamp01(uiSpring(frame, 165)),
            opacity: fadeIn(frame - 165, 12) * fade,
          }}
        >
          ≈144 MILLION TRAVELLERS — 2026 SURVEY
        </div>
        {/* gentle sea shimmer (loop-safe) */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 640,
            width: W,
            height: 120,
            background: 'linear-gradient(90deg, rgba(232,213,181,0) 0%, rgba(232,213,181,0.10) 50%, rgba(232,213,181,0) 100%)',
            translate: `${40 * cyc(p, 1)}px 0px`,
            opacity: 0.7,
          }}
        />
      </Grade>
      <GrainNoise opacity={0.05} seed={102} />
      <Vignette strength={0.16} rgb="6,30,16" />
    </AbsoluteFill>
  );
};
