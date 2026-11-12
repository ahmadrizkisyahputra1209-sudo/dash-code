import React, {useMemo} from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {clamp01, cyc, env, mulberry32, triWave} from './smooth.js';
import {Grade, GrainNoise, Vignette} from './postfx.jsx';

// 4. KETUPAT WEAVE — a grid of woven ketupat (rice cake) diamonds assembling
// themselves. Weave strips draw on with @remotion/paths evolvePath, driven
// by a 0..1..0 envelope so the weave draws and undraws once per loop
// (seamless). Diamonds gently rotate and pop with a looping spring
// (triWave -> spring, damping 10, staggered). Frame 0: full grid visible.
const DIAMOND = 'M0,-95 L95,0 L0,95 L-95,0 Z';

function Ketupat({cx, cy, i, j, p, frame, fps}) {
  const rot = 2 * cyc(p, 1, i * 0.9 + j * 1.3);
  const pop = 0.96 + 0.04 * spring({frame: triWave(frame - (i + j) * 8, 150), fps, config: {damping: 10}});
  // Weave strips: two diagonals + one horizontal, drawn via evolvePath.
  const strips = [
    {d: 'M-70,-70 L70,70', ph: i * 0.35 + j * 0.5},
    {d: 'M70,-70 L-70,70', ph: i * 0.35 + j * 0.5 + 0.9},
    {d: 'M-80,0 L80,0', ph: i * 0.35 + j * 0.5 + 1.7},
  ];
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot.toFixed(2)}) scale(${pop.toFixed(3)})`}>
      <path d={DIAMOND} fill="#2E7D32" stroke="#1B5E20" strokeWidth={4} />
      <path d="M0,-58 L58,0 L0,58 L-58,0 Z" fill="#66BB6A" opacity={0.85} />
      <path d="M0,-30 L30,0 L0,30 L-30,0 Z" fill="#A5D6A7" opacity={0.9} />
      {strips.map((s, k) => {
        const prog = clamp01(env(p, s.ph) * 1.15);
        const e = evolvePath(prog, s.d);
        return (
          <path
            key={k}
            d={s.d}
            fill="none"
            stroke="#C8E6C9"
            strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray={e.strokeDasharray}
            strokeDashoffset={e.strokeDashoffset}
          />
        );
      })}
      <circle cx={0} cy={0} r={7} fill="#1B5E20" />
    </g>
  );
}

export const KetupatWeave = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const p = frame / durationInFrames;

  const leaves = useMemo(() => {
    const rand = mulberry32(18);
    return Array.from({length: 6}, (_, i) => ({x: rand() * 1920, len: 180 + rand() * 140, ph: rand() * 6.28}));
  }, []);

  const cells = [];
  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 5; i++) {
      cells.push({i, j, cx: 320 + i * 320, cy: 300 + j * 240});
    }
  }

  return (
    <AbsoluteFill style={{backgroundColor: '#F7EFD8', overflow: 'hidden'}}>
      <Grade cssOnly>
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 45%, #FFFDF4 0%, #F7EFD8 60%, #EFE3C0 100%)'}} />
        {/* palm leaves at the corners */}
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {leaves.map((L, i) => (
            <path
              key={i}
              d={`M${L.x},-20 Q${L.x + 60},${L.len * 0.5} ${L.x - 20},${L.len}`}
              fill="none"
              stroke="#558B2F"
              strokeWidth={10}
              strokeLinecap="round"
              opacity={0.35}
              transform={`rotate(${(2 * cyc(p, 1, L.ph)).toFixed(2)} ${L.x} 0)`}
            />
          ))}
          {cells.map((c) => (
            <Ketupat key={`${c.i}-${c.j}`} {...c} p={p} frame={frame} fps={fps} />
          ))}
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 36, textAlign: 'center', fontFamily: 'sans-serif', fontSize: 44, fontWeight: 700, letterSpacing: 6, color: '#2E7D32', opacity: 0.85}}>
          SELAMAT HARI RAYA
        </div>
      </Grade>
      <GrainNoise opacity={0.05} seed={34} />
      <Vignette strength={0.14} rgb="120,100,50" />
    </AbsoluteFill>
  );
};
